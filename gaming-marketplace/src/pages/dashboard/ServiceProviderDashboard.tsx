import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/discord/Button';

export const ServiceProviderDashboard: React.FC = () => {
  const { state, logout } = useAuth();

  const hasRole = (roleName: string): boolean => {
    return state.user?.roles.some(
      (role) => role.name === roleName && role.status === 'active'
    ) || false;
  };

  return (
    <div style={{ padding: '20px', color: 'var(--discord-text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Service Provider Dashboard</h1>
        <Button variant="secondary" onClick={logout}>
          Logout
        </Button>
      </div>
      
      <div style={{ background: 'var(--discord-bg-secondary)', padding: '20px', borderRadius: '8px' }}>
        <h2>Welcome, {state.user?.username}!</h2>
        <p>This is the Service Provider Dashboard interface.</p>
        <p>User ID: {state.user?.id}</p>
        <p>Roles: {state.user?.roles.map(role => role.name).join(', ')}</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Available Tabs Based on Your Roles:</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {hasRole('advertiser') && (
              <div style={{ padding: '10px', background: 'var(--discord-accent)', borderRadius: '4px' }}>
                📊 Advertiser
              </div>
            )}
            {hasRole('team_advertiser') && (
              <div style={{ padding: '10px', background: 'var(--discord-accent)', borderRadius: '4px' }}>
                👥 Team Advertiser
              </div>
            )}
            {hasRole('booster') && (
              <div style={{ padding: '10px', background: 'var(--discord-accent)', borderRadius: '4px' }}>
                🎮 Booster
              </div>
            )}
          </div>
          
          <h3>Features (Coming Soon):</h3>
          <ul>
            <li>Role-based tab navigation</li>
            <li>Service creation and management</li>
            <li>Order management</li>
            <li>Team workspace switching</li>
            <li>Evidence upload system</li>
          </ul>
        </div>
      </div>
    </div>
  );
};