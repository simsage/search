import '../types';

// @ts-ignore
import arista from "../assets/images/brand/brand_arista.png"
import es_light from "../assets/images/brand/brand_enterprise-search.svg"
import es_dark from "../assets/images/brand/brand_enterprise-search-dark.svg"
// @ts-ignore
import img_egnyte from "../assets/images/source-icons/egnyte-icon.png"
// @ts-ignore
import img_aid from "../assets/images/source-icons/arista-icon.png"
// @ts-ignore
import img_review_board from "../assets/images/source-icons/reviewboard-icon.png"
// @ts-ignore
import img_release_tracker from "../assets/images/source-icons/tracker-icon.png"
import img_aws from "../assets/images/source-icons/icon_ci-aws.svg"
import img_box from "../assets/images/source-icons/icon_ci-box.svg"
import img_xml from "../assets/images/source-icons/icon_ci-xml.svg"
import img_gdrive from "../assets/images/source-icons/icon_ci-gdrive.svg"
import img_jira from "../assets/images/source-icons/icon_ci-jira.svg"
import img_slack from "../assets/images/source-icons/icon_ci-slack.svg"
import img_zendesk from "../assets/images/source-icons/icon_ci-zendesk.svg"
import img_confluence from "../assets/images/source-icons/icon_ci-confluence.svg"
import img_alfresco from "../assets/images/source-icons/icon_ci-alfresco.svg"
import img_web from "../assets/images/source-icons/icon_ci-web.svg"
import img_discourse from "../assets/images/source-icons/icon_ci-discourse.svg"
import img_service_now from "../assets/images/source-icons/icon_ci-servicenow.svg"
import img_bugs from "../assets/images/source-icons/bugs-icon.svg"
import img_office from "../assets/images/source-icons/icon_ci-office.svg"
import img_sharepoint from "../assets/images/source-icons/icon_ci-sharepoint.svg"
import img_outlook from "../assets/images/source-icons/icon_ci-outlook.svg"
import img_onedrive from "../assets/images/source-icons/icon_ci-onedrive.svg"
import img_database from "../assets/images/source-icons/icon_ci-database-icon.svg"
import img_rss from "../assets/images/source-icons/icon_ci-rss.svg"
import img_imanage from "../assets/images/source-icons/icon_ci-imanage.svg"
import img_file from "../assets/images/source-icons/icon_ci-nfs.svg"
import img_dropbox from "../assets/images/source-icons/icon_ci-dropbox.svg"
import {ActionWithError, HeadersConfig, SourceItem, User} from "../types";

// Export hashtag_metadata constant
export const hashtag_metadata = "{hashtag}";
export const user_metadata_marker = "user-"
// used as a marker for url_of_archive:::path_to_child_inside_archive
export const archive_separator = ":::"

// is value defined and not null?
export function defined(value: any): boolean {
    return (value !== null && value !== undefined);
}

// deep copy a json object
export function copy(json_object: any): any {
    if (defined(json_object))
        return JSON.parse(JSON.stringify(json_object));
    return json_object;
}

// display a pretty version number
export function pretty_version(): string {
    const parts = window.ENV.version.split(".");
    if (parts.length === 3 || parts.length === 4) {
        return parts[0] + "." + parts[1] + " (build " + parts[2] + ")";
    }
    return window.ENV.version;
}

