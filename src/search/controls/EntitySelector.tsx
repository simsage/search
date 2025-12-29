import './SourceSelector.css';
import { useSelector } from "react-redux";
import {
    update_search_text
} from "../../reducers/searchSlice";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch } from '../../store';
import { useDispatch as useReduxDispatch } from "react-redux";

// Use AppDispatch type for dispatch
const useAppDispatch = () => useReduxDispatch<AppDispatch>();

interface EntitySelectorProps {
    on_search?: (params: any) => void;
}

export function EntitySelector(props: EntitySelectorProps): JSX.Element {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const {
        busy, search_text, theme
    } = useSelector((state: RootState) => state.searchReducer);

    const is_selected = (entity: EntityName): boolean => {
        return search_text.indexOf("entity: " + entity.value)>=0 || search_text.indexOf("entity:" + entity.value)>=0
    }

    const select_entity = (event: any, entity: EntityName, selected: boolean) => {
        if (selected && !is_selected(entity)) {
            // select
            const new_search_text = (search_text + " entity: " + entity.value).trim();
            dispatch(update_search_text(new_search_text));
            if (props.on_search)
                props.on_search({search_text: new_search_text});
        } else if (!selected && is_selected(entity)) {
            // unselect
            const new_search_text = search_text
                .replace("entity: " + entity.value, "")
                .replace("entity:" + entity.value, "")
                .trim();
            dispatch(update_search_text(new_search_text));
            if (props.on_search)
                props.on_search({search_text: new_search_text});
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
        if (props.on_search)
            props.on_search({search_text: new_search_text});
    }


    return (
        <div className="source-selector-width list-group pt-1">
            <div className="mb-2">
                <span className="me-4 text-bold">{t("Entities")}</span>
                <span title={t("deselect all entities")}>
                    <span className="source-links-bold" onClick={() => clear_entities()}>{t("Clear")}</span>
                </span>
            </div>
            <div className={theme === "light" ? "source-selector" : "source-selector-dark"}>
                {
                    window.ENV.entity_list.map((entity, i) => {
                        return (
                            <div className="d-flex ps-3 pe-3 no-select source-item-list" key={i}>
                                <input className="me-2 min-width" type="checkbox"
                                       checked={is_selected(entity)}
                                       disabled={busy}
                                       readOnly={busy}
                                       onChange={(event) => select_entity(event, entity, event.target.checked)}/>
                                <div className="d-flex justify-content-between flex-fill">
                                    {entity.name}
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}
