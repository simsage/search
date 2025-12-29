import React, { useState } from 'react';
import {FeedbackData} from "../types";

interface FeedbackDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FeedbackData) => void;
    technical?: string;
    isDarkMode?: boolean; // New prop for dark mode
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ isOpen, onClose, onSubmit, technical = '', isDarkMode = false }) => {
    const [reasons, setReasons] = useState<string[]>([]);
    const [comment, setComment] = useState<string>('');
    // feedback box is 500 characters max
    const CHAR_LIMIT = 500

    const reason_list = [
        'Top documents are not relevant to my search',
        'Content is inaccurate or misleading',
        'Link is broken or the page won\'t load',
        'It looks like spam or is low quality'
    ]

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        if (checked) {
            setReasons((prev) => [...prev, value]);
        } else {
            setReasons((prev) => prev.filter((reason) => reason !== value));
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit({ reasons, comment, technical });
        setReasons([]);
        setComment('');
    };

    if (!isOpen) {
        return null;
    }

    // --- Dynamic Styles based on isDarkMode ---
    const styles: { [key: string]: React.CSSProperties } = {
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000,
        },
        dialog: {
            backgroundColor: isDarkMode ? '#333' : '#ffffff', // Dark mode background
            color: isDarkMode ? '#eee' : '#333', // Dark mode text color
            padding: '25px', borderRadius: '8px',
            width: '90%', maxWidth: '450px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)', // Slightly darker shadow
            fontFamily: 'sans-serif',
        },
        header: {
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '20px',
        },
        title: { margin: 0, fontSize: '1.25rem', color: isDarkMode ? '#eee' : '#333' },
        closeButton: {
            border: 'none', background: 'transparent', fontSize: '1.5rem',
            cursor: 'pointer', color: isDarkMode ? '#aaa' : '#888',
        },
        formGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '10px', fontWeight: 'bold', color: isDarkMode ? '#ccc' : '#555' },
        checkboxLabel: {
            display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer',
            color: isDarkMode ? '#ccc' : '#333', // Checkbox label color
        },
        checkbox: { marginRight: '10px' },
        textarea: {
            width: '100%', padding: '10px', borderRadius: '4px',
            border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`, // Dark mode border
            backgroundColor: isDarkMode ? '#444' : '#fff', // Dark mode input background
            color: isDarkMode ? '#eee' : '#333', // Dark mode input text color
            minHeight: '80px', boxSizing: 'border-box',
        },
        charCounter: {
            fontSize: '0.8rem',
            color: isDarkMode ? '#aaa' : '#888',
            textAlign: 'right',
            marginTop: '5px',
        },
        buttonContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
        button: { padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
        submitButton: {
            backgroundColor: isDarkMode ? '#0056b3' : '#007bff', // Darker blue for dark mode
            color: 'white',
        },
        cancelButton: {
            backgroundColor: isDarkMode ? '#555' : '#f0f0f0', // Darker grey for dark mode
            color: isDarkMode ? '#eee' : '#333',
        },
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Why was this result not helpful?</h3>
                    <button style={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Please select one or more reasons:</label>
                        {reason_list.map((reason) => (
                            <label key={reason} style={styles.checkboxLabel}>
                                <input type="checkbox" value={reason} onChange={handleCheckboxChange} style={styles.checkbox}/>
                                {reason}
                            </label>
                        ))}
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="comment" style={styles.label}>Additional comments (optional):</label>
                        <textarea
                            id="comment" style={styles.textarea} value={comment}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                            placeholder="Tell us more..."
                            maxLength={CHAR_LIMIT}
                        />
                    </div>
                    <div style={styles.charCounter}>
                        {comment.length} / {CHAR_LIMIT}
                    </div>
                    <div style={styles.buttonContainer}>
                        <button type="button" style={{...styles.button, ...styles.cancelButton}} onClick={onClose}>Cancel</button>
                        <button type="submit" style={{...styles.button, ...styles.submitButton}}>Submit Feedback</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FeedbackDialog;
