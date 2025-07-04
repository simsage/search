import './SearchResultFragment.css';
import {
    download,
    get_archive_child, get_archive_child_last,
    get_archive_parent,
    getKbId,
    highlight,
    is_archive_file, is_online,
    is_viewable, language_lookup, unescape_owasp,
    unix_time_convert,
    url_to_bread_crumb
} from "../../common/Api";
import React, {useEffect, useState} from "react";
import {
    create_short_summary, save_hashtags,
    select_document_for_ai_query, set_focus_for_preview,
    set_metadata_error, teach
} from "../../reducers/searchSlice";
import {useSelector} from "react-redux";
import * as Api from "../../common/Api";
import ConfirmMessage from "../../common/ConfirmMessage";
import {ResultIconDisplay} from "../../common/ResultIconDisplay";
import {useTranslation} from "react-i18next";
import { RootState, AppDispatch } from '../../store';
import { useDispatch as useReduxDispatch } from "react-redux";
import { HashTag, RelatedDocument, SearchResult } from '../../types';

import icon_conv from "../../assets/images/ui/conversation-icon.svg"
import icon_conv_dark from "../../assets/images/ui/conversation-icon-dark.svg"

// Use AppDispatch type for dispatch
const useAppDispatch = () => useReduxDispatch<AppDispatch>();

interface SearchResultFragmentProps {
    result: SearchResult;
    on_seach?: () => void;
}

