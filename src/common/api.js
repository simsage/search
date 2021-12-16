import {Comms} from "../common/comms";

// api wrappers
export class Api {

    static defined(value) {
        return (value !== null && value !== undefined);
    }

    // generate a guid
    static createGuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    static formatSizeUnits(bytes) {
        if      (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + " GB"; }
        else if (bytes >= 1048576)    { bytes = (bytes / 1048576).toFixed(2) + " MB"; }
        else if (bytes >= 1024)       { bytes = (bytes / 1024).toFixed(2) + " KB"; }
        else if (bytes > 1)           { bytes = bytes + " bytes"; }
        else if (bytes === 1)          { bytes = bytes + " byte"; }
        else                          { bytes = "0 bytes"; }
        return bytes;
    };

    // apply the theme to the background of the main page
    static applyTheme(theme) {
        if (theme !== 'light') {
            document.getElementById('ss-body').className = 'dark';
        } else {
            document.getElementById('ss-body').className = 'light';
        }
    }

    // make sure a string doesn't exceed size
    static limitStringLength(str, size) {
        if (str && str.length > size) {
            return str.substring(0, size) + "..." + str.substring(str.length - 4, str.length);
        }
        return str;
    }

    // convert unix timestamp to string if it's for a reasonable time in the future
    static unixTimeConvert(timestamp){
        if (timestamp > 1000) {
            const a = new Date(timestamp);
            const year = a.getUTCFullYear();
            const month = a.getUTCMonth() + 1;
            const date = a.getUTCDate();
            const hour = a.getUTCHours();
            const min = a.getUTCMinutes();
            const sec = a.getUTCSeconds();
            return year + '/' + Api.pad2(month) + '/' + Api.pad2(date) + ' ' + Api.pad2(hour) + ':' + Api.pad2(min) + ':' + Api.pad2(sec);
        }
        return "";
    }

    // convert unix timestamp to string if it's for a reasonable time in the future
    static unixTimeConvertToDate(timestamp){
        if (timestamp > 1000) {
            const a = new Date(timestamp);
            const year = a.getUTCFullYear();
            const month = a.getUTCMonth() + 1;
            const date = a.getUTCDate();
            return year + '/' + Api.pad2(month) + '/' + Api.pad2(date);
        }
        return "";
    }

    // get current time in milli-seconds
    static getSystemTime() {
        return new Date().getTime();
    }

    // get the last part of /
    static getFilenameFromUrl(url) {
        if (url) {
            const li = url.lastIndexOf('/');
            if (li < 0)
                return url;
            else if (li === url.length - 1)
                return 'index.html'
            else
                return url.substring(li + 1);
        }
        return '';
    }

    // get a folder (or path) from a url or unc path
    static folderFromUrl(url) {
        let subPath = url.lastIndexOf('\\') > 0 ? url.replace('\\', '/') : url;
        let lastIndex = subPath.lastIndexOf('/')
        if (lastIndex > 0) {
            return subPath.substring(0, lastIndex + 1)
        }
        return "/"
    }


    // url to path list
    static pathFromUrl(url) {
        const list = [];
        let subPath = url.lastIndexOf('\\') > 0 ? url.replace('\\', '/') : url;
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


    static hasRole(user, role_name_list) {
        if (user && user.roles) {
            for (const role of user.roles) {
                if (role_name_list.indexOf(role.role) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }

    // convert a date object to an iso date string
    static toIsoDate(date){
        if (!date || !date.getFullYear)
            date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return year + '-' + Api.pad2(month) + '-' + Api.pad2(day) + 'T00:00:00.000';
    }

    static pad2(item) {
        return ("" + item).padStart(2, '0');
    }

    // reset a password (do it)
    static resetPassword(email, newPassword, reset_id, success, fail) {
        if (email && email.length > 0 && newPassword.length > 0) {
            const payload = {"email": email, "password": newPassword, "resetId": reset_id};
            Comms.http_post('/auth/reset-password', null, payload,
                (response) => { success(response.data.session, response.data.user) },
                (errStr) => { fail(errStr) }
            )
        }
        else{
            fail('please complete and check all fields');
        }
    };

    // get the user object (or null if dne)
    static getUser() {
        var user = localStorage.getItem("user");
        if (user && user.startsWith("{")) {
            return JSON.parse(user);
        }
        return null;
    }

    // upload data to the system
    static uploadDocument(payload, success, fail) {
        Comms.http_put('/document/upload', null, payload,
            (response) => { success(response.data) },
            (errStr) => { fail(errStr) }
        )
    };

    // write text to the clipboard, if we can
    static writeToClipboard(text) {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text);
            return true;
        }
        return false;
    }

    // highlight search result text
    static highlight(text) {
        return text
                .replace(/{hl1:}/g, "<span class=\"search-primary\">")
                .replace(/{:hl1}/g, "</span>")
                .replace(/{hl2:}/g, "<span class=\"search-secondary\">")
                .replace(/{:hl2}/g, "</span>");
    }

    // return the list of hash-tags and other metadata in a metadata_set
    static getMetadataLists(metadata_set) {
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
                metadata_list.push({"key": key, "value": value});
            }
        }
        return {"tag_list": tag_list, "metadata_list": metadata_list};
    }

