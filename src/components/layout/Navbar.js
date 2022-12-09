import React, {Component} from 'react';

import '../../css/layout/navbar.css';
import SearchBox from "./SearchBox";

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
                        <div className="d-flex align-items-center" onClick={() => window.location = "/" }>
                            <img src="../images/brand/brand_enterprise-search.png" alt="" className="w-100" onClick={() => this.home() }/>
                        </div>
                    </div>
                }
                <SearchBox
                    showSearchBar={this.props.showSearchBar}
                    onSearch={this.props.onSearch}
                    search_text={this.props.search_text}
                    onUpdateSearchText={this.props.onUpdateSearchText}
                    />
            </div>
        );
    }
}
