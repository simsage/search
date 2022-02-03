import React, {Component} from 'react';

import '../../css/layout/preview-modal.css';

/**
 * this is the PreviewModal
 */
export default class PreviewModal extends Component {
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
            return <h1>modal.js: Something went wrong.</h1>;
        }
        return (
            <div className="d-flex justify-content-center align-items-top overflow-auto h-100 w-100">
                <div className="fixed-top text-white px-5 py-3" style={{"background" : "#202731ee"}}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="mb-0">Filename_document.pdf</h6>
                        </div>
                        <div className="d-flex">
                        <button className="btn ms-2 bg-white">
                                Download
                            </button>
                            <button className="btn sec-btn ms-2 bg-white">
                                <img src="../images/icon/icon_g-more.svg" alt="" />
                            </button>
                            <button className="btn sec-btn ms-2 bg-white">
                                <img src="../images/icon/icon_rs-close.svg" alt="" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="fixed-bottom">
                    hello
                </div>

                <div className="container overflow-auto">
                    <div className="row justify-content-center" style={{"margin-top" : "4rem", "margin-bottom" : "6rem"}}>
                        <div className="col-7 bg-white p-0 overflow-hidden my-5 rounded-3">
                            <img src="../images/test/coleholyoake_index.jpg" alt="" className="w-100" />
                        </div>
                        <div className="col-7 bg-white p-0 overflow-hidden my-5 rounded-3">
                            <img src="../images/icon/icon_fi-spreadsheet.svg" alt="" className="w-100" />
                        </div>
                        <div className="col-7 bg-white p-0 overflow-hidden my-5 rounded-3">
                            <img src="../images/icon/icon_fi-presentation.svg" alt="" className="w-100" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
