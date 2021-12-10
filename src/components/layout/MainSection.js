import React, {Component} from 'react';

import '../../css/layout/main-section.css';
import '../../css/layout/file-uploader.css';
import {Breadcrumb} from "../main-section/breadcrumb";
import {CrawlerTile} from "../main-section/CrawlerTile";
import {FolderTile} from "../main-section/FolderTile";
import {FileTile} from "../main-section/FileTile";
import {CrawlerRow} from "../main-section/CrawlerRow";
import {FolderRow} from "../main-section/FolderRow";
import {FileRow} from "../main-section/FileRow";


export default class MainSection extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            my_error_title: 'default error title',
            my_error_message: 'default error message',
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    getCrawlers() {
        if (this.props.crawlerList && this.props.crawlerList.length)
            return this.props.crawlerList;
        return [];
    }
    getFolders() {
        if (this.props.folderList && this.props.folderList.length)
            return this.props.folderList;
        return [];
    }
    getFiles() {
        if (this.props.fileList && this.props.fileList.length)
            return this.props.fileList;
        return [];
    }

    switchView() {
        if (this.props.onChangeView)
            this.props.onChangeView();
    }

    render() {
        if (this.state.has_error) {
            return <h1>section.js: Something went wrong.</h1>;
        }
        const subscription_set = this.props.subscription_set ? this.props.subscription_set : {};
        const checkout_set = this.props.checkout_set ? this.props.checkout_set : {};

        return (
            <div className={(this.props.sideBarToggled ? "sec-toggled" : "sec-not-toggled") + " section"}>
                <div className="sec-topbar py-2 px-4 d-flex justify-content-between align-items-center">
                    <Breadcrumb
                        onSelectRoot={() => {if (this.props.onSelectRoot) this.props.onSelectRoot()}}
                        onSelectSource={(source_id) => {if (this.props.onSelectSource) this.props.onSelectSource(source_id)}}
                        onSelectFolder={(folder) => {if (this.props.onSelectFolder) this.props.onSelectFolder(folder)}}
                        onNewFolder={(parent_item, folder_name) => {if (this.props.onNewFolder) this.props.onNewFolder(parent_item, folder_name)}}
                        breadcrumbList={this.props.breadcrumbList} />
                    <div className="sec-functions">
                        <button className="btn sec-btn" onClick={() => this.switchView()}>
                            <img src={(!this.props.show_grid ? "../images/icon/icon_ms-grid-view.svg" : "../images/icon/icon_ms-list-view.svg")} alt="" className="" />
                        </button>
                    </div>
                </div>

                <div className={(this.props.show_grid ? "d-block" : "d-none") + " pt-3 pb-5 tile-container"}>

                {/* Crawler */}
                {/* Show on 'Source' tab. Haven't done a table row version yet */}
                {this.props.breadcrumbList.length === 1 &&
                <div className={(this.props.sideBarToggled ? "px-3" : "px-4") + " crawler-container mt-2"}>
                    <div className="container-fluid">
                        <div className="row">
                            {
                                this.getCrawlers().map((crawler, i) => {
                                    return (<CrawlerTile key={i}
                                                sideBarOpen={this.props.sideBarToggled}
                                                onSelectSource={() => {if (this.props.onSelectSource) this.props.onSelectSource(crawler.sourceId)}}
                                                source={crawler}
                                                onShowMenu={(item) => {if (this.props.onShowMenu) this.props.onShowMenu(item)}}
                                                onDelete={(item) => { if (this.props.onDeleteSource) this.props.onDeleteSource(item)}}
                                                num_documents={crawler.contentList.length}
                                                last_crawled={crawler.endTime}
                                            />);
                                })
                            }
                        </div>
                    </div>
                </div>
                }

                {/* Folder */}
                <div className={(this.props.sideBarToggled ? "px-3" : "px-4") + " folder-container"}>
                    <div className="container-fluid text-start">
                        <label className={(this.props.folderList.length === 0 ? "d-none" : "") + " sm-label mb-1 mt-2"}>Folders</label>
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
                        <label className={(this.props.fileList.length === 0 ? "d-none" : "") + " sm-label mb-1 mt-2"}>Files</label>
                        <div className="row">
                            {
                                this.getFiles().map((file, i) => {
                                    const key = file.sourceId + ":" + file.url;
                                    return (<FileTile key={i}
                                        focusOnFile={(file) => {if (this.props.focusOnFile) this.props.focusOnFile(file)}}
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

                <div className={(!this.props.show_grid ? "d-block" : "d-none") + " table-container"}>
                    <div className={(this.props.sideBarToggled ? "px-3" : "px-4") + " pt-3 pb-5 table-contents table-responsive"}>
                        <table className="table text-start sim-hover align-middle mb-0">
                            <thead>
                                {this.props.breadcrumbList.length > 1 &&
                                    <tr>
                                        <th scope="col" className="text-nowrap" />
                                        <th scope="col" className="text-nowrap ps-2 pe-5">Name</th>
                                        {/*<th scope="col" className={(this.props.sideBarToggled ? "px-3" : "px-5") + " text-nowrap"}>Owner</th>*/}
                                        <th scope="col" className={(this.props.sideBarToggled ? "px-3" : "px-5") + " text-nowrap"}>Last Modified</th>
                                        <th scope="col" className={(this.props.sideBarToggled ? "px-3" : "px-5") + " text-nowrap"}>File Size</th>
                                        <th scope="col" className="text-nowrap" />
                                    </tr>
                                }
                                {this.props.breadcrumbList.length === 1 &&
                                    <tr>
                                        <th scope="col" className="text-nowrap" />
                                        <th scope="col" className="text-nowrap ps-2 pe-5">Name</th>
                                        {/* <th scope="col" className={(this.props.sideBarToggled ? "px-3" : "px-5") + " text-nowrap"}>Owner</th> */}
                                        <th scope="col" className={(this.props.sideBarToggled ? "px-3" : "px-5") + " text-nowrap"}>Contains</th>
                                        <th scope="col" className={(this.props.sideBarToggled ? "px-3" : "px-5") + " text-nowrap"}>Last Crawled</th>
                                    </tr>
                                }
                            </thead>
                            <tbody>
                                {this.props.breadcrumbList.length === 1 && 
                                    this.getCrawlers().map((crawler, i) => {
                                        return (<CrawlerRow key={i}
                                            sideBarOpen={this.props.sideBarToggled}
                                            onShowMenu={(item) => {if (this.props.onShowMenu) this.props.onShowMenu(item)}}
                                            onSelectSource={() => {if (this.props.onSelectSource) this.props.onSelectSource(crawler.sourceId)}}
                                            type={crawler.itemType}
                                            name={crawler.name}
                                            num_documents={crawler.contentList.length}
                                            last_crawled={crawler.endTime}
                                        />);
                                    }) 
                                }

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
                                            focusOnFile={(file) => {if (this.props.focusOnFile) this.props.focusOnFile(file)}}
                                            isSelected={this.props.selected_file && this.props.selected_file.url === file.url}
                                            sideBarOpen={this.props.sideBarToggled}
                                            file={file}
                                            name={file.name}
                                            type={file.itemType}
                                            preview={file.preview}
                                            owner={file.owner}
                                            lastModified={file.last_modified} 
                                            fileSize={file.file_size}
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
