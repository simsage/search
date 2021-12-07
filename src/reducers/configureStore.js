import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import thunk from "redux-thunk";
import {createLogger} from "redux-logger";
import {routerReducer} from "react-router-redux";
import * as AppReducer from "./appReducer";

import {loadState} from "./stateLoader";

// only log when debug = false in settings.js
const loggerMiddleware = createLogger({
    predicate: (getState, action) => window.ENV.debug
});

export default function configureStore() {
    const reducers = {
        appReducer:  AppReducer.reducer,
    };

    const middleware = [thunk, loggerMiddleware];

    // In development, use the browser's Redux dev tools extension if installed
    const enhancers = [];
    const isDevelopment = process.env.NODE_ENV === "development";
    if (isDevelopment && typeof window !== "undefined" && window.devToolsExtension) {
        enhancers.push(window.devToolsExtension());
    }

    const rootReducer = combineReducers({
        ...reducers,
        routing: routerReducer
    });

    return createStore(
        rootReducer,
        loadState(),
        compose(
            applyMiddleware(...middleware),
            ...enhancers
        )
    );
}

