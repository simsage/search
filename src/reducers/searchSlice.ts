import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import axios from "axios";
import i18n from '../i18n';
import {
    get_client_id,
    get_headers,
    get_filters,
    defined,
    pretty_version,
    copy, get_error, getKbId,
    hashtag_metadata,
    get_cookie_value,
    update_cookie_value, get_document_types, get_source_filter
} from "../common/Api";
import {
    MetadataItem,
    KnowledgeBase,
    SearchState,
    MessageExpandPayload,
    FocusPreviewPayload,
    UserQueryPayload,
    SourceValuePayload,
    MetadataValuePayload,
    SynSetPayload,
    ErrorPayload,
    SearchPagePayload,
    PageSizePayload,
    GetInfoPayload,
    SaveHashtagsPayload,
    DoSearchPayload,
    CreateShortSummaryPayload,
    TeachPayload,
    AskDocumentQuestionPayload,
    DoLlmSearchPayload,
    DoLlmSearchStep2Payload,
    DoLlmSearchStep3Payload, LLMState
} from '../types';

// name of the ux cookie
const ux_cookie = "ux-cookie";
// cookie values for init store
const use_ai = get_cookie_value(ux_cookie, "use_ai");
const compact_view = get_cookie_value(ux_cookie, "compact_view");
const source_icon = get_cookie_value(ux_cookie, "source_icon");
const llm_search = window.ENV.show_llm_menu ? get_cookie_value(ux_cookie, "llm_search") : "false";
const fast = get_cookie_value(ux_cookie, "fast");
const theme = get_cookie_value(ux_cookie, "theme");

const initialState: SearchState = {
    shard_list: [],
    result_list: [],

    source_list: [],
    source_values: {},   // source.name -> true/false (selected)
    source_filter: '',

    has_info: false,            // get info done?
    theme: theme ? theme : "light", // UI theme (dark or light)

    search_page: 0,             // the current page
    page_size: window.ENV.page_size,
    pages_loaded: 0,            // how many pages loaded currently

    total_document_count: 0,
    group_similar: false,
    newest_first: false,
    busy: false,
    busy_with_summary: false,
    busy_with_ai: false,
    qna_text: '',
    ai_response: '',
    ai_insight: '',
    qna_url_list: [],
    search_text: '',
    prev_search_text: '',
    prev_filter: '',
    effective_search_string: '', // what the engine actually searched on
    sr_text: '',                // text return from the search result
    entity_values: {},
    hash_tag_list: [],
    boost_document_id_list: [],
    // enabled? (determined by search info)
    ai_enabled: false,
    // use ai (i.e. menu switch)
    use_ai: use_ai ? use_ai.toLowerCase()==="true" : window.ENV.query_ai_enabled_by_default,
    compact_view: compact_view ? compact_view.toLowerCase()==="true" : window.ENV.compact_view,
    show_source_icon: source_icon ? source_icon.toLowerCase()==="true" : window.ENV.show_source_icon,
    llm_search: llm_search ? llm_search.toLowerCase()==="true" : window.ENV.llm_search,
    fast: fast ? fast.toLowerCase()==="true" : false,

    // the url to focus on for q&A document
    query_ai_focus_url: '',
    query_ai_focus_url_id: 0,
    query_ai_focus_title: '',
    query_ai_dialog_list: [],
    query_ai_focus_document: null,
    llm_state: [],
    user_query: "",

    // preview data
    search_focus: null,             // for previewing items
    html_preview_list: [],          // list of preview pages
    has_more_preview_pages: true,    // do we have more pages?

    // metadata categories down the side
    metadata_list: [],
    document_type_count: {},        // "docx" -> 25
    source_id_count: {},            // 1 -> 25
    metadata_values: {},

    // summarization data
    summaries: {},

    // error handling
    search_error_text: '',
    // error handling for metadata editing
    metadata_error: '',

    // syn-sets: {name: "law", description_list: ['criminal, jail', 'corporate, business']}
    syn_set_list: [],
    syn_set_values: {},
    all_kbs:[]
};


