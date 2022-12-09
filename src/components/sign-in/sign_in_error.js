import React, {Component} from 'react';

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {appCreators} from "../../actions/appActions";

import '../../css/sign-in-error.css';

export class SignInError extends Component {
    tryAgain() {
        this.props.closeError();
        window.setTimeout(() => window.location="/", 500);
    }
    render() {
        const error = this.props.error ? this.props.error : "";
        if (error.toLowerCase().indexOf("cannot contact servers") > 0) {
            return (
                <div>
                    <center>
                        <div className="offset-top">
                            <h1>An error occurred.</h1>
                            <h3>the SimSage server is offline</h3>
                            <div className="link-style" onClick={() => this.tryAgain()} title="click here to try and connect again">click here to try and connect again</div>
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
                            <div>{this.props.error}</div>
                            <div className="link-style" onClick={() => this.tryAgain()} title="click here to try again">click here to try again</div>
                        </div>
                    </center>
                </div>
            )
        }
    }

}

const mapStateToProps = function(state) {
    return {
        error: state.appReducer.error,
        error_title: state.appReducer.error_title,
        busy: state.appReducer.busy,
        theme: state.appReducer.theme,
    };
};

export default connect(
    mapStateToProps,
    dispatch => bindActionCreators(appCreators, dispatch)
)(SignInError);
