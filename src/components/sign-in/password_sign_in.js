import React, {useState} from 'react';

import ErrorDialog from '../common/error-dialog';
import {clearState} from '../reducers/stateLoader';

import '../css/sign-in.css';
import '../css/spinner.css';
import Comms from "../common/comms";
import {useDispatch} from "react-redux";
import {SIGN_IN} from "../actions/actions";


// sign-in screen
export const PasswordSignIn = () => {

    const dispatch = useDispatch()

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    function doSignIn() {
        Comms.usernamePasswordSignIn(username, password,
            (data) => {
                    console.log("sign-in success");
                    dispatch({type: SIGN_IN, data: data});
                    // and go where we need to go
                    window.location = 'home';
                },
            (errorStr) => {
                    console.log(errorStr);
                    setError(errorStr);
                }
            )
    }

    function onKeyPress(event) {
        if (event.key === "Enter") {
            doSignIn();
        }
    }

    return (
        <div>
            <ErrorDialog title="sign-in"
                         message={error}
                         callback={() => setError("")} />

            <div className="no-select auth-wrapper d-flex justify-content-center align-items-center overflow-auto">

                <div className="auth-inner">

                    <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
                        <div className="d-flex align-items-end">
                            <img alt="SimSage" title="Search Reimagined" src="../images/simsage-logo-no-strapline.svg"
                                 className="auth-logo" onClick={() => { window.location = window.ENV.api_base.replace('/api', '/'); }} />
                            <p className="mb-1 fw-bold auth-text-primary fst-italic">ADMIN</p>
                        </div>
                        <div className="version">Version {window.ENV.version}</div>
                    </div>

                    <div className="form-group form-label">
                        <label className="label-text">Email address</label>
                        <input type="email" className="form-control" placeholder="Enter email" autoFocus={true}
                               value={username}
                               onKeyPress={(event) => onKeyPress(event)}
                               onChange = {(event) => setUsername(event.target.value) }
                        />
                    </div>

                    <div className="form-group form-label">
                        <label className="label-text">Password</label>
                        <input type="password" className="form-control" placeholder="Enter password"
                               value={password}
                               onKeyPress={(event) => this.onKeyPress(event)}
                               onChange = {(event) => setPassword(event.target.value) }
                        />
                    </div>

                    <div className="form-group spacer-height">
                    </div>

                    <div className="form-group">
                        <button type="submit" className="btn btn-primary btn-block" onClick={() => {
                            // clear any existing state
                            clearState();
                            doSignIn();
                        }}>Sign in</button>
                    </div>

                    <p className="forgot-password text-right">
                        <span className="forgot-password-link" onClick={() => window.location = 'reset-password-request'}>forgot password?</span>
                    </p>

                    <p className="forgot-password text-right">
                        <span className="forgot-password-link" onClick={() => window.location = 'foss-license'}>open-source licenses</span>
                    </p>

                </div>
            </div>

        </div>
    );
}

export default PasswordSignIn;
