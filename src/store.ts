import { configureStore } from '@reduxjs/toolkit';
import { logger } from "redux-logger/src";
import { Middleware } from 'redux';

import searchSlice from "./reducers/searchSlice";
import authSlice from "./reducers/authSlice";
import './types';

/**
 * Logs all actions and states after they are dispatched.
 */
export const store = configureStore({
    reducer: {
        searchReducer: searchSlice,
        authReducer: authSlice,
    },
    middleware:
        (getDefaultMiddleware) => 
            window.ENV.debug 
                ? getDefaultMiddleware({serializableCheck: false}).concat(logger as Middleware) 
                : getDefaultMiddleware({serializableCheck: false})
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
