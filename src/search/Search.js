import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";

import './Search.css';
import {ErrorDialog} from "../common/ErrorDialog";
import {TitleBar} from "./TitleBar";
import {SearchResults} from "./SearchResults";
import {StartSearchPage} from "./StartSearchPage";
import {close_kb_menu, close_menu, toggle_kb_menu, toggle_menu} from "../reducers/authSlice";
import {
    do_search,
    get_info,
    set_metadata_values, set_source_values,
    update_search_text
} from "../reducers/searchSlice";
import {
    get_client_id, get_full_username, setup_query_parameter_state
} from "../common/Api";
import {AccountDropdown} from "../common/AccountDropdown";
import {PreviewModal} from "./preview/PreviewModal";
import {KnowledgebaseDropdown} from "../common/KnowledgebaseDropdown";


/**
 * Simple search start page manages the display between the first page with the logos
 * and the search result / title page
 *
 */
function Search(props) {
    const dispatch = useDispatch();
    const {show_menu, show_kb_menu} = useSelector((state) => state.authReducer);
    const {show_search_results, search_focus, busy, all_kbs} = useSelector((state) => state.searchReducer);
    const {shard_list, search_text, group_similar, newest_first, metadata_list, metadata_values} = useSelector((state) => state.searchReducer);
    const {entity_values, hash_tag_list, syn_sets, last_modified_slider, created_slider} = useSelector((state) => state.searchReducer);
    const {source_list, source_values, result_list, prev_search_text, search_page,
           pages_loaded, category_list, category_values, source_id_list, use_query_ai} = useSelector((state) => state.searchReducer);
    const {session, organisation, user} = useSelector((state) => state.authReducer);

    const showKbMenu = window.ENV.allow_knowledgbase_selector && all_kbs && all_kbs.length>1

    useEffect(() => {
        dispatch(get_info({session: session, user: user}));
    }, [session, user, dispatch])

    useEffect(() => {
        // update control state from the query string where possible
        let data = setup_query_parameter_state(source_list);
        if (data) {
            if (data.search_text)
                dispatch(update_search_text(data.search_text));
            if (data.metadata_values)
                dispatch(set_metadata_values(data.metadata_values));
            if (data.source_values)
                dispatch(set_source_values(data.source_values));

            // and perform a search using this data if we need to
            data = {...data, source_list: source_list};
            if (source_list.length > 0)
                search({data, load_more: false});
        }
    }, [source_list]) // the dependency on source_list is a convenient one as it relates to get_info finishing

    const is_authenticated = session && session.id && session.id.length > 0;

    function toggle_accounts_menu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        dispatch(toggle_menu());
    }

    function toggle_knowledgebase_menu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        dispatch(toggle_kb_menu());
    }

    function close_accounts_menu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        dispatch(close_menu());
    }

    function close_knowledgebase_menu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        dispatch(close_kb_menu());
    }

    // perform search
    function search(values) {
        const data = {
            session: session,
            client_id: get_client_id(),
            user: user,
            search_text: search_text,
            shard_list: shard_list,
            newest_first: newest_first,
            group_similar: group_similar,
            search_page: search_page,
            category_list: category_list,
            category_values: category_values,
            entity_values: entity_values,
            pages_loaded: pages_loaded,
            source_id_list: source_id_list,
            hash_tag_list: hash_tag_list,
            syn_sets: syn_sets,
            result_list: result_list,
            prev_search_text: prev_search_text,
            metadata_list: metadata_list,
            metadata_values: metadata_values,
            source_list: source_list,
            source_values: source_values,
            last_modified_slider: last_modified_slider,
            created_slider: created_slider,
            use_query_ai: (use_query_ai && window.ENV.query_ai_enabled)
        };
        if (values) {
            dispatch(do_search({...data, ...values}));
        } else {
            dispatch(do_search(data));
        }
    }

    // close the main menu if it is open
    function on_close_menu() {
        if (show_menu) {
            dispatch(close_menu());
        }
        if (show_kb_menu){
            dispatch(close_kb_menu())
        }
    }

    const show_preview = (search_focus !== null && window.ENV.show_previews);

    return (
        <div className="Search" onClick={() => on_close_menu()}>
            <ErrorDialog />

            <div className={busy ? "wait-cursor outer" : "outer"}>

                { (show_search_results || !window.ENV.allow_anon) &&
                    <TitleBar on_search={() => search({load_more: false})} />
                }

                { !show_search_results && window.ENV.allow_anon &&
                    <div className="inner">
                        <StartSearchPage on_search={() => search({load_more: false})} />
                    </div>
                }

                {!show_preview && showKbMenu &&
                    <div className="kb-menu">
                        <div className="account" title="Select Data Source">
                            <button className={(show_kb_menu ? "active" : "") + " btn nav-btn"}
                                    onClick={(e) => toggle_knowledgebase_menu(e)}>
                                <img src="images/icon_ci-database.svg" alt=""
                                     className={show_kb_menu ? "d-none" : ""}/>
                                <img src="images/icon_ci-database_active.svg" alt=""
                                     className={!show_kb_menu ? "d-none" : ""}/>
                            </button>
                        </div>
                        <KnowledgebaseDropdown
                            close_menu={(e) => close_knowledgebase_menu(e)}
                            show_menu={show_kb_menu}
                        />
                    </div>
                }

                {!show_preview &&
                    <div className="sign-in-menu">
                        <div className="d-none d-lg-flex flex-column text-end me-3 sign-in-float">
                            <p className="org-name mb-0 small">{organisation && organisation.name ? organisation.name : ""}</p>
                            <p className="user-name mb-0">{get_full_username(user)}</p>
                        </div>
                        <div className="account" title="menu">
                            <button className={(show_menu ? "active" : "") + " btn nav-btn"}
                                    onClick={(e) => toggle_accounts_menu(e)}>
                                <img src="images/icon_n-account.svg" alt=""
                                     className={show_menu ? "d-none" : ""}/>
                                <img src="images/icon_n-account-active.svg" alt=""
                                     className={!show_menu ? "d-none" : ""}/>
                            </button>
                        </div>
                        <AccountDropdown
                            onSignOut={(e) => props.on_sign_out(e)}
                            onSignIn={(e) => props.on_sign_in(e)}
                            close_menu={(e) => close_accounts_menu(e)}
                            isAuthenticated={is_authenticated}
                            session={session}
                            show_menu={show_menu}
                        />
                    </div>
                }

                { show_search_results &&
                    <div className="inner overflow-hidden">
                        <SearchResults on_search={(values) => search(values)} />
                    </div>
                }

            </div>

            { show_preview &&
                <div className="overlay">
                    <PreviewModal />
                </div>
            }

        </div>
    );
}

export default Search;
