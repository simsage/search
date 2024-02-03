import React from 'react';
import ReactDOM from 'react-dom/client';
import {Provider} from 'react-redux';
import './index.css';

import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/css/bootstrap.css';
import 'typeface-roboto';
import {store} from "./store";

import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from "./keycloak";

import reportWebVitals from './reportWebVitals';
import {App} from "./App";

let token = localStorage.getItem('token');
let refreshToken = localStorage.getItem('refreshToken');

const setTokens = (token, idToken, refreshToken) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('idToken', idToken);
}

const eventLogger = (event, error) => {
    if (error) {
        console.log('onKeycloakEvent', event, error)
        keycloak.login()
            .then(() => {
                console.log("keycloak signed in")
            })
    } else {
        console.log('onKeycloakEvent', event)
    }
}

const tokenLogger = (tokens) => {
    if (tokens && tokens.token && tokens.refreshToken) {
        setTokens(tokens.token, tokens.idToken, tokens.refreshToken)
    }
}

let init_options = {onLoad: 'check-sso'};
if (token && refreshToken) {
    init_options = {onLoad: 'check-sso', token: token, refreshToken: refreshToken};
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ReactKeycloakProvider
        authClient={keycloak}
        onEvent={eventLogger}
        onTokens={tokenLogger}
        initOptions={init_options}>
        <Provider store={store}>
            <App />
        </Provider>
    </ReactKeycloakProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
