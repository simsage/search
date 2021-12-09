import React, {Component} from 'react';

import Api from "../../common/api";

/**
 * this is the crawler row
 */
export class CrawlerRow extends Component {
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
            return <h1>crawler-row.js: Something went wrong.</h1>;
        }
        const type_str = Api.sourceTypeToIcon(this.props.type);
        const type_name = Api.sourceTypeToName(this.props.type);
        return (
            <tr className="crawler-row" onClick={() => {if (this.props.onSelectSource) this.props.onSelectSource()}}>
                <td className="py-2 pe-0 ps-3 favourite-col"></td>
                <td className="py-3 crawler-label name-col text-nowrap ps-2 pe-5">
                    <span className=" d-flex align-items-center">
                        <img src={"../images/icon/icon_ci-" + type_str + ".svg"} alt={type_name} title={type_name} className="crawler-icon me-2"/>
                        <div>
                        <p className="mb-0">{this.props.name}</p>
                        <p className="small mb-0 crawler-sm-desc" title={type_name}>{type_name}</p>
                        </div>
                    </span>
                </td>
                <td className={(this.props.sideBarOpen ? "px-3" : "px-5") + " py-2 crawler-sm-desc text-nowrap"}>{this.props.num_documents} documents</td>
                <td className={(this.props.sideBarOpen ? "px-3" : "px-5") + " py-2 crawler-sm-desc text-nowrap"}>{Api.unixTimeConvert(this.props.last_crawled)}</td>
                
            </tr>
        );
    }
}