import React from "react";
import '../SearchResults.css';

import { SourceSelector } from "./SourceSelector";
import { MetadataSelector } from "./MetadataSelector";
import { useDispatch, useSelector } from "react-redux";
import {
    set_author,
    set_path,
    set_title,
    set_source_value,
    set_metadata_value, update_search_text, set_date_after, set_date_before,
} from "../../reducers/searchSlice";
import useWindowDimensions from "./useWindowDimensions";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch } from '../../store';
import {EntitySelector} from "./EntitySelector";
import {min_width} from "../../common/Api";
import CustomDatePicker from "../../common/CustomDatePicker";

/**
 * Props interface for the SearchResults component
 */
interface SideBarProps {
    on_search?: (values?: any) => void;
}

export function SideBar(props: SideBarProps): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();

    // get state
    const {
        source_list, search_text,
        busy, metadata_list, document_type_count, result_list,
        theme, author, title, path, after, before
    } = useSelector((state: RootState) => state.searchReducer);

    const d_set_author = (text: string): void => {
        dispatch(set_author(text))
    }
    const d_set_path = (text: string): void => {
        dispatch(set_path(text))
    }
    const d_set_title = (text: string): void => {
        dispatch(set_title(text))
    }
    const d_set_after = (after: string): void => {
        dispatch(set_date_after(after))
    }
    const d_set_before = (before: string): void => {
        dispatch(set_date_before(before))
    }

    const search_keydown = (event: React.KeyboardEvent): void => {
        if (event.key === "Enter") {
            if (props.on_search) props.on_search();
        }
    }

    const document_filter = theme === "light" ? "result-document-filter" : "result-document-filter-dark";
    const has_search_result = result_list.length > 0;

    const select_all_sources = (): void => {
        for (const source of source_list) {
            if (source.sourceId) {
                dispatch(set_source_value({name: source.sourceId, checked: false}));
            }
        }
    }

    const select_all_document_types = (): void => {
        if (metadata_list) {
            let metadata_item_list = null;
            for (const item of metadata_list) {
                if (item && item.items && item.metadata === "document-type") {
                    metadata_item_list = item.items;
                }
            }
            if (metadata_item_list && metadata_item_list.length > 0) {
                for (const item of metadata_item_list) {
                    dispatch(set_metadata_value({metadata: "document-type", name: item.name, checked: false}));
                }
            }
        }
    }

    const clear_entities = (): void => {
        let new_search_text = search_text;
        window.ENV.entity_list.forEach((entity) => {
            new_search_text = new_search_text
                .replace("entity: " + entity.value, "")
                .replace("entity:" + entity.value, "")
                .trim();
        })
        dispatch(update_search_text(new_search_text));
    }

    function on_clear_all(): void {
        select_all_sources()
        select_all_document_types()
        clear_entities()
        d_set_author("")
        d_set_path("")
        d_set_title("")
        d_set_after("")
        d_set_before("")
    }

    function search(values?: any): void {
        if (props.on_search) {
            props.on_search(values);
        }
    }

    return (
        <div className={theme === "light" ? "side-bar" : "side-bar-dark"}>
        {width && width > min_width &&
            <div className="sticky-top search-control-padding ps-4 pt-2 pb-lg-5 pe-3">

                <div className={document_filter + " query-builder-header"}>
                    <span className={"query-builder-text"}>Query Builder</span>
                    <span className="clear-all-link" onClick={() => on_clear_all()}>Clear all</span>
                </div>

                {/* AUTHOR, TITLE, and PATH filters */}
                <div className={document_filter + " row mt-2"} title={t("search for a specific author")}>
                    <div className="source-selector-width list-group pt-1">
                        <span>{t("author")}</span>
                        <span>
                            <label className="overflow-hidden w-100">
                            <input type="text" value={author}
                                   className="query-builder-main-input"
                                   disabled={busy}
                                   readOnly={busy}
                                   onKeyDown={(e) => search_keydown(e)}
                                   onChange={(event) => d_set_author(event.target.value)}/>
                            </label>
                        </span>
                    </div>
                </div>
                <div className={document_filter + " row"} title={t("search for a title or part of a title")}>
                    <div className="source-selector-width list-group pt-1">
                        <span>{t("title")}</span>
                        <span>
                            <label className="overflow-hidden w-100">
                            <input type="text" value={title}
                                   className="query-builder-main-input"
                                   disabled={busy}
                                   readOnly={busy}
                                   onKeyDown={(e) => search_keydown(e)}
                                   onChange={(event) => d_set_title(event.target.value)}/>
                            </label>
                        </span>
                    </div>
                </div>
                <div className={document_filter + " row mb-2"} title={t("search for a path/url or part of one")}>
                    <div className="source-selector-width list-group pt-1">
                        <span>{t("filename / path")}</span>
                        <span>
                            <label className="overflow-hidden w-100">
                            <input type="text" value={path}
                                   className="query-builder-main-input"
                                   disabled={busy}
                                   readOnly={busy}
                                   onKeyDown={(e) => search_keydown(e)}
                                   onChange={(event) => d_set_path(event.target.value)}/>
                            </label>
                        </span>
                    </div>
                </div>

                {/* SOURCE SELECTOR */}
                <div className={document_filter + " row pb-3"}>
                    {source_list &&
                        <SourceSelector
                            show_counts={true}
                            on_search={(value) => search({
                                ...value,
                                next_page: false
                            })}/>
                    }
                </div>

                {/* Date selectors */}
                <div className={document_filter + " row pb-4"}>
                    <span className="text-bold mb-2" style={{marginLeft: "-12px"}}>{t("Dates")}</span>
                    <CustomDatePicker value={after} onDateChange={(date) => d_set_after(date)} onClear={() => d_set_after("")} label="after" />
                    <CustomDatePicker value={before} onDateChange={(date) => d_set_before(date)} onClear={() => d_set_before("")} label="before" />
                </div>

                {/* DOCUMENT-TYPE/FILE-TYPE SELECTOR */}
                <div className={document_filter + " row"}>
                    {metadata_list && metadata_list.length >= 0 && metadata_list.map((item, index) => {
                        return (
                            <MetadataSelector key={"mds" + index}
                                              title={"Types"}
                                              busy={busy}
                                              metadata={item.metadata}
                                              has_results={has_search_result}
                                              on_search={(value) => search({
                                                  ...value,
                                                  next_page: false
                                              })}
                                              item_counts={document_type_count}
                                              list={item.items}/>
                        );
                    })
                    }
                </div>

                {/* ENTITY SELECTOR */}
                <div className={document_filter + " row pe-2"}>
                    {window.ENV.entity_list &&
                        <EntitySelector
                            on_search={(value) => search({
                                ...value,
                                next_page: false
                            })}/>
                    }
                </div>

                {/* SYNSET SELECTOR */}
                {/*<div className={document_filter + " row pe-2"}>*/}
                {/*    {*/}
                {/*        syn_set_list.map((syn_set, i) => {*/}
                {/*            return (*/}
                {/*                <div key={i}>*/}
                {/*                    <SynSetSelector*/}
                {/*                        key={"syn" + i}*/}
                {/*                        name={syn_set.word}*/}
                {/*                        syn_set_values={syn_set_values}*/}
                {/*                        on_search={(value) => search({...value, next_page: false})}*/}
                {/*                        busy={busy}*/}
                {/*                        description_list={syn_set.wordCloudCsvList}/>*/}
                {/*                </div>*/}
                {/*            );*/}
                {/*        })*/}
                {/*    }*/}
                {/*</div>*/}

            </div>
        }

        </div>
    )
}
