import React from 'react';
import './ViewToggle.css';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="view-toggle">
      <button
        type="button"
        className={`view-toggle__button ${viewMode === 'grid' ? 'active' : ''}`}
        onClick={() => onViewModeChange('grid')}
        aria-label="Grid view"
        title="Grid view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
      
      <button
        type="button"
        className={`view-toggle__button ${viewMode === 'list' ? 'active' : ''}`}
        onClick={() => onViewModeChange('list')}
        aria-label="List view"
        title="List view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="2" width="14" height="2" rx="1" />
          <rect x="1" y="6" width="14" height="2" rx="1" />
          <rect x="1" y="10" width="14" height="2" rx="1" />
          <rect x="1" y="14" width="14" height="2" rx="1" />
        </svg>
      </button>
    </div>
  );
};