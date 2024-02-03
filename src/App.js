import React, {useEffect} from "react";
import {useDispatch} from 'react-redux';
import {simsageSignIn} from "./reducers/authSlice";
import Search from "./search/Search";
import {useKeycloak} from "@react-keycloak/web";


/**
 * main page layout for the search system
 *
 */
export const App = () => {
    const dispatch = useDispatch();
    const {initialized, keycloak} = useKeycloak()

    useEffect(() => {
        const loginToSimSage = () => {
            if (keycloak?.idToken) {
                dispatch(simsageSignIn({
                    id_token: keycloak.idToken,
                    on_success: () => {
                        console.log("signed in");
                    },
                    on_fail: (err) => {
                        console.log("login failed", err);
                    }
                }))
            }
        }

        if (initialized) {

            keycloak.onAuthSuccess = () => {
                loginToSimSage()
            }

            keycloak.onAuthRefreshSuccess = () => {
                loginToSimSage()
            }

            keycloak.updateToken(5).then(function (refreshed) {
                if (refreshed) {
                    console.log('Token was successfully refreshed');
                } else {
                    console.log('Token is still valid');
                }
                loginToSimSage()

            }).catch(function (ex) {
                console.warn('Failed to refresh the token, or the session has expired', ex);
                keycloak.login();
                //window.location.reload();
            });
        }
    }, [initialized, keycloak, dispatch]);

    if (!initialized) {
        return <div>loading...</div>;
    }

    return (
        <Search />
    )
}
