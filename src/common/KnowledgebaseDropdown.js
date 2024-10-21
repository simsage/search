import React from 'react';
import './AccountDropdown.css';
import { useSelector } from "react-redux";
import { getKbId } from "./Api";
import 'bootstrap/dist/css/bootstrap.min.css';
import {useNavigate} from "react-router-dom"; // Ensure Bootstrap is imported

/**
 * The little sign-in drop down menu
 *
 */
export function KnowledgebaseDropdown() {
    const { show_kb_menu } = useSelector((state) => state.authReducer)
    const { all_kbs } = useSelector((state) => state.searchReducer)
    const {search_text} = useSelector((state) => state.searchReducer);
    const currentKb = getKbId()
    const navigate = useNavigate();

    function getDefaultKb() {
        const pots = all_kbs.filter(kb => kb.id === window.ENV.kb_id)
        if (pots.length > 0) {
            return pots[0]
        } else {
            return { name: "Default", id: window.ENV.kb_id }
        }
    }

    const defaultKb = getDefaultKb()
    const optKbs = all_kbs.filter(kb => kb.id !== window.ENV.kb_id)

    function changeKb(kbId) {
        const kb_value = kbId === defaultKb.id ? "" : kbId
        const params = new URLSearchParams();
        params.set('query', search_text);
        if (kb_value.length > 0)
            params.set('kbId', kb_value);
        navigate(`?${params.toString()}`);
        window.location.reload()
    }

    return (
        <div className={(show_kb_menu ? "d-flex" : "d-none") + " account-dropdown"}>
            <ul className="acc-nav ps-0 mb-0">
                <li
                    onClick={() => changeKb(defaultKb.id)}
                    className={"acc-item px-4 py-3 default_kb"}>
                    <label className={defaultKb.id === currentKb ? "fw-bold" : ""}>
                        {defaultKb.name + (defaultKb.id === currentKb ? " ✓" : "")}
                    </label>
                </li>
                <div className={"kb_scroll_container"}>
                    {optKbs.map(kbData =>
                        <li
                            key={kbData.id}
                            onClick={() => changeKb(kbData.id)}
                            className={"acc-item px-4 py-3" + (kbData.id === defaultKb.id ? " default_kb" : "")}>
                            <label className={kbData.id === currentKb ? "fw-bold" : ""}>
                                {kbData.name + (kbData.id === currentKb ? " ✓" : "")}
                            </label>
                        </li>
                    )}
                </div>
            </ul>
        </div>
    )
}
