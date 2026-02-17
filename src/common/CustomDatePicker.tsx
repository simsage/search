import React, { ChangeEvent } from 'react';

interface DatePickerProps {
    label?: string;
    value: string;
    onDateChange: (date: string) => void;
    onClear: () => void;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({
                                                         label,
                                                         value,
                                                         onDateChange,
                                                         onClear
                                                     }) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const newValue = e.target.value;
        // If the user clears it using the browser's built-in "X"
        if (!newValue) {
            onClear();
        } else {
            onDateChange(newValue);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: 'fit-content' }}>
            {label && <label style={{ fontSize: '14px', color: '#888' }}>{label}</label>}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="date"
                    value={value}
                    onChange={handleChange}
                    // Some browsers show an 'X', this ensures it looks consistent
                    style={{
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                />

                {/* We always render the button or link here so it's visible */}
                <button
                    type="button"
                    onClick={onClear}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '0'
                    }}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default CustomDatePicker;
