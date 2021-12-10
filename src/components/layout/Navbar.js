import React, {Component} from 'react';

import '../../css/layout/navbar.css';

export default class Navbar extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            my_error_title: 'default error title',
            my_error_message: 'default error message',
            show_recents: false,
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    getFullUsername() {
        if (this.props.user && this.props.user.firstName) {
            return this.props.user.firstName + " " + this.props.user.surname;
        }
        return "";
    }
    doSearch(event) {
        if (event.key === "Enter") {
            if (this.props.onSearch) {
                this.props.onSearch(event.target.value);
            }
            if (this.state.show_recents) {
                this.setState({show_recents: false})
            } 
        }
    }
    // callback from search suggestion menu
    onSearchFromSuggestion(e, text) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.onUpdateSearchText)
            this.props.onUpdateSearchText(text);
        if (this.props.onSearch)
            this.props.onSearch(text);
    }
    removeSavedSearch(e, ss) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.onRemoveSavedSearch)
            this.props.onRemoveSavedSearch(ss);
    }
    recentsDropdown() {
        if (!this.state.show_recents) {
            this.setState({show_recents: true})
        } 
    }
    toggleAccountsMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.onAccountsDropdown)
            this.props.onAccountsDropdown()
    }
    toggleNotificationsDropdown(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.onNotificationsDropdown)
            this.props.onNotificationsDropdown();
    }
    render() {
        if (this.state.has_error) {
            return <h1>navbar.js: Something went wrong.</h1>;
        }
        return (
            <div className="navbar d-flex justify-content-between align-items-center px-4">
                <div className="nav-search-container d-flex align-items-center position-relative">
                    <span className="nav-search-icon ms-2 d-flex align-items-center">
                        <img src="../images/icon/icon_n-search.svg" alt="search"
                             onClick={() => {if (this.props.onSearch) this.props.onSearch(this.prop.search_text)}}
                        />
                    </span>
                    <input type="text" className="nav-search-input ps-1 pe-3" id="simsage-search-text"
                           onChange={(event) => {if (this.props.onUpdateSearchText) this.props.onUpdateSearchText(event.target.value)}}
                           onKeyDown={(event) => this.doSearch(event)}
                           onBlur={() => { window.setTimeout( () => this.setState({show_recents: false}), 100) } }
                           onClick={() => this.setState({show_recents: true})}
                           autoComplete={"off"}
                           value={this.props.search_text}
                           onFocus={() => this.recentsDropdown()}
                           placeholder="SimSage Search..." />
                    <div className={((this.state.show_recents && this.props.save_search_list && this.props.save_search_list.length > 0) ? "d-block" : "d-none") +" recents-menu end-0 position-absolute"}>
                        <ul className="more-list">
                            {
                                this.props.save_search_list && this.props.save_search_list.map((ss, i) => {
                                    return (
                                        <li className="more-list-items px-3 py-3 d-flex justify-content-between align-items-center" key={i}
                                            onClick={(e) => this.onSearchFromSuggestion(e, ss.text)}>
                                            <span className="no-select">{ss.text}</span>
                                            <img src="../images/icon/icon_rs-close.svg" alt="search" title={"remove \"" + ss.text + "\""}
                                                onClick={(e) => this.removeSavedSearch(e, ss.text)}
                                                className="remove-recent" />
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    <div className="d-none d-lg-flex flex-column text-end me-3">
                        <p className="org-name mb-0 small">{this.props.organisation ? this.props.organisation.name : ""}</p>
                        <p className="user-name mb-0">{this.getFullUsername()}</p>
                    </div>
                    <div className="notifications me-2">
                        <div className="indicator"></div>
                        <button className={(this.props.isNotificationsDropdown ? "active" : "") + " btn nav-btn"}
                            onClick={(e) => this.toggleNotificationsDropdown(e)}>
                            <img src="../images/icon/icon_n-notification.svg" alt="" className={this.props.isNotificationsDropdown ? "d-none" : ""} />
                            <img src="../images/icon/icon_n-notification-active.svg" alt="" className={!this.props.isNotificationsDropdown ? "d-none" : ""} />
                        </button>
                    </div>
                    <div className="account" title="this is the sign-out button for now">
                        <button className={(this.props.isAccountsDropdown ? "active" : "") + " btn nav-btn"}
                            onClick={(e) => this.toggleAccountsMenu(e)}>
                            <img src="../images/icon/icon_n-account.svg" alt="" className={this.props.isAccountsDropdown ? "d-none" : ""} />
                            <img src="../images/icon/icon_n-account-active.svg" alt="" className={!this.props.isAccountsDropdown ? "d-none" : ""} />
                        </button>
                    </div>
                </div>

            </div>
        );
    }
}
