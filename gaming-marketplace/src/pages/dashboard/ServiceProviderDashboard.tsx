import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { WorkspaceSwitcher } from '../../components/workspace/WorkspaceSwitcher';
import { AdvertiserTab } from './tabs/AdvertiserTab';
import { TeamAdvertiserTab } from './tabs/TeamAdvertiserTab';
import { BoosterTab } from './tabs/BoosterTab';
import './ServiceProviderDashboard.css';

type TabType = 'advertiser' | 'team_advertiser' | 'booster';

export const ServiceProviderDashboard: React.FC = () => {
  const { state } = useAuth();
  const { state: workspaceState } = useWorkspace();
  const [activeTab, setActiveTab] = useState<TabType>('advertiser');

  const hasRole = (roleName: string): boolean => {
    return state.user?.roles.some(
      (role) => role.name === roleName && role.status === 'active'
    ) || false;
  };

  // Get available tabs based on user roles
  const availableTabs = [
    ...(hasRole('advertiser') ? [{ id: 'advertiser' as TabType, label: '📊 Advertiser', icon: '📊' }] : []),
    ...(hasRole('team_advertiser') ? [{ id: 'team_advertiser' as TabType, label: '👥 Team Advertiser', icon: '👥' }] : []),
    ...(hasRole('booster') ? [{ id: 'booster' as TabType, label: '🎮 Booster', icon: '🎮' }] : [])
  ];

  // Set default active tab to first available tab
  React.useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  if (!state.user) {
    return <div>Loading...</div>;
  }

  if (availableTabs.length === 0) {
    return (
      <div className="service-provider-dashboard">
        <div className="service-provider-dashboard__no-roles">
          <h2>No Service Provider Roles</h2>
          <p>You don't have any service provider roles (Advertiser, Team Advertiser, or Booster).</p>
          <p>Please contact an administrator to request the appropriate roles.</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'advertiser':
        return <AdvertiserTab />;
      case 'team_advertiser':
        return <TeamAdvertiserTab />;
      case 'booster':
        return <BoosterTab />;
      default:
        return <AdvertiserTab />;
    }
  };

  return (
    <div className="service-provider-dashboard">
      {/* Workspace Switcher */}
      <WorkspaceSwitcher />

      {/* Team Workspace Banner */}
      {workspaceState.currentWorkspace.type === 'team' && (
        <div className="service-provider-dashboard__team-banner">
          <span className="service-provider-dashboard__team-banner-icon">👥</span>
          <span className="service-provider-dashboard__team-banner-text">
            Team Workspace: {workspaceState.currentWorkspace.name} - All earnings go to team leader
          </span>
        </div>
      )}

      {/* Top Navigation Tabs */}
      <div className="service-provider-dashboard__tabs">
        <div className="service-provider-dashboard__tab-list">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              className={`service-provider-dashboard__tab ${
                activeTab === tab.id ? 'service-provider-dashboard__tab--active' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="service-provider-dashboard__tab-icon">{tab.icon}</span>
              <span className="service-provider-dashboard__tab-label">
                {tab.label.replace(/^[📊👥🎮]\s/, '')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="service-provider-dashboard__content">
        {renderTabContent()}
      </div>
    </div>
  );
};