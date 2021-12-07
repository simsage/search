import React, {Component} from 'react';

/**
 * a breadcrumb item
 */
export class Breadcrumb extends Component {
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
    getBreadcrumbList() {
        if (this.props.breadcrumbList && this.props.breadcrumbList.length)
            return this.props.breadcrumbList;
        return [];
    }
    clickBreadcrumb(item, index) {
        if (index === 0 && this.props.onSelectRoot) {
            this.props.onSelectRoot();
        } else if (index === 1 && this.props.onSelectSource && item.source && item.source.sourceId) {
            this.props.onSelectSource(item.source.sourceId);
        } else if (this.props.onSelectFolder && item.folder) {
            this.props.onSelectFolder(item.folder);
        }
    }
    onNewFolder(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.onNewFolder && this.props.breadcrumbList) {
            const breadcrumb_list = this.props.breadcrumbList;
            if (breadcrumb_list.length > 0) {
                const parent_item = breadcrumb_list[breadcrumb_list.length - 1];
                const newFolderName = window.prompt("New folder name");
                if (parent_item && newFolderName && newFolderName.trim().length > 0)
                    this.props.onNewFolder(parent_item, newFolderName.trim());
            }
        }
    }
    render() {
        if (this.state.has_error) {
            return <h1>breadcrumb.js: Something went wrong.</h1>;
        }
        const list = this.getBreadcrumbList();
        return (
            <div className="sec-breadcrumb d-flex align-items-center small no-select">
                {
                    list.map( (item, i) => {
                        const isLast = (i + 1) === list.length;
                        if (isLast) {
                            return (<span key={i} onClick={() => this.clickBreadcrumb(item, i)}>
                                        <span className="px-2 mx-1 bc-link active">{item.name}</span>
                                    </span>)
                        } else {
                        return (<span key={i} onClick={() => this.clickBreadcrumb(item, i)}>
                                    <span className="px-2 py-1 mx-1 bc-link">{item.name}</span>
                                    <span className="bc-divider">/</span>
                                </span>)
                        }
                    })
                }
                {
                    list.length > 1 &&
                    <button className="btn btn-plus d-flex" onClick={(e) => this.onNewFolder(e)}>
                        <img src="../images/icon/icon_ms-plus.svg" alt="" />
                    </button>
                }
            </div>
        );
    }
}
