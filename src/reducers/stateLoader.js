//
// this defines the initial state of the entire application - the state store
//

import Api from "../common/api";

export function initializeState() {
    return {
        // system busy
        busy: false,

        // the selected theme
        theme: 'light',

        // session and user objects
        session: null,

        // redaction
        redaction: {
            // semantics to filter
            person: false,
            location: false,
            money: false,
            company: false,
            law_firm: false,
            brand: false,
            // unknowns to add to the semantics
            semantic_csv: '',
            // additional words to filter
            additional_word_csv: '',
            // list of words overriding any redaction(s)
            allow_word_csv: ''
        },

        // search info
        search_info_loaded: false,

        // the dashboard's top view
        dashboard_root: null,

        // the folder the user is viewing
        current_folder: null,

        // the source that is active / selected
        selected_source: null,

        // the file that has focus / is selected and its details
        selected_file: null,

        // item.url => parent-item.url
        parent_folder_tracker: {},

        // url -> folder item
        folder_tracker: {},

        // sourceId => source-name
        source_tracker: {},

        // the user's id if we've got a valid dashboard
        dashboard_user_id: '',

        // list of checked out items
        checkout_list: [],
        // hashmap lookup of items checkout by this user: url -> true (or absent)
        checkout_set: {},

        // list of bookmarked items
        bookmark_list: [],

        // list of items subscribed to
        subscription_list: [],
        // hashmap lookup of items subscribed to by this user: url -> true (or absent)
        subscription_set: {},

        // list of notifications for this user
        activity_list: [],

        // list of saved searches for this user
        save_search_list: [],

        // Source selection in results page
        source_selection:{},

        // metadata search controls
        category_list: [],
        // metadata search control values
        category_values: {},
        // group similar documents
        group_similar: false,
        // sort by newest articles first
        newest_first: false,
        // syn-set selections
        syn_sets: {},
        // hash-tag list for search
        hash_tag_list: [],

        // list of crawlers
        source_list: [],

        // list of folders
        folder_list: [],

        // list of files
        file_list: [],

        breadcrumb_list: [{"name": "Source"}],

        // the user, and organisation
        user: null,
        organisation: {"name": "SimSage"},

        // show the search results?
        show_search_results: false,
        user_search_text: "",
        search_text: "",
        search_result: {},  // the set returned by SimSage
        search_page: 0,
        search_result_list: [], // a list of items from the search_result set and more (infinite scroll)
        search_focus: null,     // the item shown (if not null) on the focus screen

        // a unique id identifying this client
        client_id: Api.getClientId(),

        // show the locked-section
        show_locks: false,
        // show the subscribed-section
        show_subscribed: false,

        // user preference: grid view or not?
        show_grid: true,

        // html preview data by the pages
        preview_page_list: [],

        // application error messages
        error_title: "Error",
        error: "",
    }
}

