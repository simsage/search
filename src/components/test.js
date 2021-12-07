import React, {Component} from 'react';

import '../css/test.css';

/**
 * this is the main DMS page
 */
export default class Test extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            my_error_title: 'default error title',
            my_error_message: 'default error message'
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    render() {
        if (this.state.has_error) {
            return <h1>test.js: Something went wrong.</h1>;
        }
        return (
            <div className="blue-rect"
                 onClick={() => this.props.onClick(this.state.my_error_title, this.state.my_error_message)} >
                <span>{this.props.text ? this.props.text : "not defined"}</span>
            </div>
        );
    }
}
