import React from 'react';

interface ConfirmMessageProps {
    title: string | undefined;
    message: string | undefined;
    confirm: () => void;
    close: () => void;
}

export default function ConfirmMessage(props: ConfirmMessageProps): JSX.Element {
    if (props.message === undefined || props.message.length === 0 || props.title === undefined) {
        return <div/>
    }

    return (
        <div className="modal" role="dialog" style={{display: "inline", zIndex: 1061}}>
            <div className={"modal-dialog modal-dialog-centered modal-lg"} role="document">
                <div className="modal-content shadow p-3 mb-5 rounded">
                    <div className="modal-header">
                        <h5 className="modal-title" id="staticBackdropLabel" title={props.title}>{props.title}</h5>
                        <button onClick={props.close} type="button" className="btn-close" data-bs-dismiss="modal"
                                title="close this message" aria-label="Cancel"></button>
                    </div>
                    <div className="modal-body">
                        <div className="control-row">
                            <span title={props.message} className="label-wide">{props.message}</span>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button onClick={props.close} type="button" title="cancel remove"
                                className="btn btn-primary">
                            Cancel
                        </button>
                        <button onClick={props.confirm} type="button" title="remove hashtag and close this message"
                                className="btn btn-primary">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}