import './MetadataSelector.css';
import { useSelector } from "react-redux";
import { useState } from "react";
import { set_metadata_value } from "../../reducers/searchSlice";
import { copy } from "../../common/Api";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch } from '../../store';
import { useDispatch as useReduxDispatch } from "react-redux";
import {MetadataItemCount} from "../../types";

// Use AppDispatch type for dispatch
const useAppDispatch = () => useReduxDispatch<AppDispatch>();

interface MetadataSelectorProps {
    metadata?: string;
    title?: string;
    busy?: boolean;
    has_results?: boolean;
    on_search?: (params: any) => void;
    item_counts?: Record<string, number>;
    list?: Array<{name: string, count?: number}>;
}

export function MetadataSelector(props: MetadataSelectorProps): JSX.Element {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const { metadata_values, metadata_list, result_list,theme } = useSelector((state: RootState) => state.searchReducer);

    const metadata = props.metadata ? props.metadata : '';
    // selected values (if any)
    const values = metadata_values[metadata] ? copy(metadata_values[metadata]) : {};
    const busy = props.busy === true;

    // how many of each document type are present "document-type" -> count
    const item_counts = props.item_counts ? props.item_counts : {};

    const [expand, set_expand] = useState<boolean>(false);
    const [filter, set_filter] = useState<string>('');

    // set its value
    function on_set_metadata_value(name: string, checked: boolean): void {
        dispatch(set_metadata_value({metadata: metadata, name: name, checked: checked}));
        if (props.on_search) {
            let new_values = copy(metadata_values);
            const existing_values = new_values[metadata] ? new_values[metadata] : {};
            existing_values[name] = checked;
            new_values[metadata] = existing_values;
            props.on_search({metadata_values: new_values, search_page: 0});
        }
    }

    // select or unselect all metadata values for this item
    const select_all = (selected: boolean): void => {
        if (metadata_list && metadata) {
            let metadata_item_list = null;
            for (const item of metadata_list) {
                if (item && item.items && item.metadata === metadata) {
                    metadata_item_list = item.items;
                }
            }
            if (metadata_item_list && metadata_item_list.length > 0) {
                let new_values_set: Record<string, boolean> = {};
                for (const item of metadata_item_list) {
                    dispatch(set_metadata_value({metadata: metadata, name: item.name, checked: selected}));
                    new_values_set[item.name] = selected;
                }
                if (props.on_search) {
                    let new_values: Record<string, Record<string, boolean>> = {};
                    new_values[metadata] = new_values_set;
                    props.on_search({metadata_values: new_values});
                }
            }
        }
    };

    // invert the selection of all metadata values for this item
    const invert_all = (): void => {
        if (metadata_list && metadata) {
            let metadata_item_list = null;
            for (const item of metadata_list) {
                if (item && item.items && item.metadata === metadata) {
                    metadata_item_list = item.items;
                }
            }
            if (metadata_item_list && metadata_item_list.length > 0) {
                let new_values_set: Record<string, boolean> = {};
                for (const item of metadata_item_list) {
                    const new_value = !values[item.name];
                    dispatch(set_metadata_value({metadata: metadata, name: item.name, checked: new_value}));
                    new_values_set[item.name] = new_value;
                }
                if (props.on_search) {
                    let new_values: Record<string, Record<string, boolean>> = {};
                    new_values[metadata] = new_values_set;
                    props.on_search({metadata_values: new_values});
                }
            }
        }
    };

    // get a filtered and cut-off item-list
    function get_item_list(): { items: MetadataItemCount[], has_reached_limit: boolean } {
        //Pull in all sources
        let items = props.list ? copy(props.list) : [];
        const trim_filter = filter.trim().toLowerCase();
        // sort these items the complicated way
        let sorted_list: MetadataItemCount[] = [];
        // and then the items not yet selected
        for (const item of items) {
            if (item) {
                const newItem: MetadataItemCount = {
                    name: item.name,
                    count: item_counts[item.name] ? item_counts[item.name] : 0
                };
                sorted_list.push(newItem);
            }
        }

        // sort by total or name
        sorted_list = sorted_list.sort((a: MetadataItemCount, b: MetadataItemCount) => {
            if (a.count !== undefined && b.count !== undefined) {
                if (a.count < b.count) return 1
                if (a.count > b.count) return -1
            }
            return (a.name < b.name) ? -1 : 1
        })

        // apply the text filter if applicable - and filter items that have no count if there is a count
        sorted_list = sorted_list.filter((item) => {
            return (trim_filter.length === 0 ||
                item.name.toLowerCase().indexOf(trim_filter) >= 0);
            // && (item.count > 0 || values[item.name] === true)
        });

        const max_size = 0;
        const has_reached_limit = max_size > 0 && sorted_list.length > max_size && !expand;
        if (has_reached_limit) {
            sorted_list = sorted_list.slice(0, max_size);
        }
        return {items: sorted_list, has_reached_limit: has_reached_limit};
    }

    const has_results = result_list.length > 0;
    const show_counts = window.ENV.show_metadata_counts;
    const title = props.title ? props.title : '';
    const gil_results = get_item_list();
    const list = gil_results.items;
    const has_reached_limit = gil_results.has_reached_limit;

    return (
        <div className="document-type-selector-width list-group pt-1">
            {list.length >= 0 &&
                <>
                    <div className="mb-2">
                        <span className={"text-bold me-4"}>{title}</span>
                        <span title="select all document types">
                            <span className="metadata-links" onClick={() => select_all(true)}>{t("Select all")}</span>
                        </span>
                        <span title={t("exclude document types")}>
                            <span className="metadata-links" onClick={() => invert_all()}>{t("Exclude")}</span>
                        </span>
                        <span title="deselect all document types">
                            <span className="metadata-links-bold" onClick={() => select_all(false)}>{t("Clear")}</span>
                        </span>
                    </div>
                </>
            }
            <div className={(theme === "light" ? "metadata-name-boxes" : "metadata-name-boxes-dark") + " metadata-item-list"}>
                {list.length >= 0 &&
                    <label className="overflow-hidden w-100 mb-2">
                        <input type="text" value={filter} placeholder={t("Filter type...")}
                               className="metadata-selector-input"
                               disabled={busy}
                               readOnly={busy}
                               onFocus={() => set_expand(false)}
                               onChange={(event) => set_filter(event.target.value)}/>
                    </label>
                }
                {
                list.map((item, i) => {
                    return (
                        <label className="d-flex ps-3 pe-3 no-select" key={i}>
                            <input className="me-2 min-width" type="checkbox"
                                   checked={values[item.name] === true}
                                   readOnly={busy}
                                   disabled={busy}
                                   onChange={(event) => on_set_metadata_value(item.name, event.target.checked)} />
                            <div className="d-flex justify-content-between flex-fill">
                                <span className="" title={"filter search results for only " + item.name + " types."}>{item.name}</span>
                                {show_counts && ((item.count ? item.count : 0) > 0) && has_results &&
                                    <span className="small fst-italic counter-colour"
                                          title={"the current results contain " + (has_results ? item.count?.toLocaleString() : 0) + " " + item.name + " types."}>{(has_results ? item.count?.toLocaleString() : 0)}</span>
                                }
                            </div>
                        </label>
                    );
                })
                }
            </div>
            { has_reached_limit &&
                <label className="list-group-item d-flex ps-3 pe-3 no-select"
                       title="has more items, click here to expand or use the filter to find such entities"
                       onClick={() => set_expand(!expand)}>
                    ...
                </label>
            }
        </div>
    );
}
