import {get_client_id, get_enterprise_logo} from "../common/Api";
import {useSelector, useDispatch} from "react-redux";
import {update_search_text, do_search} from "../reducers/searchSlice";
import {close_menu, showError, simsageSignIn} from "../reducers/authSlice";
import {useEffect} from "react";
import {useKeycloak} from "@react-keycloak/web";

let signing_in = false;

/**
 * the start page of the search system - the one with all the logos
 *
 */
export function StartSearchPage() {
    const { keycloak } = useKeycloak();
    const dispatch = useDispatch();
    const {
        search_text,
        search_page,
        pages_loaded,
        shard_list,
        group_similar,
        newest_first,
        category_list,
        category_values,
        entity_values,
        source_id_list,
        hash_tag_list,
        syn_sets,
        result_list,
        busy,
        prev_search_text,
        metadata_list,
        metadata_values,
        source_list,
        source_values,
        last_modified_slider,
        created_slider,
        use_ai
    } = useSelector((state) => state.searchReducer);
    const {session, user} = useSelector((state) => state.authReducer);

    function search_keydown(event) {
        if (event && event.key === "Enter") {
            action_search();
        }
    }

    function on_close_menu(e) {
        dispatch(close_menu());
    }

    function action_search() {
        dispatch(do_search({
            session: session,
            client_id: get_client_id(),
            user: user,
            search_text: search_text,
            shard_list: shard_list,
            group_similar: group_similar,
            newest_first: newest_first,
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
            use_ai: use_ai,
        }));
    }

    useEffect(() => {
        function sign_in(response) {
            if ((!session || !session.id) && !signing_in && response && response.idToken) {
                signing_in = true;
                dispatch(simsageSignIn({
                    id_token: response.idToken, on_success: (data) => {
                    }, on_fail: (error_message) => {
                        if (error_message.indexOf("code 500") > 0) {
                            dispatch(showError({
                                "message": "cannot sign-in: your account has insufficient privileges",
                                "title": "sign-in error"
                            }));
                        } else {
                            dispatch(showError({
                                "message": "cannot sign-in: " + error_message,
                                "title": "sign-in error"
                            }));
                        }
                    }
                }));
            }
        }

        if (keycloak && keycloak.authenticated) {
            sign_in(keycloak);
        }

    }, [session?.id, dispatch, keycloak, session])

    return (
        <div className={(busy ? "wait-cursor h-100 " : "h-100 ") + " d-flex justify-content-center align-items-center"}>
            <div className="d-flex flex-column justify-content-center align-items-center pb-5 mb-5">
                <img src={get_enterprise_logo()} alt="" className="mb-2" style={{"height": "100px"}}/>

                <div className="nav-search-container mb-5">
                    <div className="inner xl d-flex align-items-center position-relative">
                            <span className="nav-search-icon ms-2 d-flex align-items-center">
                                <img src={window.ENV.image_base_name + "/images/icon_n-search.svg"} alt="search" title="search"
                                     onClick={() => action_search()}/>
                            </span>
                        <input type="text" className="nav-search-input ps-1 pe-3" id="simsage-search-text"
                               onChange={(event) => {
                                   dispatch(update_search_text(event.target.value));
                               }}
                               onKeyDown={(event) => search_keydown(event)}
                               autoComplete={"off"}
                               onFocus={() => on_close_menu()}
                               autoFocus
                               value={search_text}
                               placeholder="Enterprise Search..."/>
                    </div>
                    <div className="text-end mt-1">
                        <small className="text-black-50 fst-italic fw-lighter">Powered
                            by <strong>SimSage</strong></small>
                    </div>
                </div>

                <div className="d-flex justify-content-center mb-5">
                    <img src={window.ENV.image_base_name + "/images/brand/logo_drive.svg"} alt="" title="Google Drive" className="mx-3"
                         style={{"width": "40px"}}/>
                    <img src={window.ENV.image_base_name + "/images/brand/logo_office.svg"} alt="" title="Office" className="mx-3"
                         style={{"width": "40px"}}/>
                    <img src={window.ENV.image_base_name + "/images/brand/logo_dropbox.svg"} alt="" title="Dropbox" className="mx-3"
                         style={{"width": "40px"}}/>
                    <img src={window.ENV.image_base_name + "/images/brand/logo_exchange.svg"} alt="" title="Exchange" className="mx-3"
                         style={{"width": "40px"}}/>
                    <img src={window.ENV.image_base_name + "/images/brand/logo_sharepoint.svg"} alt="" title="SharePoint" className="mx-3"
                         style={{"width": "40px"}}/>
                    <img src={window.ENV.image_base_name + "/images/brand/logo_wordpress.svg"} alt="" title="Wordpress" className="mx-3"
                         style={{"width": "40px"}}/>
                    <img src={window.ENV.image_base_name + "/images/brand/logo_onedrive.svg"} alt="" title="One-drive" className="mx-3"
                         style={{"width": "40px"}}/>
                    <img src={window.ENV.image_base_name + "/images/brand/logo_postgre.svg"} alt="" title="Postgres" className="mx-3"
                         style={{"width": "40px"}}/>
                    <img src={window.ENV.image_base_name + "/images/brand/logo_mysql.svg"} alt="" title="MySQL" className="mx-3"
                         style={{"width": "40px"}}/>
                </div>
            </div>
        </div>
    )

}

