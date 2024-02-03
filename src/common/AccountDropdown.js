import React, {useCallback} from 'react';

import './AccountDropdown.css';
import {close_menu, simsageLogOut} from "../reducers/authSlice";
import {toggle_ai} from "../reducers/searchSlice";
import {useDispatch, useSelector} from "react-redux";
import {useKeycloak} from "@react-keycloak/web";


/**
 * the little sign-in drop down menu
 *
 */
export function AccountDropdown(props) {
    const dispatch = useDispatch();
    const {show_menu} = useSelector((state) => state.authReducer);
    const {session} = useSelector((state) => state.authReducer);
    const {use_ai} = useSelector((state) => state.searchReducer);
    const { keycloak, initialized } = useKeycloak();

    const on_sign_out = useCallback(() => {
        dispatch(close_menu());
        if (initialized && keycloak && keycloak.authenticated) {
            dispatch(simsageLogOut({session_id: session?.id, keycloak}))
        }
    }, [dispatch, keycloak, initialized, session?.id])
    function view_advanced_query_syntax() {
        dispatch(close_menu());
        window.open("/resources/search-syntax.pdf", "blank");
    }
    function set_ai() {
        dispatch(close_menu());
        dispatch(toggle_ai());
    }
    const is_authenticated = (initialized && keycloak && keycloak.authenticated);
    return (
        <div className={(show_menu ? "d-flex" : "d-none") + " account-dropdown"}>
            <ul className="acc-nav ps-0 mb-0">
                <li className="acc-item px-4 py-3" onClick={() => window.location = "/"}>
                    <label>Home</label>
                </li>
                { window.ENV.show_download_manual &&
                <li className="acc-item px-4 py-3"
                    onClick={() => view_advanced_query_syntax()}>
                    <label>Advanced query syntax</label>
                </li>
                }
                { window.ENV.query_ai_enabled &&
                    <li className="acc-item px-4 py-3"
                        onClick={() => set_ai()}>
                        <label>{ use_ai ? "\u2713 " : ""}use AI</label>
                    </li>
                }
                { is_authenticated &&
                <li className="acc-item px-4 py-3"
                    onClick={() => on_sign_out()}>
                    <label>Sign out</label>
                    </li>
                }
            </ul>
        </div>
    );
}

