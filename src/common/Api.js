/**
 * support functions for our searches
 *
 */

// at least one day's difference between min- and max-value to display
const min_date_difference = 24 * 3600;

// is value defined and not null?
export function defined(value) {
    return (value !== null && value !== undefined);
}

// deep copy a json object
export function copy(json_object) {
    if (defined(json_object))
        return JSON.parse(JSON.stringify(json_object));
    return json_object;
}

// create a four digit random hex number
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

// create a guid
function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// return true if we have access to local storage
function has_local_storage() {
    try {
        let test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// highlight search result text
export function highlight(text) {
    return text
        .replace(/{hl1:}/g, "<span class=\"search-primary\">")
        .replace(/{:hl1}/g, "</span>")
        .replace(/{hl2:}/g, "<span class=\"search-secondary\">")
        .replace(/{:hl2}/g, "</span>");
}

// create a client-id for the search UX, representing a unique id for this user (but random)
export function get_client_id() {
    let clientId = "";
    let key = 'simsearch_search_client_id';
    let hasLs = has_local_storage();
    if (hasLs) {
        clientId = localStorage.getItem(key);
    }
    if (!clientId || clientId.length === 0) {
        clientId = guid(); // create a new client id
        if (hasLs) {
            localStorage.setItem(key, clientId);
        }
    }
    return clientId;
}

// convert a source-type (SimSage Source.CT_ ...) to a icon_ci-...svg type
export function source_type_to_icon(source_type) {
    if (source_type === "database") return "database";
    if (source_type === "onedrive" || source_type === "sharepoint365" || source_type === "exchange365") return "office";
    if (source_type === "box") return "dropbox";
    if (source_type === "imanage") return "dropbox";
    if (source_type === "dropbox") return "dropbox";
    if (source_type === "wordpress") return "wordpress";
    if (source_type === "file" || source_type === "search") return "drive";
    if (source_type === "gdrive") return "drive";
    if (source_type === "nfs") return "nfs";
    if (source_type === "restfull") return "rss";
    if (source_type === "rss") return "rss";
    if (source_type === "servicenow") return "icon_ci-servicenow.png";
    return "web"; // fallback
}

// pad any single-digit number with a zero
function pad2(item) {
    return ("" + item).padStart(2, '0');
}


// convert unix timestamp to string if it's for a reasonable time in the future
export function unix_time_convert_to_date(timestamp) {
    if (timestamp > 1000) {
        const a = new Date(timestamp);
        const year = a.getUTCFullYear();
        const month = a.getUTCMonth() + 1;
        const date = a.getUTCDate();
        return year + '/' + pad2(month) + '/' + pad2(date);
    }
    return "";
}

// convert unix timestamp to string if it's for a reasonable time in the future
export function unix_time_convert(timestamp) {
    if (timestamp > 1000) {
        const a = new Date(timestamp);
        const year = a.getUTCFullYear();
        const month = a.getUTCMonth() + 1;
        const date = a.getUTCDate();
        const hour = a.getUTCHours();
        const min = a.getUTCMinutes();
        const sec = a.getUTCSeconds();
        return year + '/' + pad2(month) + '/' + pad2(date) + ' ' + pad2(hour) + ':' + pad2(min) + ':' + pad2(sec);
    }
    return "";
}

// explain the semantic metadata names with a more compelling label
function translate_metadata_name(name) {
    if (name === "city") return "cities in this document";
    if (name === "hashtag") return "hashtags in this document";
    if (name === "address") return "addresses in this document";
    if (name === "continent") return "continents in this document";
    if (name === "country") return "countries in this document";
    if (name === "location") return "locations in this document";
    if (name === "decimal") return "decimal numbers in this document";
    if (name === "number") return "numbers in this document";
    if (name === "person") return "people's names in this document";
    if (name === "url") return "urls in this document";
    if (name === "email") return "emails in this document";
    if (name === "date") return "dates in this document";
    if (name === "time") return "times in this document";
    if (name === "money") return "monetary amounts in this document";
    return name;
}


// return the list of hash-tags and other metadata in a metadata_set
export function get_metadata_list(metadata_set) {
    const metadata = metadata_set ? metadata_set : {};
    const tag_list = [];  // list of metadata {hashtag}
    const metadata_list = [];
    for (const [key, value] of Object.entries(metadata)) {
        if (key === "{hashtag}" && value) {
            const list = value.split(",");
            for (const item of list) {
                if (item && item.trim().length > 0) {
                    tag_list.push({"name": item.trim()});
                }
            }
        } else if (key.indexOf("{") === -1) {
            metadata_list.push({"key": translate_metadata_name(key), "value": value});
        }
    }
    metadata_list.sort((a, b) => (a.key > b.key) ? 1 : -1);
    return {"tag_list": tag_list, "metadata_list": metadata_list};
}


// url to path list
export function path_from_url(url) {
    const list = [];
    let subPath = url.lastIndexOf('\\') > 0 ? url.replace('\\', '/') : url;
    if (subPath.indexOf('?') > 10) {
        subPath = subPath.substring(0, subPath.indexOf('?'));
    }
    const subPathLwr = subPath.toLowerCase();
    // remove http://.../ from the path
    if (subPathLwr.startsWith("http:") || subPathLwr.startsWith("https:") || subPathLwr.startsWith("ftp:")) {
        const index = subPath.indexOf('/', 9);
        if (index < 9)
            return [];
        subPath = subPath.substring(index);
    }
    const parts = subPath.split('/');
    if (parts[parts.length - 1] === '') { // string ends in / easy - no filename
        for (const part of parts) {
            if (part !== '')
                list.push(part);
        }
    } else if (parts[parts.length - 1].indexOf('.') > 0) { // last part of path appears to be a filename
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (part !== '')
                list.push(part);
        }
    } else {
        // just a path set
        for (const part of parts) {
            if (part !== '')
                list.push(part);
        }
    }
    return list;
}

// convert js response to its error output equivalent
function to_pretty_error(error_str) {
    if (error_str && typeof error_str === "string") {
        const error_str_lwr = error_str.toLowerCase();
        if (error_str_lwr === "network error") {
            return "Could not connect to SimSage (Network Error)"
        }
    }
    return error_str;
}

// convert js response to its error output equivalent
export function get_error(error) {
    if (error && error.response && error.response.data && error.response.data.error) {
        return error.response.data.error;
    }
    if (error && error.message) {
        return to_pretty_error(error["message"]);
    } else if (error && error.response && error.response.data && error.response.data.error) {
        return to_pretty_error(error.response.data.error);
    } else {
        return null;
    }
}

// rudimentary email verification
export function is_valid_email(email) {
    if (email && typeof email === "string") {
        const email_str = email.trim();
        const len = email_str.length;
        const at_pos = email_str.indexOf('@');
        const last_dot = email_str.lastIndexOf('.');
        if (at_pos === -1 || last_dot === -1)
            return false;
        if (last_dot < at_pos)
            return false;
        return (last_dot + 2 < len);
    }
    return false;
}

// fetch helper
export function do_fetch(url, session_id, fn_success, fn_fail) {
    if (!session_id || session_id.length === 0)
        session_id = "";

    fetch(url, {headers: {"session-id": session_id}})
        .then((response) => response.blob())
        .then((blob) => { // RETRIEVE THE BLOB AND CREATE LOCAL URL
            if (fn_success)
                fn_success();
            const _url = window.URL.createObjectURL(blob);
            window.open(_url, "_blank").focus(); // window.open + focus
        }).catch((error) => {
        if (fn_fail) {
            if (error.response === undefined) {
                fn_fail('Servers not responding or cannot contact Servers');
            } else {
                fn_fail(get_error(error));
            }
        }
    });
}

// get a logo for the current user to display in the UX
export function get_enterprise_logo() {
    const customer = window.ENV.customer;
    if (customer === 'arista') {
        return "images/brand/arista.png";
    }
    return "images/brand/brand_enterprise-search.png";
}

// return a set of headers with or without a session-id for SimSage communications
export function get_headers(session_id) {
    if (session_id) {
        // const api_version = 1;
        const api_version = window.ENV.api_version
        return {
            headers: {
                "API-Version": api_version,
                "Content-Type": "application/json",
                "session-id": session_id,
            }
        }
    }
    return {
        headers: {
            "API-Version": window.ENV.api_version,
            "Content-Type": "application/json"
        }
    };
}


// map a metadata name to a friendly name if possible
export function map_metadata_name(name) {
    if (name && name.trim) {
        const name_lwr = name.trim().toLowerCase();
        if (name_lwr.includes("document type") || name_lwr.includes("document-type") || name_lwr.includes("documenttype"))
            return "document-type";
        if (name_lwr.includes("created"))
            return "created";
        if (name_lwr.includes("last modified") || name_lwr.includes("last-modified") || name_lwr.includes("lastmodified"))
            return "last-modified";
        return name_lwr;
    }
    return name;
}

// convert a more complex metadata-type to the simplest understood type in the UX
function simplify_metadata_type(metadata_type) {
    if (metadata_type === "author list" || metadata_type === "person list" || metadata_type === "document type" ||
        metadata_type === "location list" || metadata_type === "hashtag list" || metadata_type === "categorical list") return "category";
    if (metadata_type === 'date range' || metadata_type === 'last modified date ranges' ||
        metadata_type === 'created date range') return "date range";
    if (metadata_type === 'number range') return "number range";
    if (metadata_type === 'monetary x 100 range' || metadata_type === 'money range') return "monetary x 100 range";
    return "category"; // fallback
}

/**
 * process the filters and add them to the text string to create a super search string
 *
 * @param metadata_list the list of all metadata items to check
 * @param metadata_values a value-data structure for each metadata categorical item metadata -> {categoryType, metadata, minValue, maxValue, value}
 * @param entity_values selected entity types
 * @param source_list the list of sources
 * @param source_values list of sources to filter on
 * @param hash_tag_list list of hashtags to filter on
 * @param syn_set_filter a string (syn(word,id) and syn(word2,id2)) (or empty string) with Syn-set filters
 * @param last_modified_slider the last modified search range
 * @param created_slider the created date-time search range
 * @returns {string} the modified (or original search string)
 */
export function get_filters(metadata_list, metadata_values, entity_values, source_list, source_values,
                            hash_tag_list, syn_set_filter, last_modified_slider, created_slider) {
    const delta = 3600_000;
    let filter_str = "";
    let needs_and = false;

    // deal with the two date-sliders if set
    for (const v of [last_modified_slider, created_slider]) {
        if (defined(v) && defined(v.currentMinValue) && defined(v.currentMaxValue) && defined(v.maxValue) && defined(v.minValue)) {
            const d1 = (v.currentMinValue - v.minValue);
            const d2 = (v.maxValue - v.currentMaxValue);
            if (v && (d1 > delta || d2 > delta)) {
                const lhs = v.currentMinValue;
                const rhs = v.currentMaxValue;
                if (filter_str.length > 0) {
                    filter_str += " and ";
                }
                filter_str += "range(" + v.metadata + "," + lhs + "," + rhs + ")";
                needs_and = true;
            }
        }
    }

    if (metadata_values) {
        for (const md of metadata_list) {

            const category_type = simplify_metadata_type(md.categoryType);
            const simplified_md = map_metadata_name(md.metadata);

            let type_filter = "";
            if (metadata_values && metadata_values[simplified_md] && category_type === "category") {
                const v_set = metadata_values[simplified_md];
                let temp_filter = "";
                for (const [k, v] of Object.entries(v_set)) {
                    if (v && k) {
                        if (temp_filter.length > 0) {
                            temp_filter += " or ";
                        }
                        temp_filter += "meta(" + md.metadata + "," + k + ")";
                    }
                }
                if (temp_filter.length > 0) {
                    if (type_filter.length > 0) {
                        type_filter += " and ";
                    }
                    type_filter += "(" + temp_filter + ")";
                }
            }

            if (type_filter.length > 0) {
                if (needs_and) filter_str += " and (";
                filter_str += type_filter;
                if (needs_and) filter_str += ")";
                needs_and = true;
            }
        }
    }

    if (source_list && source_list.length > 0 && source_values) {
        const source_id_list = [];
        for (const source of source_list) {
            if (source_values[source.name] === true) {
                source_id_list.push(source.sourceId);
            }
        }
        if (source_id_list.length > 0) {
            let sourceFilter = "source(" + source_id_list.join(",") + ")"
            if (needs_and) filter_str += " and (";
            filter_str += sourceFilter;
            if (needs_and) filter_str += ")";
            needs_and = true;
        }
    }

    if (hash_tag_list && hash_tag_list.length > 0) {
        if (needs_and) filter_str += " and (";
        let ht_filter = "";
        for (const hash_tag of hash_tag_list) {
            if (ht_filter.length > 0)
                ht_filter += " and ";
            ht_filter += "#" + hash_tag;
        }
        filter_str += ht_filter;
        if (needs_and) filter_str += ")";
        needs_and = true;
    }

    if (syn_set_filter.length > 0) {
        if (needs_and) filter_str += " and (";
        filter_str += syn_set_filter;
        if (needs_and) filter_str += ")";
    }

    return filter_str;
}

/*
 * set up the syn-set filter
 */
export function setup_syn_sets(text, syn_sets) {
    // remove any : and / as well as they are special characters
    const text_list = text.split(' ');
    const syn_set_list = [];
    const text_set = {};
    for (const t of text_list) {
        const item = t.trim().toLowerCase();
        if (item.length > 0 && !text_set[item]) {
            text_set[item] = true;
            let syn_set = -1;
            if (syn_sets && syn_sets[item] >= 0) {
                syn_set = syn_sets[item];
            }
            if (syn_set >= 0) {
                syn_set_list.push("syn(" + item + "," + syn_set + ")");
            }
        }
    }
    if (syn_set_list.length === 0)
        return ""
    return syn_set_list.join(' and ');
}

// get time compatible data for metadata
export function get_time_range_metadata(category_list, data, metadata_name) {
    if (category_list) {
        for (const md of category_list) {
            if (map_metadata_name(md.metadata) === metadata_name && md.maxValue && md.minValue) {
                if (data && defined(data.currentMinValue)) {
                    const minValue = md && md["minValue"] ? md["minValue"] : 0;
                    const maxValue = md && md["maxValue"] ? md["maxValue"] : 0;
                    const currentMinValue = data && data.currentMinValue ? data.currentMinValue : minValue;
                    const currentMaxValue = data && data.currentMaxValue ? data.currentMaxValue : maxValue;
                    const delta = maxValue - minValue;
                    if (delta > min_date_difference) {
                        md.minValue = minValue;
                        md.maxValue = maxValue;
                        md.currentMinValue = currentMinValue;
                        md.currentMaxValue = currentMaxValue;
                        return md;
                    }
                } else {
                    const minValue = md && md["minValue"] ? md["minValue"] : 0;
                    const maxValue = md && md["maxValue"] ? md["maxValue"] : 0;
                    const delta = maxValue - minValue;
                    if (delta > min_date_difference) {
                        md.minValue = minValue;
                        md.maxValue = maxValue;
                        md.currentMinValue = minValue;
                        md.currentMaxValue = maxValue;
                        return md;
                    }
                }
            }
        }
    }
    return null;
}

// convert a URL to a bread-crumb / item
export function url_to_bread_crumb(url) {
    if (url.length > 0) {
        const list = path_from_url(url)
        let str = "";
        for (const item of list) {
            if (str.length > 0) {
                str += " / ";
            }
            str += item;
        }
        if (str === "")
            str = "/";
        return str;
    }
    return "";
}

// return true if url is viewable (ie. is an HTTP / HTTPS reference)
export function is_viewable(url) {
    return url && url.startsWith && (url.trim().toLowerCase().startsWith(("https://")) ||
        url.trim().toLowerCase().startsWith(("http://")));
}

// download local
export function download_document(dl_url, session_id) {
    const url = window.ENV.api_base + '/dms/binary/latest/' + encodeURIComponent(window.ENV.organisation_id) + '/' +
        encodeURIComponent(getKbId()) + '/' + btoa(decodeURI(encodeURIComponent(dl_url)));
    do_fetch(url, session_id);
}

// download a url (open it or view it)
export function download(url, session_id) {
    if (url.length > 0 && is_viewable(url)) {
        window.open(url, "_blank");
    } else if (url.length > 0) {
        download_document(url, session_id);
    }
}


// takes a query string (window.location.search / props.location.search) and parses it into a named map
export function get_url_search_parameters_as_map(search_string) {
    let result = {}
    if (search_string && search_string.length > 0 && search_string.startsWith("?")) {
        search_string = search_string.substring(1)
        const vars = search_string.split("&");
        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split("=");
            if (pair.length === 2)
                result[pair[0]] = pair[1]
        }
    }
    return result;
}

