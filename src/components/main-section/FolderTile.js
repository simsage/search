import React, {Component} from 'react';

/**
 * this is the folder tile
 */
export class FolderTile extends Component {
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
        if (this.props.onShowMenu && this.props.folder)
            this.props.onShowMenu(this.props.folder);
    }

    onSubscribe(e,folder){
        e.preventDefault();
        e.stopPropagation();
        if (folder && folder.url && folder.isFolder &&  this.props.onSubscribe) this.props.onSubscribe(folder);
    }
    onUnSubscribe(e,folder){
        e.preventDefault();
        e.stopPropagation();
        if (folder && folder.url && folder.isFolder && this.props.onUnsubscribe) this.props.onUnsubscribe(folder);
    }

    onConfirmDelete(e, folder) {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.confirm_delete) {
            this.setState({confirm_delete: false})
            this.change = setTimeout(() => {
                this.setState({confirm_delete: true})
            }, window.ENV.delete_timeout_in_ms)
        } else {
            this.setState({confirm_delete: false});
            if (folder && folder.url && folder.isFolder) {
                if (this.props.onDelete) this.props.onDelete(folder);
            }
        }
    }

    onRename(e,folder){
        e.preventDefault();
        e.stopPropagation();
        if (folder && folder.url && folder.isFolder) {
            const rename = window.prompt("Rename folder to", folder.name);
            if (rename && rename.trim() !== folder.name.trim() && this.props.onRename) {
                this.props.onRename(folder, rename);
            }
        }
        this.moreDropdown(e);
    }

    render() {
        if (this.state.has_error) {
            return <h1>folder-tile.js: Something went wrong.</h1>;
        }
        const show_menu = this.props.folder && this.props.folder.show_menu;
        return (
            <div className={(this.props.sideBarOpen ? "col-xxl-4 col-xl-6 col-12" : "w-20 col-xl-3 col-lg-4 col-md-6 col-12") + " mb-3 px-2 transition no-select"}>
                <div className="folder-tile d-flex justify-content-between align-items-center px-2 py-2"
                     title={this.props.name} onClick={() => {if (this.props.onSelectFolder) this.props.onSelectFolder()}}>
                    <div className="d-flex align-items-center truncate-container">
                        <img src={(this.props.subscribed ? "../images/icon/icon_ms-folder-favourite.svg" : "../images/icon/icon_ms-folder.svg")} alt="" className="me-2 folder-icon" />
                        <label className="folder-label mb-0 text-truncate">{this.props.name}</label>
                    </div>
                    <div className="d-flex position-relative">
                        <button className="btn more-btn ms-2" onClick={(e) => this.showMenu(e)}>
                            <img src="../images/icon/icon_g-more.svg" alt="" className="" />
                        </button>
                        <div className={(show_menu ? "d-block" : "d-none") +" more-inline-menu end-0 position-absolute"}>
                            <ul className="more-list">
                                    {/* Adds to Suscribed page + adds blue star */}
                                {(this.props.subscribed ?
                                        <li className="more-list-items px-3 py-2" onClick={(e) => this.onUnSubscribe(e,this.props.folder)}>Unsubscribe</li>
                                        : <li className="more-list-items px-3 py-2" onClick={(e) => this.onSubscribe(e,this.props.folder)}>Subscribe</li>
                                )}
                                {/*<li className="more-list-items px-3 py-2">Subscribe</li>*/}
                                {/* <li className="more-list-items px-3 py-2">Unsubscribe</li> */}
                                
                                    {/* Aility to share file within org - WIP how this is shown (NOT MVP?) */}
                                {/*<li className="more-list-items px-3 py-2">Share</li>*/}

                                    {/* Rename file - WIP how this is shown (NOT MVP?) */}
                                {/*<li className="more-list-items px-3 py-2"*/}
                                {/*    onClick={(e) => this.onRename(e, this.props.folder)}>Rename</li>*/}

                                    {/* Triggers confirmation to delete */}
                                <li className={(this.state.confirm_delete ? "" : "confirm-delete") + " more-list-items px-3 py-2"}
                                    onClick={(e) => this.onConfirmDelete(e, this.props.folder)}>
                                    {this.state.confirm_delete ? "Delete" : "Are you sure?"}
                                </li>

                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
