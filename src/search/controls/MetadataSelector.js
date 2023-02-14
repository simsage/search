import './MetadataSelector.css';
import {useDispatch, useSelector} from "react-redux";
import {useState} from "react";
import {set_metadata_value} from "../../reducers/searchSlice";
import {copy, defined} from "../../common/Api";

export function MetadataSelector(props) {
    const dispatch = useDispatch();

    const {metadata_values, result_list} = useSelector((state) => state.searchReducer);

    const metadata = props.metadata ? props.metadata : '';
    const values = metadata_values[metadata] ? copy(metadata_values[metadata]) : {};
    const busy = props.busy === true;

    const [expand, set_expand] = useState(false);
    const [filter, set_filter] = useState('');

    // set its value
    function on_set_metadata_value(name, checked) {
        dispatch(set_metadata_value({metadata: metadata, name: name, checked: checked}));
        if (props.on_search) {
            let new_values = copy(metadata_values);
            const existing_values = new_values[metadata] ? new_values[metadata] : {};
            existing_values[name] = checked;
            new_values[metadata] = existing_values;
            props.on_search({metadata_values: new_values});
        }
    }

    // get a filtered and cut-off item-list
    function get_item_list() {
        //Pull in all sources
        let items = props.list ? copy(props.list) : [];
        const trim_filter = filter.trim().toLowerCase();
        // sort by name
        items = items.sort((a, b) => (a.name < b.name) ? -1 : 1)
        // sort these items the complicated way
        let sorted_list = [];
        for (const item of items) {
            if (values && item && values[item.name] === true) {
                sorted_list.push(item);
            }
        }
        // and then the items not yet selected
        for (const item of items) {
            if (values && item && values[item.name] !== true) {
                sorted_list.push(item);
            }
        }
        // apply the text filter if applicable - and filter items that have no count if there is a count
        sorted_list = sorted_list.filter((item) => { return (trim_filter.length === 0 ||
                                       item.name.toLowerCase().indexOf(trim_filter) >= 0) &&
                                       (!defined(item.count) || item.count > 0)
                               });
        const max_size = window.ENV.max_filter_size ? window.ENV.max_filter_size : 0;
        const has_reached_limit = max_size > 0 && sorted_list.length > max_size && !expand;
        if (has_reached_limit) {
            sorted_list = sorted_list.slice(0, max_size);
        }
        return {items: sorted_list, has_reached_limit: has_reached_limit};
    }

    const has_results = result_list.length > 0;
    const show_counts = window.ENV.show_metadata_counts === true;
    const title = props.title ? props.title : '';
    const gil_results = get_item_list();
    const list = gil_results.items;
    const has_reached_limit = gil_results.has_reached_limit;

    return (
        <div className="category-selector list-group pt-1">
            {list.length > 0 &&
                <div className="selector-title">{title}</div>
            }
            {list.length > 0 &&
                <label className="list-group-item p-0 overflow-hidden">
                    <input type="text" value={filter} placeholder="Filter type..."
                           className="py-2 px-3 w-100 border-0"
                           disabled={busy}
                           readOnly={busy}
                           onFocus={() => set_expand(false)}
                           onChange={(event) => set_filter(event.target.value)}/>
                </label>
            }
            {
                list.map((item, i) => {
                    return (
                        <label className="list-group-item bg-light d-flex ps-3 pe-3 no-select" key={i}>
                            <input className="form-check-input me-2 min-width" type="checkbox"
                                   checked={values[item.name] === true}
                                   readOnly={busy}
                                   disabled={busy}
                                   onChange={(event) => on_set_metadata_value(item.name, event.target.checked)} />
                            <div className="d-flex justify-content-between flex-fill">
                                <span className="" title={"filter search results for only " + item.name + " types."}>{item.name}</span>
                                {show_counts &&
                                    <span className="small fst-italic"
                                          title={"the current results contain " + (has_results ? item.count : 0) + " " + item.name + " types."}>{(has_results ? item.count : 0)}</span>
                                }
                            </div>
                        </label>
                    )
                })
            }
            { has_reached_limit &&
                <label className="list-group-item bg-light d-flex ps-3 pe-3 no-select"
                       title="has more items, click here to expand or use the filter to find such entities"
                       onClick={() => set_expand(!expand)}>
                    ...
                </label>
            }

        </div>
    )
}