// adds or replaces an url parameter in the history with the passed in value
export function add_url_search_parameter(key, value) {
    const parameterMap = get_url_search_parameters_as_map(window.location.search)
    if (value){
        parameterMap[key] = encodeURIComponent(value);
    } else {
        delete parameterMap[key]
    }
    let url = ""
    Object.getOwnPropertyNames(parameterMap).forEach((param, idx) => {
        url = url + (idx === 0 ? "?" : "&") + param + "=" + parameterMap[param]
    })
    if (url.length>0){
        window.history.replaceState(null, null, url)
    }else{
        // Can't set URL to "", need to set whole path if no query string
        window.history.replaceState({}, '', window.location.pathname);
    }
}

// returns the currently selected Knowledgebase id
// this will either be the one in the url or the default one if none set
export function getKbId(){
    const params = get_url_search_parameters_as_map(window.location.search)
    if (params.hasOwnProperty("kbId")){
        return params["kbId"]
    }else {
        return window.ENV.kb_id
    }
}

/**
 * turn a string into a stream of tokens
 *
 * @param str the string to tokenize
 * @returns a list of tokens, or an empty list
 */
export function tokenize(str) {
    const token_list = [];
    if (str && str.length > 0) {
        let word = "";
        for (const ch of str) {
            if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === '-') {
                word += ch;
            } else {
                if (word.length > 0)
                    token_list.push(word);
                word = "";
                token_list.push("" + ch);
            }
        }
        if (word.length > 0)
            token_list.push(word);
    }
    return token_list;
}

