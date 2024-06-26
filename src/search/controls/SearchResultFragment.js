import './SearchResultFragment.css';
import {
    download,
    get_archive_child, get_archive_child_last,
    get_archive_parent,
    get_client_id,
    get_metadata_list,
    getKbId,
    highlight,
    is_archive_file,
    is_viewable, language_lookup,
    unix_time_convert,
    url_to_bread_crumb
} from "../../common/Api";
import React from "react";
import {create_short_summary, select_document_for_ai_query} from "../../reducers/searchSlice";
import {useDispatch} from "react-redux";
import * as Api from "../../common/Api";

export function SearchResultFragment(props) {

    const dispatch = useDispatch();

    const result = props.result;
    const session = props.session;
    const session_id = (session && session.id) ? session.id : "null";
    const client_id = get_client_id();
    const text_list = result.textList ? result.textList : [];
    const similar_document_list = result.similarDocumentList ? result.similarDocumentList : [];
    const related_document_list = result.relatedList ? result.relatedList : [];
    const parent_list = related_document_list.filter(rel => !rel.isChild);
    const child_list = related_document_list.filter(rel => rel.isChild);
    const last_modified = unix_time_convert(result.lastModified);
    const title = result.title ? result.title : "";
    const use_ai = props.use_ai;
    const ai_enabled = props.ai_enabled;
    const metadata_lists = get_metadata_list(result.metadata);
    const summary = props.summaries[result.url] ? props.summaries[result.url] : "";
    const tag_list = metadata_lists["tag_list"];
    // Prefer the metadata url to the doc's url as the later might be the source id (Sharepoint)
    const url = result.metadata["{url}"] && result.metadata["{url}"].trim().length > 0 ? result.metadata["{url}"] : result.url
    let url_breadcrumb = url_to_bread_crumb(url);
    if (url_breadcrumb === "owa" && result.metadata["{folder}"] && result.metadata["{folder}"].trim().length > 0) {
        url_breadcrumb = url_to_bread_crumb(result.metadata["{folder}"]);
    }

    // get the name of the foreign language of this document if applicable
    const document_language = result.metadata["{language}"] ? result.metadata["{language}"] : null;
    const language = language_lookup && document_language &&
                                document_language !== "en" ? language_lookup[document_language] : null;

    // is this a custom render type (like a db record)?
    const custom_render_type = result && result.renderType === "rt custom";
    let custom_render_html = "";
    if (custom_render_type) {
        custom_render_html = highlight(text_list.length > 0 ? text_list[0] : "");
    }

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
                getKbId() + "/" + client_id + "/" + session_id + "/" + result.urlId + "/-1"
        } else {
            return "";
        }
    }

    function handle_title_click(result, url) {
        if (!window.ENV.show_previews) {
            download(get_archive_parent(url), session_id);
        } else if (props.set_focus_for_preview) {
            props.set_focus_for_preview(result);
        }
    }


    function get_title_for_links(url) {
        const actual_url = get_archive_child(url)
        if (window.ENV.show_previews) {
            return "preview \"" + actual_url + "\"";
        } else {
            if (is_viewable(url)) {
                return "open \"" + actual_url + "\" in the browser";
            } else if (!Api.is_archive(url)) {
                return "download \"" + actual_url + "\" to your computer";
            } else {
                return "cannot download archive file \"" + actual_url + "\"";
            }
        }
    }

    // summarize a snippet of search-result
    function createSnippetSummary(event) {
        event.stopPropagation();
        event.preventDefault();
        dispatch(create_short_summary({session: session, target_url: result.url,
                                       sentence_id: result.firstSentence}))
    }

    // summarize an article from the start
    function createArticleSummary(event) {
        event.stopPropagation();
        event.preventDefault();
        dispatch(create_short_summary({session: session, target_url: result.url, sentence_id: 0}))
    }

    // select url as a document for AI focus
    function selectDocumentForAIQuery(url) {
        dispatch(select_document_for_ai_query(
            {url: result.url, title: title, url_id: result.urlId}
        ))
    }

    const source_set = {};
    if (props.source_list && props.source_list.length > 0) {
        for (const source of props.source_list) {
            source_set[source.sourceId] = source;
        }
    }
    const result_source = source_set[result.sourceId];
    let source_type = "";
    if (result_source && result_source.sourceType) {
        source_type = result_source.sourceType;
    }

    return (
        <div className="d-flex pb-4 mb-3 px-3">
            <img onClick={(event) => click_preview_image(event, result, url)}
                 title={get_title_for_links(url)}
                 src={preview_image_url(result)} alt="" className="result-preview d-none d-lg-block pointer-cursor"/>
            { custom_render_type &&
                <div dangerouslySetInnerHTML={{__html: custom_render_html}}/>
            }
            { !custom_render_type &&
            <div className="ms-3" style={{width: "80%"}}>
                <div className="d-flex align-items-center text-align-end mb-1">
                    <p className="mb-0 result-breadcrumb me-2">{url_breadcrumb}</p>
                    { language &&
                        <span className="mb-2" style={{cursor: "default"}} title={language}>
                        &nbsp;{language}&nbsp;
                    </span>
                    }
                </div>
                <span className="mb-2 results-filename text-break pointer-cursor"
                      onClick={() => {
                          handle_title_click(result, url)
                      }} title={get_title_for_links(url)}>{title ? title : url}
                </span>
                { ai_enabled && use_ai &&
                <span className="qna-image" title="converse with this document"
                      onClick={() => selectDocumentForAIQuery(url)}>
                    <span className="in-circle">
                        <img className="circle-image-size" src="../resources/conversation-icon.svg" alt="conversation" />
                    </span>
                </span>
                }
                <div className="d-flex align-items-center mb-1">
                    { is_archive_file(url) &&
                        <span>
                        <span className="mb-0 result-details-title">{get_archive_child_last(url)}</span>&nbsp;
                        <span className="mb-0 text-black result-details-title">inside</span>&nbsp;
                        <span className="mb-0 text-black result-details-title">{get_archive_parent(url)}</span>
                        </span>
                    }
                    { !is_archive_file(url) &&
                        <span className="mb-0 result-details-title">{url}</span>
                    }
                </div>
                {/* web sources don't have a valid last modified display */}
                { source_type !== "web" &&
                    <div className="d-flex align-items-center mb-1">
                        <span className="mb-0 result-details">Last modified {last_modified}</span>
                        {result.author &&
                            <span className="d-flex align-items-center">
                                <span className="mb-0 result-details mx-2">|</span>
                                <span className="mb-0 result-details">{result.author}</span>
                            </span>
                        }
                    </div>
                }
                {
                    text_list.map((text, i) => {
                        const _text = highlight(text);
                        return (
                            <div key={i}>
                                <p className="small fw-light mb-2" dangerouslySetInnerHTML={{__html: _text}}/>
                                {parent_list && parent_list.length > 0 &&
                                    <div className="border-top line-width-limited">
                                        <div className="similar-document-title">parent document</div>
                                        <ul>
                                            {
                                                parent_list.map((item, j) => {
                                                    const title = item.title ? item.title : (item.webUrl ? item.webUrl :item.relatedUrl);
                                                    return (<li key={i * 100 + j} className="similar-document-link"
                                                                onClick={(event) => click_preview_image(event, item, item.relatedUrl)}
                                                                title={get_title_for_links(item.webUrl ? item.webUrl :item.relatedUrl)}>
                                                        {title}
                                                    </li>);
                                                })
                                            }
                                        </ul>
                                    </div>
                                }
                                {child_list && child_list.length > 0 &&
                                    <div className="border-top line-width-limited">
                                        <div className="similar-document-title">attachments</div>
                                        <ul>
                                            {
                                                child_list.map((item, j) => {
                                                    const title = item.title ? item.title : (item.webUrl ? item.webUrl :item.relatedUrl);
                                                    return (<li key={i * 100 + j} className="similar-document-link"
                                                                onClick={(event) => click_preview_image(event, item, item.relatedUrl)}
                                                                title={get_title_for_links(item.relatedUrl)}>
                                                        {title}
                                                    </li>);
                                                })
                                            }
                                        </ul>
                                    </div>
                                }
                                {
                                    ((child_list && child_list.length > 0) || (parent_list && parent_list.length > 0)) &&
                                    <div className="border-bottom line-width-limited" />
                                }
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
                {
                    summary && summary.length > 0 && ai_enabled && use_ai &&
                    <div className="border-top">
                        {
                            summary.split("\n").map((text, i) => {
                                return (<div className="pt-2" key={i}>
                                        <span className="py-1" title={text}>{text}</span>
                                    </div>
                                )})
                        }
                    </div>
                }
                {
                    (!summary || summary.length === 0) && ai_enabled && session_id !== "null" &&
                    <div>
                        { !window.ENV.use_article_summary && ai_enabled && use_ai &&
                            <span className="link" onClick={(event) => createSnippetSummary(event)} title="create a short summary of this search-result">create summary</span>
                        }
                        { window.ENV.use_article_summary && ai_enabled && use_ai &&
                            <span className="link" onClick={(event) => createArticleSummary(event)} title="create a short summary of the document">create summary</span>
                        }
                    </div>
                }
                <div className="d-flex align-items-center flex-wrap">
                    {tag_list.map((tag, i) => {
                        return (<span className="tag me-2 mb-2" key={1000 + i}>{tag.value}</span>);
                    })}
                </div>
            </div>
            }
        </div>
    )
}

