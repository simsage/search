import {SearchResult} from "../../types";
import {boost_document} from "../../reducers/searchSlice";
import {useSelector} from "react-redux";
import {RootState, AppDispatch} from "../../store";
import { useDispatch as useReduxDispatch } from "react-redux";
import React from "react";
import {useTranslation} from "react-i18next";


interface BoostStarScoringProps {
    result: SearchResult;
    on_seach?: (values?: any) => void;
}

// Use AppDispatch type for dispatch
const useAppDispatch = () => useReduxDispatch<AppDispatch>();

export function BoostStarScoring(props: BoostStarScoringProps): JSX.Element {

    const dispatch = useAppDispatch();
    const {user, session} = useSelector((state: RootState) => state.authReducer)
    const {effective_search_string, boost_document_id_list, search_text} = useSelector((state: RootState) => state.searchReducer);
    const { t } = useTranslation();

    // does this user have the "teacher" role?
    let is_teacher = (user && user.roles) ? (user.roles.filter((role: {role: string}) => role.role === "teacher").length > 0) : false;
    const result = props.result;

    function check_teach(): void {
        if (is_teacher && search_text.trim().length > 0) {
            dispatch(boost_document({session: session, search_text: effective_search_string,
                result: result, increment: 1, // Using 1 instead of true to match expected number type
                on_done: () => {
                    if (props.on_seach) props.on_seach({search_text: search_text})
                }
            }))
        }
    }

    function check_un_teach(): void {
        if (is_teacher && search_text.trim().length > 0) {
            dispatch(boost_document({session: session, search_text: effective_search_string,
                result: result, increment: 0, // Using 0 instead of false to match expected number type
                on_done: () => {
                    if (props.on_seach) props.on_seach({search_text: search_text})
                }
            }))
        }
    }

    // is this search result boosted?
    const ENV = (window as any).ENV;
    const max_boost = ENV.max_boost
    const boosted_item = (result && result.urlId && boost_document_id_list) ? (boost_document_id_list.find((item) => item.urlId === result.urlId)) : undefined
    const boost_enabled = window.ENV.show_boost_controls
    const can_update_boost = boost_enabled && is_teacher
    let boost_array: boolean[] = []
    let boost_title_str = ""
    if (boosted_item) {
        boost_title_str = t("this document has a ranking of") + " " + boosted_item.boostCount;
        for (let i = 0; i < boosted_item.boostCount && i < max_boost; i++) {
            boost_array.push(true)
        }
        while (boost_array.length < max_boost) {
            boost_array.push(false)
        }
    }

    return (
        <>
        { boost_enabled &&
            <span className="me-4 pointer-cursor d-inline-block">
                { (boosted_item === undefined || (boosted_item && boosted_item.boostCount < max_boost)) && can_update_boost &&
                    <span title={t("boost this document in search rankings")} onClick={() => check_teach()}>&#x1F44D;</span>
                }
                { (boosted_item && boosted_item.boostCount > 0 && can_update_boost) &&
                    <span title={t("lower this document in search rankings")} onClick={() => check_un_teach()} className={"me-4"}>&#x1F44E;</span>
                }
                {
                    boost_array.map((item, i) => {
                        return item ?
                            (<span key={i} title={boost_title_str}>&#x2B50;</span>) :
                            (<span key={i} title={boost_title_str} style={{color: "#888"}}>&#x2606;</span>)
                    })
                }
            </span>
        }
        </>
    )

}

