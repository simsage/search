import axios from "axios/index";


// communications common to all components
export class Comms {

    static http_post(url, session_id, payload, fn_success, fn_fail) {
        const api_base = window.ENV.api_base;
        console.log('POST ' + api_base + url);
        axios.post(api_base + url, payload, Comms.getHeaders(session_id))
            .then(function (response) {
                if (fn_success) {
                    fn_success(response);
                }
            })
            .catch(function (error) {
                if (fn_fail) {
                    if (error.response === undefined) {
                        fn_fail('Servers not responding or cannot contact Servers');
                    } else {
                        fn_fail(Comms.get_error(error));
                    }
                }
            });
    };

    static http_put(url, session_id, payload, fn_success, fn_fail) {
        const api_base = window.ENV.api_base;
        console.log('PUT ' + api_base + url);
        axios.put(api_base + url, payload, Comms.getHeaders(session_id))
            .then(function (result) {
                if (fn_success) {
                    fn_success(result);
                }
            })
            .catch(function (error) {
                if (fn_fail) {
                    if (error.response === undefined) {
                        fn_fail('Servers not responding or cannot contact Servers');
                    } else {
                        fn_fail(Comms.get_error(error));
                    }
                }
            });
    };

    static http_get(url, session_id, fn_success, fn_fail) {
        return axios.get(window.ENV.api_base + url, Comms.getHeaders(session_id))
            .then(function (response) {
                if (fn_success) {
                    fn_success(response);
                }
            })
            .catch((error) => {
                if (fn_fail) {
                    if (error.response === undefined) {
                        fn_fail('Servers not responding or cannot contact Servers');
                    } else {
                        fn_fail(Comms.get_error(error));
                    }
                }
            });
    };

    static http_get_jwt(url, jwt, fn_success, fn_fail) {
        const api_base = window.ENV.api_base;
        if (url !== '/stats/stats/os') {
            console.log('GET ' + api_base + url);
        }
        return axios.get(api_base + url,{
            headers: {"API-Version": window.ENV.api_version, "Content-Type": "application/json", "jwt": jwt,}
        })
            .then(function (response) {
                if (fn_success) {
                    fn_success(response);
                }
            })
            .catch((error) => {
                if (fn_fail) {
                    if (error.response === undefined) {
                        fn_fail('Servers not responding or cannot contact Servers');
                    } else {
                        fn_fail(Comms.get_error(error));
                    }
                }
            });
    };

    static http_delete(url, session_id, fn_success, fn_fail) {
        const api_base = window.ENV.api_base;
        console.log('DELETE ' + api_base + url);
        axios.delete(api_base + url, Comms.getHeaders(session_id))
            .then(function (response) {
                if (fn_success) {
                    fn_success(response);
                }
            })
            .catch(function (error) {
                if (fn_fail) {
                    if (error === undefined || error.response === undefined) {
                        fn_fail('Servers not responding or cannot contact Servers');
                    } else {
                        fn_fail(Comms.get_error(error));
                    }
                }
            });
    };

    static toUrl(str) {
        return window.ENV.api_base + str;
    }

    // convert js response to its error output equivalent
    static get_error(error) {
        if (typeof error === "string" && error.indexOf("{") === 0) {
            const obj = JSON.parse(error);
            if (obj && obj["response"] && obj["response"]["data"] && obj["response"]["data"]["error"]) {
                return obj["response"]["data"]["error"];
            } else {
                return error;
            }
        } else {
            if (error && error["response"] && error["response"]["data"] && error["response"]["data"]["error"]) {
                return error["response"]["data"]["error"];
            } else {
                return error;
            }
        }
    }

    // get a pretty formatted ISO date string (date only)
    static getISODate() {
        const a = new Date();
        const year = a.getFullYear();
        const month = a.getMonth() + 1;
        const date = a.getDate();
        return year + '-' + month + '-' + date;
    };


    // get a url that can be used to get a zip archive of a wp export
    static download_document(session_id, dl_url) {
        const url = window.ENV.api_base + '/dms/binary/latest/' + encodeURIComponent(window.ENV.organisation_id) + '/' +
                    encodeURIComponent(window.ENV.kb_id) + '/' + btoa(decodeURI(encodeURIComponent(dl_url)));
        Comms.do_fetch(url, session_id);
    };

    // redact a document given an entity-type-list (semantics) and return a redacted PDF for this item
    static redact_document(session_id, dl_url, entity_type_list, additional_words, never_redact, fn_success, fn_fail) {
        // /document/redact/{organisationId}/{kbId}/{url}/{entityCsv}
        const url = window.ENV.api_base + '/language/redact/' + encodeURIComponent(window.ENV.organisation_id) + '/' +
                    encodeURIComponent(window.ENV.kb_id) + '/' + btoa(decodeURI(encodeURIComponent(dl_url))) + '/' +
                    encodeURIComponent(entity_type_list) + '/' + encodeURIComponent(additional_words) + '/' +
                    encodeURIComponent(never_redact);
        Comms.do_fetch(url, session_id);
    };


    // fetch helper
    static do_fetch(url, session_id, fn_success, fn_fail) {
        if (!session_id || session_id.length === 0)
            session_id = "";

        fetch(url, {headers:{"session-id": session_id}} )
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
                    fn_fail(Comms.get_error(error));
                }
            }
        });
    }


    // get a url that can be used to get a zip archive of a wp export
    static download_document_version(session_id, dl_url, version) {
        Comms.http_put('/auth/ott/' + encodeURIComponent(window.ENV.organisation_id), session_id, {}, (response) => {
            const url = window.ENV.api_base + '/search/binary/' + encodeURIComponent(window.ENV.organisation_id) + '/' +
                encodeURIComponent(window.ENV.kb_id) + '/' + btoa(unescape(encodeURIComponent(dl_url))) + '/' + encodeURIComponent(version);
            Comms.download_new_window_post(url, response.data);
        });
    };

    // download the url in a new window, passing SessionId as a query-string parameter (hidden in logs over ssh)
    static download_new_window_post(url, one_time_token) {
        // Create a form
        const mapForm = document.createElement("form");
        mapForm.style = "display: none;";
        mapForm.target = "_blank";
        mapForm.method = "POST";
        mapForm.action = url + "?ott=" + encodeURIComponent(one_time_token);
        // create a fake element so it posts
        const mapInput = document.createElement("input");
        mapInput.type = "text";
        mapInput.name = "name";
        mapInput.value = "value";
        mapForm.appendChild(mapInput);
        document.body.appendChild(mapForm);
        mapForm.submit();
    }


    static getHeaders(session_id) {
        if (session_id && session_id.length > 0) {
            return {
                headers: {
                    "API-Version": window.ENV.api_version,
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

}

export default Comms;
