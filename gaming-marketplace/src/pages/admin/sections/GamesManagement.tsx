import React, { useState } from 'react';
import type { Game, ServiceType } from '../../../types';

export const GamesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'games' | 'service-types'>('games');
  const [showGameForm, setShowGameForm] = useState(false);
  const [showServiceTypeForm, setShowServiceTypeForm] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>('');

  // Mock games data
  const [games] = useState<Game[]>([
    {
      id: 'game_1',
      name: 'World of Warcraft',
      slug: 'wow',
      icon: '🏰',
      isActive: true,
      serviceTypes: [],
    },
    {
      id: 'game_2',
      name: 'Final Fantasy XIV',
      slug: 'ffxiv',
      icon: '⚔️',
      isActive: true,
      serviceTypes: [],
    },
    {
      id: 'game_3',
      name: 'Lost Ark',
      slug: 'lost-ark',
      icon: '🗡️',
      isActive: false,
      serviceTypes: [],
    },
  ]);

  // Mock service types data
  const [serviceTypes] = useState<ServiceType[]>([
    {
      id: 'st_1',
      gameId: 'game_1',
      name: 'Mythic+ Dungeon',
      requiresAdmin: false,
      description: 'High-level dungeon completion service',
      isActive: true,
    },
    {
      id: 'st_2',
      gameId: 'game_1',
      name: 'Leveling',
      requiresAdmin: false,
      description: 'Character leveling service',
      isActive: true,
    },
    {
      id: 'st_3',
      gameId: 'game_1',
      name: 'Raid',
      requiresAdmin: true,
      description: 'Raid completion service (Admin only)',
      isActive: true,
    },
    {
      id: 'st_4',
      gameId: 'game_1',
      name: 'Delve',
      requiresAdmin: false,
      description: 'Delve completion service',
      isActive: true,
    },
    {
      id: 'st_5',
      gameId: 'game_1',
      name: 'Custom Boost',
      requiresAdmin: false,
      description: 'Custom boosting service',
      isActive: true,
    },
  ]);

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock game creation
    setShowGameForm(false);
  };

  const handleCreateServiceType = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock service type creation
    setShowServiceTypeForm(false);
  };

  const getGameName = (gameId: string) => {
    return games.find(g => g.id === gameId)?.name || 'Unknown Game';
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Games Management</h2>
        <p className="admin-section__description">
          Manage games and service types available on the platform
        </p>
      </div>

      <div className="admin-section__content">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'games' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            🎮 Games
          </button>
          <button
            className={`tab-button ${activeTab === 'service-types' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('service-types')}
          >
            🛠️ Service Types
          </button>
        </div>

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="admin-card">
            <div className="admin-card__header">
              <h3 className="admin-card__title">Games</h3>
              <button
                className="admin-button"
                onClick={() => setShowGameForm(true)}
              >
                + Add Game
              </button>
            </div>
            <div className="admin-card__content">
              {games.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Icon</th>
                      <th>Name</th>
                      <th>Slug</th>
                      <th>Status</th>
                      <th>Service Types</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((game) => (
                      <tr key={game.id}>
                        <td>{game.icon}</td>
                        <td>{game.name}</td>
                        <td>{game.slug}</td>
                        <td>
                          <span className={`status-badge ${game.isActive ? 'status-badge--active' : 'status-badge--inactive'}`}>
                            {game.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{serviceTypes.filter(st => st.gameId === game.id).length}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-button action-button--edit">Edit</button>
                            <button className="action-button action-button--reject">
                              {game.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <div className="empty-state__icon">🎮</div>
                  <div className="empty-state__title">No Games</div>
                  <div className="empty-state__description">
                    Add your first game to get started
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Types Tab */}
        {activeTab === 'service-types' && (
          <div className="admin-card">
            <div className="admin-card__header">
              <h3 className="admin-card__title">Service Types</h3>
              <button
                className="admin-button"
                onClick={() => setShowServiceTypeForm(true)}
              >
                + Add Service Type
              </button>
            </div>
            <div className="admin-card__content">
              {serviceTypes.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Game</th>
                      <th>Description</th>
                      <th>Admin Only</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceTypes.map((serviceType) => (
                      <tr key={serviceType.id}>
                        <td>{serviceType.name}</td>
                        <td>{getGameName(serviceType.gameId)}</td>
                        <td>{serviceType.description}</td>
                        <td>
                          <span className={`status-badge ${serviceType.requiresAdmin ? 'status-badge--pending' : 'status-badge--active'}`}>
                            {serviceType.requiresAdmin ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${serviceType.isActive ? 'status-badge--active' : 'status-badge--inactive'}`}>
                            {serviceType.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-button action-button--edit">Edit</button>
                            <button className="action-button action-button--reject">
                              {serviceType.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <div className="empty-state__icon">🛠️</div>
                  <div className="empty-state__title">No Service Types</div>
                  <div className="empty-state__description">
                    Add service types for your games
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Creation Form Modal */}
        {showGameForm && (
          <div className="modal-overlay" onClick={() => setShowGameForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add New Game</h3>
              <form onSubmit={handleCreateGame} className="admin-form">
                <div className="admin-form__group">
                  <label className="admin-form__label">Game Name</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    placeholder="Enter game name"
                    required
                  />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Slug</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    placeholder="game-slug"
                    required
                  />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Icon (Emoji)</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    placeholder="🎮"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="admin-button">Create Game</button>
                  <button
                    type="button"
                    className="admin-button admin-button--secondary"
                    onClick={() => setShowGameForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Service Type Creation Form Modal */}
        {showServiceTypeForm && (
          <div className="modal-overlay" onClick={() => setShowServiceTypeForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add New Service Type</h3>
              <form onSubmit={handleCreateServiceType} className="admin-form">
                <div className="admin-form__group">
                  <label className="admin-form__label">Game</label>
                  <select
                    className="admin-form__input"
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    required
                  >
                    <option value="">Select a game</option>
                    {games.filter(g => g.isActive).map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.icon} {game.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Service Type Name</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    placeholder="Enter service type name"
                    required
                  />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Description</label>
                  <textarea
                    className="admin-form__textarea"
                    placeholder="Describe this service type"
                    required
                  />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">
                    <input type="checkbox" /> Requires Admin Permission
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="admin-button">Create Service Type</button>
                  <button
                    type="button"
                    className="admin-button admin-button--secondary"
                    onClick={() => setShowServiceTypeForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .tab-navigation {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .tab-button {
          padding: 12px 20px;
          background: var(--discord-bg-secondary);
          color: var(--discord-text-secondary);
          border: 1px solid var(--discord-bg-tertiary);
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.17s ease;
        }

        .tab-button:hover {
          background: var(--discord-bg-tertiary);
          color: var(--discord-text-primary);
        }

        .tab-button--active {
          background: var(--discord-accent);
          color: var(--discord-text-primary);
          border-color: var(--discord-accent);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--discord-bg-secondary);
          border-radius: 8px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          margin: 0 0 20px 0;
          color: var(--discord-text-primary);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};