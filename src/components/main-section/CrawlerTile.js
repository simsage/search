import React, {Component} from 'react';

import Api from "../../common/api";

/**
 * this is the crawler tile
 */
export class CrawlerTile extends Component {
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
        if (this.props.onShowMenu && this.props.source)
            this.props.onShowMenu(this.props.source);
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
            if (this.props.source && this.props.source.url) {
                if (this.props.onDelete) this.props.onDelete(this.props.source);
            }
        }
    }

    render() {
        if (this.state.has_error) {
            return <h1>crawler-tile.js: Something went wrong.</h1>;
        }
        const source = this.props.source ? this.props.source : {};
        const name = source.name ? source.name : "";
        const type_str = Api.sourceTypeToIcon(source.itemType);
        console.log("this.props.type", this.props.type, type_str);
        const type_name = Api.sourceTypeToName(source.itemType);
        const show_menu = source.show_menu;
        return (
            <div className={(this.props.sideBarOpen ? "col-6" : "col-3") + " mb-3 px-2 transition no-select"}
                 onClick={() => {if (this.props.onSelectSource) this.props.onSelectSource()}}>
                <div className="crawler-tile d-flex flex-column" title={name}>
                    <div className="crawler-preview d-flex justify-content-center align-items-center pt-4">
                        {type_str.indexOf('.') === -1 &&
                            <img src={"../images/icon/icon_ci-" + type_str + ".svg"} alt={type_str} className="crawler-icon"/>
                        }
                        {type_str.indexOf('.') > 0 &&
                            <img src={"../images/icon/" + type_str} alt={type_str} className="crawler-icon"/>
                        }
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-3">
                        <div className="d-flex flex-column px-3 pb-3 text-start">
                            <label className="crawler-label mb-0" title={type_name}>{name}</label>
                            <p className="crawler-meta mb-2" title={type_name}>{type_name}</p>
                            <p className="crawler-meta mb-0">Contains <i className="fw-bold">{this.props.num_documents}</i> Documents</p>
                        </div>

                        {source.itemType === "search" &&
                        <div className="d-flex position-relative">
                            <button className="btn more-btn ms-2" onClick={(e) => this.showMenu(e)}>
                                <img src="../images/icon/icon_g-more.svg" alt="" className=""/>
                            </button>
                            <div
                                className={(show_menu ? "d-block" : "d-none") + " more-inline-menu end-0 position-absolute"}>
                                <ul className="more-list">

                                    {/* Triggers confirmation to delete */}
                                    <li className={(this.state.confirm_delete ? "" : "confirm-delete") + " more-list-items px-3 py-2"}
                                        onClick={(e) => this.onConfirmDelete(e)}>
                                        {this.state.confirm_delete ? "Delete" : "Are you sure?"}
                                    </li>

                                </ul>
                            </div>
                        </div>
                        }

                    </div>
                </div>
            </div>
        );
    }
}
