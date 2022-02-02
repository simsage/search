import React, {Component} from 'react';

// import '../../css/layout/modal.css';

/**
 * this is the PreviewModal
 */
export default class PreviewModal extends Component {
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
            <div className="d-flex justify-content-center align-items-top overflow-auto h-100 w-100">
                <div className="fixed-top text-white px-4 py-3" style={{"background" : "#202731ee"}}>
                    HELLO
                </div>
                <div className="modal-container container overflow-auto">
                    <div className="bg-light px-4 py-3" style={{"margin" : "6rem"}}>
                        <h1 className="display-3">Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis quia aperiam, omnis non modi, quasi nihil facere doloremque praesentium corporis aspernatur reiciendis, est quas fugit? Quis sunt accusamus delectus ea!</h1>
                        <br/>
                        <h1 className="display-3">Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis quia aperiam, omnis non modi, quasi nihil facere doloremque praesentium corporis aspernatur reiciendis, est quas fugit? Quis sunt accusamus delectus ea!</h1>
                    </div>
                </div>
            </div>
        );
    }
}
