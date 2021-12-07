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
    SELECT_FOLDER,
    SELECT_FILE,

    DO_SEARCH,
    HIDE_SEARCH_RESULTS,
    SET_COMMENTS,

    SET_FILE_HASH_TAGS,
    SET_SUBSCRIPTIONS,
    SET_CHECKOUTS,
    LOAD_NOTIFICATIONS,

    CLEAR_CATEGORY_FILTER,
    SET_CATEGORY_FILTER,
    SET_GROUP_SIMILAR,
    SET_SYNSET,
    SET_TAG_LIST,

    SHOW_FILE_UPLOADER,

    SHOW_MENU,
    CLOSE_MENUS,

    SHOW_LOCKS,
    SHOW_SUBSCRIPTIONS,

    CHANGE_VIEW,

} from "../actions/actions";
import {initializeState} from './stateLoader'
import {get_source_by_id, get_parent_folder, show_menus} from './reducer_utils'

export const reducer = (state, action) => {
    state = state || initializeState();

    // output what we've received
    if (window.ENV.debug) {
        console.debug("applicationReducer:" + action.type);
    }
    if (action.type === ERROR) {
        console.log("ERROR: (" + JSON.stringify(action) + ")");
    }

    switch (action.type) {

        default: {
            break;
        }


        // set an error
        case ERROR: {
            // is this an "invalid session id"
            if (action.error && action.error.indexOf && action.error.indexOf("invalid session id") >= 0) {
                // wipe session and user objects - this is now a logout event
                window.location = "/";
                return {
                    ...state,
                    session: null,
                    user: null,
                    error_title: action.title,
                    error: action.error,
                    busy: false,
                };
            } else {
                return {
                    ...state,
                    error_title: action.title,
                    error: action.error,
                    busy: false,
                }
            }
        }

        // close any error messages
        case CLOSE_ERROR: {
            return {
                ...state,
                error_title: "",
                error: "",
                busy: false,
            };
        }

        case BUSY: {
            return {
                ...state,
                busy: action.busy,
            };
        }

        // sign-in a user
        case SIGN_IN: {
            return {
                ...state,
                session: action.session,
                user: action.user,
                busy: false,
            };
        }

        // sign-out a user
        case SIGN_OUT: {
            return {
                ...state,
                session: null,
                user: null,
                busy: false,
            }
        }


        /**
         * get all of a user's details for the opening dashboard
         */
        case SET_USER_DASHBOARD: {
            // set up the navigation system on "get user dashboard" (which is the get root of the system call)
            let current_folder = state.current_folder;
            let dashboard_root = state.dashboard_root;
            let source_tracker = state.source_tracker;
            let folder_tracker = state.folder_tracker;

            // get the top level content, which is the set of sources for this user
            const dashboard = action.dashboard;
            const contentList = dashboard && dashboard.folderList ? dashboard.folderList : [];
            const subscriptionList = dashboard && dashboard.subscriptionList ? dashboard.subscriptionList : [];
            // wrap the sources as a content-item folder
            current_folder = {name: "sources", url: "sources", source_name: "sources", sourceId: 0, contentList: contentList};
            folder_tracker["sources"] = current_folder;
            // set up the sourceId => source-name
            const source_list = [];
            for (const source of contentList) {
                if (source.sourceId && source.name) {
                    source.show_menu = false;
                    source_tracker[source.sourceId] = source.name;
                    folder_tracker["" + source.sourceId] = source;

                    // todo: set numDocuments and lastCrawler on source
                    source.numDocuments = 0;
                    source_list.push(source);
                }
            }
            // fast subscription lookup hashmap
            //todo: remove fix value set on subscription_set
            // const subscription_set = {
            //     "1:https://simsage.ai/": true,
            //     "1:https://simsage.ai/home-copy2/about/": true,
            //     "1:https://simsage.ai/home-copy2/": true,
            //     "1:https://simsage.ai/home-copy2/contact/": true };
            const subscription_set = {}
            for (const subscription of subscriptionList) {
                const key = subscription.sourceId + ":" + subscription.url;
                subscription_set[key] = true;
            }
            if (!dashboard_root) {
                dashboard_root = current_folder;
            }
            return {
                ...state,

                // folder state
                current_folder: current_folder,
                dashboard_root: dashboard_root,
                source_tracker: source_tracker,
                folder_tracker: folder_tracker,
                source_list: source_list,

                // dashboard items / lists
                checkout_list: dashboard && dashboard.checkoutList ? dashboard.checkoutList : [],
                bookmark_list: dashboard && dashboard.bookmarkList ? dashboard.bookmarkList : [],
                subscription_list: subscriptionList,
                subscription_set: subscription_set,
                activity_list: dashboard && dashboard.notificationList ? dashboard.notificationList : [],
                save_search_list: dashboard && dashboard.savedSearchList ? dashboard.savedSearchList : [],
                category_list: dashboard && dashboard.categoryList ? dashboard.categoryList : [],

                error: "",
                busy: false,
            };
        }

        /**
         * the user selects a file for focus
         */
        case SELECT_FILE: {
            return {
                ...state,
                selected_file: action.file,
                show_search_results: false,
                show_subscribed: false,
                show_locks: false,
                error: "",
                busy: false,
            }
        }

        /**
         * user selects top level root of all sources
         */
        case SELECT_ROOT: {
            return {
                ...state,
                current_folder: null,
                selected_source: null,
                show_subscribed: false,
                show_locks: false,
                folder_list: [],
                file_list: [],
                selected_file: null,
                breadcrumb_list: [{"name": "Source"}],
                show_search_results: false,
                error: "",
                busy: false,
            };
        }

        /**
         * the user selects a source to be active
         */
        case SELECT_SOURCE: {
            let parent_folder_tracker = state.parent_folder_tracker;
            const source = get_source_by_id(action.source_id, state.source_list);
            if (source) {
                // get the folders and files for this source
                const folder_list = [];
                const file_list = [];
                for (const content_item of source.contentList) {
                    content_item.show_menu = false;
                    if (content_item.isFolder) {
                        folder_list.push(content_item);
                    } else {
                        file_list.push(content_item);
                    }
                }
                parent_folder_tracker["" + source.sourceId] = source;
                return {
                    ...state,
                    current_folder: source,
                    selected_source: source,
                    parent_folder_tracker: parent_folder_tracker,
                    folder_list: folder_list,
                    file_list: file_list,
                    selected_file: null,
                    show_subscribed: false,
                    show_locks: false,
                    breadcrumb_list: [{"name": "Source"}, {"name": source.name, "source": source}],
                    show_search_results: false,
                    error: "",
                    busy: false,
                };
            } else {
                return {
                    ...state,
                    error: "source with id " + action.source_id + " not found",
                    busy: false,
                };
            }
        }

        /**
         * the user has changed something in the root of a source
         */
        case UPDATE_SOURCE: {
            let parent_folder_tracker = state.parent_folder_tracker;
            const updated_source = action.source;
            if (updated_source && updated_source.sourceId) {
                const source = get_source_by_id(updated_source.sourceId, state.source_list);
                if (source) {
                    source.contentList = updated_source.contentList;
                    // get the folders and files for this source
                    const folder_list = [];
                    const file_list = [];
                    for (const content_item of updated_source.contentList) {
                        content_item.show_menu = false;
                        if (content_item.isFolder) {
                            folder_list.push(content_item);
                        } else {
                            file_list.push(content_item);
                        }
                    }
                    parent_folder_tracker["" + source.sourceId] = updated_source;
                    return {
                        ...state,
                        parent_folder_tracker: parent_folder_tracker,
                        folder_list: folder_list,
                        file_list: file_list,
                        error: "",
                        busy: false,
                    };
                } else {
                    return {
                        ...state,
                        error: "source with id " + updated_source.sourceId + " not found",
                        busy: false,
                    };
                }
            } else {
                return {
                    ...state,
                    error: "source not set",
                    busy: false,
                };
            }
        }

        /**
         * the user selects a folder to open
         */
        case SELECT_FOLDER: {
            const folder = action.folder;
            let source = get_source_by_id(folder.sourceId, state.source_list);
            if (source === null) source = {"name": "unknown source"};
            const parent_folder_tracker = state.parent_folder_tracker;
            let folder_tracker = state.folder_tracker;
            let current_folder = state.current_folder;
            // store the content
            folder_tracker[folder.sourceId + ":" + folder.url] = folder;
            if (current_folder && current_folder.url !== folder.url) {
                parent_folder_tracker[folder.url] = current_folder.url;
            }
            // get the folders and files inside this folder
            const folder_list = [];
            const file_list = [];
            for (const content_item of folder.contentList) {
                content_item.show_menu = false;
                if (content_item.isFolder) {
                    folder_list.push(content_item);
                } else {
                    file_list.push(content_item);
                }
            }
            // create a new breadcrumb starting at the top
            const breadcrumb_list = [{"name": "Source"}, {"name": source.name, "source": source}];
            let reverse_parents = [{"name": action.folder.name, "folder": folder}];
            // get all the folders that lead to this one for the breadcrumb
            let parent = get_parent_folder(folder, folder_tracker);
            while (parent !== null) {
                if (parent.name && parent.name !== '' && parent.name !== '/' && parent.url !== '/')
                    reverse_parents.push({"name": parent.name, "folder": parent})
                parent = get_parent_folder(parent, folder_tracker);
            }
            // they're in reverse order - so make that right
            reverse_parents.reverse();
            // and add them all to the breadcrumb
            for (const folder of reverse_parents) {
                breadcrumb_list.push(folder);
            }
            return {
                ...state,
                parent_folder_tracker: parent_folder_tracker,
                folder_tracker: folder_tracker,
                current_folder: folder,
                folder_list: folder_list,
                file_list: file_list,
                selected_file: null,
                selected_source: source,
                breadcrumb_list: breadcrumb_list,
                busy: false,
            };
        }


        case DO_SEARCH: {
            const data = action.data;
            const save_search_list = state.save_search_list;
            let exists = false;
            for (const item of save_search_list) {
                if (item.trim().toLowerCase() === data.original_text.trim().toLowerCase()) {
                    exists = true;
                    break;
                }
            }
            if (!exists) save_search_list.push(data.original_text.trim());
            return {
                ...state,
                search_result: data,
                search_text: data.search_text,
                search_page: data.page,
                show_search_results: true,
                show_subscribed: false,
                show_locks: false,
                save_search_list: save_search_list,
                busy: false,
            }
        }

        case HIDE_SEARCH_RESULTS: {
            return {
                ...state,
                show_search_results: false,
                busy: false,
            }
        }

        case SET_COMMENTS: {
            const selected_file = state.selected_file ? state.selected_file : {};
            return {
                ...state,
                selected_file: {
                    ...selected_file,
                    noteList: action.commentList,
                },
                busy: false,
            }
        }

        case SET_FILE_HASH_TAGS: {
            const selected_file = state.selected_file ? state.selected_file : {metadata: {}};
            selected_file["metadata"]["{hashtag}"] = action.hash_tag_csv_str;
            return {
                ...state,
                selected_file: {
                    ...selected_file,
                    metadata: selected_file["metadata"],
                },
                busy: false,
            }
        }

        case SET_SUBSCRIPTIONS: {

            const subscription_set = {}
            for (const subscription of action.subscriptionList) {
                const key = subscription.sourceId + ":" + subscription.url;
                subscription_set[key] = true;
            }

            return {
                ...state,
                subscription_list: action.subscriptionList,
                subscription_set: subscription_set,
                error: "",
                busy: false,
            };
        }

        case SET_CHECKOUTS: {
            const checkout_set = {}
            for (const checkout of action.checkoutList) {
                const key = checkout.sourceId + ":" + checkout.url;
                checkout_set[key] = true;
            }
            return {
                ...state,
                dashboard: {...state.dashboard, checkoutList: action.checkoutList},
                checkout_list: action.checkoutList,
                checkout_set: checkout_set,
                error: "",
                busy: false,
            };
        }

        case CLEAR_CATEGORY_FILTER: {
            return {
                ...state,
                category_values: {},
                busy: false
            }
        }

        case SET_CATEGORY_FILTER: {
            const metadata = action.metadata;
            const value = action.value;
            const cf = state.category_values;
            if (metadata) {
                cf[metadata] = {metadata: metadata, value: value,
                                minValue: action.minValue, maxValue: action.maxValue};
            }
            return {
                ...state,
                category_values: {...state.category_values, ...cf},
                busy: false,
            };
        }

        case SET_GROUP_SIMILAR: {
            return {
                ...state,
                group_similar: action.group_similar,
                busy: false,
            };
        }

        case SET_SYNSET: {
            const syn_sets = state.syn_sets ? state.syn_sets : {};
            syn_sets[action.name] = action.index;
            return {
                ...state,
                syn_sets: {...syn_sets},
            };
        }

        case SET_TAG_LIST: {
            return {
                ...state,
                hash_tag_list: action.hash_tag_list,
            };
        }

        case SHOW_FILE_UPLOADER: {
            return {
                ...state,
                show_uploader: action.visible,
            };
        }

        case LOAD_NOTIFICATIONS: {
            return {
                ...state,
                activity_list: action.activity_list,
                error: "",
                busy: false,
            };
        }

        // given an item, show its menu and close the others
        case SHOW_MENU: {
            const url = action.item && action.item.url ? action.item.url : "";
            return {
                ...state,
                folder_list: show_menus(url, state.folder_list),
                file_list: show_menus(url, state.file_list),
                subscription_list: show_menus(url, state.subscription_list),
                checkout_list: show_menus(url, state.checkout_list),
                error: "",
                busy: false,
            };
        }

        // close all open menus
        case CLOSE_MENUS: {
            const url = "";
            return {
                ...state,
                folder_list: show_menus(url, state.folder_list),
                file_list: show_menus(url, state.file_list),
                subscription_list: show_menus(url, state.subscription_list),
                checkout_list: show_menus(url, state.checkout_list),
            };
        }


        case SHOW_LOCKS: {
            return {
                ...state,
                show_locks: true,
                show_subscribed: false,
                show_search_results: false,
                busy: false
            };
        }

        case SHOW_SUBSCRIPTIONS: {
            const subscription_set = {}
            for (const subscription of action.subscriptionList) {
                const key = subscription.sourceId + ":" + subscription.url;
                subscription_set[key] = true;
            }
            return {
                ...state,
                subscription_list: action.subscriptionList,
                subscription_set: subscription_set,
                error: "",
                show_locks: false,
                show_subscribed: true,
                show_search_results: false,
                busy: false,
            };
        }

        case CHANGE_VIEW: {
            // flip the view from grid to list or vice versa
            return {
                ...state,
                show_grid: !state.show_grid,
            }
        }

    }
    return state;
};

