import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";

import './Search.css';
import {ErrorDialog} from "../common/ErrorDialog";
import {TitleBar} from "./TitleBar";
import {SearchResults} from "./SearchResults";
import {StartSearchPage} from "./StartSearchPage";
import {close_menu, toggle_menu} from "../reducers/authSlice";
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


/**
 * Simple search start page manages the display between the first page with the logos
 * and the search result / title page
 *
 */
function Search(props) {
    const dispatch = useDispatch();
    const {show_menu} = useSelector((state) => state.authReducer);
    const {show_search_results, search_focus} = useSelector((state) => state.searchReducer);
    const {shard_list, search_text, group_similar, newest_first, metadata_list, metadata_values} = useSelector((state) => state.searchReducer);
    const {entity_values, hash_tag_list, syn_sets, last_modified_slider, created_slider} = useSelector((state) => state.searchReducer);
    const {source_list, source_values, result_list, prev_search_text} = useSelector((state) => state.searchReducer);
    const {session, organisation, user} = useSelector((state) => state.authReducer);

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
                search(data);
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

    function close_accounts_menu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        dispatch(close_menu());
    }

    // perform search
    function search(values) {
        const data = {
            session: session,
            client_id: get_client_id(),
            shard_list: shard_list,
            search_text: search_text,
            prev_search_text: prev_search_text,
            group_similar: group_similar,
            newest_first: newest_first,
            metadata_list: metadata_list,
            metadata_values: metadata_values,
            entity_values: entity_values,
            source_list: source_list,
            source_values: source_values,
            hash_tag_list: hash_tag_list,
            syn_sets: syn_sets,
            last_modified_slider: last_modified_slider,
            created_slider: created_slider,
            result_list: result_list
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
    }

    const show_preview = (search_focus !== null && window.ENV.show_previews);

    return (
        <div className="Search" onClick={() => on_close_menu()}>
            <ErrorDialog />

            <div className="outer">

                { (show_search_results || !window.ENV.allow_anon) &&
                    <TitleBar on_search={() => search(null)} />
                }

                { !show_search_results && window.ENV.allow_anon &&
                    <div className="inner">
                        <StartSearchPage on_search={() => search(null)} />
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
                                <img src="/images/icon_n-account.svg" alt=""
                                     className={show_menu ? "d-none" : ""}/>
                                <img src="/images/icon_n-account-active.svg" alt=""
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
