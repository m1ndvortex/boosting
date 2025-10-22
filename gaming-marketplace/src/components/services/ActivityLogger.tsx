import React from 'react';
import { TeamService } from '../../services/teamService';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import type { ActivityLogEntry } from '../../types';

interface ActivityLoggerProps {
  serviceId?: string;
  maxEntries?: number;
  showUserActions?: boolean;
}

export const ActivityLogger: React.FC<ActivityLoggerProps> = ({
  serviceId,
  maxEntries = 10,
  showUserActions = true
}) => {
  const { state: authState } = useAuth();
  const { state: workspaceState } = useWorkspace();
  const [activities, setActivities] = React.useState<ActivityLogEntry[]>([]);

  React.useEffect(() => {
    loadActivities();
  }, [serviceId, workspaceState.currentWorkspace]);

  const loadActivities = () => {
    if (serviceId) {
      const serviceActivities = TeamService.getServiceActivities(serviceId);
      setActivities(serviceActivities.slice(0, maxEntries));
    } else {
      // Load all activities for current workspace
      const allActivities = TeamService.getActivities();
      const workspaceActivities = workspaceState.currentWorkspace.type === 'team'
        ? allActivities.filter(activity => activity.workspaceId === workspaceState.currentWorkspace.id)
        : allActivities.filter(activity => activity.userId === authState.user?.id);
      
      setActivities(workspaceActivities.slice(0, maxEntries));
    }
  };

  const logActivity = (action: string, details?: Record<string, any>) => {
    if (!authState.user) return;

    TeamService.logActivity({
      serviceId: serviceId || '',
      userId: authState.user.id,
      userName: authState.user.username,
      action,
      changes: details || {},
      workspaceId: workspaceState.currentWorkspace.type === 'team' 
        ? workspaceState.currentWorkspace.id 
        : authState.user.id,
      workspaceType: workspaceState.currentWorkspace.type
    });

    // Refresh activities
    loadActivities();
  };

  const getActivityIcon = (action: string): string => {
    if (action.includes('created')) return '➕';
    if (action.includes('updated') || action.includes('edited')) return '✏️';
    if (action.includes('deleted')) return '🗑️';
    if (action.includes('assigned')) return '👤';
    if (action.includes('completed')) return '✅';
    if (action.includes('started')) return '▶️';
    if (action.includes('paused')) return '⏸️';
    if (action.includes('cancelled')) return '❌';
    return '📝';
  };

  const formatTimestamp = (timestamp: Date | string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Expose logActivity function for parent components
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    logActivity
  }));

  if (activities.length === 0) {
    return (
      <div className="activity-logger activity-logger--empty">
        <div className="activity-logger__empty-state">
          <span className="activity-logger__empty-icon">📝</span>
          <p>No recent activities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-logger">
      <div className="activity-logger__header">
        <h4>Recent Activity</h4>
        {workspaceState.currentWorkspace.type === 'team' && (
          <span className="activity-logger__workspace-badge">
            Team Workspace
          </span>
        )}
      </div>
      
      <div className="activity-logger__list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-logger__item">
            <div className="activity-logger__icon">
              {getActivityIcon(activity.action)}
            </div>
            <div className="activity-logger__content">
              <div className="activity-logger__text">
                <span className="activity-logger__action">{activity.action}</span>
                {showUserActions && (
                  <span className="activity-logger__user">
                    by {activity.userName || `User #${activity.userId.slice(-4)}`}
                  </span>
                )}
              </div>
              <div className="activity-logger__timestamp">
                {formatTimestamp(activity.timestamp)}
              </div>
              {activity.changes && Object.keys(activity.changes).length > 0 && (
                <div className="activity-logger__changes">
                  {Object.entries(activity.changes).map(([key, value]) => (
                    <span key={key} className="activity-logger__change">
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Hook for easy activity logging
export const useActivityLogger = (serviceId?: string) => {
  const { state: authState } = useAuth();
  const { state: workspaceState } = useWorkspace();

  const logActivity = React.useCallback((action: string, details?: Record<string, any>) => {
    if (!authState.user) return;

    TeamService.logActivity({
      serviceId: serviceId || '',
      userId: authState.user.id,
      userName: authState.user.username,
      action,
      changes: details || {},
      workspaceId: workspaceState.currentWorkspace.type === 'team' 
        ? workspaceState.currentWorkspace.id 
        : authState.user.id,
      workspaceType: workspaceState.currentWorkspace.type
    });
  }, [authState.user, workspaceState.currentWorkspace, serviceId]);

  return { logActivity };
};