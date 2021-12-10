import React, {Component} from 'react';
import App from "../../common/api";
import Api from "../../common/api";

/**
 * this is the file row
 */
export class FileRow extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            confirm_delete: true, // do we still need to confirm a delete before doing it?
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }

    showMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.onShowMenu && this.props.file)
            this.props.onShowMenu(this.props.file);
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

    onFocusFile(e, file) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.focusOnFile) this.props.focusOnFile(this.props.file);
    }

    onConfirmDelete(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.confirm_delete) {
            this.setState({confirm_delete: false})
            this.change = setTimeout(() => {
                this.setState({confirm_delete: true})
            }, window.ENV.delete_timeout_in_ms)
        } else {
            this.setState({confirm_delete: false});
            if (this.props.file && this.props.file.url) {
                if (this.props.onDelete) this.props.onDelete(this.props.file);
            }
        }
    }

    onRename(e, file) {
        e.preventDefault();
        e.stopPropagation();
        if (file && file.url) {
            const rename = window.prompt("Rename file to", file.name);
            if (rename && rename.trim() !== file.name.trim() && this.props.onRename) {
                this.props.onRename(file, rename);
            }
        }
    }

    onLock(e, file) {
        e.preventDefault();
        e.stopPropagation();
        if (file && file.url && this.props.onLock) {
            this.props.onLock(file);
        }
    }

    onUnlock(e, file) {
        e.preventDefault();
        e.stopPropagation();
        if (file && file.url && this.props.onLock) {
            this.props.onUnlock(file);
        }
    }

    onDownload(e, file) {
        e.preventDefault();
        e.stopPropagation();
        if (file && file.url && this.props.onDownload) {
            this.props.onDownload(file);
        }
    }

    render() {
        if (this.state.has_error) {
            return <h1>file-row.js: Something went wrong.</h1>;
        }

        let name = (this.props.file && this.props.file.name && this.props.file.name !== '/') ? this.props.file.name : "index.html";
        const url = (this.props.file && this.props.file.url) ? this.props.file.url : "";
        const type = (this.props.type) ? this.props.type : "";
        const show_menu = (this.props.file && this.props.file.show_menu);
        const file_size = this.props.file ? Api.formatSizeUnits(this.props.file.fileSize) : "";
        const last_modified = (this.props.file && this.props.file.lastModified > 0) ? Api.unixTimeConvert(this.props.file.lastModified) : "";

        return (
            <tr className={(this.props.isSelected ? "active" : "") + (this.props.locked ? " locked" : "") + " file-row"} onClick={() => {if (this.props.focusOnFile) this.props.focusOnFile(this.props.file)}}>
                <td className="py-2 pe-0 ps-3 favourite-col">
                    <span className={(this.props.subscribed ? "d-flex" : "d-none") + " w-100 justify-content-center"}>
                        <img src="../images/icon/icon_ms-favourite-row.svg" alt="" className="" />
                    </span>
                </td>
                <td className="py-2 file-label name-col text-nowrap ps-2 pe-5">
                    {/* <img src={this.props.isSelected ? "../images/icon/icon_ms-file2-active.svg" : "../images/icon/icon_ms-file2.svg"} alt="" className="file-icon me-2"/> */}
                    <img src={"../images/icon/icon_fi-" + (App.urlToType(type, url)) + (this.props.locked ? "-locked" : "") + ".svg"} alt="" className="file-icon" />
                    {name}
                </td>
                {/*<td className={(this.props.sideBarOpen ? "px-3" : "px-5") + " py-2 file-sm-desc text-nowrap"}>{this.props.owner}</td>*/}
                <td className={(this.props.sideBarOpen ? "px-3" : "px-5") + " py-2 file-sm-desc text-nowrap"}>{last_modified}</td>
                <td className={(this.props.sideBarOpen ? "px-3" : "px-5") + " py-2 file-sm-desc text-nowrap"}>{file_size}</td>
                <td className="py-2 file-sm-desc options-col">
                    <div className="d-flex position-relative">
                        <button className="btn more-btn" onClick={(e) => this.showMenu(e)}>
                            <img src="../images/icon/icon_g-more.svg" alt="" className="" />
                        </button>
                        <div className={(show_menu ? "d-block" : "d-none") +" more-inline-menu end-0 position-absolute"}>
                            <ul className="more-list">

                                    {/* Adds to Suscribed page + adds blue star */}
                                {(this.props.subscribed ?
                                        <li className="more-list-items px-3 py-2" onClick={(e) => this.onUnSubscribe(e,this.props.file)}>Unsubscribe</li>
                                        : <li className="more-list-items px-3 py-2" onClick={(e) => this.onSubscribe(e,this.props.file)}>Subscribe</li>
                                )}
                                {/* <li className="more-list-items px-3 py-2">Unsubscribe</li> */}

                                    {/* Adds to Locked page + WIP how it is shown */}
                                {(this.props.locked ?
                                        <li className="more-list-items px-3 py-2" onClick={(e) => this.onUnlock(e, this.props.file)}>Unlock</li>
                                        : <li className="more-list-items px-3 py-2" onClick={(e) => this.onLock(e, this.props.file)}>Lock</li>
                                )}

                                    {/* Opens right sidear */}
                                <li className="more-list-items px-3 py-2" onClick={(e) => this.onFocusFile(e, this.props.file)}>Details</li>

                                    {/* Aility to share file within org - WIP how this is shown (NOT MVP?) */}
                                {/*<li className="more-list-items px-3 py-2">Share</li>*/}

                                    {/* Rename file - WIP how this is shown (NOT MVP?) */}
                                {/*<li className="more-list-items px-3 py-2"*/}
                                {/*    onClick={(e) => this.onRename(e, this.props.file)}>Rename</li>*/}

                                    {/* Downloads file */}
                                <li className="more-list-items px-3 py-2" onClick={(e) => this.onDownload(e, this.props.file)}>Download</li>

                                    {/* Triggers confirmation to delete */}
                                <li className={(this.state.confirm_delete ? "" : "confirm-delete") + " more-list-items px-3 py-2"}
                                    onClick={(e) => this.onConfirmDelete(e)}>
                                    {this.state.confirm_delete ? "Delete" : "Are you sure?"}
                                </li>

                            </ul>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}
