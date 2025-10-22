import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationCenter } from './NotificationCenter';
import './NotificationBell.css';

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <span className="notification-bell__icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};