import './SearchResultFragment.css';
import {
    download,
    get_archive_child, get_archive_child_last,
    get_archive_parent,
    highlight,
    is_archive_file, is_online,
    is_viewable,
    unix_time_convert,
} from "../../common/Api";
import React from "react";
import {
    select_document_for_ai_query, set_focus_for_preview, teach
} from "../../reducers/searchSlice";
import {useSelector} from "react-redux";
import * as Api from "../../common/Api";
import {ResultIconDisplay} from "../../common/ResultIconDisplay";
import {useTranslation} from "react-i18next";
import { RootState, AppDispatch } from '../../store';
import { useDispatch as useReduxDispatch } from "react-redux";

import icon_conv from "../../assets/images/ui/conversation-icon.svg"
import icon_conv_dark from "../../assets/images/ui/conversation-icon-dark.svg"
import {RelatedDocument, SearchResult} from "../../types";

// Use AppDispatch type for dispatch
const useAppDispatch = () => useReduxDispatch<AppDispatch>();

interface CompactSearchResultFragmentProps {
    result: SearchResult;
    on_seach?: () => void;
}

export function CompactSearchResultFragment(props: CompactSearchResultFragmentProps): JSX.Element {

    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    // user access
    const {user, session} = useSelector((state: RootState) => state.authReducer)
    const {source_list, ai_enabled, show_source_icon, theme, effective_search_string, boost_document_id_list} = useSelector((state: RootState) => state.searchReducer);

    const result = props.result;
    const session_id = (session && session.id) ? session.id : "null";
    const text_list = result.textList ? result.textList : [];
    const similar_document_list = result.similarDocumentList ? result.similarDocumentList : [];
    const related_document_list = result.relatedList ? result.relatedList : [];
    const parent_list = related_document_list.filter(rel => !rel.isChild);
    const child_list = related_document_list.filter(rel => rel.isChild);
    const last_modified = unix_time_convert(result.lastModified);
    const title = result.title ? result.title : "";
    // Prefer the metadata url to the doc's url as the later might be the source id (Sharepoint)
    const url = result.metadata["{url}"] && result.metadata["{url}"].trim().length > 0 ? result.metadata["{url}"] : result.url

    // does this user have the "teacher" role?
    let is_teacher = (user && user.roles) ? (user.roles.filter((role: {role: string}) => role.role === "teacher").length > 0) : false;

    // is this a custom render type (like a db record)?
    const custom_render_type = result && result.renderType === "rt custom";
    let custom_render_html = "";
    if (custom_render_type) {
        custom_render_html = highlight(text_list.length > 0 ? text_list[0] : "", theme);
    }

    // select url as a document for AI focus
    function selectDocumentForAIQuery(): void {
        // Convert urlId to number or use 0 as default
        const urlIdNumber = result.urlId ? parseInt(result.urlId, 10) : 0;
        dispatch(select_document_for_ai_query(
            {url: result.url, title: title, url_id: urlIdNumber}
        ))
    }

    function handle_title_click(result: SearchResult | RelatedDocument, url: string): void {
        if (!window.ENV.show_previews) {
            check_teach()
            download(get_archive_parent(url), session_id);
        } else {
            dispatch(set_focus_for_preview(result))
        }
    }

    function check_teach(): void {
        if (is_teacher) {
            dispatch(teach({
                session: session, 
                search_text: effective_search_string,
                result: result, 
                increment: 1, // Using 1 instead of true to match expected number type
                on_done: () => {
                    if (props.on_seach) props.on_seach()
                }
            }))
        }
    }

    function check_un_teach(): void {
        if (is_teacher) {
            dispatch(teach({
                session: session, 
                search_text: effective_search_string,
                result: result, 
                increment: 0, // Using 0 instead of false to match expected number type
                on_done: () => {
                    if (props.on_seach) props.on_seach()
                }
            }))
        }
    }

    function get_title_for_links(url: string): string {
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

    const source_set: Record<string, any> = {}
    let source_type = ""
    if (source_list && source_list.length > 0) {
        for (const source of source_list) {
            source_set[source.sourceId] = source;
        }
        if (result && result.sourceId && source_set.hasOwnProperty(result.sourceId)) {
            source_type = source_set[result.sourceId].sourceType ?? ""
        }
    }

    const result_details = theme === "light" ? "result-details" : "result-details-dark"
    const results_details_title = theme === "light" ? "result-details-title" : "result-details-title-dark"
    const results_filename = theme === "light" ? "results-filename" : "results-filename-dark"
    const search_result = theme === "light" ? "search-result-text" : "search-result-text-dark"
    const similar_document = theme === "light" ? "similar-document-link" : "similar-document-link-dark"

    // is this search result boosted?
    const boosted = window.ENV.show_boost_controls && result && result.urlId && boost_document_id_list &&
        boost_document_id_list.find((id) => id === result.urlId) !== undefined
    const can_undo = boosted && is_teacher

    return (
        <>
            <div className="d-flex pb-1 mb-3 px-3">
                {/*** SHOW SOURCE ICONS ONLY in compact mode ***/}
                { show_source_icon &&
                    <ResultIconDisplay
                        result={result}
                        url={url}
                        check_teach={check_teach}
                    />
                }

                { custom_render_type &&
                    <div dangerouslySetInnerHTML={{__html: custom_render_html}}/>
                }
                { !custom_render_type &&
                    <div className="ms-3 w-100">

                        { (window.ENV.show_previews || !is_online(url)) &&
                        <span className={results_filename + " mb-2 text-break pointer-cursor"}
                              onClick={() => {
                                  handle_title_click(result, url)
                              }} title={get_title_for_links(url)}>
                                {boosted && <span>&#x2B50;</span>}
                                {title ? title : url}
                        </span>
                        }

                        { !window.ENV.show_previews && is_online(url) &&
                            <a href={get_archive_parent(url)} rel="noreferrer" target="_blank" className={results_filename + " mb-2 text-break pointer-cursor font-size-adjust"}
                               title={get_title_for_links(url)} onClick={() => check_teach()}>
                                {boosted && <span>&#x2B50;</span>}
                                {title ? title : url}
                            </a>
                        }
                        {can_undo && <span className={theme === "light" ? "undo-boost" : "undo-boost-dark"} title={"undo the boost this document was given"} onClick={check_un_teach}>&#x21BA;</span>}

                        {ai_enabled &&
                        <span className="qna-image" title={t("converse with this document")}
                              onClick={() => selectDocumentForAIQuery()}>
                            <span className="in-circle">
                                <img className="circle-image-size" src={theme === "light" ? icon_conv : icon_conv_dark}
                                     alt="conversation"/>
                            </span>
                        </span>
                        }
                        {
                            text_list.map((text, i) => {
                                const _text = highlight(text, theme);
                                return (
                                    <div key={i} className={search_result}>
                                        <p className="small fw-light mb-0" dangerouslySetInnerHTML={{__html: _text}}/>
                                    </div>
                                );
                            })
                        }
                        <div className="d-flex align-items-center mb-0 mt-1">
                            <span className={result_details + " mb-0"}
                                  title={t("Last modified") + " " + last_modified}>{t("Last modified")} {last_modified}</span>
                            {result.author &&
                                <span className="d-flex align-items-center">
                                <span className={result_details + " mb-0 mx-2"}>|</span>
                                <span className={result_details + " mb-0"} title={result.author}>{result.author}</span>
                                <span className={result_details + " mb-0 mx-2"}>|</span>
                                    {is_archive_file(url) &&
                                        <span>
                                        <span
                                            className={results_details_title + " mb-0"}>{get_archive_child_last(url)}</span>&nbsp;
                                            <span className={results_details_title + " mb-0"}>inside</span>&nbsp;
                                            <span
                                                className={results_details_title + " mb-0"}>{get_archive_parent(url)}</span>
                                    </span>
                                    }
                                    {!is_archive_file(url) &&
                                        <span className={results_details_title + " mb-0"} title={url}>{url}</span>
                                    }
                            </span>
                            }
                        </div>
                        {
                            text_list.length > 0 &&
                            <div>
                                {parent_list && parent_list.length > 0 &&
                                    <div className="border-top line-width-limited">
                                        <div
                                            className="similar-document-title">{source_type === "discourse" ? "topic" : "parent document"}</div>
                                        <ul>
                                            {
                                                parent_list.map((item, j) => {
                                                    const title = item.title ? item.title : (item.webUrl ? item.webUrl : item.relatedUrl);
                                                    return (<li key={j} className={similar_document}
                                                                onClick={() => handle_title_click(item, item.webUrl ? item.webUrl : item.relatedUrl)}
                                                                title={get_title_for_links(item.webUrl ? item.webUrl : item.relatedUrl)}>
                                                        {title}
                                                    </li>);
                                                })
                                            }
                                        </ul>
                                    </div>
                                }
                                {child_list && child_list.length > 0 &&
                                    <div className="border-top line-width-limited">
                                        <div
                                            className="similar-document-title">{source_type === "discourse" ? "replies" : "attachments"}</div>
                                        <ul>
                                            {
                                                child_list.map((item, j) => {
                                                    const title = item.title ? item.title : (item.webUrl ? item.webUrl : item.relatedUrl);
                                                    return (<li key={j} className={similar_document}
                                                                onClick={() => handle_title_click(item, item.relatedUrl)}
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
                                    <div className="border-bottom line-width-limited"/>
                                }
                                {similar_document_list && similar_document_list.length > 0 &&
                                    <div>
                                        <div className="similar-document-title">similar documents</div>
                                        <ul>
                                            {
                                                similar_document_list.map((similar, j) => {
                                                    return (<li key={j} className={similar_document}>
                                                        {similar.url}
                                                    </li>);
                                                })
                                            }
                                        </ul>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                }
            </div>
        </>
    )
}
