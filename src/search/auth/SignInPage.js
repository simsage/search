import React from 'react';

import './SignInPage.css';
import {useMsal} from "@azure/msal-react";
import {loginRequest} from "../../AuthConfig";
import {ErrorDialog} from "../../common/ErrorDialog";


// sign-in screen
export function SignInPage() {
    const { instance } = useMsal();
    return (
        <div>
            <div className="no-select auth-wrapper d-flex justify-content-center align-items-center overflow-auto">

                <div className="auth-inner">

                    <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
                        <div className="d-flex align-items-end">
                            <img alt="SimSage" title="Search Reimagined" src="images/brand/simsage-logo-no-strapline.svg"
                                 className="auth-logo" onClick={() => { window.location = window.ENV.api_base.replace('/api', '/'); }} />
                            <p className="mb-1 fw-bold auth-text-primary fst-italic">SEARCH</p>
                        </div>
                        <div className="version">Version {window.ENV.version}</div>
                    </div>

                    <div className="form-group">
                        <button type="submit" className="btn btn-primary btn-block" onClick={() => {
                            // sign in and re-direct
                            instance.loginRedirect(loginRequest).catch(e => {
                                console.error(e);
                            });
                        }}>Sign in</button>
                    </div>

                    {
                        window.ENV.customer === 'arista' &&
                        <div>
                            <div className="offset-1 small-font-size">
                                NB. &nbsp;After clicking <b>Sign in</b> you will be taken to the
                            </div>
                            <div className="offset-2 small-font-size">
                                <b>b2clogin.com</b> to complete authentication with Google.
                            </div>
                        </div>
                    }

                </div>
            </div>

            <ErrorDialog />

        </div>
    );
}
