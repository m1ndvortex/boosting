import React from 'react';

export const Earnings: React.FC = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      color: 'var(--discord-text-primary)',
      background: 'var(--discord-bg-primary)',
      height: '100%'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Earnings</h1>
        <p style={{ color: 'var(--discord-text-secondary)' }}>
          Track your earnings from completed services.
        </p>
      </div>
      
      <div style={{ 
        background: 'var(--discord-bg-secondary)', 
        padding: '2rem', 
        borderRadius: '8px',
        border: '1px solid var(--discord-bg-tertiary)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>💰</div>
        <h3>Earnings Dashboard</h3>
        <p style={{ color: 'var(--discord-text-secondary)', marginBottom: '1.5rem' }}>
          View detailed earnings analytics and payment history.
        </p>
        <div style={{ 
          background: 'var(--discord-bg-tertiary)', 
          padding: '1rem', 
          borderRadius: '6px',
          marginBottom: '1rem'
        }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Coming Soon:</h4>
          <ul style={{ 
            color: 'var(--discord-text-secondary)', 
            textAlign: 'left',
            listStyle: 'none',
            padding: 0
          }}>
            <li>• Total earnings breakdown by currency</li>
            <li>• Monthly and weekly earnings charts</li>
            <li>• Service performance analytics</li>
            <li>• Payment history and pending payouts</li>
            <li>• Tax reporting and export features</li>
          </ul>
        </div>
      </div>
    </div>
  );
};