    // map the type, or if absent, the . extension of a url to a type or return default if none can be found
    static urlToType(type, url) {
        let e = type;
        if (!e || e.length === 0) {
            const i = url.lastIndexOf(".");
            e = url.substring(i + 1).toLowerCase().trim();
        }
        if (e) {
            if (e === "xls" || e === "xlsx" || e === "ods") return "spreadsheet";
            if (e === "pdf") return "pdf";
            if (e === "ttf" || e === "fnt" || e === "otf") return "font";
            if (e === "html" || e === "css" || e === "js" || e === "php" || e === "py") return "code";
            if (e === "cad" || e === "3ds" || e === "ply" || e === "stl" || e === "obj") return "3d";
            if (e === "wav" || e === "mp3" || e === "aiff" || e === "weba" || e === "snd") return "audio";
            if (e === "msg" || e === "mbx" || e === "eml") return "email";
            if (e === "jpg" || e === "jpeg" || e === "png" || e === "bmp" || e === "gif" || e === "tif" ||
                e === "tiff" || e === "svg" || e === "ico") return "image";
            if (e === "ppt" || e === "pptx") return "presentation";
            if (e === "mp4" || e === "mov" || e === "mpeg" || e === "mpg" || e === "mkv" ||
                e === "avi" || e === "webv") return "video";
            if (e === "csv" || e === "mdb" || e === "cfg" || e === "xml" || e === "json") return "data";
            if (e === "log" || e === "sh" || e === "bat" || e === "exe" || e === "cmd") return "system";
            if (e === "zip" || e === "tgz" || e === "tar" || e === "gz" || e === "7z" || e === "rar") return "compressed";
            if (e === "txt" || e === "text" || e === "rtf" || e === "utf8" || e === "odt" || e === "doc" ||
             e === "docx") return "text";
        }
        return "default";
    }

    // convert a source-type (SimSage Source.CT_ ...) to a icon_ci-...svg type
    static sourceTypeToIcon(source_type) {
        if (source_type === "database") return "database";
        if (source_type === "office365") return "office";
        if (source_type === "dropbox") return "dropbox";
        if (source_type === "wordpress") return "wordpress";
        if (source_type === "file" || source_type === "search") return "drive";
        if (source_type === "gdrive") return "drive";
        if (source_type === "nfs") return "nfs";
        if (source_type === "restfull") return "rss";
        if (source_type === "rss") return "rss";
        return "web"; // fallback
    }

    // convert a source-type (SimSage Source.CT_ ...) to a text-name
    static sourceTypeToName(source_type) {
        if (source_type === "database") return "Database Crawler";
        if (source_type === "office365") return "Office365 Crawler";
        if (source_type === "dropbox") return "Dropbox Crawler";
        if (source_type === "wordpress") return "WordPress Crawler";
        if (source_type === "search") return "DMS Source";
        if (source_type === "file") return "File Crawler";
        if (source_type === "gdrive") return "GoogleDrive Crawler";
        if (source_type === "nfs") return "NFS File Crawler";
        if (source_type === "restfull") return "Restful Crawler";
        if (source_type === "rss") return "RSS Crawler";
        return "Web Crawler"; // fallback
    }

    // convert a notification-type (SimSage DocumentAudit.DMS_ ...) to a icon_rs-...svg type
    static notificationTypeToIcon(notification_type) {
        if (notification_type === "document") return "share";
        if (notification_type === "folder") return "share";
        if (notification_type === "bookmark") return "tag";
        if (notification_type === "note") return "comment";
        if (notification_type === "subscription") return "tag";
        if (notification_type === "lock") return "locked";
        return "comment"; // fallback
    }

    static s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    static guid() {
        return Api.s4() + Api.s4() + '-' + Api.s4() + '-' + Api.s4() + '-' + Api.s4() + '-' + Api.s4() + Api.s4() + Api.s4();
    }

    static has_local_storage() {
        try {
            let test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    }

    static getClientId() {
        let clientId = "";
        let key = 'simsearch_search_client_id';
        let hasLs = Api.has_local_storage();
        if (hasLs) {
            clientId = localStorage.getItem(key);
        }
        if (!clientId || clientId.length === 0) {
            clientId = Api.guid(); // create a new client id
            if (hasLs) {
                localStorage.setItem(key, clientId);
            }
        }
        return clientId;
    }

    // get an anonymous or signed-in session
    static getSessionId(session) {
        if (session && session.id)
            return session.id;
        return "";
    }

    // get an anonymous or signed-in user's id
    static getUserId(user) {
        if (user && user.id)
            return user.id;
        return Api.getClientId();
    }

}

export default Api;
