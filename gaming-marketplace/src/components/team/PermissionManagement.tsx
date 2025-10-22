import React, { useState } from 'react';
import { TeamService } from '../../services/teamService';
import type { Team, TeamMember } from '../../types';
import './PermissionManagement.css';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'services' | 'members' | 'finances' | 'settings';
}

interface MemberPermissions {
  userId: string;
  permissions: string[];
}

interface PermissionManagementProps {
  team: Team;
  isLeader: boolean;
  onPermissionsUpdated: () => void;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // Services
  { id: 'create_service', name: 'Create Services', description: 'Can create new services for the team', category: 'services' },
  { id: 'edit_service', name: 'Edit Services', description: 'Can modify existing team services', category: 'services' },
  { id: 'delete_service', name: 'Delete Services', description: 'Can delete team services', category: 'services' },
  { id: 'manage_orders', name: 'Manage Orders', description: 'Can assign boosters and manage order workflow', category: 'services' },
  
  // Members
  { id: 'invite_members', name: 'Invite Members', description: 'Can send invitations to new team members', category: 'members' },
  { id: 'remove_members', name: 'Remove Members', description: 'Can remove members from the team', category: 'members' },
  { id: 'manage_permissions', name: 'Manage Permissions', description: 'Can modify member permissions', category: 'members' },
  
  // Finances
  { id: 'view_earnings', name: 'View Earnings', description: 'Can view team earnings and financial reports', category: 'finances' },
  { id: 'manage_payouts', name: 'Manage Payouts', description: 'Can distribute earnings to team members', category: 'finances' },
  
  // Settings
  { id: 'edit_team_info', name: 'Edit Team Info', description: 'Can modify team name, description, and settings', category: 'settings' },
  { id: 'manage_integrations', name: 'Manage Integrations', description: 'Can configure external integrations', category: 'settings' }
];

