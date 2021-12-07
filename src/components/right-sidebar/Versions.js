import React, {Component} from 'react';
import Api from "../../common/api";

/**
 * this is the Versions
 */
export class Versions extends Component {
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
            return <h1>versions.js: Something went wrong.</h1>;
        }
        const version_list = this.props.version_list ? this.props.version_list : [];
        let count_down = 0;
        if (version_list && version_list.length) {
            count_down = version_list.length + 1;
        }
        return (<div>
            {
                version_list.map((version, i) => {
                    count_down -= 1;
                    return (
                        <div className="container-fluid h-100" key={i}>
                            <div className="py-1 d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center me-5">
                                    <div className="version-tag me-2 pointer-cursor py-1" title={"download version " + count_down}
                                        onClick={() => {if (this.props.onDownloadVersion) this.props.onDownloadVersion(version)}}>
                                        <img src="../images/icon/icon_rs-download.svg" alt="" className="download-icon me-1" />
                                        <p className="mb-0">Version {count_down}</p>
                                    </div>
                                    {
                                        i === 0 &&
                                        <p className="mb-0 owner-tag">(current)</p>
                                    }
                                </div>
                                <p className="mb-0 comments-time fw-light">{Api.unixTimeConvert(version.created)}</p>
                            </div>
                        </div>
                    );
                })
            }
        </div>);
        
    }
}