const extraReducers = (builder: any) => {
    builder
        .addCase(do_search.pending, (state: SearchState) => {
            state.busy = true;
            if (state.search_page === 0 && state.pages_loaded <= state.search_page) {
                state.result_list = [];
                state.pages_loaded = 0;
                state.ai_response = '';
                state.ai_insight = '';
            }
            state.search_error_text = "";
            state.query_ai_focus_url = "";
            state.query_ai_focus_title = "";
            state.query_ai_dialog_list = [];
        })

        // search result comes in - success
        .addCase(do_search.fulfilled, (state: SearchState, action: any) => {
            if (action.payload && defined(action.payload.data) && defined(action.payload.data.page)) {
                const data = action.payload.data;
                // this is now the previous search
                state.prev_search_text = data.prev_search_text;
                state.prev_filter = data.prev_filter;
                state.effective_search_string = data.effectiveSearchString

                // add it to the rest (if page > 0) or replace the list?
                state.result_list = (data && data.resultList && data.resultList.length > 0) ? data.resultList : []
                state.syn_set_list = data.synSetList ? data.synSetList : [];
                state.shard_list = data.shardSizeList ? data.shardSizeList : [];
                state.hash_tag_list = [];
                state.entity_values = {};
                state.boost_document_id_list = data.boostedDocumentIDs ?? [];

                // only set the AI response for page 0
                if (data.page === 0 && state.use_ai) {
                    state.ai_response = data.qnaAnswer ? data.qnaAnswer : '';
                    state.ai_insight = data.qnaInsight ? data.qnaInsight : '';
                }

                // set the total document count
                state.total_document_count = data.totalDocumentCount ? data.totalDocumentCount : 0;

                // collect all other metadata from the collection for display
                state.metadata_list = [];
                const seen: {[key: string]: boolean} = {};
                if (data.categoryList) {
                    for (const item of data.categoryList) {
                        const metadata = item.metadata ? item.metadata : '';
                        if (item.metadata === "document-type" && !seen[metadata]) {
                            seen[metadata] = true;
                            state.metadata_list.push(item);
                        }
                    }
                }
                state.document_type_count = data.documentTypeToCounts ? data.documentTypeToCounts : {};
                state.source_id_count = data.sourceIdToCounts ? data.sourceIdToCounts : {};

                // SM-1877 set sources based on selected sources from query
                if (data.selectedSources && data.selectedSources.length > 0) {
                    for (const id of data.selectedSources) {
                        state.source_values[id] = true
                    }
                }
                state.search_page = action.payload.data.page;
                state.pages_loaded = parseInt("" + (state.result_list.length / state.page_size));
            }
            state.busy = false;
        })

        .addCase(do_search.rejected, (state: SearchState, action: any) => {
            state.busy = false;
            state.search_error_text = get_error(action);
            console.error("rejected: do_search:" + state.search_error_text);
        })

        //////////////////////////////////////////////////////////////////////////////////////////

        .addCase(get_info.pending, (state: SearchState) => {
            state.has_info = false;
            state.busy = true;
            state.search_error_text = "";
        })

        .addCase(get_info.fulfilled, (state: SearchState, action: any) => {
            let kb_list = action.payload.kbList ? action.payload.kbList : [];
            state.all_kbs = [...kb_list]
            kb_list = kb_list.filter((kb: KnowledgeBase) => kb.id === getKbId()); // get kbId from window parameters if possible
            if (kb_list.length === 1) {
                state.source_list = kb_list[0].sourceList ? kb_list[0].sourceList : [];
                // AI enabled if we have an LLM connected and ready
                state.ai_enabled = kb_list[0].hasLLM || false;

                // set up metadata categories
                if (kb_list[0].categoryList) {

                    // collect all other metadata from the collection for display
                    state.metadata_list = [];
                    const seen: {[key: string]: boolean} = {};
                    let document_count_map: {[key: string]: number} = {};
                    if (kb_list[0].categoryList) {
                        for (const item of kb_list[0].categoryList) {
                            const metadata = item.metadata ? item.metadata : '';
                            if ((metadata === "document-type") && !seen[metadata]) {
                                seen[metadata] = true;
                                state.metadata_list.push(item);
                                // get the name and count values for each
                                if (item.items) {
                                    for (const data of item.items) {
                                        if (data.name && data.count) {
                                            document_count_map[data.name] = data.count;
                                        }
                                    }
                                }

                            }
                        }
                    }
                    state.document_type_count = document_count_map;
                }
            } else {
                state.ai_enabled = false;
            }
            state.has_info = true;
            state.busy = false;
        })

        .addCase(get_info.rejected, (state: SearchState, action: any) => {
            state.busy = false;
            state.search_error_text = get_error(action);
            console.error("rejected: get_info:" + state.search_error_text);
        })

        //////////////////////////////////////////////////////////////////////////////////////////

        .addCase(create_short_summary.pending, (state: SearchState) => {
            state.busy = true;
            state.busy_with_summary = true;
            state.search_error_text = "";
        })

        .addCase(create_short_summary.fulfilled, (state: SearchState, action: any) => {
            const summary_result = action.payload ? action.payload : {};
            if (summary_result && summary_result.url && summary_result.summary) {
                state.summaries[summary_result.url] = summary_result.summary;
            }
            state.busy_with_summary = false;
            state.busy = false;
        })

        .addCase(create_short_summary.rejected, (state: SearchState, action: any) => {
            state.busy = false;
            state.busy_with_summary = false;
            state.search_error_text = get_error(action);
            console.error("rejected: create_short_summary:" + state.search_error_text);
        })

        ////////////////////////////////////////////////////////////////////////////////////

        .addCase(teach.pending, (state: SearchState) => {
            state.busy = true;
        })

        .addCase(teach.fulfilled, (state: SearchState) => {
            state.busy = false;
        })

        .addCase(teach.rejected, (state: SearchState) => {
            state.busy = false;
            console.error("rejected: teach:" + state.search_error_text);
        })

        ////////////////////////////////////////////////////////////////////////////////////

        .addCase(ask_document_question.pending, (state: SearchState) => {
            state.busy = true;
            state.busy_with_ai = true;
            state.search_error_text = "";
        })

        // ask_document_question
        .addCase(ask_document_question.fulfilled, (state: SearchState, action: any) => {
            state.busy = false;
            state.busy_with_ai = false;
            const data = action.payload;
            if (data && data.answer && data.conversationList.length > 0) {
                let list = copy(state.query_ai_dialog_list);
                list.push({"role": "user", "content": data.conversationList[data.conversationList.length - 1].content});
                list.push({"role": "assistant", "content": data.answer});
                state.query_ai_dialog_list = list;
            }
        })

        .addCase(ask_document_question.rejected, (state: SearchState, action: any) => {
            state.busy = false;
            state.busy_with_ai = false;
            state.search_error_text = get_error(action);
            console.error("rejected: ask_document_question:" + state.search_error_text);
        })

        ////////////////////////////////////////////////////////////////////////////////////

        .addCase(save_hashtags.pending, (state: SearchState) => {
            return {...state, busy: true, busy_with_ai: true, metadata_error: ''}
        })

        // save user metadata succeeded
        .addCase(save_hashtags.fulfilled, (state: SearchState, action: any) => {
            const data = action.payload;
            // take a copy of the search results and change the metadata inside it
            const result_list_copy = JSON.parse(JSON.stringify(state.result_list))
            if (data.url) {
                for (const result of result_list_copy) {
                    if (result.url === data.url) {
                        data.hashTagList.sort((a: string, b: string) => (a > b) ? 1 : -1);
                        if (data.hashTagList)
                            result.metadata[hashtag_metadata] = data.hashTagList.join(",")
                        else
                            result.metadata[hashtag_metadata] = ""
                    }
                }
            }
            return {...state, busy: false, busy_with_ai: false, metadata_error: '', result_list: result_list_copy}
        })

        .addCase(save_hashtags.rejected, (state: SearchState, action: any) => {
            console.error("rejected: save_hashtags:", action);
            return {...state,
                busy: false,
                busy_with_ai: false,
                metadata_error: get_error(action)
            }
        })

        ////////////////////////////////////////////////////////////////////////////////////

        .addCase(do_llm_search.pending, (state: SearchState) => {
            return {
                ...state,
                busy: true,
                busy_with_ai: true,
                search_error_text: ""
            }
        })

        // llm_search
        .addCase(do_llm_search.fulfilled, (state: SearchState, action: any) => {
            const data = action.payload;

            // find the last result that has search results in it to display
            const conversation_size = data.conversationList && data.conversationList.length > 0 ? data.conversationList.length : 0
            let last_result = null
            let sr_counter = -1
            if (conversation_size > 0) {
                let counter = conversation_size
                while (counter > 0) {
                    const current_conversation = data.conversationList[counter - 1];
                    if (current_conversation && current_conversation.searchResult && current_conversation.searchResult.resultList &&
                        current_conversation.searchResult.resultList.length > 0) {
                        last_result = current_conversation
                        sr_counter = counter - 1
                        break
                    }
                    counter -= 1
                }
            }

            // get the search-result from this item
            const searchData = last_result?.searchResult ?? null
            const last = data.conversationList && data.conversationList.length > 0 ? data.conversationList[data.conversationList.length - 1] : null

            // set searched for text?
            const last_conversation = sr_counter >= 0 ? data.conversationList[sr_counter] : null
            if (last_conversation && last_conversation.content === "") {
                last_conversation.content = i18n.t("searched for") + " \"" + last_conversation.searchKeywords + "\""
            }

            // collect all other metadata from the collection for display
            let document_type_count = searchData?.documentTypeToCounts ?? {}
            let source_id_count = searchData?.sourceIdToCounts ?? {}
            const search_page = searchData?.page ?? 0;
            const result_list = searchData?.resultList ?? []
            const pages_loaded = parseInt("" + (result_list.length / state.page_size))
            const shard_list = searchData?.shardSizeList ? searchData.shardSizeList : []
            const boost_document_id_list = searchData?.boostedDocumentIDs ?? []
            const total_document_count = searchData?.totalDocumentCount ? searchData.totalDocumentCount : 0

            let source_values: {[key: string]: boolean} = {}
            if (searchData?.selectedSources && searchData.selectedSources.length > 0) {
                for (const id of searchData.selectedSources) {
                    source_values[id] = true
                }
            }

            let metadata_list: MetadataItem[] = []
            if (searchData?.categoryList) {
                const seen: {[key: string]: boolean} = {}
                for (const item of searchData.categoryList) {
                    const metadata = item.metadata ? item.metadata : '';
                    if (item.metadata === "document-type" && !seen[metadata]) {
                        seen[metadata] = true;
                        metadata_list.push(item);
                    }
                }
            }

            return {
                ...state,
                busy: false,
                busy_with_ai: false,
                llm_state: data,
                user_query: (last?.step === 0) ? '' : state.user_query,
                document_type_count: document_type_count,
                source_values: source_values,
                source_id_count: source_id_count,
                shard_list: shard_list,
                boost_document_id_list: boost_document_id_list,
                total_document_count: total_document_count,
                metadata_list: metadata_list,
                result_list: result_list,
                search_page: search_page,
                pages_loaded: pages_loaded
            }
        })

        .addCase(do_llm_search.rejected, (state: SearchState, action: any) => {
            const error_str = get_error(action)
            console.error("rejected: do_llm_search:" + error_str);
            return {
                ...state,
                busy: false,
                busy_with_ai: false,
                search_error_text: error_str
            }
        })

        ////////////////////////////////////////////////////////////////////////////////////

        .addCase(do_llm_search_step2.pending, (state: SearchState) => {
            return {
                ...state,
                busy: true,
                busy_with_ai: true,
                search_error_text: ""
            }
        })

        // llm_search
        .addCase(do_llm_search_step2.fulfilled, (state: SearchState, action: any) => {
            const data = action.payload;

            // find the last result that has search results in it to display
            let last_result = null
            let new_conversation_list = []
            for (let current_conversation of data.conversationList) {
                let has_result = false
                if (current_conversation && current_conversation.searchResult && current_conversation.searchResult.resultList &&
                    current_conversation.searchResult.resultList.length > 0) {
                    last_result = current_conversation
                    has_result = true
                }
                if (current_conversation.role === "assistant" && current_conversation.content.indexOf('SimSage search:') >= 0) {
                    // skip
                } else if (current_conversation.role === "assistant" && has_result) {
                    current_conversation.content = i18n.t("searched for") + " \"" + current_conversation.searchKeywords + "\""
                    new_conversation_list.push(current_conversation)
                } else {
                    new_conversation_list.push(current_conversation)
                }
            }
            data.conversationList = new_conversation_list

            // get the search-result from this item
            const searchData = last_result?.searchResult ?? null

            // collect all other metadata from the collection for display
            let document_type_count = searchData?.documentTypeToCounts ?? {}
            let source_id_count = searchData?.sourceIdToCounts ?? {}
            const search_page = searchData?.page ?? 0;
            const result_list = searchData?.resultList ?? []
            const pages_loaded = parseInt("" + (result_list.length / state.page_size))
            const shard_list = searchData?.shardSizeList ? searchData.shardSizeList : []
            const boost_document_id_list = searchData?.boostedDocumentIDs ?? []
            const total_document_count = searchData?.totalDocumentCount ? searchData.totalDocumentCount : 0

            let source_values: {[key: string]: boolean} = {}
            if (searchData?.selectedSources && searchData.selectedSources.length > 0) {
                for (const id of searchData.selectedSources) {
                    source_values[id] = true
                }
            }

            let metadata_list: MetadataItem[] = []
            if (searchData?.categoryList) {
                const seen: {[key: string]: boolean} = {}
                for (const item of searchData.categoryList) {
                    const metadata = item.metadata ? item.metadata : '';
                    if (item.metadata === "document-type" && !seen[metadata]) {
                        seen[metadata] = true;
                        metadata_list.push(item);
                    }
                }
            }

            return {
                ...state,
                busy: false,
                busy_with_ai: false,
                llm_state: data,
                document_type_count: document_type_count,
                source_values: source_values,
                source_id_count: source_id_count,
                shard_list: shard_list,
                boost_document_id_list: boost_document_id_list,
                total_document_count: total_document_count,
                metadata_list: metadata_list,
                result_list: result_list,
                search_page: search_page,
                pages_loaded: pages_loaded
            }
        })

        .addCase(do_llm_search_step2.rejected, (state: SearchState, action: any) => {
            const error_str = get_error(action)
            console.error("rejected: do_llm_search_step2:" + error_str);
            return {
                ...state,
                busy: false,
                busy_with_ai: false,
                search_error_text: error_str
            }
        })

        ////////////////////////////////////////////////////////////////////////////////////

        .addCase(do_llm_search_step3.pending, (state: SearchState) => {
            return {
                ...state,
                busy: true,
                busy_with_ai: true,
                search_error_text: ""
            }
        })

        // llm_search
        .addCase(do_llm_search_step3.fulfilled, (state: SearchState, action: any) => {
            const data = action.payload;

            // find the last result that has search results in it to display
            console.log("data.conversationList", data.conversationList)
            let new_conversation_list = []
            let last_keywords = ""
            for (let current_conversation of data.conversationList) {
                if (current_conversation.searchKeywords !== "") {
                    last_keywords = current_conversation.searchKeywords
                }
            }
            for (let current_conversation of data.conversationList) {
                let has_result = false
                if (current_conversation && current_conversation.searchResult && current_conversation.searchResult.resultList &&
                    current_conversation.searchResult.resultList.length > 0) {
                    has_result = true
                }
                if (current_conversation.role === "assistant" && has_result && current_conversation.content === state.user_query) {
                    current_conversation.content = i18n.t("searched for") + " \"" + last_keywords + "\""
                }
                new_conversation_list.push(current_conversation)
            }
            console.log("new_conversation_list", new_conversation_list)
            data.conversationList = new_conversation_list

            return {
                ...state,
                busy: false,
                busy_with_ai: false,
                llm_state: data,
                user_query: ""
            }
        })

        .addCase(do_llm_search_step3.rejected, (state: SearchState, action: any) => {
            const error_str = get_error(action)
            console.error("rejected: do_llm_search_step3:" + error_str);
            return {
                ...state,
                busy: false,
                busy_with_ai: false,
                search_error_text: error_str
            }
        })
};

