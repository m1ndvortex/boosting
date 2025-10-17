import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '../discord/Button';
import { Input } from '../discord/Input';
import './AdvancedFilters.css';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'range' | 'date' | 'boolean';
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface SortOption {
  key: string;
  label: string;
  direction?: 'asc' | 'desc';
}

export interface FilterValues {
  [key: string]: unknown;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  filters: FilterOption[];
  sortOptions: SortOption[];
  onFiltersChange: (filters: FilterValues) => void;
  onSortChange: (sort: SortConfig) => void;
  onReset: () => void;
  initialFilters?: FilterValues;
  initialSort?: SortConfig;
  showSearch?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  sortOptions,
  onFiltersChange,
  onSortChange,
  onReset,
  initialFilters = {},
  initialSort,
  showSearch = true,
  searchPlaceholder = 'Search...',
  className = ''
}) => {
  const [filterValues, setFilterValues] = useState<FilterValues>(initialFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    initialSort || { key: sortOptions[0]?.key || '', direction: 'asc' }
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFiltersChange(newFilters);
  }, [filterValues, onFiltersChange]);

  const handleSortChange = useCallback((key: string, direction: 'asc' | 'desc') => {
    const newSort = { key, direction };
    setSortConfig(newSort);
    onSortChange(newSort);
  }, [onSortChange]);

  const handleReset = useCallback(() => {
    setFilterValues({});
    setSortConfig({ key: sortOptions[0]?.key || '', direction: 'asc' });
    setSearchQuery('');
    onReset();
  }, [onReset, sortOptions]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    handleFilterChange('search', value);
  }, [handleFilterChange]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filterValues).filter(value => 
      value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  }, [filterValues]);

  const renderFilterInput = (filter: FilterOption) => {
    const value = filterValues[filter.key];

    switch (filter.type) {
      case 'text':
        return (
          <Input
            type="text"
            placeholder={filter.placeholder}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        );

      case 'select':
        return (
          <select
            className="advanced-filters__select"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          >
            <option value="">All</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="advanced-filters__multiselect">
            {filter.options?.map(option => (
              <label key={option.value} className="advanced-filters__checkbox">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleFilterChange(filter.key, newValues);
                  }}
                />
                <span className="advanced-filters__checkbox-label">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        );

      case 'range': {
        const rangeValue = (value && typeof value === 'object' && value !== null) 
          ? value as { min?: number; max?: number }
          : { min: filter.min, max: filter.max };
        return (
          <div className="advanced-filters__range">
            <Input
              type="number"
              placeholder="Min"
              value={rangeValue.min?.toString() || ''}
              min={filter.min}
              max={filter.max}
              onChange={(e) => handleFilterChange(filter.key, {
                ...rangeValue,
                min: e.target.value ? Number(e.target.value) : undefined
              })}
            />
            <span className="advanced-filters__range-separator">to</span>
            <Input
              type="number"
              placeholder="Max"
              value={rangeValue.max?.toString() || ''}
              min={filter.min}
              max={filter.max}
              onChange={(e) => handleFilterChange(filter.key, {
                ...rangeValue,
                max: e.target.value ? Number(e.target.value) : undefined
              })}
            />
          </div>
        );
      }

      case 'date':
        return (
          <Input
            type="date"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        );

      case 'boolean':
        return (
          <label className="advanced-filters__toggle">
            <input
              type="checkbox"
              checked={typeof value === 'boolean' ? value : false}
              onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
            />
            <span className="advanced-filters__toggle-slider"></span>
          </label>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`advanced-filters ${className}`}>
      <div className="advanced-filters__header">
        {showSearch && (
          <div className="advanced-filters__search">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="advanced-filters__search-input"
            />
          </div>
        )}

        <div className="advanced-filters__sort">
          <select
            className="advanced-filters__sort-select"
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onChange={(e) => {
              const [key, direction] = e.target.value.split('-');
              handleSortChange(key, direction as 'asc' | 'desc');
            }}
          >
            {sortOptions.map(option => (
              <React.Fragment key={option.key}>
                <option value={`${option.key}-asc`}>
                  {option.label} (A-Z)
                </option>
                <option value={`${option.key}-desc`}>
                  {option.label} (Z-A)
                </option>
              </React.Fragment>
            ))}
          </select>
        </div>

        <div className="advanced-filters__controls">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="advanced-filters__toggle"
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            <span className={`advanced-filters__toggle-icon ${isExpanded ? 'expanded' : ''}`}>
              ▼
            </span>
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="advanced-filters__panel">
          <div className="advanced-filters__grid">
            {filters.map(filter => (
              <div key={filter.key} className="advanced-filters__field">
                <label className="advanced-filters__label">
                  {filter.label}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          <div className="advanced-filters__panel-actions">
            <Button variant="secondary" size="sm" onClick={handleReset}>
              Reset All
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setIsExpanded(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};