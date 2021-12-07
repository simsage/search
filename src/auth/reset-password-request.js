import React, {Component} from 'react';

import ErrorDialog from '../common/error-dialog';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {appCreators} from "../actions/appActions";

import '../css/reset-password.css';
import MessageBox from "../common/message-box";


export class ResetPasswordRequest extends Component {
    constructor(props){
        super(props);
        this.state={
            email:'',
            show_message: false,
            has_error: false,  // error trapping
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    onKeyPress(event) {
        if (event.key === "Enter") {
            this.resetPassword();
        }
    }
    resetPassword() {
        //To be done:check for empty values before hitting submit
        if(this.state.email.length > 0) {
            this.props.resetPasswordRequest(this.state.email, (session, user) => {
                this.setState({show_message: true});
            }, (errStr) => {
                this.setState({show_message: true});
            });
        } else{
            this.props.setError('Error', 'Input field value is missing');
        }
    }
    signIn() {
        window.location = "/#/";
    }
    render() {
        if (this.state.has_error) {
            return <h1>reset_password_request.js: Something went wrong.</h1>;
        }
        return (
            <div className="h-100">

                {/* <nav className="navbar navbar-expand-lg navbar-light fixed-top">
                    <div className="container">
                        <div className="navbar-brand">{window.ENV.app_title}</div>
                        <div className="collapse navbar-collapse">
                        </div>
                        <div className="version">version {window.ENV.version}</div>
                    </div>
                </nav> */}

                <ErrorDialog error={this.props.error} onClose={() => this.props.closeError()} />

                <MessageBox
                    open={this.state.show_message}
                    text="We have emailed a reset-password to the email address you specified if this email address is a valid account."
                    onClose={() => this.setState({show_message: false})} />

                <div className="auth-wrapper d-flex justify-content-center align-items-center overflow-auto">
                    <div className="auth-inner">
                        <div>
                            <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
                                <div className="d-flex align-items-end">
                                    <img src="../images/brand/simsage-logo-no-strapline.svg" alt="" className="auth-logo" />
                                    {/* {window.ENV.app_title} */}
                                    <p className="mb-1 fw-bold auth-text-primary fst-italic">DMS</p>
                                </div>
                                <div className="version">Version {window.ENV.version}</div>
                            </div>
                            <h6 className="mb-2">Reset Password</h6>
                            <div className="no-select help-text fw-light">Please enter your email address and we'll email you a link to reset your password.</div>

                            <div className="form-group">
                                <label className="small text-muted">Email</label>
                                <input type="email" className="form-control" placeholder="example@email.com" autoFocus={true}
                                       value={this.state.email}
                                       disabled={this.state.show_message || this.props.busy}
                                       readOnly={this.props.busy}
                                       onKeyPress={(event) => this.onKeyPress(event)}
                                       onChange = {(event) => this.setState({email: event.target.value}) }
                                />
                            </div>

                            <div className="form-group spacer-height">
                            </div>

                            <button type="submit" className={(this.props.busy ? "wait-cursor" : "") + " btn auth-btn-primary btn-block w-100 my-2 rounded-pill"}
                                    onClick={() => this.resetPassword()} disabled={this.props.busy}>Send Link</button>
                            <p className="forgot-password text-right">
                                Back to <span className="forgot-password-link" onClick={() => this.signIn()}>Sign in?</span>
                            </p>

                        </div>
                    </div>
                </div>


            </div>
        );
    }
}

const mapStateToProps = function(state) {
    return {
        error: state.appReducer.error,
        error_title: state.appReducer.error_title,
        busy: state.appReducer.busy,
    };
};

export default connect(
    mapStateToProps,
    dispatch => bindActionCreators(appCreators, dispatch)
)(ResetPasswordRequest);
