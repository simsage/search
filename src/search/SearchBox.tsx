import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { close_menu } from "../reducers/authSlice";
import { update_search_text } from "../reducers/searchSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { get_url_search_parameters_as_map } from "../common/Api";
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../store';

import icon_search from "../assets/images/ui/icon_n-search.svg";
import icon_search_dark from "../assets/images/ui/icon_n-search-dark.svg";

/**
 * Props interface for the SearchBox component
 */
interface SearchBoxProps {
    on_search?: () => void;
    on_search_text?: (text: string) => void;
}

/**
 * Text search box and magnification button
 */
export function SearchBox(props: SearchBoxProps): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const { search_text, theme } = useSelector((state: RootState) => state.searchReducer);

    function search_keydown(event: React.KeyboardEvent<HTMLInputElement>): void {
        if (event.key === "Enter") {
            // update search parameter at search time
            const parameterMap = get_url_search_parameters_as_map(window.location.search);
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

    function search(): void {
        if (props.on_search) props.on_search();
    }

    function on_close_menu(): void {
        dispatch(close_menu());
    }

    function update_text(text: string): void {
        dispatch(update_search_text(text));
    }

    // watch location.search (query parameter) changing and search automatically
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query_value = params.get('query') || '';
        if (query_value.trim()) {
            const query_str = query_value.trim();
            dispatch(update_search_text(query_str));
            if (props.on_search_text) {
                props.on_search_text(query_str);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    return (
        <div className={theme === "light" ? "nav-search-container" : "nav-search-container-dark"}>
            <div className="inner d-flex align-items-center position-relative add-another-float">
                <span className="nav-search-icon ms-2 d-flex align-items-center">
                    <img 
                        src={(theme === "light" ? icon_search : icon_search_dark)} 
                        alt="search" 
                        title="search" 
                        onClick={() => search()} 
                    />
                </span>
                <span className="search-bar">
                    <input 
                        type="text" 
                        className="nav-search-input ps-1 pe-3" 
                        id="simsage-search-text"
                        onChange={(event) => update_text(event.target.value)}
                        autoFocus={true}
                        onKeyDown={(event) => search_keydown(event)}
                        autoComplete="off"
                        onFocus={() => on_close_menu()}
                        value={search_text}
                        placeholder={t("search-ellipsis")}
                    />
                </span>
            </div>
        </div>
    );
}