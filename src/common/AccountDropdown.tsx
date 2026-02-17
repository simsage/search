import React, { useCallback } from 'react';
import './AccountDropdown.css';
import { close_menu, simsageLogOut } from "../reducers/authSlice";
import {
    set_icon_mode,
    llm_view,
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
    const { use_ai, ai_enabled, show_source_icon, llm_search, theme } =
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
        window.open(process.env.PUBLIC_URL + "/resources/search-syntax.pdf", "blank");
    }

    const set_ai = (e: React.MouseEvent<HTMLInputElement>): void => {
        if (e) e.stopPropagation();
        dispatch(toggle_ai());
        if (props?.on_search) props.on_search();
    }

    const toggle_agentic_ui = (e?: React.MouseEvent<HTMLInputElement>): void => {
        if (e) e.stopPropagation();
        dispatch(close_menu());
        dispatch(llm_view(!llm_search));
    }

    const toggle_icon_mode = (e: React.MouseEvent<HTMLInputElement>): void => {
        if (e) e.stopPropagation();
        dispatch(set_icon_mode(!show_source_icon));
        if (props?.on_search) props.on_search();
    }

    const toggle_ui_theme = (e: React.MouseEvent<HTMLInputElement>): void => {
        if (e) {
            e.stopPropagation();
        }
        dispatch(toggle_theme());
    }

    const is_authenticated = (auth && auth.isAuthenticated);
    const acc_item = (theme === "light" ? "acc-item" : "acc-item-dark");

    return (
        <div className={(show_menu ? "d-flex me-4 mt-3" : "d-none") + (theme === "light" ? " account-dropdown" : " account-dropdown-dark")}>
            <ul className="acc-nav mb-0 settings-menu" data-theme={theme}>
                <li className={acc_item + " menu-item"} onClick={() => window.location.href = "/"} title={t("Home")}>
                    <label className="menu-item-label">{t("Home")}</label>
                </li>
                {window.ENV.show_download_manual &&
                    <li className={acc_item + " menu-item"} title={t("Manual")}
                        onClick={() => view_advanced_query_syntax()}>
                        <label className="menu-item-label">{t("Manual")}</label>
                    </li>
                }
                {ai_enabled && window.ENV.show_llm_menu &&
                    <li className={acc_item + " menu-item"} onClick={() => toggle_agentic_ui(undefined)} title={t("Agentic UI")}>
                        <label className="menu-item-label">
                            {t("Agentic UI")}
                        </label>
                    </li>
                }
                {ai_enabled && !llm_search &&
                    <li className={acc_item + " menu-item"} title={t("Question Answering")}>
                        <label className="menu-item-label" htmlFor="opt2">{t("Question Answering")}</label>
                        <label className="switch">
                            <input type="checkbox" id="opt2" defaultChecked={use_ai}
                                   onClick={(e) => set_ai(e)}/>
                            <span className="slider"></span>
                        </label>
                    </li>
                }
                { !llm_search &&
                    <li className={acc_item + " menu-item"} title={t("Source Icons")}>
                        <label className="menu-item-label" htmlFor="opt4">{t("Source Icons")}</label>
                        <label className="switch">
                            <input type="checkbox" id="opt4" defaultChecked={show_source_icon}
                                   onClick={(e) => toggle_icon_mode(e)}/>
                            <span className="slider"></span>
                        </label>
                    </li>
                }
                <li className={acc_item + " menu-item"} title={t("Dark Theme")}>
                    <label className="menu-item-label" htmlFor="opt5">{t("Dark Theme")}</label>
                    <label className="switch">
                        <input type="checkbox" id="opt5" defaultChecked={theme === "dark"}
                               onClick={(e) => toggle_ui_theme(e)}/>
                        <span className="slider"></span>
                    </label>
                </li>
                {is_authenticated &&
                    <li className={acc_item + " menu-item"} title={t("Sign out")}
                        onClick={() => on_sign_out()}>
                        <label className="menu-item-label">{t("Sign out")}</label>
                    </li>
                }
            </ul>
        </div>
    );
}
