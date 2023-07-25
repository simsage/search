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
    is_viewable,
    unix_time_convert,
    url_to_bread_crumb
} from "../../common/Api";
import React from "react";

export function SearchResultFragment(props) {
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
    const metadata_lists = get_metadata_list(result.metadata);
    const tag_list = metadata_lists["tag_list"];
    // Prefer the metadata url to the doc's url as the later might be the source id (Sharepoint)
    const url = result.metadata["{url}"] && result.metadata["{url}"].trim().length > 0 ? result.metadata["{url}"] : result.url
    let url_breadcrumb = url_to_bread_crumb(url);
    if (url_breadcrumb === "owa" && result.metadata["{folder}"] && result.metadata["{folder}"].trim().length > 0) {
        url_breadcrumb = url_to_bread_crumb(result.metadata["{folder}"]);
    }

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
            } else {
                return "download \"" + actual_url + "\" to your computer";
            }
        }
    }

    function item_url(item) {
        return item.webUrl ? item.webUrl : item.relatedUrl;
    }

    // click a parent or attachment email item
    function clickItem(item) {
        if (!item)
            return
        const url = item_url(item);
        download(url, session_id);
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
                </div>
                <span className="mb-2 results-filename text-break pointer-cursor"
                      onClick={() => {
                          handle_title_click(result, url)
                      }} title={get_title_for_links(url)}>{title ? title : url}</span>
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
                                {parent_list && parent_list.length > 0 &&
                                    <div className="border-top line-width-limited">
                                        <div className="similar-document-title">parent email</div>
                                        <ul>
                                            {
                                                parent_list.map((item, j) => {
                                                    const title = item.title ? item.title : (item.webUrl ? item.webUrl :item.relatedUrl);
                                                    const viewable = is_viewable(item_url(item));
                                                    return (<li key={i * 100 + j} className="similar-document-link" onClick={() => clickItem(item)}
                                                                title={viewable ? ("open email '" + title + "'") : ("download '" + title + "'")}>
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
                                                    const viewable = is_viewable(item_url(item));
                                                    return (<li key={i * 100 + j} className="similar-document-link" onClick={() => clickItem(item)}
                                                                title={viewable ? ("view attachment '" + title + "'") : ("download '" + title + "'")}>
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

