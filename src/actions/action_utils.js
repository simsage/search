import {
    BUSY,
    ERROR,
    DO_SEARCH, SELECT_FOLDER,
} from "./actions";

import Comms from "../common/comms";
import Api from "../common/api";

// helper
export async function do_search(text, original_text, page, shard_list, session_id, user_id,
                                group_similar, newest_first, dispatch) {

    dispatch({type: BUSY, busy: true});

    const data = {
        organisationId: window.ENV.organisation_id,
        kbList: [window.ENV.kb_id],
        scoreThreshold: window.ENV.score_threshold,
        clientId: user_id,
        semanticSearch: true,
        query: text,
        numResults: 1,
        page: page,
        pageSize: window.ENV.page_size,
        shardSizeList: shard_list,
        fragmentCount: window.ENV.fragment_count,
        maxWordDistance: window.ENV.max_word_distance,
        spellingSuggest: false,
        contextLabel: '',
        contextMatchBoost: 0.01,
        groupSimilarDocuments: group_similar,
        sortByAge: newest_first,
        sourceId: '',
    };
    const url = session_id !== "" ? '/dms/query' : '/semantic/query';
    await Comms.http_post(url, session_id, data,
        (result) => {
            if (result && result.data && result.data.messageType === 'message') {
                result.data.search_text = text;
                result.data.original_text = original_text;
                result.data.page = page;
                dispatch({type: DO_SEARCH, data: result.data});
            } else {
                dispatch({type: ERROR, title: "Error", error: 'invalid message type:' + result.data.messageType})
            }
        },
        (error) => {
            dispatch({type: ERROR, title: "Error", error: error})
        }
    );
}


// select / open a folder inside a source
export async function select_folder(folder, folder_tracker, force_get, session_id, dispatch) {
    if (folder && folder.sourceId > 0 && folder.isFolder && folder.url) {
        const folder_item = folder_tracker[folder.sourceId + ":" + folder.url];
        // only load when not yet present
        if (!folder_item || force_get) {
            dispatch({type: BUSY, busy: true});

            await Comms.http_get('/search/folder/' + encodeURIComponent(window.ENV.organisation_id) + '/' + encodeURIComponent(window.ENV.kb_id) + '/' +
                encodeURIComponent(folder.sourceId) + '/' + btoa(unescape(encodeURIComponent(folder.url))),
                session_id,
                (response) => {
                    dispatch({type: SELECT_FOLDER, folder: response.data});
                },
                (errStr) => {
                    dispatch({type: ERROR, title: "Error", error: errStr})
                }
            )
        } else {
            dispatch({type: SELECT_FOLDER, folder: folder_item});
        }
    }
}

/**
 * remove AND OR and NOT and any duplicates from the text
 */
function filter_text(text, syn_sets) {
    // remove any : and / as well as they are special characters
    const text_list = text.replace(':', ' ').replace('/', ' ').split(' ');
    const final_text_list = [];
    const text_set = {};
    for (const t of text_list) {
        const item = t.trim().toLowerCase();
        if (item.length > 0 && !text_set[item] && item !== "or" && item !== "and" && item !== "not") {
            text_set[item] = true;
            let syn_set = -1;
            if (syn_sets && syn_sets[item] >= 0) {
                syn_set = syn_sets[item];
            }
            if (syn_set >= 0) {
                final_text_list.push(item + "/" + syn_set);
            } else {
                final_text_list.push(item);
            }
        }
    }
    return final_text_list.join(' ');
}


/**
 * process the filters and add them to the text string to create a super search string
 *
 * @param _text the user's search text
 * @param category_list the list of all metadata items to check
 * @param category_values a value-data structure for each metadata categorical item metadata -> {categoryType, metadata, minValue, maxValue, value}
 * @param syn_sets selected syn-set values
 * @param hash_tag_list list of hash-tags to filter on
 * @returns {string} the modified (or original search string)
 */
export function add_filter_to_search_text(_text, category_list, category_values, syn_sets, hash_tag_list) {
    // todo: get filter data and modify the query
    // range(metadata, start#, end#)
    // doc(metadata, '')
    // sort( metadata, 'desc|asc')

    const delta = 3600_000;
    let filter_str = "";
    let needs_and = false;
    if (category_values) {
        for (const md of category_list) {

            const category_type = Api.simplifyMetadataType(md.categoryType);

            if (category_values && category_values[md.metadata] && category_type === "date range") {
                const v = category_values[md.metadata];
                const d1 = (v.minValue - md.minValue);
                const d2 = (md.maxValue - v.maxValue);
                if (v && (d1 > delta ||  d2 > delta)) {
                    const lhs = v.minValue;
                    const rhs = v.maxValue;
                    if (filter_str.length > 0) {
                        filter_str += " and ";
                    }
                    filter_str += "range(" + md.metadata + "," + lhs + "," + rhs + ")";
                    needs_and = true;
                }
            }

            let type_filter = "";
            if (category_values && category_values[md.metadata] && category_values[md.metadata].value && category_type === "category") {
                const v_set = category_values[md.metadata].value;
                let temp_filter = "";
                for (const [k, v] of Object.entries(v_set)) {
                    if (v && k) {
                        if (temp_filter.length > 0) {
                            temp_filter += " or ";
                        }
                        temp_filter += "doc(" + md.metadata + "," + k + ")";
                    }
                }
                if (temp_filter.length > 0) {
                    if (type_filter.length > 0) {
                        type_filter += " and ";
                    }
                    type_filter += "(" + temp_filter + ")";
                }
            }

            if (type_filter.length > 0) {
                if (needs_and) filter_str += " and (";
                filter_str += type_filter;
                if (needs_and) filter_str += ")";
            }
        }
    }
    if (hash_tag_list && hash_tag_list.length > 0) {
        if (needs_and) filter_str += " and (";
        let ht_filter = "";
        for (const hash_tag of hash_tag_list) {
            if (ht_filter.length > 0)
                ht_filter += " and ";
            ht_filter += "#" + hash_tag;
        }
        filter_str += ht_filter;
        if (needs_and) filter_str += ")";
    }
    let search_text = "";
    let text = filter_text(_text, syn_sets);
    if (filter_str.length > 0 && text.length > 0) {
        if (text.indexOf(':') < 0) {
            search_text = "(body:" + text + " and " + filter_str + ")";
        } else {
            search_text = "(" + text + " and " + filter_str + ")";
        }
    } else if (filter_str.length > 0) {
        search_text = "(" + filter_str + ")";
    } else {
        if (text.indexOf(':') < 0) {
            search_text = "(body: " + text + ")";
        } else {
            search_text = "(" + text + ")";
        }
    }
    return search_text;
}
