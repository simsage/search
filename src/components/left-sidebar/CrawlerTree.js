import React, {Component} from 'react';

/**
 * this is the tree sub-list of crawler names in the side nav-bar
 */
export class CrawlerTree extends Component {
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
    getSources() {
        if (this.props.crawlerList && this.props.crawlerList.length)
            return this.props.crawlerList;
        return [];
    }
    render() {
        if (this.state.has_error) {
            return <h1>crawler-tree.js: Something went wrong.</h1>;
        }
        const selected_source = this.props.selected_source;
        return (
            <ul className="sb-nav ps-0">
                {
                    this.getSources().map( (source, i) => {
                        const is_selected = (selected_source && selected_source.sourceId === source.sourceId);
                        const isLast = (i + 1) === this.getSources().length;
                        if (isLast) {
                            return (
                                <li key={i} className={"sb-item d-flex align-items-center ps-5 pe-4 py-2 position-relative" + (is_selected ? " active" : "")}
                                    onClick={() => {if (this.props.onSelectSource) this.props.onSelectSource(source.sourceId)}}>
                                    <img src="../images/icon/branch-2.svg" alt="" className="me-2 sb-branch" />
                                    {/* <img src="../images/icon/icon_ls-crawler.svg" alt="" className="me-2 sb-icon" /> */}
                                    <label className="ms-1">{source.name}</label>
                                </li>
                            )
                        } else {
                            return (
                                <li key={i} className={"sb-item d-flex align-items-center ps-5 pe-4 py-2 position-relative" + (is_selected ? " active" : "")}
                                    onClick={() => {if (this.props.onSelectSource) this.props.onSelectSource(source.sourceId)}}>
                                    <img src="../images/icon/branch-1.svg" alt="" className="me-2 sb-branch" />
                                    {/* <img src="../images/icon/icon_ls-crawler.svg" alt="" className="me-2 sb-icon" /> */}
                                    <label className="ms-1">{source.name}</label>
                                </li>
                            )
                        }
                    })
                }
            </ul>
        );
    }
}
