// src/redux/actions/mainActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
    movieService, 
    userService, 
    subscriptionService,
    memberService 
} from '../../services/apiService';

// נסמן איזה נתונים כבר נטענו כדי למנוע טעינה מחדש
let dataLoaded = {
    movies: false,
    members: false,
    subscriptions: false,
    users: false
};

// איפוס דגלי טעינה בהתנתקות
export const resetDataLoadingFlags = () => {
    dataLoaded = {
        movies: false,
        members: false,
        subscriptions: false,
        users: false
    };
};

// Movies Actions
export const fetchAllMovies = createAsyncThunk(
    'movies/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { movies } = getState();
            
            // אם יש סרטים או שכבר טענו פעם אחת, לא נטען שוב
            if ((movies.data && movies.data.length > 0) || dataLoaded.movies) {
                return movies.data || [];
            }
            
            // סמן שטענו סרטים וטען אותם
            dataLoaded.movies = true;
            return await movieService.getAll();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createMovie = createAsyncThunk(
    'movies/create',
    async (movieData, { rejectWithValue }) => {
        try {
            return await movieService.create(movieData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const editMovie = createAsyncThunk(
    'movies/edit',
    async ({ id, movieData }, { rejectWithValue }) => {
        try {
            return await movieService.update(id, movieData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeMovie = createAsyncThunk(
    'movies/remove',
    async (id, { rejectWithValue }) => {
        try {
            await movieService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Members Actions
export const fetchAllMembers = createAsyncThunk(
    'members/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { members } = getState();
            
            // אם יש מנויים או שכבר טענו פעם אחת, לא נטען שוב
            if ((members.data && members.data.length > 0) || dataLoaded.members) {
                return members.data || [];
            }
            
            // סמן שטענו מנויים וטען אותם
            dataLoaded.members = true;
            return await memberService.getAll();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createMember = createAsyncThunk(
    'members/create',
    async (memberData, { rejectWithValue }) => {
        try {
            return await memberService.create(memberData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const editMember = createAsyncThunk(
    'members/edit',
    async ({ id, memberData }, { rejectWithValue }) => {
        try {
            return await memberService.update(id, memberData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeMember = createAsyncThunk(
    'members/remove',
    async (id, { rejectWithValue }) => {
        try {
            await memberService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Users Actions
export const fetchAllUsers = createAsyncThunk(
    'users/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { users, auth } = getState();
            
            // רק אם משתמש הוא אדמין ועוד לא טענו משתמשים
            if (!auth.permissions?.includes('Manage Users')) {
                return [];
            }
            
            // אם יש משתמשים או שכבר טענו פעם אחת, לא נטען שוב
            if ((users.data && users.data.length > 0) || dataLoaded.users) {
                return users.data || [];
            }
            
            // סמן שטענו משתמשים וטען אותם
            dataLoaded.users = true;
            return await userService.getAll();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createUser = createAsyncThunk(
    'users/create',
    async (userData, { rejectWithValue }) => {
        try {
            return await userService.create(userData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const editUser = createAsyncThunk(
    'users/edit',
    async ({ id, userData }, { rejectWithValue }) => {
        try {
            return await userService.update(id, userData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeUser = createAsyncThunk(
    'users/remove',
    async (id, { rejectWithValue }) => {
        try {
            await userService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Subscriptions Actions
export const fetchAllSubscriptions = createAsyncThunk(
    'subscriptions/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { subscriptions } = getState();
            
            // אם יש מנויים או שכבר טענו פעם אחת, לא נטען שוב
            if ((subscriptions.data && subscriptions.data.length > 0) || dataLoaded.subscriptions) {
                return subscriptions.data || [];
            }
            
            // סמן שטענו מנויים וטען אותם
            dataLoaded.subscriptions = true;
            return await subscriptionService.getAll();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createSubscription = createAsyncThunk(
    'subscriptions/create',
    async (subscriptionData, { rejectWithValue }) => {
        try {
            return await subscriptionService.create(subscriptionData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const editSubscription = createAsyncThunk(
    'subscriptions/edit',
    async ({ id, subscriptionData }, { rejectWithValue }) => {
        try {
            return await subscriptionService.update(id, subscriptionData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeSubscription = createAsyncThunk(
    'subscriptions/remove',
    async (id, { rejectWithValue }) => {
        try {
            await subscriptionService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addMovieToMember = createAsyncThunk(
    'subscriptions/addMovie',
    async ({ memberId, movieData }, { rejectWithValue }) => {
        try {
            return await subscriptionService.addMovieToMember(memberId, movieData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initialize App
export const initializeApp = createAsyncThunk(
    'app/initialize',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            await Promise.all([
                dispatch(fetchAllMovies()),
                dispatch(fetchAllMembers()),
                dispatch(fetchAllSubscriptions()),
                dispatch(fetchAllUsers())
            ]);
            return true;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// אקשן שמתבצע אחרי ההתנתקות
export const clearAppData = createAsyncThunk(
    'app/clear',
    async (_, { dispatch }) => {
        // איפוס דגלי הטעינה
        resetDataLoadingFlags();
        return true;
    }
);