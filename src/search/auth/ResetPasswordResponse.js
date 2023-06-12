import React, {useState} from "react";
import {is_valid_email} from "../../common/Api";
import {ErrorDialog} from "../../common/ErrorDialog";
import {MessageDialog} from "../../common/MessageDialog";

import './SignInPage.css';
import {useDispatch} from "react-redux";
import {password_sign_in, resetPassword, set_auth_error} from "../../reducers/authSlice";

/**
 * reset password system dialog
 *
 */
export function ResetPasswordResponse(props) {
    const dispatch = useDispatch();

    const [email, set_email] = useState(props.email ? props.email : '');
    const [password, set_password] = useState('');
    const [reset_id, set_reset_id] = useState(props.reset_id ? props.reset_id : '');

    // do the reset request
    function on_reset_password() {
        if (is_valid_email(email) && reset_id.trim().length > 10 && password.length > 5) {
            dispatch(resetPassword({email: email, reset_id: reset_id, password: password}));
        } else {
            if (!is_valid_email(email)) {
                dispatch(set_auth_error({error_text: "invalid email address"}));
            } else if (reset_id.trim().length <= 10) {
                dispatch(set_auth_error({error_text: "invalid Reset id"}));
            } else {
                dispatch(set_auth_error({error_text: "password must be at least 8 characters"}));
            }
        }
    }

    // see if we've pressed enter
    function on_key_press(event) {
        if (event.key === "Enter") {
            on_reset_password();
        }
    }

    function on_sign_in() {
        dispatch(password_sign_in());
    }

    return (
        <div>
            <div className="no-select auth-wrapper d-flex justify-content-center align-items-center overflow-auto">

            <ErrorDialog />
            <MessageDialog />

            <div className="auth-inner">

                <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
                    <div className="d-flex align-items-end">
                        <img alt="SimSage" title="Search Reimagined" src="images/brand/simsage-logo-no-strapline.svg"
                             className="auth-logo" onClick={() => { window.location = window.ENV.api_base.replace('/api', '/'); }} />
                        <p className="mb-1 fw-bold auth-text-primary fst-italic">SEARCH</p>
                    </div>
                    <div className="version">Version {window.ENV.version}</div>
                </div>

                <h3>Reset password</h3>

                <div className="form-group">
                    <label>Email address</label>
                    <input type="email" className="form-control reset-password-width" placeholder="Enter email" autoFocus={true}
                           value={email}
                           onKeyDown={(event) => on_key_press(event)}
                           onChange = {(event) => set_email(event.target.value) }
                    />
                </div>

                <div className="form-group">
                    <label>Reset id</label>
                    <input type="text" className="form-control reset-password-width" placeholder="Enter the reset-id we sent you"
                           value={reset_id}
                           autoComplete={"false"}
                           onKeyDown={(event) => on_key_press(event)}
                           onChange = {(event) => set_reset_id(event.target.value) }
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input type="password" className="form-control reset-password-width" placeholder="Enter your new password"
                           onKeyDown={(event) => on_key_press(event)}
                           autoFocus={true}
                           onChange = {(event) => set_password(event.target.value) }
                    />
                </div>

                <br />

                <button type="submit" className="btn btn-primary btn-block w-100 my-2" onClick={() => on_reset_password()}>Submit</button>

                <br />
                <br />

                <p className="forgot-password text-right">Back to <span className="forgot-password-link" onClick={() => on_sign_in()}>sign in?</span>
                </p>

            </div>
            </div>
        </div>
    );
}

