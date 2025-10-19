import React, { useState, useEffect } from 'react';
import { Button } from '../discord/Button';
import { Input } from '../discord/Input';
import { GameManagementService } from '../../services/gameManagementService';
import { useNotifications } from '../../contexts/NotificationContext';
import { LoadingOverlay } from '../common/LoadingStates';
import type { GameDefinition } from '../../types';
import './GameManagementPanel.css';

interface GameManagementPanelProps {
  className?: string;
}

interface GameFormData {
  name: string;
  slug: string;
  icon: string;
}

interface EditingGame extends GameFormData {
  id: string;
}

export const GameManagementPanel: React.FC<GameManagementPanelProps> = ({ className = '' }) => {
  const { showSuccess, showError } = useNotifications();
  const [games, setGames] = useState<GameDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGame, setEditingGame] = useState<EditingGame | null>(null);
  const [formData, setFormData] = useState<GameFormData>({
    name: '',
    slug: '',
    icon: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<GameFormData>>({});

  // Load games on component mount
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    try {
      // Initialize the service if needed
      GameManagementService.initialize();
      const allGames = GameManagementService.getAllGames();
      setGames(allGames);
    } catch (error) {
      console.error('Failed to load games:', error);
      showError('Load Failed', 'Failed to load games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data: GameFormData): boolean => {
    const errors: Partial<GameFormData> = {};

    if (!data.name.trim()) {
      errors.name = 'Game name is required';
    }

    if (!data.slug.trim()) {
      errors.slug = 'Game slug is required';
    } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    // Check slug uniqueness
    const isSlugUnique = GameManagementService.validateGameSlugUnique(
      data.slug, 
      editingGame?.id
    );
    if (!isSlugUnique) {
      errors.slug = 'This slug is already in use';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateGame = async () => {
    if (!validateForm(formData)) return;

    setLoading(true);
    try {
      const newGame = await GameManagementService.createGame(
        formData.name,
        formData.slug,
        formData.icon || '/icons/default-game.png',
        'admin' // TODO: Get actual admin ID from auth context
      );

      setGames(prev => [...prev, newGame]);
      setFormData({ name: '', slug: '', icon: '' });
      setShowCreateForm(false);
      showSuccess('Game Created', `${newGame.name} has been created successfully.`);
    } catch (error: any) {
      console.error('Failed to create game:', error);
      showError('Creation Failed', error.message || 'Failed to create game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGame = async () => {
    if (!editingGame || !validateForm(formData)) return;

    setLoading(true);
    try {
      const updatedGame = await GameManagementService.updateGame(
        editingGame.id,
        {
          name: formData.name,
          slug: formData.slug,
          icon: formData.icon || '/icons/default-game.png'
        },
        'admin' // TODO: Get actual admin ID from auth context
      );

      setGames(prev => prev.map(game => 
        game.id === editingGame.id ? updatedGame : game
      ));
      setEditingGame(null);
      setFormData({ name: '', slug: '', icon: '' });
      showSuccess('Game Updated', `${updatedGame.name} has been updated successfully.`);
    } catch (error: any) {
      console.error('Failed to update game:', error);
      showError('Update Failed', error.message || 'Failed to update game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateGame = async (gameId: string, gameName: string) => {
    if (!confirm(`Are you sure you want to deactivate "${gameName}"? This will hide it from users but preserve all data.`)) {
      return;
    }

    setLoading(true);
    try {
      const deactivatedGame = await GameManagementService.deactivateGame(gameId, 'admin');
      setGames(prev => prev.map(game => 
        game.id === gameId ? deactivatedGame : game
      ));
      showSuccess('Game Deactivated', `${gameName} has been deactivated.`);
    } catch (error: any) {
      console.error('Failed to deactivate game:', error);
      showError('Deactivation Failed', error.message || 'Failed to deactivate game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateGame = async (gameId: string, gameName: string) => {
    setLoading(true);
    try {
      const activatedGame = await GameManagementService.updateGame(
        gameId,
        { isActive: true },
        'admin'
      );
      setGames(prev => prev.map(game => 
        game.id === gameId ? activatedGame : game
      ));
      showSuccess('Game Activated', `${gameName} has been activated.`);
    } catch (error: any) {
      console.error('Failed to activate game:', error);
      showError('Activation Failed', error.message || 'Failed to activate game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (game: GameDefinition) => {
    setEditingGame({
      id: game.id,
      name: game.name,
      slug: game.slug,
      icon: game.icon
    });
    setFormData({
      name: game.name,
      slug: game.slug,
      icon: game.icon
    });
    setFormErrors({});
  };

  const cancelEdit = () => {
    setEditingGame(null);
    setFormData({ name: '', slug: '', icon: '' });
    setFormErrors({});
  };

  const cancelCreate = () => {
    setShowCreateForm(false);
    setFormData({ name: '', slug: '', icon: '' });
    setFormErrors({});
  };

  const handleInputChange = (field: keyof GameFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name' && !editingGame) {
      const autoSlug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <LoadingOverlay isLoading={loading} message="Managing games...">
      <div className={`game-management-panel ${className}`}>
        <div className="game-management-panel__header">
          <h3 className="game-management-panel__title">Game Management</h3>
          <p className="game-management-panel__description">
            Manage games and their settings for the multi-wallet system
          </p>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            disabled={showCreateForm || editingGame !== null}
          >
            Add New Game
          </Button>
        </div>

        {/* Create Game Form */}
        {showCreateForm && (
          <div className="game-management-panel__form">
            <div className="game-management-panel__form-header">
              <h4>Create New Game</h4>
            </div>
            <div className="game-management-panel__form-fields">
              <Input
                label="Game Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={formErrors.name}
                placeholder="e.g., World of Warcraft"
                fullWidth
              />
              <Input
                label="Game Slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                error={formErrors.slug}
                placeholder="e.g., world-of-warcraft"
                helperText="Used in URLs. Only lowercase letters, numbers, and hyphens allowed."
                fullWidth
              />
              <Input
                label="Icon URL (Optional)"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                placeholder="e.g., /icons/wow.png"
                helperText="Leave empty to use default icon"
                fullWidth
              />
            </div>
            <div className="game-management-panel__form-actions">
              <Button variant="secondary" onClick={cancelCreate}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateGame}>
                Create Game
              </Button>
            </div>
          </div>
        )}

        {/* Games List */}
        <div className="game-management-panel__games">
          <h4 className="game-management-panel__section-title">
            Existing Games ({games.length})
          </h4>
          
          {games.length === 0 ? (
            <div className="game-management-panel__empty">
              <p>No games found. Create your first game to get started.</p>
            </div>
          ) : (
            <div className="game-management-panel__games-grid">
              {games.map((game) => (
                <div key={game.id} className="game-management-panel__game-item">
                  {editingGame?.id === game.id ? (
                    // Edit Form
                    <div className="game-management-panel__edit-form">
                      <div className="game-management-panel__edit-header">
                        <h5>Edit Game</h5>
                      </div>
                      <div className="game-management-panel__edit-fields">
                        <Input
                          label="Game Name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          error={formErrors.name}
                          fullWidth
                        />
                        <Input
                          label="Game Slug"
                          value={formData.slug}
                          onChange={(e) => handleInputChange('slug', e.target.value)}
                          error={formErrors.slug}
                          fullWidth
                        />
                        <Input
                          label="Icon URL"
                          value={formData.icon}
                          onChange={(e) => handleInputChange('icon', e.target.value)}
                          fullWidth
                        />
                      </div>
                      <div className="game-management-panel__edit-actions">
                        <Button variant="secondary" size="sm" onClick={cancelEdit}>
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleUpdateGame}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Game Display
                    <>
                      <div className="game-management-panel__game-info">
                        <div className="game-management-panel__game-icon">
                          <img 
                            src={game.icon} 
                            alt={game.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/icons/default-game.png';
                            }}
                          />
                        </div>
                        <div className="game-management-panel__game-details">
                          <h5 className="game-management-panel__game-name">
                            {game.name}
                            {!game.isActive && (
                              <span className="game-management-panel__status-badge game-management-panel__status-badge--inactive">
                                Inactive
                              </span>
                            )}
                          </h5>
                          <p className="game-management-panel__game-slug">/{game.slug}</p>
                          <p className="game-management-panel__game-realms">
                            {game.realms.length} realm{game.realms.length !== 1 ? 's' : ''}
                          </p>
                          <p className="game-management-panel__game-date">
                            Created {game.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="game-management-panel__game-actions">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startEdit(game)}
                        >
                          Edit
                        </Button>
                        {game.isActive ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeactivateGame(game.id, game.name)}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleActivateGame(game.id, game.name)}
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