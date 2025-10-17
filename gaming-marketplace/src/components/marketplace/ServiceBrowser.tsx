import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceCard } from './ServiceCard';
import { ServiceFilters } from './ServiceFilters';
import { SearchBar } from './SearchBar';
import { ViewToggle } from './ViewToggle';
import type { ServiceListing } from '../../services/marketplaceService';
import { MarketplaceService } from '../../services/marketplaceService';
import type { ServiceFilters as ServiceFiltersType, Game, ServiceType } from '../../types';
import './ServiceBrowser.css';

interface ServiceBrowserProps {
  services: ServiceListing[];
  loading: boolean;
  error: string | null;
  filters: ServiceFiltersType;
  searchQuery: string;
  onFiltersChange: (filters: ServiceFiltersType) => void;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
}

type ViewMode = 'grid' | 'list';

export const ServiceBrowser: React.FC<ServiceBrowserProps> = ({
  services,
  loading,
  error,
  filters,
  searchQuery,
  onFiltersChange,
  onSearchChange,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [games, setGames] = useState<Game[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  // Load games and service types for filters
  useEffect(() => {
    loadFilterData();
  }, []);

  // Load service types when game filter changes
  useEffect(() => {
    if (filters.gameId) {
      loadServiceTypes(filters.gameId);
    } else {
      setServiceTypes([]);
    }
  }, [filters.gameId]);

  const loadFilterData = async () => {
    try {
      const gamesData = await MarketplaceService.getGames();
      setGames(gamesData);
    } catch (err) {
      console.error('Failed to load filter data:', err);
    }
  };

  const loadServiceTypes = async (gameId: string) => {
    try {
      const serviceTypesData = await MarketplaceService.getServiceTypes(gameId);
      setServiceTypes(serviceTypesData);
    } catch (err) {
      console.error('Failed to load service types:', err);
    }
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/marketplace/service/${serviceId}`);
  };

  const handleViewOrdersClick = () => {
    navigate('/marketplace/orders');
  };

  const handleViewHistoryClick = () => {
    navigate('/marketplace/history');
  };

  if (error) {
    return (
      <div className="service-browser">
        <div className="service-browser__error">
          <h2>Error Loading Services</h2>
          <p>{error}</p>
          <button 
            className="discord-button discord-button--primary"
            onClick={onRefresh}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="service-browser">
      {/* Header */}
      <div className="service-browser__header">
        <div className="service-browser__title-section">
          <h1 className="service-browser__title">🛒 Marketplace</h1>
          <p className="service-browser__subtitle">
            Browse and purchase gaming services from verified providers
          </p>
        </div>
        
        <div className="service-browser__actions">
          <button 
            className="discord-button discord-button--secondary"
            onClick={handleViewOrdersClick}
          >
            📋 My Orders
          </button>
          <button 
            className="discord-button discord-button--secondary"
            onClick={handleViewHistoryClick}
          >
            📜 Order History
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="service-browser__controls">
        <div className="service-browser__search">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search services, games, or providers..."
          />
        </div>
        
        <div className="service-browser__filters">
          <ServiceFilters
            filters={filters}
            games={games}
            serviceTypes={serviceTypes}
            onFiltersChange={onFiltersChange}
          />
        </div>

        <div className="service-browser__view-controls">
          <ViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <div className="service-browser__results-count">
            {loading ? 'Loading...' : `${services.length} services found`}
          </div>
        </div>
      </div>

      {/* Services Grid/List */}
      <div className={`service-browser__content service-browser__content--${viewMode}`}>
        {loading ? (
          <div className="service-browser__loading">
            <div className="service-browser__loading-spinner" />
            <p>Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="service-browser__empty">
            <div className="service-browser__empty-icon">🔍</div>
            <h3>No Services Found</h3>
            <p>
              {searchQuery || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : 'No services are currently available'}
            </p>
            {(searchQuery || Object.keys(filters).length > 0) && (
              <button 
                className="discord-button discord-button--primary"
                onClick={() => {
                  onSearchChange('');
                  onFiltersChange({});
                }}
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          <div className={`service-browser__grid service-browser__grid--${viewMode}`}>
            {services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                viewMode={viewMode}
                onClick={() => handleServiceClick(service.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};