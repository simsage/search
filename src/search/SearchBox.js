import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {close_menu} from "../reducers/authSlice";
import {update_search_text} from "../reducers/searchSlice";


/**
 * text search box and magnification button
 *
 */
export function SearchBox(props) {
    const dispatch = useDispatch();

    const {search_text} = useSelector((state) => state.searchReducer);

    function search_keydown(event) {
        if (event.key === "Enter") {
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

    return (
        <div className="justify-content-between col-11 d-flex align-items-center px-4">
            <div className="nav-search-container">
                <div className="inner d-flex align-items-center position-relative add-another-float">
                    <span className="nav-search-icon ms-2 d-flex align-items-center">
                        <img src="images/icon_n-search.svg" alt="search" title="search" onClick={() => search() } />
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
        </div>
    )
}

