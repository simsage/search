import {
    BUSY,
    CLOSE_ERROR,
    ERROR,
    SIGN_IN,
    SIGN_OUT,

    SET_USER_DASHBOARD,
    SELECT_ROOT,
    SELECT_SOURCE,
    UPDATE_SOURCE,
    SELECT_FILE,
    SET_COMMENTS,
    HIDE_SEARCH_RESULTS,

    SET_FILE_HASH_TAGS,
    SET_SUBSCRIPTIONS,
    SET_CHECKOUTS,

    CLEAR_CATEGORY_FILTER,
    SET_CATEGORY_FILTER,
    SET_GROUP_SIMILAR,
    SET_SYNSET,
    SET_TAG_LIST,
    LOAD_NOTIFICATIONS,

    SHOW_FILE_UPLOADER,
    SELECT_FOLDER,
    SHOW_MENU,
    CLOSE_MENUS,

    SHOW_LOCKS,
    SHOW_SUBSCRIPTIONS, CHANGE_VIEW,

} from "./actions";

import {Comms} from "../common/comms";
import {add_filter_to_search_text, do_search, select_folder} from "./action_utils";


// application creators / actions
export const appCreators = {

    // do a sign in
    signIn: (email, password) => async (dispatch, getState) => {
        if (email && email.length > 0 && password && password.length > 0) {
            dispatch({type: BUSY, busy: true});
            await Comms.http_post('/auth/sign-in', null, {"email": email, "password": password},
                (response) => {
                    const roles = response.data.user.roles;
                    let has_access = false;
                    for (const role of roles) {
                        if (role.organisationId === window.ENV.organisation_id && role.role === 'dms') {
                            has_access = true;
                            break;
                        }
                    }
                    if (has_access) {
                        dispatch({type: SIGN_IN, session: response.data.session, user: response.data.user});
                        window.location = '/#/dms';
                    } else {
                        dispatch({
                            type: ERROR,
                            title: "Error",
                            error: "account \"" + email + "\" does not have access to this organisation."
                        });
                    }
                },
                (errStr) => {
                    dispatch({type: ERROR, title: "Error", error: errStr})
                }
            )
        } else {
            dispatch({type: ERROR, title: "Error", error: 'please complete and check all fields'});
        }
    },

    signOut: (callback) => async (dispatch, getState) => {
        dispatch({type: BUSY, busy: true});
        const session = getState().appReducer.session;
        if (session === null) {
            if (callback)
                callback();
        } else {
            const session_id = session.id;
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

    getUserDashboard: () => async (dispatch, getState) => {
        dispatch({type: BUSY, busy: true});
        const session_id = getState().appReducer.session.id;
        await Comms.http_get('/dms/dashboard/' + encodeURIComponent(window.ENV.organisation_id) + '/' + encodeURIComponent(window.ENV.kb_id),
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
    selectFile: (url, urlId) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (url && urlId > 0) {
            dispatch({type: BUSY, busy: true});
            const session_id = getState().appReducer.session.id;
            await Comms.http_get('/dms/document/' + encodeURIComponent(window.ENV.organisation_id) + '/' +
                encodeURIComponent(window.ENV.kb_id) + '/' + encodeURIComponent(urlId), session_id,
                (result) => {
                    result.data.urlId = urlId; // set as well
                    dispatch({type: SELECT_FILE, file: result.data});
                },
                (error) => {
                    dispatch({type: ERROR, title: "Error", error: error})
                }
            );
        } else if (url === null) {
            dispatch({type: SELECT_FILE, file: null});
        }
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

    // select / open a folder inside a source
    selectFolder: (folder, force_get = false) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        const folder_tracker = getState().appReducer.folder_tracker;
        const session_id = getState().appReducer.session.id;
        await select_folder(folder, folder_tracker, force_get, session_id, dispatch);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // version management

    // download a specific version of a file
    downloadFileVersion: (file, version) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (file && file.url && version && version.version > 0) {
            const session_id = getState().appReducer.session.id;
            Comms.download_document_version(session_id, file.url, version.version);
        } else {
            dispatch({
                type: ERROR,
                title: "Error",
                error: "downloadFileVersion: binary document-version cannot be downloaded, invalid url or version"
            });
        }
    },

    // download the latest version of a file
    downloadFile: (file) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (file && file.url) {
            const session_id = getState().appReducer.session.id;
            Comms.download_document(session_id, file.url);
        } else {
            dispatch({
                type: ERROR,
                title: "Error",
                error: "downloadFile: binary document cannot be downloaded, invalid url"
            });
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // comment management

    // remove an existing comment
    removeComment: (file, comment_id) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (comment_id && file.url
        ) {
            dispatch({type: BUSY, busy: true});

            const session_id = getState().appReducer.session.id;
            await Comms.http_delete('/dms/note/' + encodeURIComponent(window.ENV.organisation_id) + '/' +
                encodeURIComponent(window.ENV.kb_id) + '/' + btoa(unescape(encodeURIComponent(file.url))) +
                '/' + encodeURIComponent(comment_id),
                session_id,
                (result) => {
                    dispatch({type: SET_COMMENTS, commentList: result.data});
                },
                (error) => {
                    dispatch({type: ERROR, title: "Error", error: error})
                }
            );
        } // end of else
    },

    // add a new comment (saveNote organisation_id, kb_id, url, id, text)
    addComment: (file, text) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (file && file.url && text && text.trim().length > 0) {
            const data = {
                organisationId: window.ENV.organisation_id,
                kbId: window.ENV.kb_id,
                url: file.url,
                noteId: 0,
                noteText: text
            }
            dispatch({type: BUSY, busy: true});
            const session_id = getState().appReducer.session.id;

            await Comms.http_post('/dms/note', session_id, data,
                (result) => {
                    dispatch({type: SET_COMMENTS, commentList: result.data});
                },
                (error) => {
                    dispatch({type: ERROR, title: "Error", error: error})
                }
            );
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // hash-tag management

    // update all hash-tags in one go
    updateHashTags: (file, tag_list) => async (dispatch, getState) => {
        if (file && file.url) {
            dispatch({type: BUSY, busy: true});
            const session_id = getState().appReducer.session.id;
            const data = {
                organisationId: window.ENV.organisation_id,
                kbId: window.ENV.kb_id,
                url: file.url,
                hashTagList: tag_list,
            }
            await Comms.http_post('/dms/hash-tag', session_id, data,
                (result) => {
                    let str = "";
                    for (const item of result.data) {
                        if (str !== "")
                            str += ",";
                        str += item;
                    }
                    dispatch({type: SET_FILE_HASH_TAGS, hash_tag_csv_str: str});
                },
                (error) => {
                    dispatch({type: ERROR, title: "Error", error: error})
                });
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // searching

    search: (search_text) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (search_text) {
            const ar = getState().appReducer;
            if (ar) {
                const shard_list = (ar.search_result && ar.search_result.shard_list) ? ar.search_result.shard_list : [];
                const session_id = ar.session.id;
                const user_id = ar.user.id;
                const hash_tag_list = ar.hash_tag_list;
                const text = add_filter_to_search_text(search_text, ar.category_list, ar.category_values, ar.syn_sets, hash_tag_list);
                await do_search(text, search_text, 0, shard_list, session_id, user_id, ar.group_similar, dispatch);
            }
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

    // select/un-select a synset
    selectSynSet: (name, index) => async (dispatch, getState) => {
        dispatch({type: SET_SYNSET, name: name, index: index});
    },

    setHashTagList: (hash_tag_list) => async (dispatch, getState) => {
        dispatch({type: SET_TAG_LIST, hash_tag_list: hash_tag_list});
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // subscriptions

    // subscribe to a file (file)
    addSubscription: (file) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (!file || !file.sourceId) {
            dispatch({type: ERROR, title: "Error", error: "addSubscription: invalid parameter(s)"})
        } else {
            dispatch({type: BUSY, busy: true});
            const session_id = getState().appReducer.session.id;

            const data = {
                organisationId: window.ENV.organisation_id,
                kbId: window.ENV.kb_id,
                userId: getState().appReducer.user.id,
                sourceId: file.sourceId,
                url: file.url,
                isFolder: file.isFolder
            };

            await Comms.http_post('/dms/subscription', session_id, data,
                (result) => {
                    dispatch({type: SET_SUBSCRIPTIONS, subscriptionList: result.data});
                },
                (error) => {
                    dispatch({type: ERROR, title: "Error", error: error})
                }
            );
        } // end of else


    },

    // unsubscribe from a file (file)
    removeSubscription: (file) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (!file) {
            dispatch({type: ERROR, title: "Error", error: "removeBookmark: invalid parameter(s)"})
        } else {
            dispatch({type: BUSY, busy: true});

            const session_id = getState().appReducer.session.id;
            const user_id = getState().appReducer.user.id;
            await Comms.http_delete('/dms/subscription/' + encodeURIComponent(window.ENV.organisation_id) + '/' +
                encodeURIComponent(window.ENV.kb_id) + '/' + encodeURIComponent(user_id) + '/' + btoa(unescape(encodeURIComponent(file.url))),
                session_id,
                (result) => {
                    dispatch({type: SET_SUBSCRIPTIONS, subscriptionList: result.data});
                },
                (error) => {
                    dispatch({type: ERROR, title: "Error", error: error})
                }
            );
        } // end of else
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

    // delete a document or folder by url
    deleteFileOrFolder: (item) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (!item || !item.url || !item.sourceId) {
            dispatch({type: ERROR, title: "Error", error: "onDelete: invalid parameter(s)"})
        } else {
            dispatch({type: BUSY, busy: true});
            const session_id = getState().appReducer.session.id;
            const is_folder = item.isFolder === true;
            const source_id = item.sourceId;
            await Comms.http_delete('/dms/document/delete/' + encodeURIComponent(window.ENV.organisation_id) + '/' +
                encodeURIComponent(window.ENV.kb_id) + '/' + is_folder + '/' + source_id + '/' + btoa(unescape(encodeURIComponent(item.url))),
                session_id,
                async (response) => {
                    dispatch({type: SELECT_FOLDER, folder: response.data});
                },
                (error) => {
                    dispatch({type: ERROR, title: "Error", error: error})
                }
            );

        } // end of else
    },

    // lock a file

    onLock: (file) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (!file) {
            dispatch({type: ERROR, title: "Error", error: "checkoutDocument: invalid parameter(s)"})
        } else {
            dispatch({type: BUSY, busy: true});
            const session_id = getState().appReducer.session.id;

            const data = {
                organisationId: window.ENV.organisation_id,
                kbId: window.ENV.kb_id,
                userId: getState().appReducer.user.id,
                url: file.url,
            };

            await Comms.http_post('/dms/checkout', session_id, data,
                (result) => {
                    dispatch({type: SET_CHECKOUTS, checkoutList: result.data});
                },
                (error) => {
                    dispatch({type: ERROR, title: "Error", error: error})
                }
            );
        } // end of else
    },


    // unlock a file

    onUnlock: (file) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        if (!file) {
            dispatch({type: ERROR, title: "Error", error: "releaseCheckout: invalid parameter(s)"})
        } else {
            dispatch({type: BUSY, busy: true});

            const session_id = getState().appReducer.session.id;
            const user_id = getState().appReducer.user.id;
            await Comms.http_delete('/dms/checkout/' + encodeURIComponent(window.ENV.organisation_id) + '/' +
                encodeURIComponent(window.ENV.kb_id) + '/' + encodeURIComponent(user_id) + '/' + btoa(unescape(encodeURIComponent(file.url))),
                session_id,
                (result) => {
                    dispatch({type: SET_CHECKOUTS, checkoutList: result.data});
                },
                (error) => {
                    dispatch({type: ERROR, title: "Error", error: error})
                }
            );
        } // end of else
    },

    onFileUpload: (show) => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        dispatch({type: SHOW_FILE_UPLOADER, visible: show})
    },

    // add a new folder to a parent folder
    addFolder: (parent_item, folder_name) => async (dispatch, getState) => {
        let parent_url = null;
        let source_id = null;
        let is_source = false;
        if (parent_item && parent_item.folder) {
            parent_url = parent_item.folder.url;
            source_id = parent_item.folder.sourceId;
        } else if (parent_item && parent_item.source) {
            parent_url = parent_item.source.url;
            source_id = parent_item.source.sourceId;
            is_source = true;
        }
        dispatch({type: CLOSE_MENUS});
        if (!parent_url || !source_id || parent_url.length === 0 || !folder_name || folder_name.trim().length === 0) {
            dispatch({type: ERROR, title: "Error", error: "addFolder: invalid parameter(s)"})
        } else {
            dispatch({type: BUSY, busy: true});
            const session_id = getState().appReducer.session.id;
            await Comms.http_post('/dms/folder',
                session_id,
                {
                    organisationId: window.ENV.organisation_id,
                    kbId: window.ENV.kb_id,
                    sourceId: source_id,
                    parentUrl: parent_url,
                    folderName: folder_name
                },
                (response) => {
                    const data = response.data;
                    // is this a "set source" or a "set folder"?
                    if (data && is_source) {
                        dispatch({type: UPDATE_SOURCE, source: data});
                    } else if (data) {
                        dispatch({type: SELECT_FOLDER, folder: data});
                    }
                },
                (error) => {
                    dispatch({type: ERROR, title: "Error", error: error})
                }
            );

        } // end of else
    },

    updateFolder: (folder) => async (dispatch, getState) => {
        if (folder) {
            dispatch({type: SELECT_FOLDER, folder: folder});
        }
    },

    onLoadNotifications: () => async (dispatch, getState) => {
        const session_id = getState().appReducer.session.id;
        const a = new Date();
        const year = a.getFullYear();
        const month = a.getMonth() + 1;
        dispatch({type: CLOSE_MENUS});

        await Comms.http_get('/dms/notifications/' + encodeURIComponent(window.ENV.organisation_id) + '/' + encodeURIComponent(window.ENV.kb_id) + '/' + year + '/' + month,
            session_id,
            (response) => {
                dispatch({type: LOAD_NOTIFICATIONS, activity_list: response.data});
            },
            (errStr) => {
                dispatch({type: ERROR, title: "Error", error: errStr})
            }
        )
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

    // show the subscriptions screen
    showSubscriptions: () => async (dispatch, getState) => {
        dispatch({type: CLOSE_MENUS});
        dispatch({type: BUSY, busy: true});

        const session_id = getState().appReducer.session.id;
        const userId = getState().appReducer.user.id;
        const organisationId = window.ENV.organisation_id;
        const kbId = window.ENV.kb_id;

        await Comms.http_get('/dms/subscriptions/' + encodeURIComponent(organisationId) + '/' + encodeURIComponent(kbId) + '/' + encodeURIComponent(userId),
            session_id,
            (response) => {
                dispatch({type: SHOW_SUBSCRIPTIONS, subscriptionList: response.data});
            },
            (errStr) => {
                dispatch({type: ERROR, title: "Error", error: errStr})
            }
        )

    },

    // change views from grid to list or vice versa
    changeView: () => async (dispatch, getState) => {
        dispatch({type: CHANGE_VIEW});
    },


};

