import React, { useState } from 'react';
import { TeamService } from '../../services/teamService';
import { useAuth } from '../../contexts/AuthContext';
import './WorkspaceTemplates.css';

interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gaming' | 'business' | 'custom';
  features: string[];
  defaultPermissions: string[];
  serviceTypes: string[];
  memberRoles: Array<{
    name: string;
    permissions: string[];
    description: string;
  }>;
}

const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: 'mythic_plus_team',
    name: 'Mythic+ Specialists',
    description: 'Optimized for teams focusing on Mythic+ dungeon carries',
    icon: '🏰',
    category: 'gaming',
    features: [
      'Mythic+ service templates',
      'Key level tracking',
      'Seasonal affix management',
      'Performance analytics'
    ],
    defaultPermissions: ['create_service', 'edit_service', 'manage_orders', 'view_earnings'],
    serviceTypes: ['mythic_plus', 'key_push', 'weekly_chest'],
    memberRoles: [
      {
        name: 'Tank Specialist',
        permissions: ['create_service', 'manage_orders'],
        description: 'Leads dungeon runs and manages tank-specific services'
      },
      {
        name: 'DPS Carry',
        permissions: ['create_service', 'edit_service'],
        description: 'Provides high DPS for efficient runs'
      },
      {
        name: 'Support Player',
        permissions: ['view_earnings'],
        description: 'Assists with runs and provides backup'
      }
    ]
  },
  {
    id: 'raid_guild',
    name: 'Raid Guild',
    description: 'Full-service raid team with multiple difficulty tiers',
    icon: '⚔️',
    category: 'gaming',
    features: [
      'Raid tier management',
      'Loot distribution tracking',
      'Progress monitoring',
      'Member scheduling'
    ],
    defaultPermissions: ['create_service', 'edit_service', 'manage_orders', 'view_earnings', 'invite_members'],
    serviceTypes: ['raid_normal', 'raid_heroic', 'raid_mythic', 'achievement_runs'],
    memberRoles: [
      {
        name: 'Raid Leader',
        permissions: ['create_service', 'edit_service', 'manage_orders', 'invite_members'],
        description: 'Leads raids and manages team strategy'
      },
      {
        name: 'Core Raider',
        permissions: ['create_service', 'edit_service', 'view_earnings'],
        description: 'Experienced raider for all content'
      },
      {
        name: 'Backup Raider',
        permissions: ['view_earnings'],
        description: 'Available for fill-in roles'
      }
    ]
  },
  {
    id: 'leveling_service',
    name: 'Leveling Service',
    description: 'Efficient character leveling and power-leveling services',
    icon: '📈',
    category: 'gaming',
    features: [
      'Level range tracking',
      'Experience optimization',
      'Quest completion tracking',
      'Time estimation tools'
    ],
    defaultPermissions: ['create_service', 'edit_service', 'manage_orders'],
    serviceTypes: ['character_leveling', 'power_leveling', 'profession_leveling'],
    memberRoles: [
      {
        name: 'Leveling Expert',
        permissions: ['create_service', 'edit_service', 'manage_orders'],
        description: 'Specializes in efficient leveling routes'
      },
      {
        name: 'Assistant Leveler',
        permissions: ['create_service', 'view_earnings'],
        description: 'Helps with leveling services'
      }
    ]
  },
  {
    id: 'pvp_arena_team',
    name: 'PvP Arena Team',
    description: 'Competitive PvP team for arena and rated battlegrounds',
    icon: '🛡️',
    category: 'gaming',
    features: [
      'Rating tracking',
      'Season management',
      'Composition planning',
      'Win rate analytics'
    ],
    defaultPermissions: ['create_service', 'edit_service', 'manage_orders', 'view_earnings'],
    serviceTypes: ['arena_2v2', 'arena_3v3', 'rated_battlegrounds', 'pvp_coaching'],
    memberRoles: [
      {
        name: 'Arena Captain',
        permissions: ['create_service', 'edit_service', 'manage_orders', 'invite_members'],
        description: 'Leads PvP strategy and team coordination'
      },
      {
        name: 'PvP Specialist',
        permissions: ['create_service', 'edit_service', 'view_earnings'],
        description: 'Expert in specific PvP roles'
      }
    ]
  },
  {
    id: 'business_team',
    name: 'Business Team',
    description: 'Professional service team with business-focused features',
    icon: '💼',
    category: 'business',
    features: [
      'Client relationship management',
      'Service level agreements',
      'Performance metrics',
      'Revenue tracking'
    ],
    defaultPermissions: ['create_service', 'edit_service', 'manage_orders', 'view_earnings', 'manage_payouts'],
    serviceTypes: ['premium_service', 'consultation', 'custom_order'],
    memberRoles: [
      {
        name: 'Account Manager',
        permissions: ['create_service', 'edit_service', 'manage_orders', 'manage_payouts'],
        description: 'Manages client relationships and service delivery'
      },
      {
        name: 'Service Provider',
        permissions: ['create_service', 'edit_service', 'view_earnings'],
        description: 'Delivers services to clients'
      },
      {
        name: 'Quality Assurance',
        permissions: ['view_earnings', 'manage_orders'],
        description: 'Ensures service quality and client satisfaction'
      }
    ]
  }
];

