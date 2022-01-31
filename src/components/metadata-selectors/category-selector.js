import React, { Component } from 'react';

import '../../css/category-selector.css';


export class CategorySelector extends Component {
    constructor(props){
        super(props);
        this.state={
            filter: '',
            selected_value: '',
        }
    }
    getItems() {
        let items = this.props.items && this.props.items.length > 0 ? this.props.items : [];
        const trim_filter = this.state.filter.trim();
        items = items.sort((a, b) => (a.count > b.count) ? -1 : 1)
            .filter((item) => {return trim_filter.length === 0 || item.name === this.state.selected_value || item.name.indexOf(trim_filter) >= 0 });
        return items;
    }
    onSetValue(name, checked) {
        if (checked)
            this.setState({selected_value: name});
        else
            this.setState({selected_value: ""});
        if (this.props.onSetValue) {
            const value_map = {};
            value_map[name] = checked;
            this.props.onSetValue(value_map);
        }
    }
    getChecked(name) {
        return this.state.selected_value === name;
    }
    render() {
        // items: [] {name: "", count: #}
        return (
            <div className="category-selector list-group pt-1">
                {/* <div className="selector-title">{this.props.title ? this.props.title : ""}</div> */}
                {/* <div>
                    <input type="text" value={this.state.filter} placeholder="filter"
                           onChange = {(event) => this.setState({filter: event.target.value}) } />
                </div> */}
                {/* <div> */}
                <label className="list-group-item p-0 overflow-hidden">
                    <input type="text" value={this.state.filter} placeholder="Filter type..." className="py-2 px-3 w-100 border-0"
                           disabled={this.props.busy}
                           onChange = {(event) => this.setState({filter: event.target.value}) } />
                </label>
                    {
                        this.getItems().map((item, i) => {
                            return (
                                    <label className="list-group-item bg-light d-flex ps-3 pe-3 no-select" key={i}>
                                        <input className="form-check-input me-2" type="checkbox"
                                               checked={this.getChecked(item.name)}
                                               disabled={this.props.busy}
                                               onChange={(event) => this.onSetValue(item.name, event.target.checked)} />
                                        <div className="d-flex justify-content-between flex-fill">
                                            <span className="" title={"filter search results for only " + item.name + " types."}>{item.name}</span>
                                            <span className="small fst-italic" title={"the current results contain " + item.count + " " + item.name + " types."}>{item.count}</span>
                                        </div>
                                    </label>
                            )
                        })
                    }
                {/* </div> */}
            </div>
        );
    }
}
