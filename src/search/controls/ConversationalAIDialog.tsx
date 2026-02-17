import './ConversationalAIStyles.css';
import React, {useState, useEffect, useRef, ReactElement} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../store";
import {
    do_llm_search,
    set_focus_for_ai_queries,
    move_llm_state_to_history,
    move_llm_history_to_state,
    update_llm_state,
    llm_view,
    set_source_value,
    set_user_query,
    toggle_theme,
    do_llm_search_step2,
    do_llm_search_step3,
    load_llm_history, save_llm_history, clear_llm_history, clear_llm_state,
} from "../../reducers/searchSlice";
import {
    archive_separator,
    copy,
    get_archive_child_last,
    get_full_username,
    get_initials,
    get_source_list,
    highlight
} from "../../common/Api";
import {LLMState, SourceGroup, SearchResult, ConversationItem} from "../../types";
import {useTranslation} from "react-i18next";
import {AIBusy} from "./AIBusy";
import ConfirmMessage from "../../common/ConfirmMessage";

const to_html_text = (result: SearchResult, theme: string): string => {
    let html_str = ""
    for (const text of result.textList) {
        html_str += highlight(text, theme)
        html_str += "<br />"
    }
    return html_str
}

const hamburger = (): ReactElement<any, any> => {
    return (<svg focusable="false" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>)
}

// get the title from either the query document or the state's first entry
const get_recent_title = (llm_state: LLMState): string => {
    if (llm_state.conversationList.length > 0) {
        // try and find the last focus document
        let question_str = llm_state.conversationList[0].content
        let focusSearchResults: SearchResult | undefined
        llm_state.conversationList.forEach((item: ConversationItem) => {
            if (item.searchResult !== undefined) {
                item.searchResult.resultList.forEach((item2: SearchResult) => {
                    if (item2.urlId === llm_state.focus_id) {
                        focusSearchResults = item2
                    }
                })
            }
        })
        if (focusSearchResults && focusSearchResults.title && focusSearchResults.title.length > 0) {
            question_str = focusSearchResults.title
        }
        if (question_str.length > 25) {
            return question_str.substring(0, 25) + " ..."
        }
        return question_str
    }
    return ""
}

const to_url = (result: SearchResult): string => {
    return result.metadata["{url}"] ?? result.url
}

const to_display_url = (result: SearchResult): string => {
    const url = to_url(result);
    if (url.indexOf(archive_separator) > 0) {
        return get_archive_child_last(url)
    }
    return url
}

const SearchResultItem: React.FC<{
    result: SearchResult;
    theme: string;
    isFocus: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    onSetFocus: () => void;
}> = ({ result, theme, isFocus, isExpanded, onToggle, onSetFocus }) => {
    const html_str = to_html_text(result, theme)
    const link_url = to_url(result)
    const display_url = to_display_url(result)
    return (
        <div className={`search-result ${isFocus ? 'is-focus' : ''} ${isExpanded ? 'expanded' : ''}`} data-result-id={"" + result.urlId} style={{"width": "100%"}}>
            <div className="result-header" onClick={onToggle}>
                <span className="search-result-hamburger">{hamburger()}</span><span className="result-title-static">{result.title}</span>
            </div>
            <div className="result-body">
                <p className="result-snippet" dangerouslySetInnerHTML={{ __html: html_str }} />
                <div className="result-body-footer">
                    { result.author.length > 0 &&
                    <p className="result-meta">Author: {result.author}</p>
                    }
                </div>
                <p className="result-meta">
                    url: <a href={link_url} className="ai2-url-link" target="_blank" rel="noopener noreferrer">{display_url}</a>
                </p>
                <button className="focus-button" onClick={onSetFocus}>
                    {isFocus ? 'Focused' : 'Set as Focus'}
                </button>
            </div>
        </div>
    );
};

const SearchResultSet: React.FC<{
    searchResults: SearchResult[];
    theme: string;
    focusId: number | undefined;
    onSetFocus: (id: number) => void;
}> = ({ searchResults, theme, focusId, onSetFocus }) => {
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    const toggleExpanded = (id: number) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    return (
        <div className="search-results-container">
            {searchResults.map(result => {
                const urlId = result.urlId ?? "";
                return (
                    <SearchResultItem
                        key={result.urlId}
                        result={result}
                        theme={theme}
                        isFocus={focusId === urlId}
                        isExpanded={expandedIds.has(urlId)}
                        onToggle={() => toggleExpanded(urlId)}
                        onSetFocus={() => onSetFocus(urlId)}
                    />
                )}
            )}
        </div>
    );
}

const useAppDispatch = () => useDispatch<AppDispatch>();


