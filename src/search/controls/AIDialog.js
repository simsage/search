import './AIDialog.css';
import {ask_document_question, close_query_ai} from "../../reducers/searchSlice";
import {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {get_archive_child} from "../../common/Api";

export function AIDialog() {

    const dispatch = useDispatch();
    const listRef = useRef(null);
    const {query_ai_focus_url, query_ai_focus_url_id, query_ai_focus_title,
           busy_with_ai, query_ai_dialog_list} = useSelector((state) => state.searchReducer);
    const {session} = useSelector((state) => state.authReducer);
    const [query, set_query] = useState('');


    useEffect(() => {
        listRef.current?.lastElementChild?.scrollIntoView();
    }, [query_ai_dialog_list]);


    // select url as a document for AI focus
    function closeQueryAI() {
        dispatch(close_query_ai())
    }

    function getDocumentName() {
        if (query_ai_focus_title && query_ai_focus_title.length > 0) {
            return "\"" + query_ai_focus_title + "\" (" + get_archive_child(query_ai_focus_url) + ")";
        }
        return query_ai_focus_url;
    }

    function checkUserKey(e) {
        if (e.key === "Enter" && query.trim().length > 2) {
            e.preventDefault();
            e.stopPropagation();
            dispatch(ask_document_question({
                session: session,
                prev_conversation_list: query_ai_dialog_list,
                question: query,
                document_url: query_ai_focus_url,
                document_url_id: query_ai_focus_url_id}
            ))
        }
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <span>Document Questions</span>
                <span className="container-close"
                      title="close" onClick={() => closeQueryAI()} />
            </div>
            <div className="chat-messages" ref={listRef}>
                {
                    query_ai_dialog_list.map((msg, i) => {
                        if (msg && msg.role === "assistant") {
                            return (
                                <div className="ai-message bot-message" key={i}>
                                    {msg.content.replace("%doc%", getDocumentName())}
                                </div>
                            )
                        } else {
                            return (
                                <div className="ai-message user-message" key={i}>
                                    {msg.content}
                                </div>
                            )
                        }
                    })
                }
                { busy_with_ai &&
                    <div className="please-wait-message">
                        please wait...
                    </div>
                }
            </div>
            <textarea autoFocus={true} rows="4" className="chat-input"
                      value = {query}
                      readOnly={busy_with_ai}
                      title={busy_with_ai ? "please wait" : "ask your question"}
                      onChange={e => set_query(e.target.value)}
                      onKeyPress={(e) => checkUserKey(e)}
                      placeholder="your question..."></textarea>
        </div>
    )
}
