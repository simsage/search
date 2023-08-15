import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";
import {
    get_client_id,
    get_headers,
    get_filters,
    setup_syn_sets,
    get_time_range_metadata,
    defined,
    pretty_version,
    copy, get_error, add_url_search_parameter, getKbId
} from "../common/Api";

const initialState = {
    shard_list: [],
    result_list: [],

    source_list: [],
    source_values: {},
    source_filter: '',

    has_info: false,            // get info done?

    search_page: 0,             // the current page
    pages_loaded: 0,            // how many pages loaded currently
    num_pages: 0,
    has_more: false,

    total_document_count: 0,
    show_search_results: false,
    group_similar: false,
    newest_first: false,
    busy: false,
    busy_with_summary: false,
    qna_text: '',
    ai_response: '',
    qna_url_list: [],
    search_text: '',
    prev_search_text: '',
    sr_text: '',                // text return from the search result
    spelling_correction: '',
    entity_values: {},
    hash_tag_list: [],

    // use openAi or equivalent query processors
    use_query_ai: false,
    use_summarization_ai: false,
    use_question_answering_ai: false,

    // preview data
    search_focus: null,             // for previewing items
    html_preview_list: [],          // list of preview pages
    has_more_preview_pages: true,    // do we have more pages?

    // date-time sliders
    last_modified_slider: {currentMinValue: 0, currentMaxValue: 0},
    created_slider: {currentMinValue: 0, currentMaxValue: 0},

    // metadata categories down the side
    metadata_list: [],
    metadata_values: {},

    // summarization data
    summaries: {},

    // error handling
    search_error_text: '',

    // syn-sets:  {name: "law", description_list: ['criminal, jail', 'corporate, business']}
    syn_set_list: [],
    syn_set_values: {},
    all_kbs:[]
}

