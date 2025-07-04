import React, { useEffect, useCallback } from 'react';

import './ErrorDialog.css';

import { useSelector } from "react-redux";
import { close_menu, dismiss_auth_error, simsageLogOut } from "../reducers/authSlice";
import { dismiss_search_error } from "../reducers/searchSlice";
import { useAuth } from "react-oidc-context";
import { RootState, AppDispatch } from '../store';
import { useDispatch as useReduxDispatch } from "react-redux";

// Use AppDispatch type for dispatch
const useDispatch = () => useReduxDispatch<AppDispatch>();

let alert_shown = false;

// display error dialog
export function ErrorDialog(): JSX.Element {
    const dispatch = useDispatch();

    const { error_message } = useSelector((state: RootState) => state.authReducer);
    const { search_error_text, theme } = useSelector((state: RootState) => state.searchReducer);

    const auth = useAuth();
    const { session } = useSelector((state: RootState) => state.authReducer);

    const on_sign_out = useCallback(() => {
        dispatch(close_menu());
        if (auth && auth.isAuthenticated) {
            dispatch(simsageLogOut({ session_id: session?.id, auth }));
        }
    }, [dispatch, auth, session?.id]);

    function on_close_errors(): void {
        if (error_message && (
            error_message.indexOf('user does not exist') >= 0 ||
            error_message.indexOf('cannot connect to SimSage') >= 0 ||
            error_message.indexOf('invalid session id') >= 0
        )) {
            auth.signoutRedirect({ post_logout_redirect_uri: window.location.protocol + "//" + window.location.host })
                .then(() => {
                    console.log("signed out");
                });
        } else {
            dispatch(dismiss_auth_error());
            dispatch(dismiss_search_error());
        }
    }

    let combined_error = '';
    if (error_message && error_message.length > 0) {
        combined_error = error_message;
    }
    if (search_error_text && search_error_text.length > 0) {
        if (combined_error.length > 0)
            combined_error = combined_error + ' / ' + search_error_text;
        else
            combined_error = search_error_text;
    }

    // session timeout?
    useEffect(() => {
        function help_sign_out(): void {
            if (search_error_text && search_error_text.indexOf("session timed out") >= 0) {
                if (!alert_shown) {
                    alert("Your session has timed-out.  Please sign-in again.");
                    alert_shown = true;
                }
                on_sign_out();
            } else if (search_error_text && search_error_text.indexOf("ip-address changed") >= 0) {
                if (!alert_shown) {
                    alert("Your session is invalid (ip-address changed).  Please sign-in again.");
                    alert_shown = true;
                }
                on_sign_out();
            }
        }
        help_sign_out();
    }, [search_error_text, dispatch, on_sign_out]);

    return (
        <div className={theme === "light" ? "" : "text-white-50"}>
            {(error_message.length > 0 || search_error_text.length > 0) &&
                <div className={(theme === "light" ? "alert-message" : "alert-message-dark") + " alert ps-3 pe-2"}
                     role="alert" onClick={() => on_close_errors()}
                     title={combined_error}>
                    <div className="close close-alert px-2" data-dismiss="alert" aria-label="close" title="close">&times;</div>
                    {
                        error_message && error_message.length > 0 && error_message.split("\n").map((text, i) => {
                            return (
                                <div key={i}>{text}<br /></div>
                            );
                        })
                    }
                    {
                        search_error_text && search_error_text.length > 0 && search_error_text.split("\n").map((text, i) => {
                            return (
                                <div key={i + 1000}>{text}<br /></div>
                            );
                        })
                    }
                    <br />
                    <div>Please contact the SimSage Support team if the problem persists</div>
                </div>
            }
        </div>
    );
}
