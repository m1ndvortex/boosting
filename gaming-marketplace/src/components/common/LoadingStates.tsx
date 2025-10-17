import React from 'react';
import { Spinner } from '../discord/Spinner';
import './LoadingStates.css';

// Generic loading spinner
export const LoadingSpinner: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
}> = ({ size = 'md', message }) => (
  <div className="loading-spinner">
    <Spinner size={size} />
    {message && <p className="loading-spinner__message">{message}</p>}
  </div>
);

// Full page loading
export const PageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="page-loading">
    <Spinner size="lg" />
    <p className="page-loading__message">{message}</p>
  </div>
);

// Skeleton components for different content types
export const SkeletonText: React.FC<{
  lines?: number;
  width?: string;
  className?: string;
}> = ({ lines = 1, width = '100%', className = '' }) => (
  <div className={`skeleton-text ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <div
        key={i}
        className="skeleton-text__line"
        style={{ 
          width: i === lines - 1 && lines > 1 ? '70%' : width 
        }}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{
  showImage?: boolean;
  showActions?: boolean;
  className?: string;
}> = ({ showImage = true, showActions = true, className = '' }) => (
  <div className={`skeleton-card ${className}`}>
    {showImage && <div className="skeleton-card__image" />}
    <div className="skeleton-card__content">
      <SkeletonText lines={1} width="80%" />
      <SkeletonText lines={2} />
      {showActions && (
        <div className="skeleton-card__actions">
          <div className="skeleton-card__button" />
          <div className="skeleton-card__button" />
        </div>
      )}
    </div>
  </div>
);

export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}> = ({ rows = 5, columns = 4, showHeader = true }) => (
  <div className="skeleton-table">
    {showHeader && (
      <div className="skeleton-table__header">
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} className="skeleton-table__header-cell" />
        ))}
      </div>
    )}
    <div className="skeleton-table__body">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table__row">
          {Array.from({ length: columns }, (_, colIndex) => (
            <div key={colIndex} className="skeleton-table__cell" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList: React.FC<{
  items?: number;
  showAvatar?: boolean;
}> = ({ items = 5, showAvatar = true }) => (
  <div className="skeleton-list">
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="skeleton-list__item">
        {showAvatar && <div className="skeleton-list__avatar" />}
        <div className="skeleton-list__content">
          <SkeletonText lines={1} width="60%" />
          <SkeletonText lines={1} width="40%" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="skeleton-dashboard">
    <div className="skeleton-dashboard__header">
      <SkeletonText lines={1} width="200px" />
      <div className="skeleton-dashboard__actions">
        <div className="skeleton-dashboard__button" />
        <div className="skeleton-dashboard__button" />
      </div>
    </div>
    
    <div className="skeleton-dashboard__stats">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skeleton-dashboard__stat">
          <div className="skeleton-dashboard__stat-icon" />
          <div className="skeleton-dashboard__stat-content">
            <SkeletonText lines={1} width="80px" />
            <SkeletonText lines={1} width="120px" />
          </div>
        </div>
      ))}
    </div>
    
    <div className="skeleton-dashboard__content">
      <SkeletonCard />
      <SkeletonTable rows={8} />
    </div>
  </div>
);

// Loading overlay for existing content
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}> = ({ isLoading, message, children }) => (
  <div className="loading-overlay-container">
    {children}
    {isLoading && (
      <div className="loading-overlay">
        <div className="loading-overlay__content">
          <Spinner size="lg" />
          {message && <p className="loading-overlay__message">{message}</p>}
        </div>
      </div>
    )}
  </div>
);

// Button loading state
export const ButtonLoading: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}> = ({ isLoading, children, loadingText }) => (
  <>
    {isLoading ? (
      <span className="button-loading">
        <Spinner size="xs" />
        {loadingText || 'Loading...'}
      </span>
    ) : (
      children
    )}
  </>
);