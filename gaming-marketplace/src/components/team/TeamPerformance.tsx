import React, { useState, useEffect } from 'react';
import { TeamService } from '../../services/teamService';
import type { Team, Order, ActivityLogEntry } from '../../types';
import './TeamPerformance.css';

interface TeamPerformanceProps {
  team: Team;
}

interface PerformanceMetrics {
  totalOrders: number;
  completedOrders: number;
  totalEarnings: number;
  averageRating: number;
  completionRate: number;
  memberContributions: Array<{
    userId: string;
    userName: string;
    ordersCompleted: number;
    earnings: number;
  }>;
}

export const TeamPerformance: React.FC<TeamPerformanceProps> = ({ team }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [team.id, timeRange]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Get team orders and activities
      const teamOrders = getTeamOrders();
      const teamActivities = TeamService.getServiceActivities(''); // Get all activities for now
      
      // Calculate metrics
      const completedOrders = teamOrders.filter(order => order.status === 'completed');
      const totalEarnings = completedOrders.reduce((sum, order) => sum + order.pricePaid, 0);
      
      // Calculate member contributions
      const memberContributions = team.members
        .filter(member => member.status === 'active')
        .map(member => {
          const memberOrders = completedOrders.filter(order => order.boosterId === member.userId);
          const memberEarnings = memberOrders.reduce((sum, order) => sum + order.pricePaid, 0);
          
          return {
            userId: member.userId,
            userName: `Member #${member.userId.slice(-4)}`,
            ordersCompleted: memberOrders.length,
            earnings: memberEarnings
          };
        });

      setMetrics({
        totalOrders: teamOrders.length,
        completedOrders: completedOrders.length,
        totalEarnings,
        averageRating: 4.8, // Mock rating
        completionRate: teamOrders.length > 0 ? (completedOrders.length / teamOrders.length) * 100 : 0,
        memberContributions
      });

      setActivities(teamActivities.slice(0, 20)); // Show last 20 activities
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTeamOrders = (): Order[] => {
    // Mock team orders - in real app, this would filter by team workspace
    const ordersData = localStorage.getItem('orders');
    const allOrders: Order[] = ordersData ? JSON.parse(ordersData) : [];
    
    // Filter orders that belong to team services
    return allOrders.filter(_order => {
      // Mock logic - in real app, check if _order.serviceId belongs to team
      return Math.random() > 0.7; // Randomly assign some orders to team
    });
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  const getTimeRangeLabel = (range: string): string => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case 'all': return 'All Time';
      default: return 'Last 30 Days';
    }
  };

  if (loading) {
    return (
      <div className="team-performance">
        <div className="team-performance__loading">
          <div className="team-performance__spinner"></div>
          <p>Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="team-performance">
        <div className="team-performance__error">
          <p>Failed to load performance data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-performance">
      <div className="team-performance__header">
        <h3>Team Performance</h3>
        <div className="team-performance__time-selector">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              className={`team-performance__time-button ${
                timeRange === range ? 'team-performance__time-button--active' : ''
              }`}
              onClick={() => setTimeRange(range)}
            >
              {getTimeRangeLabel(range)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="team-performance__metrics">
        <div className="team-performance__metric-card">
          <div className="team-performance__metric-icon">📊</div>
          <div className="team-performance__metric-content">
            <div className="team-performance__metric-value">{metrics.totalOrders}</div>
            <div className="team-performance__metric-label">Total Orders</div>
          </div>
        </div>

        <div className="team-performance__metric-card">
          <div className="team-performance__metric-icon">✅</div>
          <div className="team-performance__metric-content">
            <div className="team-performance__metric-value">{metrics.completedOrders}</div>
            <div className="team-performance__metric-label">Completed</div>
          </div>
        </div>

        <div className="team-performance__metric-card">
          <div className="team-performance__metric-icon">💰</div>
          <div className="team-performance__metric-content">
            <div className="team-performance__metric-value">{formatCurrency(metrics.totalEarnings)}</div>
            <div className="team-performance__metric-label">Total Earnings</div>
          </div>
        </div>

        <div className="team-performance__metric-card">
          <div className="team-performance__metric-icon">⭐</div>
          <div className="team-performance__metric-content">
            <div className="team-performance__metric-value">{metrics.averageRating.toFixed(1)}</div>
            <div className="team-performance__metric-label">Avg Rating</div>
          </div>
        </div>

        <div className="team-performance__metric-card">
          <div className="team-performance__metric-icon">📈</div>
          <div className="team-performance__metric-content">
            <div className="team-performance__metric-value">{metrics.completionRate.toFixed(1)}%</div>
            <div className="team-performance__metric-label">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Member Contributions */}
      <div className="team-performance__section">
        <h4>Member Contributions</h4>
        <div className="team-performance__contributions">
          {metrics.memberContributions.map((member) => (
            <div key={member.userId} className="team-performance__contribution-card">
              <div className="team-performance__member-info">
                <div className="team-performance__member-avatar">
                  {member.userName.charAt(member.userName.length - 1)}
                </div>
                <div className="team-performance__member-details">
                  <div className="team-performance__member-name">{member.userName}</div>
                  <div className="team-performance__member-stats">
                    {member.ordersCompleted} orders • {formatCurrency(member.earnings)}
                  </div>
                </div>
              </div>
              <div className="team-performance__contribution-bar">
                <div 
                  className="team-performance__contribution-fill"
                  style={{ 
                    width: `${metrics.totalEarnings > 0 ? (member.earnings / metrics.totalEarnings) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="team-performance__section">
        <h4>Recent Team Activities</h4>
        <div className="team-performance__activities">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="team-performance__activity">
                <div className="team-performance__activity-icon">📝</div>
                <div className="team-performance__activity-content">
                  <div className="team-performance__activity-text">
                    {activity.action} by Member #{activity.userId.slice(-4)}
                  </div>
                  <div className="team-performance__activity-time">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="team-performance__no-activities">
              <p>No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};