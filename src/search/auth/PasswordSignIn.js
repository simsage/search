import React, {useState} from 'react';

import './SignInPage.css';
import {password_reset_start, simSagePasswordSignIn} from "../../reducers/authSlice";
import {useDispatch} from "react-redux";
import {ErrorDialog} from "../../common/ErrorDialog";


// sign-in screen
export function PasswordSignIn() {
    const dispatch = useDispatch();

    const [username, set_username] = useState("");
    const [password, set_password] = useState("");

    function do_sign_in() {
        dispatch(simSagePasswordSignIn({username: username, password: password}));
    }

    function on_key_press(event) {
        if (event.key === "Enter") {
            do_sign_in();
        }
    }

    function on_reset_password_request() {
        dispatch(password_reset_start());
    }

    return (
        <div>
            <ErrorDialog />

            <div className="no-select auth-wrapper d-flex justify-content-center align-items-center overflow-auto">

                <div className="auth-inner">

                    <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
                        <div className="d-flex align-items-end">
                            <img alt="SimSage" title="Search Reimagined" src="/images/brand/simsage-logo-no-strapline.svg"
                                 className="auth-logo" onClick={() => { window.location = window.ENV.api_base.replace('/api', '/'); }} />
                            <p className="mb-1 fw-bold auth-text-primary fst-italic">SEARCH</p>
                        </div>
                        <div className="version">Version {window.ENV.version}</div>
                    </div>

                    <div className="form-group form-label">
                        <label className="label-text">Email address</label>
                        <input type="email" className="form-control" placeholder="Enter email" autoFocus={true}
                               value={username}
                               onKeyDown={(event) => on_key_press(event)}
                               onChange = {(event) => set_username(event.target.value) }
                        />
                    </div>

                    <div className="form-group form-label">
                        <label className="label-text">Password</label>
                        <input type="password" className="form-control" placeholder="Enter password"
                               value={password}
                               onKeyDown={(event) => on_key_press(event)}
                               onChange = {(event) => set_password(event.target.value) }
                        />
                    </div>

                    <div className="form-group spacer-height">
                    </div>

                    <div className="form-group">
                        <button type="submit" className="btn btn-primary btn-block" onClick={() => {
                            do_sign_in();
                        }}>Sign in</button>
                    </div>

                    <br/>

                    <p className="forgot-password text-right">
                        <span className="forgot-password-link" onClick={() => on_reset_password_request()}>forgot password?</span>
                    </p>

                    <p className="forgot-password text-right">
                        <span className="forgot-password-link" onClick={() => window.location = 'foss-license'}>open-source licenses</span>
                    </p>

                </div>
            </div>

        </div>
    )
}

