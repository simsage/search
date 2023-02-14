import * as React from 'react';

// *******************************************************
// RAIL
// *******************************************************

export const SliderRail = ({ getRailProps }) => {
    return (
        <>
            <div className="rail-outer-style" {...getRailProps()} />
            <div className="rail-inner-style" />
        </>
    );
};

// *******************************************************
// HANDLE COMPONENT
// *******************************************************

export const Handle = ({
      domain: [min, max],
      handle: { id, value, percent },
      disabled = false,
      getHandleProps,
  }) => {
    return (
        <>
            <div
                style={{
                    left: `${percent}%`,
                    position: 'absolute',
                    transform: 'translate(-50%, -50%)',
                    WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                    zIndex: 5,
                    width: 28,
                    height: 42,
                    cursor: 'pointer',
                    backgroundColor: 'none',
                }}
                {...getHandleProps(id)}
            />
            <div
                role="slider"
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={value}
                style={{
                    left: `${percent}%`,
                    position: 'absolute',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    // boxShadow: '1px 1px 1px 1px rgba(0, 0, 0, 0.3)',
                    backgroundColor: disabled ? '#666' : '#fff',
                    border: '2px solid #1c9bd2',
                }}
            />
        </>
    );
};

// *******************************************************
// KEYBOARD HANDLE COMPONENT
// Uses a button to allow keyboard events
// *******************************************************
export const KeyboardHandle = ({
          domain: [min, max],
          handle: { id, value, percent },
          disabled = false,
          getHandleProps,
      }) => {
    return (
        <button
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            style={{
                left: `${percent}%`,
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                width: 14,
                height: 14,
                borderRadius: '50%',
                // boxShadow: '1px 1px 1px 1px rgba(0, 0, 0, 0.3)',
                backgroundColor: disabled ? '#666' : '#fff',
                border: '1px solid #1c9bd2',
            }}
            {...getHandleProps(id)}
        />
    );
};

// *******************************************************
// TRACK COMPONENT
// *******************************************************

export const Track = ({
                source,
                target,
                getTrackProps,
                disabled = false,
            }) => {
    return (
        <div
            style={{
                position: 'absolute',
                transform: 'translate(0%, -50%)',
                height: 2,
                zIndex: 1,
                backgroundColor: disabled ? '#999' : '#1c9bd2',
                borderRadius: 7,
                cursor: 'pointer',
                left: `${source.percent}%`,
                width: `${target.percent - source.percent}%`,
            }}
            {...getTrackProps()}
        />
    );
};
