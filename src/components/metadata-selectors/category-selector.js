import React, { Component } from 'react';

import '../../css/category-selector.css';


export class CategorySelector extends Component {
    constructor(props){
        super(props);
        this.state={
            filter: '',
            docTypes: {},
            expand_entities: false,
        }
    }
    getItems() {
        // these items are auto-sorted by highest count first - so the order might change when an item is selected
        // and changes the counts of all the objects in this data
        let items = this.props.items && this.props.items.length > 0 ? this.props.items : [];
        const trim_filter = this.state.filter.trim().toLowerCase();
        items = items.sort((a, b) => (a.count > b.count) ? -1 : 1)
            .filter((item) => {return trim_filter.length === 0 || item.name.toLowerCase().indexOf(trim_filter) >= 0 });
        return items;
    }
    onSetValue(name, checked) {
        const docTypes = {...this.state.docTypes};
        docTypes[name]=checked;
        this.setState({docTypes: docTypes});
        if (this.props.onSetValue) {
            const value_map = {};
            value_map[name] = checked;
            this.props.onSetValue(value_map);
        }
    }

    static getDerivedStateFromProps(props, state) {
        const newState = {...state}
        const md = props.metadata ? props.metadata : "document-type";
        if (props && props.hasOwnProperty("category_values") && props.category_values.hasOwnProperty(md)  && props.category_values[md].hasOwnProperty("value")) {
            newState.docTypes = props.category_values[md].value
        }else{
            newState.docTypes = {}
        }
        return newState
    }

    getChecked(name) {
        return this.state.docTypes[name]===true;
    }
    render() {
        // items: [] {name: "", count: #}
        let category_list = this.getItems();
        const max_size = window.ENV.max_filter_size ? window.ENV.max_filter_size : 0;
        const has_reached_limit = max_size > 0 && category_list.length > max_size && !this.state.expand_entities;
        if (has_reached_limit) {
            category_list = category_list.slice(0, max_size);
        }
        const has_results = this.props.has_results;
        const show_counts = this.props.show_counts ? this.props.show_counts : false;
        return (
            <div className="category-selector list-group pt-1">
                {category_list.length > 0 &&
                    <div className="selector-title">{this.props.title ? this.props.title : ""}</div>
                }
                {category_list.length > 0 &&
                    <label className="list-group-item p-0 overflow-hidden">
                        <input type="text" value={this.state.filter} placeholder="Filter type..."
                               className="py-2 px-3 w-100 border-0"
                               disabled={this.props.busy}
                               onFocus={() => this.setState({expand_entities: false})}
                               onChange={(event) => this.setState({filter: event.target.value})}/>
                    </label>
                }
                {
                    category_list.map((item, i) => {
                        return (
                                <label className="list-group-item bg-light d-flex ps-3 pe-3 no-select" key={i}>
                                    <input className="form-check-input me-2 min-width" type="checkbox"
                                           checked={this.getChecked(item.name)}
                                           disabled={this.props.busy}
                                           onChange={(event) => this.onSetValue(item.name, event.target.checked)} />
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
                           onClick={() => this.setState({expand_entities: !this.state.expand_entities})}>
                        ...
                    </label>
                }

            </div>
        );
    }
}
