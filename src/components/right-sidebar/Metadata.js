import React, {Component} from 'react';
import Api from "../../common/api";

/**
 * this is the Metadata
 */
export class Metadata extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            tag_input: false,
            add_tag_button: true,
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    showTagInput() {
        this.setState({tag_input: true});
        this.setState({add_tag_button: false});
    }
    hideTagInput() {
        this.setState({tag_input: false});
        this.setState({add_tag_button: true});
    }
    onRemoveHashTag(tag) {
        if (this.props.onUpdateHashTags && this.props.selected_file) {
            if (window.confirm("remove hash-tag \"" + tag + "\"?")) {
                const file = this.props.selected_file;
                const metadata_lists = Api.getMetadataLists(file && file.metadata ? file.metadata : {});
                const metadata_list = metadata_lists["metadata_list"];
                const new_tag_list = [];
                for (const item of metadata_list) {
                    if (item.value !== tag && item.name === "{hashtag}") {
                        new_tag_list.push(item.value);
                    }
                }
                this.props.onUpdateHashTags(this.props.selected_file, new_tag_list);
            }
        }
    }
    onKeyPress(event) {
        if (event.key === "Enter") {
            const text = document.getElementById("add-new-tag").value;
            if (text.trim() !== "") {
                this.onAddHashTag(text.trim());
            }
        }
    }
    onAddHashTag(tag) {
        if (this.props.onUpdateHashTags && this.props.selected_file) {
            const file = this.props.selected_file;
            const metadata_lists = Api.getMetadataLists(file && file.metadata ? file.metadata : {});
            const metadata_list = metadata_lists["metadata_list"];
            const new_tag_list = [tag];
            for (const item of metadata_list) {
                if (item.value !== tag && item.name === "{hashtag}") {
                    new_tag_list.push(item.value);
                }
            }
            this.props.onUpdateHashTags(this.props.selected_file, new_tag_list);
        }
    }
    render() {
        if (this.state.has_error) {
            return <h1>metadata.js: Something went wrong.</h1>;
        }
        const file = this.props.selected_file;
        const url = (file && file.url) ? file.url : "";
        let file_type = (file && file.typeDescription) ? file.typeDescription : "";
        if (file_type === "") {
            file_type = (file && file.documentType) ? file.documentType : "";
        }
        const file_size = (file && file.binarySize) ? Api.formatSizeUnits(file.binarySize) : "0 bytes";
        const last_modified = (file && file.lastModified) ? file.lastModified : 0;
        const created = (file && file.created) ? file.created : 0;
        const acl_list = (file && file.acls) ? file.acls : [];
        if (acl_list.length === 0) { // no ACLs is read-only
            acl_list.push({"acl": "Everyone", "access": "R", "isUser": false});
        }
        const metadata_lists = Api.getMetadataLists(file && file.metadata ? file.metadata : {});
        const tag_list = metadata_lists["tag_list"];
        const metadata_list = metadata_lists["metadata_list"];
        // if (tag_list.length === 0) {
        //     tag_list.push({"name": "Tag"});
        // }
        return (
            <div className="container-fluid">

                {/* {tag_list.length > 0 && */}
                <div className="row pt-2 pb-2">
                    <div className="col-3 metadata-name">
                        <p className="mb-0 mt-2">Tags</p>
                    </div>
                    <div className="col-9 metadata-info">
                        <div className="d-flex align-items-center flex-wrap">
                            {
                                tag_list.map((tag, i) => {
                                    return (<span className="tag me-2 mb-2" key={i} title={"hash-tag " + tag.name}>
                                                {tag.name}&nbsp;<span className="remove-tag ms-1 pointer-cursor"
                                                                  title={"remove " + tag.name}
                                                                  onClick={() => {this.onRemoveHashTag(tag.name)}}>&times;</span>
                                            </span>)
                                })
                            }
                            {
                                // todo: add a dialog for asking the name for the new tag
                            }

                            <button className={(this.state.add_tag_button ? "d-flex" : "d-none") + " btn btn-plus mb-2"} title="New tag" onClick={() => this.showTagInput()} tabIndex="1">
                                <img src="../images/icon/icon_ms-plus.svg" alt="" />
                            </button>


                            {/* 
                                Tag Input 
                                - Type tag and press enter to add tag - clears input
                                - Additionally: Type tags separated by commas and press enter to bulk add - clears input
                                - Hide Tag Input onBlur
                            */}
                            <input type="text" id="add-new-tag" placeholder="Add tag..." className={(this.state.tag_input ? "d-block" : "d-none") + " tag-input py-2 px-3 mb-2"}
                                   onKeyPress={(event) => this.onKeyPress(event)}
                                   onBlur={() => this.hideTagInput()} />


                        </div>
                    </div>
                </div>
                {/* } */}

                {acl_list.length > 0 &&
                <div className="row pt-2 pb-2">
                    <div className="col-3 metadata-name">
                        <p className="mb-0 mt-2">Access</p>
                    </div>
                    <div className="col-9 metadata-info">
                        {
                            acl_list.map((acl, i) => {
                                // const is_user = acl.isUser;
                                return (
                                    <div className="d-flex align-items-center mb-2" key={i}>
                                        <div className="user-tag">
                                            <img src="../images/icon/icon_rs-account.svg" alt="acl" className="account-icon me-1"/>
                                            <p className="mb-0">{acl.acl}</p>
                                        </div>
                                        <p className="mb-0 ms-2 small owner-tag">({acl.access})</p>
                                    </div>
                                )
                            })
                        }
                        {/* <p className="py-2 mb-0">+</p> */}
                    </div>
                </div>
                }

                <div className="row pt-2 pb-3">
                    <div className="col-3 metadata-name">
                        <p className="mb-0 mt-2">URL</p>
                    </div>
                    <div className="col-9 metadata-info pointer-cursor d-flex align-items-center">
                        <div className="version-tag me-2 pointer-cursor py-1" title={url}
                            onClick={() => {if (this.props.onDownloadFile) this.props.onDownloadFile(file)}}>
                            <img src="../images/icon/icon_rs-download.svg" alt="" className="download-icon me-1" />

                        <p className="mb-0">{url}</p>
                        </div>
                        {/* <p className="mb-0" title={url}
                             onClick={() => {if (this.props.onDownloadFile) this.props.onDownloadFile(file)}}>{url}
                        </p> */}
                    </div>
                </div>

                <div className="row pt-2">
                    <div className="col-3 metadata-name">
                        <p className="mb-0">Type</p>
                    </div>
                    <div className="col-9 metadata-info" title={file_type}>
                        <p className="mb-0">{file_type}</p>
                    </div>
                </div>
                <div className="row pt-2 pb-3">
                    <div className="col-3 metadata-name">
                        <p className="mb-0">File Size</p>
                    </div>
                    <div className="col-9 metadata-info" title={file_size}>
                        <p className="mb-0">{file_size}</p>
                    </div>
                </div>

                {
                    last_modified > 0 &&
                    <div className="row pt-2">
                        <div className="col-3 metadata-name">
                            <p className="mb-0">Modified</p>
                        </div>
                        <div className="col-9 metadata-info">
                            <p className="mb-0">{Api.unixTimeConvert(last_modified)}</p>
                        </div>
                    </div>
                }
                {
                    created > 0 &&
                    <div className="row pt-2 pb-3">
                        <div className="col-3 metadata-name">
                            <p className="mb-0">Created</p>
                        </div>
                        <div className="col-9 metadata-info">
                            <p className="mb-0">{Api.unixTimeConvert(created)}</p>
                        </div>
                    </div>
                }


                {
                    metadata_list.map( (kv, i) => {
                        return (
                            <div className="row pt-2 pb-3" key={i}>
                                <div className="col-3 metadata-name">
                                    <p className="mb-0 text-break">{kv.key}</p>
                                </div>
                                <div className="col-9 metadata-info">
                                    <p className="mb-0">{kv.value}</p>
                                </div>
                            </div>
                        )
                    })
                }


                {/*
                TO DO

                if (tags)
                    <div className="col-8 metadata-info">
                        + button
                    </div>

                else if (access_control)
                    <div className="col-8 metadata-info">
                        name and icon list
                    </div>

                else if (link)
                    <div className="col-8 metadata-info">
                        <a href="">link</a>
                    </div>

                else if (general)
                    <div className="col-8 metadata-info">
                        <p className="py-2 mb-0">Information</p>
                    </div>
                */}
            </div>
        );
        
    }
}
