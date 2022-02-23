/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, {useState} from "react";
import {shallowEqual, useDispatch, useSelector} from 'react-redux';

import './css/search-page.css';

import {useIsAuthenticated, useMsal} from "@azure/msal-react";
import AccountDropdown from "./components/navbar/AccountDropdown";
import { loginRequest } from "./authConfig";
import Comms from "./common/comms";
import {ERROR, SIGN_IN} from "./actions/actions";


export const signIn = (accounts, session, instance, setIsAccountDropdown, dispatch, e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (setIsAccountDropdown)
        setIsAccountDropdown(false);
    if (instance && loginRequest) {
        instance.loginPopup(loginRequest).catch(e => {
            dispatch({type: ERROR, title: "Error", error: e})
        });
    }
}

export const signOut = (instance, setIsAccountDropdown, dispatch, e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (setIsAccountDropdown)
        setIsAccountDropdown(false);
    if (instance && loginRequest) {
        instance.logoutRedirect().catch(e => {
            dispatch({type: ERROR, title: "Error", error: e})
        });
    }
}

export const closeAllMenus = (setIsAccountDropdown, e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (setIsAccountDropdown)
        setIsAccountDropdown(false);
}

export const toggleAccountsMenu = (isAccountsDropdown, setIsAccountDropdown, e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAccountDropdown(!isAccountsDropdown);
}

export const getFullUsername = (ar) => {
    if (ar.user && ar.user.firstName) {
        return ar.user.firstName + " " + ar.user.surname;
    }
    return "";
}

/**
 * Renders the navbar component with a sign-in or sign-out button depending on whether or not a user is authenticated
 * @param props 
 */
export const PageLayout = (props) => {
    const isAuthenticated = useIsAuthenticated();
    const ar = useSelector((state) => state.appReducer, shallowEqual);
    const [isAccountsDropdown, setIsAccountDropdown] = useState(false);
    const { accounts, instance } = useMsal();
    const dispatch = useDispatch();

    // do we have a session object locally? if not - sign-in
    const session = ar.session;
    if ((!session || !session.id) && accounts && accounts.length > 0) {
        const request = {
            account: accounts[0]
        };
        // if we have an account but no session, ask SimSage to provide the session
        // and user's ID from SimSage itself using the JWT
        instance.acquireTokenSilent(request).then((response) => {
            Comms.http_get_jwt('/auth/authenticate/msal', response.idToken,
                (response2) => {
                console.log(response2.data);
                    dispatch({type: SIGN_IN, data: response2.data})
                },
                (errStr) => {
                    console.error(errStr);
                    dispatch({type: ERROR, title: "Error", error: errStr})
                    })
                }
            );
    }

    return (
        <div onClick={(e) => closeAllMenus(setIsAccountDropdown, e)}>
            {!ar.search_focus &&
                <div className={ar.busy ? "wait-cursor sign-in-menu" : "sign-in-menu"}>
                    <div className="d-none d-lg-flex flex-column text-end me-3 sign-in-float">
                        <p className="org-name mb-0 small">{ar.organisation ? ar.organisation.name : ""}</p>
                        <p className="user-name mb-0">{getFullUsername(ar)}</p>
                    </div>
                    <div className="account" title="this is the sign-out button for now">
                        <button className={(isAccountsDropdown ? "active" : "") + " btn nav-btn"}
                                onClick={(e) => toggleAccountsMenu(isAccountsDropdown, setIsAccountDropdown, e)}>
                            <img src="../images/icon/icon_n-account.svg" alt=""
                                 className={isAccountsDropdown ? "d-none" : ""}/>
                            <img src="../images/icon/icon_n-account-active.svg" alt=""
                                 className={!isAccountsDropdown ? "d-none" : ""}/>
                        </button>
                    </div>
                    <AccountDropdown
                        onSignOut={(e) => signOut(instance, setIsAccountDropdown, dispatch, e)}
                        onSignIn={(e) => signIn(accounts, ar.session, instance, setIsAccountDropdown, dispatch, e)}
                        isAuthenticated={isAuthenticated}
                        session={ar.session}
                        isAccountsDropdown={isAccountsDropdown}
                    />
                </div>
            }

            {props.children}

        </div>
    );
};
