// src/redux/store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './reducers/authReducer';
import movieReducer from './reducers/movieReducer';
import subscriptionReducer from './reducers/subscriptionReducer';
import memberReducer from './reducers/memberReducer';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // רק מידע אימות יישמר
};

// יצירת reducer בסיסי שמשלב את כל ה-reducers
const appReducer = combineReducers({
  auth: authReducer,
  movies: movieReducer,
  subscriptions: subscriptionReducer,
  members: memberReducer
});

// יצירת root reducer שמאפשר איפוס המצב בהתנתקות
const rootReducer = (state, action) => {
  // אם האקשן הוא 'auth/logout/fulfilled', נאפס את כל המצב
  if (action.type === 'auth/logout/fulfilled') {
    // נקה את כל המידע בלוקל סטורג' מלבד פרסיסט קונפיג
    storage.removeItem('persist:root');
    
    // אפס את כל המצב למעט persist config
    return appReducer(undefined, action);
  }
  
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST']
            }
        })
});

const persistor = persistStore(store);

export { store, persistor };