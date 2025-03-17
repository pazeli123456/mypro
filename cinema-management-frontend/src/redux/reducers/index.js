// src/redux/reducers/index.js
import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './userReducer';
import movieReducer from './movieReducer';
import memberReducer from './memberReducer';
import subscriptionReducer from './subscriptionReducer';
import { clearAuth } from '../../utils/authUtils';

const appReducer = combineReducers({
    user: userReducer,
    movies: movieReducer,
    members: memberReducer,
    subscriptions: subscriptionReducer
});

// Root reducer עם טיפול בהתנתקות
const rootReducer = (state, action) => {
    // ניקוי המצב בעת התנתקות
    if (action.type === 'auth/logout/fulfilled') {
        clearAuth();
        state = undefined;
    }
    
    return appReducer(state, action);
};

export default rootReducer;

// Selectors מרכזיים
export const selectIsLoading = state => {
    return (
        state.user.loading ||
        state.movies.loading ||
        state.members.loading ||
        state.subscriptions.loading
    );
};

export const selectGlobalError = state => {
    return (
        state.user.error ||
        state.movies.error ||
        state.members.error ||
        state.subscriptions.error
    );
};