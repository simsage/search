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
    home() {
        // hide search results
        if (this.props.onHideSearchResults)
            this.props.onHideSearchResults();
    }
    render() {
        if (this.state.has_error) {
            return <h1>navbar.js: Something went wrong.</h1>;
        }
        return (
            <div className={(!this.props.showSearchBar ? "border-bottom-0" : "") + " row mx-0 px-0 navbar justify-content-start"}>
                {this.props.showSearchBar &&
                    <div className={"col-1 ps-4 pe-0 h-100 d-flex justify-content-end"}>
                        {/* <img src="../images/brand/simsage-logo-no-strapline.svg" alt="" className="h-100" onClick={() => this.home() }/> */}
                        <div className="d-flex align-items-center">
                            <img src="../images/brand/brand_enterprise-search.png" alt="" className="w-100" onClick={() => this.home() }/>
                        </div>
                    </div>
                }
                <div className={(!this.props.showSearchBar ? " justify-content-end col-12" : "justify-content-between col-11") + " d-flex align-items-center px-4"}>
                    {this.props.showSearchBar &&
                    <div className="nav-search-container">
                        <div className="inner d-flex align-items-center position-relative">
                            <span className="nav-search-icon ms-2 d-flex align-items-center">
                                <img src="../images/icon/icon_n-search.svg" alt="search"
                                    onClick={() => {
                                        if (this.props.onSearch) this.props.onSearch(this.prop.search_text)
                                    }}
                                />
                            </span>
                            <input type="text" className="nav-search-input ps-1 pe-3" id="simsage-search-text"
                                onChange={(event) => {
                                    if (this.props.onUpdateSearchText) this.props.onUpdateSearchText(event.target.value)
                                }}
                                onKeyDown={(event) => this.doSearch(event)}
                                onBlur={() => {
                                    window.setTimeout(() => this.setState({show_recents: false}), 100)
                                }}
                                onClick={() => this.setState({show_recents: true})}
                                autoComplete={"off"}
                                value={this.props.search_text}
                                onFocus={() => this.recentsDropdown()}
                                placeholder="SimSage Search..."/>
                                <div
                                    className={((this.state.show_recents && this.props.save_search_list && this.props.save_search_list.length > 0) ? "d-block" : "d-none") + " recents-menu end-0 position-absolute"}>
                                    <ul className="more-list">
                                        {
                                            this.props.save_search_list && this.props.save_search_list.map((ss, i) => {
                                                return (
                                                    <li className="more-list-items px-3 py-3 d-flex justify-content-between align-items-center"
                                                        key={i}
                                                        onClick={(e) => this.onSearchFromSuggestion(e, ss.text)}>
                                                        <span className="no-select">{ss.text}</span>
                                                        <img src="../images/icon/icon_rs-close.svg" alt="search"
                                                            title={"remove \"" + ss.text + "\""}
                                                            onClick={(e) => this.removeSavedSearch(e, ss.text)}
                                                            className="remove-recent"/>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        );
    }
}
