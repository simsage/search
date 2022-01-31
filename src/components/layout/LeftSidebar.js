import React, {Component} from 'react';

import '../../css/layout/left-sidebar.css';
import {CrawlerTree} from "../left-sidebar/CrawlerTree";

export default class LeftSidebar extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            my_error_title: 'default error title',
            my_error_message: 'default error message',
        }
    }
    newDropdown(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.onToggleNewMenu) this.props.onToggleNewMenu();
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    onNewFolder(e, is_top_level) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.onNewFolder && this.props.breadcrumbList) {
            const breadcrumb_list = this.props.breadcrumbList;
            if (breadcrumb_list.length > 0) {
                const parent_item = breadcrumb_list[breadcrumb_list.length - 1];
                if (is_top_level) {
                    const newSourceName = window.prompt("New source name");
                    if (newSourceName && newSourceName.trim().length > 0)
                        this.props.onNewSource(newSourceName.trim());
                } else {
                    const newFolderName = window.prompt("New folder name");
                    if (parent_item && newFolderName && newFolderName.trim().length > 0)
                        this.props.onNewFolder(parent_item, newFolderName.trim());
                }
            }
        }
    }
    render() {
        if (this.state.has_error) {
            return <h1>sidebar.js: Something went wrong.</h1>;
        }
        const is_top_level = this.props.breadcrumbList && this.props.breadcrumbList.length === 1;
        const show_locks = this.props.show_locks;
        const show_subscribed = this.props.show_subscribed;
        const other_selection = show_locks || show_subscribed;
        const top_level_active = this.props.selected_source === null && !other_selection;
        const file_ul_disabled = this.props.has_files_for_upload || is_top_level;
        const disabled = this.props.disabled;
        return (
            <div className="sidebar no-select">
                <div className="sb-logo d-flex justify-content-center align-items-center">
                    <img src="/images/brand/simsage-logo-no-strapline.svg" alt="" className="h-75" />
                </div>
                <div className="sb-upload mx-3 d-flex align-items-center position-relative">
                    <div className={((this.props.show_new_menu && !disabled) ? "d-block" : "d-none") +" new-inline-menu start-0 position-absolute"}>
                        <ul className="more-list">
                            { (file_ul_disabled || disabled ) &&
                            <li className="more-list-items px-3 py-3 d-flex align-items-center">
                                <img src="../images/icon/icon_ls-file-upload.svg" alt=""
                                     className="sb-icon-dropdown me-2 disabled"/>
                                <img src="../images/icon/icon_ls-file-upload-active.svg" alt=""
                                     className="sb-icon-dropdown-active me-2"/>
                                <span className="menu-disabled-text">File Upload</span>
                            </li>
                            }
                            {disabled &&
                            <li className="more-list-items px-3 py-3 d-flex align-items-center">
                                <img src="../images/icon/icon_ls-new-folder.svg" alt=""
                                     className="sb-icon-dropdown me-2"/>
                                <img src="../images/icon/icon_ls-new-folder-active.svg" alt=""
                                     className="sb-icon-dropdown-active me-2"/>
                                <span className="menu-disabled-text">{is_top_level ? "New Source" : "New Folder"}</span>
                            </li>
                            }
                            {!disabled &&
                            <li className="more-list-items px-3 py-3 d-flex align-items-center"
                                onClick={(e) => this.onNewFolder(e, is_top_level)}>
                                <img src="../images/icon/icon_ls-new-folder.svg" alt=""
                                     className="sb-icon-dropdown me-2"/>
                                <img src="../images/icon/icon_ls-new-folder-active.svg" alt=""
                                     className="sb-icon-dropdown-active me-2"/>
                                {is_top_level ? "New Source" : "New Folder"}
                            </li>
                            }
                        </ul>
                    </div>
                </div>
                <ul className="sb-nav ps-0">
                    {top_level_active &&
                    <li className={"sb-item d-flex align-items-center px-4 py-2 active"}>
                        <img src="../images/icon/icon_ls-source.svg" alt="" className="me-2 sb-icon"/>
                        <label>Source</label>
                    </li>
                    }
                    {!top_level_active &&
                    <li className={"sb-item d-flex align-items-center px-4 py-2"}
                        onClick={() => {if (this.props.onSelectRoot) this.props.onSelectRoot()}}>
                        <img src="../images/icon/icon_ls-source.svg" alt="" className="me-2 sb-icon"/>
                        <label>Source</label>
                    </li>
                    }

                    <CrawlerTree
                        onSelectSource={(source_id) => {if (this.props.onSelectSource) this.props.onSelectSource(source_id)}}
                        selected_source={other_selection ? null : this.props.selected_source}
                        crawlerList={this.props.crawlerList} />

                    <li className={"sb-item d-flex align-items-center px-4 py-2" + (show_subscribed ? " active" : "")}
                        onClick={() => {if (this.props.onShowSubscriptions) this.props.onShowSubscriptions()}}>
                        <img src="../images/icon/icon_ls-favourite.svg" alt="" className="me-2 sb-icon" />
                        <label>Subscribed</label>
                    </li>
                    <li className={"sb-item d-flex align-items-center px-4 py-2" + (show_locks ? " active": "")}
                        onClick={() => {if (this.props.onShowLocks) this.props.onShowLocks()}}>
                    <img src="../images/icon/icon_ls-locked.svg" alt="" className="me-2 sb-icon" />
                        <label>Locked</label>
                    </li>

                </ul>
            </div>
        );
    }
}
