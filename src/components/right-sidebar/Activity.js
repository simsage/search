import React, {Component} from 'react';
import Api from "../../common/api";

/**
 * this is the Activity
 */
export class Activity extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    render() {
        if (this.state.has_error) {
            return <h1>activity.js: Something went wrong.</h1>;
        }
        let activity_list = this.props.activity_list.length ? this.props.activity_list : [{created: 1638191762168, email: 'search@simsage.nz', description: 'test 1'}, {created: 1638191762168, email: 'search@simsage.nz', description: 'test 2'}];

        return (
                // <div className="container-fluid h-100">
                //     {
                //         activity_list.map((comment, i) => {
                //             return (<div className="text-danger" key={i}>
                //                 <span>{comment.email}&nbsp;</span>
                //                 <span>{Api.unixTimeConvert(comment.created)}&nbsp;</span>
                //                 <div>{comment.description}</div>
                //             </div>)
                //         })
                //     }

                // </div>  

                <div className="container-fluid mh-100 overflow-auto d-flex flex-column-reverse pe-4 activity-inner">
                    <div className="activity-container align-self-end mt-2">
                        {activity_list.map((activity, i) => {
                            return (
                                <div className="w-100 activity-content" key={i}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                           <img src="../images/icon/icon_rs-account.svg" alt="" className="comments-user p-1"/>
                                        </div>
                                        <div className="w-100">
                                            <p className="me-1 mb-0 comments-username activity-line-height">{activity.email}</p>
                                            {/*<p className="me-2 mb-0 activity-line-height">added a comment </p>*/}
                                            <p className="mb-0 comments-time fw-light activity-line-height">{Api.unixTimeConvert(activity.created)}</p>
                                        </div>
                                    </div>
                                    <div className="mb-1 ms-4 ps-2">
                                        <p className="mb-0 fst-italic fw-light">{activity.description}</p>
                                    </div>
                                </div>
                            )}
                        )}

                        {/*<div className="w-100 activity-content">*/}
                        {/*    <div className="d-flex justify-content-between align-items-start">*/}
                        {/*        <div>*/}
                        {/*            <img src="../images/icon/icon_rs-tag.svg" alt="" className="comments-user p-1"/>*/}
                        {/*        </div>*/}
                        {/*        <div className="w-100">*/}
                        {/*            <p className="me-1 mb-0 comments-username activity-line-height">Cole </p>*/}
                        {/*            <p className="me-2 mb-0 activity-line-height">added a tag </p>*/}
                        {/*            <span className="tag me-2 activity-height">tag </span>*/}
                        {/*            <span className="tag me-2 activity-height">demo </span>*/}
                        {/*            <p className="mb-0 comments-time fw-light activity-line-height">2021/11/08 21:51:16 </p>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/*<div className="w-100 activity-content">*/}
                        {/*    <div className="d-flex justify-content-between align-items-start">*/}
                        {/*        <div>*/}
                        {/*            <img src="../images/icon/icon_rs-unlocked.svg" alt="" className="comments-user p-1"/>*/}
                        {/*        </div>*/}
                        {/*        <div className="w-100">*/}
                        {/*            <p className="me-1 mb-0 comments-username activity-line-height">Cole </p>*/}
                        {/*            <p className="me-2 mb-0 activity-line-height">unlocked the file </p>*/}
                        {/*            <p className="mb-0 comments-time fw-light activity-line-height">2021/11/08 21:51:16 </p>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/*<div className="w-100 activity-content">*/}
                        {/*    <div className="d-flex justify-content-between align-items-start">*/}
                        {/*        <div>*/}
                        {/*            <img src="../images/icon/icon_rs-locked.svg" alt="" className="comments-user p-1"/>*/}
                        {/*        </div>*/}
                        {/*        <div className="w-100">*/}
                        {/*            <p className="me-1 mb-0 comments-username activity-line-height">Cole </p>*/}
                        {/*            <p className="me-2 mb-0 activity-line-height">locked the file </p>*/}
                        {/*            <p className="mb-0 comments-time fw-light activity-line-height">2021/11/08 21:51:16 </p>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/*<div className="w-100 activity-content">*/}
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
                        {/*            <p className="mb-0 comments-time fw-light activity-line-height">2021/11/08 21:51:16</p>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                    </div>
                </div>
        );
        
    }
}
