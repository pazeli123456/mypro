import React, { useState, useEffect, useCallback } from 'react';

export const NotificationType = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

const NotificationsManager = () => {
    const [notifications, setNotifications] = useState([]);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const addNotification = useCallback((type, title, message, duration = 5000) => {
        const id = Date.now();
        
        setNotifications(prev => [...prev, { id, type, title, message }]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, [removeNotification]);

    // חשיפת הפונקציות גלובלית
    useEffect(() => {
        window.notifications = {
            success: (title, message, duration) => 
                addNotification(NotificationType.SUCCESS, title, message, duration),
            error: (title, message, duration) => 
                addNotification(NotificationType.ERROR, title, message, duration),
            warning: (title, message, duration) => 
                addNotification(NotificationType.WARNING, title, message, duration),
            info: (title, message, duration) => 
                addNotification(NotificationType.INFO, title, message, duration),
            remove: removeNotification
        };

        return () => {
            delete window.notifications;
        };
    }, [addNotification, removeNotification]);

    const getNotificationStyles = (type) => {
        const baseStyles = 'rounded-md p-4 mb-2 shadow-lg transform transition-all duration-300 hover:scale-105';
        
        switch (type) {
            case NotificationType.SUCCESS:
                return `${baseStyles} bg-green-50 text-green-800 border border-green-200`;
            case NotificationType.ERROR:
                return `${baseStyles} bg-red-50 text-red-800 border border-red-200`;
            case NotificationType.WARNING:
                return `${baseStyles} bg-yellow-50 text-yellow-800 border border-yellow-200`;
            case NotificationType.INFO:
                return `${baseStyles} bg-blue-50 text-blue-800 border border-blue-200`;
            default:
                return baseStyles;
        }
    };

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 min-w-[300px] max-w-[400px]">
            {notifications.map(({ id, type, title, message }) => (
                <div key={id} className={getNotificationStyles(type)}>
                    <div className="flex justify-between items-start">
                        <div>
                            {title && (
                                <h3 className="text-sm font-medium mb-1">{title}</h3>
                            )}
                            <p className="text-sm">{message}</p>
                        </div>
                        <button
                            onClick={() => removeNotification(id)}
                            className="ml-4 text-sm font-medium opacity-70 hover:opacity-100"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Helper functions for easy access
export const showSuccess = (title, message, duration) => 
    window.notifications?.success(title, message, duration);

export const showError = (title, message, duration) => 
    window.notifications?.error(title, message, duration);

export const showWarning = (title, message, duration) => 
    window.notifications?.warning(title, message, duration);

export const showInfo = (title, message, duration) => 
    window.notifications?.info(title, message, duration);

export default NotificationsManager;