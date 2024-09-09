import {React, useEffect, useRef, useState} from 'react';

import './PreviewModal.css';
import * as Api from "../../common/Api";
import {download, get_archive_child, get_metadata_list, get_user_metadata_list, is_viewable} from "../../common/Api";
import {useDispatch, useSelector} from "react-redux";
import {close_preview} from "../../reducers/searchSlice";

/**
 * this is the PreviewModal
 */
export function PreviewModal() {
    const dispatch = useDispatch();
    const {search_focus, busy, html_preview_list} = useSelector((state) => state.searchReducer);
    const {session} = useSelector((state) => state.authReducer);

    const wopiRef = useRef(null)

    const wopiUrl = window.ENV.wopi_url
    const wopiApiUrl = window.ENV.wopi_api_url
    const scale = 1.0;

    const [wopiDisplayError, setWopiDisplayError] = useState(false)
    const [show_metadata, setShowMetadata] = useState(false)
    const [is_online_view, setIsOnlineView] = useState(false)
    const [metadata_list, setMetadataList] = useState([])
    const [user_metadata_list, setUserMetadataList] = useState([])
    const [display_type, setDisplayType] = useState('')
    const [session_id, setSessionId] = useState('')
    const [is_archive, setIsArchive] = useState(false)
    const [url, setUrl] = useState('')
    const [w, setWidth] = useState("100px")
    const [h, setHeight] = useState("100px")
    const [local_busy, setLocalBusy] = useState(false)

    useEffect(() => {
        window.addEventListener("message", receiveMessage, false);

        // Prefer the metadata url to the doc's url as the later might be the source id (Sharepoint)
        const url = search_focus && search_focus.metadata && search_focus.metadata["{url}"] &&
            search_focus.metadata["{url}"].trim().length > 0 ? search_focus.metadata["{url}"] :
            (search_focus.url ? search_focus.url : search_focus.relatedUrl);
        setUrl(url);

        const is_online_view = is_viewable(url);
        setIsOnlineView(is_online_view);
        const document_type = search_focus && search_focus.documentType ? search_focus.documentType : '';
        setIsArchive(Api.is_archive(url))

        const preview_data = html_preview_list && html_preview_list.length > 0 ? html_preview_list[0] : null;
        let w = preview_data && preview_data.width ? (preview_data.width) : 0;
        let h = preview_data && preview_data.height ? (preview_data.height) : 0;

        // get the metadata
        const metadata_return = get_metadata_list(
            search_focus && search_focus.metadata ? search_focus.metadata : {}
        )
        let metadata_list = metadata_return["metadata_list"];

        let url_id = search_focus && search_focus.urlId ? search_focus.urlId : 0;
        if (search_focus && search_focus.relatedUrlId) {
            url_id = search_focus.relatedUrlId;
        }
        if (url_id) {
            metadata_list.push({"key": "urlId", "value": "" + url_id});
        }
        if (search_focus && search_focus.title) {
            metadata_list.push({"key": "title", "value": search_focus.title});
        }
        if (url) {
            metadata_list.push({"key": "url", "value": "" + url});
        }
        if (document_type) {
            metadata_list.push({"key": "document type", "value": document_type});
        }
        setMetadataList(metadata_list)

        // user defined metadata
        const user_metadata_list = get_user_metadata_list(
            search_focus && search_focus.metadata ? search_focus.metadata : {}
        )
        setUserMetadataList(user_metadata_list)

        if (w < window.ENV.preview_min_width) w = window.ENV.preview_min_width;
        setWidth("" + Math.round(w) + "px")
        if (h < window.ENV.preview_min_height) h = window.ENV.preview_min_height;
        setHeight("" + Math.round(h) + "px")

        const session_id = (session && session.id) ? session.id : "";
        setSessionId(session_id)

        // can it be displayed by wopi?  or is it something else?
        if (is_archive) {
            setDisplayType('unknown')
        } else if (is_online_view && window.ENV.html_types.indexOf(document_type) >= 0) {
            setDisplayType('html')
        } else if (window.ENV.valid_types.indexOf(document_type) >= 0 || window.ENV.html_types.indexOf(document_type) >= 0) {
            setDisplayType('wopi')
            setLocalBusy(true)
        } else if (window.ENV.video_types.indexOf(document_type) >= 0) {
            setDisplayType('video')
        } else if (window.ENV.audio_types.indexOf(document_type) >= 0) {
            setDisplayType('audio')
        } else {
            setDisplayType('unknown')
        }

        return () => {
            window.removeEventListener("message", receiveMessage, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function on_close() {
        dispatch(close_preview());
    }

    // helper method to post a message
    function post(msg) {
        if (wopiRef.current && wopiRef.current.contentWindow) {
            //console.log("==== sending new message : " + JSON.stringify(msg));
            wopiRef.current.contentWindow.postMessage(JSON.stringify(msg), '*');
        }
    }

    const receiveMessage = (event) => {
        if (typeof event.data === 'string') {
            try {
                if (event.data.length > 2 && event.data[0] === '{' && event.data[event.data.length - 1] === '}') {
                    const msg = JSON.parse(event.data);
                   // eslint-disable-next-line default-case
                    switch (msg.MessageId) {
                        case "App_LoadingStatus" : {
                            if (msg.Values && wopiRef && (msg.Values.Status === "Document_Loaded")) {
                                post({"MessageId": "Host_PostmessageReady"})
                                post({"MessageId": "Hide_Menubar"})   // hide the top menu
                                post({"MessageId": "Show_StatusBar"}) // show search and zoom
                                post({"MessageId": "Action_ChangeUIMode", "Values": {"Mode": "classic"}})
                                setLocalBusy(false)
                            }
                            break
                        }
                        case "Action_Load_Resp" : {
                            if (msg.Values && msg.Values.errorType) {
                                setWopiDisplayError(true)
                            }
                            break
                        }
                    }
                }

            } catch (e) {
                console.log("Error", e)
            }

        }
    }

    const calcWopiUrl = () => {
        if (session && search_focus) {
            // this is sent to /wopi/ on SimSage which sets up all relevant wopi initial settings
            const read_only = "true"
            const docId = window.btoa(unescape(encodeURIComponent(session.organisationId + "|" + search_focus.kbId + "|" + search_focus.url + "|" + read_only)))
            return `${wopiUrl}?WOPISrc=${wopiApiUrl}/files/${docId}&access_token=${session.id}`
        }
        return ""
    }

    // get a title for the icon display if we can't display it in wopi
    const get_special_title = () => {
        const type_str = display_type === 'video' ?
            "video file" : (display_type === 'audio' ?
                "audio file" : (display_type === 'html' ?
                    "web page" : "inaccessible file type"));
        const action_str = is_online_view ? ("visit " + url + " online") : ("download " + get_archive_child(url) + " from SimSage");
        return type_str + ", " + action_str;
    }

    return (
        <div id="preview"
             className={"d-flex justify-content-center align-items-top overflow-auto h-100 w-100 " + ((local_busy || busy) ? "wait-cursor" : "")}>
            <div className="fixed-top text-white px-4 py-3">
                <div className="preview-floating-header">

                    <div style={!show_metadata ?
                        {color: "#fff", background: "#ffffffb0", borderRadius: "10px", padding: "4px", width: "210px", marginTop: "15px"} :
                        {color: "#fff", borderRadius: "10px", padding: "4px", width: "210px", marginTop: "15px"}}>
                        <span className="form-switch" title="toggle metadata display"  style={{marginRight: "10px"}}>
                            { window.ENV.show_preview_metadata &&
                            <input className="form-check-input"
                                   type="checkbox"
                                   title="toggle metadata display"
                                   checked={show_metadata}
                                   onChange={(event) => {
                                       setShowMetadata(!show_metadata)
                                   }}
                            />
                            }
                        </span>
                        {(is_online_view || !is_archive) &&
                            <button className={"btn btn-primary"}
                                    disabled={busy}
                                    onClick={() => download(url, session_id)}
                                    title={is_online_view ? ("visit " + url + " online") : ("download " + get_archive_child(url) + " from SimSage")}>
                                {is_online_view ? "Visit" : "Download"}
                            </button>
                        }
                        <button className="btn pre-btn ms-2">
                            {show_metadata &&
                                <img src="images/icon_im-close-white.svg" alt="close" title="close"
                                     className="image-close"
                                     onClick={() => on_close()}/>
                            }
                            {!show_metadata &&
                                <img src="images/icon_im-close-black.svg" alt="close" title="close"
                                     className="image-close"
                                     onClick={() => on_close()}/>
                            }
                        </button>
                    </div>
                </div>
            </div>

            <div className="container-fluid px-0 mx-0 h-100 overflow-hidden">
                <div className="row mx-0 h-100">
                    {!wopiDisplayError && display_type === 'wopi' &&
                        <iframe title="preview" ref={wopiRef}
                                className={(show_metadata ? "col-9" : "col-12") + " justify-content-center h-100 overflow-auto preview-cont scaled-iframe"}
                                src={calcWopiUrl()}
                                style={{
                                    "backgroundColor": "Snow",
                                    "transform": "scale(" + scale + ")",
                                    "transformOrigin": "center top",
                                }}
                                height={h + 'px'}
                                width={w + 'px'}
                        />
                    }

                    {wopiDisplayError &&
                        <div className={(show_metadata ? "col-9" : "col-12") + " d-flex align-items-center justify-content-center vh-100"}
                             style={{
                                 "backgroundColor": "Snow",
                                 "transform": "scale(" + scale + ")",
                                 "transformOrigin": "center top",
                             }}
                        >
                            <div className={"align-items-center"}>
                                <div ref={wopiRef}>
                                    Document can't be previewed
                                </div>
                            </div>
                        </div>
                    }

                    { (display_type !== 'wopi') &&
                        <div className={(show_metadata ? "col-9" : "col-12") + " d-flex align-items-center justify-content-center vh-100"}
                             style={{"backgroundColor": "Snow",}}>
                            <div className={"align-items-center"} onClick={() => download(url, session_id)}>
                                <div className="row">
                                    <div className="col-2">
                                    <span title={get_special_title(url)}>
                                    {display_type === 'html' &&
                                        <img src="images/html.svg" alt="html" style={{width: "50px"}}/>}
                                        {display_type === 'video' &&
                                            <img src="images/video.svg" alt="video" style={{width: "50px"}}/>}
                                        {display_type === 'audio' &&
                                            <img src="images/audio.svg" alt="audio" style={{width: "50px"}}/>}
                                        {display_type === 'unknown' &&
                                            <img src="images/binary.svg" alt="unknown" style={{width: "50px"}}/>}
                                    </span>
                                    </div>
                                    <div className="col-10">
                                        This document cannot be previewed.<br/>
                                        <span className="link" onClick={() => download(url, session_id)}>Click here</span> to visit this document.
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    { show_metadata &&
                    <div className="col-3 overflow-auto h-100 preview-cont"
                         style={{"background": "#20273180", "borderTopLeftRadius": "0.3rem"}}>

                        <div className="text-light fw-lighter ps-4 pe-3"
                             style={{"marginTop": "6rem"}}>
                            &nbsp;
                        </div>

                        { user_metadata_list && user_metadata_list.length > 0 &&
                        <div className="text-light fw-lighter ps-4 pe-3"
                             style={{"marginBottom": "2rem"}}>
                            <b>User Metadata</b>
                            <br/><br/>
                            {
                                user_metadata_list.map((item, i) => {
                                return (<div key={i} className="metadata-item">
                                <div className="metadata-key">{item.key}</div>
                                {item.key === "url" && is_viewable(item.value) &&
                                    <div className="metadata-value">
                                        <a href={item.value} rel="noreferrer" target="_blank">{item.value}</a>
                                    </div>
                                }
                                {item.key === "url" && !is_viewable(item.value) &&
                                    <div className="metadata-value">{item.value}</div>
                                }
                                {item.key !== "url" && <div className="metadata-value">{item.value}</div>}
                                </div>)
                                })
                            }
                        </div>
                        }

                        <div className="text-light fw-lighter ps-4 pe-3"
                             style={{"marginBottom": "6rem"}}>
                            <b>Metadata</b>
                            <br/><br/>
                            {
                                metadata_list && metadata_list.map((item, i) => {
                                    return (<div key={i} className="metadata-item">
                                        <div className="metadata-key">{item.key}</div>
                                        {item.key === "url" && is_viewable(item.value) &&
                                            <div className="metadata-value">
                                                <a href={item.value} rel="noreferrer" target="_blank">{item.value}</a>
                                            </div>
                                        }
                                        {item.key === "url" && !is_viewable(item.value) &&
                                            <div className="metadata-value">{item.value}</div>
                                        }
                                        {item.key !== "url" && <div className="metadata-value">{item.value}</div>}
                                    </div>)
                                })
                            }
                        </div>
                    </div>
                    }
                </div>
            </div>
        </div>
    )
}

