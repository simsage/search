import './RangeSlider.css';
import {copy, unix_time_convert_to_date} from "../../common/Api";
import {Handles, Rail, Slider, Tracks} from "react-compound-slider";
import {Handle, SliderRail, Track} from "./range-slider/RangeComponent";
import {useState} from "react";
import {useDispatch} from "react-redux";
import {set_range_slider} from "../../reducers/searchSlice";
import {defined} from "../../common/Api";

export function RangeSlider(props) {
    const dispatch = useDispatch();

    const step_size = 3600 * 12;
    let data = copy(props.data);
    const title = props.title ? props.title : '';
    const domain = defined(data.minValue) && defined(data.maxValue) ? [data.minValue, data.maxValue] : [0, 100];
    const values = defined(data.currentMinValue) && defined(data.currentMaxValue) ? [data.currentMinValue, data.currentMaxValue] : [0, 100];
    const [update, set_update] = useState((defined(data.currentMinValue) && defined(data.currentMaxValue)) ? [data.currentMinValue, data.currentMaxValue] : [0, 100]);
    const reversed = false;
    const metadata = data.metadata;

    const sliderStyle = {
        position: 'relative',
        width: '100%',
    };

    function on_update(values) {
        set_update(values);
    }

    function on_change(values) {
        dispatch(set_range_slider({metadata: metadata, values: values}));
        let c_data = copy(data);
        c_data.currentMinValue = values[0];
        c_data.currentMaxValue = values[1];
        if (props.on_search) {
            if (c_data.metadata === "last-modified") {
                props.on_search({last_modified_slider: c_data})
            } else {
                props.on_search({created_slider: c_data})
            }
        }
    }

    return (
        <div className="range-slider mb-4 pb-2">
            <div className="slider-title">{title}</div>
            <div className="slider-label mb-2 d-flex justify-content-between">
                <span className="date-text">{unix_time_convert_to_date(update[0] * 1000)}</span>
                <span className="date-text">{unix_time_convert_to_date(update[1] * 1000)}</span>
            </div>
            <div className="slider-box px-2">
                <Slider
                    mode={1}
                    step={step_size}
                    domain={domain}
                    reversed={reversed}
                    rootStyle={sliderStyle}
                    onUpdate={on_update}
                    onChange={on_change}
                    values={values}
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
                                        disabled={props.busy === true}
                                        handle={handle}
                                        domain={domain}
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
                                        disabled={props.busy === true}
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
    )
}

