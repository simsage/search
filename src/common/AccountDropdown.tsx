import React, { useCallback } from 'react';
import './AccountDropdown.css';
import { close_menu, simsageLogOut } from "../reducers/authSlice";
import {
    set_compact_view,
    set_icon_mode,
    set_llm_search,
    toggle_ai,
    toggle_theme
} from "../reducers/searchSlice";
import { useSelector } from "react-redux";
import { useAuth } from 'react-oidc-context';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch } from '../store';
import { useDispatch as useReduxDispatch } from "react-redux";


interface AccountDropdownProps {
    on_search?: () => void;
}

/**
 * The little sign-in drop-down menu
 *
 */
// Use AppDispatch type for dispatch
const useDispatch = () => useReduxDispatch<AppDispatch>();

export function AccountDropdown(props?: AccountDropdownProps): JSX.Element {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const { show_menu } = useSelector((state: RootState) => state.authReducer);
    const { session } = useSelector((state: RootState) => state.authReducer);
    const { use_ai, ai_enabled, compact_view, show_source_icon, llm_search, theme } =
        useSelector((state: RootState) => state.searchReducer);
    const auth = useAuth();

    const on_sign_out = useCallback(() => {
        dispatch(close_menu());
        if (auth && auth.isAuthenticated) {
            dispatch(simsageLogOut({ session_id: session?.id, auth }));
        }
    }, [dispatch, auth, session?.id]);

    function view_advanced_query_syntax(): void {
        dispatch(close_menu());
        window.open(process.env.PUBLIC_URL + "resources/search-syntax.pdf", "blank");
    }

    const set_ai = (e: React.MouseEvent<HTMLInputElement>): void => {
        if (e) e.stopPropagation();
        dispatch(toggle_ai());
        if (props?.on_search) props.on_search();
    }

    const toggle_compact_view = (e: React.MouseEvent<HTMLInputElement>): void => {
        if (e) e.stopPropagation();
        dispatch(set_compact_view(!compact_view));
        if (props?.on_search) props.on_search();
    }

    const toggle_agentic_ui = (e: React.MouseEvent<HTMLInputElement>): void => {
        if (e) e.stopPropagation();
        dispatch(close_menu());
        dispatch(set_llm_search(!llm_search));
    }

    const toggle_icon_mode = (e: React.MouseEvent<HTMLInputElement>): void => {
        if (e) e.stopPropagation();
        dispatch(set_icon_mode(!show_source_icon));
        if (props?.on_search) props.on_search();
    }

    const toggle_ui_theme = (e: React.MouseEvent<HTMLInputElement>): void => {
        if (e) e.stopPropagation();
        dispatch(toggle_theme());
    }

    const is_authenticated = (auth && auth.isAuthenticated);
    const acc_item = (theme === "light" ? "acc-item" : "acc-item-dark");

    return (
        <div className={(show_menu ? "d-flex" : "d-none") + (theme === "light" ? " account-dropdown" : " account-dropdown-dark")}>
            <ul className="acc-nav mb-0">
                <li className={acc_item + " px-4 py-3"} onClick={() => window.location.href = "/"}>
                    <label>{t("Home")}</label>
                </li>
                {window.ENV.show_download_manual &&
                    <li className={acc_item + " px-4 py-3"}
                        onClick={() => view_advanced_query_syntax()}>
                        <label>{t("Advanced query syntax")}</label>
                    </li>
                }
                {ai_enabled && window.ENV.show_llm_menu &&
                    <li className={acc_item + " px-4 py-3 form-check form-switch"}>
                        <label className="form-check-label small">{t("Agentic UI")}</label>
                        <input className="form-check-input" type="checkbox" defaultChecked={llm_search} value={llm_search ? 'true' : 'false'}
                               onClick={(e) => toggle_agentic_ui(e)}/>
                    </li>
                }
                {ai_enabled && !llm_search &&
                    <li className={acc_item + " px-4 py-3 form-check form-switch"}>
                        <label className="form-check-label small">{t("Question Answering")}</label>
                        <input className="form-check-input" type="checkbox" defaultChecked={use_ai} value={use_ai ? 'true' : 'false'}
                               onClick={(e) => set_ai(e)}/>
                    </li>
                }
                { !llm_search &&
                <li className={acc_item + " px-4 py-3 form-check form-switch"}>
                    <label className="form-check-label small">{t("Compact View")}</label>
                    <input className="form-check-input" type="checkbox" defaultChecked={compact_view} value={compact_view ? 'true' : 'false'}
                           onClick={(e) => toggle_compact_view(e)}/>
                </li>
                }
                { !llm_search &&
                <li className={acc_item + " px-4 py-3 form-check form-switch"}>
                    <label className="form-check-label small">{t("Source Icons")}</label>
                    <input className="form-check-input" type="checkbox" defaultChecked={show_source_icon} value={show_source_icon ? 'true' : 'false'}
                           onClick={(e) => toggle_icon_mode(e)}/>
                </li>
                }
                <li className={acc_item + " px-4 py-3 form-check form-switch"}>
                    <label className="form-check-label small">{t("Dark Theme")}</label>
                    <input className="form-check-input" type="checkbox" defaultChecked={theme === "dark"}
                           value={theme === "dark" ? 'true' : 'false'}
                           onClick={(e) => toggle_ui_theme(e)}/>
                </li>
                {is_authenticated &&
                    <li className={acc_item + " px-4 py-3"}
                        onClick={() => on_sign_out()}>
                        <label>{t("Sign out")}</label>
                    </li>
                }
            </ul>
        </div>
    );
}
