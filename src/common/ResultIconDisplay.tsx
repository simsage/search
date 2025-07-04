import React from "react";
import * as Api from "./Api";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from '../store';
import {SourceItem} from "../types";

// Type assertions for Api functions
const download_document = (Api as any).download_document;
const get_archive_child = (Api as any).get_archive_child;
const is_viewable = (Api as any).is_viewable;
const is_archive = (Api as any).is_archive;
const get_source_for_result = (Api as any).get_source_for_result;
const get_icon_src = (Api as any).get_icon_src;
const preview_image_url = (Api as any).preview_image_url;

interface ResultIconDisplayProps {
    result: any;
    url: string;
    set_focus_for_preview?: (result: any) => void;
    check_teach?: () => void;
}

export const ResultIconDisplay = ({ result, url, set_focus_for_preview, check_teach }: ResultIconDisplayProps): JSX.Element => {
    const { t } = useTranslation();
    const { source_list, show_source_icon } = useSelector((state: RootState) => state.searchReducer);
    const { session } = useSelector((state: RootState) => state.authReducer);
    const session_id = session ? session.id : "";

    function click_preview_image(event: React.MouseEvent<HTMLImageElement>, result: any, url: string): void {
        if (!window.ENV.show_previews) {
            if (check_teach) check_teach();
            download_document(url, session_id);
        } else if (set_focus_for_preview) {
            set_focus_for_preview(result);
        }
    }

    function get_title_for_links(url: string): string {
        const actual_url = get_archive_child(url);
        if (window.ENV.show_previews) {
            return t("preview") + " " + actual_url;
        } else if (is_viewable(url)) {
            return t("open") + " " + actual_url + " " + t("in the browser");
        } else if (!is_archive(url)) {
            return t("download") + " " + actual_url + " " + t("to your computer");
        } else {
            return t("cannot download archive file") + " " + actual_url;
        }
    }

    const circle_letters = (result: any, source_list: SourceItem[]): JSX.Element => {
        const source = source_list && source_list.find((item) => item.sourceId === result.sourceId);
        let name = source?.name ?? "SRC";
        if (name.length > 3) {
            name = name.substring(0, 3).toUpperCase();
        }
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
                <circle cx="16" cy="16" r="15" fill="#f0f0f0" stroke="#000" strokeWidth="0.2"/>
                <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial, sans-serif"
                      fontSize="10" fill="#444">
                    {name}
                </text>
            </svg>
        );
    };

    const source = get_source_for_result(result, source_list);
    const icon_src = get_icon_src(source);

    return (
        <div>
            { show_source_icon && icon_src === 'default' &&
                circle_letters(result, source_list)
            }
            {
                (show_source_icon && icon_src !== 'default') &&
                <img src={icon_src} alt={"icon"} width={32} height={32} />
            }
            {
                !show_source_icon &&
                <img
                    onClick={(event) => click_preview_image(event, result, url)}
                    title={get_title_for_links(url)}
                    src={preview_image_url(session_id, result)}
                    alt=""
                    className="result-preview d-none d-lg-block pointer-cursor"
                />
            }
        </div>
    );
};