export const PermissionManagement: React.FC<PermissionManagementProps> = ({
  team,
  isLeader,
  onPermissionsUpdated
}) => {
  const [memberPermissions, setMemberPermissions] = useState<MemberPermissions[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadMemberPermissions();
  }, [team.id]);

  const loadMemberPermissions = () => {
    // Load from localStorage or initialize with default permissions
    const savedPermissions = localStorage.getItem(`team_permissions_${team.id}`);
    if (savedPermissions) {
      setMemberPermissions(JSON.parse(savedPermissions));
    } else {
      // Initialize with default permissions for all members
      const defaultPermissions = team.members
        .filter(member => member.status === 'active' && member.role !== 'leader')
        .map(member => ({
          userId: member.userId,
          permissions: ['view_earnings'] // Default permission
        }));
      setMemberPermissions(defaultPermissions);
    }
  };

  const saveMemberPermissions = (permissions: MemberPermissions[]) => {
    localStorage.setItem(`team_permissions_${team.id}`, JSON.stringify(permissions));
    setMemberPermissions(permissions);
    onPermissionsUpdated();
  };

  const getMemberPermissions = (userId: string): string[] => {
    const memberPerms = memberPermissions.find(mp => mp.userId === userId);
    return memberPerms?.permissions || [];
  };

  const hasPermission = (userId: string, permissionId: string): boolean => {
    const member = team.members.find(m => m.userId === userId);
    if (member?.role === 'leader') return true; // Leaders have all permissions
    
    return getMemberPermissions(userId).includes(permissionId);
  };

  const togglePermission = (userId: string, permissionId: string) => {
    if (!isLeader) return;

    const currentPermissions = getMemberPermissions(userId);
    const hasCurrentPermission = currentPermissions.includes(permissionId);
    
    const newPermissions = hasCurrentPermission
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId];

    const updatedMemberPermissions = memberPermissions.map(mp =>
      mp.userId === userId
        ? { ...mp, permissions: newPermissions }
        : mp
    );

    // Add new member if not exists
    if (!memberPermissions.find(mp => mp.userId === userId)) {
      updatedMemberPermissions.push({
        userId,
        permissions: newPermissions
      });
    }

    saveMemberPermissions(updatedMemberPermissions);
  };

  const applyPermissionTemplate = (userId: string, template: 'basic' | 'advanced' | 'manager') => {
    if (!isLeader) return;

    let templatePermissions: string[] = [];
    
    switch (template) {
      case 'basic':
        templatePermissions = ['view_earnings'];
        break;
      case 'advanced':
        templatePermissions = ['create_service', 'edit_service', 'manage_orders', 'view_earnings'];
        break;
      case 'manager':
        templatePermissions = [
          'create_service', 'edit_service', 'delete_service', 'manage_orders',
          'invite_members', 'view_earnings', 'edit_team_info'
        ];
        break;
    }

    const updatedMemberPermissions = memberPermissions.map(mp =>
      mp.userId === userId
        ? { ...mp, permissions: templatePermissions }
        : mp
    );

    if (!memberPermissions.find(mp => mp.userId === userId)) {
      updatedMemberPermissions.push({
        userId,
        permissions: templatePermissions
      });
    }

    saveMemberPermissions(updatedMemberPermissions);
  };

  const getPermissionsByCategory = (category: string) => {
    return AVAILABLE_PERMISSIONS.filter(p => p.category === category);
  };

  const activeMembers = team.members.filter(member => 
    member.status === 'active' && member.role !== 'leader'
  );

  if (!isLeader) {
    return (
      <div className="permission-management">
        <div className="permission-management__no-access">
          <h3>Permission Management</h3>
          <p>Only team leaders can manage member permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="permission-management">
      <div className="permission-management__header">
        <h3>Permission Management</h3>
        <p>Configure what team members can do within the team workspace.</p>
      </div>

      <div className="permission-management__content">
        {/* Member Selection */}
        <div className="permission-management__member-list">
          <h4>Team Members</h4>
          {activeMembers.length === 0 ? (
            <div className="permission-management__no-members">
              <p>No team members to manage permissions for.</p>
            </div>
          ) : (
            <div className="permission-management__members">
              {activeMembers.map((member) => (
                <div
                  key={member.userId}
                  className={`permission-management__member-card ${
                    selectedMember === member.userId ? 'permission-management__member-card--selected' : ''
                  }`}
                  onClick={() => setSelectedMember(member.userId)}
                >
                  <div className="permission-management__member-info">
                    <div className="permission-management__member-name">
                      Member #{member.userId.slice(-4)}
                    </div>
                    <div className="permission-management__member-permissions-count">
                      {getMemberPermissions(member.userId).length} permissions
                    </div>
                  </div>
                  <div className="permission-management__member-templates">
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        if (e.target.value) {
                          applyPermissionTemplate(member.userId, e.target.value as any);
                          e.target.value = '';
                        }
                      }}
                      className="permission-management__template-select"
                    >
                      <option value="">Apply Template</option>
                      <option value="basic">Basic Member</option>
                      <option value="advanced">Advanced Member</option>
                      <option value="manager">Team Manager</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Permission Configuration */}
        {selectedMember && (
          <div className="permission-management__permissions">
            <h4>
              Permissions for Member #{selectedMember.slice(-4)}
            </h4>
            
            {(['services', 'members', 'finances', 'settings'] as const).map((category) => (
              <div key={category} className="permission-management__category">
                <h5 className="permission-management__category-title">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h5>
                
                <div className="permission-management__category-permissions">
                  {getPermissionsByCategory(category).map((permission) => (
                    <label
                      key={permission.id}
                      className="permission-management__permission"
                    >
                      <input
                        type="checkbox"
                        checked={hasPermission(selectedMember, permission.id)}
                        onChange={() => togglePermission(selectedMember, permission.id)}
                        className="permission-management__permission-checkbox"
                      />
                      <div className="permission-management__permission-info">
                        <div className="permission-management__permission-name">
                          {permission.name}
                        </div>
                        <div className="permission-management__permission-description">
                          {permission.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};