const extraReducers = (builder) => {
    builder
        .addCase(do_search.pending, (state) => {
            state.busy = true;
            if (state.search_page === 0 && state.pages_loaded <= state.search_page) {
                state.result_list = [];
                state.pages_loaded = 0;
                state.ai_response = '';
            }
            state.search_error_text = "";
        })

        // search result comes in - success
        .addCase(do_search.fulfilled, (state, action) => {
            if (action.payload && defined(action.payload.data) && defined(action.payload.data.page)) {

                const data = action.payload.data;
                const parameters = action.payload.parameters;
                const next_page = action.payload.next_page;
                state.show_search_results = true;

                // this is now the previous search
                state.prev_search_text = parameters.prev_search_text;

                // add it to the rest (if page > 0) or replace the list?
                let search_result_list;
                let new_result_set = (data && data.resultList && data.resultList.length > 0) ? data.resultList : [];
                if (data.page > 0 || next_page) {
                    search_result_list = state.result_list ? copy(state.result_list) : [];
                    const start = parseInt("" + data.page) * parseInt("" + window.ENV.page_size);
                    for (let i in new_result_set) {
                        const index = parseInt("" + start) + parseInt("" + i);
                        if (index >= parameters.result_list.length) {
                            search_result_list.push(new_result_set[i]);
                        }
                    }
                } else {
                    search_result_list = (data.resultList) ? data.resultList : [];
                }
                state.result_list = search_result_list;
                state.syn_set_list = data.synSetList ? data.synSetList : [];
                state.shard_list = data.shardSizeList ? data.shardSizeList : [];
                state.spelling_correction = data.spellingCorrection ? data.spellingCorrection : '';
                state.hash_tag_list = [];
                state.entity_values = {};
                state.ai_response = data.querySummarization ? data.querySummarization : '';

                // only set the total document count on the first page
                if (data.page === 0) {
                    state.total_document_count = data.totalDocumentCount ? data.totalDocumentCount : 0;
                }

                // set up range slider(s)
                state.last_modified_slider = get_time_range_metadata(data.categoryList, parameters.last_modified_slider, "last-modified");
                state.created_slider = get_time_range_metadata(data.categoryList, parameters.created_slider, "created");

                // collect all other metadata from the collection for display
                state.metadata_list = [];
                const seen = {};
                if (data.categoryList) {
                    for (const item of data.categoryList) {
                        const metadata = item.metadata ? item.metadata : '';
                        if ((item.categoryType === "categorical list" || item.categoryType === "document type") && !seen[metadata]) {
                            seen[metadata] = true;
                            state.metadata_list.push(item);
                        }
                    }
                }

                // set the query string based on the results of the returned search
                let qs_text = parameters.search_text;
                let filter_text = "";
                if (!(qs_text.startsWith("(") && qs_text.endsWith(")"))) {
                    filter_text = get_filters(parameters.metadata_list, parameters.metadata_values, parameters.entity_values,
                        parameters.source_list, parameters.source_values,
                        parameters.hash_tag_list, setup_syn_sets(parameters.search_text, parameters.syn_set_values),
                        parameters.last_modified_slider, parameters.created_slider);
                }

                console.log("new_result_set", new_result_set.length);

                let has_more = false;
                let divided = (data.totalDocumentCount ? data.totalDocumentCount : 0) / window.ENV.page_size;
                state.search_page = action.payload.data.page;
                let num_pages = 1;
                if (divided > 0) {
                    num_pages = parseInt("" + divided);
                    if (parseInt("" + divided) < divided) {
                        num_pages += 1;
                    }
                    if (num_pages === 0)
                        num_pages = 1;
                    // we have more results to go if there are more pages AND we got a full set of results for this page
                    has_more = (state.search_page + 1 < num_pages) && (new_result_set.length >= window.ENV.page_size);
                }
                state.has_more = has_more;
                state.num_pages = num_pages;

                if (filter_text.length > 0)
                    qs_text = qs_text + " " + filter_text;
                add_url_search_parameter("query",qs_text)

                state.pages_loaded = parseInt("" + (state.result_list.length / window.ENV.page_size));
            }
            state.busy = false;
        })

        .addCase(do_search.rejected, (state, action) => {
            state.busy = false;
            state.search_error_text = get_error(action);
            console.error("rejected: do_search:" + state.search_error_text);
        })

        //////////////////////////////////////////////////////////////////////////////////////////

        .addCase(get_info.pending, (state) => {
            state.has_info = false;
            state.busy = true;
            state.search_error_text = "";
        })

        .addCase(get_info.fulfilled, (state, action) => {
            let kb_list = action.payload.kbList ? action.payload.kbList : [];
            state.all_kbs = [...kb_list]
            kb_list = kb_list.filter((kb) => kb.id === getKbId());
            if (kb_list.length === 1) {
                state.source_list = kb_list[0].sourceList ? kb_list[0].sourceList : [];

                // set up range slider(s) and metadata categories
                if (kb_list[0].categoryList) {
                    state.last_modified_slider = get_time_range_metadata(kb_list[0].categoryList, null, "last-modified");
                    state.created_slider = get_time_range_metadata(kb_list[0].categoryList, null, "created");

                    // collect all other metadata from the collection for display
                    state.metadata_list = [];
                    const seen = {};
                    if (kb_list[0].categoryList) {
                        for (const item of kb_list[0].categoryList) {
                            const metadata = item.metadata ? item.metadata : '';
                            if ((item.categoryType === "categorical list" || item.categoryType === "document type") && !seen[metadata]) {
                                seen[metadata] = true;
                                state.metadata_list.push(item);
                            }
                        }
                    }
                }
            }
            state.has_info = true;
            state.busy = false;
        })

        .addCase(get_info.rejected, (state, action) => {
            state.busy = false;
            state.search_error_text = get_error(action);
            console.error("rejected: get_info:" + state.search_error_text);
        })

        //////////////////////////////////////////////////////////////////////////////////////////

        .addCase(create_short_summary.pending, (state) => {
            state.busy = true;
            state.busy_with_summary = true;
            state.search_error_text = "";
        })

        .addCase(create_short_summary.fulfilled, (state, action) => {
            const summary_result = action.payload ? action.payload : {};
            if (summary_result && summary_result.url && summary_result.summary) {
                state.summaries[summary_result.url] = summary_result.summary;
            }
            state.busy_with_summary = false;
            state.busy = false;
        })

        .addCase(create_short_summary.rejected, (state, action) => {
            state.busy = false;
            state.busy_with_summary = false;
            state.search_error_text = get_error(action);
            console.error("rejected: create_short_summary:" + state.search_error_text);
        })

        ////////////////////////////////////////////////////////////////////////////////////

        .addCase(get_preview_html.pending, (state) => {
            state.busy = true;
            state.search_error_text = "";
        })

        // get_preview_html
        .addCase(get_preview_html.fulfilled, (state, action) => {
            state.busy = false;
            const data = action.payload;
            const num_total_pages = data.numPages ? data.numPages : 1;
            state.has_more_preview_pages = state.html_preview_list.length + 1 < num_total_pages;
            state.html_preview_list.push(action.payload);
        })

        .addCase(get_preview_html.rejected, (state, action) => {
            state.busy = false;
            state.search_error_text = get_error(action);
            console.error("rejected: get_preview_html:" + state.search_error_text);
        })

}