// fetch helper
export function do_fetch(url: string, session_id: string, fn_success?: () => void, fn_fail?: (error_str: string) => void) {
    if (!session_id || session_id.length === 0)
        session_id = "";

    fetch(url, {headers: {"session-id": session_id}})
        .then((response) => response.blob())
        .then((blob) => { // RETRIEVE THE BLOB AND CREATE LOCAL URL
            if (fn_success)
                fn_success();
            const _url = window.URL.createObjectURL(blob);
            (window as any).open(_url, "_blank").focus(); // window.open + focus
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

// download local
export function download_document(dl_url: string, session_id: string) {
    if (is_archive(dl_url)) {
        alert("archive files cannot be downloaded");

    } else if (!session_id || session_id.trim().length === 0) {
        alert("you must sign-in to download documents");

    } else {
        const url = window.ENV.api_base + '/dms/binary/latest/' + encodeURIComponent(window.ENV.organisation_id) + '/' +
            encodeURIComponent(getKbId()) + '/' + window.btoa(unescape(encodeURIComponent(dl_url)));
        do_fetch(url, session_id);
    }
}

// create a guid
function guid(): string {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// return true if we have access to local storage
function has_local_storage(): boolean {
    try {
        let test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// create a client-id for the search UX, representing a unique id for this user (but random)
export function get_client_id(): string {
    let clientId = "";
    let key = 'simsearch_search_client_id';
    let hasLs = has_local_storage();
    if (hasLs) {
        clientId = localStorage.getItem(key) || "";
    }
    if (!clientId || clientId.length === 0) {
        clientId = guid(); // create a new client id
        if (hasLs) {
            localStorage.setItem(key, clientId);
        }
    }
    return clientId;
}

// returns the currently selected Knowledgebase id
// this will either be the one in the url or the default one if none set
export function getKbId(): string {
    const params = get_url_search_parameters_as_map(window.location.search);
    if (params.hasOwnProperty("kbId") && params["kbId"].length > 0) {
        return params["kbId"];
    } else {
        return window.ENV.kb_id;
    }
}

// takes a query string (window.location.search / props.location.search) and parses it into a named map
export function get_url_search_parameters_as_map(search_string: string): {[key: string]: string} {
    let result: {[key: string]: string} = {};
    if (search_string && search_string.length > 0 && search_string.startsWith("?")) {
        search_string = search_string.substring(1);
        const vars = search_string.split("&");
        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split("=");
            if (pair.length === 2)
                result[pair[0]] = pair[1]
                    .replace(/\+/g, ' ')
                    .replace(/%2B/g, ' ')
                    .replace(/%2b/g, ' ');
        }
    }
    return result;
}

export const get_cookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
};

export const get_cookie_value = (cookie_name: string, key: string): string | undefined => {
    const cookie_value = get_cookie(cookie_name);
    const cookie_data = cookie_value
        ? Object.fromEntries(
            cookie_value.split('&').map(item => item.split('='))
        )
        : {};
    if (cookie_data.hasOwnProperty(key)) return cookie_data[key];
    return undefined;
};

export const set_cookie = (name: string, value: string, days: number): void => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
};

export const update_cookie_value = (cookie_name: string, key: string, new_value: any): void => {
    const cookie_value = get_cookie(cookie_name);
    const cookie_data = cookie_value
        ? Object.fromEntries(
            cookie_value.split('&').map(item => item.split('='))
        )
        : {};
    cookie_data[key] = new_value;
    const updated_value = Object.entries(cookie_data)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
    set_cookie(cookie_name, updated_value, 360);
};

// map a metadata name to a friendly name if possible
export function map_metadata_name(name: string): string {
    if (name && typeof name.trim === 'function') {
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
function simplify_metadata_type(metadata_type: string): string {
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
 * @returns {string} the modified (or original search string)
 */
export function get_filters(
    metadata_list: any[], 
    metadata_values: any, 
    entity_values: any, 
    source_list: any[], 
    source_values: any,
    hash_tag_list: string[], 
    syn_set_filter: string[]
): string {
    let filter_str = "";
    let needs_and = false;

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
                        if (md.metadata === 'document-type') {
                            // temp_filter += "word(" + k + "," + md.metadata + ")";
                        } else {
                            temp_filter += "meta(" + md.metadata + "," + k + ")";
                        }
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
            if (source_values[source.sourceId] === true) {
                source_id_list.push(source.sourceId);
            }
        }
        if (source_id_list.length > 0) {
            let sourceFilter = "source(" + source_id_list.join(",") + ")";
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

    if (syn_set_filter && syn_set_filter.length > 0) {
        if (needs_and) filter_str += " and (";
        filter_str += syn_set_filter;
        if (needs_and) filter_str += ")";
    }

    return filter_str;
}

/**
 * process the filters and add them to the text string to create a super search string
 *
 * @param metadata_values a value-data structure for each metadata categorical item metadata -> {categoryType, metadata, minValue, maxValue, value}
 * @returns string[] a list of selected metadata values for document-type
 */
export function get_document_types(metadata_values: any): string[] {
    let document_type_list: string[] = [];
    if (metadata_values.hasOwnProperty("document-type")) {
        const dt_set = metadata_values["document-type"];
        for (const name of Object.keys(dt_set)) {
            if (dt_set.hasOwnProperty(name) && dt_set[name] === true) {
                document_type_list.push(name);
            }
        }
    }
    return document_type_list;
}

/**
 * process the filters and add them to the text string to create a super search string
 *
 * @param source_list the list of sources
 * @param source_values list of sources to filter on
 * @returns {string} the modified (or original search string)
 */
export function get_source_filter(source_list: any[], source_values: any): string {
    let filter_str = "";
    let needs_and = false;

    if (source_list && source_list.length > 0 && source_values) {
        const source_id_list = [];
        for (const source of source_list) {
            if (source_values[source.sourceId] === true) {
                source_id_list.push(source.sourceId);
            }
        }
        if (source_id_list.length > 0) {
            let sourceFilter = "source(" + source_id_list.join(",") + ")";
            if (needs_and) filter_str += " and (";
            filter_str += sourceFilter;
            if (needs_and) filter_str += ")";
        }
    }
    return filter_str;
}

// convert js response to its error output equivalent
export function get_error(action: ActionWithError): string {
    const str1 = action?.error?.message?.toString() ?? '';
    const str2 = action?.payload?.message?.toString() ?? '';
    const str3 = action?.type?.toString() ?? '';
    const str4 = action?.payload?.response?.data?.error ?? '';
    let final_str = "";
    if (str1 !== '') {
        final_str += str1;
    }
    if (str2 !== '') {
        if (final_str !== '')
            final_str += ", " + str2;
        else
            final_str = str2;
    }
    if (str3 !== '') {
        if (final_str !== '')
            final_str += " (" + str3 + ")";
        else
            final_str = str3;
    }
    if (str4 !== '') {
        if (final_str !== '')
            final_str += "\n\n" + str4;
        else
            final_str = str4;
    }
    if (window.ENV.friendly_error_messages) {
        return to_friendly_message(final_str);
    }
    return final_str;
}

// convert known error messages to friendly error messages if possible
function to_friendly_message(str: string): string {
    const lwr_str = str.toLowerCase();
    if (lwr_str.indexOf("network error") >= 0) {
        return "cannot connect to SimSage (network error)"
    } else if (lwr_str.indexOf("session timed out") >= 0 || lwr_str.indexOf("session expired") >= 0) {
        return "SimSage session timed out."
    } else if (lwr_str.indexOf("ip-address changed") >= 0) {
        return "Security: invalid session (ip-address changed)."
    } else if (lwr_str.indexOf("entity named") >= 0 && lwr_str.indexOf("invalid filter") >= 0) {
        const i1 = lwr_str.indexOf("\"entity: ")
        if (i1 > 0) {
            const i2 = lwr_str.indexOf("\"", i1 + 2)
            if (i2 > i1) {
                return "unknown entity: \"" + lwr_str.substring(i1 + 9, i2) + "\".  Please check the \"Advanced query syntax\" documentation from the menu."
            }
        }
        return "query: unknown entity, name not found"

    } else if (lwr_str.indexOf("\"source: ") >= 0 && lwr_str.indexOf("invalid filter") >= 0) {
        const i1 = lwr_str.indexOf("\"source: ")
        if (i1 > 0) {
            const i2 = lwr_str.indexOf("\"", i1 + 2)
            if (i2 > i1) {
                return "unknown source: \"" + lwr_str.substring(i1 + 9, i2) + "\".  Please check the \"Advanced query syntax\" documentation from the menu."
            }
        }
        return "query: unknown source, name not found."

    } else if (lwr_str.indexOf("command timed out") >= 0) {
        if (lwr_str.indexOf("parsequerytextcmd") >= 0) {
            return "SimSage's language system timed-out. (parser)";
        } else if (lwr_str.indexOf("querysummarizationopenaicmd") >= 0 ||
            lwr_str.indexOf("queryanswerquestionopenaicmd") >= 0) {
            return "SimSage's AI system timed-out.";
        } else if (lwr_str.indexOf("semanticsearchcmd") >= 0) {
            return "SimSage's search system timed-out.";
        } else if (lwr_str.indexOf("spellingsuggestcmd") >= 0) {
            return "SimSage's language system timed-out (spell-checker)";
        } else {
            return str
        }
    } else if (lwr_str.indexOf("invalid query expression") >= 0) {
        return "SimSage does not understand your question, change your question by removing " +
            "any punctuation and/or brackets you might have used.";
    }
    return str;
}

// return a set of headers with or without a session-id for SimSage communications
export function get_headers(session_id?: string): HeadersConfig {
    if (session_id) {
        const api_version = window.ENV.api_version;
        return {
            headers: {
                "API-Version": api_version,
                "Content-Type": "application/json",
                "session-id": session_id,
            }
        };
    }
    return {
        headers: {
            "API-Version": window.ENV.api_version,
            "Content-Type": "application/json"
        }
    };
}

// Extract the child part of an archive URL
export function get_archive_child(url: string): string {
    if (url && url.indexOf(archive_separator) >= 0) {
        const parts = url.split(archive_separator);
        if (parts.length > 1) {
            return parts[1];
        }
    }
    return url;
}

// Extract the last part of an archive URL
export function get_archive_child_last(url: string): string {
    if (url && url.indexOf(archive_separator) >= 0) {
        const parts = url.split(archive_separator);
        if (parts.length > 1) {
            const child_parts = parts[1].split('/');
            if (child_parts.length > 0) {
                return child_parts[child_parts.length - 1];
            }
            return parts[1];
        }
    }
    return url;
}

// Extract the parent part of an archive URL
export function get_archive_parent(url: string): string {
    if (url && url.indexOf(archive_separator) >= 0) {
        const parts = url.split(archive_separator);
        if (parts.length > 0) {
            return parts[0];
        }
    }
    return url;
}

// Check if a URL is an archive file
export function is_archive_file(url: string): boolean {
    return !!(url && url.indexOf(archive_separator) >= 0);
}

// Check if a URL is an archive
export function is_archive(url: string): boolean {
    return !!(url && url.indexOf(archive_separator) >= 0);
}

// Check if a URL is viewable in the browser
export function is_viewable(url: string): boolean {
    if (url) {
        const lwr = url.toLowerCase();
        return lwr.startsWith('http://') || lwr.startsWith('https://');
    }
    return false;
}

// Check if a URL is online
export function is_online(url: string): boolean {
    if (url) {
        const lwr = url.toLowerCase();
        return lwr.startsWith('http://') || lwr.startsWith('https://');
    }
    return false;
}

// Unescape OWASP content
export function unescape_owasp(str: string): string {
    if (str) {
        return str
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, '/');
    }
    return str;
}

// highlight search result text for dangerously set HTML
// also include the OWASP escaping for bad characters
export function highlight(text: string, theme: string): string {
    const primary_theme = (theme === "light" ? "search-primary" : "search-primary-dark")
    const secondary_theme = (theme === "light" ? "search-secondary" : "search-secondary-dark")
    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/javascript:/g, '')
        .replace(/{hl1:}/g, "<span class=\"" + primary_theme + "\">")
        .replace(/{:hl1}/g, "</span>")
        .replace(/{hl2:}/g, "<span class=\"" + secondary_theme + "\">")
        .replace(/{:hl2}/g, "</span>")
}

// Download a document
export function download(url: string, session_id: string): void {
    if (url && session_id) {
        window.open(url, '_blank');
    }
}

// Get the full username
export function get_full_username(user: User): string {
    if (user) {
        if (user.firstName && user.surname) {
            return user.firstName + ' ' + user.surname;
        }
        return user.email || '';
    }
    return '';
}

// Limit text to a certain length
export function limit_text(text: string, max_length: number): string {
    if (text && text.length > max_length) {
        return text.substring(0, max_length) + '...';
    }
    return text || '';
}

// Convert unix time to a readable format
export function time_ago(timestamp: number): string {
    if (timestamp) {
        const now = new Date().getTime();
        const diff = now - timestamp;

        // Convert to seconds
        const seconds = Math.floor(diff / 1000);

        if (seconds < 60) {
            return seconds + ' seconds ago';
        }

        // Convert to minutes
        const minutes = Math.floor(seconds / 60);

        if (minutes < 60) {
            return minutes + ' minutes ago';
        }

        // Convert to hours
        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return hours + ' hours ago';
        }

        // Convert to days
        const days = Math.floor(hours / 24);

        if (days < 30) {
            return days + ' days ago';
        }

        // Convert to months
        const months = Math.floor(days / 30);

        if (months < 12) {
            return months + ' months ago';
        }

        // Convert to years
        const years = Math.floor(months / 12);

        return years + ' years ago';
    }

    return '';
}

// Define the source icons as an object instead of an enum
const SOURCE_ICONS = {
    EGNYTE: img_egnyte,
    AID: img_aid,
    REVIEW_BOARD: img_review_board,
    RELEASE_TRACKER: img_release_tracker,
    AWS: img_aws,
    BOX: img_box,
    XML: img_xml,
    GDRIVE: img_gdrive,
    JIRA: img_jira,
    SLACK: img_slack,
    ZENDESK: img_zendesk,
    CONFLUENCE: img_confluence,
    ALFRESCO: img_alfresco,
    WEB: img_web,
    DISCOURSE: img_discourse,
    SERVICE_NOW: img_service_now,
    BUGS: img_bugs,
    OFFICE: img_office,
    SHAREPOINT: img_sharepoint,
    OUTLOOK: img_outlook,
    ONEDRIVE: img_onedrive,
    DATABASE: img_database,
    RSS: img_rss,
    IMANAGE: img_imanage,
    FILE: img_file,
    DROPBOX: img_dropbox,

    DEFAULT: 'default'
};

// Get the icon source for a source item
export function get_icon_src(source: any): string {
    if (!source || !source.name)
        return SOURCE_ICONS.DEFAULT
    let icon_src = window.ENV.source_icons[source.name.trim().toLowerCase()]
    if (icon_src)
        return icon_src
    if (!source.sourceType)
        return SOURCE_ICONS.DEFAULT
    switch (source.sourceType.toLowerCase()) {
        case 'aws':
            icon_src = SOURCE_ICONS.AWS;
            break;
        case 'jira':
            icon_src = SOURCE_ICONS.JIRA;
            break;
        case 'egnyte':
            icon_src = SOURCE_ICONS.EGNYTE;
            break;
        case 'slack':
            icon_src = SOURCE_ICONS.SLACK;
            break;
        case 'confluence':
            icon_src = SOURCE_ICONS.CONFLUENCE;
            break;
        case 'alfresco':
            icon_src = SOURCE_ICONS.ALFRESCO;
            break;
        case 'localfile':
        case 'file':
        case 'dms':
        case 'sftp':
            icon_src = SOURCE_ICONS.FILE;
            break;
        case 'sharepoint365':
        case 'sharepoint':
            icon_src = SOURCE_ICONS.SHAREPOINT;
            break;
        case 'exchange365':
        case 'exchange':
            icon_src = SOURCE_ICONS.OUTLOOK;
            break;
        case 'onedrive':
            icon_src = SOURCE_ICONS.ONEDRIVE;
            break;
        case 'dropbox':
            icon_src = SOURCE_ICONS.DROPBOX;
            break;
        case 'database':
        case 'structured':
            icon_src = SOURCE_ICONS.DATABASE;
            break;
        case 'servicenow':
            icon_src = SOURCE_ICONS.SERVICE_NOW;
            break;
        case 'imanage':
            icon_src = SOURCE_ICONS.IMANAGE;
            break;
        case 'restfull':
        case 'rss':
            icon_src = SOURCE_ICONS.RSS;
            break;
        case 'box':
            icon_src = SOURCE_ICONS.BOX;
            break;
        case 'web':
            icon_src = SOURCE_ICONS.WEB;
            break;
        case 'xml':
            icon_src = SOURCE_ICONS.XML;
            break;
        case 'gdrive':
            icon_src = SOURCE_ICONS.GDRIVE;
            break;
        case 'discourse':
            icon_src = SOURCE_ICONS.DISCOURSE;
            break;
        case 'zendesk':
            icon_src = SOURCE_ICONS.ZENDESK;
            break;
        default:
            icon_src = SOURCE_ICONS.DEFAULT;
            break;
    }
    return icon_src ?? SOURCE_ICONS.DEFAULT
}

// Get source for a result
export function get_source_for_result(result: any, source_list: any[]): any {
    if (result && source_list && source_list.length > 0) {
        for (const source of source_list) {
            if (source.sourceId === result.sourceId) {
                return source;
            }
        }
    }
    return null;
}

// Remove source name from search text
export function remove_source_name(search_text: string, name: string): string {
    if (search_text && name) {
        // Remove source(name) from search text
        const regex = new RegExp(`source\\(${name}\\)`, 'gi');
        return search_text.replace(regex, '').trim();
    }
    return search_text;
}

// Preview image URL
export function preview_image_url(session_id: string, result: any): string {
    if (result && result.urlId) {
        // Return preview image URL
        return window.ENV.api_base + "/document/preview/" + window.ENV.organisation_id + "/" +
            getKbId() + "/" + get_client_id() + "/" + session_id + "/" + result.urlId;
    }
    return '';
}

// Convert unix timestamp to a readable date format
export function unix_time_convert(unix_timestamp: number): string {
    if (unix_timestamp) {
        const date = new Date(unix_timestamp);
        return date.toLocaleDateString();
    }
    return '';
}

// explain the semantic metadata names with a more compelling label
function translate_metadata_name(name: string): string {
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
    if (name === "{created}") return "created";
    if (name === "{language}") return "document language";
    if (name === "{lastmod}") return "last modified";
    return name;
}

// return the list of hashtags and other metadata in a metadata_set
export function get_metadata_list(metadata_set: any): any {
    const metadata = metadata_set ? metadata_set : {};
    const metadata_list = [];
    for (const [key, value] of Object.entries(metadata)) {
        if (key === "{hashtag}" && value) {
            metadata_list.push({"key": translate_metadata_name("hashtag"), "value": value});

        } else if (key === "{created}" || key === "{lastmod}") {
            const dt_str = (typeof value === 'string') ? unix_time_convert(parseInt(value)) : undefined;
            if (dt_str)
                metadata_list.push({"key": translate_metadata_name(key), "value": dt_str});
            else
                metadata_list.push({"key": translate_metadata_name(key), "value": value});

            // filter out url, title and user-metadata
        } else if (key !== "{url}" && key !== "{title}" && key !== "hashtag" && key.indexOf(user_metadata_marker) !== 0) {
            metadata_list.push({"key": translate_metadata_name(key), "value": value});
        }
    }
    metadata_list.sort((a, b) => (a.key > b.key) ? 1 : -1);
    return {"metadata_list": metadata_list};
}

// return the list user defined metadata from the metadata set
export function get_user_metadata_list(metadata_set: any): {key: string, value: any}[] {
    const metadata = metadata_set ? metadata_set : {};
    const user_metadata_list = [];
    for (const [key, value] of Object.entries(metadata)) {
        if (key.indexOf(user_metadata_marker) === 0) {
            user_metadata_list.push({key: key, value: value});
        }
    }
    user_metadata_list.sort((a, b) => (a.key > b.key) ? 1 : -1);
    return user_metadata_list
}

/**
 * turn a string into a stream of tokens
 *
 * @param str the string to tokenize
 * @returns a list of tokens, or an empty list
 */
export function tokenize(str: string): string[] {
    const token_list: string[] = [];
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
function skip_tokens(i: number, token_list: string[]): number {
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
export function get_text_search(query: string): string {
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

        } else { // @ts-ignore
            if (token !== ")" && token !== "(" && token !== "or") {
                        search_text_list.push(token);
                        i += 1;

                    } else {
                        i += 1;
                    }
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
export function get_doc_types(query: string): string[] {
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
export function get_source_set(query: string): {[key: string]: boolean} {
    const token_list = tokenize(query);
    let get_source_set: {[key: string]: boolean} = {};
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
 * get the metadata and other data setters from the query string
 * look for a query string, a source-id set and a set of document-type filters
 *
 */
export function setup_query_parameter_state(source_list: SourceItem[]): any | null {
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
        const metadata_values: {[key: string]: {[key: string]: boolean}} = {};
        const document_type_list = get_doc_types(query);
        if (document_type_list.length > 0) {
            num_metadata_values += 1;
            const values: {[key: string]: boolean} = {};
            for (const dt of document_type_list) {
                values[dt] = true;
            }
            has_search_parameters = true;
            metadata_values["document-type"] = values;
        }
        let num_source_values = 0;
        const source_values: {[key: string]: boolean} = {};
        const source_id_set = get_source_set(query);
        for (const source of source_list) {
            if (source_id_set[source.sourceId]) {
                has_search_parameters = true;
                num_source_values += 1;
                source_values[source.sourceId] = true;
            }
        }
        if (num_source_values > 0) {
            data = {...data, source_values: source_values}
        }

        if (num_metadata_values > 0) {
            data = {...data, metadata_values: metadata_values};
        }

        if (has_search_parameters)
            return data;
    }
    return null;
}


// Language lookup object
export const language_lookup: Record<string, string> = {
    "en": "🇬🇧 English",
    "dk": "🇩🇰 Danish",
    "no": "🇳🇴 Norwegian",
    "se": "🇸🇪 Swedish",
    "fi": "🇫🇮 Finnish",
    "nl": "🇳🇱 Dutch",
    "de": "🇩🇪 German",
    "pl": "🇵🇱 Polish",
    "fr": "🇫🇷 French",
    "es": "🇪🇸 Spanish",
    "it": "🇮🇹 Italian",
    "tr": "🇹🇷 Turkish",
    "el": "🇬🇷 Greek",
    "pt": "🇵🇹 Portuguese",
    "ar": "🇸🇦 Arabic",
    "ko": "🇰🇵 Korean",
    "ja": "🇯🇵 Japanese",
    "ru": "🇷🇺 Russian",
    "hi": "🇮🇳 Hindi",
    "af": "🇿🇦 Afrikaans",
    "zh": "🇨🇳 Chinese group",
};

// get a logo for the current user to display in the UX
export function get_enterprise_logo(theme: string): string {
    const customer = window.ENV.customer;
    if (customer === 'arista') {
        return arista
    } else {
        if (theme === "light")
            return es_light
        else
            return es_dark
    }
}

// Convert URL to breadcrumb format
export function url_to_bread_crumb(url: string): string {
    if (!url) return '';

    // Remove protocol
    let breadcrumb = url.replace(/^(https?:\/\/)?(www\.)?/, '');

    // Handle special cases
    if (breadcrumb.startsWith('owa/')) return 'owa';

    // Remove query parameters and fragments
    breadcrumb = breadcrumb.split('?')[0].split('#')[0];

    // Limit length
    if (breadcrumb.length > 50) {
        breadcrumb = breadcrumb.substring(0, 47) + '...';
    }

    return breadcrumb;
}

// Extract hashtags from metadata
export function get_hashtag_list(metadata: Record<string, string>): Array<{key: number, value: string}> {
    const hashtag_list: Array<{key: number, value: string}> = [];

    if (metadata) {
        let index = 0;
        for (const [key, value] of Object.entries(metadata)) {
            if (key.startsWith('#') || (value && value.startsWith('#'))) {
                hashtag_list.push({
                    key: index++,
                    value: value.startsWith('#') ? value : key
                });
            }
        }
    }

    return hashtag_list;
}

// Note: This is a partial conversion of Api.js
// Only the functions needed for authSlice.ts have been converted
// The rest of the file should be converted as needed
