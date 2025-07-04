import React from "react";
import * as Api from "./Api";
import { useSelector } from "react-redux";
import { RootState } from '../store';
import {SourceItem} from "../types";

// Use properly typed Api functions
const { get_source_for_result, get_icon_src } = Api;

interface AIResultIconDisplayProps {
    result: any;
    url: string;
    set_focus_for_preview?: (result: any) => void;
    check_teach?: () => void;
}

export const AIResultIconDisplay = ({ result, url, set_focus_for_preview, check_teach }: AIResultIconDisplayProps): JSX.Element => {
    const { source_list } = useSelector((state: RootState) => state.searchReducer);

    const source = get_source_for_result(result, source_list);
    const icon_src = get_icon_src(source);
    const source_name = source ? (source.name + " (Source ID " + source.sourceId + ")") : "";

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

    return (
        <span className={"me-2"}>
            { icon_src === 'default' &&
                <span title={source_name} className={"no-select"}>
                    {circle_letters(result, source_list)}
                </span>
            }
            {
                (icon_src !== 'default') &&
                <img src={icon_src} alt={"icon"} title={source_name} width={24} height={24} />
            }
        </span>
    );
};
