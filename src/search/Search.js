import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";

import './Search.css';
import './TitleBar.css';
import {ErrorDialog} from "../common/ErrorDialog";
import {SearchResults} from "./SearchResults";
import {AIDialog} from "./controls/AIDialog";
import {close_kb_menu, close_menu, toggle_kb_menu, toggle_menu} from "../reducers/authSlice";
import {
    close_preview,
    close_query_ai,
    do_search,
    get_info, go_home,
    set_metadata_values, set_source_values,
    update_search_text
} from "../reducers/searchSlice";
import {
    get_client_id, get_enterprise_logo, get_full_username, setup_query_parameter_state
} from "../common/Api";
import {AccountDropdown} from "../common/AccountDropdown";
import {PreviewModal} from "./preview/PreviewModal";
import {KnowledgebaseDropdown} from "../common/KnowledgebaseDropdown";
import {SearchBox} from "./SearchBox";
import ErrorMessage from "../common/ErrorMessage";


/**
 * Simple search start page manages the display between the first page with the logos
 * and the search result / title page
 *
 */
function Search(props) {
    const dispatch = useDispatch();
    const {show_menu, show_kb_menu} = useSelector((state) => state.authReducer);
    const {search_focus, busy, all_kbs, has_info} = useSelector((state) => state.searchReducer);
    const {shard_list, search_text, group_similar, newest_first, metadata_list, metadata_values} = useSelector((state) => state.searchReducer);
    const {entity_values, hash_tag_list, syn_sets, last_modified_slider, created_slider} = useSelector((state) => state.searchReducer);
    const {source_list, source_values, result_list, prev_search_text, prev_filter,
           pages_loaded, category_list, category_values, source_id_list, use_ai, ai_enabled,
           query_ai_focus_url} = useSelector((state) => state.searchReducer);
    const {session, organisation, user} = useSelector((state) => state.authReducer);

    const show_kb = window.ENV.allow_knowledgbase_selector && all_kbs && all_kbs.length>1

    // set up a global document-listener just for keydown ESC here
    useEffect(() => {
        // close the preview if we caught the keydown event for the escape key
        function check_for_escape_key_to_close_modal(event) {
            if (event && event.key === "Escape") {
                dispatch(close_query_ai());
                dispatch(close_preview());
            }
        }
        const listener = (e) => check_for_escape_key_to_close_modal(e);
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
            if (data.metadata_values)
                dispatch(set_metadata_values(data.metadata_values));
            if (data.source_values)
                dispatch(set_source_values(data.source_values));

            // and perform a search using this data if we need to
            data = {...data, source_list: source_list};
            if (source_list.length > 0 && session?.id)
                search({data, next_page: false});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source_list, session?.id, dispatch]) // the dependency on source_list is a convenient one as it relates to get_info finishing

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

    function on_go_home(e) {
        const customerLink = window.ENV.customer_website;
        // hide search results
        if (customerLink && customerLink !== '') {
            e.preventDefault();
            e.stopPropagation();
            window.open(customerLink, 'blank');
        } else {
            dispatch(go_home());
        }
    }

    // perform search
    function search(values) {
        const data = {
            session: session,
            client_id: get_client_id(),
            user: user,
            search_text: search_text,
            shard_list: shard_list,
            group_similar: group_similar,
            newest_first: newest_first,
            search_page: Math.floor(result_list.length / window.ENV.page_size),
            category_list: category_list,
            category_values: category_values,
            entity_values: entity_values,
            pages_loaded: pages_loaded,
            source_id_list: source_id_list,
            hash_tag_list: hash_tag_list,
            syn_sets: syn_sets,
            result_list: result_list,
            prev_search_text: prev_search_text,
            prev_filter: prev_filter,
            metadata_list: metadata_list,
            metadata_values: metadata_values,
            source_list: source_list,
            source_values: source_values,
            last_modified_slider: last_modified_slider,
            created_slider: created_slider,
            next_page: false,
            reset_pagination: false,
            use_ai: (use_ai && ai_enabled)
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
    const show_ai = ai_enabled && query_ai_focus_url && query_ai_focus_url.length > 0;

    return (
        <div className="Search" onClick={() => on_close_menu()}>

            <ErrorDialog />
            {/* metadata error display */}
            <ErrorMessage />

            <div className={(busy && !show_preview) ? "wait-cursor outer" : "outer"}>

                {/* this is the top bar */}
                <div className="border-bottom-0 row mx-0 px-0 navbar title_bar justify-content-start">

                    {/* enterprise logo */}
                    <div className="col-1 ps-4 pe-0 h-100 d-flex justify-content-end">
                        <div className="large-screen">
                            <div className="d-flex align-items-center" onClick={() => window.location = "/"}>
                                <img src={get_enterprise_logo()} alt="" className="w-100 my-2 enterprise-logo"
                                     onClick={(event) => on_go_home(event)}/>
                            </div>
                        </div>
                    </div>

                    {/* search box */}
                    <div className="col-8">
                        <SearchBox
                                on_search={() => search({next_page: false})}
                                on_search_text={(text) => search({next_page: false, search_text: text})}
                        />
                    </div>

                    <div className="col-1">
                    </div>

                    {/* large and small screen name and menus */}
                    <div className="col-2">
                    {!show_preview &&
                        <div>
                            {/* only displayed on larger screens */}
                            <div className="large-screen">
                                <div className="row">
                                    <div className="col-6 justify-content-end">
                                        <p className="org-name mb-0 small">{organisation && organisation.name ? organisation.name : ""}</p>
                                        <p className="user-name mb-0">{get_full_username(user)}</p>
                                    </div>
                                    <div className="col-2 px-1 mx-1" title="menu">
                                        <button className={(show_menu ? "active" : "") + " btn nav-btn"}
                                                onClick={(e) => toggle_accounts_menu(e)}>
                                            <img src={window.ENV.image_base_name + "/images/icon_n-account.svg"} alt=""
                                                 className={show_menu ? "d-none" : ""}/>
                                            <img src={window.ENV.image_base_name + "/images/icon_n-account-active.svg"} alt=""
                                                 className={!show_menu ? "d-none" : ""}/>
                                        </button>
                                        <AccountDropdown
                                            close_menu={(e) => close_accounts_menu(e)}
                                            isAuthenticated={is_authenticated}
                                            session={session}
                                            show_menu={show_menu}
                                        />
                                    </div>
                                    <div className="col-2 px-1 mx-1">
                                        { show_kb &&
                                        <div className="kb-menu">
                                            <div className="account" title="Select Data Source">
                                                <button className={(show_kb_menu ? "active" : "") + " btn nav-btn"}
                                                        onClick={(e) => toggle_knowledgebase_menu(e)}>
                                                    <img src={window.ENV.image_base_name + "/images/icon_ci-database.svg"} alt=""
                                                         className={show_kb_menu ? "d-none" : ""}/>
                                                    <img src={window.ENV.image_base_name + "/images/icon_ci-database_active.svg"} alt=""
                                                         className={!show_kb_menu ? "d-none" : ""}/>
                                                </button>
                                            </div>
                                            <KnowledgebaseDropdown
                                                close_menu={(e) => close_knowledgebase_menu(e)}
                                                show_menu={show_kb_menu}
                                            />
                                        </div>
                                        }
                                    </div>
                                    <div className="col-2"></div>
                                </div>
                            </div>

                            {/* only displayed on smaller screens */}
                            <div className="small-screen">
                                <div className="row">
                                    <div className="col-2 px-1 mx-2" title="menu">
                                        <button className={(show_menu ? "active" : "") + " btn nav-btn"}
                                                onClick={(e) => toggle_accounts_menu(e)}>
                                            <img src={window.ENV.image_base_name + "/images/icon_n-account.svg"} alt=""
                                                 className={show_menu ? "d-none" : ""}/>
                                            <img src={window.ENV.image_base_name + "/images/icon_n-account-active.svg"} alt=""
                                                 className={!show_menu ? "d-none" : ""}/>
                                        </button>
                                        <AccountDropdown
                                            onSignOut={(e) => props.on_sign_out(e)}
                                            onSignIn={(e) => props.on_sign_in(e)}
                                            close_menu={(e) => close_accounts_menu(e)}
                                            isAuthenticated={is_authenticated}
                                            session={session}
                                            show_menu={show_menu}
                                        />
                                    </div>
                                    <div className="col-2 px-1 mx-2">
                                        {show_kb &&
                                        <div className="kb-menu">
                                            <div className="account" title="Select Data Source">
                                                <button className={(show_kb_menu ? "active" : "") + " btn nav-btn"}
                                                        onClick={(e) => toggle_knowledgebase_menu(e)}>
                                                    <img src={window.ENV.image_base_name + "/images/icon_ci-database.svg"} alt=""
                                                         className={show_kb_menu ? "d-none" : ""}/>
                                                    <img src={window.ENV.image_base_name + "/images/icon_ci-database_active.svg"} alt=""
                                                         className={!show_kb_menu ? "d-none" : ""}/>
                                                </button>
                                            </div>
                                            <KnowledgebaseDropdown
                                                close_menu={(e) => close_knowledgebase_menu(e)}
                                                show_menu={show_kb_menu}
                                            />
                                        </div>
                                        }
                                    </div>
                                    <div className="col-8"></div>
                                </div>
                            </div>
                        </div>
                    }
                    </div>

                </div>

                <div className="ai-float">
                    {show_ai &&
                        <AIDialog/>
                    }
                </div>

                {/* search results and side widgets */}
                <div className="inner overflow-hidden">
                    <SearchResults on_search={(values) => search(values)}/>
                </div>

            </div>

            {show_preview &&
                <div className="overlay">
                    <PreviewModal/>
                </div>
            }

        </div>
    );
}

export default Search;
