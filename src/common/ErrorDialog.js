import React from 'react';

import './ErrorDialog.css';

import {useDispatch, useSelector} from "react-redux";
import {dismiss_auth_error} from "../reducers/authSlice";
import {dismiss_search_error} from "../reducers/searchSlice";


// display error dialog
export function ErrorDialog() {
    const dispatch = useDispatch();

    const {auth_error_text} = useSelector((state) => state.authReducer);
    const {search_error_text} = useSelector((state) => state.searchReducer);

    function on_close_errors() {
        dispatch(dismiss_auth_error());
        dispatch(dismiss_search_error());
    }

    let combined_error = '';
    if (auth_error_text.length > 0) {
        combined_error = auth_error_text;
    }
    if (search_error_text.length > 0) {
        if (combined_error.length > 0)
            combined_error = combined_error + ' / ' + search_error_text;
        else
            combined_error = search_error_text;
    }

    return (
        <div>
            {(auth_error_text.length > 0 || search_error_text.length > 0) &&
                <div className="alert alert-message ps-3 pe-2" role="alert" onClick={() => on_close_errors()}
                     title={combined_error}>
                    <div className="close close-alert px-2" data-dismiss="alert" aria-label="close" title="close">&times;</div>
                    <div>{auth_error_text}</div>
                    <div>{search_error_text}</div>
                </div>
            }
        </div>
    )
}
