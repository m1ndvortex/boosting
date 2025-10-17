import React, { useState, useEffect } from 'react';
import { ServiceService } from '../../services/serviceService';
import type { Game, ServiceType, Service } from '../../types';
import './ServiceForm.css';

interface ServiceFormProps {
  games: Game[];
  initialData?: Service;
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
  isAdmin: boolean;
}

interface ServiceFormData {
  gameId: string;
  serviceTypeId: string;
  title: string;
  description: string;
  prices: {
    gold: number;
    usd: number;
    toman: number;
  };
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  games,
  initialData,
  onSubmit,
  onCancel,
  isAdmin
}) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    gameId: initialData?.gameId || '',
    serviceTypeId: initialData?.serviceTypeId || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    prices: {
      gold: initialData?.prices.gold || 0,
      usd: initialData?.prices.usd || 0,
      toman: initialData?.prices.toman || 0
    }
  });
  
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load service types when game changes
  useEffect(() => {
    const loadServiceTypes = async () => {
      if (!formData.gameId) {
        setServiceTypes([]);
        return;
      }

      try {
        const types = await ServiceService.getServiceTypes(formData.gameId);
        // Filter out Raid service type for non-admin users
        const filteredTypes = isAdmin ? types : types.filter(t => !t.requiresAdmin);
        setServiceTypes(filteredTypes);
        
        // Reset service type if current selection is not available
        if (formData.serviceTypeId && !filteredTypes.find(t => t.id === formData.serviceTypeId)) {
          setFormData(prev => ({ ...prev, serviceTypeId: '' }));
        }
      } catch (error) {
        console.error('Error loading service types:', error);
        setServiceTypes([]);
      }
    };

    loadServiceTypes();
  }, [formData.gameId, isAdmin]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.gameId) {
      newErrors.gameId = 'Please select a game';
    }

    if (!formData.serviceTypeId) {
      newErrors.serviceTypeId = 'Please select a service type';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a service title';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a service description';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.prices.gold <= 0) {
      newErrors.goldPrice = 'Gold price must be greater than 0';
    }

    if (formData.prices.usd <= 0) {
      newErrors.usdPrice = 'USD price must be greater than 0';
    }

    if (formData.prices.toman <= 0) {
      newErrors.tomanPrice = 'Toman price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePriceChange = (currency: keyof ServiceFormData['prices'], value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      prices: {
        ...prev.prices,
        [currency]: numValue
      }
    }));
    
    // Clear error when user starts typing
    const errorKey = `${currency}Price`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  return (
    <form className="service-form" onSubmit={handleSubmit}>
      <div className="service-form__content">
        <div className="service-form__row">
          <div className="service-form__field">
            <label className="service-form__label">
              Game *
            </label>
            <select
              className={`service-form__select ${errors.gameId ? 'service-form__select--error' : ''}`}
              value={formData.gameId}
              onChange={(e) => handleInputChange('gameId', e.target.value)}
            >
              <option value="">Select a game</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.icon} {game.name}
                </option>
              ))}
            </select>
            {errors.gameId && (
              <span className="service-form__error">{errors.gameId}</span>
            )}
          </div>

          <div className="service-form__field">
            <label className="service-form__label">
              Service Type *
            </label>
            <select
              className={`service-form__select ${errors.serviceTypeId ? 'service-form__select--error' : ''}`}
              value={formData.serviceTypeId}
              onChange={(e) => handleInputChange('serviceTypeId', e.target.value)}
              disabled={!formData.gameId}
            >
              <option value="">Select a service type</option>
              {serviceTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                  {type.requiresAdmin && !isAdmin && ' (Admin Only)'}
                </option>
              ))}
            </select>
            {errors.serviceTypeId && (
              <span className="service-form__error">{errors.serviceTypeId}</span>
            )}
            {!isAdmin && (
              <span className="service-form__help">
                Note: Raid services are only available to admin users
              </span>
            )}
          </div>
        </div>

        <div className="service-form__field">
          <label className="service-form__label">
            Service Title *
          </label>
          <input
            type="text"
            className={`service-form__input ${errors.title ? 'service-form__input--error' : ''}`}
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Mythic+15 Weekly Chest"
            maxLength={100}
          />
          {errors.title && (
            <span className="service-form__error">{errors.title}</span>
          )}
          <span className="service-form__help">
            {formData.title.length}/100 characters
          </span>
        </div>

        <div className="service-form__field">
          <label className="service-form__label">
            Description *
          </label>
          <textarea
            className={`service-form__textarea ${errors.description ? 'service-form__textarea--error' : ''}`}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your service in detail..."
            rows={4}
            maxLength={500}
          />
          {errors.description && (
            <span className="service-form__error">{errors.description}</span>
          )}
          <span className="service-form__help">
            {formData.description.length}/500 characters
          </span>
        </div>

        <div className="service-form__prices">
          <h3 className="service-form__prices-title">Pricing *</h3>
          <div className="service-form__prices-grid">
            <div className="service-form__field">
              <label className="service-form__label">
                Gold (G)
              </label>
              <input
                type="number"
                className={`service-form__input ${errors.goldPrice ? 'service-form__input--error' : ''}`}
                value={formData.prices.gold || ''}
                onChange={(e) => handlePriceChange('gold', e.target.value)}
                placeholder="50000"
                min="1"
                step="1000"
              />
              {errors.goldPrice && (
                <span className="service-form__error">{errors.goldPrice}</span>
              )}
            </div>

            <div className="service-form__field">
              <label className="service-form__label">
                USD ($)
              </label>
              <input
                type="number"
                className={`service-form__input ${errors.usdPrice ? 'service-form__input--error' : ''}`}
                value={formData.prices.usd || ''}
                onChange={(e) => handlePriceChange('usd', e.target.value)}
                placeholder="25"
                min="0.01"
                step="0.01"
              />
              {errors.usdPrice && (
                <span className="service-form__error">{errors.usdPrice}</span>
              )}
            </div>

            <div className="service-form__field">
              <label className="service-form__label">
                Toman (﷼)
              </label>
              <input
                type="number"
                className={`service-form__input ${errors.tomanPrice ? 'service-form__input--error' : ''}`}
                value={formData.prices.toman || ''}
                onChange={(e) => handlePriceChange('toman', e.target.value)}
                placeholder="1000000"
                min="1"
                step="10000"
              />
              {errors.tomanPrice && (
                <span className="service-form__error">{errors.tomanPrice}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="service-form__actions">
        <button
          type="button"
          className="service-form__btn service-form__btn--secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="service-form__btn service-form__btn--primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : (initialData ? 'Update Service' : 'Create Service')}
        </button>
      </div>
    </form>
  );
};