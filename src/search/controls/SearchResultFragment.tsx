import './SearchResultFragment.css';
import {
    download,
    get_archive_child,
    get_archive_parent,
    get_archive_pretty_print,
    highlight,
    is_viewable,
    language_lookup,
    map_url,
    unescape_owasp
} from "../../common/Api";
import React from "react";
import {
    create_short_summary,
    select_document_for_ai_query,
    set_focus_for_preview,
} from "../../reducers/searchSlice";
import {useSelector} from "react-redux";
import * as Api from "../../common/Api";
import {ResultIconDisplay} from "../../common/ResultIconDisplay";
import {useTranslation} from "react-i18next";
import { RootState, AppDispatch } from '../../store';
import { useDispatch as useReduxDispatch } from "react-redux";
import {RelatedDocument, SearchResult, SourceItem} from '../../types';

import icon_conv from "../../assets/images/ui/conversation-icon.svg"
import icon_conv_dark from "../../assets/images/ui/conversation-icon-dark.svg"

import {BoostStarScoring} from "./BoostStarScoring";
import {HashTags} from "./HashTags";
import {SearchResultDetails} from "./SearchResultDetails";
import CopyToClipboard from "../../common/CopyToClipboard";

// Use AppDispatch type for dispatch
const useAppDispatch = () => useReduxDispatch<AppDispatch>();

interface SearchResultFragmentProps {
    result: SearchResult;
    on_seach?: (values?: any) => void;
}

