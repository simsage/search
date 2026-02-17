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
            return { name: "Default", id: window.ENV.kb_id, supportedLanguages: ["en"] };
        }
    }

    const defaultKb = get_default_kb();
    let kb_list: KnowledgeBase[] = JSON.parse(JSON.stringify(all_kbs));

    function compare_fn(a: KnowledgeBase, b: KnowledgeBase): number {
        if (a.name < b.name) {
            return 1
        } else if (a.name > b.name) {
            return -1
        }
        // a must be equal to b
        return 0
    }

    kb_list.sort(compare_fn)

    function change_kb(kbId: string): void {
        const kb_value = kbId === defaultKb.id ? "" : kbId;
        const params = new URLSearchParams();
        params.set('query', search_text);
        if (kb_value.length > 0)
            params.set('kbId', kb_value);
        navigate(`?${params.toString()}`);
        window.location.reload();
    }

    const limit = (text: string): string => {
        if (text.length > 20) {
            return text.substring(0, 20) + "..."
        }
        return text
    }

    const acc_item = (theme === "light" ? "acc-item" : "acc-item-dark");

    return (
        <div className={(show_kb_menu ? "d-flex me-4 mt-3" : "d-none") + (theme === "light" ? " account-dropdown" : " account-dropdown-dark")}>
            <ul className="acc-nav settings-menu scroll-kb" data-theme={theme}>
                {kb_list.map(kbData =>
                    <li onClick={() => change_kb(kbData.id)} className={acc_item + " menu-item"} key={kbData.id} title={kbData.name}>
                        <label className={"menu-item-label"}>
                            {(kbData.id === currentKb ? "✓ " : "") + limit(kbData.name)}
                        </label>
                    </li>
                )}
            </ul>
        </div>
    );
}
