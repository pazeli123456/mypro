// src/services/apiService.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 seconds timeout
});

class TokenManager {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        if (token) {
            localStorage.setItem('token', token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }

    static removeToken() {
        localStorage.removeItem('token');
        delete apiClient.defaults.headers.common['Authorization'];
    }

    static getAuthHeader() {
        const token = this.getToken();
        return token ? `Bearer ${token}` : '';
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static getCurrentUser() {
        try {
            return {
                id: localStorage.getItem('userId'),
                userName: localStorage.getItem('userName'),
                firstName: localStorage.getItem('firstName'),
                lastName: localStorage.getItem('lastName'),
                permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),
                isAdmin: localStorage.getItem('isAdmin') === 'true',
                sessionTimeOut: parseInt(localStorage.getItem('sessionTimeOut') || '60', 10),
            };
        } catch (error) {
            console.error('Error getting current user:', error);
            this.clearUserData();
            return null;
        }
    }

    static setUserData(userData) {
        try {
            localStorage.setItem('userId', userData.id || userData.userId);
            localStorage.setItem('userName', userData.userName);
            localStorage.setItem('firstName', userData.firstName || '');
            localStorage.setItem('lastName', userData.lastName || '');
            localStorage.setItem('permissions', JSON.stringify(userData.permissions || []));
            localStorage.setItem('isAdmin', String(userData.permissions?.includes('Manage Users')));
            localStorage.setItem('sessionTimeOut', String(userData.sessionTimeOut || 60));
        } catch (error) {
            console.error('Error setting user data:', error);
            this.clearUserData();
            throw new Error('Error saving user data');
        }
    }

