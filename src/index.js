import React from 'react';

// import $ from 'jquery';
// import Popper from 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/css/bootstrap.css';
import 'typeface-roboto';

// import 'babel-polyfill'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
// import {BrowserRouter} from 'react-router-dom'
import {Route} from 'react-router'

import configureStore from "./reducers/configureStore";
import {saveState} from "./reducers/stateLoader";

import ResetPasswordRequest from "./auth/reset-password-request";
import ResetPasswordResponse from "./auth/reset-password-response";
import SearchPage from "./search/search-page";
import {HashRouter} from "react-router-dom";


const store = configureStore();
store.subscribe(() => {
    saveState(store.getState());
});


ReactDOM.render(
    <Provider store={store}>
    <div className="App">
        <HashRouter basename={'/'}>
            <Route exact path="/" component={SearchPage} />
            <Route exact path="/forgot-password" component={ResetPasswordRequest} />
            <Route exact path="/reset-password-response" component={ResetPasswordResponse} />
        </HashRouter>
    </div>
    </Provider>,
    document.getElementById('content')
);
