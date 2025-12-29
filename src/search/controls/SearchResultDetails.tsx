import {SearchResult, SourceItem} from "../../types";
import {useSelector} from "react-redux";
import {RootState} from "../../store";
import React from "react";
import {
    map_url,
    get_archive_child_last,
    get_archive_parent,
    get_icon_for_source_type,
    is_archive_file,
    unix_time_convert
} from "../../common/Api";
import CopyToClipboard from "../../common/CopyToClipboard";
import {useTranslation} from "react-i18next";


interface SearchResultDetailsProps {
    result: SearchResult;
}

export function SearchResultDetails(props: SearchResultDetailsProps): JSX.Element {

    const { t } = useTranslation();
    const {source_list, show_source_icon, theme} = useSelector((state: RootState) => state.searchReducer);
    // does this user have the "tagger" role?
    const result = props.result;

    const result_details = theme === "light" ? "result-details" : "result-details-dark"
    const results_details_title = theme === "light" ? "result-details-title" : "result-details-title-dark"
    const last_modified = unix_time_convert(result.lastModified);
    // Prefer the metadata url to the doc's url as the later might be the source id (Sharepoint)
    const u1 = result.metadata["{url}"] && result.metadata["{url}"].trim().length > 0 ? result.metadata["{url}"] : result.url
    const url = map_url(result.sourceId, u1)

    const source_set: Record<string, SourceItem | undefined> = {}
    let source_type = ""
    if (source_list && source_list.length > 0) {
        for (const source of source_list) {
            source_set[source.sourceId] = source;
        }
        if (result && result.sourceId && source_set.hasOwnProperty(result.sourceId)) {
            source_type = source_set[result.sourceId]?.sourceType ?? ""
        }
    }

    return (
        <div className="d-flex align-items-center mb-0 mt-1">
            <span className={result_details + " mb-0"} style={{ cursor: 'default'}}
                  title={t("Last modified") + " " + last_modified}>{t("Last modified")} {last_modified}</span>
            <span className={result_details + " mb-0 mx-2"}>|</span>
            {result.author &&
                <span className="d-flex align-items-center" style={{ cursor: 'default'}}>
                                    <span className={result_details + " mb-0"} title={result.author}>{result.author}</span>
                                    <span className={result_details + " mb-0 mx-2"}>|</span>
                                </span>
            }
            {!show_source_icon &&
            <span style={{width: "24px", height: "24px", marginRight: "5px"}}>
                <img src={get_icon_for_source_type(source_type)} alt="type" style={{width: "24px", height: "24px"}} />
            </span>
            }
            {is_archive_file(url) &&
                <CopyToClipboard
                    web_url={url}
                    url={(result.url !== url ? result.url : undefined)}
                    urlId={result.urlId}
                    title={get_archive_child_last(url) + " inside " + get_archive_parent(url)}
                    extra_style={results_details_title}
                    text_limit={80}
                />
            }
            {!is_archive_file(url) &&
                <CopyToClipboard
                    web_url={url}
                    url={(result.url !== url ? result.url : undefined)}
                    urlId={result.urlId}
                    title={undefined}
                    extra_style={results_details_title}
                    text_limit={80}
                />
            }
        </div>
    )

}

