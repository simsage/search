import React, { Component } from "react";
import {appCreators} from "../actions/appActions";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import '../css/sign-in.css';

class SignIn extends Component {
    componentDidMount() {
        this.props.notBusy();
    }
    render() {
        return (
            <div className={(this.props.busy ? "wait-cursor" : "")} style={{display: "blocking"}}>
                <div className="auth-inner">
                    <div style={{float: "right"}} onClick={() => { if (this.props.onClose) this.props.onClose()}} title="close sign-in">&times;</div>
                    <div>
                        <h6 className="mb-3">Sign In</h6>
                        <button type="submit" className={(this.props.busy ? "wait-cursor" : "") + " btn auth-btn-primary btn-block w-100 my-2 rounded-pill"}
                                onClick={() => { if (this.props.onSignIn) this.props.onSignIn(this.state.email, this.state.password)}}
                                disabled={this.props.busy}>sign-in using Azure</button>
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
