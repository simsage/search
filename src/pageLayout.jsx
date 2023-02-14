import React from "react";
import {useDispatch, useSelector} from 'react-redux';
import {useMsal} from "@azure/msal-react";
import {close_menu, simSageMSALSignIn} from "./reducers/authSlice";
import Search from "./search/Search";
import {SignInPage} from "./search/auth/SignInPage";
import {loginRequest} from "./AuthConfig";


/**
 * main page layout for the search system
 *
 */
export const PageLayout = () => {
    const dispatch = useDispatch();

    const { session } = useSelector((state) => state.authReducer);
    const { accounts, instance } = useMsal();

    function on_sign_in(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        dispatch(close_menu());
        if (instance && loginRequest) {
            instance.loginPopup(loginRequest).catch(e => {
                console.error("loginRequest error", e);
            });
        }
    }

    function on_sign_out(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        dispatch(close_menu());
        if (instance && loginRequest) {
            instance.logoutRedirect().catch(e => {
                console.error("logoutRequest error", e);
            });
        }
    }

    // do we have a session object locally? if not - sign-in
    if ((!session || !session.id) && accounts && accounts.length > 0) {
        const request = {
            account: accounts[0]
        };
        // if we have an account but no session, ask SimSage to provide the session
        // and user's ID from SimSage itself using the JWT
        instance.acquireTokenSilent(request).then((response) => {
            dispatch(close_menu());
            dispatch(simSageMSALSignIn({jwt: response.idToken}));
        })
    }

    const is_authenticated = session && session.id && session.id.length > 0;
    const show_search = is_authenticated || window.ENV.allow_anon;

    return (
        <div>
            { show_search &&
                <Search
                    on_sign_in={(e) => on_sign_in(e)}
                    on_sign_out={(e) => on_sign_out(e)}
                />
            }
            { !show_search &&
                <SignInPage />
            }
        </div>
    )
}
