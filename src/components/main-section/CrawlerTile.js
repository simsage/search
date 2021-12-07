import React, {Component} from 'react';

import Api from "../../common/api";

/**
 * this is the crawler tile
 */
export class CrawlerTile extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    render() {
        if (this.state.has_error) {
            return <h1>crawler-tile.js: Something went wrong.</h1>;
        }
        const type_str = Api.sourceTypeToIcon(this.props.type);
        return (
            <div className={(this.props.sideBarOpen ? "col-6" : "col-3") + " mb-3 px-2 transition no-select"}
                 onClick={() => {if (this.props.onSelectSource) this.props.onSelectSource()}}>
                <div className="crawler-tile d-flex flex-column" title={this.props.name}>
                    <div className="crawler-preview d-flex justify-content-center align-items-center pt-4">
                        <img src={"../images/icon/icon_ci-" + type_str + ".svg"} alt={type_str} className="crawler-icon" />
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-3">
                        <div className="d-flex flex-column px-3 pb-3 text-start">
                            <label className="crawler-label mb-0">{this.props.name}</label>
                            <p className="crawler-meta mb-2">Web Crawler</p>
                            <p className="crawler-meta mb-0">Contains <i className="fw-bold">{this.props.num_documents}</i> Documents</p>
                            {this.props.last_crawled &&
                            <p className="crawler-meta mb-0">Last Crawled at <i
                                className="fw-bold">{Api.unixTimeConvert(this.props.last_crawled)}</i></p>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