export function ConversationalAIDialog() {

    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const {
        busy,
        llm_state,
        llm_state_history,
        theme,
        source_list,
        source_values,
        query_ai_focus_document,
        user_query
    } = useSelector((state: RootState) => state.searchReducer);

    const {session, organisation, user} = useSelector((state: RootState) => state.authReducer);

    const isMobile = window.innerWidth <= 850;
    const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 850);

    const [sourceFilter, setSourceFilter] = useState('');
    const [isSourceDropdownOpen, setSourceDropdownOpen] = useState(false);

    const sourceSelectorRef = useRef<HTMLDivElement>(null);
    const lastConversationItemRef = useRef<HTMLDivElement>(null);

    // the actual llm conversation list is in here
    const [focusHtmlText, setFocusHtmlText] = useState<string>("")

    // state history
    const [historyFetched, setHistoryFetched] = useState(false);

    // delete confirmation message
    const [confirm_message, setConfirmMessage] = useState<string | undefined>(undefined);

    // close source drop down with mouse click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sourceSelectorRef.current && !sourceSelectorRef.current.contains(event.target as Node)) {
                setSourceDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // fetch history?
    useEffect(() => {
        if (!historyFetched && session.id.length > 0 && llm_state_history.length === 0) {
            dispatch(load_llm_history({session: session}));
            setHistoryFetched(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [llm_state_history, session.id, historyFetched]);

    // helper: clear document focus
    const clear_target_focus = (): void => {
        dispatch(set_focus_for_ai_queries(undefined));
    }

    // get focus text and focus url for top FOCUS view
    useEffect(() => {
        setFocusHtmlText(query_ai_focus_document ? to_html_text(query_ai_focus_document, theme) : "")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query_ai_focus_document]);

    // helper: set focus id inside our current llm state
    const on_set_llm_state_focus_id = (url_id: number): void => {
        const new_state = copy(llm_state)
        // clear focus?
        if (new_state.focus_id === url_id) {
            new_state.focus_id = 0;
            dispatch(update_llm_state(new_state))
        } else {
            new_state.focus_id = url_id;
            dispatch(update_llm_state(new_state))
        }
    }


    // return true if existing_state isn't inside llm_state_history
    const has_new_state = (existing_state: LLMState): boolean => {
        if (llm_state.conversationList.length > 0) {
            return llm_state_history
                .find((llm_state) =>
                    llm_state.conversationList.length > 0 &&
                    llm_state.conversationList.length === existing_state.conversationList.length &&
                    llm_state.focus_id === existing_state.focus_id &&
                    llm_state.conversationList[0].content === existing_state.conversationList[0].content)
            === undefined
        }
        return true
    }

    // start a new chat message
    const new_chat = () => {
        if (has_new_state(llm_state)) {
            const final_history: LLMState[] = [llm_state]
            for (const history of llm_state_history) {
                final_history.push(history)
            }
            dispatch(save_llm_history({session: session, llmStateList: final_history}));
        }
        dispatch(move_llm_state_to_history())
        clear_target_focus()
    }

    // take an existing chat conversation history item and make it the active one
    const on_move_history_to_live = (item: LLMState) => {
        if (!item.focus_id || item.focus_id === 0) {
            clear_target_focus()
        }
        dispatch(move_llm_history_to_state(item))
    }

    const on_clear_history = () => {
        dispatch(clear_llm_history({session: session}))
        setConfirmMessage(undefined)
    }

    // type / to get the full SimSage search: item and update query string in store
    const change_query = (str: string): void => {
        if (str.trim() === "/")
            str = "SimSage search: ";
        dispatch(set_user_query({"user_query": str}));
    }

    // enter is start search in the type box
    const checkUserKey = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.key === "Enter") {
            do_search(e)
        }
    }

    /**
     * get the last question the user asked from the conversation list
     *
     * @param conversation_list
     * @returns {string}
     */
    const get_user_question = (conversation_list: ConversationItem[]): string => {
        let len = (conversation_list.length ?? 1) - 1;
        let question = "";
        while (len >= 0) {
            if (conversation_list[len].role === "user") {
                question = conversation_list[len].content;
                break;
            }
            len -= 1;
        }
        return question;
    }

    // continue step 2 and 3 searches for this mode
    useEffect(() => {
        if (lastConversationItemRef.current?.lastElementChild) {
            lastConversationItemRef.current.lastElementChild.scrollIntoView();
        }

        // is the last item a Step 2 or Step 3 call?
        if (llm_state.conversationList.length > 0 && !busy) {
            const last_item = llm_state.conversationList[llm_state.conversationList.length - 1];
            if (last_item.step === 1) {
                // do a search
                dispatch(do_llm_search_step2({
                    session: session,
                    prev_conversation_list: llm_state.conversationList.slice(0, llm_state.conversationList.length - 1),
                    question: "SimSage search: " + last_item.searchKeywords,
                    metadata_list: [],
                    metadata_values: {},
                    source_list,
                    source_values
                }));
            } else if (last_item.step === 2) {
                // do a search
                dispatch(do_llm_search_step3({
                    session: session,
                    prev_conversation_list: llm_state.conversationList,
                    question: get_user_question(llm_state.conversationList),
                    search_result: last_item.searchResult
                }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [llm_state, busy]);

    // perform a search with context
    const do_search = (e: any): void => {
        if (user_query.trim().length > 2) {
            e.preventDefault()
            e.stopPropagation()

            // reset focus for a search?
            if (user_query.trim().toLowerCase().startsWith("simsage search")) {
                clear_target_focus()
            }

            // set up query focus if present
            const document_url = query_ai_focus_document ? query_ai_focus_document.url : ""
            let metadata_url = query_ai_focus_document ? to_url(query_ai_focus_document) : ""
            if (metadata_url === document_url) {
                metadata_url = ""
            }

            // do the search
            dispatch(do_llm_search({
                    session: session,
                    prev_conversation_list: llm_state.conversationList,
                    question: user_query,
                    source_list: source_list,
                    source_values: source_values,
                    focus_url: document_url,
                    metadata_url: metadata_url
                })
            )
        }
    }

    // dark or light theme switch
    const on_toggle_theme = ()=> {
        dispatch(toggle_theme());
    }

    // go back to classic search
    const toggle_agentic_ui = (e: React.MouseEvent<HTMLButtonElement>): void => {
        if (e) e.stopPropagation();
        dispatch(llm_view(false));
    }

    // set theme for CSS
    useEffect(() => {
        document.body.parentElement?.setAttribute('data-theme', theme);
    }, [theme]);

    // helper: get appropriate text for source drop down box
    const getSelectedSourcesText = () => {
        const selectedSources = Object.keys(source_values).filter(key => source_values[key]);
        if (selectedSources.length === 0 || selectedSources.length === source_list.length) return 'All Sources';
        if (selectedSources.length === 1) {
            const active_source = source_list.find(source => "" + source.sourceId === selectedSources[0])
            return active_source ? active_source.name : "One source selected"
        }
        return `${selectedSources.length} sources selected`;
    }

    // get a list of filtered sources as a group (if groups are set up) or just sources otherwise
    const sources = (): SourceGroup[] => {
        return get_source_list(source_list, source_values, sourceFilter, undefined);
    }

    // set/unset selected source
    function on_set_source_value(source: SourceGroup, checked: boolean): void {
        dispatch(set_source_value({name: "" + source.sourceId, checked: checked}));
        clear_target_focus()
        dispatch(clear_llm_state())
    }

    // get the user's initials, e.g. John the Smith => JS
    const user_initials = get_initials(user)

    return (
        <div className={`main-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>

            <ConfirmMessage
                title="Clear Recent History"
                message={confirm_message}
                confirm={() => on_clear_history()}
                close={() => setConfirmMessage(undefined)}
            />

            <aside className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
                <div className="sidebar-content">
                    <div className="sidebar-header">
                        <button className="new-chat-button" onClick={() => new_chat()}>
                            <svg focusable="false" viewBox="0 0 24 24"><path d="M12 6.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5z"></path><path d="M12 12.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5z"></path><path d="M17.5 12a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5z"></path><path d="M6.5 12a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5z"></path><path fillRule="evenodd" d="M12 1.75a10.25 10.25 0 1 0 0 20.5 10.25 10.25 0 0 0 0-20.5zM2.75 12a9.25 9.25 0 1 1 18.5 0 9.25 9.25 0 0 1-18.5 0z"></path></svg>
                            <span>New Chat</span>
                        </button>
                    </div>

                    <div className="source-selector-container">
                        <h2>Sources</h2>
                        <div className={`custom-multiselect ${isSourceDropdownOpen ? 'open' : ''}`} ref={sourceSelectorRef}>
                            <div className="select-button" onClick={() => setSourceDropdownOpen(!isSourceDropdownOpen)}>
                                <span>{getSelectedSourcesText()}</span>
                                <svg className="chevron-down" focusable="false" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"></path></svg>
                            </div>
                            <div className="select-dropdown">
                                <input type="text" className="source-filter-input" placeholder="Filter sources..." value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} />
                                <div className="select-dropdown-options">
                                    {sources().map((source, index) => (
                                        <label key={index + "_" + source.name}>
                                            <input type="checkbox" value={source.sourceId} checked={source_values["" + source.sourceId] ?? false} onChange={(e) => {
                                                on_set_source_value(source, e.target.checked);
                                            }}/> {source.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="recent-chats-container">
                        <h2>Recent<span className="trash-can-margin" title="clear history" onClick={() => setConfirmMessage("Remove all Recent History?")}>&#128465;</span></h2>
                        <ul className="recent-chats-list">
                            {llm_state_history.map((history_item, index) => {
                                return (
                                    <li key={index} className="recent-chat-item" onClick={() => on_move_history_to_live(history_item)}>{get_recent_title(history_item)}</li>
                                )
                            })
                            }
                        </ul>
                    </div>
                    <div className="sidebar-footer">
                        <button className="return-search-button" onClick={(event) => toggle_agentic_ui(event)}>
                            <svg focusable="false" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>
                            <span>Return to Search UI</span>
                        </button>
                        <div className="theme-selector">
                            <button className={`theme-button ${theme === 'light' ? 'active' : ''}`} onClick={() => {if (theme !== "light") on_toggle_theme()}}>
                                <svg focusable="false" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.06 1.06c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.06 1.06c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0l1.06-1.06z"></path></svg>
                                <span>Light</span>
                            </button>
                            <button className={`theme-button ${theme === 'dark' ? 'active' : ''}`} onClick={() => {if (theme === "light") on_toggle_theme()}}>
                                <svg focusable="false" viewBox="0 0 24 24"><path d="M9.37 5.51C9.19 6.15 9.1 6.82 9.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49z"></path></svg>
                                <span>Dark</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            { isMobile &&
            <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}></div>
            }


            <div className="ai-chat-container">
                <header className="ai-chat-header">
                    <div className="header-left" title={"show / hide side menu"}>
                        <button className="icon-button menu-toggle" aria-label="Hambuger Toggle menu" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                            {hamburger()}
                        </button>
                    </div>
                    <div className="header-right">
                        <p className="org-name mb-0 small">{organisation && organisation.name ? organisation.name : ""}</p>
                        <p className="user-name mb-0">{get_full_username(user)}</p>
                    </div>
                </header>

                { query_ai_focus_document &&
                <div className="focus-item-container">
                    <h3>FOCUS DOCUMENT</h3>
                    <div className="focus-item-content">
                        <div className="result-title-static">{query_ai_focus_document.title}</div>
                        <p className="result-snippet" dangerouslySetInnerHTML={{ __html: focusHtmlText }} />
                        { query_ai_focus_document.author.length > 0 &&
                        <p className="result-meta">Author: {query_ai_focus_document.author}</p>
                        }
                        <p className="result-meta">
                            url: <a href={to_url(query_ai_focus_document)} className="ai2-url-link" target="_blank" rel="noopener noreferrer">{to_display_url(query_ai_focus_document)}</a>
                        </p>
                    </div>
                </div>
                }

                <main className="chat-history" ref={lastConversationItemRef}>
                    {llm_state.conversationList.map((msg, index) => (
                        <div key={index} className={`ai2-message ai2-${msg.role}-message`}>
                            {msg.role === 'user' &&
                            <div className="message-avatar">{msg.role === 'user' ? user_initials : ''}</div>
                            }
                            {
                                (msg.searchResult === undefined || msg.searchResult.resultList.length === 0) && msg.content.length > 0 &&
                                <div className="message-content">{msg.content}</div>
                            }
                            <div className="search-result-content">
                            {
                                msg.searchResult && msg.searchResult.resultList.length > 0 &&
                                    <SearchResultSet
                                        searchResults={msg.searchResult.resultList}
                                        theme={theme}
                                        focusId={llm_state.focus_id}
                                        onSetFocus={(id) => on_set_llm_state_focus_id(id)}
                                    />
                            }
                            </div>
                        </div>
                    ))}
                    {busy &&
                        <div>
                            <AIBusy theme={theme} />
                        </div>
                    }
                </main>

                <footer className="ai2-chat-input-area">
                    <div className="input-wrapper">
                        <textarea className="ai2-chat-input" placeholder={t("start with")} rows={1}
                                  onKeyPress={(e) => checkUserKey(e)}
                                  autoFocus={true}
                                  value={user_query}
                                  readOnly={busy}
                                  onChange={e => change_query(e.target.value)}></textarea>
                        <div className="input-actions">
                            <button className="icon-button" aria-label="Send message" onClick={(e) => do_search(e)}>
                                <svg focusable="false" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                            </button>
                        </div>
                    </div>
                </footer>
            </div>

        </div>
    );
}
