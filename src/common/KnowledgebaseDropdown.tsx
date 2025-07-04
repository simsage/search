import React from 'react';
import './AccountDropdown.css';
import { useSelector } from "react-redux";
import { getKbId } from "./Api";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";
import { RootState } from '../store';
import {KnowledgeBase} from "../types";


/**
 * The knowledge-base selector for when there are multiple knowledge-bases in SimSage
 */
export function KnowledgebaseDropdown(): JSX.Element {
    const { show_kb_menu } = useSelector((state: RootState) => state.authReducer);
    const { all_kbs } = useSelector((state: RootState) => state.searchReducer);
    const { search_text, theme } = useSelector((state: RootState) => state.searchReducer);
    const currentKb = getKbId();
    const navigate = useNavigate();

    function get_default_kb(): KnowledgeBase {
        const pots = all_kbs.filter(kb => kb.id === window.ENV.kb_id);
        if (pots.length > 0) {
            return pots[0];
        } else {
            return { name: "Default", id: window.ENV.kb_id };
        }
    }

    const defaultKb = get_default_kb();
    const optKbs = all_kbs.filter(kb => kb.id !== window.ENV.kb_id);

    function change_kb(kbId: string): void {
        const kb_value = kbId === defaultKb.id ? "" : kbId;
        const params = new URLSearchParams();
        params.set('query', search_text);
        if (kb_value.length > 0)
            params.set('kbId', kb_value);
        navigate(`?${params.toString()}`);
        window.location.reload();
    }

    const acc_item = (theme === "light" ? "acc-item" : "acc-item-dark");

    return (
        <div className={(show_kb_menu ? "d-flex" : "d-none") + (theme === "light" ? " account-dropdown" : " account-dropdown-dark")}>
            <ul className="acc-nav ps-0 mb-0">
                <li
                    onClick={() => change_kb(defaultKb.id)}
                    className={acc_item + " px-4 py-3 default_kb"}>
                    <label className={defaultKb.id === currentKb ? "fw-bold" : ""}>
                        {defaultKb.name + (defaultKb.id === currentKb ? " ✓" : "")}
                    </label>
                </li>
                <div className={"kb_scroll_container"}>
                    {optKbs.map(kbData =>
                        <li
                            key={kbData.id}
                            onClick={() => change_kb(kbData.id)}
                            className={acc_item + " px-4 py-3" + (kbData.id === defaultKb.id ? " default_kb" : "")}>
                            <label className={kbData.id === currentKb ? "fw-bold" : ""}>
                                {kbData.name + (kbData.id === currentKb ? " ✓" : "")}
                            </label>
                        </li>
                    )}
                </div>
            </ul>
        </div>
    );
}
