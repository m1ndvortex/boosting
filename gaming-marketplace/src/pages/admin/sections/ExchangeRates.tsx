import React, { useState, useEffect } from 'react';
import type { GameRealm, ConversionFeeConfig } from '../../../types';
import { GameManagementService } from '../../../services/gameManagementService';
import { ConversionFeeService } from '../../../services/conversionFeeService';

interface RealmExchangeRate {
  id: string;
  realmId: string;
  realmName: string;
  gameName: string;
  goldToUsd: number;
  goldToToman: number;
  lastUpdated: Date;
  updatedBy: string;
}

interface FiatExchangeRate {
  id: string;
  fromCurrency: 'usd' | 'toman';
  toCurrency: 'usd' | 'toman';
  rate: number;
  lastUpdated: Date;
  updatedBy: string;
}

export const ExchangeRates: React.FC = () => {
  const [realms, setRealms] = useState<GameRealm[]>([]);
  const [realmRates, setRealmRates] = useState<RealmExchangeRate[]>([]);
  const [fiatRates, setFiatRates] = useState<FiatExchangeRate[]>([]);
  const [conversionFees, setConversionFees] = useState<ConversionFeeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [editingRealmRate, setEditingRealmRate] = useState<RealmExchangeRate | null>(null);
  const [editingFiatRate, setEditingFiatRate] = useState<FiatExchangeRate | null>(null);
  const [editingFees, setEditingFees] = useState(false);
  
  const [newGoldToUsd, setNewGoldToUsd] = useState('');
  const [newGoldToToman, setNewGoldToToman] = useState('');
  const [newFiatRate, setNewFiatRate] = useState('');
  const [newUsdFee, setNewUsdFee] = useState('');
  const [newTomanFee, setNewTomanFee] = useState('');

  const [activeTab, setActiveTab] = useState<'realm-rates' | 'fiat-rates' | 'conversion-fees'>('realm-rates');

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      // Initialize services
      GameManagementService.initialize();
      
      // Load realms
      const activeRealms = GameManagementService.getAllActiveRealms();
      setRealms(activeRealms);
      
      // Initialize realm exchange rates
      const existingRealmRates = loadRealmRates();
      const initializedRealmRates = initializeRealmRates(activeRealms, existingRealmRates);
      setRealmRates(initializedRealmRates);
      saveRealmRates(initializedRealmRates);
      
      // Initialize fiat exchange rates
      const existingFiatRates = loadFiatRates();
      const initializedFiatRates = initializeFiatRates(existingFiatRates);
      setFiatRates(initializedFiatRates);
      saveFiatRates(initializedFiatRates);
      
      // Load conversion fees
      const fees = ConversionFeeService.getConversionFeeConfig();
      setConversionFees(fees);
      
    } catch (error) {
      console.error('Failed to initialize exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealmRates = (): RealmExchangeRate[] => {
    try {
      const stored = localStorage.getItem('realm_exchange_rates');
      return stored ? JSON.parse(stored).map((rate: any) => ({
        ...rate,
        lastUpdated: new Date(rate.lastUpdated)
      })) : [];
    } catch {
      return [];
    }
  };

  const saveRealmRates = (rates: RealmExchangeRate[]) => {
    localStorage.setItem('realm_exchange_rates', JSON.stringify(rates));
  };

  const loadFiatRates = (): FiatExchangeRate[] => {
    try {
      const stored = localStorage.getItem('fiat_exchange_rates');
      return stored ? JSON.parse(stored).map((rate: any) => ({
        ...rate,
        lastUpdated: new Date(rate.lastUpdated)
      })) : [];
    } catch {
      return [];
    }
  };

  const saveFiatRates = (rates: FiatExchangeRate[]) => {
    localStorage.setItem('fiat_exchange_rates', JSON.stringify(rates));
  };

  const initializeRealmRates = (realms: GameRealm[], existingRates: RealmExchangeRate[]): RealmExchangeRate[] => {
    const rates: RealmExchangeRate[] = [];
    
    realms.forEach(realm => {
      const existingRate = existingRates.find(rate => rate.realmId === realm.id);
      if (existingRate) {
        rates.push(existingRate);
      } else {
        // Create default rates for new realms
        rates.push({
          id: `realm_rate_${realm.id}`,
          realmId: realm.id,
          realmName: realm.realmName,
          gameName: realm.gameName,
          goldToUsd: 0.01, // 1 Gold = 0.01 USD
          goldToToman: 420, // 1 Gold = 420 Toman
          lastUpdated: new Date(),
          updatedBy: 'system'
        });
      }
    });
    
    return rates;
  };

  const initializeFiatRates = (existingRates: FiatExchangeRate[]): FiatExchangeRate[] => {
    const defaultRates: FiatExchangeRate[] = [
      {
        id: 'fiat_usd_to_toman',
        fromCurrency: 'usd',
        toCurrency: 'toman',
        rate: 42000, // 1 USD = 42,000 Toman
        lastUpdated: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'fiat_toman_to_usd',
        fromCurrency: 'toman',
        toCurrency: 'usd',
        rate: 0.000024, // 1 Toman = 0.000024 USD
        lastUpdated: new Date(),
        updatedBy: 'system'
      }
    ];

    if (existingRates.length === 0) {
      return defaultRates;
    }

    // Merge existing with defaults for any missing rates
    const rates = [...existingRates];
    defaultRates.forEach(defaultRate => {
      if (!rates.find(rate => rate.id === defaultRate.id)) {
        rates.push(defaultRate);
      }
    });

    return rates;
  };

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

  // Realm rate editing handlers
  const handleEditRealmRate = (rate: RealmExchangeRate) => {
    setEditingRealmRate(rate);
    setNewGoldToUsd(rate.goldToUsd.toString());
    setNewGoldToToman(rate.goldToToman.toString());
  };

  const handleSaveRealmRate = () => {
    if (editingRealmRate && newGoldToUsd && newGoldToToman) {
      const updatedUsdRate = parseFloat(newGoldToUsd);
      const updatedTomanRate = parseFloat(newGoldToToman);
      
      if (updatedUsdRate > 0 && updatedTomanRate > 0) {
        const updatedRates = realmRates.map(rate => 
          rate.id === editingRealmRate.id 
            ? { 
                ...rate, 
                goldToUsd: updatedUsdRate,
                goldToToman: updatedTomanRate,
                lastUpdated: new Date(),
                updatedBy: 'admin_user'
              }
            : rate
        );
        setRealmRates(updatedRates);
        saveRealmRates(updatedRates);
        setEditingRealmRate(null);
        setNewGoldToUsd('');
        setNewGoldToToman('');
      }
    }
  };

  const handleCancelRealmEdit = () => {
    setEditingRealmRate(null);
    setNewGoldToUsd('');
    setNewGoldToToman('');
  };

  // Fiat rate editing handlers
  const handleEditFiatRate = (rate: FiatExchangeRate) => {
    setEditingFiatRate(rate);
    setNewFiatRate(rate.rate.toString());
  };

  const handleSaveFiatRate = () => {
    if (editingFiatRate && newFiatRate) {
      const updatedRate = parseFloat(newFiatRate);
      if (updatedRate > 0) {
        const updatedRates = fiatRates.map(rate => 
          rate.id === editingFiatRate.id 
            ? { 
                ...rate, 
                rate: updatedRate, 
                lastUpdated: new Date(),
                updatedBy: 'admin_user'
              }
            : rate
        );
        setFiatRates(updatedRates);
        saveFiatRates(updatedRates);
        setEditingFiatRate(null);
        setNewFiatRate('');
      }
    }
  };

  const handleCancelFiatEdit = () => {
    setEditingFiatRate(null);
    setNewFiatRate('');
  };

  // Conversion fee editing handlers
  const handleEditFees = () => {
    if (conversionFees) {
      setEditingFees(true);
      setNewUsdFee(conversionFees.suspendedGoldToUsd.toString());
      setNewTomanFee(conversionFees.suspendedGoldToToman.toString());
    }
  };

  const handleSaveFees = async () => {
    if (newUsdFee && newTomanFee) {
      const usdFee = parseFloat(newUsdFee);
      const tomanFee = parseFloat(newTomanFee);
      
      if (usdFee >= 0 && tomanFee >= 0) {
        try {
          const updatedConfig = await ConversionFeeService.updateConversionFees(usdFee, tomanFee, 'admin_user');
          setConversionFees(updatedConfig);
          setEditingFees(false);
          setNewUsdFee('');
          setNewTomanFee('');
        } catch (error) {
          console.error('Failed to update conversion fees:', error);
        }
      }
    }
  };

  const handleCancelFeesEdit = () => {
    setEditingFees(false);
    setNewUsdFee('');
    setNewTomanFee('');
  };

  const calculateGoldConversion = (amount: number, realmId: string, toCurrency: 'usd' | 'toman') => {
    const realmRate = realmRates.find(r => r.realmId === realmId);
    if (!realmRate) return 0;
    
    return toCurrency === 'usd' 
      ? amount * realmRate.goldToUsd 
      : amount * realmRate.goldToToman;
  };

  const calculateFiatConversion = (amount: number, fromCurrency: 'usd' | 'toman', toCurrency: 'usd' | 'toman') => {
    if (fromCurrency === toCurrency) return amount;
    
    const rate = fiatRates.find(r => 
      r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
    );
    
    return rate ? amount * rate.rate : 0;
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">Exchange Rates</h2>
          <p className="admin-section__description">Loading exchange rates...</p>
        </div>
        <div className="admin-section__content">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Exchange Rates Management</h2>
        <p className="admin-section__description">
          Manage exchange rates for all realm gold currencies, fiat currencies, and conversion fees
        </p>
      </div>

      <div className="admin-section__content">
        {/* Statistics Overview */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">Exchange Rate Overview</h3>
          </div>
          <div className="admin-card__content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card__icon">🎮</div>
                <div className="stat-card__content">
                  <div className="stat-card__value">{realms.length}</div>
                  <div className="stat-card__label">Active Realms</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">🪙</div>
                <div className="stat-card__content">
                  <div className="stat-card__value">{realmRates.length}</div>
                  <div className="stat-card__label">Gold Rates</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">💱</div>
                <div className="stat-card__content">
                  <div className="stat-card__value">{fiatRates.length}</div>
                  <div className="stat-card__label">Fiat Rates</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">💰</div>
                <div className="stat-card__content">
                  <div className="stat-card__value">{conversionFees?.suspendedGoldToUsd || 0}%</div>
                  <div className="stat-card__label">USD Conv. Fee</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="tab-navigation">
              <button
                className={`tab-button ${activeTab === 'realm-rates' ? 'tab-button--active' : ''}`}
                onClick={() => setActiveTab('realm-rates')}
              >
                <span className="tab-icon">🪙</span>
                Realm Gold Rates
              </button>
              <button
                className={`tab-button ${activeTab === 'fiat-rates' ? 'tab-button--active' : ''}`}
                onClick={() => setActiveTab('fiat-rates')}
              >
                <span className="tab-icon">💱</span>
                Fiat Exchange Rates
              </button>
              <button
                className={`tab-button ${activeTab === 'conversion-fees' ? 'tab-button--active' : ''}`}
                onClick={() => setActiveTab('conversion-fees')}
              >
                <span className="tab-icon">⚙️</span>
                Conversion Fees
              </button>
            </div>
          </div>

          <div className="admin-card__content">
            {/* Realm Gold Rates Tab */}
            {activeTab === 'realm-rates' && (
              <div className="tab-content">
                <div className="tab-content__header">
                  <h3 className="tab-content__title">Realm Gold Exchange Rates</h3>
                  <p className="tab-content__description">
                    Set exchange rates for each realm's gold currency to USD and Toman
                  </p>
                </div>

                <div className="realm-rates-table">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Game</th>
                        <th>Realm</th>
                        <th>Gold → USD</th>
                        <th>Gold → Toman</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {realmRates.map((rate) => (
                        <tr key={rate.id}>
                          <td>
                            <div className="game-info">
                              <span className="game-name">{rate.gameName}</span>
                            </div>
                          </td>
                          <td>
                            <div className="realm-info">
                              <span className="realm-name">{rate.realmName}</span>
                              <span className="realm-display">({rate.realmName} Gold)</span>
                            </div>
                          </td>
                          <td>
                            {editingRealmRate?.id === rate.id ? (
                              <input
                                type="number"
                                step="0.000001"
                                className="rate-input"
                                value={newGoldToUsd}
                                onChange={(e) => setNewGoldToUsd(e.target.value)}
                                placeholder="0.01"
                              />
                            ) : (
                              <div className="rate-display">
                                <span className="rate-value">
                                  1G = ${rate.goldToUsd < 1 ? rate.goldToUsd.toFixed(6) : rate.goldToUsd.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            {editingRealmRate?.id === rate.id ? (
                              <input
                                type="number"
                                step="1"
                                className="rate-input"
                                value={newGoldToToman}
                                onChange={(e) => setNewGoldToToman(e.target.value)}
                                placeholder="420"
                              />
                            ) : (
                              <div className="rate-display">
                                <span className="rate-value">
                                  1G = ﷼{rate.goldToToman.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="update-info">
                              <div className="update-date">{rate.lastUpdated.toLocaleDateString()}</div>
                              <div className="update-by">by {rate.updatedBy}</div>
                            </div>
                          </td>
                          <td>
                            {editingRealmRate?.id === rate.id ? (
                              <div className="action-buttons">
                                <button
                                  className="action-button action-button--approve"
                                  onClick={handleSaveRealmRate}
                                >
                                  Save
                                </button>
                                <button
                                  className="action-button action-button--reject"
                                  onClick={handleCancelRealmEdit}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                className="action-button action-button--edit"
                                onClick={() => handleEditRealmRate(rate)}
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

                {/* Sample Conversions for Realm Rates */}
                <div className="conversion-examples">
                  <h4>Sample Conversions</h4>
                  <div className="examples-grid">
                    {realmRates.slice(0, 4).map(rate => (
                      <div key={rate.id} className="example-card">
                        <div className="example-header">
                          <span className="example-realm">{rate.realmName}</span>
                        </div>
                        <div className="example-conversions">
                          <div className="conversion-item">
                            <span className="conversion-from">100G</span>
                            <span className="conversion-arrow">→</span>
                            <span className="conversion-to">${calculateGoldConversion(100, rate.realmId, 'usd')}</span>
                          </div>
                          <div className="conversion-item">
                            <span className="conversion-from">100G</span>
                            <span className="conversion-arrow">→</span>
                            <span className="conversion-to">﷼{calculateGoldConversion(100, rate.realmId, 'toman').toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Fiat Exchange Rates Tab */}
            {activeTab === 'fiat-rates' && (
              <div className="tab-content">
                <div className="tab-content__header">
                  <h3 className="tab-content__title">Fiat Currency Exchange Rates</h3>
                  <p className="tab-content__description">
                    Manage exchange rates between USD and Toman currencies
                  </p>
                </div>

                <div className="fiat-rates-table">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>From Currency</th>
                        <th>To Currency</th>
                        <th>Exchange Rate</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fiatRates.map((rate) => (
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
                            {editingFiatRate?.id === rate.id ? (
                              <input
                                type="number"
                                step="any"
                                className="rate-input"
                                value={newFiatRate}
                                onChange={(e) => setNewFiatRate(e.target.value)}
                                autoFocus
                              />
                            ) : (
                              <div className="rate-display">
                                <span className="rate-value">
                                  {rate.rate < 1 ? rate.rate.toFixed(6) : rate.rate.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="update-info">
                              <div className="update-date">{rate.lastUpdated.toLocaleDateString()}</div>
                              <div className="update-by">by {rate.updatedBy}</div>
                            </div>
                          </td>
                          <td>
                            {editingFiatRate?.id === rate.id ? (
                              <div className="action-buttons">
                                <button
                                  className="action-button action-button--approve"
                                  onClick={handleSaveFiatRate}
                                >
                                  Save
                                </button>
                                <button
                                  className="action-button action-button--reject"
                                  onClick={handleCancelFiatEdit}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                className="action-button action-button--edit"
                                onClick={() => handleEditFiatRate(rate)}
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

                {/* Fiat Conversion Examples */}
                <div className="conversion-examples">
                  <h4>Sample Fiat Conversions</h4>
                  <div className="examples-grid">
                    <div className="example-card">
                      <div className="example-header">
                        <span className="example-title">USD to Toman</span>
                      </div>
                      <div className="example-conversions">
                        <div className="conversion-item">
                          <span className="conversion-from">$100</span>
                          <span className="conversion-arrow">→</span>
                          <span className="conversion-to">﷼{calculateFiatConversion(100, 'usd', 'toman').toLocaleString()}</span>
                        </div>
                        <div className="conversion-item">
                          <span className="conversion-from">$1,000</span>
                          <span className="conversion-arrow">→</span>
                          <span className="conversion-to">﷼{calculateFiatConversion(1000, 'usd', 'toman').toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="example-card">
                      <div className="example-header">
                        <span className="example-title">Toman to USD</span>
                      </div>
                      <div className="example-conversions">
                        <div className="conversion-item">
                          <span className="conversion-from">﷼1,000,000</span>
                          <span className="conversion-arrow">→</span>
                          <span className="conversion-to">${calculateFiatConversion(1000000, 'toman', 'usd').toFixed(2)}</span>
                        </div>
                        <div className="conversion-item">
                          <span className="conversion-from">﷼5,000,000</span>
                          <span className="conversion-arrow">→</span>
                          <span className="conversion-to">${calculateFiatConversion(5000000, 'toman', 'usd').toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conversion Fees Tab */}
            {activeTab === 'conversion-fees' && (
              <div className="tab-content">
                <div className="tab-content__header">
                  <h3 className="tab-content__title">Suspended Gold Conversion Fees</h3>
                  <p className="tab-content__description">
                    Configure additional fees for converting suspended gold to fiat currencies
                  </p>
                </div>

                {conversionFees && (
                  <div className="conversion-fees-config">
                    <div className="fees-grid">
                      <div className="fee-card">
                        <div className="fee-card__header">
                          <span className="fee-card__icon">💵</span>
                          <span className="fee-card__title">Suspended Gold → USD</span>
                        </div>
                        <div className="fee-card__content">
                          {editingFees ? (
                            <div className="fee-input-group">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                className="fee-input"
                                value={newUsdFee}
                                onChange={(e) => setNewUsdFee(e.target.value)}
                                placeholder="5.0"
                              />
                              <span className="fee-unit">%</span>
                            </div>
                          ) : (
                            <div className="fee-display">
                              <span className="fee-value">{conversionFees.suspendedGoldToUsd}%</span>
                              <span className="fee-description">Additional fee</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="fee-card">
                        <div className="fee-card__header">
                          <span className="fee-card__icon">﷼</span>
                          <span className="fee-card__title">Suspended Gold → Toman</span>
                        </div>
                        <div className="fee-card__content">
                          {editingFees ? (
                            <div className="fee-input-group">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                className="fee-input"
                                value={newTomanFee}
                                onChange={(e) => setNewTomanFee(e.target.value)}
                                placeholder="5.0"
                              />
                              <span className="fee-unit">%</span>
                            </div>
                          ) : (
                            <div className="fee-display">
                              <span className="fee-value">{conversionFees.suspendedGoldToToman}%</span>
                              <span className="fee-description">Additional fee</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="fees-actions">
                      {editingFees ? (
                        <div className="action-buttons">
                          <button
                            className="action-button action-button--approve"
                            onClick={handleSaveFees}
                          >
                            Save Changes
                          </button>
                          <button
                            className="action-button action-button--reject"
                            onClick={handleCancelFeesEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="action-button action-button--edit"
                          onClick={handleEditFees}
                        >
                          Edit Conversion Fees
                        </button>
                      )}
                    </div>

                    <div className="fees-info">
                      <h4>How Conversion Fees Work</h4>
                      <ul>
                        <li>Conversion fees apply only to suspended gold conversions</li>
                        <li>Withdrawable gold conversions use standard exchange rates</li>
                        <li>Fees are added on top of the base exchange rate</li>
                        <li>Users see the total cost before confirming conversions</li>
                      </ul>
                    </div>

                    <div className="fees-examples">
                      <h4>Fee Calculation Examples</h4>
                      <div className="examples-grid">
                        <div className="example-card">
                          <div className="example-header">
                            <span className="example-title">100G → USD (with {conversionFees.suspendedGoldToUsd}% fee)</span>
                          </div>
                          <div className="example-calculation">
                            <div className="calc-line">Base conversion: 100G × $0.01 = $1.00</div>
                            <div className="calc-line">Conversion fee: $1.00 × {conversionFees.suspendedGoldToUsd}% = ${(1 * conversionFees.suspendedGoldToUsd / 100).toFixed(2)}</div>
                            <div className="calc-line calc-total">Total cost: ${(1 + (1 * conversionFees.suspendedGoldToUsd / 100)).toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="example-card">
                          <div className="example-header">
                            <span className="example-title">100G → Toman (with {conversionFees.suspendedGoldToToman}% fee)</span>
                          </div>
                          <div className="example-calculation">
                            <div className="calc-line">Base conversion: 100G × ﷼420 = ﷼42,000</div>
                            <div className="calc-line">Conversion fee: ﷼42,000 × {conversionFees.suspendedGoldToToman}% = ﷼{(42000 * conversionFees.suspendedGoldToToman / 100).toLocaleString()}</div>
                            <div className="calc-line calc-total">Total cost: ﷼{(42000 + (42000 * conversionFees.suspendedGoldToToman / 100)).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* Statistics Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: var(--discord-bg-tertiary);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid var(--discord-bg-modifier-accent);
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          border-color: var(--discord-accent);
          transform: translateY(-2px);
        }

        .stat-card__icon {
          font-size: 32px;
          opacity: 0.8;
        }

        .stat-card__content {
          flex: 1;
        }

        .stat-card__value {
          font-size: 24px;
          font-weight: 700;
          color: var(--discord-accent);
          line-height: 1;
        }

        .stat-card__label {
          font-size: 14px;
          color: var(--discord-text-secondary);
          margin-top: 4px;
        }

        /* Tab Navigation */
        .tab-navigation {
          display: flex;
          gap: 4px;
          background: var(--discord-bg-secondary);
          padding: 4px;
          border-radius: 8px;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--discord-text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          justify-content: center;
        }

        .tab-button:hover {
          background: var(--discord-bg-modifier-hover);
          color: var(--discord-text-primary);
        }

        .tab-button--active {
          background: var(--discord-accent);
          color: white;
        }

        .tab-button--active:hover {
          background: var(--discord-accent-hover);
        }

        .tab-icon {
          font-size: 16px;
        }

        /* Tab Content */
        .tab-content {
          padding: 24px 0;
        }

        .tab-content__header {
          margin-bottom: 24px;
        }

        .tab-content__title {
          font-size: 20px;
          font-weight: 600;
          color: var(--discord-text-primary);
          margin: 0 0 8px 0;
        }

        .tab-content__description {
          font-size: 14px;
          color: var(--discord-text-secondary);
          margin: 0;
        }

        /* Realm Rates Table */
        .realm-rates-table,
        .fiat-rates-table {
          margin-bottom: 32px;
        }

        .game-info {
          display: flex;
          flex-direction: column;
        }

        .game-name {
          font-weight: 600;
          color: var(--discord-text-primary);
          font-size: 14px;
        }

        .realm-info {
          display: flex;
          flex-direction: column;
        }

        .realm-name {
          font-weight: 600;
          color: var(--discord-text-primary);
          font-size: 14px;
        }

        .realm-display {
          font-size: 12px;
          color: var(--discord-text-secondary);
          margin-top: 2px;
        }

        .rate-display {
          display: flex;
          flex-direction: column;
        }

        .rate-value {
          font-weight: 600;
          color: var(--discord-accent);
          font-size: 14px;
        }

        .rate-input {
          padding: 8px 12px;
          background: var(--discord-bg-tertiary);
          border: 1px solid var(--discord-accent);
          border-radius: 6px;
          color: var(--discord-text-primary);
          font-size: 14px;
          width: 120px;
          transition: border-color 0.2s ease;
        }

        .rate-input:focus {
          outline: none;
          border-color: var(--discord-accent-hover);
          box-shadow: 0 0 0 2px rgba(88, 101, 242, 0.2);
        }

        .update-info {
          display: flex;
          flex-direction: column;
        }

        .update-date {
          font-size: 13px;
          color: var(--discord-text-primary);
        }

        .update-by {
          font-size: 12px;
          color: var(--discord-text-secondary);
          margin-top: 2px;
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

        /* Conversion Examples */
        .conversion-examples {
          margin-top: 32px;
        }

        .conversion-examples h4 {
          margin: 0 0 16px 0;
          color: var(--discord-text-primary);
          font-size: 18px;
          font-weight: 600;
        }

        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .example-card {
          background: var(--discord-bg-tertiary);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid var(--discord-bg-modifier-accent);
        }

        .example-header {
          margin-bottom: 16px;
        }

        .example-realm,
        .example-title {
          font-weight: 600;
          color: var(--discord-text-primary);
          font-size: 16px;
        }

        .example-conversions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .conversion-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--discord-bg-secondary);
          border-radius: 8px;
        }

        .conversion-from {
          font-weight: 600;
          color: var(--discord-text-primary);
          font-size: 14px;
        }

        .conversion-arrow {
          color: var(--discord-accent);
          font-weight: 700;
          font-size: 16px;
        }

        .conversion-to {
          font-weight: 600;
          color: var(--discord-success);
          font-size: 14px;
        }

        /* Conversion Fees */
        .conversion-fees-config {
          max-width: 800px;
        }

        .fees-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .fee-card {
          background: var(--discord-bg-tertiary);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--discord-bg-modifier-accent);
        }

        .fee-card__header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .fee-card__icon {
          font-size: 24px;
        }

        .fee-card__title {
          font-weight: 600;
          color: var(--discord-text-primary);
          font-size: 16px;
        }

        .fee-card__content {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fee-display {
          text-align: center;
        }

        .fee-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--discord-accent);
          display: block;
        }

        .fee-description {
          font-size: 14px;
          color: var(--discord-text-secondary);
          margin-top: 4px;
        }

        .fee-input-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fee-input {
          padding: 12px 16px;
          background: var(--discord-bg-secondary);
          border: 1px solid var(--discord-accent);
          border-radius: 8px;
          color: var(--discord-text-primary);
          font-size: 18px;
          font-weight: 600;
          width: 80px;
          text-align: center;
        }

        .fee-input:focus {
          outline: none;
          border-color: var(--discord-accent-hover);
          box-shadow: 0 0 0 2px rgba(88, 101, 242, 0.2);
        }

        .fee-unit {
          font-size: 18px;
          font-weight: 600;
          color: var(--discord-text-primary);
        }

        .fees-actions {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
        }

        .fees-info {
          background: var(--discord-bg-tertiary);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .fees-info h4 {
          margin: 0 0 12px 0;
          color: var(--discord-text-primary);
          font-size: 16px;
        }

        .fees-info ul {
          margin: 0;
          padding-left: 20px;
          color: var(--discord-text-secondary);
        }

        .fees-info li {
          margin-bottom: 8px;
          font-size: 14px;
        }

        .fees-examples {
          background: var(--discord-bg-tertiary);
          border-radius: 12px;
          padding: 20px;
        }

        .fees-examples h4 {
          margin: 0 0 16px 0;
          color: var(--discord-text-primary);
          font-size: 16px;
        }

        .example-calculation {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
        }

        .calc-line {
          font-size: 14px;
          color: var(--discord-text-secondary);
          padding: 4px 0;
        }

        .calc-total {
          font-weight: 600;
          color: var(--discord-text-primary);
          border-top: 1px solid var(--discord-bg-modifier-accent);
          padding-top: 8px;
          margin-top: 4px;
        }

        /* Loading State */
        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: var(--discord-text-secondary);
          font-size: 16px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .tab-navigation {
            flex-direction: column;
          }

          .tab-button {
            justify-content: flex-start;
          }

          .examples-grid {
            grid-template-columns: 1fr;
          }

          .fees-grid {
            grid-template-columns: 1fr;
          }

          .rate-input {
            width: 100px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-card__icon {
            font-size: 24px;
          }

          .stat-card__value {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};