export function SearchResultFragment(props: SearchResultFragmentProps): JSX.Element {

    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    // user access
    const {user, session} = useSelector((state: RootState) => state.authReducer)
    const {source_list, summaries, ai_enabled, theme, effective_search_string, boost_document_id_list} = useSelector((state: RootState) => state.searchReducer);

    // does this user have the "tagger" role?
    let enable_add_tags = (user && user.roles) ? (user.roles.filter((role: {role: string}) => role.role === "tagger").length > 0) : false;

    // does this user have the "teacher" role?
    let is_teacher = (user && user.roles) ? (user.roles.filter((role: {role: string}) => role.role === "teacher").length > 0) : false;

    const result = props.result;
    const session_id = (session && session.id) ? session.id : "null";
    const text_list = result.textList ? result.textList : [];
    const similar_document_list = result.similarDocumentList ? result.similarDocumentList : [];
    const related_document_list = result.relatedList ? result.relatedList : [];
    const parent_list = related_document_list.filter(rel => !rel.isChild);
    const child_list = related_document_list.filter(rel => rel.isChild);
    const last_modified = unix_time_convert(result.lastModified);
    const title = result.title ? result.title : "";
    const summary = summaries[result.url] ? summaries[result.url] : "";
    // Prefer the metadata url to the doc's url as the later might be the source id (Sharepoint)
    const url = result.metadata["{url}"] && result.metadata["{url}"].trim().length > 0 ? result.metadata["{url}"] : result.url
    let url_breadcrumb = url_to_bread_crumb(url);
    if (url_breadcrumb === "owa" && result.metadata["{folder}"] && result.metadata["{folder}"].trim().length > 0) {
        url_breadcrumb = url_to_bread_crumb(result.metadata["{folder}"]);
    }

    // hashtag edit for each item
    const [hashtag_list, setHashTagList] = useState<HashTag[]>([])
    const [hashtag_edit, setHashTagEdit] = useState<HashTag | null>(null)
    const [hashtag_edit_prev_value, setHashTagEditPrevValue] = useState<string>('')
    const [hashtag_new, setHashTagNew] = useState<HashTag | null>(null)
    const [confirm_message, setConfirmMessage] = useState<string | undefined>(undefined)
    const [hashtag_delete, setHashTagDelete] = useState<HashTag | undefined>(undefined)

    useEffect(() => {
        const hashtag_list = Api.get_hashtag_list(result.metadata); // key, value pairs
        setHashTagList(hashtag_list)
        setHashTagEdit(null)
    }, [result]);

    // get the name of the foreign language of this document if applicable
    const document_language = result.metadata["{language}"] ? result.metadata["{language}"] : null;
    const language = language_lookup && document_language &&
                                document_language !== "en" ? language_lookup[document_language] : null;

    // is this a custom render type (like a db record)?
    const custom_render_type = result && result.renderType === "rt custom";
    let custom_render_html = "";
    if (custom_render_type) {
        custom_render_html = highlight(text_list.length > 0 ? text_list[0] : "", theme);
    }

    function click_preview_image(event: React.MouseEvent, result: SearchResult | RelatedDocument, url: string): void {
        check_teach()
        if (!window.ENV.show_previews) {
            download(url, session_id);
        } else {
            dispatch(set_focus_for_preview(result))
        }
    }

    function handle_title_click(result: SearchResult, url: string): void {
        check_teach()
        if (!window.ENV.show_previews) {
            download(get_archive_parent(url), session_id);
        } else {
            dispatch(set_focus_for_preview(result))
        }
    }

    function check_teach(): void {
        if (is_teacher) {
            dispatch(teach({session: session, search_text: effective_search_string,
                result: result, increment: 1, // Using 1 instead of true to match expected number type
                on_done: () => {
                    if (props.on_seach) props.on_seach()
                }
            }))
        }
    }

    function check_un_teach(): void {
        if (is_teacher) {
            dispatch(teach({session: session, search_text: effective_search_string,
                result: result, increment: 0, // Using 0 instead of false to match expected number type
                on_done: () => {
                    if (props.on_seach) props.on_seach()
                }
            }))
        }
    }

    function get_title_for_links(url: string): string {
        const actual_url = get_archive_child(url)
        if (window.ENV.show_previews) {
            return "preview \"" + actual_url + "\"";
        } else {
            if (is_viewable(url)) {
                return t("open") + " \"" + actual_url + "\" " + t("in the browser");
            } else if (!Api.is_archive(url)) {
                return "download \"" + actual_url + "\" to your computer";
            } else {
                return "cannot download archive file \"" + actual_url + "\"";
            }
        }
    }

    // summarize a snippet of search-result
    function createSnippetSummary(event: React.MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        dispatch(create_short_summary({
            session: session, 
            target_url: result.url,
            // Convert to string as required by the API
            sentence_id: result.firstSentence !== undefined ? result.firstSentence.toString() : "0"
        }))
    }

    // summarize an article from the start
    function createArticleSummary(event: React.MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        dispatch(create_short_summary({
            session: session, 
            target_url: result.url, 
            // Convert to string as required by the API
            sentence_id: "0"
        }))
    }

    // select url as a document for AI focus
    function selectDocumentForAIQuery(): void {
        // Convert urlId to number or use 0 as default
        const urlIdNumber = result.urlId ? parseInt(result.urlId, 10) : 0;
        dispatch(select_document_for_ai_query(
            {url: result.url, title: title, url_id: urlIdNumber}
        ))
    }

    const source_set: Record<string, any> = {}
    let source_type = ""
    if (source_list && source_list.length > 0) {
        for (const source of source_list) {
            source_set[source.sourceId] = source;
        }
        if (result && result.sourceId && source_set.hasOwnProperty(result.sourceId)) {
            source_type = source_set[result.sourceId].sourceType ?? ""
        }

    }

    // convert a key value list to just the value list as strings
    function convert_to_string_list(list: HashTag[]): string[] {
        const final_list: string[] = []
        for (const item of list) {
            if (item && item.value && item.value.trim)
                final_list.push(item.value.trim())
        }
        return final_list
    }

    // set up edit for a metadata tag
    function set_edit(event: React.MouseEvent, tag: HashTag): void {
        event.preventDefault()
        setHashTagNew(null)
        setHashTagEdit(tag)
        setHashTagEditPrevValue(tag.value)
    }

    function edit_on_change(text: string): void {
        if (hashtag_edit) {
            setHashTagEdit({key: hashtag_edit.key, value: text})
        } else {
            setHashTagEdit(null)
        }
    }

    function edit_key_down(event: React.KeyboardEvent): void {
        if (event.key === "Enter") {
            save_hashtags_click(null)
            setHashTagEdit(null)
        } else if (event.key === "Escape") {
            setHashTagEdit(null)
        }
    }

    function save_hashtags_click(event: React.MouseEvent | null): void {
        if (event && event.preventDefault) event.preventDefault()
        if (hashtag_edit && hashtag_edit && hashtag_edit.value.length >= 0) {
            const value = hashtag_edit.value.trim()
            if (value.length <= 3 || value[0] !== '#') {
                dispatch(set_metadata_error({error: "your hashtag must be at least two characters in size and start with #"}))
            } else if (hashtag_edit_prev_value !== value) {
                const new_hashtag_list = JSON.parse(JSON.stringify(hashtag_list))
                for (const hashtag of new_hashtag_list) {
                    if (hashtag.key === hashtag_edit.key) {
                        hashtag.value = hashtag_edit.value
                    }
                }
                dispatch(save_hashtags({
                    session_id: session_id,
                    organisation_id: window.ENV.organisation_id,
                    kb_id: getKbId(),
                    document_url: result.url,
                    hashtag_list: convert_to_string_list(new_hashtag_list)
                }))
            }
            setHashTagEdit(null)
        }
    }

    function add_new_metadata_item(): void {
        setHashTagNew({key: hashtag_list.length + 1, value: "#"})
        setHashTagEdit(null)
    }

    function new_value_on_change(text: string): void {
        if (hashtag_new) {
            setHashTagNew({key: hashtag_new.key, value: text})
        }
    }

    function new_value_key_down(event: React.KeyboardEvent): void {
        if (event.key === "Enter") {
            save_new_hashtag(null)
        } else if (event.key === "Escape") {
            setHashTagNew(null)
        }
    }

    // ask to remove
    function delete_hashtag(event: React.MouseEvent, hashtag: HashTag): void {
        event.preventDefault()
        if (hashtag && hashtag.key) {
            setHashTagDelete(hashtag)
            setConfirmMessage("are you sure you want to remove hashtag \"" + hashtag.value + "\" from this document?")
        }
        setHashTagEdit(null)
    }

    // callback do remove hashtag
    function delete_confirmed(): void {
        if (hashtag_delete && hashtag_delete.key) {
            // eslint-disable-next-line no-restricted-globals
            let new_hashtag_list = JSON.parse(JSON.stringify(hashtag_list))
            new_hashtag_list = new_hashtag_list.filter((ht: {key: number, value: string}) => ht.key !== hashtag_delete.key)
            dispatch(save_hashtags({
                session_id: session_id,
                organisation_id: window.ENV.organisation_id,
                kb_id: getKbId(),
                document_url: result.url,
                hashtag_list: convert_to_string_list(new_hashtag_list)
            }))
            setConfirmMessage(undefined)
        }
    }

    // add a new hashtag
    function save_new_hashtag(event: React.MouseEvent | null): void {
        if (event) event.preventDefault()
        if (hashtag_new && hashtag_new.value && hashtag_new.value.trim().length >= 3) {
            const value = hashtag_new.value.trim()
            // check key starts with the marker
            if (!value.startsWith("#")) {
                dispatch(set_metadata_error({error: "your hashtag must start with '#'"}))
            } else if (value.length <= 3) {
                dispatch(set_metadata_error({error: "your hashtag value must be at least two characters in size"}))
            } else {
                const new_hashtag_list = JSON.parse(JSON.stringify(hashtag_list))
                new_hashtag_list.push(hashtag_new)
                dispatch(save_hashtags({
                    session_id: session_id,
                    organisation_id: window.ENV.organisation_id,
                    kb_id: getKbId(),
                    document_url: result.url,
                    hashtag_list: convert_to_string_list(new_hashtag_list)
                }))
                setHashTagNew(null)
            }
        }
    }

    const result_details = theme === "light" ? "result-details" : "result-details-dark"
    const results_details_title = theme === "light" ? "result-details-title" : "result-details-title-dark"
    const results_filename = theme === "light" ? "results-filename" : "results-filename-dark"
    const search_result = theme === "light" ? "search-result-text" : "search-result-text-dark"
    const tag_edit = theme === "light" ? "tag-edit" : "tag-edit-dark"
    const similar_document = theme === "light" ? "similar-document-link" : "similar-document-link-dark"

    // is this search result boosted?
    const boosted = window.ENV.show_boost_controls && result && result.urlId && boost_document_id_list &&
        boost_document_id_list.find((id) => id === result.urlId) !== undefined
    const can_undo = boosted && is_teacher

    return (
        <>
            <ConfirmMessage
                title="Remove hashtag"
                message={confirm_message}
                confirm={() => delete_confirmed()}
                close={() => setConfirmMessage(undefined)}
            />
            <div className="d-flex pb-4 mb-3 px-3">
                {/*** SHOW PREVIEW OR SOURCE ICON ***/}
                <ResultIconDisplay
                    result={result}
                    url={url}
                    check_teach={check_teach}
                />

                {custom_render_type &&
                    <div dangerouslySetInnerHTML={{__html: custom_render_html}}/>
                }
                {!custom_render_type &&
                    <div className="ms-3 w-100">
                    <div className="d-flex align-items-center text-align-end mb-1">
                        {/********************** FILE DIRECTORY **********************/}
                        <p className={(theme === "light" ? "result-breadcrumb" : "result-breadcrumb-dark") + " mb-0 me-2"}>{url_breadcrumb}</p>
                        { language &&
                            <span className="mb-2" style={{cursor: "default"}} title={language}>
                            &nbsp;{language}&nbsp;
                        </span>
                        }
                    </div>
                    {/********************** TITLE (FILE NAME) **********************/}
                    { (window.ENV.show_previews || !is_online(url)) &&
                    <span className={results_filename + " mb-2 text-break pointer-cursor"}
                          onClick={() => {
                              handle_title_click(result, url)
                          }} title={get_title_for_links(url)}>
                            {boosted && <span>&#x2B50;</span>}
                            {title ? title : url}
                    </span>
                    }
                    { !window.ENV.show_previews && is_online(url) &&
                        <a href={get_archive_parent(url)} rel="noreferrer" target="_blank" className={results_filename + " mb-2 text-break pointer-cursor"}
                           title={get_title_for_links(url)} onClick={() => check_teach()}>
                            {boosted && <span>&#x2B50;</span>}
                            {title ? title : url}
                        </a>
                    }
                    {can_undo && <span className={theme === "light" ? "undo-boost" : "undo-boost-dark"} title={"undo the boost this document was given"} onClick={check_un_teach}>&#x21BA;</span>}
                    { ai_enabled &&
                    <span className="qna-image" title={t("converse with this document")}
                          onClick={() => selectDocumentForAIQuery()}>
                        <span className="in-circle">
                            <img className="circle-image-size" src={theme === "light" ? icon_conv : icon_conv_dark}
                                 alt="conversation" />
                        </span>
                    </span>
                    }
                    <div className="d-flex align-items-center mb-1">
                        { is_archive_file(url) &&
                            <span>
                                <span className={results_details_title + " mb-0"}>{get_archive_child_last(url)}</span>&nbsp;
                                <span className={results_details_title + " mb-0"}>inside</span>&nbsp;
                                <span className={results_details_title + " mb-0"}>{get_archive_parent(url)}</span>
                            </span>
                        }
                        {/********************** ABSOLUTE PATH TO FILE (INCLUSIVE) **********************/}
                        { !is_archive_file(url) &&
                            <span className={results_details_title + " mb-0"}>{url}</span>
                        }
                    </div>
                    {/********************** MODIFIED MD **********************/}
                    <div className="d-flex align-items-center mb-1">
                        <span className={result_details + " mb-0"}>{t("Last modified")} {last_modified}</span>
                        {result.author &&
                            <span className="d-flex align-items-center">
                                <span className={result_details + " mb-0 mx-2"}>|</span>
                                <span className={result_details + " mb-0"}>{result.author}</span>
                            </span>
                        }
                    </div>
                    {
                        text_list.map((text, i) => {
                            const _text = highlight(text, theme);
                            return (
                                <div key={"tl" + i} className={search_result}>
                                    <p className="small fw-light mb-2" dangerouslySetInnerHTML={{__html: _text}}/>
                                </div>
                            );
                        })
                    }
                    {
                        text_list.length > 0 &&
                        <div>
                            {parent_list && parent_list.length > 0 &&
                                <div className="border-top line-width-limited">
                                    <div className="similar-document-title">{source_type === "discourse" ? "topic" : "parent document"}</div>
                                    <ul>
                                        {
                                            parent_list.map((item, j) => {
                                                const title = item.title ? item.title : (item.webUrl ? item.webUrl :item.relatedUrl);
                                                return (<li key={"parent" + j} className={similar_document}
                                                            onClick={(event) => click_preview_image(event, item, item.relatedUrl)}
                                                            title={get_title_for_links(item.webUrl ? item.webUrl :item.relatedUrl)}>
                                                    {title}
                                                </li>);
                                            })
                                        }
                                    </ul>
                                </div>
                            }
                            {child_list && child_list.length > 0 &&
                                <div className="border-top line-width-limited">
                                    <div className="similar-document-title">{source_type === "discourse" ? "replies" : "attachments"}</div>
                                    <ul>
                                        {
                                            child_list.map((item, j) => {
                                                const title = item.title ? item.title : (item.webUrl ? item.webUrl :item.relatedUrl);
                                                return (<li key={"child" + j} className={similar_document}
                                                            onClick={(event) => click_preview_image(event, item, item.relatedUrl)}
                                                            title={get_title_for_links(item.relatedUrl)}>
                                                    {title}
                                                </li>);
                                            })
                                        }
                                    </ul>
                                </div>
                            }
                            {
                                ((child_list && child_list.length > 0) || (parent_list && parent_list.length > 0)) &&
                                <div className="border-bottom line-width-limited" />
                            }
                            {similar_document_list && similar_document_list.length > 0 &&
                                <div>
                                    <div className="similar-document-title">similar documents</div>
                                    <ul>
                                        {
                                            similar_document_list.map((similar, j) => {
                                                return (<li key={"sim"+j} className={similar_document}>
                                                            {similar.url}
                                                        </li>);
                                            })
                                        }
                                    </ul>
                                </div>
                            }
                        </div>
                    }
                    {
                        summary && summary.length > 0 && ai_enabled &&
                        <div className={(theme === "light" ? "" : "summary-text-dark") + " border-top"}>
                            {
                                summary.split("\n").map((text, i) => {
                                    return (<div className="pt-2" key={"summ" + i}>
                                            <span className="py-1" title={text}>{unescape_owasp(text)}</span>
                                        </div>
                                    )})
                            }
                        </div>
                    }
                    {
                        (!summary || summary.length === 0) && ai_enabled && session_id !== "null" &&
                        <div>
                            { !window.ENV.use_article_summary && ai_enabled &&
                                <span className="link" onClick={(event) => createSnippetSummary(event)} title={t("create a short summary of this search-result")}>{t("create summary")}</span>
                            }
                            { window.ENV.use_article_summary && ai_enabled &&
                                <span className="link" onClick={(event) => createArticleSummary(event)} title={t("create a short summary of this document")}>{t("create summary")}</span>
                            }
                        </div>
                    }
                    {
                        window.ENV.show_user_tags &&
                        <div className="d-flex align-items-center flex-wrap">
                            {enable_add_tags && hashtag_list.map((hashtag, i) => {
                                if (hashtag_edit && hashtag_edit.key === hashtag.key) {
                                    return (
                                        <span className={tag_edit + " me-2 mb-2"} key={"hash" + i} title={hashtag.value}>
                                            <input type="text" defaultValue={hashtag.value}
                                                   autoFocus={true}
                                                   onChange={(event) => edit_on_change(event.target.value)}
                                                   onKeyDown={(event) => edit_key_down(event)}
                                            />
                                            <span className="delete-metadata-icon"
                                                  title={"remove this metadata item from this document"}
                                                  onClick={(event) => delete_hashtag(event, hashtag)}
                                            >&#x1f5d1;</span>
                                            <span className="delete-metadata-icon"
                                                  title={"discard changes"}
                                                  onClick={() => setHashTagEdit(null)}
                                            >&#x2715;</span>
                                            <span className="delete-metadata-icon"
                                                  title={"update this name/value pair"}
                                                  onClick={(event) => save_hashtags_click(event)}
                                            >&#x2713;</span>
                                        </span>
                                    )
                                } else {
                                    return (
                                        <span className={tag_edit + " me-2 mb-2"} key={1000 + i} title={hashtag.value}
                                              onClick={(event) => set_edit(event, hashtag)}>
                                        {hashtag.value}
                                    </span>
                                    )
                                }
                            })}
                            {!enable_add_tags && hashtag_list.map((tag, i) => {
                                return (<span className="tag me-2 mb-2" key={"hash2" + i}>{tag.value}</span>);
                            })}
                            {enable_add_tags && !hashtag_new &&
                                <span className={tag_edit + " me-2 mb-2"} title="add new metadata item"
                                        onClick={() => add_new_metadata_item()}>+</span>
                            }
                            {enable_add_tags && hashtag_new &&
                                <span className={tag_edit + " me-2 mb-2"}
                                      title="new metadata item, supply both a name that starts with 'user-' and a non-empty value">
                                    <input type="text" defaultValue={hashtag_new.value}
                                           autoFocus={true}
                                           onChange={(event) => new_value_on_change(event.target.value)}
                                           onKeyDown={(event) => new_value_key_down(event)}
                                    />
                                    <span className="delete-metadata-icon"
                                          title={"discard / close"}
                                          onClick={() => setHashTagNew(null)}
                                    >&#x2715;</span>
                                    <span className="delete-metadata-icon"
                                          title={"save this new name/value pair"}
                                          onClick={(event) => save_new_hashtag(event)}
                                    >&#x2713;</span>
                                </span>
                            }
                        </div>
                    }
                </div>
                }
            </div>
        </>
    )
}
