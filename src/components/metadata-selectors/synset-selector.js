import React, { Component } from 'react';

import '../../css/category-selector.css';


export class SynsetSelector extends Component {
    constructor(props){
        super(props);
        this.state={
        }
    }
    getItems() {
        let items = this.props.items && this.props.items.length > 0 ? this.props.items : [];
        items = items.sort((a, b) => (a.count > b.count) ? -1 : 1);
        return items;
    }
    getChecked(name, index, syn_sets) {
        if (syn_sets)
            return syn_sets[name] === index;
        return false;
    }
    onSetValue(name, i, value) {
        if (value) {
            if (this.props.onSelectSynSet)
                this.props.onSelectSynSet(name, i);
        } else {
            if (this.props.onSelectSynSet)
                this.props.onSelectSynSet(name, -1);
        }
    }
    render() {
        // items: [] {name: "", description: ""}
        return (
            <div className="w-100 result-document-filter pb-4">
            <span title={"please select a specific meaning for \"" + this.props.name + "\" below to search for more specific results."}>
            Meaning for: <b>{this.props.name}</b></span>
            <div className="category-selector list-group pt-1">
            {
                this.props.description_list.map((item, i) => {
                    return (
                        <label className="list-group-item bg-light d-flex ps-3 pe-3 no-select" key={i}>
                            <input className="form-check-input me-2" type="checkbox" checked={this.getChecked(this.props.name, i, this.props.syn_sets)}
                                   onChange={(event) => this.onSetValue(this.props.name, i, event.target.checked)} />
                            <div className="d-flex justify-content-between flex-fill">
                                <span className="" title={"select a meaning of \"" + this.props.name + "\" related to " + item}>{item}</span>
                            </div>
                        </label>
                    )
                })
            }
            </div>
            </div>
        );
    }
}