const searchSlice = createSlice({
    name: "search-results",
    initialState,
    // not async function : sync functions
    reducers: {
        go_home: (state) => {
            window.history.replaceState(null, null, window.location.pathname);
            return {...state, show_search_results: false}
        },

        update_search_text: (state, action) => {
            return {...state, search_text: action.payload}
        },

        set_focus_for_preview: (state, action) => {
            return {...state, search_focus: action.payload, html_preview_list: [], has_more_preview_pages: true}
        },

        close_preview: (state) => {
            return {...state, search_focus: null, html_preview_list: [], has_more_preview_pages: false}
        },

        toggle_query_ai: (state) => {
            return {...state, use_query_ai: !state.use_query_ai}
        },

        toggle_summarization_ai: (state) => {
            return {...state, use_summarization_ai: !state.use_summarization_ai, use_question_answering_ai: false}
        },

        toggle_question_answering_ai: (state) => {
            return {...state, use_question_answering_ai: !state.use_question_answering_ai, use_summarization_ai: false}
        },

        set_busy: (state, action) => {
            return {...state, busy: action.payload}
        },

        set_group_similar: (state, action) => {
            return {...state, group_similar: action.payload}
        },

        set_newest_first: (state, action) => {
            return {...state, newest_first: action.payload}
        },

        set_source_filter: (state, action) => {
            return {...state, source_filter: action.payload}
        },

        set_source_value: (state, action) => {
            let sv = copy(state.source_values);
            sv[action.payload.name] = action.payload.checked;
            return {...state, source_values: sv}
        },

        set_source_values: (state, action) => {
            let sv = copy(state.source_values);
            sv = {...sv, ...action.payload};
            return {...state, source_values: sv}
        },

        set_range_slider: (state, action) => {
            const metadata = action.payload.metadata;
            const values = copy(action.payload.values);
            if (metadata === "last-modified") {
                return {...state, last_modified_slider: {...state.last_modified_slider, currentMinValue: values[0], currentMaxValue: values[1]}}
            } else {
                return {...state, created_slider: {...state.created_slider, currentMinValue: values[0], currentMaxValue: values[1]}}
            }
        },

        select_syn_set: (state, action) => {
            let syn = copy(state.syn_set_values);
            syn[action.payload.name] = action.payload.checked ? action.payload.index : -1;
            return {...state, syn_set_values: syn}
        },

        set_metadata_value: (state, action) => {
            const metadata = action.payload.metadata;
            const name = action.payload.name;
            const checked = action.payload.checked;
            const existing_values = copy(state.metadata_values[metadata] ? state.metadata_values[metadata] : {});
            existing_values[name] = checked;
            let mdv = copy(state.metadata_values);
            mdv[metadata] = existing_values;
            return {...state, metadata_values: mdv}
        },

        set_metadata_values: (state, action) => {
            let metadata_values = {...state.metadata_values, ...action.payload};
            // sliders are handled separately
            if (action.payload["created"]) {
                const data = action.payload["created"];
                const cs = copy(state.created_slider);
                if (defined(data["minValue"]) && defined(data["maxValue"])) {
                    cs.currentMinValue = data["minValue"];
                    cs.currentMaxValue = data["maxValue"];
                }
                return {...state, metadata_values: metadata_values, created_slider: cs}

            } else if (action.payload["last-modified"]) {
                const data = action.payload["last-modified"];
                const ms = copy(state.last_modified_slider);
                if (data["minValue"] && data["maxValue"]) {
                    ms.currentMinValue = data["minValue"];
                    ms.currentMaxValue = data["maxValue"];
                }
                return {...state, metadata_values: metadata_values, last_modified_slider: ms}
            }
        },

        dismiss_search_error: (state) => {
            return {...state, search_error_text: ''}
        },

    },
    extraReducers
})


