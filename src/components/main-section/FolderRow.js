import React, {Component} from 'react';

/**
 * this is the folder row
 */
export class FolderRow extends Component {
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
            }, 2200)
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
    }

    render() {
        if (this.state.has_error) {
            return <h1>folder-row.js: Something went wrong.</h1>;
        }
        const show_menu = this.props.folder && this.props.folder.show_menu;
        return (
            <tr className="folder-row" onClick={() => {if (this.props.onSelectFolder) this.props.onSelectFolder()}}>
                <td className="py-2 pe-0 ps-3 favourite-col">
                    <span className={(this.props.subscribed ? "d-flex" : "d-none") + " w-100 justify-content-center"}>
                        <img src="../images/icon/icon_ms-favourite-row.svg" alt="" className="" />
                    </span>
                </td>
                <td className="py-2 folder-label name-col text-nowrap ps-2 pe-5">
                    <img src="../images/icon/icon_ms-folder.svg" alt="" className="folder-icon me-2"/>
                    {this.props.name}
                </td>
                {/*<td className={(this.props.sideBarOpen ? "px-3" : "px-5") + " py-2 folder-sm-desc text-nowrap"}>{this.props.owner}</td>*/}
                <td className={(this.props.sideBarOpen ? "px-3" : "px-5") + " py-2 folder-sm-desc text-nowrap"}>-</td>
                <td className={(this.props.sideBarOpen ? "px-3" : "px-5") + " py-2 folder-sm-desc text-nowrap"}>-</td>
                <td className="py-2 folder-sm-desc options-col">
                    <div className="d-flex position-relative">
                        <button className="btn more-btn" onClick={(e) => this.showMenu(e)}>
                            <img src="../images/icon/icon_g-more.svg" alt="" className="" />
                        </button>
                        <div className={(show_menu ? "d-block" : "d-none") +" more-inline-menu end-0 position-absolute"}>
                            <ul className="more-list">
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
                                {/*    onClick={(e) => this.onRename(e,this.props.folder)}>Rename</li>*/}

                                    {/* Triggers confirmation to delete */}
                                <li className={(this.state.confirm_delete ? "" : "confirm-delete") + " more-list-items px-3 py-2"}
                                    onClick={(e) => this.onConfirmDelete(e, this.props.folder)}>
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