// skip a set of tokens after an entity - spaces
function skip_tokens(i, token_list) {
    while (i < token_list.length && (token_list[i] === " " || token_list[i] === ")" ||
        token_list[i] === "or" || token_list[i] === "and")) {
        i += 1;
    }
    return i;
}


/**
 * return a possible search_text string from the query string
 * @param query the string to check
 */
export function get_text_search(query) {
    if (query.trim().startsWith("(") && query.trim().endsWith(")"))
        return query.trim();
    const token_list = tokenize(query);
    let search_text_list = [];
    let i = 0;
    while (i < token_list.length) {
        const token = token_list[i];
        let next_token = "";
        if (i + 1 < token_list.length)
            next_token = token_list[i + 1];
        if (token !== " ") {
            // skip any special metadata
            if (token === "doc" && next_token === "(") {
                while (i < token_list.length && token_list[i] !== ')') {
                    i += 1
                }
                i = skip_tokens(i, token_list);

            } else if (token === "range" && next_token === "(") {
                while (i < token_list.length && token_list[i] !== ')') {
                    i += 1
                }
                i = skip_tokens(i, token_list);

            } else if (token === "sort" && next_token === "(") {
                while (i < token_list.length && token_list[i] !== ')') {
                    i += 1
                }
                i = skip_tokens(i, token_list);

            } else if (token === "num" && next_token === "(") {
                while (i < token_list.length && token_list[i] !== ')') {
                    i += 1
                }
                i = skip_tokens(i, token_list);

            } else if (token === "source" && next_token === "(") {
                while (i < token_list.length && token_list[i] !== ')') {
                    i += 1
                }
                i = skip_tokens(i, token_list);

            } else if (token === "meta" && next_token === "(") {
                while (i < token_list.length && token_list[i] !== ')') {
                    i += 1
                }
                i = skip_tokens(i, token_list);

            } else if (token !== ")" && token !== "(" && token !== "or") {
                search_text_list.push(token);
                i += 1;

            } else {
                i += 1;
            }

        } else if (token !== ")" && token !== "(" && token !== "or") {
            search_text_list.push(token);
            i += 1;

        } else {
            i += 1;
        }
    }
    if (search_text_list.length > 0) {
        return search_text_list.join("").trim();
    }
    return "";
}