// get required SimSage information
export const get_info = createAsyncThunk(
    'get_info',
    async({session, user}, {rejectWithValue}) => {

        const user_id = user && user.id ? user.id : get_client_id();
        const api_base = window.ENV.api_base;
        const session_id = (session && session.id) ? session.id : null;
        const url = api_base + '/knowledgebase/search/info/' + encodeURIComponent(window.ENV.organisation_id) + '/' +
                    encodeURIComponent(user_id);
        return axios.get(url, get_headers(session_id))
            .then((response) => {
                console.log('SimSage UX version ' + pretty_version());
                return response.data;
            }).catch((err) => {
                return rejectWithValue(err)
            })
    }
)


// perform a search
export const do_search = createAsyncThunk(
    'do_search',
    async ({
               session,
               search_page,
               client_id,
               user,
               search_text,
               prev_search_text,
               shard_list,
               group_similar,
               newest_first,
               metadata_list,
               metadata_values,
               entity_values,
               source_list,
               source_values,
               hash_tag_list,
               syn_set_values,
               last_modified_slider,
               created_slider,
               result_list,
               pages_loaded,
               use_query_ai,
               use_summarization_ai,
               use_question_answering_ai,
               next_page,
               reset_pagination
           }, {rejectWithValue}) => {

        const api_base = window.ENV.api_base;
        const session_id = (session && session.id) ? session.id : null;
        const url = session_id ? (api_base + '/dms/query') : (api_base + '/semantic/query');

        search_text = search_text.trim().replace('/', ' '); // remove syn-set markers - not used anymore
        let filter_text = "";

        // update metadata_values for last-modified or created?
        let c_last_modified_slider = {};
        let c_created_slider = {};
        if (defined(metadata_values)) {
            const values1 = metadata_values["created"];
            c_created_slider = copy(created_slider);
            if (defined(values1)) {
                if (values1["minValue"] && values1["maxValue"]) {
                    c_created_slider.currentMinValue = values1["minValue"];
                    c_created_slider.currentMaxValue = values1["maxValue"];
                }
            }
            const values2 = metadata_values["last-modified"];
            c_last_modified_slider = copy(last_modified_slider);
            if (defined(values2)) {
                if (values2["minValue"] && values2["maxValue"]) {
                    c_last_modified_slider.currentMinValue = values2["minValue"];
                    c_last_modified_slider.currentMaxValue = values2["maxValue"];
                }
            }
        }

        if (!(search_text.startsWith("(") && search_text.endsWith(")"))) {
            filter_text = get_filters(metadata_list, metadata_values, entity_values, source_list, source_values,
                                      hash_tag_list, [], c_last_modified_slider, c_created_slider);
        }

        const combined_text = (search_text + ' ' + filter_text).trim();
        const in_parameters = {session, client_id, user, search_text, shard_list,
            group_similar, newest_first, metadata_list, metadata_values, entity_values, source_list,
            source_values, hash_tag_list, syn_set_values, last_modified_slider: c_last_modified_slider,
            created_slider: c_created_slider, result_list: result_list, prev_search_text: combined_text};

        // reset pagination?  if this is a different search or the previous search had no results
        let new_search_page = search_page;
        let new_pages_loaded = pages_loaded;
        let new_shard_list = shard_list;
        if (combined_text !== prev_search_text || (result_list && result_list.length === 0) || reset_pagination) {
            new_search_page = 0;
            new_pages_loaded = 0;
            new_shard_list = [];
            // scroll to the top
            window.setTimeout(() => {
                const ctrl = document.getElementById("search-results-id");
                if (ctrl) ctrl.scrollTo(0, 0);
            }, 10);
        }

        const data = {
            organisationId: window.ENV.organisation_id,
            kbList: [getKbId()],
            scoreThreshold: window.ENV.score_threshold,
            clientId: client_id,
            semanticSearch: true,
            query: search_text,
            filter: filter_text,
            numResults: 1,
            page: new_search_page,
            pageSize: window.ENV.page_size,
            shardSizeList: new_shard_list,
            fragmentCount: window.ENV.fragment_count,
            maxWordDistance: window.ENV.max_word_distance,
            spellingSuggest: window.ENV.use_spell_checker,
            contextLabel: '',
            contextMatchBoost: 0.01,
            groupSimilarDocuments: group_similar,
            sortByAge: newest_first,
            sourceId: '',
            useQueryAi: use_query_ai === true,
            useSummarizationAi: use_summarization_ai === true,
            useQuestionAnsweringAi: use_question_answering_ai === true,
        };

        if (search_text.trim().length > 0) {
            return axios.post(url, data, get_headers(session_id))
                .then((response) => {
                    if (response && response.data && response.data.messageType === 'message') {
                        response.data.search_text = search_text;
                        response.data.original_text = search_text;
                        response.data.page = new_search_page;
                        response.data.pages_loaded = new_pages_loaded
                        return {data: response.data, parameters: in_parameters,
                            next_page: next_page, reset_pagination: reset_pagination};
                    } else {
                        return 'invalid message type:' + response.data.messageType;
                    }
                }).catch((err) => {
                    return rejectWithValue(err)
                })
        }
    }
);


