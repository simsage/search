import React, {Component} from 'react';

import '../../css/layout/preview-modal.css';
import Api from "../../common/api";

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
    onClose() {
        if (this.props.onClose)
            this.props.onClose();
    }
    download(url) {
        if (url)
            window.open(url, "_blank");
    }
    getPreviewSource(item) {
        if (item && this.props.client_id && item.urlId) {
            return window.ENV.api_base + "/document/preview/" + window.ENV.organisation_id + "/" +
                window.ENV.kb_id + "/" + this.props.client_id + "/" + item.urlId + "/0"
        } else {
            return "";
        }
    }
    render() {
        if (this.state.has_error) {
            return <h1>modal.js: Something went wrong.</h1>;
        }
        const item = this.props.search_focus;
        const filename = item && item.filename ? item.filename : "";
        const url = item && item.url ? item.url : "";
        const preview_url = this.getPreviewSource(item);
        const metadata_lists = Api.getMetadataLists(item && item.metadata ? item.metadata : {});
        const tag_list = metadata_lists["tag_list"];
        const metadata_list = metadata_lists["metadata_list"];
        return (
            <div className="d-flex justify-content-center align-items-top overflow-auto h-100 w-100">
                <div className="fixed-top text-white px-5 py-3" style={{"background" : "#202731ee"}}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="mb-0" title={filename}>{filename}</h6>
                        </div>
                        <div className="d-flex">
                            <button className="btn ms-2 bg-white" onClick={() => this.download(url)} title={"download " + url}>
                                Download
                            </button>
                            <button className="btn sec-btn ms-2 bg-white">
                                <img src="../images/icon/icon_g-more.svg" alt="" />
                            </button>
                            <button className="btn sec-btn ms-2 bg-white">
                                <img src="../images/icon/icon_rs-close.svg" alt="close" title="close" onClick={() => this.onClose()} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="fixed-bottom">
                    hello
                </div>

                <div className="container overflow-auto">
                    <div className="row justify-content-center" style={{"margin-top" : "4rem", "margin-bottom" : "6rem"}}>
                        {preview_url &&
                            <div className="col-7 bg-white p-0 overflow-hidden my-5 rounded-3">
                                <img src={preview_url} alt="preview" className="w-100"/>
                            </div>
                        }
                        {metadata_list && metadata_list.length > 0 &&
                            <div className="col-7 bg-white p-0 overflow-hidden my-5 rounded-3 dialog-padding">
                                <span className="metadata-header">metadata</span>
                                {
                                    metadata_list.map((md, i) => {
                                        return (<div>
                                            <span className="key-style">{md.key}</span>
                                            <span className="value-style">{md.value}</span>
                                        </div>)
                                    })
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}
