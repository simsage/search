import React from 'react';

import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/css/bootstrap.css';
import 'typeface-roboto';

import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {Route} from 'react-router'

import configureStore from "./reducers/configureStore";
import {saveState} from "./reducers/stateLoader";

import SearchPage from "./search/search-page";
import {HashRouter} from "react-router-dom";

import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import {PublicClientApplication} from "@azure/msal-browser";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import {PageLayout} from "./pageLayout";


const store = configureStore();
store.subscribe(() => {
    saveState(store.getState());
});

/**
 * Initialize a PublicClientApplication instance which is provided to the MsalProvider component
 * We recommend initializing this outside of your root component to ensure it is not re-initialized on re-renders
 */
const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.render(
    <Provider store={store}>
        <MsalProvider instance={msalInstance}>
            <HashRouter basename={'/'}>
                <PageLayout>
                    <AuthenticatedTemplate>
                        <Route exact path="/" component={SearchPage} />
                    </AuthenticatedTemplate>
                    <UnauthenticatedTemplate>
                        <Route exact path="/" component={SearchPage} />
                    </UnauthenticatedTemplate>
                </PageLayout>
            </HashRouter>
        </MsalProvider>
    </Provider>,
    document.getElementById('content')
);
