import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationToast } from './NotificationToast';
import './NotificationContainer.css';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  // Only show the most recent 5 notifications as toasts
  const visibleNotifications = notifications.slice(0, 5);

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {visibleNotifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};