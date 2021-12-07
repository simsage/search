import React, {Component} from 'react';


export class MessageBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            has_error: false,
        };
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    handleOk() {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }
    render() {
        if (this.state.has_error) {
            return <h1>message-box.js: Something went wrong.</h1>;
        }
        if (this.props.open) {
            return (
                <div className="modal" tabIndex="-1" role="dialog" style={{display: "inline"}}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" onClick={() => this.handleOk()} className="close"
                                        data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {this.props.text}
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => this.handleOk()}
                                        className="btn btn-secondary" data-dismiss="modal">OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (<div />)
        }
    }
}

export default MessageBox;
