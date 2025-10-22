import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../discord/Button';
import { Modal } from '../discord/Modal';
import './NotificationCenter.css';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll,
    removeNotification 
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="notification-center">
        <div className="notification-center__header">
          <div className="notification-center__filters">
            <button
              className={`notification-center__filter ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={`notification-center__filter ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>
          
          <div className="notification-center__actions">
            {unreadCount > 0 && (
              <Button variant="secondary" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="danger" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            )}
          </div>
        </div>

        <div className="notification-center__list">
          {filteredNotifications.length === 0 ? (
            <div className="notification-center__empty">
              <p>No notifications to show</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-center__item ${!notification.read ? 'unread' : ''}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="notification-center__item-header">
                  <span className="notification-center__item-icon">
                    {getIcon(notification.type)}
                  </span>
                  <h4 className="notification-center__item-title">
                    {notification.title}
                  </h4>
                  <span className="notification-center__item-time">
                    {formatTime(notification.timestamp)}
                  </span>
                  <button
                    className="notification-center__item-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    aria-label="Remove notification"
                  >
                    ×
                  </button>
                </div>
                
                <p className="notification-center__item-message">
                  {notification.message}
                </p>
                
                {notification.actions && notification.actions.length > 0 && (
                  <div className="notification-center__item-actions">
                    {notification.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.style === 'danger' ? 'danger' : action.style === 'primary' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          action.action();
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
                
                {!notification.read && (
                  <div className="notification-center__item-indicator" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};