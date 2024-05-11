window.ENV = {
    // SimSage platform version (used for display only in UI)
    version: '7.15',
    // api version of api_base
    api_version: 1,
    // is this a production build or not?
    debug: true,
    // the title of the app, displayed everywhere
    app_title: "SimSage Search",
    // at present values are: arista, simsage, sjic
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
    organisation_id: "c276f883-e0c8-43ae-9119-df8b7df9c574",
    kb_id: "46ff0c75-7938-492c-ab50-442496f5de51",
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
    // show metadata item counts in the UX (e.g. number of documents for each file-type)
    show_metadata_counts: true,
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
    // AI is enabled is set by the search info
    // this is the "AI menu item" selector being ticked by default or not
    query_ai_enabled_by_default: false,
    // display the summary button if AI is enabled
    use_article_summary: true,
    friendly_error_messages: true,
    // cookie storage length
    session_length_in_minutes: 60,
    // keycloak real, client_id and server
    kc_realm: "simsage-test",
    kc_client_id: "simsage-test-client",
    kc_endpoint: "https://security.simsage.ai",
};
