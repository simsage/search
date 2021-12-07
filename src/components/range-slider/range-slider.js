import React, { Component } from 'react';
import { Slider, Rail, Handles, Tracks } from 'react-compound-slider';
import { SliderRail, Handle, Track } from './range-components';

import '../../css/range-slider.css';
import Api from "../../common/api";

// see: https://github.com/sghall/react-compound-slider

const sliderStyle = {
    position: 'relative',
    width: '100%',
};

export class RangeSlider extends Component {
    constructor(props){
        super(props);
        this.state={
            domain: props.domain && props.domain.length === 2 ? props.domain : [0, 100],
            values: props.values && props.values.length === 2 ? props.values : [0, 100],
            update: props.values && props.values.length === 2 ? props.values : [0, 100],
            reversed: false,
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            domain: nextProps.domain && nextProps.domain.length === 2 ? nextProps.domain : [0, 100],
            values: nextProps.values && nextProps.values.length === 2 ? nextProps.values : [0, 100],
            update: nextProps.values && nextProps.values.length === 2 ? nextProps.values : [0, 100],
        });
    }
    onUpdate = (update) => {
        this.setState({ update: update });
    };

    onChange = (values) => {
        this.setState({ values: values });
        if (this.props.onSetValue) {
            this.props.onSetValue(values);
        }
    };

    setDomain = (domain) => {
        this.setState({ domain: domain });
    };

    toggleReverse = () => {
        this.setState(prev => ({ reversed: !prev.reversed }));
    };

    render() {
        const step_size = 3600 * 12;
        return (
            <div className="range-slider mb-4 pb-2">
                <div className="slider-title">{this.props.title}</div>
                <div className="slider-label mb-2 d-flex justify-content-between">
                    <span className="date-text">{Api.unixTimeConvertToDate(this.state.update[0] * 1000)}</span>
                    {/* <span className="date-hyphen">-</span> */}
                    <span className="date-text">{Api.unixTimeConvertToDate(this.state.update[1] * 1000)}</span>
                </div>
                <div className="slider-box px-2">
                    <Slider
                        mode={1}
                        step={step_size}
                        domain={this.state.domain}
                        reversed={this.state.reversed}
                        rootStyle={sliderStyle}
                        onUpdate={this.onUpdate}
                        onChange={this.onChange}
                        values={this.state.values}
                    >
                        <Rail>
                            {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
                        </Rail>
                        <Handles>
                            {({ handles, getHandleProps }) => (
                                <div className="slider-handles">
                                    {handles.map(handle => (
                                        <Handle
                                            key={handle.id}
                                            handle={handle}
                                            domain={this.state.domain}
                                            getHandleProps={getHandleProps}
                                        />
                                    ))}
                                </div>
                            )}
                        </Handles>
                        <Tracks left={false} right={false}>
                            {({ tracks, getTrackProps }) => (
                                <div className="slider-tracks">
                                    {tracks.map(({ id, source, target }) => (
                                        <Track
                                            key={id}
                                            source={source}
                                            target={target}
                                            getTrackProps={getTrackProps}
                                        />
                                    ))}
                                </div>
                            )}
                        </Tracks>
                    </Slider>
                </div>
            </div>
        );
    }
}
