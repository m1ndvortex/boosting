import React from 'react';
import { type Notification, type NotificationAction } from '../../contexts/NotificationContext';
import { Button } from '../discord/Button';
import './NotificationToast.css';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  onAction?: (action: NotificationAction) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onAction
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const handleActionClick = (action: NotificationAction) => {
    action.action();
    if (onAction) {
      onAction(action);
    }
  };

  return (
    <div className={`notification-toast notification-toast--${notification.type}`}>
      <div className="notification-toast__content">
        <div className="notification-toast__header">
          <span className="notification-toast__icon">{getIcon()}</span>
          <h4 className="notification-toast__title">{notification.title}</h4>
          <button 
            className="notification-toast__close"
            onClick={onClose}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
        
        <p className="notification-toast__message">{notification.message}</p>
        
        {notification.actions && notification.actions.length > 0 && (
          <div className="notification-toast__actions">
            {notification.actions.map((action, index) => (
              <Button
                key={index}
                variant={action.style === 'danger' ? 'danger' : action.style === 'primary' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleActionClick(action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {notification.duration && notification.duration > 0 && (
        <div 
          className="notification-toast__progress"
          style={{ animationDuration: `${notification.duration}ms` }}
        />
      )}
    </div>
  );
};