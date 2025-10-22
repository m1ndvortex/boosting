import React from 'react';
import type { ServiceListing } from '../../services/marketplaceService';
import './ServiceCard.css';

interface ServiceCardProps {
  service: ServiceListing;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  viewMode,
  onClick
}) => {
  const formatPrice = (price: number, currency: 'gold' | 'usd' | 'toman') => {
    switch (currency) {
      case 'gold':
        return `${price.toLocaleString()}G`;
      case 'usd':
        return `$${price}`;
      case 'toman':
        return `﷼${price.toLocaleString()}`;
      default:
        return `${price}`;
    }
  };

  const formatRating = (rating: number) => {
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    return `${stars} ${rating.toFixed(1)}`;
  };

  return (
    <div 
      className={`service-card service-card--${viewMode}`}
      onClick={onClick}
    >
      {/* Service Header */}
      <div className="service-card__header">
        <div className="service-card__game-info">
          <span className="service-card__game-icon">{service.game.icon}</span>
          <div className="service-card__game-details">
            <span className="service-card__game-name">{service.game.name}</span>
            <span className="service-card__service-type">{service.serviceType.name}</span>
          </div>
        </div>
        
        {viewMode === 'list' && (
          <div className="service-card__quick-info">
            <div className="service-card__rating">
              {formatRating(service.rating)}
            </div>
            <div className="service-card__completion-time">
              ⏱️ {service.completionTime}
            </div>
          </div>
        )}
      </div>

      {/* Service Content */}
      <div className="service-card__content">
        <h3 className="service-card__title">{service.title}</h3>
        <p className="service-card__description">
          {viewMode === 'grid' 
            ? service.description.length > 120 
              ? `${service.description.substring(0, 120)}...`
              : service.description
            : service.description.length > 200
              ? `${service.description.substring(0, 200)}...`
              : service.description
          }
        </p>
      </div>

      {/* Service Footer */}
      <div className="service-card__footer">
        <div className="service-card__provider">
          <div className="service-card__provider-avatar">
            {service.advertiser.avatar ? (
              <img 
                src={service.advertiser.avatar} 
                alt={service.advertiser.username}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="service-card__provider-avatar-placeholder">
                {service.advertiser.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="service-card__provider-info">
            <span className="service-card__provider-name">
              {service.advertiser.username}#{service.advertiser.discriminator}
            </span>
            <span className="service-card__provider-stats">
              {service.completedOrders} completed orders
            </span>
          </div>
        </div>

        {viewMode === 'grid' && (
          <div className="service-card__meta">
            <div className="service-card__rating">
              {formatRating(service.rating)}
            </div>
            <div className="service-card__completion-time">
              ⏱️ {service.completionTime}
            </div>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="service-card__pricing">
        <div className="service-card__prices">
          <div className="service-card__price service-card__price--primary">
            {formatPrice(service.prices.usd, 'usd')}
          </div>
          <div className="service-card__price service-card__price--secondary">
            {formatPrice(service.prices.gold, 'gold')}
          </div>
          <div className="service-card__price service-card__price--secondary">
            {formatPrice(service.prices.toman, 'toman')}
          </div>
        </div>
        
        <button className="service-card__buy-button discord-button discord-button--primary">
          View Details
        </button>
      </div>

      {/* Workspace indicator */}
      {service.workspaceType === 'team' && (
        <div className="service-card__workspace-badge">
          👥 Team Service
        </div>
      )}
    </div>
  );
};