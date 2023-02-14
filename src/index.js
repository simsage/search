import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';

import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/css/bootstrap.css';
import 'typeface-roboto';
import {store} from "./store";

import { MsalProvider } from "@azure/msal-react";
import {PublicClientApplication} from "@azure/msal-browser";
import { msalConfig } from "./AuthConfig";

import reportWebVitals from './reportWebVitals';
import {PageLayout} from "./pageLayout";
import {PasswordPageLayout} from "./passwordPageLayout";

/**
 * Initialize a PublicClientApplication instance which is provided to the MsalProvider component
 * We recommend initializing this outside of your root component to ensure it is not re-initialized on re-renders
 */
const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        { window.ENV.authentication === "password" &&
            <PasswordPageLayout />
        }
        { window.ENV.authentication !== "password" &&
            <MsalProvider instance={msalInstance}>
                <PageLayout />
            </MsalProvider>
        }
    </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
