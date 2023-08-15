import React from 'react';

import './AccountDropdown.css';
import {close_menu, sign_out} from "../reducers/authSlice";
import {toggle_question_answering_ai} from "../reducers/searchSlice";
import {useDispatch, useSelector} from "react-redux";


/**
 * the little sign-in drop down menu
 *
 */
export function AccountDropdown(props) {
    const dispatch = useDispatch();
    const {show_menu} = useSelector((state) => state.authReducer);
    const {use_question_answering_ai} = useSelector((state) => state.searchReducer);

    function sign_in() {
        dispatch(close_menu());
        if (props.onSignIn)
            props.onSignIn();
    }
    function on_sign_out() {
        dispatch(close_menu());
        dispatch(sign_out());
        if (props.onSignOut)
            props.onSignOut();
    }
    function view_advanced_query_syntax() {
        dispatch(close_menu());
        window.open("/resources/super-search-syntax.pdf", "blank");
    }
    function set_use_question_answering_ai() {
        dispatch(close_menu());
        dispatch(toggle_question_answering_ai());
    }
    const is_authenticated = (props.isAuthenticated === true);
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
                        onClick={() => set_use_question_answering_ai()}>
                        <label>{ use_question_answering_ai ? "\u2713 " : ""}use AI question answering</label>
                    </li>
                }
                { !is_authenticated &&
                <li className="acc-item px-4 py-3" onClick={() => sign_in()}>
                    <label>Sign In</label>
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

