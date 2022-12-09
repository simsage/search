import React, {Component} from 'react';

import '../../css/layout/modal.css';


/**
 * Redact dialog box
 *
 */
export default class RedactDialog extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
        }
    }
    doRedact() {
        if (this.props.onRedact)
            this.props.onRedact();
    }

    updateRedaction(event, data) {
        event.stopPropagation();
        const red = this.props.redaction;
        if (this.props.updateRedaction) {
            this.props.updateRedaction({
                // semantics to filter
                person: red.person,
                location: red.location,
                money: red.money,
                company: red.company,
                law_firm: red.law_firm,
                brand: red.brand,
                // unknowns to add to the semantics
                semantic_csv: red.semantic_csv,
                // additional words to filter
                additional_word_csv: red.additional_word_csv,
                // words always allowed
                allow_word_csv: red.allow_word_csv,
                ...data
            });
        }
    }

    render() {
        if (this.state.has_error) {
            return <h1>redactDialog.js: Something went wrong.</h1>;
        }
        const red = this.props.redaction ? this.props.redaction : {};
        return (
            <div className="modal-container container px-0 dialog-padding dialog-dimensions dialog-float">

                <div className="float-end">
                    <button className="btn pre-btn ms-2 btn-margin-right">
                        <img src="../images/icon/icon_im-close-black.svg" alt="close" title="close" onClick={() => this.props.onClose()} />
                    </button>
                </div>

                <span className="dialog-padding">

                <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                    <input className="form-check-input h6 ms-0 my-0 me-2"
                           type="checkbox" role="switch" id="redact-person"
                           defaultChecked={red.person}
                           onClick={(event) => this.updateRedaction(event, {person: event.target.checked})}
                    />
                    <span className="redact-label">redact people</span>
                </div>

                <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                    <input className="form-check-input h6 ms-0 my-0 me-2"
                           type="checkbox" role="switch" id="redact-location"
                           defaultChecked={red.location}
                           onClick={(event) => this.updateRedaction(event, {location: event.target.checked})}
                    />
                    <span className="redact-label">redact locations</span>
                </div>

                <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                    <input className="form-check-input h6 ms-0 my-0 me-2"
                           type="checkbox" role="switch" id="redact-money"
                           defaultChecked={red.money}
                           onClick={(event) => this.updateRedaction(event, {money: event.target.checked})}
                    />
                    <span className="redact-label">redact moneys</span>
                </div>

                <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                    <input className="form-check-input h6 ms-0 my-0 me-2"
                           type="checkbox" role="switch" id="redact-company"
                           defaultChecked={red.company}
                           onClick={(event) => this.updateRedaction(event, {company: event.target.checked})}
                    />
                    <span className="redact-label">redact companies</span>
                </div>

                <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                    <input className="form-check-input h6 ms-0 my-0 me-2"
                           type="checkbox" role="switch" id="redact-law-firm"
                           defaultChecked={red.law_firm}
                           onClick={(event) => this.updateRedaction(event, {law_firm: event.target.checked})}
                    />
                    <span className="redact-label">redact law-firms</span>
                </div>

                <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                    <input className="form-check-input h6 ms-0 my-0 me-2"
                           type="checkbox" role="switch" id="redact-brand"
                           defaultChecked={red.brand}
                           onClick={(event) => this.updateRedaction(event, {brand: event.target.checked})}
                    />
                    <span className="redact-label">redact brands</span>
                </div>

                <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                    <textarea name="" id="comment-textarea" cols="60" rows="3" className="comment-textarea px-3 py-2"
                              placeholder="additional semantics to redact... (csv text, e.g. staff)" value={red.semantic_csv}
                              onChange={(event) => this.updateRedaction(event, {semantic_csv: event.target.value})} >
                    </textarea>
                </div>

                <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                    <textarea name="" id="comment-textarea" cols="60" rows="3" className="comment-textarea px-3 py-2"
                              placeholder="additional words to redact... (csv text, e.g. Andromeda)" value={red.additional_word_csv}
                              onChange={(event) => this.updateRedaction(event, {additional_word_csv: event.target.value})} >
                    </textarea>
                </div>

                <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                    <textarea name="" id="comment-textarea" cols="60" rows="3" className="comment-textarea px-3 py-2"
                              placeholder="never redact these words... (csv text, e.g. John,John Masters)" value={red.allow_word_csv}
                              onChange={(event) => this.updateRedaction(event, {allow_word_csv: event.target.value})} >
                    </textarea>
                </div>

                <div className="float-end">
                    <button className="btn ms-2" onClick={() => this.doRedact()}>
                        Redact
                    </button>
                </div>

                <br/>
                <br/>
                </span>

            </div>
        );
    }
}
