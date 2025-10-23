import React, { createContext, useContext, useState, useCallback } from 'react';
import './NotificationSystem.css';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={`notification notification--${notification.type}`}>
      <div className="notification__content">
        <div className="notification__header">
          <span className="notification__icon">{getIcon()}</span>
          <span className="notification__title">{notification.title}</span>
          <button
            className="notification__close"
            onClick={onClose}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
        <div className="notification__message">{notification.message}</div>
        {notification.actions && notification.actions.length > 0 && (
          <div className="notification__actions">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                className={`notification__action notification__action--${action.variant || 'secondary'}`}
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Utility hooks for common notification types
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();

  return {
    showSuccess: (title: string, message: string) => 
      addNotification({ type: 'success', title, message }),
    
    showError: (title: string, message: string) => 
      addNotification({ type: 'error', title, message }),
    
    showWarning: (title: string, message: string) => 
      addNotification({ type: 'warning', title, message }),
    
    showInfo: (title: string, message: string) => 
      addNotification({ type: 'info', title, message }),
    
    showTeamActivity: (teamName: string, activity: string, userName: string) =>
      addNotification({
        type: 'info',
        title: `Team Activity - ${teamName}`,
        message: `${activity} by ${userName}`,
        duration: 4000
      }),
    
    showOrderUpdate: (orderId: string, status: string) =>
      addNotification({
        type: 'info',
        title: 'Order Update',
        message: `Order #${orderId.slice(-6)} status changed to ${status}`,
        duration: 6000,
        actions: [
          {
            label: 'View Order',
            onClick: () => {
              // Navigate to order details
              console.log('Navigate to order:', orderId);
            },
            variant: 'primary'
          }
        ]
      })
  };
};