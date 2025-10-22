import React, { useState } from 'react';
import './AdvancedFilters.css';

export interface FilterOption {
  id: string;
  label: string;
  value: any;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'search';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface SortOption {
  id: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  [key: string]: any;
}

interface AdvancedFiltersProps {
  filterGroups: FilterGroup[];
  sortOptions: SortOption[];
  currentFilters: FilterState;
  currentSort: string;
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sortId: string) => void;
  onReset: () => void;
  showCount?: boolean;
  totalCount?: number;
  filteredCount?: number;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filterGroups,
  sortOptions,
  currentFilters,
  currentSort,
  onFiltersChange,
  onSortChange,
  onReset,
  showCount = false,
  totalCount = 0,
  filteredCount = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (groupId: string, value: any) => {
    const newFilters = { ...currentFilters, [groupId]: value };
    onFiltersChange(newFilters);
  };

  const handleRangeChange = (groupId: string, type: 'min' | 'max', value: number) => {
    const currentRange = currentFilters[groupId] || {};
    const newRange = { ...currentRange, [type]: value };
    handleFilterChange(groupId, newRange);
  };

  const getActiveFilterCount = () => {
    return Object.values(currentFilters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== undefined && v !== '');
      }
      return value !== undefined && value !== '' && value !== null;
    }).length;
  };

  const renderFilterGroup = (group: FilterGroup) => {
    const currentValue = currentFilters[group.id];

    switch (group.type) {
      case 'select':
        return (
          <select
            className="advanced-filters__select"
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(group.id, e.target.value || undefined)}
          >
            <option value="">All {group.label}</option>
            {group.options?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label} {option.count !== undefined && `(${option.count})`}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="advanced-filters__multiselect">
            {group.options?.map((option) => (
              <label key={option.id} className="advanced-filters__checkbox">
                <input
                  type="checkbox"
                  checked={currentValue?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentArray = currentValue || [];
                    const newArray = e.target.checked
                      ? [...currentArray, option.value]
                      : currentArray.filter((v: any) => v !== option.value);
                    handleFilterChange(group.id, newArray.length > 0 ? newArray : undefined);
                  }}
                />
                <span className="advanced-filters__checkbox-label">
                  {option.label} {option.count !== undefined && `(${option.count})`}
                </span>
              </label>
            ))}
          </div>
        );

      case 'range':
        const rangeValue = currentValue || {};
        return (
          <div className="advanced-filters__range">
            <div className="advanced-filters__range-inputs">
              <input
                type="number"
                placeholder={`Min ${group.label}`}
                value={rangeValue.min || ''}
                min={group.min}
                max={group.max}
                step={group.step}
                onChange={(e) => handleRangeChange(group.id, 'min', parseFloat(e.target.value) || undefined)}
                className="advanced-filters__range-input"
              />
              <span className="advanced-filters__range-separator">to</span>
              <input
                type="number"
                placeholder={`Max ${group.label}`}
                value={rangeValue.max || ''}
                min={group.min}
                max={group.max}
                step={group.step}
                onChange={(e) => handleRangeChange(group.id, 'max', parseFloat(e.target.value) || undefined)}
                className="advanced-filters__range-input"
              />
            </div>
          </div>
        );

      case 'date':
        const dateValue = currentValue || {};
        return (
          <div className="advanced-filters__date-range">
            <input
              type="date"
              value={dateValue.from || ''}
              onChange={(e) => handleRangeChange(group.id, 'from', e.target.value || undefined)}
              className="advanced-filters__date-input"
            />
            <span className="advanced-filters__date-separator">to</span>
            <input
              type="date"
              value={dateValue.to || ''}
              onChange={(e) => handleRangeChange(group.id, 'to', e.target.value || undefined)}
              className="advanced-filters__date-input"
            />
          </div>
        );

      case 'search':
        return (
          <input
            type="text"
            placeholder={group.placeholder || `Search ${group.label}...`}
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(group.id, e.target.value || undefined)}
            className="advanced-filters__search"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="advanced-filters">
      <div className="advanced-filters__header">
        <div className="advanced-filters__main-controls">
          <div className="advanced-filters__search-sort">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="advanced-filters__main-search"
            />
            <select
              className="advanced-filters__sort"
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="advanced-filters__actions">
            <button
              className={`advanced-filters__toggle ${isExpanded ? 'advanced-filters__toggle--active' : ''}`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="advanced-filters__toggle-icon">🔍</span>
              Filters
              {getActiveFilterCount() > 0 && (
                <span className="advanced-filters__badge">{getActiveFilterCount()}</span>
              )}
            </button>
            
            {getActiveFilterCount() > 0 && (
              <button
                className="advanced-filters__reset"
                onClick={onReset}
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {showCount && (
          <div className="advanced-filters__count">
            Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} results
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="advanced-filters__panel">
          <div className="advanced-filters__groups">
            {filterGroups.map((group) => (
              <div key={group.id} className="advanced-filters__group">
                <label className="advanced-filters__group-label">
                  {group.label}
                </label>
                <div className="advanced-filters__group-content">
                  {renderFilterGroup(group)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};