import {HashTag, SearchResult} from "../../types";
import {save_hashtags, set_metadata_error} from "../../reducers/searchSlice";
import {useSelector} from "react-redux";
import {RootState, AppDispatch} from "../../store";
import { useDispatch as useReduxDispatch } from "react-redux";
import React, {useEffect, useState} from "react";
import {getKbId} from "../../common/Api";
import * as Api from "../../common/Api";
import ConfirmMessage from "../../common/ConfirmMessage";

interface HashTagsProps {
    result: SearchResult;
    on_seach?: (values?: any) => void;
}

// Use AppDispatch type for dispatch
const useAppDispatch = () => useReduxDispatch<AppDispatch>();

export function HashTags(props: HashTagsProps): JSX.Element {

    const dispatch = useAppDispatch();
    const {user, session} = useSelector((state: RootState) => state.authReducer)
    const {theme} = useSelector((state: RootState) => state.searchReducer);
    const session_id = (session && session.id) ? session.id : "null";
    // does this user have the "tagger" role?
    let enable_add_tags = (user && user.roles) ? (user.roles.filter((role: {role: string}) => role.role === "tagger").length > 0) : false;
    const result = props.result;
    const tag_edit_css = (theme === "light") ? "tag-edit" : "tag-edit-dark"

    useEffect(() => {
        const hashtag_list = Api.get_hashtag_list(result.metadata); // key, value pairs
        setHashTagList(hashtag_list)
        setHashTagEdit(null)
    }, [result]);

    // hashtag edit for each item
    const [hashtag_list, setHashTagList] = useState<HashTag[]>([])
    const [hashtag_edit, setHashTagEdit] = useState<HashTag | null>(null)
    const [hashtag_edit_prev_value, setHashTagEditPrevValue] = useState<string>('')
    const [hashtag_new, setHashTagNew] = useState<HashTag | null>(null)
    const [confirm_message, setConfirmMessage] = useState<string | undefined>(undefined)
    const [hashtag_delete, setHashTagDelete] = useState<HashTag | undefined>(undefined)

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

    // convert a key value list to just the value list as strings
    function convert_to_string_list(list: HashTag[]): string[] {
        const final_list: string[] = []
        for (const item of list) {
            if (item && item.value && item.value.trim)
                final_list.push(item.value.trim())
        }
        return final_list
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
        if (hashtag && hashtag.value) {
            setHashTagDelete(hashtag)
            setConfirmMessage("are you sure you want to remove hashtag \"" + hashtag.value + "\" from this document?")
        }
        setHashTagEdit(null)
    }

    // callback do remove hashtag
    function delete_confirmed(): void {
        if (hashtag_delete && hashtag_delete.value) {
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


    return (
        <span>
        {
            window.ENV.show_user_tags &&
            <span className="mb-1 pointer-cursor">
                {enable_add_tags && hashtag_list.map((hashtag, i) => {
                    if (hashtag_edit && hashtag_edit.key === hashtag.key) {
                        return (
                            <span className={tag_edit_css + " me-2 mb-2"} key={"hash" + i} title={hashtag.value}>
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
                            <span className={tag_edit_css + " me-2 mb-2"} key={1000 + i} title={hashtag.value}
                                  onClick={(event) => set_edit(event, hashtag)}>
                                        {hashtag.value}
                                    </span>
                        )
                    }
                })}
                {!enable_add_tags && hashtag_list.map((tag, i) => {
                    return (<span className={tag_edit_css + " me-2 mb-2"} key={"hash2" + i}>{tag.value}</span>);
                })}
                {enable_add_tags && !hashtag_new &&
                    <span className={tag_edit_css + " me-2 mb-2"} title="add new metadata item"
                          onClick={() => add_new_metadata_item()}>+</span>
                }
                {enable_add_tags && hashtag_new &&
                    <span className={tag_edit_css + " me-2 mb-2"}
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
            </span>
        }

            <ConfirmMessage
                title="Remove hashtag"
                message={confirm_message}
                confirm={() => delete_confirmed()}
                close={() => setConfirmMessage(undefined)}
            />

        </span>
    )

}

