import React, {Component} from 'react';

import '../../css/layout/modal.css';

/**
 * this is the Modal
 */
export default class Modal extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            my_error_title: 'default error title',
            my_error_message: 'default error message'
        }
    }
    render() {
        if (this.state.has_error) {
            return <h1>modal.js: Something went wrong.</h1>;
        }
        return (
            <div className="modal-container container px-0">
                <div className="tog-tabs d-flex">
                    <div className="active text-center px-5 pt-3 pb-1 small tab no-select">
                        Account
                    </div>
                    <div className="text-center px-5 pt-3 pb-1 small tab no-select">
                        Settings
                    </div>
                    <div className="text-center px-5 pt-3 pb-1 small tab no-select">
                        All Activity
                    </div>
                    <div className="text-center px-5 pt-3 pb-1 small tab no-select">
                        Deleted Files
                    </div>
                </div> 
                <button className="float-end" onClick={() => {if (this.props.onSettingsModal) this.props.onSettingsModal()}}>close</button>
            </div>
        );
    }
}
