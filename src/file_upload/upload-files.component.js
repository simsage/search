import React, { Component } from "react";
import axios from "axios";

// github: https://github.com/bezkoder/react-multiple-files-upload

export default class UploadFiles extends Component {
    constructor(props) {
        super(props);
        this.upload = this.upload.bind(this);
        this.uploadFiles = this.uploadFiles.bind(this);
        this.state = {
            busy: false,
            current_index: 0,
            files: null,
            progress_info: [],
            fileInfos: [],
        };
    }

    upload_file(file, onUploadProgress, session_id) {
        let formData = new FormData();
        formData.append("file", file);
        const bc_list = this.props.breadcrumbList ? this.props.breadcrumbList : [];
        if (bc_list.length > 0) {
            const item = bc_list[bc_list.length - 1];
            let url = "";
            let sourceId = 0;
            if (item && item.folder && item.folder.url) {
                url = item.folder.url;
                sourceId = item.folder.sourceId;
            } else if (item && item.source && item.source.url) {
                sourceId = item.source.sourceId;
                url = "/";
            }
            if (url.length > 0 && sourceId > 0) {
                url = btoa(unescape(encodeURIComponent(url)));
                return axios.post(window.ENV.api_base + "/dms/upload/document/" +
                    window.ENV.organisation_id + '/' + window.ENV.kb_id + '/' + sourceId + '/' + url,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            "Session-Id": session_id,
                            "API-Version": "1"
                        },
                        onUploadProgress,
                    }
                );
            }
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.files_for_upload && this.props.files_for_upload.length > 0) {
            if (!this.state.busy) {
                window.setTimeout(() => this.uploadFiles(this.props.files_for_upload), 100);
            }
        }
    }

    upload(idx, file) {
        const progress_info = [...this.state.progress_info];
        const self = this;
        const files = this.state.files;
        const current_index = this.state.current_index + 1;
        const ul = this.upload_file(file, (event) => {
            progress_info[idx].percentage = Math.round((100 * event.loaded) / event.total);
            this.setState({
                progress_info: progress_info,
                current_index: current_index,
            });
        }, this.props.session_id);
        if (ul) {
            ul.then((response) => {
                if (current_index < progress_info.length && files && current_index < files.length) {
                    this.upload(current_index, files[current_index]);
                } else {
                    if (response && response.data && self.props.onUpdateFolder) {
                        self.props.onUpdateFolder(response.data);
                    }
                    window.setTimeout(() => this.close(), 2000);
                }
            })
            .catch((err) => {
                const msg = err && err.error ? " (" + err.error + ")" : "";
                progress_info[idx].percentage = 0;
                progress_info[idx].message = "could not upload file: " + file.name + msg;
                this.setState((prev) => {
                    return {
                        progress_info: progress_info,
                    };
                });
            });
        }
    }

    close() {
        if (this.props.onCloseFileupload) {
            this.props.onCloseFileupload()
        }
        this.setState({busy: false});
    }

    uploadFiles(selectedFiles) {
        const progress_info = [];
        for (let i = 0; i < selectedFiles.length; i++) {
            progress_info.push({ percentage: 0, fileName: selectedFiles[i].name, message: ""});
        }
        this.setState(
        {
            busy: true,
            current_index: 0,
            files: selectedFiles,
            progress_info: progress_info,
        },
        () => {
            if (selectedFiles.length > 0) {
                this.upload(0, selectedFiles[0]);
            }
        });
    }

    render() {
        const { progress_info } = this.state;
        if (!this.props.files_for_upload) {
            return (<div />);
        }
        const num_files = this.props.files_for_upload.length;
        const count = num_files - this.state.current_index;
        return (
        <div className="file-uploader">

            <div className="file-uploader-title d-flex align-items-center justify-content-between py-3 ps-3 pe-2">
                {count > 1 && <span>Uploading {count} files</span>}
                {count === 1 && <span>Uploading one file</span>}
                {count === 0 && <span>Uploading done</span>}
                <div onClick={() => this.close()} className="close close-alert px-2"
                    data-dismiss="modal" aria-label="Close" title="Close file uploader">
                    &times;
                </div>
            </div>

            <div className="pb-4 file-uploader-content">

            {progress_info &&
                progress_info.map((progress_info, index) => {
                    if (this.state.current_index > (index + 1))
                        return (<div />)
                    return (
                        <div className="mb-2 progress-info-box px-4 pt-3" key={index}>
                            <div className=" d-flex justify-content-between mb-1">
                                <p className="mb-0">
                                    {progress_info.fileName}
                                </p>
                                {progress_info.message && progress_info.message.length > 0 && (
                                    <div className="" role="alert">
                                        <span className="text-danger">{progress_info.message}</span>
                                    </div>
                                )}
                            </div>

                            <div className="progress sim-progress">
                                <div className="progress-bar progress-bar-info"
                                     role="progressbar"
                                     aria-valuenow={progress_info.percentage}
                                     aria-valuemin="0"
                                     aria-valuemax="100"
                                     style={{width: progress_info.percentage + "%"}} >
                                </div>
                            </div>

                        </div>
                    )}
                )
            }

            </div>
        </div>
        );
    }
}
