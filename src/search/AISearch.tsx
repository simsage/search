import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";

import './Search.css';
import {ErrorDialog} from "../common/ErrorDialog";
import {close_kb_menu, close_menu} from "../reducers/authSlice";
import {
    close_preview,
    close_query_ai,
    do_search,
    get_info,
    set_source_values,
    update_search_text
} from "../reducers/searchSlice";
import {
    get_client_id,
    setup_query_parameter_state
} from "../common/Api";
import ErrorMessage from "../common/ErrorMessage";
import { RootState, AppDispatch } from '../store';
import {ConversationalAIDialog} from "./controls/ConversationalAIDialog";
import {DoSearchPayload} from "../types";

// Use AppDispatch type for dispatch
const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Simple search start page manages the display between the first page with the logos
 * and the search result / title page
 *
 */
function AISearch(): JSX.Element {
    const dispatch = useAppDispatch();
    const {show_menu, show_kb_menu} = useSelector((state: RootState) => state.authReducer);
    const {busy, has_info, language_code} = useSelector((state: RootState) => state.searchReducer);
    const {shard_list, search_text, sort_order, metadata_list, metadata_values} = useSelector((state: RootState) => state.searchReducer);
    const {entity_values, hash_tag_list, syn_set_values} = useSelector((state: RootState) => state.searchReducer);
    const {source_list, source_values, result_list, prev_search_text, prev_filter,
           pages_loaded, use_ai, ai_enabled, search_page, page_size, theme} = useSelector((state: RootState) => state.searchReducer);
    const {session, user} = useSelector((state: RootState) => state.authReducer);

    // set up a global document-listener just for keydown ESC here
    useEffect(() => {
        // close the preview if we caught the keydown event for the escape key
        function check_for_escape_key_to_close_modal(event: KeyboardEvent) {
            if (event && event.key === "Escape") {
                dispatch(close_query_ai());
                dispatch(close_preview());
            }
        }
        const listener = (e: KeyboardEvent) => check_for_escape_key_to_close_modal(e);
        document.addEventListener("keydown", listener);
        return function() {
            document.removeEventListener("keydown", listener);
        }
    }, [dispatch])

    useEffect(() => {
        if (!has_info)
            dispatch(get_info({session: session, user: user}));
    }, [session, user, dispatch, has_info])

    useEffect(() => {
        // update control state from the query string where possible
        let data = setup_query_parameter_state(source_list);
        if (data) {
            if (data.search_text)
                dispatch(update_search_text(data.search_text));
            if (data.source_values)
                dispatch(set_source_values(data.source_values));

            // and perform a search using this data if we need to
            data = {...data, source_list: source_list};
            if (source_list.length > 0 && session?.id)
                search({data, next_page: false});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source_list, session?.id, dispatch]) // the dependency on source_list is a convenient one as it relates to get_info finishing

    // perform search
    function search(values: any): void {
        const data: DoSearchPayload = {
            session: session,
            client_id: get_client_id(),
            user: user,
            search_text: search_text,
            shard_list: shard_list,
            sort_order: sort_order,
            search_page: search_page,
            page_size: page_size,
            entity_values: entity_values,
            pages_loaded: pages_loaded,
            hash_tag_list: hash_tag_list,
            syn_set_values: syn_set_values,
            result_list: result_list,
            prev_search_text: prev_search_text,
            prev_filter: prev_filter,
            metadata_list: metadata_list,
            metadata_values: metadata_values,
            source_list: source_list,
            source_values: source_values,
            next_page: false,
            reset_pagination: false,
            use_ai: (use_ai && ai_enabled),
            author: "",
            path: "",
            title: "",
            language_code: language_code
        };
        if (session && session.id && !busy) {
            if (values) {
                dispatch(do_search({...data, ...values}));
            } else {
                dispatch(do_search(data));
            }
        }
    }

    // close the main menu if it is open
    function on_close_menu(): void {
        if (show_menu) {
            dispatch(close_menu());
        }
        if (show_kb_menu){
            dispatch(close_kb_menu())
        }
    }

    return (
        <div className="Search" data-bs-theme={theme === "light" ? "light" : "dark"} onClick={() => on_close_menu()}>

            <ErrorDialog />
            <ErrorMessage />

            <div className={(busy ? "wait-cursor " : "") + (theme === "light" ? "outer" : "outer-dark")}>
                <ConversationalAIDialog />
            </div>

        </div>
    );
}

export default AISearch;
