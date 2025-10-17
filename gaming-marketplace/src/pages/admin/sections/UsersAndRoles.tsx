import React, { useState } from 'react';
import type { User, UserRole } from '../../../types';

export const UsersAndRoles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock users data
  const [users] = useState<User[]>([
    {
      id: 'user_1',
      discordId: '123456789012345678',
      username: 'AdminUser',
      discriminator: '0001',
      avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
      email: 'admin@example.com',
      roles: [
        { id: 'role_1', name: 'client', status: 'active' },
        { id: 'role_2', name: 'admin', status: 'active', approvedBy: 'system', approvedAt: new Date('2024-01-01') },
      ],
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'user_2',
      discordId: '234567890123456789',
      username: 'ProBooster',
      discriminator: '1234',
      avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
      email: 'probooster@example.com',
      roles: [
        { id: 'role_3', name: 'client', status: 'active' },
        { id: 'role_4', name: 'booster', status: 'active', approvedBy: 'user_1', approvedAt: new Date('2024-01-10') },
      ],
      createdAt: new Date('2024-01-05'),
    },
    {
      id: 'user_3',
      discordId: '345678901234567890',
      username: 'ServiceProvider',
      discriminator: '5678',
      avatar: 'https://cdn.discordapp.com/embed/avatars/2.png',
      email: 'serviceprovider@example.com',
      roles: [
        { id: 'role_5', name: 'client', status: 'active' },
        { id: 'role_6', name: 'advertiser', status: 'active', approvedBy: 'user_1', approvedAt: new Date('2024-01-12') },
        { id: 'role_7', name: 'team_advertiser', status: 'active', approvedBy: 'user_1', approvedAt: new Date('2024-01-15') },
      ],
      createdAt: new Date('2024-01-08'),
    },
    {
      id: 'user_4',
      discordId: '456789012345678901',
      username: 'NewUser',
      discriminator: '9012',
      avatar: 'https://cdn.discordapp.com/embed/avatars/3.png',
      email: 'newuser@example.com',
      roles: [
        { id: 'role_8', name: 'client', status: 'active' },
      ],
      createdAt: new Date('2024-01-20'),
    },
    {
      id: 'user_5',
      discordId: '567890123456789012',
      username: 'PendingBooster',
      discriminator: '3456',
      avatar: 'https://cdn.discordapp.com/embed/avatars/4.png',
      email: 'pendingbooster@example.com',
      roles: [
        { id: 'role_9', name: 'client', status: 'active' },
        { id: 'role_10', name: 'booster', status: 'pending_approval' },
      ],
      createdAt: new Date('2024-01-18'),
    },
  ]);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'client': return 'Client';
      case 'booster': return 'Booster';
      case 'advertiser': return 'Advertiser';
      case 'team_advertiser': return 'Team Advertiser';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client': return '👤';
      case 'booster': return '🎮';
      case 'advertiser': return '📊';
      case 'team_advertiser': return '👥';
      case 'admin': return '⚡';
      default: return '❓';
    }
  };

  const getHighestRole = (roles: UserRole[]) => {
    const roleHierarchy = ['client', 'booster', 'advertiser', 'team_advertiser', 'admin'];
    const activeRoles = roles.filter(role => role.status === 'active');
    
    for (let i = roleHierarchy.length - 1; i >= 0; i--) {
      const role = activeRoles.find(r => r.name === roleHierarchy[i]);
      if (role) return role;
    }
    
    return activeRoles[0] || roles[0];
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
                       user.roles.some(role => role.name === roleFilter && role.status === 'active');
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.roles.some(role => role.status === 'active')) ||
                         (statusFilter === 'pending' && user.roles.some(role => role.status === 'pending_approval'));
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleToggle = (userId: string, roleName: string) => {
    // Mock role toggle functionality
    console.log(`Toggling ${roleName} role for user ${userId}`);
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Users & Roles</h2>
        <p className="admin-section__description">
          Manage user accounts and role assignments
        </p>
      </div>

      <div className="admin-section__content">
        {/* Filters */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">Filters</h3>
          </div>
          <div className="admin-card__content">
            <div className="filters-row">
              <div className="filter-group">
                <label className="admin-form__label">Search Users</label>
                <input
                  type="text"
                  className="admin-form__input"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label className="admin-form__label">Role</label>
                <select
                  className="admin-form__input"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="client">Client</option>
                  <option value="booster">Booster</option>
                  <option value="advertiser">Advertiser</option>
                  <option value="team_advertiser">Team Advertiser</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="admin-form__label">Status</label>
                <select
                  className="admin-form__input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              Users ({filteredUsers.length})
            </h3>
          </div>
          <div className="admin-card__content">
            {filteredUsers.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Primary Role</th>
                    <th>All Roles</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const primaryRole = getHighestRole(user.roles);
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info">
                            <img 
                              src={user.avatar} 
                              alt={user.username}
                              className="user-avatar"
                            />
                            <div>
                              <div className="user-name">
                                {user.username}#{user.discriminator}
                              </div>
                              <div className="user-email">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="role-info">
                            <span className="role-icon">{getRoleIcon(primaryRole.name)}</span>
                            <span className={`status-badge ${
                              primaryRole.status === 'active' 
                                ? 'status-badge--active' 
                                : primaryRole.status === 'pending_approval'
                                ? 'status-badge--pending'
                                : 'status-badge--rejected'
                            }`}>
                              {getRoleDisplayName(primaryRole.name)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="roles-list">
                            {user.roles.map((role) => (
                              <span
                                key={role.id}
                                className={`role-badge ${
                                  role.status === 'active' 
                                    ? 'role-badge--active' 
                                    : role.status === 'pending_approval'
                                    ? 'role-badge--pending'
                                    : 'role-badge--rejected'
                                }`}
                              >
                                {getRoleIcon(role.name)} {getRoleDisplayName(role.name)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>{user.createdAt.toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-button action-button--edit">
                              Manage Roles
                            </button>
                            <button className="action-button action-button--reject">
                              Suspend
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">👥</div>
                <div className="empty-state__title">No Users Found</div>
                <div className="empty-state__description">
                  No users match the current filters
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Statistics */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">User Statistics</h3>
          </div>
          <div className="admin-card__content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card__icon">👤</div>
                <div className="stat-card__value">{users.length}</div>
                <div className="stat-card__label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">🎮</div>
                <div className="stat-card__value">
                  {users.filter(u => u.roles.some(r => r.name === 'booster' && r.status === 'active')).length}
                </div>
                <div className="stat-card__label">Active Boosters</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">📊</div>
                <div className="stat-card__value">
                  {users.filter(u => u.roles.some(r => r.name === 'advertiser' && r.status === 'active')).length}
                </div>
                <div className="stat-card__label">Active Advertisers</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">👥</div>
                <div className="stat-card__value">
                  {users.filter(u => u.roles.some(r => r.name === 'team_advertiser' && r.status === 'active')).length}
                </div>
                <div className="stat-card__label">Team Advertisers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .filters-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .user-name {
          font-weight: 600;
          color: var(--discord-text-primary);
          font-size: 14px;
        }

        .user-email {
          font-size: 12px;
          color: var(--discord-text-muted);
        }

        .role-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .role-icon {
          font-size: 16px;
        }

        .roles-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .role-badge--active {
          background: rgba(67, 181, 129, 0.2);
          color: var(--discord-success);
        }

        .role-badge--pending {
          background: rgba(250, 166, 26, 0.2);
          color: var(--discord-warning);
        }

        .role-badge--rejected {
          background: rgba(240, 71, 71, 0.2);
          color: var(--discord-danger);
        }

        @media (max-width: 768px) {
          .filters-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};