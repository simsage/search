import './AIFirst.css';
import '../TitleBar.css';
import '../SearchResults.css';
import {
    do_llm_search,
    do_llm_search_step2,
    do_llm_search_step3,
    set_focus_for_ai_queries, set_user_query, toggle_message_expand
} from "../../reducers/searchSlice";
import React, {useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {get_full_username, is_online, unescape_owasp} from "../../common/Api";
import {AIResultFragment} from "./AIResultFragment";
import {SourceSelector} from "./SourceSelector";
import {MetadataSelector} from "./MetadataSelector";
import {toggle_menu} from "../../reducers/authSlice";
import {AccountDropdown} from "../../common/AccountDropdown";
import showdown from "showdown";
import {useTranslation} from "react-i18next";
import { RootState, AppDispatch } from '../../store';

import icon_account_light from "../../assets/images/ui/icon_n-account.svg";
import icon_account_dark from "../../assets/images/ui/icon_n-account-dark.svg";
import icon_account_active from "../../assets/images/ui/icon_n-account-active.svg";
import {LLMState} from "../../types";

// Use AppDispatch type for dispatch
const useAppDispatch = () => useDispatch<AppDispatch>();

export function AIFirst(): JSX.Element {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const listRef = useRef<HTMLDivElement>(null);
    const {busy, llm_state, theme,
        metadata_list, metadata_values,
        source_list, source_values,
        document_type_count,
        query_ai_focus_document,
        user_query
    } = useSelector((state: RootState) => state.searchReducer);

    // Cast llm_state to the defined type
    const typedLLMState = llm_state as LLMState;
    const {session, organisation, user} = useSelector((state: RootState) => state.authReducer);
    const {show_menu} = useSelector((state: RootState) => state.authReducer);

    function change_query(str: string): void {
        if (str.trim() === "/")
            str = "SimSage search: ";
        dispatch(set_user_query({"user_query": str}));
    }

    function clear_target_focus(): void {
        dispatch(set_focus_for_ai_queries(null));
    }

    function toggle_accounts_menu(e?: React.MouseEvent<HTMLElement>): void {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        dispatch(toggle_menu());
    }

    useEffect(() => {
        const esc_function = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                clear_target_focus();
            }
        };
        document.addEventListener("keydown", esc_function, false);
        return () => {
            document.removeEventListener("keydown", esc_function, false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * get the last question the user asked from the conversation list
     *
     * @param conversation_list
     * @returns {string}
     */
    const get_user_question = (conversation_list: any[]): string => {
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
    };

    useEffect(() => {
        if (typedLLMState && typedLLMState.conversationList) {
            if (listRef.current?.lastElementChild) {
                listRef.current.lastElementChild.scrollIntoView();
            }

            // is the last item a Step 2 or Step 3 call?
            if (typedLLMState.conversationList.length > 0 && !busy) {
                const last_item = typedLLMState.conversationList[typedLLMState.conversationList.length - 1];
                if (last_item.step === 1) {
                    // do a search
                    dispatch(do_llm_search_step2({
                        session: session,
                        prev_conversation_list: typedLLMState.conversationList.slice(0, typedLLMState.conversationList.length - 1),
                        question: "SimSage search: " + last_item.searchKeywords,
                        metadata_list, metadata_values,
                        source_list, source_values,
                    }));
                } else if (last_item.step === 2) {
                    // do a search
                    dispatch(do_llm_search_step3({
                        session: session,
                        prev_conversation_list: typedLLMState.conversationList,
                        question: get_user_question(typedLLMState.conversationList),
                        search_result: last_item.searchResult
                    }));
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typedLLMState, busy]);

    const chat_list = typedLLMState.conversationList ?? [];

    function checkUserKey(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
        if (e.key === "Enter" && user_query.trim().length > 2) {
            e.preventDefault();
            e.stopPropagation();
            dispatch(do_llm_search({
                    session: session,
                    prev_conversation_list: chat_list,
                    question: user_query,
                    metadata_list, metadata_values,
                    source_list, source_values,
                    focus_url: query_ai_focus_document ? query_ai_focus_document.url : "",
                    metadata_url: query_ai_focus_document ? (query_ai_focus_document.metadata["{url}"] ?? "") : ""
                }
            ));
        }
    }

    function markup_focus(html: string): string {
        if (query_ai_focus_document) {
            const metadata_url = query_ai_focus_document.metadata["{url}"];
            const document_url = query_ai_focus_document.url;
            const url = metadata_url && metadata_url.length > 0 ? metadata_url : (document_url ?? "");
            if (url && is_online(url)) {
                const i1 = html.indexOf(converter.makeHtml(url));
                if (i1 >= 0) {
                    html = html.replace(converter.makeHtml(url), "<a href='" + url +"' target='_blank' class='ai-link'>" + url + "</a>");
                }
            }
        }
        return html;
    }

    const document_filter = theme === "light" ? "result-document-filter" : "result-document-filter-dark";
    const converter = new showdown.Converter({});

    return (
        <div className={theme === "light" ? "llm-chat-container row" : "llm-chat-container-dark row"}>
            <div className={"col-9"}>
                <div className="llm-chat-messages" ref={listRef}>
                    <div className="small-font">{t("Generative AI can make mistakes. Consider checking important information.")}</div>
                    {
                        chat_list.map((msg: { role: string; content: string; searchResult?: any; expand?: boolean }, i: number) => {
                            if (msg && msg.role === "assistant") {
                                if (!msg.content || msg.content.length === 0) {
                                    return (<div key={i}></div>);
                                }
                                const has_results = msg.searchResult && msg.searchResult.resultList && msg.searchResult && msg.searchResult.resultList.length > 0;
                                const num_results = msg.searchResult?.resultList?.length ?? 0;
                                return (
                                    <div key={i}>
                                        <div className={(theme === "light" ? "ai-bot-message" : "ai-bot-message-dark") + " ai-message " + (has_results ? "ai-bot-message-border-results" : "ai-bot-message-border")}
                                            dangerouslySetInnerHTML={{__html: markup_focus(converter.makeHtml(msg.content))}} />
                                        { has_results && (msg.expand ? msg.searchResult.resultList : msg.searchResult.resultList.slice(0, 1)).map((result: any, i: number) => {
                                            return (<AIResultFragment result={result} key={"csr" + i} />);
                                        })}
                                        { has_results &&
                                            <div className={theme === "light" ? "results-bottom-border" : "results-bottom-border-dark"}>
                                                { msg.expand && num_results > 1 &&
                                                    <div className={"expand-button link"} onClick={() => dispatch(toggle_message_expand({index: i}))}>
                                                        show less
                                                    </div>
                                                }
                                                { !msg.expand && num_results > 1 &&
                                                    <div className={"expand-button link"} onClick={() => dispatch(toggle_message_expand({index: i}))}>
                                                        show more
                                                    </div>
                                                }
                                            </div>
                                        }
                                    </div>
                                );
                            } else {
                                return (
                                    <div className={"user-message-line"} key={i}>
                                        <div className={(theme === "light" ? "ai-user-message" : "ai-user-message-dark") + " ai-message"}>
                                            {unescape_owasp(msg.content)}
                                        </div>
                                    </div>
                                );
                            }
                        })
                    }
                    { busy &&
                        <div className={theme === "light" ? "please-wait-message" : "please-wait-message-dark"}>
                            {t("thinking")}
                        </div>
                    }
                </div>
                <textarea autoFocus={true} rows={4} className={busy ? "llm-chat-input cursor-busy" : "llm-chat-input"}
                          placeholder={t("start with")}
                          value={user_query}
                          readOnly={busy}
                          onChange={e => change_query(e.target.value)}
                          onKeyPress={(e) => checkUserKey(e)}></textarea>
            </div>

            <div className={"col-3"}>
                <div className="sticky-top ai-search-control-padding">
                    <div className={document_filter + " row mb-4 mt-2"}>
                        <div className="col-5"></div>
                        <div className="col-5 justify-content-end">
                            <p className="org-name mb-0 small">{organisation && organisation.name ? organisation.name : ""}</p>
                            <p className="user-name mb-0">{get_full_username(user)}</p>
                        </div>
                        <div className="col-2" title={t("menu")}>
                            <button className={(show_menu ? "active" : "") + " btn nav-btn button-size"}
                                    onClick={(e) => toggle_accounts_menu(e)}>
                                <img src={(theme === "light" ? icon_account_light : icon_account_dark)} alt=""
                                     className={show_menu ? "d-none" : "image-small"}/>
                                <img src={icon_account_active}
                                     alt=""
                                     className={!show_menu ? "d-none" : "image-small"}/>
                            </button>
                            <AccountDropdown />
                        </div>
                    </div>

                    <div className={document_filter + " row pb-3"}>
                        <div className="col-12">
                            {source_list &&
                                <div>
                                    <SourceSelector
                                        on_search={() => {}}
                                    />
                                    <br/>
                                </div>
                            }
                        </div>
                    </div>

                    <div className={document_filter + " row"}>
                        <div className="col-12">
                            {metadata_list && metadata_list.length >= 0 && metadata_list.map((item, index) => {
                                return (
                                    <div key={"md_list_1_" + index}>
                                        <MetadataSelector key={"mds" + index}
                                                          title={"Types"}
                                                          busy={busy}
                                                          metadata={item.metadata}
                                                          has_results={false}
                                                          on_search={() => {}}
                                                          item_counts={document_type_count}
                                                          list={item.items}/>
                                    </div>
                                );
                            })
                            }
                        </div>
                    </div>

                    <div className={"row focus-at-bottom"}>
                        { query_ai_focus_document &&
                            <div className={"focus-border"}>
                                <div className={"col-12 fw-bold"}>
                                    <span className={theme === "light" ? "focus-title" : "focus-title-dark"}>Focus Document</span>
                                    <span className={"focus-cancel float-end"} title={"cancel focus"} onClick={clear_target_focus}>&#x1F5D9;</span>
                                </div>
                                <div className={"col-12 focus-advisory"}>
                                    any questions asked will be about this document
                                </div>
                                <div className={"col-12 small-font"}>
                                    <span className={theme === "light" ? "focus-label" : "focus-label-dark"}>title:</span>&nbsp;
                                    {query_ai_focus_document.title ?? "(no title)"}
                                </div>
                                <div className={"col-12 small-font"}>
                                    <span className={theme === "light" ? "focus-label" : "focus-label-dark"}>url:</span>&nbsp;
                                    { query_ai_focus_document.metadata["{url}"] ?? query_ai_focus_document.url }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
