import React from 'react';
import './AccountDropdown.css';
import { useSelector } from "react-redux";
import { add_url_search_parameter, getKbId } from "./Api";
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported

/**
 * The little sign-in drop down menu
 *
 */
export function KnowledgebaseDropdown() {
    const { show_kb_menu } = useSelector((state) => state.authReducer)
    const { all_kbs } = useSelector((state) => state.searchReducer)
    const currentKb = getKbId()

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
        const newValue = kbId === defaultKb.id ? "" : kbId
        add_url_search_parameter("kbId", newValue)
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
