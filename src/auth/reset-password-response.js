import React, {Component} from 'react';

import Api from '../common/api'
import ErrorDialog from '../common/error-dialog';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {appCreators} from "../actions/appActions";

import '../css/reset-password.css';
import {Link} from "react-router-dom";

const queryString = require('query-string');


export class ResetPasswordResponse extends Component {
    constructor(props){
        super(props);

        const parsed = queryString.parse(props.location.search);

        let email = '';
        let reset_id = '';
        if (parsed['email']) {
            email = parsed['email'];
        }
        if (parsed['resetid']) {
            reset_id = parsed['resetid'];
        }

        this.state={
            email: email,
            reset_id: reset_id,
            password: '',

            error_title: '',
            error_msg: '',

            has_error: false,  // error trapping
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    resetPassword() {
        const self = this;
        if(this.state.email.length > 0 && this.state.reset_id.length > 0 && this.state.password.length > 5) {
            Api.resetPassword(this.state.email, this.state.password, this.state.reset_id,
                (response) => {
                    self.showError('Success', "Password reset.  You can now sign-in using your new password.");
                    self.setState({reset_id: '', email: '', password: ''});
                },
                (error) => {
                    self.showError('Error', error);
                }
            );
        }
        else{
            this.showError('Error', 'Input field value(s) missing or incorrect.');
        }
    }
    onKeyPress(event) {
        if (event.key === "Enter") {
            this.resetPassword();
        }
    }
    signIn() {
        window.location = "/";
    }
    showError(title, error_msg) {
        this.setState({error_title: title, error_msg: error_msg});
    }
    closeError() {
        this.setState({error_msg: ''});
    }
    render() {
        if (this.state.has_error) {
            return <h1>reset-password-response.js: Something went wrong.</h1>;
        }
        return (
            <div>

                <nav className="navbar navbar-expand-lg navbar-light fixed-top">
                    <div className="container">
                        <Link className="navbar-brand" to={"/"}>{window.ENV.app_title}</Link>
                        <div className="collapse navbar-collapse">
                        </div>
                    </div>
                </nav>

                <ErrorDialog error={this.props.error} onClose={() => this.props.closeError()} />

                <div className="auth-wrapper">
                    <div className="auth-inner">
                        <div>

                            <h3>Reset password</h3>

                            <div className="form-group">
                                <label>Email address</label>
                                <input type="email" className="form-control" placeholder="Enter email" autoFocus={true}
                                       value={this.state.email}
                                       onKeyPress={(event) => this.onKeyPress(event)}
                                       onChange = {(event) => this.setState({email: event.target.value}) }
                                />
                            </div>

                            <div className="form-group">
                                <label>Reset id</label>
                                <input type="text" className="form-control" placeholder="Enter the reset-id we sent you"
                                       value={this.state.reset_id}
                                       autoComplete={false}
                                       onKeyPress={(event) => this.onKeyPress(event)}
                                       onChange = {(event) => this.setState({reset_id: event.target.value}) }
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" className="form-control" placeholder="Enter your new password"
                                       onKeyPress={(event) => this.onKeyPress(event)}
                                       onChange = {(event) => this.setState({password: event.target.value}) }
                                />
                            </div>

                            <div className="form-group spacer-height">
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" onClick={() => this.resetPassword()}>Submit</button>
                            <p className="forgot-password text-right">
                                Back to <span className="forgot-password-link" onClick={() => this.signIn()}>sign in?</span>
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
    };
};

export default connect(
    mapStateToProps,
    dispatch => bindActionCreators(appCreators, dispatch)
)(ResetPasswordResponse);
