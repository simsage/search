import React, {Component} from 'react';

import '../../css/navbar/notifications-dropdown.css';
import '../../css/layout/right-sidebar.css';
import Api from "../../common/api";

/**
 * this is the main DMS page
 */
export default class NotificationsDropdown extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            my_error_title: 'default error title',
            my_error_message: 'default error message'
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    render() {
        if (this.state.has_error) {
            return <h1>notifications.js: Something went wrong.</h1>;
        }
        const activity_list = this.props.activity_list ? this.props.activity_list : [];
        return (
            <div className={(this.props.isNotificationsDropdown ? "d-flex" : "d-none") + " notifications-dropdown"}>
                 <div className="container-fluid mh-100 overflow-auto d-flex flex-column-reverse p-0 activity-inner">
                    <div className="activity-container align-self-end">

                        { activity_list.map((activity, i) => {
                            const type = Api.notificationTypeToIcon(activity.notificationType);
                            return (
                                <div className="w-100 activity-content px-3 py-4" key={i}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <img src={"../images/icon/icon_rs-" + type + ".svg"} alt="" className="comments-user p-1"/>
                                        </div>
                                        <div className="w-100">
                                            <p className="me-1 mb-0 comments-username activity-line-height">{activity.email}</p>
                                            {/*<p className="me-1 mb-0 activity-line-height">added a comment </p>*/}
                                            {/*<p className="me-2 mb-0 activity-line-height">to </p>*/}
                                            {/*<span className="activity-file me-2 activity-height">{activity.description}</span>*/}
                                            <p className="mb-0 comments-time fw-light activity-line-height">{Api.unixTimeConvert(activity.created)}</p>
                                        </div>
                                    </div>
                                    <div className="mb-1 ms-4 ps-2">
                                        <p className="mb-0 fst-italic fw-light">{activity.description}</p>
                                    </div>
                                </div>
                            )
                        })}

                        {/*<div className="w-100 activity-content px-3 py-4">*/}
                        {/*    <div className="d-flex justify-content-between align-items-start">*/}
                        {/*        <div>*/}
                        {/*            <img src="../images/icon/icon_rs-tag.svg" alt="" className="comments-user p-1"/>*/}
                        {/*        </div>*/}
                        {/*        <div className="w-100">*/}
                        {/*            <p className="me-1 mb-0 comments-username activity-line-height">Cole </p>*/}
                        {/*            <p className="me-2 mb-0 activity-line-height">added a tag </p>*/}
                        {/*            <span className="tag me-2 activity-height">tag </span>*/}
                        {/*            <span className="tag me-2 activity-height">demo </span>*/}
                        {/*            <p className="me-2 mb-0 activity-line-height">to </p>*/}
                        {/*            <span className="activity-file me-2 activity-height">index.html </span>*/}
                        {/*            <p className="mb-0 comments-time fw-light activity-line-height">2021/11/08 21:51:16 </p>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/*<div className="w-100 activity-content px-3 py-4">*/}
                        {/*    <div className="d-flex justify-content-between align-items-start">*/}
                        {/*        <div>*/}
                        {/*            <img src="../images/icon/icon_rs-unlocked.svg" alt="" className="comments-user p-1"/>*/}
                        {/*        </div>*/}
                        {/*        <div className="w-100">*/}
                        {/*            <p className="me-1 mb-0 comments-username activity-line-height">Cole </p>*/}
                        {/*            <p className="me-2 mb-0 activity-line-height">unlocked </p>*/}
                        {/*            <span className="activity-file me-2 activity-height">index.html </span>*/}
                        {/*            <p className="mb-0 comments-time fw-light activity-line-height">2021/11/08 21:51:16 </p>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/*<div className="w-100 activity-content px-3 py-4">*/}
                        {/*    <div className="d-flex justify-content-between align-items-start">*/}
                        {/*        <div>*/}
                        {/*            <img src="../images/icon/icon_rs-locked.svg" alt="" className="comments-user p-1"/>*/}
                        {/*        </div>*/}
                        {/*        <div className="w-100">*/}
                        {/*            <p className="me-1 mb-0 comments-username activity-line-height">Cole </p>*/}
                        {/*            <p className="me-2 mb-0 activity-line-height">locked </p>*/}
                        {/*            <span className="activity-file me-2 activity-height">index.html </span>*/}
                        {/*            <p className="mb-0 comments-time fw-light activity-line-height">2021/11/08 21:51:16 </p>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/*<div className="w-100 activity-content px-3 py-4">*/}
                        {/*    <div className="d-flex justify-content-between align-items-start">*/}
                        {/*        <div>*/}
                        {/*            <img src="../images/icon/icon_rs-version.svg" alt="" className="comments-user p-1"/>*/}
                        {/*        </div>*/}
                        {/*        <div className="w-100">*/}
                        {/*            <p className="me-1 mb-0 comments-username activity-line-height">Cole </p>*/}
                        {/*            <p className="me-2 mb-0 activity-line-height">uploaded version 2 </p>*/}
                        {/*            <div className="version-tag me-2 pointer-cursor py-1 activity-height">*/}
                        {/*                <img src="../images/icon/icon_rs-download.svg" alt="" className="download-icon" />*/}
                        {/*                <p className="mb-0">https://simsage.ai/</p>*/}
                        {/*            </div>*/}
                        {/*            <p className="me-2 mb-0 activity-line-height">to </p>*/}
                        {/*            <span className="activity-file me-2 activity-height">index.html </span>*/}
                        {/*            <p className="mb-0 comments-time fw-light activity-line-height">2021/11/08 21:51:16</p>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                    </div>
                </div>
            </div>
        );
    }
}
