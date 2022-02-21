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
    api_base: 'https://cloud.simsage.co.uk/api',
    // date picker display format
    date_format: 'yyyy/MM',
    // the details of who we are
    organisation_id: 'c9a07a20-7d17-11ec-ac14-e9b65724d7f4',
    kb_id: 'd2f71250-7d17-11ec-9603-d3e05b8d0ddc',
    // search parameters
    score_threshold: 0.8125,
    fragment_count: 3,
    max_word_distance: 20,
    page_size: 10,
    // summarization parameters
    extractive_summarization_size: 10,
    // preview window minimum sizes
    preview_min_width: 1024,
    preview_min_height: 1024,
};

