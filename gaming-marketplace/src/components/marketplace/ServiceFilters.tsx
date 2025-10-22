import React, { useState } from 'react';
import type { ServiceFilters as ServiceFiltersType, Game, ServiceType, Currency } from '../../types';
import './ServiceFilters.css';

interface ServiceFiltersProps {
  filters: ServiceFiltersType;
  games: Game[];
  serviceTypes: ServiceType[];
  onFiltersChange: (filters: ServiceFiltersType) => void;
}

export const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  filters,
  games,
  serviceTypes,
  onFiltersChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: filters.priceRange?.min || 0,
    max: filters.priceRange?.max || 1000,
    currency: filters.priceRange?.currency || 'usd' as Currency
  });

  const handleGameChange = (gameId: string) => {
    const newFilters = { ...filters };
    if (gameId) {
      newFilters.gameId = gameId;
      // Clear service type when game changes
      delete newFilters.serviceTypeId;
    } else {
      delete newFilters.gameId;
      delete newFilters.serviceTypeId;
    }
    onFiltersChange(newFilters);
  };

  const handleServiceTypeChange = (serviceTypeId: string) => {
    const newFilters = { ...filters };
    if (serviceTypeId) {
      newFilters.serviceTypeId = serviceTypeId;
    } else {
      delete newFilters.serviceTypeId;
    }
    onFiltersChange(newFilters);
  };

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    const newFilters = { ...filters };
    if (sortBy && sortOrder) {
      newFilters.sortBy = sortBy as 'price' | 'rating' | 'completion_time';
      newFilters.sortOrder = sortOrder as 'asc' | 'desc';
    } else {
      delete newFilters.sortBy;
      delete newFilters.sortOrder;
    }
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = () => {
    const newFilters = { ...filters };
    if (priceRange.min > 0 || priceRange.max < getMaxPrice(priceRange.currency)) {
      newFilters.priceRange = { ...priceRange };
    } else {
      delete newFilters.priceRange;
    }
    onFiltersChange(newFilters);
  };

  const getMaxPrice = (currency: Currency): number => {
    switch (currency) {
      case 'gold':
        return 500000;
      case 'usd':
        return 1000;
      case 'toman':
        return 50000000;
      default:
        return 1000;
    }
  };

  const clearAllFilters = () => {
    setPriceRange({ min: 0, max: 1000, currency: 'usd' });
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="service-filters">
      <div className="service-filters__basic">
        {/* Game Filter */}
        <div className="service-filters__group">
          <label className="service-filters__label">Game</label>
          <select
            className="service-filters__select"
            value={filters.gameId || ''}
            onChange={(e) => handleGameChange(e.target.value)}
          >
            <option value="">All Games</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>
                {game.icon} {game.name}
              </option>
            ))}
          </select>
        </div>

        {/* Service Type Filter */}
        <div className="service-filters__group">
          <label className="service-filters__label">Service Type</label>
          <select
            className="service-filters__select"
            value={filters.serviceTypeId || ''}
            onChange={(e) => handleServiceTypeChange(e.target.value)}
            disabled={!filters.gameId}
          >
            <option value="">All Types</option>
            {serviceTypes.map(serviceType => (
              <option key={serviceType.id} value={serviceType.id}>
                {serviceType.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="service-filters__group">
          <label className="service-filters__label">Sort By</label>
          <select
            className="service-filters__select"
            value={filters.sortBy ? `${filters.sortBy}_${filters.sortOrder}` : ''}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('_');
              handleSortChange(sortBy, sortOrder);
            }}
          >
            <option value="">Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Rating: High to Low</option>
            <option value="rating_asc">Rating: Low to High</option>
            <option value="completion_time_asc">Completion Time: Fast to Slow</option>
            <option value="completion_time_desc">Completion Time: Slow to Fast</option>
          </select>
        </div>

        {/* Advanced Toggle */}
        <div className="service-filters__group">
          <button
            type="button"
            className={`service-filters__advanced-toggle ${showAdvanced ? 'active' : ''}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▲' : '▼'} Advanced
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="service-filters__group">
            <button
              type="button"
              className="service-filters__clear discord-button discord-button--secondary"
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="service-filters__advanced">
          <div className="service-filters__advanced-title">Price Range</div>
          
          <div className="service-filters__price-range">
            <div className="service-filters__price-inputs">
              <div className="service-filters__price-input-group">
                <label className="service-filters__price-label">Min</label>
                <input
                  type="number"
                  className="service-filters__price-input"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  min="0"
                  max={priceRange.max}
                />
              </div>
              
              <div className="service-filters__price-input-group">
                <label className="service-filters__price-label">Max</label>
                <input
                  type="number"
                  className="service-filters__price-input"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  min={priceRange.min}
                  max={getMaxPrice(priceRange.currency)}
                />
              </div>
              
              <div className="service-filters__price-input-group">
                <label className="service-filters__price-label">Currency</label>
                <select
                  className="service-filters__price-currency"
                  value={priceRange.currency}
                  onChange={(e) => setPriceRange(prev => ({ 
                    ...prev, 
                    currency: e.target.value as Currency,
                    max: getMaxPrice(e.target.value as Currency)
                  }))}
                >
                  <option value="usd">USD ($)</option>
                  <option value="gold">Gold (G)</option>
                  <option value="toman">Toman (﷼)</option>
                </select>
              </div>
            </div>
            
            <button
              type="button"
              className="service-filters__apply-price discord-button discord-button--primary"
              onClick={handlePriceRangeChange}
            >
              Apply Price Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};