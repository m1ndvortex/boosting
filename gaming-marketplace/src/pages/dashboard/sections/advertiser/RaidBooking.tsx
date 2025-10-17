import React from 'react';

export const RaidBooking: React.FC = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      color: 'var(--discord-text-primary)',
      background: 'var(--discord-bg-primary)',
      height: '100%'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Raid Booking</h1>
        <p style={{ color: 'var(--discord-text-secondary)' }}>
          Book buyers for raid slots created by admin users.
        </p>
      </div>
      
      <div style={{ 
        background: 'var(--discord-bg-secondary)', 
        padding: '2rem', 
        borderRadius: '8px',
        border: '1px solid var(--discord-bg-tertiary)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🗡️</div>
        <h3>Raid Booking System</h3>
        <p style={{ color: 'var(--discord-text-secondary)', marginBottom: '1.5rem' }}>
          This feature allows advertisers to book buyers for raid slots that are created by admin users.
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
            <li>• View available raid slots</li>
            <li>• Book buyers for specific raid times</li>
            <li>• Manage raid schedules</li>
            <li>• Track raid completion status</li>
            <li>• Coordinate with raid leaders</li>
          </ul>
        </div>
        <p style={{ 
          color: 'var(--discord-text-secondary)', 
          fontSize: '0.875rem',
          fontStyle: 'italic'
        }}>
          Note: Only admin users can create raid services. Advertisers can book buyers for existing raids.
        </p>
      </div>
    </div>
  );
};