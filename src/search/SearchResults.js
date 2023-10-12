import React from "react";
import './SearchResults.css';
import {SearchResultFragment} from "./controls/SearchResultFragment";
import {RangeSlider} from "./controls/RangeSlider";
import {SynSetSelector} from "./controls/SynSetSelector";
import {SourceSelector} from "./controls/SourceSelector";
import {MetadataSelector} from "./controls/MetadataSelector";
import {useDispatch, useSelector} from "react-redux";
import useInfiniteScroll from 'react-infinite-scroll-hook';
import {
    set_focus_for_preview,
    set_group_similar, set_newest_first,
    update_search_text
} from "../reducers/searchSlice";


/**
 * a container for most of the items on the page, the search-result fragments,
 * the syn-set selector, any metadata selectors, and the source selector
 */
export function SearchResults(props) {
    const dispatch = useDispatch();
    // get state
    const {group_similar, newest_first, last_modified_slider, created_slider,
        syn_set_list, syn_set_values, source_list, spelling_correction, busy, ai_response,
        metadata_list, total_document_count, qna_text, has_more, result_list,
        summaries, search_focus, busy_with_summary, use_ai, busy_with_ai,
    } = useSelector((state) => state.searchReducer);
    const {session} = useSelector((state) => state.authReducer);

    const has_spelling_suggestion = spelling_correction.length > 0;
    const has_search_result = result_list.length > 0;
    const has_qna_result = qna_text.length > 0 || ai_response.length > 0;

    const [sentryRef] = useInfiniteScroll({
        loading: busy,
        hasNextPage: has_more === true,
        onLoadMore: () => { if (has_more === true) search({next_page: true}) },
        // When there is an error, we stop infinite loading.
        // It can be reactivated by setting "error" state as undefined.
        disabled: busy,
        // `rootMargin` is passed to `IntersectionObserver`.
        // We can use it to trigger 'onLoadMore' when the sentry comes near to become
        // visible, instead of becoming fully visible on the screen.
        rootMargin: '0px 0px 400px 0px',
    });

    function search(values) {
        if (props.on_search){
            props.on_search(values);
        }
    }

    function on_set_search_text(text) {
        dispatch(update_search_text(text));
        search({search_text: text, next_page: false});
    }

    function on_set_group_similar(group_similar) {
        dispatch(set_group_similar(group_similar));
        search({group_similar: group_similar, next_page: false, reset_pagination: true});
    }

    function on_set_newest_first(newest_first) {
        dispatch(set_newest_first(newest_first));
        search({newest_first: newest_first, next_page: false, reset_pagination: true});
    }

    let document_count_text = (total_document_count === 1) ? "one result" :
        ((total_document_count > 0) ? ("" + total_document_count + " results") : "No results...");

    const show_preview = (search_focus !== null && window.ENV.show_previews);

    return (
        <div className={(busy && !show_preview) ? "h-100 wait-cursor" : "h-100"}>
            <div className="row mx-0 px-2 results-container overflow-auto h-100 justify-content-center" id="search-results-id">
                <div className="col-xxl-8 col-xl-8 pe-4">
                    { has_spelling_suggestion &&
                        <div className="small text-muted ms-2 fw-light px-3 pb-3">
                            <span>No results.  Did you mean </span>
                            <span className="link-style" onClick={() => on_set_search_text(spelling_correction)}
                                  title={"search for \"" + spelling_correction + "\""}>{spelling_correction}</span>
                            <span>?</span>
                        </div>
                    }
                    { ((!has_qna_result && !has_search_result) || has_search_result) && !has_spelling_suggestion &&
                        <div className="small text-muted ms-2 fw-light px-3 pb-3">
                            { document_count_text }
                        </div>
                    }
                    { has_qna_result &&
                        <div className="p-4 mb-3 mx-2">
                            { ai_response?.length &&
                                <section className="message">
                                    <header></header>
                                    <i></i>
                                    <h2>
                                        {
                                            ai_response.split("\n").map((text, i) => {
                                                return (<div className="dialog-text" key={i}>
                                                        { text.startsWith("http") &&
                                                            <a href={text} target="_blank" rel="noreferrer" className="py-1" title={text}>{text}</a>
                                                        }
                                                        { !text.startsWith("http") &&
                                                            <div className="dialog-text" title={text}>{text}</div>
                                                        }
                                                    </div>
                                                )})
                                        }
                                    </h2>
                                </section>
                            }
                        </div>
                    }

                    {
                        result_list.map( (result, i) => {
                            return (<SearchResultFragment
                                set_focus_for_preview={(result) => dispatch(set_focus_for_preview(result))}
                                session={session}
                                summaries={summaries}
                                source_list={source_list}
                                result={result}
                                use_ai={use_ai}
                                key={i} />)
                        })
                    }

                    { /* infinite scrolling */ }
                    { (busy || has_more) && !busy_with_ai &&
                        <div ref={sentryRef}>
                            {busy_with_summary ? "creating summary..." : "Loading..."}
                        </div>
                    }


                </div>
                <div className="col-xxl-4 col-xl-4 ps-3 pe-4 pe-xxl-3 order-first order-xl-last mb-5">
                    <div className="sticky-top bg-white dialog-padding">

                        <div className="row">

                            <div className="col-6 pe-4">
                                <div className="mx-0 result-time-filter">

                                    { last_modified_slider &&
                                        <div className="w-100 mt-4">
                                            <label htmlFor="customRange3" className="form-label mb-0">Last modified:</label>
                                            <RangeSlider data={last_modified_slider}
                                                         busy={busy}
                                                         on_search={(value) => search({...value, next_page: false, reset_pagination: true})} />
                                        </div>
                                    }
                                    { created_slider &&
                                        <div className="w-100">
                                            <label htmlFor="customRange3" className="form-label mb-0">Created:</label>
                                            <RangeSlider data={created_slider}
                                                         busy={busy}
                                                         on_search={(value) => search({...value, next_page: false, reset_pagination: true})} />
                                        </div>
                                    }
                                    <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                                        <input className="form-check-input h6 ms-0 my-0 me-2"
                                               type="checkbox"
                                               role="switch"
                                               disabled={busy}
                                               id="flexSwitchCheckDefault"
                                               checked={group_similar}
                                               onChange={(event) => on_set_group_similar(event.target.checked)}
                                        />
                                        <label className="" htmlFor="flexSwitchCheckDefault">Group similar</label>
                                    </div>


                                    <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                                        <input className="form-check-input h6 ms-0 my-0 me-2"
                                               type="checkbox"
                                               disabled={busy}
                                               role="switch"
                                               id="flexSwitchCheckDefault"
                                               checked={newest_first}
                                               onChange={(event) => on_set_newest_first(event.target.checked)}
                                        />
                                        <label className="" htmlFor="flexSwitchCheckDefault">Sort by newest first</label>
                                    </div>

                                </div>

                                {
                                    syn_set_list.map((syn_set, i) => {
                                        return (
                                            <div className="category-selector list-group pt-1" key={i}>
                                                <SynSetSelector
                                                    name={syn_set.name}
                                                    syn_set_values={syn_set_values}
                                                    on_search={(value) => search({...value, next_page: false})}
                                                    busy={busy}
                                                    description_list={syn_set.description_list}/>
                                            </div>
                                        )
                                    })
                                }

                            </div>

                            <div className="col-6 ps-0">
                                <div className="w-100 result-document-filter pb-3">
                                    { source_list &&
                                        <div>
                                            <SourceSelector on_search={(value) => search({...value, next_page: false})}/>
                                            <br/>
                                        </div>
                                    }
                                    { has_search_result && metadata_list && metadata_list.length > 0 && metadata_list.map((item, index) => {
                                        return (
                                            <MetadataSelector key={index}
                                                              title={item.displayName}
                                                              busy={busy}
                                                              metadata={item.metadata}
                                                              has_results={has_search_result}
                                                              on_search={(value) => search({...value, next_page: false})}
                                                              list={item.items}/>
                                        )})
                                    }
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    )

}