export function SearchResultFragment(props: SearchResultFragmentProps): JSX.Element {

    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    // used below to limit text link lengths
    const max_text_length_for_links = 150

    // user access
    const {session} = useSelector((state: RootState) => state.authReducer)
    const {source_list, summaries, ai_enabled, theme} = useSelector((state: RootState) => state.searchReducer);

    const result = props.result;
    const session_id = (session && session.id) ? session.id : "null";
    const text_list = result.textList ? result.textList : [];
    const similar_document_list = result.similarDocumentList ? result.similarDocumentList : [];
    const related_document_list = result.relatedList ? result.relatedList : [];
    const parent_list = related_document_list.filter(rel => !rel.isChild);
    const child_list = related_document_list.filter(rel => rel.isChild);
    const title = result.title ? result.title : "";
    const summary = summaries[result.url] ? summaries[result.url] : "";
    // Prefer the metadata url to the doc's url as the later might be the source id (Sharepoint)
    const url = result.metadata["{url}"] && result.metadata["{url}"].trim().length > 0 ? result.metadata["{url}"] : result.url

    // get the name of the foreign language of this document if applicable
    const document_language = result.metadata["{language}"] ? result.metadata["{language}"] : null;
    const language = language_lookup && document_language && document_language !== "en" ? language_lookup[document_language] : null;

    // is this a custom render type (like a db record)?
    const custom_render_type = result && result.renderType === "rt custom";
    let custom_render_html = "";
    if (custom_render_type) {
        custom_render_html = highlight(text_list.length > 0 ? text_list[0] : "", theme);
    }

    function click_preview_image(result: SearchResult | RelatedDocument, url: string): void {
        if (!window.ENV.show_previews) {
            download(url, session_id); // download has the smarts for archive vs archive child logic
        } else {
            dispatch(set_focus_for_preview(result))
        }
    }

    function get_title_for_links(url: string): string {
        const actual_url = get_archive_child(url)
        if (window.ENV.show_previews) {
            return "preview \"" + actual_url + "\"";
        } else {
            if (is_viewable(url)) {
                return t("open") + " \"" + url + "\" " + t("in the browser");
            } else if (!Api.is_archive_file(url)) {
                return "download \"" + actual_url + "\" to your computer";
            } else {
                return "cannot download archive file \"" + actual_url + "\"";
            }
        }
    }

    // summarize a snippet of search-result
    function createSnippetSummary(event: React.MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        dispatch(create_short_summary({
            session: session,
            target_url: result.url,
            // Convert to string as required by the API
            sentence_id: result.firstSentence !== undefined ? result.firstSentence.toString() : "0"
        }))
    }

    // summarize an article from the start
    function createArticleSummary(event: React.MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        dispatch(create_short_summary({
            session: session,
            target_url: result.url,
            // Convert to string as required by the API
            sentence_id: "0"
        }))
    }

    // select url as a document for AI focus
    function selectDocumentForAIQuery(): void {
        // Convert urlId to number or use 0 as default
        const urlIdNumber = result.urlId ? result.urlId : 0;
        dispatch(select_document_for_ai_query(
            {url: result.url, title: title, url_id: urlIdNumber}
        ))
    }

    const source_set: Record<string, SourceItem> = {}
    let source_type = ""
    if (source_list && source_list.length > 0) {
        for (const source of source_list) {
            source_set[source.sourceId] = source;
        }
        if (result && result.sourceId && source_set.hasOwnProperty(result.sourceId)) {
            source_type = source_set[result.sourceId].sourceType ?? ""
        }
    }

    const results_filename = theme === "light" ? "results-filename" : "results-filename-dark"
    const search_result = theme === "light" ? "search-result-text" : "search-result-text-dark"
    const similar_document_css = theme === "light" ? "similar-document-link" : "similar-document-link-dark"

    return (
        <div className="d-flex pb-2 mb-3 px-3">
            {/*** SHOW PREVIEW OR SOURCE ICON ***/}
            <ResultIconDisplay
                result={result}
                url={url}
            />

            {custom_render_type &&
                <div dangerouslySetInnerHTML={{__html: custom_render_html}}/>
            }
            {!custom_render_type &&
                <div className="ms-3 w-100">
                {/********************** TITLE (FILE NAME) **********************/}
                { (window.ENV.show_previews || !is_viewable(url)) &&
                <span className={results_filename + " mb-2 text-break pointer-cursor"}
                      onClick={() => {
                          click_preview_image(result, url)
                      }} title={get_title_for_links(url)}>
                        {title ? title : url}
                </span>
                }
                { language &&
                    <span className="ps-2 small-font d-inline-block" style={{cursor: "default"}} title={language}>
                        &nbsp;{language}&nbsp;
                    </span>
                }
                { !window.ENV.show_previews && is_viewable(url) &&
                    <a href={get_archive_parent(url)} rel="noreferrer" target="_blank" className={results_filename + " mb-2 text-break pointer-cursor"}
                       title={get_title_for_links(url)}>
                        {title ? title : url}
                    </a>
                }
                { ai_enabled &&
                <span className="qna-image" title={t("converse with this document")}
                      onClick={() => selectDocumentForAIQuery()}>
                    <span className="in-circle">
                        <img className="circle-image-size" src={theme === "light" ? icon_conv : icon_conv_dark}
                             alt="conversation" />
                    </span>
                </span>
                }
                <SearchResultDetails result={result} />
                {
                    text_list.map((text, i) => {
                        const _text = highlight(text, theme);
                        return (
                            <div key={"tl" + i} className={search_result}>
                                <p className="small fw-light mb-2" dangerouslySetInnerHTML={{__html: _text}}/>
                            </div>
                        );
                    })
                }
                <div>
                    {parent_list && parent_list.length > 0 &&
                        <div className="border-top line-width-limited">
                            <div className="similar-document-title">{source_type === "discourse" ? "topic" : "parent document"}</div>
                            <ul>
                                {
                                    parent_list.map((item, j) => {
                                        const title = item.title ? item.title : (item.webUrl ? item.webUrl :item.relatedUrl);
                                        const url = map_url(result.sourceId, title)
                                        return (
                                            <div key={"parent-document-" + j}>
                                                <CopyToClipboard
                                                    web_url={url}
                                                    url={get_archive_parent(url)}
                                                    urlId={result.urlId}
                                                    title={get_archive_pretty_print(url)}
                                                    extra_style={similar_document_css}
                                                    text_limit={max_text_length_for_links}
                                                />
                                            </div>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    }
                    {child_list && child_list.length > 0 &&
                        <div className="border-top line-width-limited">
                            <div className="similar-document-title">{source_type === "discourse" ? "replies" : "attachments"}</div>
                            <ul>
                                {
                                    child_list.map((item, j) => {
                                        const title = item.title ? item.title : (item.webUrl ? item.webUrl :item.relatedUrl);
                                        const url = map_url(result.sourceId, title)
                                        const title_url = map_url(result.sourceId, item.relatedUrl)
                                        return (
                                            <div key={"attachments-" + j}>
                                                <CopyToClipboard
                                                    web_url={url}
                                                    url={get_archive_parent(url)}
                                                    urlId={result.urlId}
                                                    title={get_archive_pretty_print(title_url)}
                                                    extra_style={similar_document_css}
                                                    text_limit={max_text_length_for_links}
                                                />
                                            </div>
                                        )
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
                            <div className="similar-document-title">{"similar documents" + (similar_document_list.length === 10 ? " (top 10)" : "")}</div>
                            <ul>
                            {
                                similar_document_list.map((similar, j) => {
                                    let url = similar.metadataUrl ? similar.metadataUrl : similar.url
                                    const url_mapped = map_url(result.sourceId, url)
                                    return (
                                        <div key={"similar-document-" + j}>
                                            <CopyToClipboard
                                                web_url={url_mapped}
                                                url={get_archive_parent(url_mapped)}
                                                urlId={result.urlId}
                                                title={get_archive_pretty_print(url_mapped)}
                                                extra_style={similar_document_css}
                                                text_limit={max_text_length_for_links}
                                            />
                                        </div>
                                    )
                                })
                            }
                            </ul>
                        </div>
                    }
                </div>
                {
                    summary && summary.length > 0 && ai_enabled &&
                    <div className={(theme === "light" ? "" : "summary-text-dark") + " border-top"}>
                        {
                            summary.split("\n").map((text, i) => {
                                return (<div className="pt-2" key={"summ" + i}>
                                        <span className="py-1" title={text}>{unescape_owasp(text)}</span>
                                    </div>
                                )})
                        }
                    </div>
                }
                {
                    (!summary || summary.length === 0) && ai_enabled && session_id !== "null" &&
                    <div>
                        { !window.ENV.use_article_summary && ai_enabled &&
                            <span className="link" onClick={(event) => createSnippetSummary(event)} title={t("create a short summary of this search-result")}>{t("create summary")}</span>
                        }
                        { window.ENV.use_article_summary && ai_enabled &&
                            <span className="link" onClick={(event) => createArticleSummary(event)} title={t("create a short summary of this document")}>{t("create summary")}</span>
                        }
                    </div>
                }

                {/* tag and star display */}
                <div style={{marginTop: "4px"}}>
                    <BoostStarScoring result={result} on_seach={props.on_seach} />
                    <HashTags result={result} on_seach={props.on_seach} />
                </div>

            </div>
            }
        </div>
    )
}
