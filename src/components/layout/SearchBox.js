import React, {Component} from "react";


export default class SearchBox extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
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

    doUpdateText(text) {
        if (this.props.onUpdateSearchText)
            this.props.onUpdateSearchText(text)
    }

    render() {
        return (
            <div className={(!this.props.showSearchBar ? " justify-content-end col-12" : "justify-content-between col-11") + " d-flex align-items-center px-4"}>
                {this.props.showSearchBar &&
                    <div className="nav-search-container">
                        <div className="inner d-flex align-items-center position-relative add-another-float">
                            <span className="nav-search-icon ms-2 d-flex align-items-center">
                                <img src="../images/icon/icon_n-search.svg" alt="search"
                                     onClick={() => {
                                         if (this.props.onSearch) this.props.onSearch(this.prop.search_text)
                                     }}
                                />
                            </span>
                            <span className="search-bar">
                                <input type="text" className="nav-search-input ps-1 pe-3" id="simsage-search-text"
                                       onChange={(event) => {
                                           this.doUpdateText(event.target.value);
                                       }}
                                       autoFocus={true}
                                       onKeyDown={(event) => this.doSearch(event)}
                                       onBlur={() => {
                                           window.setTimeout(() => this.setState({show_recents: false}), 100)
                                       }}
                                       onClick={() => this.setState({show_recents: true})}
                                       autoComplete={"off"}
                                       value={this.props.search_text}
                                       placeholder="SimSage Search..."/>
                            </span>
                        </div>
                    </div>
                }
            </div>
        );
    }

}

