import React, {useEffect} from "react";
import {useDispatch, useSelector} from 'react-redux';
import {useMsal} from "@azure/msal-react";
import {close_menu, simSageMSALSignIn} from "./reducers/authSlice";
import Search from "./search/Search";
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

    useEffect(() => {
        // do we have a session object locally? if not - sign-in
        if (accounts && accounts.length > 0) {
            const request = {
                account: accounts[0]
            };
            if (!session?.id) {
                // if we have an account but no session, ask SimSage to provide the session
                // and user's ID from SimSage itself using the JWT
                    instance.acquireTokenSilent(request).then((response) => {
                        // dispatch(close_menu());
                        dispatch(simSageMSALSignIn({jwt: response.idToken}));
                    }).catch((error) => {
                        console.error(error);
                        // sign out the user
                        instance.logoutRedirect().catch(e => {
                            console.error("logoutRequest error", e);
                        });
                    })
            }
        }
    }, [session?.id, accounts, dispatch, instance])

    // const is_authenticated = session && session.id && session.id.length > 0;
    // const show_search = is_authenticated || window.ENV.allow_anon;

    return (
        <div>
            <Search
                on_sign_in={(e) => on_sign_in(e)}
                on_sign_out={(e) => on_sign_out(e)}
            />
        </div>
    )
}
