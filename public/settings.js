window.ENV = {
    // SimSage platform version (used for display only in UI)
    version: '7.3.20',
    // api version of api_base
    api_version: 1,
    // is this a production build or not?
    debug: true,
    // the title of the app, displayed everywhere
    app_title: "SimSage Search",
    // dark or light theme?
    theme: 'light',
    // the cloud service layer end-point, change "localhost:8080" to ...
    api_base: 'http://localhost:8080/api',
    // date picker display format
    date_format: 'yyyy/MM',
    // the details of who we are
    organisation_id: 'c276f883-e0c8-43ae-9119-df8b7df9c574',
    kb_id: '46ff0c75-7938-492c-ab50-442496f5de51',
    // search parameters
    score_threshold: 0.8125,
    fragment_count: 3,
    max_word_distance: 20,
    page_size: 10,
    // summarization parameters
    extractive_summarization_size: 10,
};

