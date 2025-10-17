import React from 'react';

export const BoosterTab: React.FC = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      color: 'var(--discord-text-primary)',
      background: 'var(--discord-bg-primary)',
      height: '100%'
    }}>
      <h2>🎮 Booster</h2>
      <p style={{ color: 'var(--discord-text-secondary)', marginBottom: '1rem' }}>
        Manage assigned orders and upload completion evidence.
      </p>
      <div style={{ 
        background: 'var(--discord-bg-secondary)', 
        padding: '1.5rem', 
        borderRadius: '8px',
        border: '1px solid var(--discord-bg-tertiary)'
      }}>
        <h3>Coming Soon</h3>
        <ul style={{ color: 'var(--discord-text-secondary)' }}>
          <li>Assigned Orders management</li>
          <li>Order status updates (Start Order)</li>
          <li>Evidence upload system (screenshots + notes)</li>
          <li>File validation (PNG, JPG, JPEG, max 10MB, min 800x600)</li>
          <li>Earnings tracking</li>
          <li>Profile management</li>
        </ul>
      </div>
    </div>
  );
};