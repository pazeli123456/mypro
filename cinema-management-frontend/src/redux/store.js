// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import movieReducer from './reducers/movieReducer';
import memberReducer from './reducers/memberReducer';
import subscriptionReducer from './reducers/subscriptionReducer';
import userReducer from './reducers/userReducer';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        movies: movieReducer,
        members: memberReducer,
        subscriptions: subscriptionReducer,
        users: userReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});