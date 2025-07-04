import React from "react";
import './SearchResults.css';
import { SearchResultFragment } from "./controls/SearchResultFragment";
import { SynSetSelector } from "./controls/SynSetSelector";
import { SourceSelector } from "./controls/SourceSelector";
import { MetadataSelector } from "./controls/MetadataSelector";
import { useDispatch, useSelector } from "react-redux";
import {
    set_group_similar,
    set_newest_first, set_page_size, set_search_page
} from "../reducers/searchSlice";
import useWindowDimensions from "./controls/useWindowDimensions";
import { CompactSearchResultFragment } from "./controls/CompactSearchResultFragment";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch } from '../store';

const min_width = 1024;

/**
 * Props interface for the SearchResults component
 */
interface SearchResultsProps {
    on_search?: (values?: any) => void;
}

/**
 * A container for most of the items on the page, the search-result fragments,
 * the syn-set selector, any metadata selectors, and the source selector
 */
export function SearchResults(props: SearchResultsProps): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    
    // get state
    const {
        group_similar, newest_first, syn_set_list, syn_set_values, source_list,
        busy, ai_insight, metadata_list, document_type_count,
        total_document_count, ai_response, result_list, search_focus, busy_with_summary,
        busy_with_ai, compact_view, search_page, page_size, theme
    } = useSelector((state: RootState) => state.searchReducer);

    const page_size_options = [10, 25, 50, 75, 100];

    const has_search_result = result_list.length > 0;
    const has_qna_result = ai_response.length > 0;
    const has_insight = ai_insight.length > 0;

    const has_prev_page = search_page > 0;
    const num_pages = (total_document_count % page_size === 0) ?
        (total_document_count / page_size) :
        Math.floor(total_document_count / page_size) + 1;

    const has_next_page = (search_page + 1) < num_pages;

    const { width } = useWindowDimensions();

    const prev_page = (): void => {
        if (search_page > 0 && !busy) {
            dispatch(set_search_page({ search_page: search_page - 1 }));
            search({ search_page: search_page - 1 });
        }
    };

    const setPageSize = (page_size: number): void => {
        dispatch(set_page_size({ page_size: parseInt(page_size.toString()) }));
        search({ search_page: 0, page_size: parseInt(page_size.toString()) });
    };

    const next_page = (): void => {
        if (search_page + 1 < num_pages && !busy) {
            dispatch(set_search_page({ search_page: search_page + 1 }));
            search({ search_page: search_page + 1 });
        }
    };

    function search(values?: any): void {
        if (props.on_search) {
            props.on_search(values);
        }
    }

    function on_set_group_similar(group_similar: boolean): void {
        dispatch(set_group_similar(group_similar));
        search({ group_similar: group_similar, next_page: false, reset_pagination: true });
    }

    function on_set_sort_by_newest(newest_first: boolean): void {
        dispatch(set_newest_first(newest_first));
        search({ newest_first: newest_first, next_page: false, reset_pagination: true });
    }

    let document_count_text = (busy ? t("please wait") :
        (total_document_count === 1) ? t("one-result") :
            ((total_document_count > 0) ?
                ("" + total_document_count.toLocaleString() + t("results")) : t("no-results"))
    );

    const show_preview = (search_focus !== null && window.ENV.show_previews);
    const document_filter = theme === "light" ? "result-document-filter" : "result-document-filter-dark";

    return (
        <div className={(busy && !show_preview) ? "h-100 wait-cursor" : "h-100"}>
            <div className="row mx-0 results-container overflow-auto h-100" id="search-results-id">

                <div className={width && width > min_width ? (compact_view ? "col-9 pe-4" : "col-8 pe-4") : "col-12 pe-4"}>
                    {((!has_qna_result && !has_search_result) || has_search_result) &&
                        <div className="small text-muted ms-2 fw-light px-3 pb-3">
                            {document_count_text}
                            {busy &&
                                <div className="loading-dots-container">
                                    <span className="loading-dots">
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                    </span>
                                </div>
                            }
                        </div>
                    }
                    {(has_qna_result || has_insight) &&
                        <div className={compact_view ? "ps-4 mb-2" : "p-4 mb-3 mx-2"}>
                            {(ai_response?.length || has_insight) &&
                                <section className={theme === "light" ? "message" : "message-dark"}>
                                    <header></header>
                                    <i></i>
                                    <h2>
                                        {
                                            !window.ENV.use_insight && ai_response.split("\n").map((text, i) => {
                                                return (<div className="dialog-text" key={"air" + i}>
                                                        {text.startsWith("http") &&
                                                            <a href={text} target="_blank" rel="noreferrer"
                                                               className="py-1" title={text}>{text}</a>
                                                        }
                                                        {!text.startsWith("http") &&
                                                            <div className="dialog-text" title={text}>{text}</div>
                                                        }
                                                    </div>
                                                );
                                            })
                                        }
                                        {window.ENV.use_insight && has_insight &&
                                            <div className="small-font mt-2 fw-bold mb-2">insight</div>
                                        }
                                        {window.ENV.use_insight && has_insight && ai_insight.split("\n").map((text, i) => {
                                            return (<div className="dialog-text" key={"insight" + i}>
                                                    {!text.startsWith("http") &&
                                                        <div className="insight-text" title={text}>{text}</div>
                                                    }
                                                </div>
                                            );
                                        })
                                        }
                                        <div className="warning-text">
                                            {t("Generative AI can make mistakes. Consider checking important information.")}
                                        </div>
                                    </h2>
                                </section>
                            }
                        </div>
                    }

                    {
                        !compact_view && result_list.map((result, i) => {
                            return (<SearchResultFragment result={result} key={"sr" + i} on_seach={search} />);
                        })
                    }

                    {
                        compact_view && result_list.map((result, i) => {
                            return (<CompactSearchResultFragment result={result} key={"csr" + i} on_seach={search} />);
                        })
                    }

                    { /* infinite scrolling */}
                    {(busy) && !busy_with_ai &&
                        <div>
                            {busy_with_summary ? "creating summary..." : ""}
                        </div>
                    }
                </div>

                {width && width > min_width && !compact_view &&
                    <div className="col-4 mb-5">
                        <div className="sticky-top search-control-padding">

                                <div className={document_filter + " row pb-3"}>
                                    <div className="col-12">
                                        {source_list &&
                                            <div>
                                                <SourceSelector
                                                    on_search={(value) => search({
                                                        ...value,
                                                        next_page: false
                                                    })}/>
                                                <br/>
                                            </div>
                                        }
                                    </div>
                                </div>

                                <div className={document_filter + " row"}>
                                    <div className="col-12">
                                        {metadata_list && metadata_list.length >= 0 && metadata_list.map((item, index) => {
                                            return (
                                                <div key={"mdl_2_" + index}>
                                                    <MetadataSelector key={"mds" + index}
                                                                      title={"Types"}
                                                                      busy={busy}
                                                                      metadata={item.metadata}
                                                                      has_results={has_search_result}
                                                                      on_search={(value) => search({
                                                                          ...value,
                                                                          next_page: false
                                                                      })}
                                                                      item_counts={document_type_count}
                                                                      list={item.items}/>
                                                </div>
                                            );
                                        })
                                        }
                                    </div>
                                </div>

                                <div className={document_filter + " row"}>
                                    <div className="col-12">
                                        <div className={"float-end"} style={{"marginRight": "140px"}}>

                                            <div className="form-check form-switch my-4 ps-0 d-flex">
                                                <input className="form-check-input h6 ms-0 my-0 me-2"
                                                       type="checkbox"
                                                       role="switch"
                                                       disabled={busy}
                                                       checked={group_similar}
                                                       onChange={(event) => on_set_group_similar(event.target.checked)}
                                                />
                                                <label className="" htmlFor="flexSwitchCheckDefault">{t("Group similar")}</label>
                                            </div>

                                            <div className="form-check form-switch my-4 ps-0 d-flex">
                                                <input className="form-check-input h6 ms-0 my-0 me-2"
                                                       type="checkbox"
                                                       role="switch"
                                                       disabled={busy}
                                                       checked={newest_first}
                                                       onChange={(event) => on_set_sort_by_newest(event.target.checked)}
                                                />
                                                <label className="" htmlFor="flexSwitchCheckDefault">{t("Sort by newest first")}</label>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                <div className={document_filter + " row"}>
                                    <div className="col-12">
                                    {
                                        syn_set_list.map((syn_set, i) => {
                                            return (
                                                <div key={i}>
                                                    <SynSetSelector
                                                        key={"syn" + i}
                                                        name={syn_set.word}
                                                        syn_set_values={syn_set_values}
                                                        on_search={(value) => search({...value, next_page: false})}
                                                        busy={busy}
                                                        description_list={syn_set.wordCloudCsvList}/>
                                                </div>
                                            );
                                        })
                                    }
                                    </div>
                                </div>

                        </div>

                    </div>
                }

                {width && width > min_width && compact_view &&
                    <div className="col-3 mb-5">
                        <div className="sticky-top search-control-padding">

                            <div className={document_filter + " row"}>
                                {source_list &&
                                    <div>
                                        <SourceSelector
                                            on_search={(value) => search({
                                                ...value,
                                                next_page: false
                                            })}/>
                                        <br/>
                                    </div>
                                }
                            </div>

                            <div className={document_filter + " row mt-3"}>
                                {metadata_list && metadata_list.length >= 0 && metadata_list.map((item, index) => {
                                    return (
                                        <div key={"mdl_3_" + index}>
                                            <MetadataSelector key={"mdl" + index}
                                                              title={"Types"}
                                                              busy={busy}
                                                              metadata={item.metadata}
                                                              has_results={has_search_result}
                                                              on_search={(value) => search({
                                                                  ...value,
                                                                  next_page: false
                                                              })}
                                                              item_counts={document_type_count}
                                                              list={item.items}/>
                                        </div>
                                    );
                                })
                                }
                            </div>

                        </div>
                    </div>
                }

                <nav aria-label="navigation">
                    {total_document_count > 0 &&
                    <span>
                        <span className={theme === "light" ? "page-size-label" : "page-size-label-dark"}>{t("Show")}</span>
                        <span className="page-size-select mx-1 me-4">
                            <select
                                className="form-select"
                                onChange={(event) => setPageSize(parseInt(event.target.value))}
                                defaultValue={page_size}>
                                {
                                    page_size_options.map((value, index) => {
                                        return (<option key={"pso_" + index} value={value}>{value}</option>);
                                    })
                                }
                            </select>
                        </span>
                    </span>
                    }
                    { total_document_count > page_size &&
                    <ul className="pagination ms-5">
                        <li className={(has_prev_page && !busy) ? "page-item pointer-cursor" : "page-item disabled"}>
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <a className={"page-link"} onClick={() => prev_page()}>{t("Previous")}</a>
                        </li>
                        <li className={(has_next_page && !busy) ? "page-item pointer-cursor" : "page-item disabled"}>
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <a className="page-link" onClick={() => next_page()}>{t("Next")}</a>
                        </li>
                        {num_pages > 0 &&
                            <li className={(theme === "light" ? "small-font-size" : "small-font-size-dark") + " mt-1 ms-2"}>{t("page")} {search_page + 1} {t("of")} {num_pages}</li>
                        }
                    </ul>
                    }
                </nav>

            </div>
        </div>
    );
}