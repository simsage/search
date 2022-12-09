import React from 'react';

import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/css/bootstrap.css';
import 'typeface-roboto';

import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {Route} from 'react-router'

import configureStore from "./reducers/configureStore";

import SearchPage from "./search/search-page";

import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import {PublicClientApplication} from "@azure/msal-browser";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import {PageLayout} from "./pageLayout";
import {createBrowserHistory} from "history";
import {BrowserRouter} from "react-router-dom";
import SignIn from "./auth/sign-in";
import {SignInError} from "./components/sign-in/sign_in_error";
import FullPageSignIn from "./components/sign-in/full-page-sign-in";


const store = configureStore();

/**
 * Initialize a PublicClientApplication instance which is provided to the MsalProvider component
 * We recommend initializing this outside of your root component to ensure it is not re-initialized on re-renders
 */
const msalInstance = new PublicClientApplication(msalConfig);

createBrowserHistory();

ReactDOM.render(
    <Provider store={store}>
        {window.ENV.allow_anon &&
            <MsalProvider instance={msalInstance}>
                <BrowserRouter
                    basename={document.baseURI.substring(document.baseURI.indexOf(window.location.origin) + window.location.origin.length, document.baseURI.lastIndexOf('/'))}>
                    <PageLayout>
                        <AuthenticatedTemplate>
                            <Route exact path="/" component={SearchPage}/>
                        </AuthenticatedTemplate>
                        <UnauthenticatedTemplate>
                            <Route exact path="/" component={SearchPage}/>
                        </UnauthenticatedTemplate>
                    </PageLayout>
                </BrowserRouter>
            </MsalProvider>
        }
        { !window.ENV.allow_anon &&
            <MsalProvider instance={msalInstance}>
                <BrowserRouter
                    basename={document.baseURI.substring(document.baseURI.indexOf(window.location.origin) + window.location.origin.length, document.baseURI.lastIndexOf('/'))}>
                    <PageLayout>
                        <AuthenticatedTemplate>
                            <Route exact path="/" component={SearchPage}/>
                        </AuthenticatedTemplate>
                        <UnauthenticatedTemplate>
                            <Route exact path="/" component={FullPageSignIn}/>
                            <Route exact path="/error" component={SignInError}/>
                        </UnauthenticatedTemplate>
                    </PageLayout>
                </BrowserRouter>
            </MsalProvider>
        }
    </Provider>,
    document.getElementById('content')
);
