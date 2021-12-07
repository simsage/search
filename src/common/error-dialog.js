import React from 'react';

import '../css/alert.css';


// display error dialog
export default class ErrorDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {has_error: false};
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    render() {
        if (this.state.has_error) {
            return <h1>error-dialog.js: Something went wrong.</h1>;
        }
        const open = (this.props.error && this.props.error.length > 0);
        const error = this.props.error ? this.props.error : "";
        return (
            <div>
                {open &&
                        <div className="alert alert-message ps-3 pe-2" role="alert">
                            <div className="close close-alert px-2" data-dismiss="alert" aria-label="close"
                                 onClick={() => { if (this.props.onClose) this.props.onClose()}
                                 }>&times;</div>
                            {error}
                        </div> 
                }
            </div>
        );
    }
}
