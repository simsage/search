import React, { Component } from "react";
import {clearState} from "../reducers/stateLoader";
import {appCreators} from "../actions/appActions";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import '../css/sign-in.css';
import ErrorDialog from "../common/error-dialog";

class SignIn extends Component {
    constructor(props){
        super(props);
        this.state={
            email:'',
            password: '',
        }
    }
    componentDidMount() {
        clearState();
        this.props.notBusy();
    }
    signIn() {
        this.props.signIn(this.state.email, this.state.password);
    }
    forgotPassword() {
        window.location = '/#/forgot-password';
    }
    onKeyPress(event) {
        if (event.key === "Enter") {
            this.signIn();
        }
    }
    render() {
        return (

            <div className={(this.props.busy ? "wait-cursor" : "")} style={{display: "blocking"}}>
                <div className="auth-inner">
                    <div style={{float: "right"}} onClick={() => { if (this.props.onClose) this.props.onClose()}} title="close sign-in">&times;</div>
                    <div>
                        <h6 className="mb-3">Sign In</h6>

                        <div className="form-group mb-2">
                            <label className="small text-muted">Email</label>
                            <input type="email" className="form-control" placeholder="example@email.com" autoFocus={true}
                                   disabled={this.props.busy}
                                   readOnly={this.props.busy}
                                   value={this.state.email}
                                   onKeyPress={(event) => this.onKeyPress(event)}
                                   onChange = {(event) => this.setState({email: event.target.value}) }
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label className="small text-muted">Password</label>
                            <input type="password" className="form-control" placeholder="*******"
                                   disabled={this.props.busy}
                                   readOnly={this.props.busy}
                                   value={this.state.password}
                                   onKeyPress={(event) => this.onKeyPress(event)}
                                   onChange = {(event) => this.setState({password: event.target.value}) }
                            />
                        </div>

                        {/* <div className="d-flex justify-content-end"> */}
                        <button type="submit" className={(this.props.busy ? "wait-cursor" : "") + " btn auth-btn-primary btn-block w-100 my-2 rounded-pill"}
                                onClick={() => { if (this.props.onSignIn) this.props.onSignIn(this.state.email, this.state.password)}}
                                disabled={this.props.busy}>Submit</button>
                        {/* </div> */}

                        <p className="forgot-password text-right">
                            Forgot <span className="forgot-password-link" onClick={() => this.forgotPassword()}>Password?</span>
                        </p>
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
)(SignIn);

