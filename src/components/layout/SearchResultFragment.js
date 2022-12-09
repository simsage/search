import React, {Component} from 'react';
import '../../css/layout/search-results.css';
import Api from "../../common/api";

export default class SearchResultFragment extends Component {
    render() {
        const text_list = this.props.text_list ? this.props.text_list : [];
        const similar_document_list = this.props.similar_document_list ? this.props.similar_document_list : [];
        return (
            <div>
            {
                text_list.map( (text, i) => {
                    const _text = Api.highlight(text);
                    return (
                        <div key={i}>
                            <p className="small fw-light mb-2" dangerouslySetInnerHTML={{ __html: _text}} />
                            {similar_document_list && similar_document_list.length > 0 &&
                                <div>
                                    <div className="similar-document-title">similar documents</div>
                                    <ul>
                                        {
                                            similar_document_list.map((similar, j) => {
                                                return (<li key={i * 100 + j} className="similar-document-link">
                                                    {similar.url}
                                                </li>);
                                            })
                                        }
                                    </ul>
                                </div>
                            }
                        </div>
                    );
                })
            }
            </div>
        );
    }
}

