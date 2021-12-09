import React, { Component } from 'react';

import '../../css/category-selector.css';


export class CategorySelector extends Component {
    constructor(props){
        super(props);
        this.state={
            filter: '',
        }
    }
    getItems() {
        let items = this.props.items && this.props.items.length > 0 ? this.props.items : [];
        const trim_filter = this.state.filter.trim();
        items = items.sort((a, b) => (a.count > b.count) ? -1 : 1)
            .filter((item) => {return trim_filter.length === 0 || item.name.indexOf(trim_filter) >= 0 });
        return items;
    }
    onSetValue(name, checked) {
        if (this.props.onSetValue) {
            const value_map = this.props.values;
            value_map[name] = checked;
            this.props.onSetValue(value_map);
        }
    }
    getChecked(name) {
        return (this.props.values && this.props.values[name]);
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
                           onChange = {(event) => this.setState({filter: event.target.value}) } />
                </label>
                    {
                        this.getItems().map((item, i) => {
                            return (
                                // <div className="items-box" key={i}>
                                //     <span className="item-checkbox">
                                //         <input type="checkbox" checked={this.getChecked(item.name)}
                                //                onChange={(event) => this.onSetValue(item.name, event.target.checked)} />
                                //     </span>
                                //     <span className="item-name">{item.name}</span>
                                //     <span className="item-count" title={item.count + " " + item.name + " files"}>{item.count}</span>

                                        <label className="list-group-item d-flex ps-3 pe-3" key={i}>
                                            <input className="form-check-input me-2" type="checkbox" checked={this.getChecked(item.name)} onChange={(event) => this.onSetValue(item.name, event.target.checked)} />
                                            <div className="d-flex justify-content-between flex-fill">
                                                <span className="">{item.name}</span>
                                                
                                                <span className="small fst-italic">{item.count}</span>
                                            </div>
                                        </label>

                                // </div>
                            )
                        })
                    }
                {/* </div> */}
            </div>
        );
    }
}
