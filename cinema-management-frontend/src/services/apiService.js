// src/services/apiService.js
import axios from 'axios';

// יצירת מופע של axios עם הגדרות בסיסיות
const apiClient = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// פונקציות עזר
const isNetworkError = (error) => {
    return !error.response && error.request;
};

const handleError = (error) => {
    if (isNetworkError(error)) {
        throw new Error('שגיאת רשת - אנא בדוק את החיבור לאינטרנט');
    }
    throw error.response?.data?.message || 'שגיאה לא ידועה';
};

// מחלקת ניהול טוקנים
class TokenManager {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        localStorage.setItem('token', token);
    }

    static removeToken() {
        localStorage.removeItem('token');
    }

    static getUserData() {
        return {
            id: localStorage.getItem('userId'),
            username: localStorage.getItem('userName'),
            permissions: JSON.parse(localStorage.getItem('permissions') || '[]')
        };
    }

    static clearUserData() {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('permissions');
    }
}

// מחלקת ניהול בקשות
class RequestThrottler {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.retryDelay = 1000;
    }

    async add(request) {
        return new Promise((resolve, reject) => {
            this.queue.push({ request, resolve, reject });
            if (!this.processing) {
                this.processQueue();
            }
        });
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }

        this.processing = true;
        const { request, resolve, reject } = this.queue.shift();

        try {
            const response = await request();
            resolve(response);
        } catch (error) {
            if (error.response?.status === 429) {
                // אם יש שגיאת Rate Limit, הכנס את הבקשה בחזרה לתור
                this.queue.unshift({ request, resolve, reject });
                setTimeout(() => this.processQueue(), this.retryDelay);
            } else {
                reject(error);
            }
        }
    }
}

const requestThrottler = new RequestThrottler();

// אינטרספטורים
apiClient.interceptors.request.use(
    (config) => {
        const token = TokenManager.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            TokenManager.clearUserData();
            window.location.href = '/login';
        }
        if (error.response?.status === 429) {
            return { data: {} }; // החזר תשובה ריקה במקום לדחות
        }
        return Promise.reject(error);
    }
);

// שירות אימות
export const authService = {
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        TokenManager.clearUserData();
        return response.data;
    },

    checkAuthStatus: async () => {
        const response = await apiClient.get('/auth/status');
        return response.data;
    },

    createAccount: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    }
};

// שירות משתמשים
export const userService = {
    getAllUsers: async () => {
        const response = await apiClient.get('/users');
        return response.data;
    },

    getUserById: async (id) => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await apiClient.post('/users', userData);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await apiClient.put(`/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await apiClient.delete(`/users/${id}`);
        return response.data;
    }
};

// שירות סרטים
export const movieService = {
    getAllMovies: async () => {
        const response = await apiClient.get('/movies');
        return response.data;
    },

    getMovieById: async (id) => {
        const response = await apiClient.get(`/movies/${id}`);
        return response.data;
    },

    createMovie: async (movieData) => {
        const response = await apiClient.post('/movies', movieData);
        return response.data;
    },

    updateMovie: async (id, movieData) => {
        const response = await apiClient.put(`/movies/${id}`, movieData);
        return response.data;
    },

    deleteMovie: async (id) => {
        const response = await apiClient.delete(`/movies/${id}`);
        return response.data;
    }
};

// שירות חברים
export const memberService = {
    getAllMembers: async () => {
        const response = await apiClient.get('/members');
        return response.data;
    },

    getMemberById: async (id) => {
        const response = await apiClient.get(`/members/${id}`);
        return response.data;
    },

    createMember: async (memberData) => {
        const response = await apiClient.post('/members', memberData);
        return response.data;
    },

    updateMember: async (id, memberData) => {
        const response = await apiClient.put(`/members/${id}`, memberData);
        return response.data;
    },

    deleteMember: async (id) => {
        const response = await apiClient.delete(`/members/${id}`);
        return response.data;
    }
};

// שירות מנויים
export const subscriptionService = {
    getAllSubscriptions: async () => {
        const response = await apiClient.get('/subscriptions');
        return response.data;
    },

    getSubscriptionById: async (id) => {
        const response = await apiClient.get(`/subscriptions/${id}`);
        return response.data;
    },

    createSubscription: async (subscriptionData) => {
        const response = await apiClient.post('/subscriptions', subscriptionData);
        return response.data;
    },

    updateSubscription: async (id, subscriptionData) => {
        const response = await apiClient.put(`/subscriptions/${id}`, subscriptionData);
        return response.data;
    },

    deleteSubscription: async (id) => {
        const response = await apiClient.delete(`/subscriptions/${id}`);
        return response.data;
    },

    addMovieToMember: async (memberId, movieData) => {
        const response = await apiClient.post(`/subscriptions/member/${memberId}/movie`, movieData);
        return response.data;
    },

    getMemberSubscriptions: async (memberId) => {
        const response = await apiClient.get(`/subscriptions/member/${memberId}`);
        return response.data;
    },

    getMovieSubscriptions: async (movieId) => {
        const response = await apiClient.get(`/subscriptions/movie/${movieId}`);
        return response.data;
    }
};