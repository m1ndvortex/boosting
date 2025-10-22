import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useWorkspace } from '../../../../contexts/WorkspaceContext';
import { ServiceService } from '../../../../services/serviceService';
import { ServiceForm } from '../../../../components/forms/ServiceForm';
import { ActivityLog } from '../../../../components/team/ActivityLog';
import type { Service, Game } from '../../../../types';
import './MyServices.css';

export const MyServices: React.FC = () => {
  const { state } = useAuth();
  const { state: workspaceState } = useWorkspace();
  const [services, setServices] = useState<Service[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!state.user) return;
      
      try {
        const [userServices, gamesData] = await Promise.all([
          ServiceService.getUserServices(
            state.user.id,
            workspaceState.currentWorkspace.type,
            workspaceState.currentWorkspace.id
          ),
          ServiceService.getGames()
        ]);
        
        setServices(userServices);
        setGames(gamesData);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [state.user, workspaceState.currentWorkspace]);

  const handleCreateService = async (serviceData: any) => {
    if (!state.user) return;

    try {
      const newService = await ServiceService.createService({
        ...serviceData,
        workspaceType: workspaceState.currentWorkspace.type,
        workspaceOwnerId: workspaceState.currentWorkspace.id,
        createdBy: state.user.id,
        status: 'active' as const
      }, state.user.username);
      
      setServices(prev => [...prev, newService]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating service:', error);
    }
  };

  const handleUpdateService = async (serviceData: any) => {
    if (!state.user || !editingService) return;

    try {
      const updatedService = await ServiceService.updateService(
        editingService.id,
        state.user.id,
        serviceData,
        state.user.username,
        workspaceState.currentWorkspace.type,
        workspaceState.currentWorkspace.id
      );
      
      setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
      setEditingService(null);
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!state.user || !confirm('Are you sure you want to delete this service?')) return;

    try {
      await ServiceService.deleteService(
        serviceId, 
        state.user.id, 
        state.user.username,
        workspaceState.currentWorkspace.type,
        workspaceState.currentWorkspace.id
      );
      setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    if (!state.user) return;

    try {
      const updatedService = await ServiceService.updateService(
        service.id,
        state.user.id,
        { status: service.status === 'active' ? 'inactive' : 'active' },
        state.user.username,
        workspaceState.currentWorkspace.type,
        workspaceState.currentWorkspace.id
      );
      
      setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
    } catch (error) {
      console.error('Error updating service status:', error);
    }
  };

  const getGameName = (gameId: string) => {
    return games.find(g => g.id === gameId)?.name || 'Unknown Game';
  };

  const getServiceTypeName = (gameId: string, serviceTypeId: string) => {
    const game = games.find(g => g.id === gameId);
    return game?.serviceTypes.find(st => st.id === serviceTypeId)?.name || 'Unknown Type';
  };

  if (loading) {
    return (
      <div className="my-services__loading">
        <div className="my-services__spinner"></div>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className="my-services">
      <div className="my-services__header">
        <div>
          <h1>My Services</h1>
          <p>Create and manage your gaming services</p>
        </div>
        <button 
          className="my-services__create-btn"
          onClick={() => setShowCreateForm(true)}
        >
          <span className="my-services__create-icon">➕</span>
          Create Service
        </button>
      </div>

      {showCreateForm && (
        <div className="my-services__form-container">
          <div className="my-services__form-header">
            <h2>Create New Service</h2>
            <button 
              className="my-services__close-btn"
              onClick={() => setShowCreateForm(false)}
            >
              ✕
            </button>
          </div>
          <ServiceForm
            games={games}
            onSubmit={handleCreateService}
            onCancel={() => setShowCreateForm(false)}
            isAdmin={state.user?.roles.some(r => r.name === 'admin' && r.status === 'active') || false}
          />
        </div>
      )}

      {editingService && (
        <div className="my-services__form-container">
          <div className="my-services__form-header">
            <h2>Edit Service</h2>
            <button 
              className="my-services__close-btn"
              onClick={() => setEditingService(null)}
            >
              ✕
            </button>
          </div>
          <ServiceForm
            games={games}
            initialData={editingService}
            onSubmit={handleUpdateService}
            onCancel={() => setEditingService(null)}
            isAdmin={state.user?.roles.some(r => r.name === 'admin' && r.status === 'active') || false}
          />
        </div>
      )}

      <div className="my-services__list">
        {services.length === 0 ? (
          <div className="my-services__empty">
            <div className="my-services__empty-icon">⚙️</div>
            <h3>No Services Yet</h3>
            <p>Create your first service to start offering gaming boosts to clients.</p>
            <button 
              className="my-services__empty-btn"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Service
            </button>
          </div>
        ) : (
          <div className="my-services__grid">
            {services.map((service) => (
              <div key={service.id} className="my-services__card">
                <div className="my-services__card-header">
                  <div className="my-services__card-title">
                    <h3>{service.title}</h3>
                    <span className={`my-services__status my-services__status--${service.status}`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="my-services__card-actions">
                    <button
                      className="my-services__action-btn"
                      onClick={() => setEditingService(service)}
                      title="Edit Service"
                    >
                      ✏️
                    </button>
                    <button
                      className="my-services__action-btn"
                      onClick={() => handleToggleStatus(service)}
                      title={service.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {service.status === 'active' ? '⏸️' : '▶️'}
                    </button>
                    <button
                      className="my-services__action-btn my-services__action-btn--danger"
                      onClick={() => handleDeleteService(service.id)}
                      title="Delete Service"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="my-services__card-content">
                  <p className="my-services__description">{service.description}</p>
                  
                  <div className="my-services__meta">
                    <div className="my-services__meta-item">
                      <span className="my-services__meta-label">Game:</span>
                      <span className="my-services__meta-value">{getGameName(service.gameId)}</span>
                    </div>
                    <div className="my-services__meta-item">
                      <span className="my-services__meta-label">Type:</span>
                      <span className="my-services__meta-value">{getServiceTypeName(service.gameId, service.serviceTypeId)}</span>
                    </div>
                  </div>

                  <div className="my-services__prices">
                    <div className="my-services__price">
                      <span className="my-services__price-label">Gold:</span>
                      <span className="my-services__price-value">{service.prices.gold.toLocaleString()} G</span>
                    </div>
                    <div className="my-services__price">
                      <span className="my-services__price-label">USD:</span>
                      <span className="my-services__price-value">${service.prices.usd}</span>
                    </div>
                    <div className="my-services__price">
                      <span className="my-services__price-label">Toman:</span>
                      <span className="my-services__price-value">{service.prices.toman.toLocaleString()} ﷼</span>
                    </div>
                  </div>

                  {/* Team workspace activity log */}
                  {workspaceState.currentWorkspace.type === 'team' && (
                    <div className="my-services__team-actions">
                      <button
                        className="my-services__activity-toggle"
                        onClick={() => setExpandedService(
                          expandedService === service.id ? null : service.id
                        )}
                      >
                        {expandedService === service.id ? 'Hide Activity' : 'Show Activity'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Activity Log for Team Workspace */}
                {workspaceState.currentWorkspace.type === 'team' && expandedService === service.id && (
                  <div className="my-services__activity-section">
                    <ActivityLog serviceId={service.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};