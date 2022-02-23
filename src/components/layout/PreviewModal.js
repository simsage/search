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
            my_error_message: 'default error message',
            prevY: 0, // infinite scrolling
        }
    }

    componentDidMount() {
        // always load the first page
        this.getHtmlPage(1, () => {
            // set up the infinite scrolling callback AFTER the first item has loaded
            let options = {
                root: null,
                rootMargin: "0px",
                threshold: 1.0
            };
            this.observer = new IntersectionObserver(
                this.handleObserver.bind(this),
                options
            );
            this.observer.observe(this.loadingRef);
        });
    }

    // handle infinite scrolling of previews
    handleObserver(entities, observer) {
        const y = entities[0].boundingClientRect.y;
        if (this.state.prevY > y || this.state.prevY === 0) {
            const preview_data = this.props.preview_page_list && this.props.preview_page_list.length > 0 ? this.props.preview_page_list[0] : null;
            if (preview_data && preview_data.numPages > 1) {
                let current_page = this.props.preview_page_list.length;
                let num_pages = preview_data.numPages;
                if (current_page <= num_pages && (current_page + 1) > this.props.preview_page_list.length) {
                    current_page += 1;
                    this.getHtmlPage(current_page);
                }
            }
        }
        this.setState({ prevY: y });
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
    getHtmlPage(page, on_success) {
        console.log("LOAD PAGE", page);
        const item = this.props.search_focus;
        const urlId = item && item.urlId ? item.urlId : 0;
        if (item && urlId > 0 && this.props.get_html_preview && page > 0) {
            this.props.get_html_preview(item, page, on_success);
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
        console.log("Preview Modal")
        if (this.state.has_error) {
            return <h1>modal.js: Something went wrong.</h1>;
        }
        const item = this.props.search_focus;
        const filename = item && item.filename ? item.filename : "";
        const url = item && item.url ? item.url : "";

        const preview_page_list = this.props.preview_page_list;
        const preview_data = preview_page_list && preview_page_list.length > 0 ? preview_page_list[0] : null;

        let w = preview_data && preview_data.width ? (preview_data.width) : 0;
        let h = preview_data && preview_data.height ? (preview_data.height) : 0;

        // the size of the possible i-frame is 60% of the screen-size with a minimum size of 1024x768 (defined in settings.js)
        const scaling = 0.6;
        const max_width = Math.max(Math.round(window.innerWidth * scaling), window.ENV.preview_min_width);
        const max_height = Math.max(Math.round(window.innerHeight * scaling), window.ENV.preview_min_height);

        // get the metadata
        const metadata_lists = Api.getMetadataLists(item && item.metadata ? item.metadata : {});
        // const tag_list = metadata_lists["tag_list"];
        const metadata_list = metadata_lists["metadata_list"];

        // get a scale factor for the width and height
        let scale = 1.0;
        if (w > 0 && w > h) {
            // wider than taller
            scale = max_width / w;
        } else if (h > 0 && h > w) {
            scale = max_height / h;
        }
        w = Math.round(w) + "px";
        const parent_height = (Math.round(h * scale) + 10) + "px";
        h = Math.round(h) + "px";

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
                            <button className="btn pre-btn ms-2">
                                <img src="../images/icon/icon_im-close-white.svg" alt="close" title="close" onClick={() => this.onClose()} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="container-fluid px-0 mx-0 h-100 overflow-hidden">
                    <div className="row mx-0 h-100">
                        <div className="col-9 justify-content-center h-100 overflow-auto preview-cont">
                            <div className="w-100 h-100" style={{"marginTop" : "6rem", "marginBottom" : "6rem"}}>
                                {preview_page_list && preview_page_list.map((preview_data, i) => {
                                    return (
                                            <div className="d-flex justify-content-center" key={i} style={{height: parent_height}}>
                                                <iframe title="preview" className="rounded-3" srcDoc={preview_data.html} width={w} height={h} style={{"transform": "scale(" + scale + ")", "transformOrigin": "center top"}}
                                                        frameBorder="0" scrolling="no" />
                                            </div>
                                            )
                                })}

                                { /* infinite scrolling */ }
                            <div ref={loadingRef => (this.loadingRef = loadingRef)} />

                            </div>
                        </div>
                        <div className="col-3 overflow-auto h-100 preview-cont" style={{"background": "#20273180", "borderTopLeftRadius": "0.3rem"}}>
                            <div className="text-light fw-lighter ps-4 pe-3" style={{"marginTop" : "6rem", "marginBottom" : "6rem"}}>
                                Metadata
                                <br/><br/>
                                {
                                    metadata_list && metadata_list.map((item, i) => {
                                        return (<div key={i} className="metadata-item">
                                                    <div className="metadata-key">{item.key}</div>
                                                    <div className="metadata-value">{item.value}</div>
                                                </div>)
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
