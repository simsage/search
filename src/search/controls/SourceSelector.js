import './SourceSelector.css';
import {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {set_source_filter, set_source_value} from "../../reducers/searchSlice";
import {copy, source_type_to_icon} from "../../common/Api";

export function SourceSelector(props) {
    const dispatch = useDispatch();

    const {
        source_values, source_list, source_id_count, source_filter, busy
    } = useSelector((state) => state.searchReducer);

    const [expand, set_expand] = useState(false);

    const show_counts = window.ENV.show_metadata_counts === true;

    function on_set_source_filter(filter) {
        dispatch(set_source_filter(filter));
    }

    function on_set_source_value(event, name, checked) {
        dispatch(set_source_value({name: name, checked: checked}));
        let new_values = copy(source_values);
        new_values[name] = checked;
        if (props.on_search)
            props.on_search({source_values: new_values});
    }

    function get_source_list() {
        //Pull in all sources
        let items = source_list && source_list.length > 0 ? source_list : [];
        let source_group_list = []
        //If the override grouping exists we add their names to the groupItems array
        if (window.ENV.override_source_list && window.ENV.override_source_list.length > 0) {
            window.ENV.override_source_list.forEach((obj) => {
                let temp = {name: obj.name, sources: []}
                source_group_list.push(temp)
            })
        }

        //Adding in items as an individual or into their group.
        items.forEach((item) => {
            if (window.ENV.override_source_list && window.ENV.override_source_list.length > 0) {
                let inGroup = false
                for (let i = 0; i < window.ENV.override_source_list.length; i++) {
                    if (window.ENV.override_source_list[i].sources.includes(item.name)) {
                        source_group_list[i].sources.push(item);
                        inGroup = true;
                    }
                }
                if (inGroup === false) {
                    let temp = {name: item.name, sources: [item]};
                    source_group_list.push(temp);
                }
            } else {
                source_group_list.push(item);
            }
        })

        const trim_filter = source_filter.trim().toLowerCase();
        source_group_list = source_group_list.sort((a, b) => (a.type > b.type) ? -1 : 1)
            .filter((item) => {
                return trim_filter.length === 0 ||
                    source_values[item.name] === true ||
                    item.name.toLowerCase().indexOf(trim_filter) >= 0
            });
        return source_group_list;
    }

    function get_icon_path(name) {
        const select_items = get_source_list().filter(source => source.name === name);
        if (select_items.length > 0) {
            const icon_name = source_type_to_icon(select_items[0].sourceType);
            if (icon_name.indexOf('.') === -1)
                return window.ENV.image_base_name + "/images/icon_ci-" + icon_name + ".svg";
            else
                return window.ENV.image_base_name + "/images/" + icon_name;
        }
    }

    let display_source_list = get_source_list();
    const max_size = 0;
    const has_reached_limit = max_size > 0 && display_source_list.length > max_size && !expand;
    if (has_reached_limit) {
        display_source_list = display_source_list.slice(0, max_size);
    }

    return (
        <div className="source-selector-width list-group pt-1 float-end">
            <div className="selector-title">Sources</div>
            <label className="list-group-item p-0 overflow-hidden">
                <input type="text" value={source_filter} placeholder="Filter type..."
                       className="py-2 px-3 w-100 border-0"
                       disabled={busy}
                       readOnly={busy}
                       onFocus={() => set_expand(false)}
                       onChange={(event) => on_set_source_filter(event.target.value)}/>
            </label>
            <div className="source-selector">
                {
                    display_source_list.map((item, i) => {
                        const count = source_id_count[item.sourceId] ? source_id_count[item.sourceId] : 0;
                        return (
                            <div className="list-group-item bg-light d-flex ps-3 pe-3 no-select" key={i}>
                                <input className="form-check-input me-2 min-width" type="checkbox"
                                       checked={source_values[item.name] === true}
                                       disabled={busy}
                                       readOnly={busy}
                                       onChange={(event) => on_set_source_value(event, item.name, event.target.checked)}/>
                                <div className="d-flex justify-content-between flex-fill">
                                        <span title={"filter search results for only " + item.name + " sources."}><span>
                                            <img className="sourceTypeIcon" src={get_icon_path(item.name)}
                                                 alt="search"/>
                                        </span>{item.name}</span>
                                    <span className="small fst-italic"
                                          title={"the current results contain " + item.count + " " + item.name + " source types."}></span>
                                    {show_counts && (count > 0) &&
                                        <span className="small fst-italic"
                                              title={"the current source has " + (count) + " documents."}>{count}</span>
                                    }
                                </div>
                            </div>
                        )
                    })
                }


            </div>
            {has_reached_limit &&
                <label className="list-group-item bg-light d-flex ps-3 pe-3 no-select"
                       title="has more items, click here to expand or use the filter to find such entities"
                       onClick={() => set_expand(!expand)}>
                    ...
                </label>
            }
        </div>
    )
}

