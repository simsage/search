import './SourceSelector.css';
import { useState } from "react";
import { useSelector } from "react-redux";
import {
    set_source_filter,
    set_source_value,
    update_search_text
} from "../../reducers/searchSlice";
import {copy, get_icon_src, get_source_list, remove_source_name} from "../../common/Api";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch } from '../../store';
import { useDispatch as useReduxDispatch } from "react-redux";

// Use AppDispatch type for dispatch
const useAppDispatch = () => useReduxDispatch<AppDispatch>();

interface SourceSelectorProps {
    on_search?: (params: any) => void;
    show_counts: boolean
}

export function SourceSelector(props: SourceSelectorProps): JSX.Element {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const {
        source_values, source_list, source_id_count, source_filter, busy, search_text, theme
    } = useSelector((state: RootState) => state.searchReducer);

    const [expand, set_expand] = useState<boolean>(false);

    const show_counts = window.ENV.show_metadata_counts && props.show_counts;

    function on_set_source_filter(filter: string): void {
        dispatch(set_source_filter(filter));
    }

    function on_set_source_value(event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>, source_id: string, name: string, checked: boolean): void {
        dispatch(set_source_value({name: source_id, checked: checked}));
        let new_search_text = search_text;
        if (!checked) {
            new_search_text = remove_source_name(search_text, name);
            dispatch(update_search_text(new_search_text));
        }
        let new_values = copy(source_values);
        new_values[source_id] = checked;
        if (props.on_search)
            props.on_search({source_values: new_values, search_text: new_search_text});
    }

    function get_svg_icon_path(name: string): string {
        const select_items = get_source_list(source_list, source_values, source_filter, source_id_count)
            .filter(source => source.name === name);
        if (select_items.length > 0) {
            return get_icon_src(select_items[0]);
        }
        return 'default';
    }

    let display_source_list = get_source_list(source_list, source_values, source_filter, source_id_count);
    const max_size = 0;
    const has_reached_limit = max_size > 0 && display_source_list.length > max_size && !expand;
    if (has_reached_limit) {
        display_source_list = display_source_list.slice(0, max_size);
    }

    const select_all_sources = (b_select: boolean): void => {
        let new_values = copy(source_values);
        let new_search_text = search_text;
        for (const source of display_source_list) {
            if (source.sourceId) {
                dispatch(set_source_value({name: source.sourceId, checked: b_select}));
                new_values[source.sourceId as string] = b_select;
                if (!b_select) {
                    new_search_text = remove_source_name(new_search_text, source.name);
                }
            }
        }
        if (new_search_text !== search_text)
            dispatch(update_search_text(new_search_text));
        if (props.on_search)
            props.on_search({search_text: new_search_text, source_values: new_values});
    };

    const invert_all_sources = (): void => {
        let new_values = copy(source_values);
        let new_search_text = search_text;
        for (const source of display_source_list) {
            if (source.sourceId) {
                const b_value = !new_values[source.sourceId as string]
                dispatch(set_source_value({name: source.sourceId, checked: b_value}));
                new_values[source.sourceId as string] = b_value
                if (!b_value) {
                    new_search_text = remove_source_name(new_search_text, source.name);
                }
            }
        }
        if (new_search_text !== search_text)
            dispatch(update_search_text(new_search_text));
        if (props.on_search)
            props.on_search({search_text: new_search_text, source_values: new_values});
    };

    const limit = (text: string): string => {
        if (text.length > 20) {
            return text.substring(0, 20) + "..."
        }
        return text
    }

    return (
        <div className="source-selector-width list-group pt-1">
            <div className="mb-2">
                <span className="text-bold me-4">{t("Sources")}</span>
                <span title={t("select all sources")}>
                    <span className="source-links" onClick={() => select_all_sources(true)}>{t("Select all")}</span>
                </span>
                <span title={t("exclude sources")}>
                    <span className="source-links" onClick={() => invert_all_sources()}>{t("Exclude")}</span>
                </span>
                <span title={t("deselect all sources")}>
                    <span className="source-links-bold" onClick={() => select_all_sources(false)}>{t("Clear")}</span>
                </span>
            </div>
            <div className={theme === "light" ? "source-selector" : "source-selector-dark"}>
                <label className="overflow-hidden w-100 mb-2">
                    <input type="text" value={source_filter} placeholder={t("Filter by name...")}
                           className="source-selector-input"
                           disabled={busy}
                           readOnly={busy}
                           onFocus={() => set_expand(false)}
                           onChange={(event) => on_set_source_filter(event.target.value)}/>
                </label>
                {
                    display_source_list.map((item, i) => {
                        const count = source_id_count[item.sourceId as string] ? source_id_count[item.sourceId as string] : 0;
                        return (
                            <div className="d-flex ps-3 pe-3 no-select source-item-list" key={i}>
                                <input className="me-2 min-width" type="checkbox"
                                       checked={source_values[item.sourceId as string] === true}
                                       disabled={busy}
                                       readOnly={busy}
                                       onChange={(event) => on_set_source_value(event, item.sourceId as string, item.name, event.target.checked)}/>
                                <div className="d-flex justify-content-between flex-fill">
                                        <span title={"filter search results for only " + item.name + " sources. (id: " + item.sourceId + ")"}>
                                            <span>
                                                <img className={"sourceTypeIcon"} src={get_svg_icon_path(item.name)} alt="search"/>
                                            </span>
                                            {limit(item.name)}
                                        </span>
                                    <span className="small fst-italic"
                                          title={t("the current results contain ") + item.count + " " + item.name + t(" source types.")}></span>
                                    {show_counts && (count > 0) &&
                                        <span className="small fst-italic counter-colour"
                                              title={t("the current source has ") + (count.toLocaleString()) + t(" documents.")}>{count.toLocaleString()}</span>
                                    }
                                </div>
                            </div>
                        );
                    })
                }
            </div>
            {has_reached_limit &&
                <label className="list-group-item d-flex ps-3 pe-3 no-select"
                       title="has more items, click here to expand or use the filter to find such entities"
                       onClick={() => set_expand(!expand)}>
                    ...
                </label>
            }
        </div>
    );
}
