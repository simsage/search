import React, { Component } from 'react';

import '../../css/category-selector.css';
import Api from "../../common/api";


export class SourceSelector extends Component {
    constructor(props){
        super(props);
        this.state={
            filter: '',
            sourceTypes: {},
            source_selection: {},
            expand_entities: false,
        }
    }
    getItems() {
        let items = this.props.items && this.props.items.length > 0 ? this.props.items : [];
        const trim_filter = this.state.filter.trim().toLowerCase();
        items = items.sort((a, b) => (a.type > b.type) ? -1 : 1)
            .filter((item) => { return trim_filter.length === 0 || this.state.sourceTypes[item.name]===true || item.name.toLowerCase().indexOf(trim_filter) >= 0 });
        return items;
    }
    onSetValue(name, checked) {
        if (this.props.onSetValue) {
            const source_selection = {...this.state.source_selection};
            source_selection[name] = checked;
            this.setState({source_selection: source_selection});
            this.props.onSetValue(source_selection);
        }
    }

    static getDerivedStateFromProps(props, state){
        const newState = {...state}
        newState.source_selection = props.source_selection;
        return newState;
    }

    getChecked(name) {
        return this.state.source_selection[name] === true;
    }

    getIconPath(name) {
        const selectedItemArray = this.getItems().filter(source=>source.name === name);
        if (selectedItemArray.length > 0) {
            const icon_name = Api.sourceTypeToIcon(selectedItemArray[0].sourceType);
            if (icon_name.indexOf('.') === -1)
                return "../images/icon/icon_ci-" + icon_name + ".svg";
            else
                return "../images/icon/" + icon_name;
        }
    }

    render() {
        // items: [] {name: "", count: #}
        let source_list = this.getItems();
        const max_size = window.ENV.max_filter_size ? window.ENV.max_filter_size : 0;
        const has_reached_limit = max_size > 0 && source_list.length > max_size && !this.state.expand_entities;
        if (has_reached_limit) {
            source_list = source_list.slice(0, max_size);
        }
        return (
            <div className="category-selector list-group pt-1">
                 <div className="selector-title">{this.props.title ? this.props.title : ""}</div>
                <label className="list-group-item p-0 overflow-hidden">
                    <input type="text" value={this.state.filter} placeholder="Filter type..." className="py-2 px-3 w-100 border-0"
                           disabled={this.props.busy}
                           onFocus={() => this.setState({expand_entities: false})}
                           onChange = {(event) => this.setState({filter: event.target.value}) } />
                </label>
                {
                    source_list.map((item, i) => {
                        return (
                                <label className="list-group-item bg-light d-flex ps-3 pe-3 no-select" key={i}>
                                    <input className="form-check-input me-2 min-width" type="checkbox"
                                           checked={this.getChecked(item.name)}
                                           disabled={this.props.busy}
                                           onChange={(event) => this.onSetValue(item.name, event.target.checked)} />
                                    <div className="d-flex justify-content-between flex-fill">
                                        <span title={"filter search results for only " + item.name + " sources."}><span>
                                            <img className="sourceTypeIcon" src={this.getIconPath(item.name)} alt="search"/>
                                        </span>{item.name}</span>
                                        <span className="small fst-italic" title={"the current results contain " + item.count + " " + item.name + " source types."}></span>
                                    </div>
                                </label>
                        )
                    })
                }
                { has_reached_limit &&
                    <label className="list-group-item bg-light d-flex ps-3 pe-3 no-select"
                       title="has more items, click here to expand or use the filter to find such entities"
                       onClick={() => this.setState({expand_entities: !this.state.expand_entities})}>
                        ...
                    </label>
                }
            </div>
        );
    }
}
