import React, {Component} from 'react';

// import '../../css/layout/modal.css';

/**
 * this is the HomeSearch
 */
export default class HomeSearch extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            my_error_title: 'default error title',
            my_error_message: 'default error message',
            show_recents: false,
        }
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
    render() {
        if (this.state.has_error) {
            return <h1>HomeSearch.js: Something went wrong.</h1>;
        }
        return (
            <div className="h-100 d-flex justify-content-center align-items-center">
                <div className="d-flex flex-column justify-content-center align-items-center pb-5 mb-5">
                    {/* <img src="images/brand/simsage-logo-no-strapline.svg" alt="" className="mb-2" style={{"height" : "100px"}}/> */}
                    <img src="images/brand/brand_enterprise-search.png" alt="" className="mb-2" style={{"height" : "100px"}}/>
                    <div className="nav-search-container xl d-flex align-items-center position-relative mb-5">
                        <span className="nav-search-icon ms-2 d-flex align-items-center">
                            <img src="../images/icon/icon_n-search.svg" alt="search"/>
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
                               autoFocus
                               value={this.props.search_text}
                               onFocus={() => this.recentsDropdown()}
                               placeholder="Enterprise Search..."/>
                        <div className={((this.state.show_recents && this.props.save_search_list && this.props.save_search_list.length > 0) ? "d-block" : "d-none") + " recents-menu end-0 position-absolute"}>
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

                    <div className="d-flex justify-content-center mb-5">
                        <img src="../images/brand/logo_drive.svg" alt="" title="Google Drive" className="mx-3" style={{"width" : "40px"}}/>
                        <img src="../images/brand/logo_office.svg" alt="" title="Office" className="mx-3" style={{"width" : "40px"}}/>
                        <img src="../images/brand/logo_dropbox.svg" alt="" title="Dropbox" className="mx-3" style={{"width" : "40px"}}/>
                        <img src="../images/brand/logo_exchange.svg" alt="" title="Exchange" className="mx-3" style={{"width" : "40px"}}/>
                        <img src="../images/brand/logo_sharepoint.svg" alt="" title="SharePoint" className="mx-3" style={{"width" : "40px"}}/>
                        <img src="../images/brand/logo_wordpress.svg" alt="" title="Wordpress" className="mx-3" style={{"width" : "40px"}}/>
                        <img src="../images/brand/logo_onedrive.svg" alt="" title="One-drive" className="mx-3" style={{"width" : "40px"}}/>
                        <img src="../images/brand/logo_postgre.svg" alt="" title="Postgres" className="mx-3" style={{"width" : "40px"}}/>
                        <img src="../images/brand/logo_mysql.svg" alt="" title="MySQL" className="mx-3" style={{"width" : "40px"}}/>
                    </div>
                </div>
            </div>
        );
    }
}
