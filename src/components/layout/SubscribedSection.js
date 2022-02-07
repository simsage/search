import React, {Component} from 'react';
import {FolderTile} from "../main-section/FolderTile";
import {FileTile} from "../main-section/FileTile";
import {FolderRow} from "../main-section/FolderRow";
import {FileRow} from "../main-section/FileRow";

import '../../css/layout/main-section.css';

/**
 * this is the SubscribedSection
 */
export default class SubscribedSection extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            my_error_title: 'default error title',
            my_error_message: 'default error message',
        }
    }

    getFolders() {
        let folders = [];
        if (this.props.subscription_list && this.props.subscription_list.length){
            folders = this.props.subscription_list
                .filter(function (file) { return file.isFolder })

        }
        return folders;
    }
    getFiles() {
        let files = [];
        if (this.props.subscription_list && this.props.subscription_list.length){
            files = this.props.subscription_list.filter(function (file){ return !file.isFolder})
        }
        return files;
    }

    // switch views - and open the right side-bar for viewing its info
    onFocus(item) {
        if (item && item.url && item.urlId && item.sourceId && this.props.onFocus) {
            this.props.onFocus(item.sourceId, item.url, item.urlId);
        }
    }

    switchView() {
        if (this.props.onChangeView)
            this.props.onChangeView();
    }


    render() {
        const subscription_set = this.props.subscription_set ? this.props.subscription_set : {};
        const checkout_set = this.props.checkout_set ? this.props.checkout_set : {};

        if (this.state.has_error) {
            return <h1>subscribed-section.js: Something went wrong.</h1>;
        }
        return (
            <div className={(this.props.sideBarToggled ? "sec-toggled" : "sec-not-toggled") + " section"}>
                <div className="sec-topbar py-2 px-4 d-flex justify-content-between align-items-center">
                    <div className="sec-breadcrumb d-flex align-items-center small no-select">
                        <span>
                            <span className="px-2 mx-1 bc-link active">Subscribed</span>
                        </span>
                    </div>

                    <div className="sec-functions">
                        <button className="btn sec-btn" onClick={() => this.switchView()}>
                            <img src={(!this.props.show_grid ? "../images/icon/icon_ms-grid-view.svg" : "../images/icon/icon_ms-list-view.svg")} alt="" className="" />
                        </button>
                    </div>
                </div>

                {/* GRID VIEW */}
                <div className={(this.props.show_grid ? "d-block" : "d-none") + " pt-3 pb-5 tile-container"}>
                    {/* Folder */}
                    <div className={(this.props.sideBarToggled ? "px-3" : "px-4") + " folder-container"}>
                        <div className="container-fluid text-start">
                            <div className="row">
                                 {
                                    this.getFolders().map((folder, i) => {
                                        const key = folder.sourceId + ":" + folder.url;
                                        return (<FolderTile key={i} onSelectFolder={() => {if (this.props.onSelectFolder) this.props.onSelectFolder(folder)}}
                                            sideBarOpen={this.props.sideBarToggled}
                                            name={folder.name}
                                            folder={folder}
                                            onShowMenu={(item) => {if (this.props.onShowMenu) this.props.onShowMenu(item)}}
                                            subscribed={subscription_set[key] ? subscription_set[key] : false}
                                            onSubscribe={(folder) => {if (this.props.onSubscribe) this.props.onSubscribe(folder)}}
                                            onUnsubscribe={(folder) => {if (this.props.onUnsubscribe) this.props.onUnsubscribe(folder)}}
                                            onRename={(folder, new_name) => {if (this.props.onRename) this.props.onRename(folder, new_name)}}
                                            onDelete={(folder) => {if (this.props.onDelete) this.props.onDelete(folder)}}
                                        />)
                                    })
                                }
                            </div>
                        </div>
                    </div>

                    {/* File */}
                    <div className={(this.props.sideBarToggled ? "px-3" : "px-4") + " file-container"}>
                        <div className="container-fluid text-start">
                            <div className="row">
                                 {
                                    this.getFiles().map((file, i) => {
                                        const key = file.sourceId + ":" + file.url;
                                        return (<FileTile key={i}
                                            focusOnFile={(file) => this.onFocus(file)}
                                            isSelected={this.props.selected_file && this.props.selected_file.url === file.url}
                                            sideBarOpen={this.props.sideBarToggled}
                                            file={file}
                                            subscribed={subscription_set[key] ? subscription_set[key] : false}
                                            onShowMenu={(item) => {if (this.props.onShowMenu) this.props.onShowMenu(item)}}
                                            onSubscribe={(folder) => {if (this.props.onSubscribe) this.props.onSubscribe(folder)}}
                                            onUnsubscribe={(folder) => {if (this.props.onUnsubscribe) this.props.onUnsubscribe(folder)}}
                                            onRename={(file, new_name) => {if (this.props.onRename) this.props.onRename(file, new_name)}}
                                            locked={checkout_set[key]}
                                            onLock={(file) => {if (this.props.onLock) this.props.onLock(file)}}
                                            onUnlock={(file) => {if (this.props.onUnlock) this.props.onUnlock(file)}}
                                            onDownload={(file) => {if (this.props.onDownload) this.props.onDownload(file)}}
                                            onDelete={(file) => {if (this.props.onDelete) this.props.onDelete(file)}}
                                        />)
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLE VIEW */}
                <div className={(!this.props.show_grid ? "d-block" : "d-none") + " table-container"}>
                    <div className={(this.props.sideBarToggled ? "px-3" : "px-4") + " pt-3 pb-5 table-contents table-responsive"}>
                        <table className="table text-start sim-hover align-middle mb-0">
                            <thead>
                                    <tr>
                                        <th scope="col" className="text-nowrap" />
                                        <th scope="col" className="text-nowrap ps-2 pe-5">Name</th>
                                        {/*<th scope="col" className={(this.props.sideBarToggled ? "px-3" : "px-5") + " text-nowrap"}>Owner</th>*/}
                                        <th scope="col" className={(this.props.sideBarToggled ? "px-3" : "px-5") + " text-nowrap"}>Last Modified</th>
                                        <th scope="col" className={(this.props.sideBarToggled ? "px-3" : "px-5") + " text-nowrap"}>File Size</th>
                                        <th scope="col" className="text-nowrap" />
                                    </tr>
                            </thead>
                            <tbody>

                            {
                                    this.getFolders().map((folder, i) => {
                                        const key = folder.sourceId + ":" + folder.url;
                                        return (<FolderRow key={i} onSelectFolder={() => {if (this.props.onSelectFolder) this.props.onSelectFolder(folder)}}
                                            sideBarOpen={this.props.sideBarToggled}
                                            name={folder.name}
                                            owner={folder.owner}
                                            folder={folder}
                                            lastModified={folder.last_modified} 
                                            subscribed={subscription_set[key] ? subscription_set[key] : false}
                                            onShowMenu={(item) => {if (this.props.onShowMenu) this.props.onShowMenu(item)}}
                                            onSubscribe={(folder) => {if (this.props.onSubscribe) this.props.onSubscribe(folder)}}
                                            onUnsubscribe={(folder) => {if (this.props.onUnsubscribe) this.props.onUnsubscribe(folder)}}
                                            onRename={(folder, new_name) => {if (this.props.onRename) this.props.onRename(folder, new_name)}}
                                            onDelete={(folder) => {if (this.props.onDelete) this.props.onDelete(folder)}}
                                        />)
                                    })
                                }

                                {
                                    this.getFiles().map((file, i) => {
                                        const key = file.sourceId + ":" + file.url;
                                        return (<FileRow key={i}
                                                    focusOnFile={(file) => this.onFocus(file)}
                                                    isSelected={this.props.selected_file && this.props.selected_file.url === file.url}
                                                    sideBarOpen={this.props.sideBarToggled}
                                                    file={file}
                                                    selected_file={this.props.selected_file}
                                                    subscribed={subscription_set[key] ? subscription_set[key] : false}
                                                    onShowMenu={(item) => {if (this.props.onShowMenu) this.props.onShowMenu(item)}}
                                                    onSubscribe={(file) => {if (this.props.onSubscribe) this.props.onSubscribe(file)}}
                                                    onUnsubscribe={(file) => {if (this.props.onUnsubscribe) this.props.onUnsubscribe(file)}}
                                                    onRename={(file, new_name) => {if (this.props.onRename) this.props.onRename(file, new_name)}}
                                                    locked={checkout_set[key]}
                                                    onLock={(file) => {if (this.props.onLock) this.props.onLock(file)}}
                                                    onUnlock={(file) => {if (this.props.onUnlock) this.props.onUnlock(file)}}
                                                    onDownload={(file) => {if (this.props.onDownload) this.props.onDownload(file)}}
                                                    onDelete={(file) => {if (this.props.onDelete) this.props.onDelete(file)}}
                                                />)
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}