/**
 * get the content of the meta(document-type,pdf) list item
 * @param query the string to check
 * @returns {array} - a list of document types (or empty list)
 */
export function get_doc_types(query) {
    const token_list = tokenize(query);
    let doc_type_list = [];
    let i = 0;
    while (i < token_list.length) {
        const token = token_list[i];
        let next_token = "";
        if (i + 1 < token_list.length)
            next_token = token_list[i + 1];
        if (token !== " ") {
            // skip any special metadata
            if (token === "meta" && next_token === "(") {
                let is_document_type = false;
                while (i < token_list.length && token_list[i] !== ')') {
                    if (token_list[i] === "document-type") {
                        is_document_type = true;
                    }
                    if (is_document_type && token_list[i] !== ',' && token_list[i] !== "document-type") {
                        doc_type_list.push(token_list[i]);
                    }
                    i += 1
                }
                i += 1;
            } else {
                i += 1;
            }

        } else {
            i += 1;
        }
    }
    return doc_type_list;
}


/**
 * get the content of the source(id1,id2,...) list item
 * @param query the string to check
 * @returns {array} - a list of source ids (or empty list)
 */
export function get_source_set(query) {
    const token_list = tokenize(query);
    let get_source_set = {};
    let i = 0;
    while (i < token_list.length) {
        const token = token_list[i];
        let next_token = "";
        if (i + 1 < token_list.length)
            next_token = token_list[i + 1];
        if (token !== " ") {
            // skip any special metadata
            if (token === "source" && next_token === "(") {
                while (i < token_list.length && token_list[i] !== ')') {
                    if (token_list[i] !== ',') {
                        get_source_set[token_list[i]] = true;
                    }
                    i += 1
                }

            } else {
                i += 1;
            }

        } else {
            i += 1;
        }
    }
    return get_source_set;
}

