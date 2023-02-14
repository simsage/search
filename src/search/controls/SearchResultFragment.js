import './SearchResultFragment.css';
import {
    download, get_client_id, get_metadata_list, highlight,
    unix_time_convert, url_to_bread_crumb
} from "../../common/Api";
import React from "react";

export function SearchResultFragment(props) {
    const result = props.result;
    const session = props.session;
    const session_id = (session && session.id) ? session.id : "null";
    const client_id = get_client_id();
    const text_list = result.textList ? result.textList : [];
    const similar_document_list = result.similarDocumentList ? result.similarDocumentList : [];
    const last_modified = unix_time_convert(result.lastModified);
    const title = result.title ? result.title : "";
    const metadata_lists = get_metadata_list(result.metadata);
    const tag_list = metadata_lists["tag_list"];
    // Prefer the metadata url to the doc's url as the later might be the source id (Sharepoint)
    const url = result.metadata["{url}"] && result.metadata["{url}"].trim().length > 0 ? result.metadata["{url}"] : result.url

    function click_preview_image(event, result, url) {
        if (!window.ENV.show_previews) {
            download(url, session_id);

        } else if (props.set_focus_for_preview) {
            props.set_focus_for_preview(result);
        }
    }

    function preview_image_url(result) {
        if (result && client_id && result.urlId) {
            return window.ENV.api_base + "/document/preview/" + window.ENV.organisation_id + "/" +
                window.ENV.kb_id + "/" + client_id + "/" + session_id + "/" + result.urlId + "/-1"
        } else {
            return "";
        }
    }

    function handle_title_click(result, url) {
        if (!window.ENV.show_previews) {
            download(url, session_id);
        } else if (props.set_focus_for_preview) {
            props.set_focus_for_preview(result);
        }
    }

    return (
        <div className="result-content d-flex pb-4 mb-3 px-3">
            <img onClick={(event) => click_preview_image(event, result, url)}
                 src={preview_image_url(result)} alt="" className="result-preview d-none d-lg-block pointer-cursor"/>
            <div className="ms-3 w-100">
                <div className="d-flex align-items-center text-align-end mb-1">
                    <p className="mb-0 result-breadcrumb me-2">{url_to_bread_crumb(url)}</p>
                </div>
                <span className="mb-2 results-filename text-break pointer-cursor"
                      onClick={() => {
                          handle_title_click(result, url)
                      }} title={url}>{title ? title : url}</span>
                <div className="d-flex align-items-center mb-1">
                    <span className="mb-0 result-details-title">{url}</span>
                </div>
                <div className="d-flex align-items-center mb-1">
                    <span className="mb-0 result-details">Last modified {last_modified}</span>
                    {result.author &&
                        <span className="d-flex align-items-center">
                            <span className="mb-0 result-details mx-2">|</span>
                            <span className="mb-0 result-details">{result.author}</span>
                        </span>
                    }
                </div>
                {
                    text_list.map((text, i) => {
                        const _text = highlight(text);
                        return (
                            <div key={i}>
                                <p className="small fw-light mb-2" dangerouslySetInnerHTML={{__html: _text}}/>
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
                <div className="d-flex align-items-center flex-wrap">
                    {tag_list.map((tag, i) => {
                        return (<span className="tag me-2 mb-2" key={1000 + i}>{tag.value}</span>);
                    })}
                </div>
            </div>
        </div>
    )
}

