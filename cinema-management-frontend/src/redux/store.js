import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import movieReducer from './slices/movieSlice';
import memberReducer from './slices/memberSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: movieReducer,
    members: memberReducer,
    subscriptions: subscriptionReducer,
    users: userReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // התעלמות משגיאות סריאליזציה בנתיבים מסוימים
        ignoredActions: ['payload'],
        ignoredPaths: ['some.path'],
      },
    }),
});

export default store; 