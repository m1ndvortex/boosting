import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MarketplaceService } from '../../services/marketplaceService';
import type { ServiceListing } from '../../services/marketplaceService';
import { PurchaseModal } from './PurchaseModal';
import { useAuth } from '../../contexts/AuthContext';
import './ServiceDetails.css';

export const ServiceDetails: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [service, setService] = useState<ServiceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    if (serviceId) {
      loadServiceDetails();
    }
  }, [serviceId]);

  const loadServiceDetails = async () => {
    if (!serviceId) return;

    try {
      setLoading(true);
      setError(null);
      const serviceDetails = await MarketplaceService.getServiceDetails(serviceId);
      
      if (!serviceDetails) {
        setError('Service not found');
        return;
      }
      
      setService(serviceDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseClick = () => {
    if (!authState.user) {
      navigate('/login');
      return;
    }
    setShowPurchaseModal(true);
  };

  const handlePurchaseComplete = () => {
    setShowPurchaseModal(false);
    navigate('/marketplace/orders');
  };

  const handleBackClick = () => {
    navigate('/marketplace');
  };

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

  if (loading) {
    return (
      <div className="service-details">
        <div className="service-details__loading">
          <div className="service-details__loading-spinner" />
          <p>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="service-details">
        <div className="service-details__error">
          <h2>Service Not Found</h2>
          <p>{error || 'The requested service could not be found.'}</p>
          <button 
            className="discord-button discord-button--primary"
            onClick={handleBackClick}
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="service-details">
      {/* Header */}
      <div className="service-details__header">
        <button 
          className="service-details__back-button discord-button discord-button--secondary"
          onClick={handleBackClick}
        >
          ← Back to Marketplace
        </button>
        
        <div className="service-details__breadcrumb">
          <span className="service-details__breadcrumb-item">Marketplace</span>
          <span className="service-details__breadcrumb-separator">›</span>
          <span className="service-details__breadcrumb-item">{service.game.name}</span>
          <span className="service-details__breadcrumb-separator">›</span>
          <span className="service-details__breadcrumb-item current">{service.serviceType.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="service-details__content">
        {/* Left Column - Service Info */}
        <div className="service-details__main">
          {/* Service Header */}
          <div className="service-details__service-header">
            <div className="service-details__game-info">
              <span className="service-details__game-icon">{service.game.icon}</span>
              <div className="service-details__game-details">
                <h1 className="service-details__title">{service.title}</h1>
                <div className="service-details__meta">
                  <span className="service-details__game-name">{service.game.name}</span>
                  <span className="service-details__separator">•</span>
                  <span className="service-details__service-type">{service.serviceType.name}</span>
                  {service.workspaceType === 'team' && (
                    <>
                      <span className="service-details__separator">•</span>
                      <span className="service-details__team-badge">👥 Team Service</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Service Description */}
          <div className="service-details__description">
            <h2>Description</h2>
            <p>{service.description}</p>
          </div>

          {/* Service Type Info */}
          <div className="service-details__service-type-info">
            <h2>About {service.serviceType.name}</h2>
            <p>{service.serviceType.description}</p>
          </div>

          {/* Provider Info */}
          <div className="service-details__provider">
            <h2>Service Provider</h2>
            <div className="service-details__provider-card">
              <div className="service-details__provider-avatar">
                {service.advertiser.avatar ? (
                  <img 
                    src={service.advertiser.avatar} 
                    alt={service.advertiser.username}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="service-details__provider-avatar-placeholder">
                    {service.advertiser.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="service-details__provider-info">
                <div className="service-details__provider-name">
                  {service.advertiser.username}#{service.advertiser.discriminator}
                </div>
                <div className="service-details__provider-stats">
                  <div className="service-details__provider-stat">
                    <span className="service-details__provider-stat-label">Rating:</span>
                    <span className="service-details__provider-stat-value">
                      {formatRating(service.rating)}
                    </span>
                  </div>
                  <div className="service-details__provider-stat">
                    <span className="service-details__provider-stat-label">Completed Orders:</span>
                    <span className="service-details__provider-stat-value">
                      {service.completedOrders}
                    </span>
                  </div>
                  <div className="service-details__provider-stat">
                    <span className="service-details__provider-stat-label">Avg. Completion Time:</span>
                    <span className="service-details__provider-stat-value">
                      {service.completionTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Purchase Info */}
        <div className="service-details__sidebar">
          <div className="service-details__purchase-card">
            <h3 className="service-details__purchase-title">Purchase Service</h3>
            
            <div className="service-details__pricing">
              <div className="service-details__price-item service-details__price-item--primary">
                <span className="service-details__price-label">USD</span>
                <span className="service-details__price-value">
                  {formatPrice(service.prices.usd, 'usd')}
                </span>
              </div>
              <div className="service-details__price-item">
                <span className="service-details__price-label">Gold</span>
                <span className="service-details__price-value">
                  {formatPrice(service.prices.gold, 'gold')}
                </span>
              </div>
              <div className="service-details__price-item">
                <span className="service-details__price-label">Toman</span>
                <span className="service-details__price-value">
                  {formatPrice(service.prices.toman, 'toman')}
                </span>
              </div>
            </div>

            <div className="service-details__completion-info">
              <div className="service-details__completion-item">
                <span className="service-details__completion-icon">⏱️</span>
                <span className="service-details__completion-text">
                  Estimated completion: {service.completionTime}
                </span>
              </div>
              <div className="service-details__completion-item">
                <span className="service-details__completion-icon">✅</span>
                <span className="service-details__completion-text">
                  {service.completedOrders} successful completions
                </span>
              </div>
            </div>

            <button 
              className="service-details__purchase-button discord-button discord-button--primary"
              onClick={handlePurchaseClick}
            >
              Purchase Service
            </button>

            <div className="service-details__purchase-note">
              <p>
                💡 Payment will be held in escrow until service completion.
                You can track progress and communicate with your booster.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && service && (
        <PurchaseModal
          service={service}
          onClose={() => setShowPurchaseModal(false)}
          onPurchaseComplete={handlePurchaseComplete}
        />
      )}
    </div>
  );
};