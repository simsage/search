import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import './Search.css';
import './TitleBar.css';
import './controls/AIDialog.css';
import { ErrorDialog } from "../common/ErrorDialog";
import { SearchResults } from "./SearchResults";
import { AIDialog } from "./controls/AIDialog";
import {close_kb_menu, close_menu, toggle_kb_menu, toggle_menu, toggle_query_builder} from "../reducers/authSlice";
import {
    close_preview,
    close_query_ai,
    do_search,
    get_info, get_search_favourites, go_home,
    set_sort_order,
    set_source_values,
    update_search_text
} from "../reducers/searchSlice";
import {
    get_client_id,
    get_enterprise_logo,
    get_full_username, min_width,
    setup_query_parameter_state
} from "../common/Api";
import { AccountDropdown } from "../common/AccountDropdown";
import { PreviewModal } from "./preview/PreviewModal";
import { KnowledgebaseDropdown } from "../common/KnowledgebaseDropdown";
import { SearchBox } from "./SearchBox";
import ErrorMessage from "../common/ErrorMessage";
import { RootState, AppDispatch } from '../store';

import icon_account_light from "../assets/images/ui/icon_n-account.svg";
import icon_account_dark from "../assets/images/ui/icon_n-account-dark.svg";
import icon_account_active from "../assets/images/ui/icon_n-account-active.svg";
import icon_database from "../assets/images/ui/icon_ci-database.svg";
import icon_database_dark from "../assets/images/ui/icon_ci-database_dark.svg";
import icon_database_active from "../assets/images/ui/icon_ci-database_active.svg";
import {DoSearchPayload} from "../types";
import useWindowDimensions from "./controls/useWindowDimensions";
import {useTranslation} from "react-i18next";

// You would typically save your SVG content in a file like 'icon.svg'
// but for demonstration, we'll embed it directly.
const ControlPanelIcon = ({ className }: {className: string}): any => {
    return (
        <svg
            version="1.1"
            id="Layer_1"
            x="0px"
            y="0px"
            viewBox="0 0 32 32"
            xmlSpace="preserve"
            xmlns="http://www.w3.org/2000/svg"
            // Apply the user-defined class here
            className={className}
        >
            <g
                id="g1"
                transform="matrix(0.21324788,0,0,0.21678323,2.4718321,3.0211281)"
            >
                {/* The fill property for this path will be inherited from the parent SVG */}
                <path
                    d="m 122.774,16.459 v 0 c 0,5.393 -4.412,9.805 -9.805,9.805 H 92.202 c 1.457,-2.919 2.278,-6.212 2.278,-9.697 0,-3.571 -0.861,-6.941 -2.387,-9.913 h 20.876 c 5.393,0 9.805,4.412 9.805,9.805 z m -33.468,84.798 c 0,9.15 -7.418,16.567 -16.568,16.567 -9.15,0 -16.567,-7.417 -16.567,-16.567 0,-9.149 7.417,-16.567 16.567,-16.567 9.15,0 16.568,7.417 16.568,16.567 z m 33.563,-0.109 v 0 c 0,5.393 -4.413,9.805 -9.806,9.805 H 92.202 c 1.457,-2.919 2.278,-6.212 2.278,-9.696 0,-3.571 -0.861,-6.941 -2.387,-9.913 h 20.97 c 5.394,0 9.806,4.412 9.806,9.804 z m -69.597,9.805 H 9.816 c -5.393,0 -9.805,-4.412 -9.805,-9.805 v 0 c 0,-5.393 4.412,-9.805 9.805,-9.805 h 43.565 c -1.525,2.972 -2.387,6.342 -2.387,9.913 0,3.485 0.821,6.778 2.278,9.697 z M 28.326,58.717 c 0,9.149 7.418,16.567 16.568,16.567 9.149,0 16.567,-7.418 16.567,-16.567 0,-9.15 -7.418,-16.568 -16.567,-16.568 -9.15,-10e-4 -16.568,7.417 -16.568,16.568 z M 0,58.608 v 0 c 0,5.393 4.414,9.805 9.805,9.805 H 25.48 c -1.457,-2.92 -2.278,-6.169 -2.278,-9.696 0,-3.528 0.861,-6.941 2.387,-9.914 H 9.805 C 4.412,48.803 0,53.215 0,58.608 Z m 64.409,9.805 h 48.666 c 5.392,0 9.805,-4.412 9.805,-9.805 v 0 c 0,-5.394 -4.412,-9.806 -9.805,-9.806 H 64.301 c 1.525,2.973 2.387,6.386 2.387,9.914 0,3.528 -0.822,6.777 -2.279,9.697 z M 89.306,16.567 c 0,9.15 -7.418,16.567 -16.568,16.567 -9.15,0 -16.568,-7.416 -16.568,-16.567 C 56.17,7.417 63.587,0 72.737,0 81.887,0 89.306,7.417 89.306,16.567 Z M 53.272,26.264 H 9.853 c -5.393,0 -9.805,-4.413 -9.805,-9.805 v 0 c 0,-5.393 4.412,-9.805 9.805,-9.805 h 43.528 c -1.525,2.972 -2.387,6.342 -2.387,9.913 0,3.485 0.821,6.778 2.278,9.697 z"
                    id="path1"
                />
            </g>
        </svg>
    );
};


