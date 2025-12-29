import React, {useState} from "react";
import './SearchResults.css';
import { SearchResultFragment } from "./controls/SearchResultFragment";
import { useDispatch, useSelector } from "react-redux";
import {
    set_page_size,
    set_search_page,
    user_result_feedback
} from "../reducers/searchSlice";
import useWindowDimensions from "./controls/useWindowDimensions";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch } from '../store';
import icon_smile from "../assets/images/ui/happy.svg";
import icon_scowl from "../assets/images/ui/unhappy.svg";
import FeedbackDialog from "../common/FeedbackDialog";
import {FeedbackData} from "../types";
import {SideBar} from "./controls/SideBar";
import { min_width } from "../common/Api";

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
        busy, ai_insight, total_document_count, ai_response, result_list, search_focus, busy_with_summary,
        busy_with_ai, search_page, page_size, theme, prev_search_text,
    } = useSelector((state: RootState) => state.searchReducer);
    const { session, show_query_builder } = useSelector((state: RootState) => state.authReducer);

    const [show_bad_feedback_dialog, setShowBadFeedbackDialog] = useState<boolean>(false);
    const [feedback_received, setFeedbackReceived] = useState(false);

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

    // feedback if the results were ok or not
    function on_comprehensive_feedback(data: FeedbackData): void {
        if (!busy && !feedback_received) {
            dispatch(user_result_feedback({
                session: session,
                data: data,
                on_success: () => {
                    setTimeout(() => {
                        setFeedbackReceived(false)
                    }, 2000);
                    setFeedbackReceived(true)
                    setShowBadFeedbackDialog(false)
                }
            }));
        }
    }

    // feedback if the results were ok or not
    function start_bad_feedback(): void {
        if (!feedback_received) {
            setShowBadFeedbackDialog(true)
        }
    }

    // for feedback - these are the simsage technical details of what happened
    const get_technical_feedback = (): string => {
        const best_score = result_list.length > 0 ? result_list[0].score : 0.0;
        return "searched for '" + prev_search_text + "', " +
        "found " + total_document_count.toLocaleString() + " results, " +
        "best score " + best_score.toFixed(2)
    }

    let document_count_text = (busy ? t("please wait") :
        (total_document_count === 1) ? t("one-result") :
            ((total_document_count > 0) ?
                ("" + total_document_count.toLocaleString() + t("results")) : t("no-results"))
    );

    const show_preview = (search_focus !== null && window.ENV.show_previews);
    const feedback = window.ENV.show_feedback && prev_search_text && prev_search_text.length > 0
    const feedback_link = window.ENV.optional_search_feedback_link;
    const feedback_link_title = window.ENV.optional_search_feedback_link_title;
    const use_custon_feedback = feedback_link.length > 0 && feedback_link_title.length > 0;

    return (
        <div className={(busy && !show_preview) ? "h-100 wait-cursor" : "h-100"}>
            <div className={(theme === "light" ? "results-container" : "results-container-dark") + " row mx-0 overflow-auto h-100"} id="search-results-id">

                <div className={(width && width > min_width) ? (show_query_builder ? "col-9 mt-4" : "col-12 mt-4") : "col-12 mt-4"}>
                    {((!has_qna_result && !has_search_result) || has_search_result) &&
                        <div className="small text-muted ms-2 fw-light px-3 pb-3">
                            { !busy && feedback && !use_custon_feedback &&
                                <span className="feedback-offset">
                                    <img src={icon_scowl} className="feedback-icon" alt="unhappy"
                                         onClick={() => start_bad_feedback()}
                                         title="my feedback: not seeing what I expected." />
                                    <img src={icon_smile} className="feedback-icon" alt="happy"
                                         onClick={() => on_comprehensive_feedback({reasons: ['Search Results are good'], comment: "great", technical: get_technical_feedback()})}
                                         title="my feedback: great search results" />
                                    {feedback_received &&
                                        <span>&#x1F44D;</span>
                                    }
                                </span>
                            }
                            {document_count_text}
                            { !busy && feedback && use_custon_feedback &&
                                <span className="feedback-offset">
                                    <a href={feedback_link}
                                       target="_blank"
                                       rel="noreferrer"
                                       className="link-primary"
                                       title={"Click here to provide " + feedback_link_title}
                                    >{feedback_link_title}</a>
                                </span>
                            }
                            {busy &&
                                <div className="loading-dots-container">
                                    <span className="loading-dots">
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                    </span>
                                </div>
                            }
                            <FeedbackDialog
                                isOpen={show_bad_feedback_dialog}
                                onClose={() => setShowBadFeedbackDialog(false)}
                                isDarkMode={theme !== "light"}
                                technical={get_technical_feedback()}
                                onSubmit={(data) => on_comprehensive_feedback(data)}
                            />
                        </div>
                    }
                    {(has_qna_result || has_insight) &&
                        <div className={"p-4 mb-3 mx-2"}>
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
                        result_list.map((result, i) => {
                            return (<SearchResultFragment result={result} key={"sr" + i}
                                                          on_seach={search} />);
                        })
                    }

                    { /* infinite scrolling */}
                    {(busy) && !busy_with_ai &&
                        <div>
                            {busy_with_summary ? "creating summary..." : ""}
                        </div>
                    }

                    <nav aria-label="navigation">
                        {total_document_count > 0 &&
                            <span>
                        <span className={theme === "light" ? "page-size-label" : "page-size-label-dark"}>{t("Show")}</span>
                        <span className="page-size-select mx-1">
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
                                    <li className={(theme === "light" ? "small-font-size" : "small-font-size-dark") + " mt-1 ms-2"}>{t("page")} {search_page + 1} {t("of")} {num_pages.toLocaleString()}</li>
                                }
                            </ul>
                        }
                    </nav>

                </div>

                {/* the sidebar on the right hand side */}
                { show_query_builder &&
                <div className="col-3 mb-5 p-0">
                    <SideBar on_search={(values: any) => search(values)} />
                </div>
                }

            </div>
        </div>
    );
}