// src/components/LoadingSpinner.jsx
import React from 'react';

export const LoadingSpinner = ({ fullScreen = false }) => {
    const spinnerClasses = "animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 h-12 w-12";

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
                <div className={spinnerClasses}></div>
            </div>
        );
    }

    return <div className="flex items-center justify-center"><div className={spinnerClasses}></div></div>;
};

export default LoadingSpinner;