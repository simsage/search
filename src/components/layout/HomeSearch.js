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
            my_error_message: 'default error message'
        }
    }
    render() {
        if (this.state.has_error) {
            return <h1>HomeSearch.js: Something went wrong.</h1>;
        }
        return (
            <div className="h-100 d-flex justify-content-center align-items-center">
                <div className="d-flex flex-column justify-content-center align-items-center pb-5">
                    <img src="images/brand/simsage-logo-no-strapline.svg" alt="" style={{"width" : "200px"}}/>
                    <div className="nav-search-container d-flex align-items-center position-relative mb-4">
                        <span className="nav-search-icon ms-2 d-flex align-items-center">
                            <img src="../images/icon/icon_n-search.svg" alt="search"/>
                        </span>
                        <input type="text" className="nav-search-input ps-1 pe-3" id="simsage-search-text" autocomplete="off" placeholder="SimSage Search..."/>
                        <div className="d-none recents-menu end-0 position-absolute">
                            <ul className="more-list"></ul>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center mb-5">
                        <img src="../images/icon/icon_fi-image.svg" alt="" className="mx-1" style={{"width" : "60px"}}/>
                        <img src="../images/icon/icon_fi-pdf.svg" alt="" className="mx-1" style={{"width" : "60px"}}/>
                        <img src="../images/icon/icon_fi-code.svg" alt="" className="mx-1" style={{"width" : "60px"}}/>
                        <img src="../images/icon/icon_fi-system.svg" alt="" className="mx-1" style={{"width" : "60px"}}/>
                        <img src="../images/icon/icon_fi-text.svg" alt="" className="mx-1" style={{"width" : "60px"}}/>
                        <img src="../images/icon/icon_fi-presentation.svg" alt="" className="mx-1" style={{"width" : "60px"}}/>
                        <img src="../images/icon/icon_fi-audio.svg" alt="" className="mx-1" style={{"width" : "60px"}}/>
                        <img src="../images/icon/icon_fi-spreadsheet.svg" alt="" className="mx-1" style={{"width" : "60px"}}/>
                    </div>
                </div>
            </div>
        );
    }
}
