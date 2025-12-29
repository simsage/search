import './AIDialog.css';
import { ask_document_question, close_query_ai } from "../../reducers/searchSlice";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { get_archive_child, unescape_owasp } from "../../common/Api";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch } from '../../store';
import { useDispatch as useReduxDispatch } from "react-redux";

// Use AppDispatch type for dispatch
const useAppDispatch = () => useReduxDispatch<AppDispatch>();

export function AIDialog(): JSX.Element {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const listRef = useRef<HTMLDivElement>(null);
    const { query_ai_focus_url, query_ai_focus_title,
           busy_with_ai, query_ai_dialog_list, theme } = useSelector((state: RootState) => state.searchReducer);
    const { session } = useSelector((state: RootState) => state.authReducer);
    const [query, set_query] = useState<string>('');

    useEffect(() => {
        listRef.current?.lastElementChild?.scrollIntoView();
    }, [query_ai_dialog_list]);

    // select url as a document for AI focus
    function closeQueryAI(): void {
        dispatch(close_query_ai());
    }

    function getDocumentName(): string {
        if (query_ai_focus_title && query_ai_focus_title.length > 0) {
            return "\"" + query_ai_focus_title + "\" (" + get_archive_child(query_ai_focus_url) + ")";
        }
        return query_ai_focus_url;
    }

    function checkUserKey(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
        if (e.key === "Enter" && query.trim().length > 2) {
            e.preventDefault();
            e.stopPropagation();
            dispatch(ask_document_question({
                session: session,
                prev_conversation_list: query_ai_dialog_list,
                question: query,
                document_url: query_ai_focus_url,
                on_success: () => { set_query(''); }
                }
            ));
        }
    }

    return (
        <div className={theme === "light" ? "chat-container" : "chat-container-dark"}>
            <div className="chat-header">
                <span>{t("Converse with this Document")}</span>
                <span className="container-close"
                      title={t("close")} onClick={() => closeQueryAI()} />
            </div>
            <div className="chat-messages" ref={listRef}>
                <div className="small-font">{t("Generative AI can make mistakes. Consider checking important information.")}</div>
                {
                    query_ai_focus_title && query_ai_focus_title.length > 0 &&
                    <div className={(theme === "light" ? "bot-message" : "bot-message-dark") + " ai-message"}>
                        {unescape_owasp(t("Please ask me any question about") + " " + getDocumentName())}
                    </div>
                }
                {
                    query_ai_dialog_list.map((msg, i) => {
                        if (msg && msg.role === "assistant") {
                            return (
                                <div className={(theme === "light" ? "bot-message" : "bot-message-dark") + " ai-message"} key={i}>
                                    {unescape_owasp(msg.content.replace("%doc%", getDocumentName()))}
                                </div>
                            );
                        } else {
                            return (
                                <div className={(theme === "light" ? "user-message" : "user-message-dark") + " ai-message"} key={i}>
                                    {unescape_owasp(msg.content)}
                                </div>
                            );
                        }
                    })
                }
                { busy_with_ai &&
                    <div className={theme === "light" ? "please-wait-message" : "please-wait-message-dark"}>
                        {t("please wait")}...
                    </div>
                }
            </div>
            <textarea autoFocus={true} rows={4} className="chat-input"
                      value={query}
                      readOnly={busy_with_ai}
                      title={busy_with_ai ? t("please wait") : t("ask your question")}
                      onChange={e => set_query(e.target.value)}
                      onKeyPress={(e) => checkUserKey(e)}
                      placeholder={t("your question") + "..."}></textarea>
        </div>
    );
}