const searchSlice = createSlice({
    name: "search-results",
    initialState,
    // not async function: sync functions
    reducers: {
        go_home: (state) => {
            window.history.replaceState({}, "", window.location.pathname);
            return {...state}
        },

        toggle_theme: (state) => {
            const new_theme = state.theme === "light" ? "dark" : "light"
            update_cookie_value(ux_cookie, "theme", new_theme)
            return {...state, theme: new_theme}
        },

        update_search_text: (state, action: PayloadAction<string>) => {
            return {...state, search_text: action.payload}
        },

        toggle_message_expand: (state, action: PayloadAction<MessageExpandPayload>) => {
            const index = action.payload.index
            const new_state = JSON.parse(JSON.stringify(state.llm_state))
            if (index >= 0 && index < new_state.conversationList.length) {
                new_state.conversationList[index].expand = new_state.conversationList[index].expand !== true
            }
            return {...state, llm_state: new_state}
        },

        set_focus_for_preview: (state, action: PayloadAction<any>) => {
            return {...state,
                query_ai_focus_url: '',
                query_ai_focus_url_id: 0,
                query_ai_focus_title: '',
                search_focus: action.payload,
                html_preview_list: [],
                has_more_preview_pages: true
            }
        },

        set_user_query: (state, action: PayloadAction<UserQueryPayload>) => {
            console.log("action.payload", action.payload)
            return {...state,
                user_query: action.payload.user_query,
            }
        },

        set_focus_for_ai_queries: (state, action: PayloadAction<any>) => {
            return {...state,
                query_ai_focus_document: action.payload,
            }
        },

        close_preview: (state) => {
            return {...state, search_focus: null, html_preview_list: [], has_more_preview_pages: false}
        },

        toggle_ai: (state) => {
            update_cookie_value(ux_cookie, 'use_ai', !state.use_ai)
            return {...state, use_ai: !state.use_ai}
        },

        set_compact_view: (state, action: PayloadAction<boolean>) => {
            update_cookie_value(ux_cookie, 'compact_view', action.payload)
            return {...state, compact_view: action.payload}
        },

        set_icon_mode: (state, action: PayloadAction<boolean>) => {
            update_cookie_value(ux_cookie, 'source_icon', action.payload)
            return {...state, show_source_icon: action.payload}
        },

        set_llm_search: (state, action: PayloadAction<boolean>) => {
            window.history.replaceState({}, "", window.location.pathname);
            update_cookie_value(ux_cookie, 'llm_search', action.payload)
            return {...state,
                llm_search: action.payload,
                query_ai_focus_url: '',
                query_ai_focus_url_id: 0,
                query_ai_focus_title: '',
                query_ai_dialog_list: [],
                query_ai_focus_document: null,
                llm_state: [],
                document_type_count: {},
                source_id_count: {},
                metadata_values: {},
                source_values: {},
                source_filter: '',
            }
        },

        set_busy: (state, action: PayloadAction<boolean>) => {
            return {...state, busy: action.payload}
        },

        set_group_similar: (state, action: PayloadAction<boolean>) => {
            return {...state, group_similar: action.payload}
        },

        set_newest_first: (state, action: PayloadAction<boolean>) => {
            return {...state, newest_first: action.payload}
        },

        set_source_filter: (state, action: PayloadAction<string>) => {
            return {...state, source_filter: action.payload}
        },

        set_source_value: (state, action: PayloadAction<SourceValuePayload>) => {
            let sv = copy(state.source_values)
            sv[action.payload.name] = action.payload.checked
            return {...state, source_values: sv}
        },

        set_source_values: (state, action: PayloadAction<{[key: string]: boolean}>) => {
            let sv = copy(state.source_values);
            sv = {...sv, ...action.payload};
            return {...state, source_values: sv}
        },

        select_syn_set: (state, action: PayloadAction<SynSetPayload>) => {
            let syn = copy(state.syn_set_values);
            syn[action.payload.name] = action.payload.checked ? action.payload.index : -1;
            return {...state, syn_set_values: syn}
        },

        set_metadata_value: (state, action: PayloadAction<MetadataValuePayload>) => {
            const metadata = action.payload.metadata;
            const name = action.payload.name;
            const checked = action.payload.checked;
            const existing_values = copy(state.metadata_values[metadata] ? state.metadata_values[metadata] : {});
            existing_values[name] = checked;
            let mdv = copy(state.metadata_values);
            mdv[metadata] = existing_values;
            return {...state, metadata_values: mdv, search_page: 0}
        },

        dismiss_search_error: (state) => {
            return {...state, search_error_text: ''}
        },

        set_metadata_error: (state, action: PayloadAction<ErrorPayload>) => {
            return {...state, metadata_error: action.payload.error ?? ''}
        },

        select_document_for_ai_query: (state, action: PayloadAction<FocusPreviewPayload>) => {
            return {...state,
                search_focus: null, // close
                query_ai_focus_url: action.payload.url,
                query_ai_focus_url_id: action.payload.url_id,
                query_ai_focus_title: action.payload.title,
                query_ai_dialog_list: [
                    {"role": "assistant", "content": i18n.t("Please ask me any question about") + " %doc%"}
                ]
            }
        },

        close_query_ai: (state) => {
            return {...state,
                query_ai_focus_url: '',
                query_ai_focus_url_id: 0,
                query_ai_focus_title: '',
                query_ai_dialog_list: []
            }
        },

        set_search_page: (state, action: PayloadAction<SearchPagePayload>) => {
            return {...state, search_page: action.payload.search_page}
        },

        set_page_size: (state, action: PayloadAction<PageSizePayload>) => {
            return {...state, page_size: action.payload.page_size}
        },
    },
    extraReducers
});

