import React, { Component } from 'react';

import '../../css/category-selector.css';

export class EntitySelector extends Component {
    constructor(props){
        super(props);
        this.state={
            filter: '',
            entitySet: {},
            expand_entities: false,
        }
    }
    getItems() {
        // these items are auto-sorted by highest count first - so the order might change when an item is selected
        // and changes the counts of all the objects in this data
        const trim_filter = this.state.filter.trim().toLowerCase();
        return window.ENV.entity_list.filter((item) => {return trim_filter.length === 0 || item.name.toLowerCase().indexOf(trim_filter) >= 0 });
    }
    onSetValue(name, checked) {
        const entitySet = {...this.state.entitySet};
        entitySet[name] = checked;
        this.setState({entitySet: entitySet});
        if (this.props.onSetValue) {
            const value_map = {};
            value_map[name] = checked;
            this.props.onSetValue(value_map);
        }
    }
    static getDerivedStateFromProps(props, state) {
        if (state && props) {
            const newState = {...state}
            if (props && props.hasOwnProperty("entity_values")) {
                newState.entitySet = props.entity_values;
            } else {
                newState.entitySet = {}
            }
            return newState
        }
    }

    getChecked(name) {
        return name && this.state.entitySet && this.state.entitySet[name]===true;
    }
    render() {
        let entity_list = this.getItems();
        const max_size = window.ENV.max_filter_size ? window.ENV.max_filter_size : 0;
        const has_reached_limit = max_size > 0 && entity_list.length > max_size && !this.state.expand_entities;
        if (has_reached_limit) {
            entity_list = entity_list.slice(0, max_size);
        }
        return (
            <div className="category-selector list-group pt-1">
                 <div className="selector-title">{this.props.title ? this.props.title : "Entities"}</div>
                <label className="list-group-item p-0 overflow-hidden">
                    <input type="text" value={this.state.filter} placeholder="Filter type..." className="py-2 px-3 w-100 border-0"
                           disabled={this.props.busy}
                           onFocus={() => this.setState({expand_entities: false})}
                           onChange = {(event) => this.setState({filter: event.target.value}) } />
                </label>
                {
                    entity_list.map((item, i) => {
                        return (
                                <label className="list-group-item bg-light d-flex ps-3 pe-3 no-select" key={i}>
                                    <input className="form-check-input me-2 min-width" type="checkbox"
                                           checked={this.getChecked(item.value)}
                                           disabled={this.props.busy}
                                           onChange={(event) => this.onSetValue(item.value, event.target.checked)} />
                                    <div className="d-flex justify-content-between flex-fill">
                                        <span className="" title={"find entities of type " + item.name}>{item.name}</span>
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
