import './SynsetSelector.css';
import {useDispatch} from "react-redux";
import {select_syn_set} from "../../reducers/searchSlice";
import {copy} from "../../common/Api";

export function SynSetSelector(props) {
    const dispatch = useDispatch();

    const name = props.name ? props.name : "";
    const description_list = props.description_list ? props.description_list : [];
    const syn_set_values = props.syn_set_values ? props.syn_set_values : {};

    function on_set_value(name, index, checked) {
        dispatch(select_syn_set({name: name.toLowerCase(), index: index, checked: checked}));
        if (props.on_search) {
            let new_syn_set_values = copy(syn_set_values);
            new_syn_set_values[name] = checked ? index : -1;
            props.on_search({syn_set_values: new_syn_set_values});
        }
    }

    if (!description_list || description_list.length === 0)
        return (<div />);

    function get_description(item) {
        if (item && item.split) {
            const parts = item.split(",");
            if (parts.length > 1) {
                return parts[0].trim() + ", " + parts[1].trim();
            }
            return parts[0].trim();
        }
        return "";
    }

    return (
        <div>
            <span className="selector-title" title={"please select a specific meaning for \"" + name + "\" below to search for more specific results."}>
            Meaning for: <i>{name}</i></span>
            <div className="category-selector list-group pt-1">
                {
                    description_list.map((item, i) => {
                        return (
                            <label className="list-group-item bg-light d-flex ps-3 pe-3 no-select" key={i}>
                                <input className="form-check-input me-2 min-width" type="checkbox" checked={syn_set_values[name] === i}
                                       onChange={(event) => on_set_value(name, i, event.target.checked)} />
                                <div className="d-flex justify-content-between flex-fill overflow-management">
                                    <span className="small" title={"select a meaning of \"" + name + "\" related to " + item}>{get_description(item)}</span>
                                </div>
                            </label>
                        )
                    })
                }
            </div>
        </div>
    );
}

