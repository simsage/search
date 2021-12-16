import React, {Component} from 'react';

import '../../css/navbar/account-dropdown.css';
import Api from "../../common/api";

/**
 * this is the main DMS page
 */
export default class AccountDropdown extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            my_error_title: 'default error title',
            my_error_message: 'default error message'
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    render() {
        if (this.state.has_error) {
            return <h1>account.js: Something went wrong.</h1>;
        }
        const sessionId = Api.getSessionId(this.props.session);
        return (
            <div className={(this.props.isAccountsDropdown ? "d-flex" : "d-none") + " account-dropdown"}>
                <ul className="acc-nav ps-0 mb-0">
                    {/*<li className="acc-item px-4 py-3" onClick={() => {if (this.props.onSettingsModal) this.props.onSettingsModal()}}>*/}
                    {/*    <label>Account</label>*/}
                    {/*</li>*/}
                    {/*<li className="acc-item px-4 py-3" onClick={() => {if (this.props.onSettingsModal) this.props.onSettingsModal()}}>*/}
                    {/*    <label>Settings</label>*/}
                    {/*</li>*/}
                    { sessionId === "" &&
                    <li className="acc-item px-4 py-3" 
                        onClick={() => {if (this.props.onSignIn) this.props.onSignIn()}}>
                        <label>Sign In</label>
                    </li>
                    }
                    { sessionId &&
                    <li className="acc-item px-4 py-3"
                        onClick={() => {if (this.props.onSignOut) this.props.onSignOut()}}>
                        <label>Sign Out</label>
                        </li>
                    }
                </ul>
            </div>
        );
    }
}