import React, {Component} from 'react';

import '../../css/layout/right-sidebar.css';
import {Metadata} from "../right-sidebar/Metadata.js";
import {Versions} from "../right-sidebar/Versions.js";
import {Activity} from "../right-sidebar/Activity.js";
import {Comments} from "../right-sidebar/Comments.js";
import Api from "../../common/api";

export default class RightSidebar extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            my_error_title: 'default error title',
            my_error_message: 'default error message',
            show_details: true,
            show_activity: false,
            show_comments: false,
            show_versions: false,
            show_dropdown: false,
            confirm_delete: true,
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    onShowData() {
        this.setState({show_details: true})
        this.setState({show_activity: false})
        this.setState({show_comments: false})
        this.setState({show_versions: false})
    }
    onShowActivity() {
        this.setState({show_details: false})
        this.setState({show_activity: true})
        this.setState({show_comments: false})
        this.setState({show_versions: false})
    }
    onShowComments() {
        this.setState({show_details: false})
        this.setState({show_activity: false})
        this.setState({show_comments: true})
        this.setState({show_versions: false})
    }
    onShowVersions() {
        this.setState({show_details: false})
        this.setState({show_activity: false})
        this.setState({show_comments: false})
        this.setState({show_versions: true})
    }
    moreDropdown() {
        if (this.state.show_dropdown) {
            this.setState({show_dropdown: false})
        }
        if (!this.state.show_dropdown) {
            this.setState({show_dropdown: true})
        }
    }
    onSubscribe(e,file){
        e.preventDefault();
        e.stopPropagation();
        if (file && file.url &&  this.props.onSubscribe) this.props.onSubscribe(file);
    }

    onUnSubscribe(e,file){
        e.preventDefault();
        e.stopPropagation();
        if (file && file.url && this.props.onUnsubscribe) this.props.onUnsubscribe(file);
    }

    onConfirmDelete(e, file) {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.confirm_delete) {
            this.setState({confirm_delete: false})
            this.change = setTimeout(() => {
                this.setState({confirm_delete: true})
            }, 2200)
        } else {
            this.setState({confirm_delete: false, show_dropdown: false});
            if (file && file.url) {
                if (this.props.onDelete) this.props.onDelete(file);
            }
        }
    }

    onRename(e, file, name) {
        e.preventDefault();
        e.stopPropagation();
        if (file && file.url) {
            const rename = window.prompt("Rename file to", name);
            if (rename && rename.trim() !== name.trim() && this.props.onRename) {
                this.props.onRename(file, rename);
            }
        }
        this.moreDropdown(e);
    }

    onLock(e, file) {
        e.preventDefault();
        e.stopPropagation();
        this.moreDropdown(e);
        if (file && file.url && this.props.onLock) {
            this.props.onLock(file);
        }
    }

    onUnlock(e, file) {
        e.preventDefault();
        e.stopPropagation();
        this.moreDropdown(e);
        if (file && file.url && this.props.onLock) {
            this.props.onUnlock(file);
        }
    }

    onDownload(e, file) {
        e.preventDefault();
        e.stopPropagation();
        this.moreDropdown(e);
        if (file && file.url && this.props.onDownload) {
            this.props.onDownload(file);
        }
    }

    getPreviewSource(item) {
        if (item && this.props.client_id && item.urlId) {
            return window.ENV.api_base + "/document/preview/" + window.ENV.organisation_id + "/" +
                window.ENV.kb_id + "/" + this.props.client_id + "/" + item.urlId + "/0"
        } else {
            return "";
        }
    }

    render() {
        if (this.state.has_error) {
            return <h1>toggled.js: Something went wrong.</h1>;
        }

        const version_list = this.props.file && this.props.file.versionList ? this.props.file.versionList : [];
        const comment_list = this.props.file && this.props.file.noteList ? this.props.file.noteList : [];
        const activity_list = this.props.file && this.props.file.activityList ? this.props.file.activityList : [];

        const name = (this.props.file && this.props.file.url) ? Api.getFilenameFromUrl(this.props.file.url) : "index.html";
        const preview_link = this.getPreviewSource(this.props.file);

        const key = (this.props.file) ? this.props.file.sourceId + ":" + this.props.file.url : null;
        const subscribed = (key != null && this.props.subscription_set[key]) ? this.props.subscription_set[key] : false;
        const locked = (key != null && this.props.checkout_set[key]) ? this.props.checkout_set[key] : false;

        return (
            <div className={(this.props.isOpen ? "toggled" : "not-toggled") + " d-flex flex-column justify-content-between focus-on-file text-start"}>
                <div className={this.state.show_details ? "tog-with-preview" : "tog-without-preview"}>
                    <div className="tog-header d-flex justify-content-between align-items-center px-4">
                        <h6 className="mb-0">{name}</h6>
                        <div className="d-flex">
                            {/* Header buttons */}
                            <div className="d-flex position-relative">
                                <button className="btn sec-btn ms-2" onClick={() => this.moreDropdown()}>
                                    <img src="../images/icon/icon_g-more.svg" alt="" className="" />
                                </button>
                                <div className={(this.state.show_dropdown ? "d-block" : "d-none") +" more-inline-menu end-0 position-absolute"}>
                                    <ul className="more-list">
                                        {/* Adds to Locked page + WIP how it is shown */}
                                        {(locked ?
                                        <li className="more-list-items px-3 py-2" onClick={(e) => this.onUnlock(e, this.props.file)}>Unlock</li>
                                            : <li className="more-list-items px-3 py-2" onClick={(e) => this.onLock(e, this.props.file)}>Lock</li>
                                        )}
                                            {/* Rename file - WIP how this is shown (NOT MVP?) */}
                                        {/*<li className="more-list-items px-3 py-2"*/}
                                        {/*    onClick={(e) => this.onRename(e, this.props.file, name)}>Rename</li>*/}

                                            {/* Downloads file */}
                                        <li className="more-list-items px-3 py-2"
                                            onClick={(e) => this.onDownload(e, this.props.file)}>Download</li>

                                            {/* Triggers confirmation to delete */}
                                        <li className={(this.state.confirm_delete ? "" : "confirm-delete") + " more-list-items px-3 py-2"}
                                            onClick={(e) => this.onConfirmDelete(e, this.props.file)}>
                                            {this.state.confirm_delete ? "Delete" : "Are you sure?"}
                                        </li>

                                    </ul>
                                </div>
                            </div>
                            {/*<button className="btn sec-btn ms-2">*/}
                            {/*    <img src="../images/icon/icon_rs-share.svg" alt="" className="" />*/}
                            {/*</button>*/}
                            <button className="btn sec-btn ms-2" onClick={(e)=>subscribed? this.onUnSubscribe(e,this.props.file) : this.onSubscribe(e,this.props.file)}>
                                <img src={subscribed ? "../images/icon/icon_rs-favourite-active.svg" : "../images/icon/icon_rs-favourite.svg"} alt="" className="" />
                            </button>
                            <button className="btn sec-btn ms-2" onClick={() => {if (this.props.onClose) this.props.onClose() && this.onShowData()}}>
                                <img src="../images/icon/icon_rs-close.svg" alt="" className="" />
                            </button>
                        </div>
                    </div>
                    <div className="tog-tabs container-fluid">
                        <div className="row">
                            <div className={(this.state.show_details ? "active" : "") + " col text-center pt-3 pb-1 small tab no-select"}
                                onClick={() => this.onShowData()}>
                                Data
                            </div>
                            <div className={(this.state.show_activity ? "active" : "") + " col text-center pt-3 pb-1 small tab no-select"}
                                onClick={() => this.onShowActivity()}>
                                Activity
                            </div>
                            <div className={(this.state.show_comments ? "active" : "") + " col text-center pt-3 pb-1 small tab no-select"}
                                onClick={() => this.onShowComments()}>
                                Comments
                            </div>
                            <div className={(this.state.show_versions ? "active" : "") + " col text-center pt-3 pb-1 small tab no-select"}
                                onClick={() => this.onShowVersions()}>
                                Versions
                            </div>
                        </div>
                    </div>
                    <div className={(this.state.show_details ? "d-block" : "d-none") + " tog-details px-4 pb-4 pt-3"}>
                        {/* <p className="text-danger small px-3">TEST - {this.props.file !== null ? this.props.file.name : ""} - Data</p> */}
                        <Metadata
                                onDownloadFile={(file) => {if (this.props.onDownloadFile) this.props.onDownloadFile(file)}}
                                onAddTag={(file, tag) => {if (this.props.onAddTag) this.props.onAddTag(file, tag)}}
                                onUpdateHashTags={(file, tag) => {if (this.props.onUpdateHashTags) this.props.onUpdateHashTags(file, tag)}}
                                selected_file={this.props.file} />
                    </div>
                    <div className={(this.state.show_activity ? "d-block" : "d-none") + " tog-activity ps-1"}>
                        {/* <p className="text-danger small px-3">TEST - {this.props.file !== null ? this.props.file.name : ""} - Activity</p> */}
                        <Activity
                            activity_list={activity_list} />
                    </div>
                    <div className={(this.state.show_comments ? "d-block" : "d-none") + " tog-comments ps-1"}>
                        {/* <p className="text-danger small px-3">TEST - {this.props.file !== null ? this.props.file.name : ""} - Comments</p> */}
                        <Comments
                            onRemoveComment={(file,id) => {if (this.props.onRemoveComment) this.props.onRemoveComment(file,id)}}
                            onAddComment={(file,text) => {if (this.props.onAddComment) this.props.onAddComment(file,text)}}
                            comment_list={comment_list}
                            selected_file={this.props.file} />
                    </div>
                    <div className={(this.state.show_versions ? "d-block" : "d-none") + " tog-versions ps-3 pe-4 pb-4 pt-3"}>
                        {/* <p className="text-danger small px-3">TEST - {this.props.file !== null ? this.props.file.name : ""} - Versions</p> */}
                        <Versions
                            onDownloadVersion={(version) => {if (this.props.onDownloadVersion) this.props.onDownloadVersion(this.props.file, version)}}
                            version_list={version_list} />
                    </div>
                </div>
                { this.state.show_details &&
                    <div className="tog-preview">
                        {/* {this.props.file.preview} */}
                        <img src={preview_link} alt="" className="w-100"/>
                    </div>
                }
            </div>
        );
    }
}
