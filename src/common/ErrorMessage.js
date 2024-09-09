import {useDispatch, useSelector} from "react-redux";
import React from 'react';
import {set_metadata_error} from "../reducers/searchSlice";


export default function ErrorMessage( {error, close} ){

    const dispatch = useDispatch();

    // metadata errors and handling
    const { metadata_error } = useSelector((state) => state.searchReducer)

    if (!metadata_error || metadata_error.length === 0) {
        return <div/>
    }

    /**
     * check if we need to sign-out or just close the message
     */
    function on_close() {
        dispatch(set_metadata_error({error: ''}))
    }

    return (
        <div className="modal"  tabIndex="-1" role="dialog" style={{display: "inline", zIndex: 1061}}>
            <div className={"modal-dialog modal-dialog-centered modal-lg"} role="document">
                <div className="modal-content shadow p-3 mb-5 bg-white rounded">
                    <div className="modal-header">
                        <button onClick={close} type="button" className="btn-close" data-bs-dismiss="modal"
                                title="close this error message" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="control-row">
                            <span title={metadata_error} className="label-wide">{metadata_error}</span>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button onClick={on_close} type="button" title="close this error message"
                                className="btn btn-primary">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
