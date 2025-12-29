import React from 'react';
import styles from './AIBusyAnimation.module.css'

export const AIBusy = ({ theme = 'light' }) => {
    const textClass = `${theme === 'light' ? styles.simsageTextDark : styles.simsageText}`;
    return (
        <div className={styles.simsageBusyContainer}>
            <div className={styles.glowingOrb}></div>
            <div className={textClass}>please wait</div>
        </div>
    );
};
