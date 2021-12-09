import React, {Component} from 'react';
import App from "../../common/api";

/**
 * this is the file tile
 */
export class FileTile extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            confirm_delete: true,
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

    onConfirmDelete(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.confirm_delete) {
            this.setState({confirm_delete: false})
            this.change = setTimeout(() => {
                this.setState({confirm_delete: true})
            }, 2200)
        } else {
            this.setState({confirm_delete: false});
            if (this.props.file && this.props.file.url) {
                if (this.props.onDelete) this.props.onDelete(this.props.file);
            }
        }
    }

    render() {
        if (this.state.has_error) {
            return <h1>file-tile.js: Something went wrong.</h1>;
        }
        let name = (this.props.file && this.props.file.name && this.props.file.name !== '/') ? this.props.file.name : "index.html";
        const url = (this.props.file && this.props.file.url) ? this.props.file.url : "";
        const show_menu = (this.props.file && this.props.file.show_menu);
        const type = this.props.type ? this.props.type : "";
        return (
            <div className={(this.props.sideBarOpen ? "col-xxl-4 col-xl-6 col-12" : "w-20 col-xl-3 col-lg-4 col-md-6 col-12") + " mb-3 px-2 transition no-select"}>
                <div className={(this.props.locked ? "locked" : "") + " file-tile d-flex flex-column"}
                    title={this.props.name}
                    onClick={() => {if (this.props.focusOnFile) this.props.focusOnFile(this.props.file)}}
                >
                    {/* <div className={(!this.props.preview ? "d-flex" : "d-none") + " file-preview justify-content-center align-items-center overflow-hidden position-relative no-select"}>
                        <img src="../images/icon/icon_ms-favourite-tile.svg" alt="" className={(this.props.subscribed ? "d-flex" : "d-none") + " position-absolute favourite-tile"} />
                        <p className="no-preview mb-0">No Preview</p>
                    </div> */}

                    <div className={(this.props.isSelected ? "active" : "") + " d-flex file-preview justify-content-center align-items-center overflow-hidden position-relative no-select"}>
                        <img src="../images/icon/icon_ms-favourite-tile.svg" alt="" className={(this.props.subscribed ? "d-flex" : "d-none") + " position-absolute favourite-tile"} />
                        <img src="../images/icon/icon_ms-locked.svg" alt="" className={(this.props.locked ? "d-flex" : "d-none") + " position-absolute locked-tile"} />
                        <img src={"../images/icon/icon_fi-" + (App.urlToType(type, url)) + (this.props.locked ? "-locked" : "") + ".svg"}  alt="" className="w-25 position-absolute" />
                    </div>

                    <div className={(this.props.isSelected ? "active" : "") + " d-flex justify-content-between align-items-center ps-1 pe-2 py-2 file-heading"}>
                        <div className="d-flex align-items-center truncate-container">
                            {/* <img src={this.props.isSelected ? "../images/icon/icon_ms-file2-active.svg" : "../images/icon/icon_ms-file2.svg"} alt="" className="me-2 file-icon" /> */}
                            <label className="file-label ms-2 mb-0 text-truncate">{name}</label>
                        </div>
                        <div className="d-flex position-relative">
                            <button className="btn more-btn ms-2" onClick={(e) => this.showMenu(e)}>
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
                    </div>
                </div>
            </div>
        );
    }
}
