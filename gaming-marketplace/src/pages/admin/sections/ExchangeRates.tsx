import React, { useState } from 'react';

interface ExchangeRate {
  id: string;
  fromCurrency: 'gold' | 'usd' | 'toman';
  toCurrency: 'gold' | 'usd' | 'toman';
  rate: number;
  lastUpdated: Date;
  updatedBy: string;
}

export const ExchangeRates: React.FC = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([
    {
      id: 'rate_1',
      fromCurrency: 'gold',
      toCurrency: 'usd',
      rate: 0.01, // 1 Gold = 0.01 USD
      lastUpdated: new Date('2024-01-20T10:00:00'),
      updatedBy: 'admin_user',
    },
    {
      id: 'rate_2',
      fromCurrency: 'usd',
      toCurrency: 'gold',
      rate: 100, // 1 USD = 100 Gold
      lastUpdated: new Date('2024-01-20T10:00:00'),
      updatedBy: 'admin_user',
    },
    {
      id: 'rate_3',
      fromCurrency: 'usd',
      toCurrency: 'toman',
      rate: 42000, // 1 USD = 42,000 Toman
      lastUpdated: new Date('2024-01-20T10:00:00'),
      updatedBy: 'admin_user',
    },
    {
      id: 'rate_4',
      fromCurrency: 'toman',
      toCurrency: 'usd',
      rate: 0.000024, // 1 Toman = 0.000024 USD
      lastUpdated: new Date('2024-01-20T10:00:00'),
      updatedBy: 'admin_user',
    },
    {
      id: 'rate_5',
      fromCurrency: 'gold',
      toCurrency: 'toman',
      rate: 420, // 1 Gold = 420 Toman
      lastUpdated: new Date('2024-01-20T10:00:00'),
      updatedBy: 'admin_user',
    },
    {
      id: 'rate_6',
      fromCurrency: 'toman',
      toCurrency: 'gold',
      rate: 0.0024, // 1 Toman = 0.0024 Gold
      lastUpdated: new Date('2024-01-20T10:00:00'),
      updatedBy: 'admin_user',
    },
  ]);

  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
  const [newRate, setNewRate] = useState('');

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'gold': return 'G';
      case 'usd': return '$';
      case 'toman': return '﷼';
      default: return currency;
    }
  };

  const getCurrencyName = (currency: string) => {
    switch (currency) {
      case 'gold': return 'Gold';
      case 'usd': return 'USD';
      case 'toman': return 'Toman';
      default: return currency;
    }
  };

  const handleEditRate = (rate: ExchangeRate) => {
    setEditingRate(rate);
    setNewRate(rate.rate.toString());
  };

  const handleSaveRate = () => {
    if (editingRate && newRate) {
      const updatedRate = parseFloat(newRate);
      if (updatedRate > 0) {
        setExchangeRates(prev => prev.map(rate => 
          rate.id === editingRate.id 
            ? { 
                ...rate, 
                rate: updatedRate, 
                lastUpdated: new Date(),
                updatedBy: 'admin_user'
              }
            : rate
        ));
        setEditingRate(null);
        setNewRate('');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingRate(null);
    setNewRate('');
  };

  const calculateConversion = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount;
    
    const rate = exchangeRates.find(r => 
      r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
    );
    
    return rate ? amount * rate.rate : 0;
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Exchange Rates</h2>
        <p className="admin-section__description">
          Manage currency exchange rates for Gold ↔ USD ↔ Toman conversions
        </p>
      </div>

      <div className="admin-section__content">
        {/* Current Rates Overview */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">Current Exchange Rates</h3>
            <p className="admin-card__subtitle">
              Last updated: {exchangeRates[0]?.lastUpdated.toLocaleString()}
            </p>
          </div>
          <div className="admin-card__content">
            <div className="rates-grid">
              <div className="rate-card">
                <div className="rate-card__header">
                  <span className="currency-icon">🪙</span>
                  <span className="rate-card__title">Gold to USD</span>
                </div>
                <div className="rate-card__value">
                  1G = ${exchangeRates.find(r => r.fromCurrency === 'gold' && r.toCurrency === 'usd')?.rate || 0}
                </div>
              </div>
              <div className="rate-card">
                <div className="rate-card__header">
                  <span className="currency-icon">💵</span>
                  <span className="rate-card__title">USD to Gold</span>
                </div>
                <div className="rate-card__value">
                  $1 = {exchangeRates.find(r => r.fromCurrency === 'usd' && r.toCurrency === 'gold')?.rate || 0}G
                </div>
              </div>
              <div className="rate-card">
                <div className="rate-card__header">
                  <span className="currency-icon">💵</span>
                  <span className="rate-card__title">USD to Toman</span>
                </div>
                <div className="rate-card__value">
                  $1 = ﷼{exchangeRates.find(r => r.fromCurrency === 'usd' && r.toCurrency === 'toman')?.rate?.toLocaleString() || 0}
                </div>
              </div>
              <div className="rate-card">
                <div className="rate-card__header">
                  <span className="currency-icon">🪙</span>
                  <span className="rate-card__title">Gold to Toman</span>
                </div>
                <div className="rate-card__value">
                  1G = ﷼{exchangeRates.find(r => r.fromCurrency === 'gold' && r.toCurrency === 'toman')?.rate?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Rate Management */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">Manage Exchange Rates</h3>
          </div>
          <div className="admin-card__content">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Rate</th>
                  <th>Last Updated</th>
                  <th>Updated By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exchangeRates.map((rate) => (
                  <tr key={rate.id}>
                    <td>
                      <div className="currency-info">
                        <span className="currency-symbol">{getCurrencySymbol(rate.fromCurrency)}</span>
                        <span className="currency-name">{getCurrencyName(rate.fromCurrency)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="currency-info">
                        <span className="currency-symbol">{getCurrencySymbol(rate.toCurrency)}</span>
                        <span className="currency-name">{getCurrencyName(rate.toCurrency)}</span>
                      </div>
                    </td>
                    <td>
                      {editingRate?.id === rate.id ? (
                        <input
                          type="number"
                          step="any"
                          className="rate-input"
                          value={newRate}
                          onChange={(e) => setNewRate(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <span className="rate-value">
                          {rate.rate < 1 ? rate.rate.toFixed(6) : rate.rate.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td>{rate.lastUpdated.toLocaleDateString()}</td>
                    <td>{rate.updatedBy}</td>
                    <td>
                      {editingRate?.id === rate.id ? (
                        <div className="action-buttons">
                          <button
                            className="action-button action-button--approve"
                            onClick={handleSaveRate}
                          >
                            Save
                          </button>
                          <button
                            className="action-button action-button--reject"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="action-button action-button--edit"
                          onClick={() => handleEditRate(rate)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conversion Calculator */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">Conversion Calculator</h3>
            <p className="admin-card__subtitle">
              Test currency conversions with current rates
            </p>
          </div>
          <div className="admin-card__content">
            <div className="calculator-grid">
              <div className="calculator-example">
                <h4>Sample Conversions</h4>
                <div className="conversion-examples">
                  <div className="conversion-item">
                    <span className="conversion-from">100G</span>
                    <span className="conversion-arrow">→</span>
                    <span className="conversion-to">${calculateConversion(100, 'gold', 'usd')}</span>
                  </div>
                  <div className="conversion-item">
                    <span className="conversion-from">$10</span>
                    <span className="conversion-arrow">→</span>
                    <span className="conversion-to">{calculateConversion(10, 'usd', 'gold').toLocaleString()}G</span>
                  </div>
                  <div className="conversion-item">
                    <span className="conversion-from">$50</span>
                    <span className="conversion-arrow">→</span>
                    <span className="conversion-to">﷼{calculateConversion(50, 'usd', 'toman').toLocaleString()}</span>
                  </div>
                  <div className="conversion-item">
                    <span className="conversion-from">1000G</span>
                    <span className="conversion-arrow">→</span>
                    <span className="conversion-to">﷼{calculateConversion(1000, 'gold', 'toman').toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rate History */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">Rate Change History</h3>
          </div>
          <div className="admin-card__content">
            <div className="history-note">
              <p>Rate change history would be tracked here in a production system. This would include:</p>
              <ul>
                <li>Previous rate values</li>
                <li>Change timestamps</li>
                <li>Admin who made the change</li>
                <li>Reason for rate adjustment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .rates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .rate-card {
          background: var(--discord-bg-tertiary);
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }

        .rate-card__header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .currency-icon {
          font-size: 20px;
        }

        .rate-card__title {
          font-size: 14px;
          color: var(--discord-text-secondary);
          font-weight: 500;
        }

        .rate-card__value {
          font-size: 18px;
          font-weight: 700;
          color: var(--discord-accent);
        }

        .currency-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .currency-symbol {
          font-size: 16px;
          font-weight: 700;
          color: var(--discord-accent);
        }

        .currency-name {
          font-size: 14px;
          color: var(--discord-text-primary);
        }

        .rate-input {
          padding: 4px 8px;
          background: var(--discord-bg-tertiary);
          border: 1px solid var(--discord-accent);
          border-radius: 4px;
          color: var(--discord-text-primary);
          font-size: 14px;
          width: 100px;
        }

        .rate-input:focus {
          outline: none;
          border-color: var(--discord-accent-hover);
        }

        .rate-value {
          font-weight: 600;
          color: var(--discord-text-primary);
        }

        .calculator-grid {
          display: grid;
          gap: 24px;
        }

        .calculator-example h4 {
          margin: 0 0 16px 0;
          color: var(--discord-text-primary);
          font-size: 16px;
        }

        .conversion-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .conversion-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: var(--discord-bg-tertiary);
          border-radius: 6px;
        }

        .conversion-from {
          font-weight: 600;
          color: var(--discord-text-primary);
        }

        .conversion-arrow {
          color: var(--discord-accent);
          font-weight: 700;
        }

        .conversion-to {
          font-weight: 600;
          color: var(--discord-success);
        }

        .history-note {
          color: var(--discord-text-secondary);
          font-size: 14px;
        }

        .history-note ul {
          margin: 12px 0 0 20px;
        }

        .history-note li {
          margin-bottom: 4px;
        }

        .admin-card__subtitle {
          font-size: 13px;
          color: var(--discord-text-muted);
          margin: 4px 0 0 0;
        }
      `}</style>
    </div>
  );
};