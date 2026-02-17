import './SearchResultFragment.css';
import {
    download,
    get_archive_child, get_archive_child_last,
    get_archive_parent,
    highlight,
    is_archive_file,
    is_viewable, limit_text, time_ago
} from "../../common/Api";
import React from "react";
import {
    set_focus_for_ai_queries,
    set_focus_for_preview
} from "../../reducers/searchSlice";
import {useDispatch, useSelector} from "react-redux";
import * as Api from "../../common/Api";
import {AIResultIconDisplay} from "../../common/AIResultIconDisplay";
import {useTranslation} from "react-i18next";
import { RootState, AppDispatch } from '../../store';

// Use AppDispatch type for dispatch
const useAppDispatch = () => useDispatch<AppDispatch>();

interface AIResultFragmentProps {
    result: any;
}

export function AIResultFragment(props: AIResultFragmentProps): JSX.Element {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    // user access
    const {session} = useSelector((state: RootState) => state.authReducer);
    const {source_list, theme, boost_document_id_list} = useSelector((state: RootState) => state.searchReducer);

    const result = props.result;
    const session_id = (session && session.id) ? session.id : "null";
    const text_list = result.textList ? result.textList : [];
    const related_document_list = result.relatedList ? result.relatedList : [];
    const parent_list = related_document_list.filter((rel: any) => rel.relationshipType === 0);
    const child_list = related_document_list.filter((rel: any) => rel.relationshipType === 1);
    const similar_list = related_document_list.filter((rel: any) => rel.relationshipType === 2);
    const last_modified = result.lastModified;
    const title = result.title ? result.title : "";
    // Prefer the metadata url to the doc's url as the later might be the source id (Sharepoint)
    const url = result.metadata["{url}"] && result.metadata["{url}"].trim().length > 0 ? result.metadata["{url}"] : result.url;

    // is this a custom render type (like a db record)?
    const custom_render_type = result && result.renderType === "rt custom";
    let custom_render_html = "";
    if (custom_render_type) {
        custom_render_html = highlight(text_list.length > 0 ? text_list[0] : "", theme);
    }

    function handle_title_click(result: any, url: string): void {
        if (!window.ENV.show_previews) {
            download(url, session_id); // download has logic to determine what to do with archives
        } else {
            dispatch(set_focus_for_preview(result));
        }
    }

    function get_title_for_links(url: string): string {
        const actual_url = get_archive_child(url);
        if (window.ENV.show_previews) {
            return "preview \"" + actual_url + "\"";
        } else {
            if (is_viewable(url)) {
                return "open \"" + actual_url + "\" in the browser";
            } else if (!Api.is_archive_file(url)) {
                return "download \"" + actual_url + "\" to your computer";
            } else {
                return "cannot download archive file \"" + actual_url + "\"";
            }
        }
    }

    function target_focus(): void {
        dispatch(set_focus_for_ai_queries(result));
    }

    const source_set: Record<string, any> = {};
    let source_type = "";
    if (source_list && source_list.length > 0) {
        for (const source of source_list) {
            source_set[source.sourceId] = source;
        }
        if (result && source_set.hasOwnProperty(result.sourceId)) {
            source_type = source_set[result.sourceId].sourceType ?? "";
        }
    }

    const result_details = theme === "light" ? "result-details" : "result-details-dark";
    const results_details_title = theme === "light" ? "result-details-title" : "result-details-title-dark";
    const results_filename = theme === "light" ? "results-filename" : "results-filename-dark";
    const search_result = theme === "light" ? "search-result-text" : "search-result-text-dark";
    const similar_document = theme === "light" ? "similar-document-link" : "similar-document-link-dark";

    // is this search result boosted?
    const boosted = window.ENV.show_boost_controls && result && result.urlId && boost_document_id_list &&
        boost_document_id_list.find((id) => id === result.urlId) !== undefined;

    return (
        <>
            <div className={"d-flex px-3 " + (theme === "light" ? "ai-result-fragment-bg-light" : "ai-result-fragment-bg-dark")}>
                <div className={(theme === "light" ? "ai-result-inside" : "ai-result-inside-dark")}>
                    { custom_render_type &&
                        <div dangerouslySetInnerHTML={{__html: custom_render_html}}/>
                    }
                    { !custom_render_type &&
                        <div className="ms-3 w-100">
                            { (window.ENV.show_previews || !is_viewable(url)) &&
                                <div>
                                    <AIResultIconDisplay
                                        result={result}
                                        url={url}
                                    />
                                    <span className={"target-symbol"} title={"focus on this document"} onClick={target_focus}>&#x1F78B;</span>
                                    <span className={results_filename + " mb-2 text-break pointer-cursor"}
                                          onClick={() => {
                                              handle_title_click(result, url);
                                          }} title={get_title_for_links(url)}>
                                            {boosted && <span>&#x2B50;</span>}
                                            {title ? title : url}
                                    </span>
                                </div>
                            }

                            { !window.ENV.show_previews && is_viewable(url) &&
                                <div>
                                    <AIResultIconDisplay
                                        result={result}
                                        url={url}
                                    />
                                    <span className={"target-symbol"} title={"focus on this document"} onClick={target_focus}>&#x1F78B;</span>
                                    <a href={get_archive_parent(url)} rel="noreferrer" target="_blank" className={results_filename + " mb-2 text-break pointer-cursor font-size-adjust"}
                                       title={get_title_for_links(url)}>
                                        {boosted && <span>&#x2B50;</span>}
                                        {title ? title : url}
                                    </a>
                                </div>
                            }

                            {
                                text_list.map((text: any, i: number) => {
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
                                      title={t("Last modified") + " " + time_ago(last_modified)}>{t("Last modified")} {time_ago(last_modified)}</span>
                                {result.author &&
                                    <span className="d-flex align-items-center">
                                    <span className={result_details + " mb-0 mx-2"}>|</span>
                                    <span className={result_details + " mb-0"} title={result.author}>{limit_text(result.author, 30)}</span>
                                    <span className={result_details + " mb-0 mx-2"}>|</span>
                                        {is_archive_file(url) &&
                                            <span>
                                            <span
                                                className={results_details_title + " mb-0"}>{limit_text(get_archive_child_last(url), 60)}</span>&nbsp;
                                                <span className={results_details_title + " mb-0"}>inside</span>&nbsp;
                                                <span
                                                    className={results_details_title + " mb-0"}>{limit_text(get_archive_parent(url), 60)}</span>
                                        </span>
                                        }
                                        {!is_archive_file(url) &&
                                            <span className={results_details_title + " mb-0"} title={url}>{limit_text(url, 60)}</span>
                                        }
                                </span>
                                }
                            </div>
                            <div>
                                {parent_list && parent_list.length > 0 &&
                                    <div className="border-top line-width-limited">
                                        <div
                                            className="similar-document-title">{source_type === "discourse" ? "topic" : "parent document"}</div>
                                        <ul>
                                            {
                                                parent_list.map((item: any, j: number) => {
                                                    const title = item.webUrl ? item.webUrl : item.relatedUrl;
                                                    return (<li key={j} className={similar_document}>{title}</li>);
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
                                                child_list.map((item: any, j: number) => {
                                                    const title = item.webUrl ? item.webUrl : item.relatedUrl;
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
                                {similar_list && similar_list.length > 0 &&
                                    <div>
                                        <div className="similar-document-title">{"similar documents" + (similar_list.length === 10 ? " (top 10)" : "")}</div>
                                        <ul>
                                            {
                                                similar_list.map((item: any, j: number) => {
                                                    const title = item.webUrl ? item.webUrl : item.relatedUrl;
                                                    return (<li key={j} className={similar_document} title={title}>
                                                        {limit_text(title, 100)}
                                                    </li>);
                                                })
                                            }
                                        </ul>
                                    </div>
                                }
                                {
                                    ((child_list && child_list.length > 0) || (parent_list && parent_list.length > 0) ||
                                    (similar_list && similar_list.length > 0)) &&
                                    <div className="border-bottom line-width-limited"/>
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>
        </>
    );
}
