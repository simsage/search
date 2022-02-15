import React, {Component} from 'react';
import ReactDOM from 'react-dom';

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
            my_error_message: 'default error message',
            page: 1,
        }
    }

    componentDidMount() {
        this.getHtmlPage(this.state.page);
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
    getHtmlPage(page) {
        const item = this.props.search_focus;
        const urlId = item && item.urlId ? item.urlId : 0;
        if (item && urlId > 0 && this.props.get_html_preview && page > 0) {
            this.props.get_html_preview(item, page);
        }
    }
    pagePrev() {
        const page = this.state.page;
        if (page > 1) {
            this.setState({page: page - 1});
            this.getHtmlPage(page - 1);
        }
    }
    pageNext() {
        const page = this.state.page;
        this.setState({page: page + 1});
        this.getHtmlPage(page + 1);
    }
    render() {
        if (this.state.has_error) {
            return <h1>modal.js: Something went wrong.</h1>;
        }
        const item = this.props.search_focus;
        const filename = item && item.filename ? item.filename : "";
        const url = item && item.url ? item.url : "";
        const page = this.state.page;
        const preview_data = this.props.html_preview_data;
        const metadata_lists = Api.getMetadataLists(item && item.metadata ? item.metadata : {});
        const metadata_list = metadata_lists["metadata_list"];
        const w = preview_data && preview_data.width ? (preview_data.width)+"px" : "0px";
        const h = preview_data && preview_data.height ? (preview_data.height)+"px" : "0px";
        const num_pages = preview_data && preview_data.numPages ? preview_data.numPages : 0;
        return (
            <div className="d-flex justify-content-center align-items-top overflow-auto h-100 w-100">
                <div className="fixed-top text-white px-4 py-3" style={{"backgroundImage" : "linear-gradient(#202731ff, #20273100)"}}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="mb-0" style={{"textShadow" : "0 0 50px #202731"}} title={filename}>{filename}</h6>
                        </div>
                        <div className="d-flex">
                            <button className="btn dl-btn ms-2" onClick={() => this.download(url)} title={"download " + url}>
                                Download
                            </button>
                            {/*<button className="btn pre-btn ms-2">*/}
                            {/*    <img src="../images/icon/icon_im-more-white.svg" alt="" />*/}
                            {/*</button>*/}
                            <button className="btn pre-btn ms-2">
                                <img src="../images/icon/icon_im-close-white.svg" alt="close" title="close" onClick={() => this.onClose()} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-auto">
                    <div className="row justify-content-center" style={{"marginTop" : "4rem", "marginBottom" : "6rem"}}>
                        {preview_data && preview_data.width && preview_data.html && preview_data.height &&
                            <div className="col-7 bg-white p-0 my-5 rounded-3"
                                    style={{width: w, height: h}}>
                                <iframe srcDoc={preview_data.html} width={w} height={h}
                                        frameBorder="0" scrolling="no" />
                                <div>
                                    <button onClick={() => {if (page > 1) this.pagePrev()}}>prev</button>
                                    <button onClick={() => {if (page < num_pages) this.pageNext()}}>next</button>
                                </div>
                            </div>
                        }
                        {metadata_list && metadata_list.length > 0 &&
                            <div className="col-7 bg-white p-0 overflow-hidden my-5 rounded-3">
                                <div className="dialog-padding">
                                    <span className="metadata-header">metadata</span>
                                    {
                                        metadata_list.map((md, i) => {
                                            return (<div key={i}>
                                                <span className="key-style">{md.key}</span>
                                                <span className="value-style">{md.value}</span>
                                            </div>)
                                        })
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}
