import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import {Provider} from 'react-redux';
import './index.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'typeface-roboto';
import {store} from "./store";

import {AuthProvider} from 'react-oidc-context'
import { WebStorageStateStore } from 'oidc-client-ts';
import reportWebVitals from './reportWebVitals';
import {App} from "./App";
import {BrowserRouter} from "react-router-dom";
import {AutomaticLogin, OIDC_REDIRECT_STORAGE_KEY} from "./AutomaticLogin";
import {SessionManager} from "./SessionManager";
import './types';

const oidcConfig = {
    authority: window.ENV.kc_endpoint + '/realms/' + window.ENV.kc_realm,
    client_id: window.ENV.kc_client_id,
    redirect_uri: window.location.origin + window.ENV.base_name,
    response_type: 'code',
    scope: 'openid profile email offline_access',
    automaticSilentRenew: false,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    onSigninCallback: (user: any) => {
        const stored_search = sessionStorage.getItem(OIDC_REDIRECT_STORAGE_KEY)
        sessionStorage.removeItem(OIDC_REDIRECT_STORAGE_KEY);
        let new_url = window.location.pathname + (stored_search || '');
        window.history.replaceState({}, document.title, new_url);
    },
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <AuthProvider {...oidcConfig}>
        <AutomaticLogin>
            <Provider store={store}>
                <SessionManager>
                    <BrowserRouter basename={window.ENV.base_name}>
                        <App />
                    </BrowserRouter>
                </SessionManager>
            </Provider>
        </AutomaticLogin>
    </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example, reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();