import React from 'react';

import './MessageDialog.css';

import {useDispatch, useSelector} from "react-redux";
import {dismiss_auth_message} from "../reducers/authSlice";


// display a message dialog
export function MessageDialog() {
    const dispatch = useDispatch();

    const {system_message} = useSelector((state) => state.authReducer);

    function on_close_message() {
        dispatch(dismiss_auth_message());
    }

    return (
        <div>
            { system_message.length > 0 &&
                <div className="alert info-message ps-3 pe-2" role="alert" onClick={() => on_close_message()}
                     title={system_message}>
                    <div className="close close-info px-2" data-dismiss="alert" aria-label="close" title="close">&times;</div>
                    {system_message}
                </div>
            }
        </div>
    )
}

