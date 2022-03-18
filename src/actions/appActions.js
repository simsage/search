import {
    BUSY,
    CLOSE_ERROR,
    ERROR,
    SET_USER_DASHBOARD,
    SIGN_IN,
    SIGN_OUT,

    SELECT_ROOT,
    SELECT_SOURCE,
    HIDE_SEARCH_RESULTS,

    CLEAR_CATEGORY_FILTER,
    SET_CATEGORY_FILTER,
    SET_GROUP_SIMILAR,
    SET_NEWEST_FIRST,
    SET_SYNSET,
    SET_TAG_LIST,

    SHOW_MENU,
    CLOSE_MENUS,

    SHOW_LOCKS,
    CHANGE_VIEW,
    UPDATE_SEARCH_TEXT,

    SET_SAVED_SEARCHES,
    SET_SEARCH_FOCUS,

    HTML_PREVIEW,

} from "./actions";

import {Comms} from "../common/comms";
import {add_filter_to_search_text, do_search} from "./action_utils";
import Api from "../common/api";


// application creators / actions
export const appCreators = {

    signIn: (jwt, on_success, on_fail) => async (dispatch) => {
        await Comms.http_get_jwt('/auth/search/authenticate/msal', jwt,
            (response) => {
                dispatch({type: SIGN_IN, data: response.data})
                if (on_success)
                    on_success(response.data);
            },
            (errStr) => {
                console.error(errStr);
                dispatch({type: ERROR, title: "Error", error: errStr})
                if (on_fail) {
                    on_fail();
                }
            }, jwt
        )
    },

    signOut: (callback) => async (dispatch, getState) => {
        const session = getState().appReducer.session;
        if (session === null) {
            if (callback)
                callback();
        } else {
            const session_id = Api.getSessionId(session);
            if (session_id !== "") {
                dispatch({type: BUSY, busy: true});
                await Comms.http_delete('/auth/sign-out', session_id,
                    (response) => {
                        dispatch({type: SIGN_OUT});
                        if (callback)
                            callback();
                    },
                    (errStr) => {
                        dispatch({type: ERROR, title: "Error", error: errStr})
                    }
                )
            } else {
                dispatch({type: SIGN_OUT});
                if (callback)
                    callback();
            }
        }
    },

    // submit a password reset request
    resetPasswordRequest: (email, success, fail) => async (dispatch, getState) => {
        if (email && email.length > 0) {
            dispatch({type: BUSY, busy: true});
            await Comms.http_post('/auth/reset-password-request', null, {"email": email},
                (response) => {
                    dispatch({type: BUSY, busy: false});
                    if (success) {
                        success(response.data.session, response.data.user);
                    }
                },
                (errStr) => {
                    dispatch({type: BUSY, busy: false});
                    if (fail) {
                        fail(errStr);
                    }
                }
            )
        } else {
            dispatch({type: ERROR, title: "Error", error: 'please complete and check all fields'});
        }
    },

    notBusy: () => async (dispatch, getState) => {
        dispatch({type: BUSY, busy: false});
    },

    setError: (title, error) => ({type: ERROR, title, error}),

    closeError: () => ({type: CLOSE_ERROR}),

    //////////////////////////////////////////////////////////////////////////////////////////////////
    // user dashboard

    // get initial search data
    getSearchInfo: () => async (dispatch, getState) => {
        dispatch({type: BUSY, busy: true});
        const ar = getState().appReducer;
        const session_id = "";
        const user_id = Api.getUserId(ar.user);
        await Comms.http_get('/knowledgebase/search/info/' + encodeURIComponent(window.ENV.organisation_id) + '/' + encodeURIComponent(user_id),
            session_id,
            (response) => {
                dispatch({type: SET_USER_DASHBOARD, dashboard: response.data});
            },
            (errStr) => {
                dispatch({type: ERROR, title: "Error", error: errStr})
            }
        )
    },

    // select the top level source
    selectRoot: () => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        dispatch({type: SELECT_ROOT});
    },

    // select / open a source
    selectSource: (source_id) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (source_id) {
            dispatch({type: SELECT_SOURCE, source_id: source_id});
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // version management

    // download the latest version of a file
    downloadFile: (file) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (file && file.url) {
            const session_id = Api.getSessionId(getState().appReducer.session);
            if (session_id !== "") {
                Comms.download_document(session_id, file.url);
            } else {
                dispatch({
                    type: ERROR,
                    title: "Error",
                    error: "downloadFile: not signed-in"
                });
            }
        } else {
            dispatch({
                type: ERROR,
                title: "Error",
                error: "downloadFile: binary document cannot be downloaded, invalid url"
            });
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // searching

    search: (search_text, page) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (search_text) {
            const ar = getState().appReducer;
            if (ar) {
                if (!page)
                    page = ar.search_page;
                const shard_list = (ar.search_result && ar.search_result.shard_list) ? ar.search_result.shard_list : [];
                const session_id = Api.getSessionId(ar.session);
                const user_id = Api.getUserId(ar.user);
                const hash_tag_list = ar.hash_tag_list;
                const text = add_filter_to_search_text(search_text, ar.category_list, ar.category_values, ar.syn_sets, hash_tag_list);
                if (text !== ar.search_text) {
                    page = 0;
                }
                await do_search(text, search_text, page, shard_list, session_id, user_id, ar.group_similar, ar.newest_first, dispatch);
            }
        }
    },

    updateSearchText: (user_search_text) => async (dispatch, getState) => {
        dispatch({type: UPDATE_SEARCH_TEXT, user_search_text: user_search_text});
    },

    removeSavedSearch: (saved_search) => async (dispatch, getState) => {
        dispatch({type: BUSY, busy: true});

        const session_id = Api.getSessionId(getState().appReducer.session);
        if (session_id !== "") {
            const user_id = Api.getUserId(getState().appReducer.user);
            await Comms.http_delete('/search/saved-search/' + encodeURIComponent(window.ENV.organisation_id) + '/' +
                encodeURIComponent(window.ENV.kb_id) + '/' + encodeURIComponent(user_id) + '/' +
                btoa(unescape(encodeURIComponent(saved_search))) + '/' + window.ENV.saved_search_size,
                session_id,
                (result) => {
                    dispatch({type: SET_SAVED_SEARCHES, save_search_list: result.data});
                },
                (error) => {
                    dispatch({type: ERROR, title: "Error", error: error})
                }
            );
        } else {
            dispatch({type: ERROR, title: "Error", error: "not signed-in"})
        }
    },

    hideSearchResults: (search_text) => async (dispatch, getState) => {
        dispatch({type: HIDE_SEARCH_RESULTS});
    },

    clearCategories: (search_text) => async (dispatch, getState) => {
        dispatch({type: CLEAR_CATEGORY_FILTER});
    },

    // search UI sets category item (metadata searches), value can be an array for date-range
    setCategoryValue: (metadata, value) => async (dispatch, getState) => {
        if (metadata) {
            if (metadata === 'created' || metadata === 'last-modified') {
                if (value.length === 2) {
                    const lhs = value[0];
                    const rhs = value[1];
                    dispatch({
                        type: SET_CATEGORY_FILTER, metadata: metadata,
                        value: null, minValue: lhs, maxValue: rhs
                    });
                }
            } else {
                dispatch({
                    type: SET_CATEGORY_FILTER, metadata: metadata,
                    value: value, minValue: 0, maxValue: 0
                });
            }
        }
    },

    // group similar documents yes/no
    setGroupSimilar: (group_similar) => async (dispatch, getState) => {
        dispatch({type: SET_GROUP_SIMILAR, group_similar: group_similar});
    },

    // show newest documents first
    setNewestFirst: (newest_first) => async (dispatch, getState) => {
        dispatch({type: SET_NEWEST_FIRST, newest_first: newest_first});
    },

    // select/un-select a synset
    selectSynSet: (name, index) => async (dispatch, getState) => {
        dispatch({type: SET_SYNSET, name: name, index: index});
    },

    setHashTagList: (hash_tag_list) => async (dispatch, getState) => {
        dispatch({type: SET_TAG_LIST, hash_tag_list: hash_tag_list});
    },

    // rename a file or folder
    onRename: (item) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (item && item.isFolder) {
            alert("onRename(folder:" + item.url + "):: todo");
        } else if (item) {
            alert("onRename(file:" + item.url + "):: todo");
        }
    },

    // show a menu on an item (and close the others)
    onShowMenu: (item) => async (dispatch, getState) => {
        dispatch({type: SHOW_MENU, item: item});
    },

    // close all menus
    onCloseMenus: () => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
    },

    // show the locks screen
    showLocks: () => async (dispatch, getState) => {
        dispatch({type: SHOW_LOCKS});
    },

    // change views from grid to list or vice versa
    changeView: () => async (dispatch, getState) => {
        dispatch({type: CHANGE_VIEW});
    },

    // click on an item and set focus
    onFocus: (item) => async (dispatch, getState) => {
        dispatch({type: SET_SEARCH_FOCUS, search_focus: item})
    },

    get_html_preview: (item, page, onSuccess) => async (dispatch, getState) => {
        if (item && item.urlId && page > 0) {
            dispatch({type: BUSY, busy: true});
            const ar = getState().appReducer;
            const user_id = Api.getUserId(ar.user);
            const session_id = ar.session && ar.session.id ? ar.session.id : user_id;
            const preview_list = ar.preview_page_list;
            if (page > preview_list.length) {
                const data = {
                    "organisationId": window.ENV.organisation_id,
                    "kbId": window.ENV.kb_id,
                    "urlId": item.urlId,
                    "page": page,
                }
                await Comms.http_post('/document/preview/html', session_id, data,
                    (response) => {
                        dispatch({type: HTML_PREVIEW, html_preview: response.data});
                        if (onSuccess)
                            onSuccess();
                    },
                    (errStr) => {
                        dispatch({type: ERROR, title: "Error", error: errStr})
                    }
                )
            }
        }
    },

};