// get required SimSage information
export const get_info = createAsyncThunk(
    'get_info',
    async({session, user}: GetInfoPayload, {rejectWithValue}) => {

        const user_id = user && user.id ? user.id : get_client_id();
        const api_base = window.ENV.api_base;
        const session_id = (session && session.id) ? session.id : undefined;
        const url = api_base + '/knowledgebase/search/info/' + encodeURIComponent(window.ENV.organisation_id) + '/' +
                    encodeURIComponent(user_id);
        return axios.get(url, get_headers(session_id))
            .then((response) => {
                console.log('SimSage Search UI version ' + pretty_version());
                return response.data;
            }).catch((err) => {
                return rejectWithValue(err)
            })
    }
);

// save a user metadata key/value pair for a document
// saving with an empty metadata.value is a delete
export const save_hashtags = createAsyncThunk(
    'save_hashtags',
    async({session_id, organisation_id, kb_id, document_url, hashtag_list}: SaveHashtagsPayload, {rejectWithValue}) => {

        const api_base = window.ENV.api_base;
        const url = api_base + '/document/user-hashtag';
        const data = {
            organisationId: organisation_id,
            kbId: kb_id,
            url: document_url,
            hashTagList: hashtag_list
        }
        return axios.post(url, data, get_headers(session_id))
            .then((response) => {
                return response.data;
            }).catch((err) => {
                return rejectWithValue(err)
            })
    }
);

