window.ENV = {
    // SimSage platform version (used for display only in UI)
    version: '7.7.6',
    // api version of api_base
    api_version: 1,
    // is this a production build or not?
    debug: true,
    // the title of the app, displayed everywhere
    app_title: "SimSage Search",
    // use 'password' sign-in or 'single-sign-on'?
    authentication: "single-sign-on", // "password, single-sign-on",
    // allow anonymous use of the UX or must sign in immediately?
    allow_anon: true,
    // at present values are: arista, simsage
    customer: 'simsage',
    // a link (can be empty string for go back to SimSage) for the customer clicking on their logo in the UX
    customer_website: '',
    // can set as false to skip previews
    show_previews: true,
    // trial expiry for customer trials - just set this to true to disable sign-in
    trial_expired: false,
    // the cloud service layer end-point, change "localhost:8080" to ...
    api_base: 'http://localhost:8080/api',
    // date picker display format
    date_format: 'yyyy/MM',
    // the details of who we are
    organisation_id: 'c276f883-e0c8-43ae-9119-df8b7df9c574',
    kb_id: '46ff0c75-7938-492c-ab50-442496f5de51',
    // search parameters
    score_threshold: 0.8125,
    fragment_count: 10,
    max_word_distance: 40,
    page_size: 10,
    // use spelling suggestions
    use_spell_checker: true,
    // show the advanced search documentation download menu?
    show_download_manual: true,
    // summarization parameters
    extractive_summarization_size: 10,
    // preview window minimum sizes
    preview_min_width: 1024,
    preview_min_height: 1024,
    // msal/jwt clientId and authority
    client_id: "a7c09973-7853-48f6-a067-5a14a5e7b210",
    full_authority: "https://simsageapi.b2clogin.com/simsageapi.onmicrosoft.com/B2C_1_simsage",
    known_authority: "https://simsageapi.b2clogin.com",
    // show metadata item counts in the UX (e.g. number of documents for each file-type)
    show_metadata_counts: false,
    // how many items in a categorical display if > 0
    max_filter_size: 5,
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
    allow_knowledgbase_selector: true,
    query_ai_enabled: false
};
