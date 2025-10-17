import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/discord/Button';

export const AdminDashboard: React.FC = () => {
  const { state, logout } = useAuth();

  return (
    <div style={{ padding: '20px', color: 'var(--discord-text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Admin Dashboard</h1>
        <Button variant="secondary" onClick={logout}>
          Logout
        </Button>
      </div>
      
      <div style={{ background: 'var(--discord-bg-secondary)', padding: '20px', borderRadius: '8px' }}>
        <h2>Welcome, {state.user?.username}!</h2>
        <p>This is the Admin Dashboard interface.</p>
        <p>User ID: {state.user?.id}</p>
        <p>Roles: {state.user?.roles.map(role => role.name).join(', ')}</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Admin Features (Coming Soon):</h3>
          <ul>
            <li>Dashboard Home</li>
            <li>Games Management</li>
            <li>Users & Roles</li>
            <li>Pending Role Requests</li>
            <li>Financial Management</li>
            <li>Exchange Rates</li>
            <li>Shop Management</li>
            <li>Order Review</li>
            <li>System Settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};