window.ENV = {
    // SimSage platform version (used for display only in UI)
    version: '8.3',
    // api version of api_base
    api_version: 1,
    // run from this location, starting with a / (or empty)
    base_name: "",
    // is this a production build or not?
    debug: true,
    // the title of the app, displayed everywhere
    app_title: "SimSage Search",
    // UI language, en or fr
    language: "en",
    // at present values are: arista, simsage, sjic
    customer: 'simsage',
    // a link (can be empty string for go back to SimSage) for the customer clicking on their logo in the UX
    customer_website: '',
    // can set as false to skip previews
    show_previews: false,
    // show metadata in preview window
    show_preview_metadata: false,
    // show llm search option in menu?
    show_llm_menu: true,
    // llm interface showing by default?
    llm_search: false,
    // trial expiry for customer trials - just set this to true to disable sign-in
    trial_expired: false,
    // the cloud service layer end-point, change "localhost:8080" to ...
    api_base: 'http://localhost:8080/api',
    // date picker display format
    date_format: 'yyyy/MM',
    // the details of who we are
    organisation_id: "c276f883-e0c8-43ae-9119-df8b7df9c574",
    kb_id: "46ff0c75-7938-492c-ab50-442496f5de51",
    // search parameters
    score_threshold: 0.8125,
    fragment_count: 10,
    max_word_distance: 20,
    // default page size
    page_size: 10,
    // use spelling suggestions
    use_spell_checker: false,
    // show the advanced search documentation download menu?
    show_download_manual: true,
    // summarization parameters
    extractive_summarization_size: 10,
    // preview window minimum sizes
    preview_min_width: 1024,
    preview_min_height: 1024,
    // show metadata item counts in the UX (e.g. number of documents for each file-type)
    show_metadata_counts: true,
    // show the star and undo icon for search/result boosting for users with the "teacher" role
    show_boost_controls: true,
    // entities for entity viewer / selector
    entity_list: [{"value": "city", "name": "cities"}, {"value": "credit-card", "name": "credit cards"},
        {"value": "country", "name": "countries"}, {"value": "date", "name": "dates"},
        {"value": "email", "name": "email address"},
        {"value": "law-firm", "name": "law firms"}, {"value": "money", "name": "currency"},
        {"value": "nin", "name": "national insurance numbers"}, {"value": "number", "name": "numbers"},
        {"value": "person", "name": "people"}, {"value": "url", "name": "urls"}],
    // override normal source display and show grouped sources
    // e.g. [{"name": 'Legal Group', "sources": ["glp","legal docs",]}, {...]
    override_source_list: [],
    allow_knowledge_base_selector: true,
    // AI is enabled is set by the search info
    // this is the "AI menu item" selector being ticked by default or not
    query_ai_enabled_by_default: false,
    // html layout
    compact_view: false,
    // show icons for sources in search by default
    show_source_icon: false,
    // if true, we ask for insights, if false, we ask for Q&A
    use_insight: false,
    // display the summary button if AI is enabled
    use_article_summary: true,
    friendly_error_messages: true,
    // show the user tags in the search results?
    show_user_tags: true,
    // cookie storage length
    session_length_in_minutes: 60,
    // Collabora exceptions
    video_types: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa", "spl", "avif", "vtt", "mj2", "mp4",
        "mjp2", "mpeg", "mpg", "mpe", "m1v", "m2v", "ogv", "drc", "ogm", "mov", "qt", "webm", "avi", "m4v"],
    audio_types: ["mp3", "wav", "mp4", "webm", "weba", "mov", "au", "mpga", "mp2", "mp2a", "m2a", "m3a", "oga",
        "ogg", "opus", "aif", "aiff", "aifc", "caf", "flac", "ra"],
    // html types
    html_types: ["asp", "aspx", "htm", "html"],
    // Collabora valid (not odp)
    valid_types: ["4th", "602", "ad", "ada", "adoc", "ads", "aj", "applescript", "as", "asciidoc", "asm",
        "aw", "awk", "bas", "c", "c++", "cbl", "cha", "cl", "clj", "cls", "cpp", "cs", "css", "csv", "csvs",
        "doc", "docm", "docx", "dot", "dotm", "dotx", "dox", "e", "el", "eps", "epsf", "epsi", "erl", "exp", "f",
        "fbx", "fft", "flextext", "fodp", "fods", "fodt", "geojson", "gml", "go", "h", "haml", "hqx", "hs", "hx",
        "ics", "inf", "itk", "java", "jl", "js", "json", "jsp", "jw", "jwt", "kt", "lhs", "lisp", "log",
        "lsp", "lua", "man", "md", "me", "ml", "ms", "odf", "odft", "odg", "odi", "ods", "odt", "otc", "otg",
        "oth", "oti", "otm", "otp", "ots", "ott", "oxps", "pdf", "pot", "potx", "ppa", "ppam", "pps", "ppsm", "ppsx",
        "ppt", "pptm", "pptx", "ppz", "ps", "py", "rb", "rest", "restx", "rexx", "rfc", "rft", "roff", "rs", "rst",
        "rtf", "s", "scala", "scm", "sed", "sgm", "sgml", "sql", "st", "sxw", "t", "tcl", "textgrid", "tk", "toml",
        "tr", "ttl", "txt", "v", "vb", "vbs", "vcf", "vcs", "vhd", "vhdl", "vsd", "vsdm", "vsdx", "vss", "vssm",
        "vssx", "vst", "vstm", "vstx", "vsw", "vtt", "wml", "wmls", "xla", "xlam", "xlc", "xld", "xll", "xlm", "xls",
        "xlsb", "xlsm", "xlsx", "xlt", "xltm", "xltx", "xlw", "xps", "y", "yacc", "yaml"
    ],

    // map source names to source icons
    source_icons: {
        "bugs": "images/source-icons/bugs-icon.svg",
        "aid": "images/source-icons/arista-icon.png",
        "reviewboard": "images/source-icons/reviewboard-icon.png",
        "release tracker": "images/source-icons/tracker-icon.png",
    },

    // Settings to run Collabora
    wopi_url: "http://localhost:9980/browser/baa6eef/cool.html",
    wopi_api_url: "http://localhost:8080/api/wopi",
    // keycloak real, client_id and server
    kc_realm: "simsage-test",
    kc_client_id: "simsage-test-client",
    kc_endpoint: "https://security.simsage.ai",
};
