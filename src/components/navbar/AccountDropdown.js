import React, {Component} from 'react';

import '../../css/navbar/account-dropdown.css';

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
    signIn(e) {
        if (this.props.onSignIn)
            this.props.onSignIn(e);
    }
    signOut(e) {
        if (this.props.onSignOut)
            this.props.onSignOut(e);
    }
    render() {
        if (this.state.has_error) {
            return <h1>account.js: Something went wrong.</h1>;
        }
        const isAuthenticated = this.props.isAuthenticated ? this.props.isAuthenticated : false;
        return (
            <div className={(this.props.isAccountsDropdown ? "d-flex" : "d-none") + " account-dropdown"}>
                <ul className="acc-nav ps-0 mb-0">
                    <li className="acc-item px-4 py-3" onClick={() => window.location = "/"}>
                        <label>Home</label>
                    </li>
                    { !isAuthenticated &&
                    <li className="acc-item px-4 py-3" onClick={(e) => this.signIn(e)}>
                        <label>Sign In</label>
                    </li>
                    }
                    { isAuthenticated &&
                    <li className="acc-item px-4 py-3"
                        onClick={(e) => this.signOut(e)}>
                        <label>Sign out</label>
                        </li>
                    }
                </ul>
            </div>
        );
    }
}