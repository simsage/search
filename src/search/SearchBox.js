import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {close_menu} from "../reducers/authSlice";
import {update_search_text} from "../reducers/searchSlice";
import {useLocation, useNavigate} from "react-router-dom";
import {get_url_search_parameters_as_map} from "../common/Api";


/**
 * text search box and magnification button
 *
 */
export function SearchBox(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const {search_text} = useSelector((state) => state.searchReducer);

    function search_keydown(event) {
        if (event.key === "Enter") {
            // update search parameter at search time
            const parameterMap = get_url_search_parameters_as_map(window.location.search)
            const params = new URLSearchParams();
            const kbId = parameterMap['kbId'] ?? "";
            params.set('query', search_text);
            if (kbId.length > 0) {
                params.set('kbId', kbId);
            }
            navigate(`?${params.toString()}`);
            search();
        }
    }

    function search() {
        if (props.on_search) props.on_search();
    }

    function on_close_menu() {
        dispatch(close_menu());
    }

    function update_text(text) {
        dispatch(update_search_text(text));
    }

    // watch location.search (query parameter) changing and search automatically
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query_value = params.get('query') || '';
        if (query_value.trim()) {
            const query_str = query_value.trim()
            dispatch(update_search_text(query_str))
            if (props.on_search_text) {
                props.on_search_text(query_str);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    return (
        <div className="nav-search-container">
            <div className="inner d-flex align-items-center position-relative add-another-float">
                <span className="nav-search-icon ms-2 d-flex align-items-center">
                    <img src={window.ENV.image_base_name + "/images/icon_n-search.svg"} alt="search" title="search" onClick={() => search() } />
                </span>
                <span className="search-bar">
                    <input type="text" className="nav-search-input ps-1 pe-3" id="simsage-search-text"
                           onChange={(event) => update_text(event.target.value)}
                           autoFocus={true}
                           onKeyDown={(event) => search_keydown(event)}
                           autoComplete={"off"}
                           onFocus={() => on_close_menu()}
                           value={search_text}
                           placeholder="SimSage Search..."/>
                </span>
            </div>
        </div>
    )
}

