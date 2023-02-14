import React from "react";
import {useDispatch, useSelector} from 'react-redux';
import Search from "./search/Search";
import {PasswordSignIn} from "./search/auth/PasswordSignIn";
import {password_sign_in, sign_out} from "./reducers/authSlice";
import {ResetPasswordRequest} from "./search/auth/ResetPasswordRequest";
import {get_url_search_parameters_as_map, is_valid_email} from "./common/Api";
import {ResetPasswordResponse} from "./search/auth/ResetPasswordResponse";


/**
 * main page layout for the search system
 *
 */
export const PasswordPageLayout = () => {
    const dispatch = useDispatch();
    const { session, request_sign_on, reset_password_request } = useSelector((state) => state.authReducer);

    function on_sign_in(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        dispatch(password_sign_in());
    }

    function on_sign_out(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        dispatch(sign_out());
    }

    let propsSearch = get_url_search_parameters_as_map(window.location.search);
    if (propsSearch.hasOwnProperty("email") && propsSearch.hasOwnProperty("resetid")) {
        const email = decodeURIComponent(propsSearch["email"]);
        const reset_id = decodeURIComponent(propsSearch["resetid"]);
        if (is_valid_email(email) && reset_id.length > 10) {
            return (<ResetPasswordResponse email={email} reset_id={reset_id} />)
        }
    }

    const has_session = session && session.id && session.id.length > 0;
    const show_search = (has_session || window.ENV.allow_anon) && !request_sign_on;
    if (reset_password_request) {
        return (<ResetPasswordRequest />)
    }
    return (
        <div>
            { show_search &&
                <Search
                    on_sign_in={(e) => on_sign_in(e)}
                    on_sign_out={(e) => on_sign_out(e)}
                />
            }
            { !show_search &&
                <PasswordSignIn />
            }
        </div>
    )
}