    static clearUserData() {
        const keys = [
            'token',
            'userId',
            'userName',
            'firstName',
            'lastName',
            'permissions',
            'isAdmin',
            'sessionTimeOut',
        ];
        keys.forEach((key) => localStorage.removeItem(key));
        
        // נקה גם את מידע ה-redux-persist
        localStorage.removeItem('persist:root');
        
        delete apiClient.defaults.headers.common['Authorization'];
    }
}

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = TokenManager.getAuthHeader();
        if (token) {
            config.headers['Authorization'] = token;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            const { config, response: { status } } = error;
            if (status === 401) {
                TokenManager.clearUserData();
                window.location.href = '/login';
                return Promise.reject(error);
            }
            if (status === 429) {
                config.__retryCount = config.__retryCount || 0;
                if (config.__retryCount < 3) {
                    config.__retryCount += 1;
                    const backoff = Math.pow(2, config.__retryCount) * 1000;
                    console.warn(`Rate limit exceeded. Retrying in ${backoff/1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, backoff));
                    return apiClient(config);
                }
            }
        }
        return Promise.reject(error);
    }
);

// נוסיף מנגנון throttling למניעת בקשות רבות מדי במקביל
class RequestThrottler {
    constructor() {
        this.queue = {};
        this.inProgress = {};
    }

    async throttle(key, requestFn) {
        // אם כבר יש בקשה בתור לאותו מפתח, נחזיר את ההבטחה שלה
        if (this.queue[key]) {
            return this.queue[key];
        }

        // אם יש בקשה שכבר מתבצעת, נחכה לה
        if (this.inProgress[key]) {
            return new Promise((resolve) => {
                const checkComplete = setInterval(() => {
                    if (!this.inProgress[key]) {
                        clearInterval(checkComplete);
                        resolve(this.throttle(key, requestFn));
                    }
                }, 500);
            });
        }

        // סמן שהבקשה בביצוע
        this.inProgress[key] = true;

        // בצע את הבקשה
        try {
            const promise = requestFn();
            this.queue[key] = promise;

            const result = await promise;
            
            // כשהבקשה מסתיימת, נקה את התור והסימון
            delete this.queue[key];
            delete this.inProgress[key];
            
            return result;
        } catch (error) {
            // במקרה של שגיאה, נקה גם
            delete this.queue[key];
            delete this.inProgress[key];
            throw error;
        }
    }
}

const throttler = new RequestThrottler();

export const authService = {
    async login(userName, password) {
        try {
            const response = await apiClient.post('/auth/login', {
                userName,
                password,
            });

            if (!response.data || !response.data.token) {
                throw new Error('Invalid server response');
            }

            const userData = {
                id: response.data.userId,
                userName: response.data.userName,
                permissions: response.data.permissions || [],
                token: response.data.token,
                sessionTimeOut: response.data.sessionTimeOut || 60,
            };

            TokenManager.setToken(userData.token);
            TokenManager.setUserData(userData);

            return userData;
        } catch (error) {
            TokenManager.clearUserData();
            throw new Error(error.response?.data?.error || 'Invalid username or password');
        }
    },

    async logout() {
        try {
            // נסה לשלוח בקשה לשרת כדי להתנתק, אבל אל תיכשל אם אין כזו נקודת קצה
            try {
                await apiClient.post('/auth/logout');
            } catch (error) {
                // אם לא קיימת נקודת קצה logout, פשוט התעלם - לא נכשל
                console.log('No server-side logout endpoint, continuing with client-side logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // בכל מקרה, נקה את המידע המקומי
            TokenManager.clearUserData();
        }
    },

    async checkAuthStatus() {
        try {
            const token = TokenManager.getToken();
            if (!token) {
                throw new Error('Token not found');
            }

            const response = await apiClient.get('/auth/verify-token');

            if (response.data) {
                TokenManager.setUserData(response.data);
            }

            return response.data;
        } catch (error) {
            TokenManager.clearUserData();
            throw error;
        }
    },

    async createAccount(userData) {
        const response = await apiClient.post('/auth/create-account', userData);
        return response.data;
    },
};

const delayedRequest = async (requestFn, delay = 1000) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return requestFn();
};

export const userService = {
    async getAll() {
        return throttler.throttle('users', async () => {
            const response = await delayedRequest(() => apiClient.get('/users'));
            return response.data;
        });
    },

    async getById(id) {
        if (!id) throw new Error('נדרש מזהה משתמש');
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },

    async create(userData) {
        if (!userData.userName || !userData.password) {
            throw new Error('שם משתמש וסיסמה הם שדות חובה');
        }
        const response = await apiClient.post('/users', userData);
        return response.data;
    },

    async update(id, userData) {
        if (!id) throw new Error('נדרש מזהה משתמש');
        const response = await apiClient.put(`/users/${id}`, userData);
        return response.data;
    },

    async delete(id) {
        if (!id) throw new Error('נדרש מזהה משתמש');
        await apiClient.delete(`/users/${id}`);
        return true;
    },

    async updatePermissions(id, permissions) {
        if (!id) throw new Error('נדרש מזהה משתמש');
        const response = await apiClient.put(`/users/${id}/permissions`, { permissions });
        return response.data;
    }
};

export const movieService = {
    async getAll() {
        return throttler.throttle('movies', async () => {
            const response = await delayedRequest(() => apiClient.get('/movies'));
            return response.data;
        });
    },

    async getMovieById(id) {
        if (!id) throw new Error('נדרש מזהה סרט');
        try {
            const response = await apiClient.get(`/movies/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch movie:', error);
            throw new Error(error.response?.data?.message || 'שגיאה בטעינת הסרט');
        }
    },

    async create(movieData) {
        if (!movieData.name) throw new Error('שם הסרט הוא שדה חובה');
        const response = await apiClient.post('/movies', movieData);
        return response.data;
    },

    async update(id, movieData) {
        if (!id) throw new Error('נדרש מזהה סרט');
        if (!movieData.name) throw new Error('שם הסרט הוא שדה חובה');
        const response = await apiClient.put(`/movies/${id}`, movieData);
        return response.data;
    },

    async delete(id) {
        if (!id) throw new Error('נדרש מזהה סרט');
        await apiClient.delete(`/movies/${id}`);
        return true;
    },

    async search(query) {
        if (!query) return [];
        const response = await apiClient.get(`/movies/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    async fetchAndSaveMovies() {
        const response = await apiClient.post('/movies/fetch-and-save');
        return response.data;
    }
};

export const memberService = {
    async getAll() {
        return throttler.throttle('members', async () => {
            const response = await delayedRequest(() => apiClient.get('/members'));
            return response.data;
        });
    },

    async getById(id) {
        if (!id) throw new Error('נדרש מזהה מנוי');
        const response = await apiClient.get(`/members/${id}`);
        return response.data;
    },

    async create(memberData) {
        if (!memberData.name || !memberData.email) {
            throw new Error('שם ואימייל הם שדות חובה');
        }
        const response = await apiClient.post('/members', memberData);
        return response.data;
    },

    async update(id, memberData) {
        if (!id) throw new Error('נדרש מזהה מנוי');
        const response = await apiClient.put(`/members/${id}`, memberData);
        return response.data;
    },

    async delete(id) {
        if (!id) throw new Error('נדרש מזהה מנוי');
        await apiClient.delete(`/members/${id}`);
        return true;
    }
};

export const subscriptionService = {
    async getAll() {
        return throttler.throttle('subscriptions', async () => {
            const response = await delayedRequest(() => apiClient.get('/subscriptions'));
            return response.data;
        });
    },

    async getById(id) {
        if (!id) throw new Error('נדרש מזהה מנוי');
        const response = await apiClient.get(`/subscriptions/${id}`);
        return response.data;
    },

    async getMemberSubscriptions(memberId) {
        if (!memberId) throw new Error('נדרש מזהה מנוי');
        const response = await apiClient.get(`/subscriptions/member/${memberId}`);
        return response.data;
    },

    async create(subscriptionData) {
        if (!subscriptionData.memberId || !subscriptionData.movieId) {
            throw new Error('מזהה מנוי ומזהה סרט הם שדות חובה');
        }
        const response = await apiClient.post('/subscriptions', subscriptionData);
        return response.data;
    },

    async update(id, subscriptionData) {
        if (!id) throw new Error('נדרש מזהה מנוי');
        const response = await apiClient.put(`/subscriptions/${id}`, subscriptionData);
        return response.data;
    },

    async delete(id) {
        if (!id) throw new Error('נדרש מזהה מנוי');
        await apiClient.delete(`/subscriptions/${id}`);
        return true;
    },

    async addMovieToMember(memberId, movieData) {
        if (!memberId || !movieData || !movieData.movieId || !movieData.date) {
            throw new Error('חסרים נתונים נדרשים');
        }
        const response = await apiClient.post(`/subscriptions/member/${memberId}/movies`, movieData);
        return response.data;
    },
    
    async getWatchedMovies(memberId) {
        if (!memberId) throw new Error('נדרש מזהה מנוי');
        const response = await apiClient.get(`/subscriptions/member/${memberId}/movies`);
        return response.data;
    }
};

export { apiClient, TokenManager };