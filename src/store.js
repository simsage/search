import { configureStore } from '@reduxjs/toolkit';
import {logger} from "redux-logger/src";

import searchSlice from "./reducers/searchSlice";
import authSlice from "./reducers/authSlice";

/**
 * Logs all actions and states after they are dispatched.
 */
export const store = configureStore({
    reducer: {
        searchReducer: searchSlice,
        authReducer: authSlice,
    },
    middleware:(getDefaultMiddleware => getDefaultMiddleware({serializableCheck: false}).concat(logger))
});
