import React from 'react';

import './SignInError.css';

export function SignInError(props) {
    function try_again() {
        //this.props.closeError();
        window.setTimeout(() => window.location="/", 500);
    }
    const error = props.error ? props.error : "";
    if (error.toLowerCase().indexOf("cannot contact servers") > 0) {
        return (
            <div>
                <center>
                    <div className="offset-top">
                        <h1>An error occurred.</h1>
                        <h3>the SimSage server is offline</h3>
                        <div className="link-style" onClick={() => try_again()} title="click here to try and connect again">click here to try and connect again</div>
                    </div>
                </center>
            </div>
        )
    } else {
        return (
            <div>
                <center>
                    <div className="offset-top">
                        <h1>An error occurred.</h1>
                        <h3>You are not authorized to use this application.</h3>
                        <div>{error}</div>
                        <div className="link-style" onClick={() => try_again()} title="click here to try again">click here to try again</div>
                    </div>
                </center>
            </div>
        )
    }
}