// perform a search
export const do_search = createAsyncThunk(
    'do_search',
    async ({
               session,
               search_page,
               client_id,
               user,
               search_text,
               page_size,
               prev_search_text,
               prev_filter,
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
               result_list,
               pages_loaded,
               use_ai,
               next_page,
               reset_pagination
           }: DoSearchPayload, {rejectWithValue}) => {

        const api_base = window.ENV.api_base;
        const session_id = (session && session.id) ? session.id : undefined;
        const url = session_id ? (api_base + '/dms/query') : (api_base + '/semantic/query');

        const filter_text = get_filters(metadata_list, metadata_values, entity_values, source_list, source_values,
                                        hash_tag_list, []);

        const in_parameters = {session, client_id, user, search_text, shard_list,
            group_similar, newest_first, metadata_list, metadata_values, entity_values, source_list,
            source_values, hash_tag_list, syn_set_values, result_list: result_list, prev_search_text: prev_search_text,
            prev_filter: prev_filter};

        // reset pagination?  if this is a different search or the previous search had no results
        let new_search_page = search_page;
        let new_pages_loaded = pages_loaded;
        let new_shard_list = shard_list;
        if (search_text !== prev_search_text || prev_filter !== filter_text ||
            (result_list && result_list.length === 0) || reset_pagination) {
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
            pageSize: page_size,
            shardSizeList: new_shard_list,
            fragmentCount: window.ENV.fragment_count,
            maxWordDistance: window.ENV.max_word_distance,
            spellingSuggest: window.ENV.use_spell_checker,
            useInsight: window.ENV.use_insight,
            contextLabel: '',
            contextMatchBoost: 0.01,
            groupSimilarDocuments: group_similar,
            sortByAge: newest_first,
            sourceId: '',
            useQuestionAnsweringAi: use_ai,
            wordSynSet: syn_set_values,
            documentTypeFilter: get_document_types(metadata_values),
            startDate: 0, // was the slider
            endDate: 0,
        };

        if (search_text.trim().length > 0) {
            return axios.post(url, data, get_headers(session_id))
                .then((response) => {
                    if (response && response.data && response.data.messageType === 'message') {
                        response.data.search_text = search_text;
                        response.data.original_text = search_text;
                        response.data.page = new_search_page;
                        response.data.pages_loaded = new_pages_loaded
                        response.data.prev_search_text = search_text;
                        response.data.prev_filter = filter_text;
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
    'create_short_summary', 
    async({session, target_url, sentence_id}: CreateShortSummaryPayload, {rejectWithValue}) => {

        const api_base = window.ENV.api_base;
        const session_id = (session && session.id) ? session.id : undefined;
        const url = api_base + '/semantic/short-summary';
        const data = {
            organisationId: window.ENV.organisation_id,
            kbId: getKbId(),
            clientId: session_id,
            url: target_url,
            sentenceId: sentence_id,
        };
        return axios.post(url, data, get_headers(session_id))
            .then((response) => {
                return response.data;
            }).catch((err) => {
                return rejectWithValue(err)
            })
    }
);

// teach SimSage re-enforce a Document's importance for a given search / document combination
export const teach = createAsyncThunk(
    'teach', 
    async({session, search_text, result, increment, on_done}: TeachPayload, {rejectWithValue}) => {

        const api_base = window.ENV.api_base;
        const session_id = (session && session.id) ? session.id : undefined;
        const url = api_base + '/semantic/teach';
        const data = {
            organisationId: window.ENV.organisation_id,
            kbId: getKbId(),
            searchText: search_text,
            urlId: result.urlId,
            increment: increment
        };
        return axios.post(url, data, get_headers(session_id))
            .then((response) => {
                return response.data;
            }).catch((err) => {
                return rejectWithValue(err)
            }).finally(() => {
                if (on_done) on_done()
            })
    }
);

/**
 * get an html preview for a given url / page
 *
 */
export const ask_document_question = createAsyncThunk(
    'ask_document_question',
    async ({session, prev_conversation_list, question, document_url, document_url_id, on_success}: AskDocumentQuestionPayload,
           {rejectWithValue}) => {

        const api_base = window.ENV.api_base;
        const session_id = (session && session.id) ? session.id : get_client_id();
        const url = api_base + '/semantic/document-qa';
        let conversationList = [];
        if (prev_conversation_list.length > 1) {
            conversationList = prev_conversation_list.slice(1, prev_conversation_list.length);
        }
        conversationList.push({"role": "user", "content": question})
        const data = {
            "organisationId": window.ENV.organisation_id,
            "kbId": getKbId(),
            "url": document_url,
            "urlId": document_url_id,
            "conversationList": conversationList,
            "answer": "",
        }

        return axios.post(url, data, get_headers(session_id)).then((response) => {
            if (on_success) {
                on_success();
            }
            return response.data;
        }).catch((err) => {
            return rejectWithValue(err)
        })
    }
);

/**
 * perform a possible three function method: either simsage search, or focus url query, or
 * start a question with evidence cylce
 */
export const do_llm_search = createAsyncThunk(
    'do_llm_search',
    async ({
               session,
               prev_conversation_list,
               question,
               metadata_list,
               metadata_values,
               source_list,
               source_values,
               focus_url,
               metadata_url
           }: DoLlmSearchPayload,
           {rejectWithValue}) => {

        const api_base = window.ENV.api_base;
        const session_id = (session && session.id) ? session.id : get_client_id()
        const url = api_base + '/semantic/llm-first'
        const filter_text = get_source_filter(source_list, source_values)
        let conversationList = JSON.parse(JSON.stringify(prev_conversation_list))
        conversationList.push({"role": "user", "content": question})
        const data = {
            "organisationId": window.ENV.organisation_id,
            "kbId": getKbId(),
            "conversationList": conversationList,
            "sourceFilter": filter_text,
            "documentTypeFilter": get_document_types(metadata_values),
            "url": focus_url ?? "",
            "metadataUrl": metadata_url ?? "",
            "language": window.ENV.language
        }

        return axios.post(url, data, get_headers(session_id)).then((response) => {
            return response.data;
        }).catch((err) => {
            return rejectWithValue(err)
        })
    }
);

/**
 * continue a question with evidence query - do the search
 */
export const do_llm_search_step2 = createAsyncThunk(
    'do_llm_search_step2',
    async ({
               session,
               prev_conversation_list,
               question,
               metadata_list,
               metadata_values,
               source_list,
               source_values,
           }: DoLlmSearchStep2Payload,
           {rejectWithValue}) => {

        const api_base = window.ENV.api_base;
        const session_id = (session && session.id) ? session.id : get_client_id();
        const url = api_base + '/semantic/llm-first-2';
        const filter_text = get_source_filter(source_list, source_values);
        let conversationList = JSON.parse(JSON.stringify(prev_conversation_list))
        conversationList.push({"role": "assistant", "content": question})
        const data = {
            "organisationId": window.ENV.organisation_id,
            "kbId": getKbId(),
            "conversationList": conversationList,
            "sourceFilter": filter_text,
            "documentTypeFilter": get_document_types(metadata_values),
            "language": window.ENV.language
        }

        return axios.post(url, data, get_headers(session_id)).then((response) => {
            return response.data;
        }).catch((err) => {
            return rejectWithValue(err)
        })
    }
);

/**
 * answer a question using search results
 */
export const do_llm_search_step3 = createAsyncThunk(
    'do_llm_search_step3',
    async ({
               session,
               prev_conversation_list,
               question,
               search_result
           }: DoLlmSearchStep3Payload,
           {rejectWithValue}) => {

        const api_base = window.ENV.api_base;
        const session_id = (session && session.id) ? session.id : get_client_id();
        const url = api_base + '/semantic/llm-first-3';
        let conversationList = JSON.parse(JSON.stringify(prev_conversation_list))

        // cut off the last item in the conversation list before sending it?
        if (conversationList.length > 0) {
            const last = conversationList[conversationList.length - 1]
            console.log("last", last)
            // if (last.content.indexOf("I could not find any documents for ") < 0) {
            if (last.searchResult.totalDocumentCount > 0) {
                conversationList = conversationList.slice(0, conversationList.length - 1)
            }
        }
        conversationList.push({"role": "assistant", "content": question, "searchResult": search_result})

        const data = {
            "organisationId": window.ENV.organisation_id,
            "kbId": getKbId(),
            "conversationList": conversationList,
            "language": window.ENV.language
        }

        return axios.post(url, data, get_headers(session_id)).then((response) => {
            return response.data;
        }).catch((err) => {
            return rejectWithValue(err)
        })
    }
);

export const {
    go_home, update_search_text, set_focus_for_preview, set_source_value, set_metadata_value,
    dismiss_search_error, set_group_similar, set_newest_first, set_source_filter, select_syn_set,
    set_source_values, close_preview,
    toggle_ai, select_document_for_ai_query, close_query_ai,
    set_compact_view, set_icon_mode, set_llm_search,
    set_metadata_error,
    set_search_page, set_page_size, toggle_theme,
    set_focus_for_ai_queries, set_user_query, toggle_message_expand
} = searchSlice.actions;

export default searchSlice.reducer;
