// Admin panel for managing wallet migrations

import React, { useState, useEffect } from 'react';
import { MultiWalletInitService } from '../../services/multiWalletInitService';
import { WalletMigrationService } from '../../services/walletMigrationService';
import './WalletMigrationPanel.css';

interface MigrationStatus {
  totalUsers: number;
  migratedUsers: number;
  pendingUsers: number;
  failedUsers: number;
  isComplete: boolean;
}

interface MigrationLogEntry {
  userId: string;
  success: boolean;
  timestamp: Date;
  details?: any;
  error?: string;
}

export const WalletMigrationPanel: React.FC = () => {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [migrationLog, setMigrationLog] = useState<MigrationLogEntry[]>([]);
  const [usersNeedingMigration, setUsersNeedingMigration] = useState<string[]>([]);
  const [enabledUsers, setEnabledUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [batchSize, setBatchSize] = useState(10);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadMigrationData();
  }, []);

  const loadMigrationData = () => {
    try {
      const status = MultiWalletInitService.getMigrationStatus();
      const log = MultiWalletInitService.getMigrationLog();
      const pendingUsers = MultiWalletInitService.getUsersNeedingMigration();
      const enabled = WalletMigrationService.getEnabledUsers();

      setMigrationStatus(status);
      setMigrationLog(log);
      setUsersNeedingMigration(pendingUsers);
      setEnabledUsers(enabled);
    } catch (error) {
      console.error('Failed to load migration data:', error);
      setMessage({ type: 'error', text: 'Failed to load migration data' });
    }
  };

  const handleMigrateUser = async () => {
    if (!selectedUser) {
      setMessage({ type: 'error', text: 'Please select a user to migrate' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await MultiWalletInitService.migrateUserWallet(selectedUser);
      
      if (result.success) {
        setMessage({ type: 'success', text: `Successfully migrated user ${selectedUser}` });
        setSelectedUser('');
        loadMigrationData();
      } else {
        setMessage({ type: 'error', text: `Migration failed: ${result.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Migration failed with unexpected error' });
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateAll = async () => {
    if (!migrationStatus || migrationStatus.pendingUsers === 0) {
      setMessage({ type: 'info', text: 'No users need migration' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await MultiWalletInitService.migrateAllUsers(batchSize);
      
      setMessage({ 
        type: result.failed > 0 ? 'error' : 'success', 
        text: `Migration complete: ${result.successful} successful, ${result.failed} failed` 
      });
      
      loadMigrationData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Batch migration failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableForUser = async () => {
    if (!selectedUser) {
      setMessage({ type: 'error', text: 'Please select a user' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await MultiWalletInitService.enableMultiWalletForUser(selectedUser);
      
      if (result.success) {
        const migrationText = result.migrated ? ' (with migration)' : '';
        setMessage({ type: 'success', text: `Multi-wallet enabled for ${selectedUser}${migrationText}` });
        setSelectedUser('');
        loadMigrationData();
      } else {
        setMessage({ type: 'error', text: `Failed to enable: ${result.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to enable multi-wallet' });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableForAll = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await MultiWalletInitService.enableMultiWalletForAllUsers();
      
      if (result.success) {
        const migrationText = result.migrationResults 
          ? ` (migrated ${result.migrationResults.successful}/${result.migrationResults.totalProcessed} users)`
          : '';
        setMessage({ type: 'success', text: `Multi-wallet enabled for all users${migrationText}` });
        loadMigrationData();
      } else {
        setMessage({ type: 'error', text: `Failed to enable for all: ${result.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to enable multi-wallet for all users' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableForAll = () => {
    if (confirm('Are you sure you want to disable multi-wallet for all users? This will rollback to the old wallet system.')) {
      MultiWalletInitService.disableMultiWalletForAllUsers();
      setMessage({ type: 'info', text: 'Multi-wallet disabled for all users' });
      loadMigrationData();
    }
  };

  const handleValidateUser = () => {
    if (!selectedUser) {
      setMessage({ type: 'error', text: 'Please select a user to validate' });
      return;
    }

    try {
      const validation = MultiWalletInitService.validateUserMigration(selectedUser);
      
      if (validation.isValid) {
        setMessage({ type: 'success', text: `Migration validation passed for ${selectedUser}` });
      } else {
        setMessage({ 
          type: 'error', 
          text: `Migration validation failed: ${validation.issues.join(', ')}` 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Validation failed' });
    }
  };

  const handleCleanupUser = () => {
    if (!selectedUser) {
      setMessage({ type: 'error', text: 'Please select a user to cleanup' });
      return;
    }

    if (confirm(`Are you sure you want to cleanup old wallet data for ${selectedUser}? This cannot be undone.`)) {
      const result = MultiWalletInitService.cleanupOldWalletData(selectedUser);
      
      if (result.success) {
        setMessage({ type: 'success', text: `Old wallet data cleaned up for ${selectedUser}` });
      } else {
        setMessage({ type: 'error', text: `Cleanup failed: ${result.error}` });
      }
    }
  };

  const clearMessage = () => setMessage(null);

  return (
    <div className="wallet-migration-panel">
      <div className="panel-header">
        <h2>Wallet Migration Management</h2>
        <button onClick={loadMigrationData} className="refresh-btn" disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={clearMessage} className="close-btn">×</button>
        </div>
      )}

      {/* Migration Status */}
      <div className="migration-status">
        <h3>Migration Status</h3>
        {migrationStatus ? (
          <div className="status-grid">
            <div className="status-item">
              <span className="label">Total Users:</span>
              <span className="value">{migrationStatus.totalUsers}</span>
            </div>
            <div className="status-item">
              <span className="label">Migrated:</span>
              <span className="value success">{migrationStatus.migratedUsers}</span>
            </div>
            <div className="status-item">
              <span className="label">Pending:</span>
              <span className="value warning">{migrationStatus.pendingUsers}</span>
            </div>
            <div className="status-item">
              <span className="label">Failed:</span>
              <span className="value error">{migrationStatus.failedUsers}</span>
            </div>
            <div className="status-item">
              <span className="label">Complete:</span>
              <span className={`value ${migrationStatus.isComplete ? 'success' : 'warning'}`}>
                {migrationStatus.isComplete ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        ) : (
          <p>Loading migration status...</p>
        )}
      </div>

      {/* Migration Actions */}
      <div className="migration-actions">
        <h3>Migration Actions</h3>
        
        <div className="action-group">
          <h4>Individual User Migration</h4>
          <div className="user-selection">
            <select 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a user...</option>
              {usersNeedingMigration.map(userId => (
                <option key={userId} value={userId}>{userId}</option>
              ))}
            </select>
            <div className="user-actions">
              <button onClick={handleMigrateUser} disabled={loading || !selectedUser}>
                Migrate User
              </button>
              <button onClick={handleValidateUser} disabled={loading || !selectedUser}>
                Validate Migration
              </button>
              <button onClick={handleCleanupUser} disabled={loading || !selectedUser}>
                Cleanup Old Data
              </button>
            </div>
          </div>
        </div>

        <div className="action-group">
          <h4>Batch Migration</h4>
          <div className="batch-controls">
            <label>
              Batch Size:
              <input 
                type="number" 
                value={batchSize} 
                onChange={(e) => setBatchSize(Number(e.target.value))}
                min="1" 
                max="50"
                disabled={loading}
              />
            </label>
            <button onClick={handleMigrateAll} disabled={loading || !migrationStatus?.pendingUsers}>
              Migrate All Users ({migrationStatus?.pendingUsers || 0} pending)
            </button>
          </div>
        </div>

        <div className="action-group">
          <h4>Feature Rollout</h4>
          <div className="rollout-controls">
            <button onClick={handleEnableForUser} disabled={loading || !selectedUser}>
              Enable Multi-Wallet for Selected User
            </button>
            <button onClick={handleEnableForAll} disabled={loading} className="primary">
              Enable Multi-Wallet for All Users
            </button>
            <button onClick={handleDisableForAll} disabled={loading} className="danger">
              Disable Multi-Wallet for All Users (Rollback)
            </button>
          </div>
          <p className="enabled-count">
            Multi-wallet enabled for {enabledUsers.length} users
          </p>
        </div>
      </div>

      {/* Migration Log */}
      <div className="migration-log">
        <h3>Migration Log</h3>
        {migrationLog.length > 0 ? (
          <div className="log-table">
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {migrationLog.slice(0, 20).map((entry, index) => (
                  <tr key={index} className={entry.success ? 'success' : 'error'}>
                    <td>{entry.userId}</td>
                    <td>
                      <span className={`status-badge ${entry.success ? 'success' : 'error'}`}>
                        {entry.success ? '✓ Success' : '✗ Failed'}
                      </span>
                    </td>
                    <td>{entry.timestamp.toLocaleString()}</td>
                    <td>
                      {entry.success ? (
                        entry.details && (
                          <span>
                            USD: {entry.details.newBalance?.usd || 0}, 
                            Toman: {entry.details.newBalance?.toman || 0}, 
                            Gold: {entry.details.newBalance?.totalGold || 0}
                          </span>
                        )
                      ) : (
                        <span className="error-text">{entry.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {migrationLog.length > 20 && (
              <p className="log-note">Showing latest 20 entries of {migrationLog.length} total</p>
            )}
          </div>
        ) : (
          <p>No migration log entries</p>
        )}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Processing migration...</p>
          </div>
        </div>
      )}
    </div>
  );
};