/**
 * Simple search start page manages the display between the first page with the logos
 * and the search result / title page
 */
function Search(): JSX.Element {

    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();

    const { show_menu, show_kb_menu, show_query_builder } = useSelector((state: RootState) => state.authReducer);
    const { search_focus, busy, all_kbs, has_info, language_code } = useSelector((state: RootState) => state.searchReducer);
    const { shard_list, search_text, sort_order, metadata_list, metadata_values } = useSelector((state: RootState) => state.searchReducer);
    const { entity_values, hash_tag_list, syn_set_values } = useSelector((state: RootState) => state.searchReducer);
    const { source_list, source_values, result_list, prev_search_text, prev_filter,
        pages_loaded, use_ai, ai_enabled, title, path, author,
        query_ai_focus_url, search_page, page_size, theme } = useSelector((state: RootState) => state.searchReducer);
    const { session, organisation, user } = useSelector((state: RootState) => state.authReducer);

    const show_kb = window.ENV.allow_knowledge_base_selector && all_kbs && all_kbs.length > 1;
    const document_filter = theme === "light" ? "result-document-filter" : "result-document-filter-dark";

    // set up a global document-listener just for keydown ESC here
    useEffect(() => {
        // close the preview if we caught the keydown event for the escape key
        function check_for_escape_key_to_close_modal(event: KeyboardEvent): void {
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
    }, [dispatch]);

    useEffect(() => {
        if (!has_info)
            dispatch(get_info({session: session, user: user}));
    }, [session, user, dispatch, has_info]);

    useEffect(() => {
        // update control state from the query string where possible
        let data = setup_query_parameter_state(source_list);
        if (data) {
            if (data.search_text)
                dispatch(update_search_text(data.search_text));
            if (data.source_values)
                dispatch(set_source_values(data.source_values));

            // and perform a search using this data if we need to
            data = { ...data, source_list: source_list };
            if (source_list.length > 0 && session?.id)
                search({ data, next_page: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source_list, session?.id, dispatch]); // the dependency on source_list is a convenient one as it relates to get_info finishing

    useEffect(() => {
        if (session && session.id) {
            dispatch(get_search_favourites({session: session}));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.id, dispatch]);

    function toggle_accounts_menu(e?: React.MouseEvent): void {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        dispatch(toggle_menu());
    }

    function toggle_knowledgebase_menu(e?: React.MouseEvent): void {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        dispatch(toggle_kb_menu());
    }

    function on_go_home(e: React.MouseEvent): void {
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

    function on_set_sort_by(sort_order: number): void {
        dispatch(set_sort_order(sort_order));
        search({ sort_order: sort_order, next_page: false, reset_pagination: true });
    }

    function on_toggle_query_builder(): void {
        dispatch(toggle_query_builder())
    }

    // perform search
    function search(values?: any): void {
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
            author: author,
            path: path,
            title: title,
            language_code: language_code
        };
        if (session && session.id && !busy) {
            if (values) {
                dispatch(do_search({ ...data, ...values }));
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
        if (show_kb_menu) {
            dispatch(close_kb_menu());
        }
    }

    const show_preview = (search_focus !== null && window.ENV.show_previews);
    const show_ai = ai_enabled && query_ai_focus_url && query_ai_focus_url.length > 0;

    return (
        <div className="Search" data-bs-theme={theme === "light" ? "light" : "dark"}>

            <ErrorDialog />
            {/* metadata error display */}
            <ErrorMessage />

            <div className={(busy && !show_preview) ? "wait-cursor outer" : "outer"}>

                {/* this is the top bar */}
                <div className={(theme === "light" ? "title-bar" : "title-bar-dark") + " mx-0 px-0 navbar row"}>

                    <div className="justify-content-start row">
                        {/* enterprise logo */}
                        <div className="col-1 ps-4 pe-0 h-100 d-flex justify-content-end">
                            <div className="large-screen">
                                <div className="d-flex align-items-center logo-size" onClick={() => window.location.href = "/"}>
                                    <img src={get_enterprise_logo(theme)} alt="" className="w-100 my-2 enterprise-logo"
                                         onClick={(event) => on_go_home(event)}/>
                                </div>
                            </div>
                        </div>

                        {/* search box */}
                        <div className={width && width > min_width ? "col-8" : "col-11"}>
                            <SearchBox
                                on_search={() => search({ next_page: false })}
                                on_search_text={(text) => search({ next_page: false, search_text: text })}
                            />
                        </div>

                        {/* large and small screen name and menus */}
                        <div className={width && width > min_width ? "col-3" : "visually-hidden"}>
                            {!show_preview &&
                                <div>
                                    {/* only displayed on larger screens */}
                                    <div className="large-screen">
                                        <div className="row" style={{cursor: "default"}}>
                                            <div className="col-5 justify-content-end">
                                                <p className="org-name mb-0 small" title={organisation && organisation.name ? organisation.name : ""}>{organisation && organisation.name ? organisation.name : ""}</p>
                                                <p className="user-name mb-0" title={get_full_username(user)}>{get_full_username(user)}</p>
                                            </div>
                                            <div className="col-2 px-1 mx-1" title="settings menu">
                                                <button className={(show_menu ? "active" : "") + " btn nav-btn"}
                                                        onClick={(e) => toggle_accounts_menu(e)}>
                                                    <img src={(theme === "light" ? icon_account_light : icon_account_dark)}
                                                         alt=""
                                                         className={show_menu ? "d-none" : ""}/>
                                                    <img src={icon_account_active}
                                                         alt=""
                                                         className={!show_menu ? "d-none" : ""}/>
                                                </button>
                                                <AccountDropdown on_search={() => search(null)}/>
                                            </div>
                                            <div className="col-2 px-1 mx-1" title="query builder">
                                                <button className={( show_query_builder ? "active" : "") + " btn nav-btn"}
                                                        onClick={() => on_toggle_query_builder()}>
                                                    <ControlPanelIcon className={theme === "light" ? "svgColorLight" : "svgColorDark"} />
                                                </button>
                                            </div>
                                            <div className="col-2 px-1 mx-1">
                                                {show_kb &&
                                                    <div className="kb-menu">
                                                        <div className="account" title="knowledge base">
                                                            <button className={(show_kb_menu ? "active" : "") + " btn nav-btn"}
                                                                    onClick={(e) => toggle_knowledgebase_menu(e)}>
                                                                <img
                                                                    src={(theme === "light" ? icon_database : icon_database_dark)}
                                                                    alt=""
                                                                    className={show_kb_menu ? "d-none" : ""}/>
                                                                <img
                                                                    src={icon_database_active}
                                                                    alt=""
                                                                    className={!show_kb_menu ? "d-none" : ""}/>
                                                            </button>
                                                        </div>
                                                        <KnowledgebaseDropdown />
                                                    </div>
                                                }
                                            </div>
                                            <div className="col-1">
                                            </div>
                                        </div>
                                    </div>

                                    {/* only displayed on smaller screens */}
                                    <div className="small-screen">
                                        <div className="row">
                                            <div className="col-2 px-1 mx-2" title="settings menu">
                                                <button className={(show_menu ? "active" : "") + " btn nav-btn"}
                                                        onClick={(e) => toggle_accounts_menu(e)}>
                                                    <img src={icon_account_light} alt=""
                                                         className={show_menu ? "d-none" : ""}/>
                                                    <img src={icon_account_active}
                                                         alt=""
                                                         className={!show_menu ? "d-none" : ""}/>
                                                </button>
                                                <AccountDropdown />
                                            </div>
                                            <div className="col-2 px-1 mx-2">
                                                {show_kb &&
                                                    <div className="kb-menu">
                                                        <div className="account" title="Select Data Source">
                                                            <button className={(show_kb_menu ? "active" : "") + " btn nav-btn"}
                                                                    onClick={(e) => toggle_knowledgebase_menu(e)}>
                                                                <img
                                                                    src={(theme === "light" ? icon_database : icon_database_dark)}
                                                                    alt=""
                                                                    className={show_kb_menu ? "d-none" : ""}/>
                                                                <img
                                                                    src={icon_database_active}
                                                                    alt=""
                                                                    className={!show_kb_menu ? "d-none" : ""}/>
                                                            </button>
                                                        </div>
                                                        <KnowledgebaseDropdown />
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

                    {/* NEWEST FIRST AND GROUP SIMILAR */}
                    <div className="row justify-content-start">
                        <div className="col-1">
                        </div>
                        <div className="mt-1 col-4">
                            <div className={document_filter + " d-flex align-content-center"}>
                                <label className="list-group-item p-0 overflow-hidden d-flex" style={{minWidth: "200px"}}>
                                    <span className={"sort-by-label"}>{t("Sort by")}</span>
                                    <select
                                        id="flexSortBy"
                                        className={theme === "light" ? "sort-select" : "sort-select-dark"}
                                        onChange={(event) => on_set_sort_by(parseInt(event.target.value))}
                                        defaultValue={"" + sort_order}>
                                        <option key={"pso_0"} value="0">relevance</option>
                                        <option key={"pso_1"} value="1">newest first</option>
                                        <option key={"pso_2"} value="2">oldest first</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                        <div className="col-7">
                        </div>
                    </div>
                </div>

                {show_ai &&
                    <div className="ai-float">
                        <AIDialog/>
                    </div>
                }

                {/* search results and side widgets */}
                <div className={(theme === "light" ? "" : "bg-dark") + " inner overflow-hidden"} onClick={() => on_close_menu()}>
                    <SearchResults on_search={(values: any) => search(values)}/>
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