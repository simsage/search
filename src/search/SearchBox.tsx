import React, {useEffect, useRef, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    add_search_favourite,
    delete_search_favourite,
    get_search_suggestions,
    update_search_text
} from "../reducers/searchSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { get_url_search_parameters_as_map, limit_text } from "../common/Api";
import { RootState, AppDispatch } from '../store';
import './SearchBox.css';

import icon_search from "../assets/images/ui/icon_n-search.svg";
import icon_search_dark from "../assets/images/ui/icon_n-search-dark.svg";
import {SearchSuggestion} from "../types";
import LanguageSelector from "../common/LanguageSelector";

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
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const { search_text, search_suggestion_list, search_favourite_list, theme } =
        useSelector((state: RootState) => state.searchReducer);
    const {session} = useSelector((state: RootState) => state.authReducer)
    const [has_focus, setHasFocus] = useState<boolean>(false);
    const [activeIndex, setActiveIndex] = React.useState<number>(-1);

    useEffect(() => {
        setActiveIndex(-1);
    }, [search_text]);


    function execute_search(search_text: string) {
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

    function search(): void {
        setHasFocus(false)
        if (props.on_search) props.on_search();
    }

    function update_text(text: string): void {
        dispatch(update_search_text(text));
        if (text.trim().length > 1) {
            dispatch(get_search_suggestions({session, text}));
        }
    }

    function on_suggestion_click(text: string): void {
        dispatch(update_search_text(text));
        if (props.on_search_text) props.on_search_text(text);
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


    // Toggle Favorite function
    const toggle_favorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!search_text.trim()) return;

        if (search_favourite_list.includes(search_text)) {
            dispatch(delete_search_favourite({session: session, text: search_text}));
        } else {
            dispatch(add_search_favourite({session: session, text: search_text}));
        }
    };

    // Helper to get filtered favorites based on current input
    const get_filtered_favorites = () => {
        if (search_text.length < 2) return search_favourite_list;
        return search_favourite_list.filter(f => f.toLowerCase().startsWith(search_text.toLowerCase()));
    };

    function get_search_suggestion_list(): SearchSuggestion[] {
        const favourites = get_filtered_favorites()
        return search_suggestion_list.filter(
            (suggestion: SearchSuggestion) => {
                return (suggestion.queryText.length >= search_text.length || search_text.length === 2) &&
                    favourites.indexOf(suggestion.queryText) === -1 && search_text.length >= 2
            }
        );
    }

    const combined_list = [
        ...get_filtered_favorites().map(f => ({ queryText: f, isFavorite: true })),
        ...get_search_suggestion_list().map(s => ({ ...s, isFavorite: false }))
    ];

    function search_keydown(event: React.KeyboardEvent<HTMLInputElement>): void {
        setHasFocus(true)
        if (!combined_list.length) {
            if (event.key === "Enter") execute_search(search_text);
            return;
        }

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault(); // Prevent cursor moving in input
                setActiveIndex(prev =>
                    prev < combined_list.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                event.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                setHasFocus(false)
                if (activeIndex !== -1) {
                    event.preventDefault();
                    const selectedText = combined_list[activeIndex].queryText;
                    on_suggestion_click(selectedText);
                } else {
                    execute_search(search_text)
                }
                break;
            case "Escape":
                const obj = inputRef.current as any
                obj?.blur()
                break;
        }
    }

    const is_current_text_starred = search_favourite_list.includes(search_text);
    const active = theme === "light" ? "active" : "active-dark"
    let search_placeholder = "SimSage search..."
    const customer = window.ENV.customer
    if (customer === "malaghan") search_placeholder = "Malaghan search..."
    if (customer === "icc") search_placeholder = "International Criminal Court search..."
    if (customer === "wcc") search_placeholder = "Wellington City Council search..."
    if (customer === "hemubo") search_placeholder = "Hemubo search..."


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
                        ref={inputRef}
                        type="text" 
                        className="nav-search-input ps-1 pe-3" 
                        id="simsage-search-text"
                        onChange={(event) => update_text(event.target.value)}
                        autoFocus={true}
                        onMouseDown={() => setHasFocus(true)}
                        onKeyDown={(event) => search_keydown(event)}
                        autoComplete="off"
                        onBlur={() => setHasFocus(false)}
                        value={search_text}
                        placeholder={search_placeholder}
                    />
                    {/* STAR UNICODE CHARACTER */}
                    <span
                        className={`star-icon ${is_current_text_starred ? 'active' : ''}`}
                        onClick={toggle_favorite}
                        title="Favorite this search"
                    >
                        {is_current_text_starred ? '★' : '☆'}
                    </span>

                    <LanguageSelector />
                </span>


                {/* 2. Suggestion Dropdown */}
                {has_focus && combined_list.length > 0 && (
                    <ul className={theme === "light" ? "search-suggestions-dropdown" : "search-suggestions-dropdown-dark"}>

                        {combined_list.map((item, index) => (
                            <li
                                key={index}
                                title={item.queryText}
                                className={`suggestion-item ${index === activeIndex ? active : ""}`}
                                onMouseDown={() => on_suggestion_click(item.queryText)}
                                >
                                <span className="suggestion-text">{item.isFavorite ? '★ ' : ''}{limit_text(item.queryText, 100)}</span>
                            </li>
                        ))}
                    </ul>
                )}

            </div>
        </div>
    );
}