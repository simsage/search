import React, {Component} from 'react';

import Api from '../../common/api';

/**
 * this is the Comments
 */
export class Comments extends Component {
    constructor(props){
        super(props);
        this.state={
            text: '',
            has_error: false,  // error trapping
            confirm_delete: true,
        }

    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }

    onAddComment(file){
        if (this.props.onAddComment) this.props.onAddComment(file,this.state.text);
        this.setState({text: ``});
    }

    onKeyPress(event,file) {

        if (event.key === "Enter") {
            event.preventDefault();
            this.onAddComment(file);
        }
    }

    onConfirmDelete(file, id) {
        if (this.state.confirm_delete) {
            this.setState({confirm_delete: false})
            this.change = setTimeout(() => {
                this.setState({confirm_delete: true})
            }, window.ENV.delete_timeout_in_ms)
        } else {
            this.setState({confirm_delete: true});
            if (file && id && this.props.onRemoveComment)
                this.props.onRemoveComment(file, id);
        }
    }


    render() {
        if (this.state.has_error) {
            return <h1>comments.js: Something went wrong.</h1>;
        }
        const file = this.props.selected_file;
        const comment_list = this.props.comment_list ? this.props.comment_list : [];
        return (<div className="container-fluid mh-100 overflow-auto d-flex flex-column-reverse pe-4 comments-inner">
                    <div className="comments-container align-self-end mt-3">

                        { comment_list.length === 0 &&
                            <div className="d-flex justify-content-center align-items-center mt-5">
                                <p className="owner-tag">No Comments...</p>
                            </div>
                        }

                        {comment_list.map((comment, i) => {
                                return (
                                    <div className="d-flex comments-content mb-3" key={i}>
                                        <div>
                                            <img src="../images/icon/icon_rs-account.svg" alt=""
                                                 className="comments-user p-1"/>
                                        </div>
                                        <div className="w-100">

                                            <div className="d-flex justify-content-between align-items-center py-1">
                                                <div className="d-flex align-items-end">
                                                    <p className="me-2 mb-0 comments-username">{comment.email}</p>
                                                    <p className="mb-0 comments-time fw-light">{Api.unixTimeConvert(comment.created)}</p>
                                                </div>
                                                <button className={(this.state.confirm_delete ? "" : "confirm-delete") + " btn comments-more p-0 d-flex justify-content-center"}
                                                        onClick={() => this.onConfirmDelete(file, comment.noteId)}>
                                                    <img src="../images/icon/icon_g-trash.svg" alt="" className={this.state.confirm_delete ? "d-block cross" : "d-none"}/>
                                                    <img src="../images/icon/icon_g-confirm.svg" alt="" className={this.state.confirm_delete ? "d-none" : "d-block"}/>
                                                </button>

                                            </div>
                                            <p className="mb-4">{comment.noteText}</p>
                                        </div>
                                    </div>)
                            }
                        )}
                            {/*<div className="d-flex comments-content mb-3">*/}
                            {/*    <div>*/}
                            {/*        <img src="../images/icon/icon_rs-account.svg" alt="" className="comments-user p-1" />*/}
                            {/*    </div>*/}
                            {/*    <div className="w-100">*/}
                            {/*        <div className="d-flex justify-content-between align-items-center py-1">*/}
                            {/*            <div className="d-flex align-items-end">*/}
                            {/*                <p className="me-2 mb-0 comments-username">Sean Wilson</p>*/}
                            {/*                <p className="mb-0 comments-time">2021/11/05 18:35:22</p>*/}
                            {/*            </div>*/}
                            {/*            <button className="btn comments-more p-0">*/}
                            {/*                <img src="../images/icon/icon_g-more.svg" alt="" className="" />*/}
                            {/*            </button>*/}
                            {/*        </div>*/}
                            {/*        <p className="mb-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Et, non? Dolor, nostrum neque. Veniam impedit neque.</p>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        
                    </div>
                {
                    // comment_list.map((comment, i) => {
                    //         return (<div className="text-danger" key={i}>
                    //                     <span title="remote this comment" onClick={() => {if (this.props.onRemoveComment) this.props.onRemoveComment(comment)}}>&times;&nbsp;</span>
                    //                     <span>{comment.noteId}&nbsp;</span>
                    //                     <span>{comment.email}&nbsp;</span>
                    //                     <span>{Api.unixTimeConvert(comment.created)}&nbsp;</span>
                    //                     <div>{comment.noteText}</div>
                    //                 </div>)
                    //     })
                }

                {
                    // todo: add a new comment needs to put up a dialog box asking for the comment text and pass it in as a new comment
                }

                    
                
                    
                    <div className="comment-textarea-container d-flex flex-column px-4 pt-3 pb-4">
                        <textarea name="" id="comment-textarea" cols="" rows="3" className="comment-textarea px-3 py-2"
                                  placeholder="Add Comment..." value={this.state.text}
                                  onChange={(event) => this.setState({text: event.target.value})}
                                  onKeyPress={(event) => this.onKeyPress(event,file)}
                        >
                        </textarea>

                        <div className="comment-bar d-flex justify-content-between align-items-center ps-3 pe-1 py-0">
                            <span>&nbsp;</span>
                            <button className="btn p-0" onClick={() => {this.onAddComment(file)}} title="Add Comment">
                                <img src="../images/icon/icon_rs-send.svg" alt="" className="comment-send" />
                            </button>
                        </div>
                    </div>


                </div>

                
        );
        
    }
}
