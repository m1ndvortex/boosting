import React, { useState, useEffect } from 'react';
import { Button } from '../discord/Button';
import { Input } from '../discord/Input';
import { GameManagementService } from '../../services/gameManagementService';
import { useNotifications } from '../../contexts/NotificationContext';
import { LoadingOverlay } from '../common/LoadingStates';
import type { GameDefinition, GameRealm } from '../../types';
import './RealmManagementPanel.css';

interface RealmManagementPanelProps {
  gameId: string;
  className?: string;
}

interface RealmFormData {
  realmName: string;
}

interface EditingRealm extends RealmFormData {
  id: string;
}

export const RealmManagementPanel: React.FC<RealmManagementPanelProps> = ({ 
  gameId, 
  className = '' 
}) => {
  const { showSuccess, showError } = useNotifications();
  const [game, setGame] = useState<GameDefinition | null>(null);
  const [realms, setRealms] = useState<GameRealm[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRealm, setEditingRealm] = useState<EditingRealm | null>(null);
  const [formData, setFormData] = useState<RealmFormData>({
    realmName: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<RealmFormData>>({});

  // Load game and realms on component mount or gameId change
  useEffect(() => {
    loadGameAndRealms();
  }, [gameId]);

  const loadGameAndRealms = async () => {
    setLoading(true);
    try {
      // Initialize the service if needed
      GameManagementService.initialize();
      
      // Load the game
      const gameData = GameManagementService.getGameById(gameId);
      if (!gameData) {
        showError('Game Not Found', 'The specified game could not be found.');
        return;
      }
      setGame(gameData);

      // Load realms for this game
      const gameRealms = GameManagementService.getGameRealms(gameId);
      setRealms(gameRealms);
    } catch (error) {
      console.error('Failed to load game and realms:', error);
      showError('Load Failed', 'Failed to load game and realms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data: RealmFormData): boolean => {
    const errors: Partial<RealmFormData> = {};

    if (!data.realmName.trim()) {
      errors.realmName = 'Realm name is required';
    } else if (data.realmName.trim().length < 2) {
      errors.realmName = 'Realm name must be at least 2 characters';
    } else if (data.realmName.trim().length > 50) {
      errors.realmName = 'Realm name must be less than 50 characters';
    }

    // Check realm name uniqueness within the game
    const isNameUnique = GameManagementService.validateRealmNameUnique(
      gameId,
      data.realmName.trim(),
      editingRealm?.id
    );
    if (!isNameUnique) {
      errors.realmName = 'This realm name already exists in this game';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateRealm = async () => {
    if (!validateForm(formData)) return;

    setLoading(true);
    try {
      const newRealm = await GameManagementService.createRealm(
        gameId,
        formData.realmName.trim(),
        'admin' // TODO: Get actual admin ID from auth context
      );

      setRealms(prev => [...prev, newRealm]);
      setFormData({ realmName: '' });
      setShowCreateForm(false);
      showSuccess('Realm Created', `${newRealm.realmName} has been created successfully.`);
    } catch (error: any) {
      console.error('Failed to create realm:', error);
      showError('Creation Failed', error.message || 'Failed to create realm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRealm = async () => {
    if (!editingRealm || !validateForm(formData)) return;

    setLoading(true);
    try {
      const updatedRealm = await GameManagementService.updateRealm(
        editingRealm.id,
        {
          realmName: formData.realmName.trim()
        },
        'admin' // TODO: Get actual admin ID from auth context
      );

      setRealms(prev => prev.map(realm => 
        realm.id === editingRealm.id ? updatedRealm : realm
      ));
      setEditingRealm(null);
      setFormData({ realmName: '' });
      showSuccess('Realm Updated', `${updatedRealm.realmName} has been updated successfully.`);
    } catch (error: any) {
      console.error('Failed to update realm:', error);
      showError('Update Failed', error.message || 'Failed to update realm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateRealm = async (realmId: string, realmName: string) => {
    if (!confirm(`Are you sure you want to deactivate "${realmName}"? This will hide it from users but preserve all data.`)) {
      return;
    }

    setLoading(true);
    try {
      const deactivatedRealm = await GameManagementService.deactivateRealm(realmId, 'admin');
      setRealms(prev => prev.map(realm => 
        realm.id === realmId ? deactivatedRealm : realm
      ));
      showSuccess('Realm Deactivated', `${realmName} has been deactivated.`);
    } catch (error: any) {
      console.error('Failed to deactivate realm:', error);
      showError('Deactivation Failed', error.message || 'Failed to deactivate realm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateRealm = async (realmId: string, realmName: string) => {
    setLoading(true);
    try {
      const activatedRealm = await GameManagementService.updateRealm(
        realmId,
        { isActive: true },
        'admin'
      );
      setRealms(prev => prev.map(realm => 
        realm.id === realmId ? activatedRealm : realm
      ));
      showSuccess('Realm Activated', `${realmName} has been activated.`);
    } catch (error: any) {
      console.error('Failed to activate realm:', error);
      showError('Activation Failed', error.message || 'Failed to activate realm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (realm: GameRealm) => {
    setEditingRealm({
      id: realm.id,
      realmName: realm.realmName
    });
    setFormData({
      realmName: realm.realmName
    });
    setFormErrors({});
  };

  const cancelEdit = () => {
    setEditingRealm(null);
    setFormData({ realmName: '' });
    setFormErrors({});
  };

  const cancelCreate = () => {
    setShowCreateForm(false);
    setFormData({ realmName: '' });
    setFormErrors({});
  };

  const handleInputChange = (field: keyof RealmFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!game) {
    return (
      <div className={`realm-management-panel ${className}`}>
        <div className="realm-management-panel__error">
          <p>Game not found. Please select a valid game.</p>
        </div>
      </div>
    );
  }

  return (
    <LoadingOverlay isLoading={loading} message="Managing realms...">
      <div className={`realm-management-panel ${className}`}>
        <div className="realm-management-panel__header">
          <div>
            <h3 className="realm-management-panel__title">
              Realm Management - {game.name}
            </h3>
            <p className="realm-management-panel__description">
              Manage realms for {game.name}. Each realm represents a server or world within the game.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            disabled={showCreateForm || editingRealm !== null}
          >
            Add New Realm
          </Button>
        </div>

        {/* Create Realm Form */}
        {showCreateForm && (
          <div className="realm-management-panel__form">
            <div className="realm-management-panel__form-header">
              <h4>Create New Realm</h4>
            </div>
            <div className="realm-management-panel__form-fields">
              <Input
                label="Realm Name"
                value={formData.realmName}
                onChange={(e) => handleInputChange('realmName', e.target.value)}
                error={formErrors.realmName}
                placeholder="e.g., Kazzak, Stormrage, Ragnaros"
                helperText="Enter the name of the realm/server within this game"
                fullWidth
              />
            </div>
            <div className="realm-management-panel__form-actions">
              <Button variant="secondary" onClick={cancelCreate}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateRealm}>
                Create Realm
              </Button>
            </div>
          </div>
        )}

        {/* Realms List */}
        <div className="realm-management-panel__realms">
          <h4 className="realm-management-panel__section-title">
            Realms ({realms.length})
          </h4>
          
          {realms.length === 0 ? (
            <div className="realm-management-panel__empty">
              <p>No realms found for {game.name}. Create your first realm to get started.</p>
            </div>
          ) : (
            <div className="realm-management-panel__realms-grid">
              {realms.map((realm) => (
                <div key={realm.id} className="realm-management-panel__realm-item">
                  {editingRealm?.id === realm.id ? (
                    // Edit Form
                    <div className="realm-management-panel__edit-form">
                      <div className="realm-management-panel__edit-header">
                        <h5>Edit Realm</h5>
                      </div>
                      <div className="realm-management-panel__edit-fields">
                        <Input
                          label="Realm Name"
                          value={formData.realmName}
                          onChange={(e) => handleInputChange('realmName', e.target.value)}
                          error={formErrors.realmName}
                          fullWidth
                        />
                      </div>
                      <div className="realm-management-panel__edit-actions">
                        <Button variant="secondary" size="sm" onClick={cancelEdit}>
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleUpdateRealm}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Realm Display
                    <>
                      <div className="realm-management-panel__realm-info">
                        <div className="realm-management-panel__realm-details">
                          <h5 className="realm-management-panel__realm-name">
                            {realm.realmName}
                            {!realm.isActive && (
                              <span className="realm-management-panel__status-badge realm-management-panel__status-badge--inactive">
                                Inactive
                              </span>
                            )}
                          </h5>
                          <p className="realm-management-panel__realm-display">
                            Display Name: {realm.displayName}
                          </p>
                          <p className="realm-management-panel__realm-date">
                            Created {realm.createdAt.toLocaleDateString()}
                          </p>
                          <p className="realm-management-panel__realm-creator">
                            Created by {realm.createdBy}
                          </p>
                        </div>
                      </div>
                      <div className="realm-management-panel__realm-actions">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startEdit(realm)}
                        >
                          Edit
                        </Button>
                        {realm.isActive ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeactivateRealm(realm.id, realm.realmName)}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleActivateRealm(realm.id, realm.realmName)}
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LoadingOverlay>
  );
};