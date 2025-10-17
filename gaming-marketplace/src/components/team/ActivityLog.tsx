import React from 'react';
import { TeamService } from '../../services/teamService';
import type { ActivityLogEntry } from '../../types';
import './ActivityLog.css';

interface ActivityLogProps {
  serviceId: string;
  className?: string;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ serviceId, className }) => {
  const activities = TeamService.getServiceActivities(serviceId);

  if (activities.length === 0) {
    return (
      <div className={`activity-log ${className || ''}`}>
        <div className="activity-log__empty">
          <p>No activity yet</p>
        </div>
      </div>
    );
  }

  const formatActivityMessage = (activity: ActivityLogEntry): string => {
    const { action, userName, changes } = activity;
    
    switch (action) {
      case 'created':
        return `Service created by ${userName}`;
      case 'updated':
        if (changes.title) {
          return `Title updated by ${userName}`;
        }
        if (changes.description) {
          return `Description updated by ${userName}`;
        }
        if (changes.prices) {
          return `Price updated by ${userName}`;
        }
        return `Service updated by ${userName}`;
      case 'activated':
        return `Service activated by ${userName}`;
      case 'deactivated':
        return `Service deactivated by ${userName}`;
      case 'deleted':
        return `Service deleted by ${userName}`;
      default:
        return `${action} by ${userName}`;
    }
  };

  const getActivityIcon = (action: string): string => {
    switch (action) {
      case 'created':
        return '✨';
      case 'updated':
        return '✏️';
      case 'activated':
        return '✅';
      case 'deactivated':
        return '⏸️';
      case 'deleted':
        return '🗑️';
      default:
        return '📝';
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  return (
    <div className={`activity-log ${className || ''}`}>
      <div className="activity-log__header">
        <h4>Activity Log</h4>
        <span className="activity-log__count">{activities.length} activities</span>
      </div>
      
      <div className="activity-log__list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-log__item">
            <div className="activity-log__icon">
              {getActivityIcon(activity.action)}
            </div>
            <div className="activity-log__content">
              <div className="activity-log__message">
                {formatActivityMessage(activity)}
              </div>
              <div className="activity-log__timestamp">
                {formatTimestamp(activity.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};