interface WorkspaceTemplatesProps {
  onTemplateApplied: (template: WorkspaceTemplate) => void;
  onClose: () => void;
}

export const WorkspaceTemplates: React.FC<WorkspaceTemplatesProps> = ({
  onTemplateApplied,
  onClose
}) => {
  const { state: authState } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkspaceTemplate | null>(null);
  const [customizations, setCustomizations] = useState({
    teamName: '',
    description: '',
    enabledFeatures: [] as string[],
    memberRoles: [] as string[]
  });

  const handleTemplateSelect = (template: WorkspaceTemplate) => {
    setSelectedTemplate(template);
    setCustomizations({
      teamName: template.name,
      description: template.description,
      enabledFeatures: [...template.features],
      memberRoles: template.memberRoles.map(role => role.name)
    });
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !authState.user) return;

    try {
      // Create team with template configuration
      const team = TeamService.createTeam({
        name: customizations.teamName,
        description: customizations.description,
        leaderId: authState.user.id
      });

      // Apply template permissions and settings
      const templateConfig = {
        template: selectedTemplate.id,
        features: customizations.enabledFeatures,
        memberRoles: customizations.memberRoles,
        defaultPermissions: selectedTemplate.defaultPermissions,
        serviceTypes: selectedTemplate.serviceTypes
      };

      // Save template configuration
      localStorage.setItem(`team_template_${team.id}`, JSON.stringify(templateConfig));

      onTemplateApplied(selectedTemplate);
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const getTemplatesByCategory = (category: string) => {
    return WORKSPACE_TEMPLATES.filter(template => template.category === category);
  };

  return (
    <div className="workspace-templates">
      <div className="workspace-templates__header">
        <h3>Choose a Workspace Template</h3>
        <p>Get started quickly with pre-configured team setups for different types of gaming services.</p>
        <button
          className="workspace-templates__close"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="workspace-templates__content">
        {!selectedTemplate ? (
          <div className="workspace-templates__selection">
            {/* Gaming Templates */}
            <div className="workspace-templates__category">
              <h4>Gaming Teams</h4>
              <div className="workspace-templates__grid">
                {getTemplatesByCategory('gaming').map((template) => (
                  <div
                    key={template.id}
                    className="workspace-templates__card"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="workspace-templates__card-icon">
                      {template.icon}
                    </div>
                    <div className="workspace-templates__card-content">
                      <h5>{template.name}</h5>
                      <p>{template.description}</p>
                      <div className="workspace-templates__card-features">
                        {template.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="workspace-templates__feature-tag">
                            {feature}
                          </span>
                        ))}
                        {template.features.length > 3 && (
                          <span className="workspace-templates__feature-more">
                            +{template.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Templates */}
            <div className="workspace-templates__category">
              <h4>Business Teams</h4>
              <div className="workspace-templates__grid">
                {getTemplatesByCategory('business').map((template) => (
                  <div
                    key={template.id}
                    className="workspace-templates__card"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="workspace-templates__card-icon">
                      {template.icon}
                    </div>
                    <div className="workspace-templates__card-content">
                      <h5>{template.name}</h5>
                      <p>{template.description}</p>
                      <div className="workspace-templates__card-features">
                        {template.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="workspace-templates__feature-tag">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="workspace-templates__custom">
              <button
                className="workspace-templates__custom-button"
                onClick={() => onClose()}
              >
                <span className="workspace-templates__custom-icon">⚙️</span>
                <div>
                  <h5>Custom Setup</h5>
                  <p>Create a team from scratch with your own configuration</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="workspace-templates__customization">
            <div className="workspace-templates__template-preview">
              <div className="workspace-templates__template-header">
                <span className="workspace-templates__template-icon">
                  {selectedTemplate.icon}
                </span>
                <div>
                  <h4>{selectedTemplate.name}</h4>
                  <p>{selectedTemplate.description}</p>
                </div>
              </div>

              <div className="workspace-templates__template-details">
                <div className="workspace-templates__detail-section">
                  <h5>Included Features</h5>
                  <ul>
                    {selectedTemplate.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="workspace-templates__detail-section">
                  <h5>Member Roles</h5>
                  <div className="workspace-templates__roles">
                    {selectedTemplate.memberRoles.map((role, index) => (
                      <div key={index} className="workspace-templates__role">
                        <div className="workspace-templates__role-name">{role.name}</div>
                        <div className="workspace-templates__role-description">{role.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="workspace-templates__customization-form">
              <h4>Customize Your Team</h4>
              
              <div className="workspace-templates__form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  value={customizations.teamName}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, teamName: e.target.value }))}
                  className="workspace-templates__input"
                />
              </div>

              <div className="workspace-templates__form-group">
                <label>Description</label>
                <textarea
                  value={customizations.description}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, description: e.target.value }))}
                  className="workspace-templates__textarea"
                  rows={3}
                />
              </div>

              <div className="workspace-templates__actions">
                <button
                  className="workspace-templates__button workspace-templates__button--secondary"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Back
                </button>
                <button
                  className="workspace-templates__button workspace-templates__button--primary"
                  onClick={handleApplyTemplate}
                  disabled={!customizations.teamName.trim()}
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};