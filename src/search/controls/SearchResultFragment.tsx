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
import React, {useState} from "react";
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
    const [is_similar_open, setSimilarIsOpen] = useState(false);
    const [is_children_open, setChildrenIsOpen] = useState(false);
    const [is_parent_open, setParentIsOpen] = useState(false);

    const result = props.result;
    const session_id = (session && session.id) ? session.id : "null";
    const text_list = result.textList ? result.textList : [];
    const related_document_list = result.relatedList ? result.relatedList : [];
    const parent_list = related_document_list.filter((rel: any) => rel.relationshipType === 0);
    const child_list = related_document_list.filter((rel: any) => rel.relationshipType === 1);
    const similar_list = related_document_list.filter((rel: any) => rel.relationshipType === 2);
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

    const toggle_similar_open = () => setSimilarIsOpen(!is_similar_open);
    const toggle_children_open = () => setChildrenIsOpen(!is_children_open);
    const toggle_parent_open = () => setParentIsOpen(!is_parent_open);

    function click_preview_image(
        source: SourceItem | undefined,
        result: SearchResult | RelatedDocument,
        url: string
    ): void {
        if (!window.ENV.show_previews) {
            if (can_click(source, url))
                download(url, session_id); // download has the smarts for archive vs archive child logic
        } else {
            dispatch(set_focus_for_preview(result))
        }
    }

    function get_title_for_links(source: SourceItem | undefined, url: string): string {
        const actual_url = get_archive_child(url)
        if (window.ENV.show_previews) {
            return "preview \"" + actual_url + "\"";
        } else {
            if (is_viewable(url)) {
                return t("open") + " \"" + url + "\" " + t("in the browser");
            } else if (!Api.is_archive_file(url) && source && source.storeBinary) {
                return "download \"" + actual_url + "\" to your computer";
            } else if (source && !source.storeBinary) {
                return "this source does not have access to the original file \"" + actual_url + "\"";
            } else {
                return "cannot download archive file \"" + actual_url + "\"";
            }
        }
    }

    // can this item for this source be clicked?
    function can_click(source: SourceItem | undefined, url: string): boolean {
        if (window.ENV.show_previews) {
            return true
        } else {
            if (is_viewable(url)) {
                return true
            } else if (!Api.is_archive_file(url) && source && source.storeBinary) {
                return true
            }
        }
        return false
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
    let source: SourceItem | undefined = undefined
    let source_type = ""
    if (source_list && source_list.length > 0) {
        for (const source of source_list) {
            source_set[source.sourceId] = source;
        }
        if (result && result.sourceId && source_set.hasOwnProperty(result.sourceId)) {
            source_type = source_set[result.sourceId].sourceType ?? ""
            source = source_set[result.sourceId]
        }
    }

    const results_filename = theme === "light" ? "results-filename" : "results-filename-dark"
    const search_result = theme === "light" ? "search-result-text" : "search-result-text-dark"
    const similar_document_css = theme === "light" ? "similar-document-link" : "similar-document-link-dark"

    return (
        <div className="d-flex pb-2 mb-3 px-3">
            {/*** SHOW PREVIEW OR SOURCE ICON ***/}
            <ResultIconDisplay
                source={source}
                result={result}
                url={url}
            />

            {custom_render_type &&
                <div dangerouslySetInnerHTML={{__html: custom_render_html}}/>
            }
            {!custom_render_type &&
                <div className="ms-3 w-100">
                {/********************** TITLE (FILE NAME) **********************/}
                { (window.ENV.show_previews && !can_click(source, url)) &&
                <span className={results_filename + " mb-2 text-break " + (can_click(source, url) ? "pointer-cursor": "")}
                      onClick={() => click_preview_image(source, result, url)}
                                title={get_title_for_links(source, url)}>
                        {title ? title : url}
                </span>
                }
                { language &&
                    <span className="ps-2 small-font d-inline-block" style={{cursor: "default", color: '#888'}} title={language}>
                        &nbsp;{language}&nbsp;
                    </span>
                }
                { !window.ENV.show_previews && can_click(source, url) &&
                    <a href={get_archive_parent(url)} rel="noreferrer" target="_blank" className={results_filename + " mb-2 text-break pointer-cursor"}
                       title={get_title_for_links(source, url)}>
                        {title ? title : url}
                    </a>
                }
                { !window.ENV.show_previews && !can_click(source, url) &&
                    <span className={results_filename + " mb-2 text-break"}
                       title={get_title_for_links(source, url)}>
                        {title ? title : url}
                    </span>
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
                        <div className="line-width-limited">
                            <span className={`bi bi-chevron-right me-2 transition-transform ${is_parent_open ? 'rotate-90' : ''}`}
                                  title="Open or Close this topic/parent list"
                                  onClick={() => toggle_parent_open()}></span>
                            <span className="similar-document-title">
                                {source_type === "discourse" ? "topic (" : "parent document (" + parent_list.length + ")"}
                            </span>
                                { is_parent_open &&
                                <ul>
                                    {
                                    parent_list.map((item, j) => {
                                        const title = item.webUrl ? item.webUrl : item.relatedUrl;
                                        const url = map_url(result.sourceId, title)
                                        return (
                                            <div key={"parent-document-" + j}>
                                                <CopyToClipboard
                                                    web_url={url}
                                                    url={get_archive_parent(url)}
                                                    title={get_archive_pretty_print(url)}
                                                    extra_style={similar_document_css}
                                                    text_limit={max_text_length_for_links}
                                                />
                                            </div>
                                        )
                                    })
                                    }
                                </ul>
                                }
                        </div>
                    }
                    {child_list && child_list.length > 0 &&
                        <div className="line-width-limited">
                            <span className={`bi bi-chevron-right me-2 transition-transform ${is_children_open ? 'rotate-90' : ''}`}
                                  title="Open or Close this reply/attachment list"
                                  onClick={() => toggle_children_open()}></span>
                            <span className="similar-document-title">
                                {source_type === "discourse" ? "replies (" : "attachments (" + child_list.length + ")"}
                            </span>
                                { is_children_open &&
                                <ul>
                                    {
                                    child_list.map((item, j) => {
                                        const title = item.webUrl ? item.webUrl : item.relatedUrl;
                                        const url = map_url(result.sourceId, title)
                                        const title_url = map_url(result.sourceId, item.relatedUrl)
                                        return (
                                            <div key={"attachments-" + j}>
                                                <CopyToClipboard
                                                    web_url={url}
                                                    url={get_archive_parent(url)}
                                                    title={get_archive_pretty_print(title_url)}
                                                    extra_style={similar_document_css}
                                                    text_limit={max_text_length_for_links}
                                                />
                                            </div>
                                        )
                                    })
                                    }
                                </ul>
                                }
                        </div>
                    }
                    {similar_list && similar_list.length > 0 &&
                        <div>
                            <span className={`bi bi-chevron-right me-2 transition-transform ${is_similar_open ? 'rotate-90' : ''}`}
                                 title="Open or Close this similar documents list"
                                 onClick={() => toggle_similar_open()}></span>
                            <span className="similar-document-title">
                                {"similar documents (" + similar_list.length + ")"}
                            </span>
                            { is_similar_open &&
                                <ul>
                                {
                                similar_list.map((similar, j) => {
                                    let url = similar.webUrl ? similar.webUrl : similar.relatedUrl
                                    const url_mapped = map_url(result.sourceId, url)
                                    return (
                                        <div key={"similar-document-" + j}>
                                            <CopyToClipboard
                                                web_url={url_mapped}
                                                url={get_archive_parent(url_mapped)}
                                                title={get_archive_pretty_print(url_mapped)}
                                                extra_style={similar_document_css}
                                                text_limit={max_text_length_for_links}
                                            />
                                        </div>
                                    )
                                })
                            }
                            </ul>
                            }
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
