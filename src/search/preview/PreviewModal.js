import React from 'react';

import './PreviewModal.css';
import {download, get_archive_child, get_metadata_list, is_archive, is_viewable} from "../../common/Api";
import {useDispatch, useSelector} from "react-redux";
import {close_preview, get_preview_html} from "../../reducers/searchSlice";
import useInfiniteScroll from "react-infinite-scroll-hook";
import * as Api from "../../common/Api";

/**
 * this is the PreviewModal
 */
export function PreviewModal() {
    const dispatch = useDispatch();
    const {search_focus, busy, html_preview_list, has_more_preview_pages} = useSelector((state) => state.searchReducer);
    const {session} = useSelector((state) => state.authReducer);

    let url_id = search_focus && search_focus.urlId ? search_focus.urlId : 0;
    if (search_focus && search_focus.relatedUrlId) {
        url_id = search_focus.relatedUrlId;
    }

    // get an html page for the given url_id
    function get_html_page() {
        if (url_id > 0)
            dispatch(get_preview_html({session: session, url_id: url_id, html_preview_list: html_preview_list}));
    }

    const [sentryRef] = useInfiniteScroll({
        loading: busy,
        hasNextPage: has_more_preview_pages,
        onLoadMore: () => get_html_page(),
        // When there is an error, we stop infinite loading.
        // It can be reactivated by setting "error" state as undefined.
        disabled: busy,
        // `rootMargin` is passed to `IntersectionObserver`.
        // We can use it to trigger 'onLoadMore' when the sentry comes near to become
        // visible, instead of becoming fully visible on the screen.
        rootMargin: '0px 0px 400px 0px',
    });

    function on_close() {
        dispatch(close_preview());
    }

    const filename = search_focus && search_focus.filename ? search_focus.filename : "";
    // Prefer the metadata url to the doc's url as the later might be the source id (Sharepoint)
    const url = search_focus && search_focus.metadata && search_focus.metadata["{url}"] &&
                search_focus.metadata["{url}"].trim().length > 0 ? search_focus.metadata["{url}"] :
                (search_focus.url ? search_focus.url : search_focus.relatedUrl);
    const is_online_view = is_viewable(url);

    const preview_data = html_preview_list && html_preview_list.length > 0 ? html_preview_list[0] : null;

    let w = preview_data && preview_data.width ? (preview_data.width) : 0;
    let h = preview_data && preview_data.height ? (preview_data.height) : 0;

    // get the metadata
    const metadata_return = get_metadata_list(search_focus && search_focus.metadata ? search_focus.metadata : {});
    let metadata_list = metadata_return["metadata_list"];
    // const tag_list = metadata_return["tag_list"];
    if (url_id) {
        metadata_list.push({"key": "urlId", "value": "" + url_id});
    }
    if (url) {
        metadata_list.push({"key": "url", "value": "" + url});
    }

    const scale = 1.0;
    if (w < window.ENV.preview_min_width) w = window.ENV.preview_min_width;
    w = Math.round(w) + "px";
    const parent_height = (Math.round(h * scale) + 10) + "px";
    if (h < window.ENV.preview_min_height) h = window.ENV.preview_min_height;
    h = Math.round(h) + "px";

    const session_id = (session && session.id) ? session.id : "";

    return (
        <div id="preview"
             className={"d-flex justify-content-center align-items-top overflow-auto h-100 w-100 " + (busy ? "wait-cursor" : "")}>
            <div className="fixed-top text-white px-4 py-3"
                 style={{"backgroundImage": "linear-gradient(#202731ff, #20273100)"}}>
                <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 w-50" style={{"textShadow": "0 0 50px #202731", "overflow" : "hidden" }} title={filename}>
                            {filename}</h6>
                    <div className="d-flex" style={{color: "#fff"}}>
                        { (is_online_view || !Api.is_archive(url)) &&
                        <button className="btn dl-btn ms-2" disabled={busy} onClick={() => download(url, session_id)}
                                title={is_online_view ? ("visit " + url + " online") : ("download " + get_archive_child(url) + " from SimSage")}>
                            {is_online_view ? "Visit" : "Download"}
                        </button>
                        }
                        <button className="btn pre-btn ms-2">
                            <img src="images/icon_im-close-white.svg" alt="close" title="close" className="image-close"
                                 onClick={() => on_close()}/>
                        </button>
                    </div>
                </div>
            </div>

            <div className="container-fluid px-0 mx-0 h-100 overflow-hidden">
                <div className="row mx-0 h-100">
                    <div className="col-9 justify-content-center h-100 overflow-auto preview-cont">
                        <div className="w-100 h-100" style={{"marginTop": "6rem", "marginBottom": "6rem"}}>
                            {html_preview_list && html_preview_list.map((preview_data, i) => {
                                // add keydown listener to body to message us. We add tabindex as body won't receive keydown otherwise
                                const html = preview_data.html.replace("<body", "<body tabindex='0' style='height: 100vh;' onkeydown='parent.window.postMessage(event.key);' ")
                                return (
                                    <div className="d-flex justify-content-center" key={i}
                                         style={{height: parent_height}}>
                                        <div style={{"width": w, "height": h}}>
                                            <iframe title="preview" className="rounded-3 scaled-iframe" srcDoc={html}
                                                    allowTransparency="false"
                                                    style={{
                                                        "backgroundColor": "Snow",
                                                        "transform": "scale(" + scale + ")",
                                                        "transformOrigin": "center top",
                                                    }}
                                                    height={h + 'px'}
                                                    width={w + 'px'}
                                                    frameBorder="0"
                                                    scrolling="no"
                                            />
                                        </div>
                                    </div>
                                )
                            })}

                            { /* infinite scrolling */}
                            {(busy || has_more_preview_pages) &&
                                <div ref={sentryRef}>
                                    Loading...
                                </div>
                            }

                        </div>
                    </div>
                    <div className="col-3 overflow-auto h-100 preview-cont"
                         style={{"background": "#20273180", "borderTopLeftRadius": "0.3rem"}}>
                        <div className="text-light fw-lighter ps-4 pe-3"
                             style={{"marginTop": "6rem", "marginBottom": "6rem"}}>
                            Metadata
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
                </div>
            </div>
        </div>
    )
}