/**
 * get the metadata-range item (range(metadata,#1,#2))
 * @param query the string to check
 * @param metadata the metadata to look for
 * @returns the range string or empty string
 */
export function get_metadata_range(query, metadata) {
    const token_list = tokenize(query);
    let range_numbers = [];
    let i = 0;
    while (i < token_list.length) {
        const token = token_list[i];
        let next_token = "";
        if (i + 1 < token_list.length)
            next_token = token_list[i + 1];
        if (token !== " ") {
            // skip any special metadata
            if (token === "range" && next_token === "(") {
                let is_correct_metadata = false;
                while (i < token_list.length && token_list[i] !== ')') {
                    if (token_list[i] === metadata) {
                        is_correct_metadata = true;
                    }
                    if (is_correct_metadata && token_list[i] !== ',' && token_list[i] !== metadata) {
                        range_numbers.push(token_list[i]);
                    }
                    i += 1
                }
                i += 1;
            } else {
                i += 1;
            }

        } else {
            i += 1;
        }
    }
    return range_numbers;
}

/**
 * get the metadata and other data setters from the query string
 * look for a query string, a source-id set and a set of document-type filters
 *
 */
export function setup_query_parameter_state(source_list) {
    let has_search_parameters = false;
    let propsSearch = get_url_search_parameters_as_map(window.location.search);
    if (propsSearch.hasOwnProperty("query")) {
        has_search_parameters = true;
        let data = {};
        const query = decodeURIComponent(propsSearch.query)
        const qs_search_text = get_text_search(query); // ordinary text-box query terms
        if (qs_search_text.length > 0) {
            has_search_parameters = true;
            data = {...data, search_text: qs_search_text};
        }
        let num_metadata_values = 0;
        const metadata_values = {};
        const document_type_list = get_doc_types(query);
        if (document_type_list.length > 0) {
            num_metadata_values += 1;
            const values = {};
            for (const dt of document_type_list) {
                values[dt] = true;
            }
            has_search_parameters = true;
            metadata_values["document-type"] = values;
        }
        let num_source_values = 0;
        const source_values = {};
        const source_id_set = get_source_set(query);
        for (const source of source_list) {
            if (source_id_set[source.sourceId] === true) {
                has_search_parameters = true;
                num_source_values += 1;
                source_values[source.name] = true;
            }
        }
        if (num_source_values > 0) {
            data = {...data, source_values: source_values}
        }
        // todo: not working at present on refresh
        // const created_range = get_metadata_range(query, "created");
        // if (created_range.length === 2) {
        //     num_metadata_values += 1;
        //     metadata_values["created"] = {minValue: parseInt(created_range[0]), maxValue: parseInt(created_range[1])}
        // } else {
        //     num_metadata_values += 1;
        //     metadata_values["created"] = {minValue: 0, maxValue: 0}
        // }
        // const last_modified_range = get_metadata_range(query, "last-modified");
        // if (last_modified_range.length === 2) {
        //     num_metadata_values += 1;
        //     metadata_values["last-modified"] = {minValue: parseInt(last_modified_range[0]), maxValue: parseInt(last_modified_range[1])}
        // } else {
        //     num_metadata_values += 1;
        //     metadata_values["last-modified"] = {minValue: 0, maxValue: 0}
        // }

        if (num_metadata_values > 0) {
            data = {...data, metadata_values: metadata_values};
        }

        // todo:
        // this.updatePropsWithEntityTypes(query); // entity types

        if (has_search_parameters)
            return data;
    }
    return null;
}


// user to user-name
export function get_full_username(user) {
    if (user && user.firstName) {
        return user.firstName + " " + user.surname;
    }
    return "";
}

