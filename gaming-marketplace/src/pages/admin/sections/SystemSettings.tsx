import React, { useState } from 'react';

interface SystemSetting {
  id: string;
  category: string;
  name: string;
  description: string;
  type: 'boolean' | 'number' | 'string' | 'select';
  value: any;
  options?: string[];
  min?: number;
  max?: number;
}

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([
    // Platform Settings
    {
      id: 'platform_maintenance',
      category: 'Platform',
      name: 'Maintenance Mode',
      description: 'Enable maintenance mode to prevent new orders and limit access',
      type: 'boolean',
      value: false,
    },
    {
      id: 'platform_registration',
      category: 'Platform',
      name: 'Allow New Registrations',
      description: 'Allow new users to register on the platform',
      type: 'boolean',
      value: true,
    },
    {
      id: 'platform_max_orders',
      category: 'Platform',
      name: 'Max Orders Per User',
      description: 'Maximum number of active orders a user can have',
      type: 'number',
      value: 5,
      min: 1,
      max: 20,
    },

    // Order Settings
    {
      id: 'order_auto_assign',
      category: 'Orders',
      name: 'Auto-assign Orders',
      description: 'Automatically assign orders to available boosters',
      type: 'boolean',
      value: false,
    },
    {
      id: 'order_timeout_hours',
      category: 'Orders',
      name: 'Order Timeout (Hours)',
      description: 'Hours before an unassigned order is cancelled',
      type: 'number',
      value: 24,
      min: 1,
      max: 168,
    },
    {
      id: 'order_evidence_required',
      category: 'Orders',
      name: 'Evidence Required',
      description: 'Require evidence upload for order completion',
      type: 'boolean',
      value: true,
    },

    // Payment Settings
    {
      id: 'payment_min_withdrawal',
      category: 'Payments',
      name: 'Minimum Withdrawal (USD)',
      description: 'Minimum amount for withdrawal requests',
      type: 'number',
      value: 10,
      min: 1,
      max: 100,
    },
    {
      id: 'payment_commission_rate',
      category: 'Payments',
      name: 'Platform Commission (%)',
      description: 'Commission rate taken from completed orders',
      type: 'number',
      value: 10,
      min: 0,
      max: 30,
    },
    {
      id: 'payment_auto_approve_limit',
      category: 'Payments',
      name: 'Auto-approve Withdrawals Under (USD)',
      description: 'Automatically approve withdrawals under this amount',
      type: 'number',
      value: 50,
      min: 0,
      max: 500,
    },

    // Security Settings
    {
      id: 'security_role_approval',
      category: 'Security',
      name: 'Role Approval Required',
      description: 'Require admin approval for role requests',
      type: 'boolean',
      value: true,
    },
    {
      id: 'security_max_login_attempts',
      category: 'Security',
      name: 'Max Login Attempts',
      description: 'Maximum failed login attempts before lockout',
      type: 'number',
      value: 5,
      min: 3,
      max: 10,
    },
    {
      id: 'security_session_timeout',
      category: 'Security',
      name: 'Session Timeout (Minutes)',
      description: 'Minutes of inactivity before session expires',
      type: 'number',
      value: 60,
      min: 15,
      max: 480,
    },

    // Notification Settings
    {
      id: 'notification_email_enabled',
      category: 'Notifications',
      name: 'Email Notifications',
      description: 'Send email notifications for important events',
      type: 'boolean',
      value: true,
    },
    {
      id: 'notification_order_updates',
      category: 'Notifications',
      name: 'Order Update Notifications',
      description: 'Notify users of order status changes',
      type: 'boolean',
      value: true,
    },
    {
      id: 'notification_frequency',
      category: 'Notifications',
      name: 'Notification Frequency',
      description: 'How often to send notification emails',
      type: 'select',
      value: 'immediate',
      options: ['immediate', 'hourly', 'daily', 'weekly'],
    },
  ]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const categories = [...new Set(settings.map(s => s.category))];

  const handleSettingChange = (settingId: string, newValue: any) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { ...setting, value: newValue }
        : setting
    ));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    // Mock save functionality
    console.log('Saving settings:', settings);
    setHasUnsavedChanges(false);
    
    // Show success message (in real app, this would be a toast notification)
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Mock reset functionality
      setHasUnsavedChanges(false);
      alert('Settings reset to defaults!');
    }
  };

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        );
      
      case 'number':
        return (
          <input
            type="number"
            className="admin-form__input setting-input"
            value={setting.value}
            min={setting.min}
            max={setting.max}
            onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
          />
        );
      
      case 'string':
        return (
          <input
            type="text"
            className="admin-form__input setting-input"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          />
        );
      
      case 'select':
        return (
          <select
            className="admin-form__input setting-input"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">System Settings</h2>
        <p className="admin-section__description">
          Configure system-wide settings and platform preferences
        </p>
      </div>

      <div className="admin-section__content">
        {/* Save/Reset Actions */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">Settings Management</h3>
            {hasUnsavedChanges && (
              <span className="unsaved-indicator">
                ⚠️ You have unsaved changes
              </span>
            )}
          </div>
          <div className="admin-card__content">
            <div className="settings-actions">
              <button
                className="admin-button admin-button--success"
                onClick={handleSaveSettings}
                disabled={!hasUnsavedChanges}
              >
                💾 Save All Settings
              </button>
              <button
                className="admin-button admin-button--secondary"
                onClick={handleResetSettings}
              >
                🔄 Reset to Defaults
              </button>
            </div>
          </div>
        </div>

        {/* Settings by Category */}
        {categories.map(category => (
          <div key={category} className="admin-card">
            <div className="admin-card__header">
              <h3 className="admin-card__title">
                {category === 'Platform' && '🏛️'} 
                {category === 'Orders' && '📋'} 
                {category === 'Payments' && '💰'} 
                {category === 'Security' && '🔒'} 
                {category === 'Notifications' && '🔔'} 
                {' '}{category} Settings
              </h3>
            </div>
            <div className="admin-card__content">
              <div className="settings-list">
                {settings
                  .filter(setting => setting.category === category)
                  .map(setting => (
                    <div key={setting.id} className="setting-item">
                      <div className="setting-info">
                        <div className="setting-name">{setting.name}</div>
                        <div className="setting-description">{setting.description}</div>
                      </div>
                      <div className="setting-control">
                        {renderSettingInput(setting)}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        ))}

        {/* System Information */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">📊 System Information</h3>
          </div>
          <div className="admin-card__content">
            <div className="system-info">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Platform Version:</span>
                  <span className="info-value">v1.0.0-beta</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Environment:</span>
                  <span className="info-value">Development</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Backup:</span>
                  <span className="info-value">2024-01-22 03:00 UTC</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Uptime:</span>
                  <span className="info-value">7 days, 14 hours</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Active Users:</span>
                  <span className="info-value">1,247</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Storage Used:</span>
                  <span className="info-value">2.3 GB / 10 GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Actions */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">🔧 Maintenance Actions</h3>
          </div>
          <div className="admin-card__content">
            <div className="maintenance-actions">
              <div className="maintenance-item">
                <div className="maintenance-info">
                  <div className="maintenance-name">Clear Cache</div>
                  <div className="maintenance-description">
                    Clear application cache to improve performance
                  </div>
                </div>
                <button className="admin-button admin-button--secondary">
                  Clear Cache
                </button>
              </div>
              <div className="maintenance-item">
                <div className="maintenance-info">
                  <div className="maintenance-name">Export Data</div>
                  <div className="maintenance-description">
                    Export platform data for backup or analysis
                  </div>
                </div>
                <button className="admin-button admin-button--secondary">
                  Export Data
                </button>
              </div>
              <div className="maintenance-item">
                <div className="maintenance-info">
                  <div className="maintenance-name">System Health Check</div>
                  <div className="maintenance-description">
                    Run comprehensive system health diagnostics
                  </div>
                </div>
                <button className="admin-button admin-button--secondary">
                  Run Check
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .settings-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .unsaved-indicator {
          color: var(--discord-warning);
          font-size: 14px;
          font-weight: 500;
        }

        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--discord-bg-tertiary);
          border-radius: 8px;
          gap: 20px;
        }

        .setting-info {
          flex: 1;
        }

        .setting-name {
          font-weight: 600;
          color: var(--discord-text-primary);
          font-size: 14px;
          margin-bottom: 4px;
        }

        .setting-description {
          font-size: 13px;
          color: var(--discord-text-secondary);
          line-height: 1.4;
        }

        .setting-control {
          flex-shrink: 0;
        }

        .setting-input {
          width: 120px;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--discord-bg-primary);
          transition: 0.17s;
          border-radius: 24px;
          border: 2px solid var(--discord-text-muted);
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: var(--discord-text-muted);
          transition: 0.17s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: var(--discord-accent);
          border-color: var(--discord-accent);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(22px);
          background-color: white;
        }

        .system-info {
          background: var(--discord-bg-tertiary);
          border-radius: 8px;
          padding: 16px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .info-label {
          font-size: 13px;
          color: var(--discord-text-secondary);
        }

        .info-value {
          font-size: 13px;
          color: var(--discord-text-primary);
          font-weight: 500;
        }

        .maintenance-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .maintenance-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--discord-bg-tertiary);
          border-radius: 8px;
          gap: 20px;
        }

        .maintenance-info {
          flex: 1;
        }

        .maintenance-name {
          font-weight: 600;
          color: var(--discord-text-primary);
          font-size: 14px;
          margin-bottom: 4px;
        }

        .maintenance-description {
          font-size: 13px;
          color: var(--discord-text-secondary);
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .setting-item,
          .maintenance-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .setting-control {
            align-self: flex-end;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};