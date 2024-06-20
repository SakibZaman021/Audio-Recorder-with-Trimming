import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const RecordingIndicator = ({ isRecording }) => {
    const [recordingTime, setRecordingTime] = useState(0);

    useEffect(() => {
        let timer;
        if (isRecording) {
            timer = setInterval(() => {
                setRecordingTime((prevTime) => prevTime + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(timer);
    }, [isRecording]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        isRecording && <div className="recording-indicator">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-record-circle"
                viewBox="0 0 16 16"
            >
                <path d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zm1-8.5a.5.5 0 0 1 1 0v3a.5.5 0 0 1-1 0v-3z" />
            </svg>
            <span className="recording-time">{formatTime(recordingTime)}</span>
        </div>
    );
};

RecordingIndicator.propTypes = {
    isRecording: PropTypes.bool.isRequired,
};

export default RecordingIndicator;