// get required SimSage information
export const create_short_summary = createAsyncThunk(
    'create_short_summary', async({session, target_url, sentence_id, span}, {rejectWithValue}) => {

        const api_base = window.ENV.api_base;
        const session_id = (session && session.id) ? session.id : null;
        const url = api_base + '/semantic/short-summary';
        const data = {
            organisationId: window.ENV.organisation_id,
            kbId: window.ENV.kb_id,
            clientId: session_id,
            url: target_url,
            sentenceId: sentence_id,
            span: span,
        };
        return axios.post(url, data, get_headers(session_id))
            .then((response) => {
                return response.data;
            }).catch((err) => {
                return rejectWithValue(err)
            })
    }
)


/**
 * get an html preview for a given url / page
 *
 */
export const get_preview_html = createAsyncThunk(
        'get_preview_html',
    async ({session, url_id, html_preview_list},
           {rejectWithValue}) => {

            const api_base = window.ENV.api_base;
            const session_id = (session && session.id) ? session.id : get_client_id();
            const url = api_base + '/document/preview/html';

            const data = {
                "organisationId": window.ENV.organisation_id,
                "kbId": getKbId(),
                "urlId": url_id,
                "page": (html_preview_list && html_preview_list.length) ? html_preview_list.length + 1 : 1,
            }

            return axios.post(url, data, get_headers(session_id))
                .then((response) => {
                    return response.data;
                }).catch((err) => {
                    return rejectWithValue(err)
                })
        }
)


export const {
        go_home, update_search_text, set_focus_for_preview, set_source_value, set_metadata_value,
        dismiss_search_error, set_group_similar, set_newest_first, set_source_filter, select_syn_set,
        set_range_slider, set_metadata_values, set_source_values, close_preview,
        toggle_query_ai, toggle_summarization_ai, toggle_question_answering_ai
    } = searchSlice.actions;

export default searchSlice.reducer;

