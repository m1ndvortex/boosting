import React, { useState } from 'react';
import type { ShopProduct, Game } from '../../../types';

export const ShopManagement: React.FC = () => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);

  // Mock games data
  const games: Game[] = [
    {
      id: 'game_1',
      name: 'World of Warcraft',
      slug: 'wow',
      icon: '🏰',
      isActive: true,
      serviceTypes: [],
    },
    {
      id: 'game_2',
      name: 'Final Fantasy XIV',
      slug: 'ffxiv',
      icon: '⚔️',
      isActive: true,
      serviceTypes: [],
    },
  ];

  // Mock shop products
  const [products, setProducts] = useState<ShopProduct[]>([
    {
      id: 'prod_1',
      gameId: 'game_1',
      productType: 'game_time',
      name: 'WoW Game Time - 30 Days',
      description: '30 days of World of Warcraft game time',
      durationDays: 30,
      prices: {
        gold: 3000,
        usd: 15,
        toman: 630000,
      },
      stockType: 'unlimited',
      isActive: true,
    },
    {
      id: 'prod_2',
      gameId: 'game_1',
      productType: 'game_time',
      name: 'WoW Game Time - 60 Days',
      description: '60 days of World of Warcraft game time',
      durationDays: 60,
      prices: {
        gold: 5500,
        usd: 28,
        toman: 1176000,
      },
      stockType: 'unlimited',
      isActive: true,
    },
    {
      id: 'prod_3',
      gameId: 'game_1',
      productType: 'game_time',
      name: 'WoW Game Time - 90 Days',
      description: '90 days of World of Warcraft game time',
      durationDays: 90,
      prices: {
        gold: 8000,
        usd: 40,
        toman: 1680000,
      },
      stockType: 'unlimited',
      isActive: true,
    },
    {
      id: 'prod_4',
      gameId: 'game_2',
      productType: 'subscription',
      name: 'FFXIV Subscription - 30 Days',
      description: '30 days of Final Fantasy XIV subscription',
      durationDays: 30,
      prices: {
        gold: 2800,
        usd: 13,
        toman: 546000,
      },
      stockType: 'limited',
      stockQuantity: 50,
      isActive: false,
    },
  ]);

  const [formData, setFormData] = useState({
    gameId: '',
    productType: 'game_time' as 'game_time' | 'subscription',
    name: '',
    description: '',
    durationDays: 30,
    goldPrice: 0,
    usdPrice: 0,
    tomanPrice: 0,
    stockType: 'unlimited' as 'unlimited' | 'limited',
    stockQuantity: 0,
  });

  const getGameName = (gameId: string) => {
    return games.find(g => g.id === gameId)?.name || 'Unknown Game';
  };

  const getGameIcon = (gameId: string) => {
    return games.find(g => g.id === gameId)?.icon || '🎮';
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct: ShopProduct = {
      id: `prod_${Date.now()}`,
      gameId: formData.gameId,
      productType: formData.productType,
      name: formData.name,
      description: formData.description,
      durationDays: formData.durationDays,
      prices: {
        gold: formData.goldPrice,
        usd: formData.usdPrice,
        toman: formData.tomanPrice,
      },
      stockType: formData.stockType,
      stockQuantity: formData.stockType === 'limited' ? formData.stockQuantity : undefined,
      isActive: true,
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...newProduct, id: editingProduct.id } : p
      ));
      setEditingProduct(null);
    } else {
      setProducts(prev => [...prev, newProduct]);
    }

    setShowProductForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      gameId: '',
      productType: 'game_time',
      name: '',
      description: '',
      durationDays: 30,
      goldPrice: 0,
      usdPrice: 0,
      tomanPrice: 0,
      stockType: 'unlimited',
      stockQuantity: 0,
    });
  };

  const handleEditProduct = (product: ShopProduct) => {
    setEditingProduct(product);
    setFormData({
      gameId: product.gameId,
      productType: product.productType,
      name: product.name,
      description: product.description,
      durationDays: product.durationDays,
      goldPrice: product.prices.gold,
      usdPrice: product.prices.usd,
      tomanPrice: product.prices.toman,
      stockType: product.stockType,
      stockQuantity: product.stockQuantity || 0,
    });
    setShowProductForm(true);
  };

  const handleToggleActive = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const activeProducts = products.filter(p => p.isActive);
  const inactiveProducts = products.filter(p => !p.isActive);

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Shop Management</h2>
        <p className="admin-section__description">
          Create and manage shop products including game time subscriptions
        </p>
      </div>

      <div className="admin-section__content">
        {/* Shop Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon">🏪</div>
            <div className="stat-card__value">{products.length}</div>
            <div className="stat-card__label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">✅</div>
            <div className="stat-card__value">{activeProducts.length}</div>
            <div className="stat-card__label">Active Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">🎮</div>
            <div className="stat-card__value">
              {products.filter(p => p.productType === 'game_time').length}
            </div>
            <div className="stat-card__label">Game Time Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">📅</div>
            <div className="stat-card__value">
              {products.filter(p => p.productType === 'subscription').length}
            </div>
            <div className="stat-card__label">Subscriptions</div>
          </div>
        </div>

        {/* Active Products */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              Active Products ({activeProducts.length})
            </h3>
            <button
              className="admin-button"
              onClick={() => {
                setEditingProduct(null);
                resetForm();
                setShowProductForm(true);
              }}
            >
              + Add Product
            </button>
          </div>
          <div className="admin-card__content">
            {activeProducts.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Game</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Pricing</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-info">
                          <div className="product-name">{product.name}</div>
                          <div className="product-description">{product.description}</div>
                        </div>
                      </td>
                      <td>
                        <div className="game-info">
                          <span className="game-icon">{getGameIcon(product.gameId)}</span>
                          <span className="game-name">{getGameName(product.gameId)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge ${
                          product.productType === 'game_time' 
                            ? 'type-badge--game-time' 
                            : 'type-badge--subscription'
                        }`}>
                          {product.productType === 'game_time' ? 'Game Time' : 'Subscription'}
                        </span>
                      </td>
                      <td>{product.durationDays} days</td>
                      <td>
                        <div className="pricing-info">
                          <div className="price-item">{product.prices.gold}G</div>
                          <div className="price-item">${product.prices.usd}</div>
                          <div className="price-item">﷼{product.prices.toman.toLocaleString()}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`stock-badge ${
                          product.stockType === 'unlimited' 
                            ? 'stock-badge--unlimited' 
                            : 'stock-badge--limited'
                        }`}>
                          {product.stockType === 'unlimited' 
                            ? 'Unlimited' 
                            : `${product.stockQuantity} left`
                          }
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button action-button--edit"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-button action-button--reject"
                            onClick={() => handleToggleActive(product.id)}
                          >
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">🏪</div>
                <div className="empty-state__title">No Active Products</div>
                <div className="empty-state__description">
                  Create your first shop product to get started
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Inactive Products */}
        {inactiveProducts.length > 0 && (
          <div className="admin-card">
            <div className="admin-card__header">
              <h3 className="admin-card__title">
                Inactive Products ({inactiveProducts.length})
              </h3>
            </div>
            <div className="admin-card__content">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Game</th>
                    <th>Type</th>
                    <th>Pricing</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inactiveProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-info">
                          <div className="product-name">{product.name}</div>
                          <div className="product-description">{product.description}</div>
                        </div>
                      </td>
                      <td>
                        <div className="game-info">
                          <span className="game-icon">{getGameIcon(product.gameId)}</span>
                          <span className="game-name">{getGameName(product.gameId)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge ${
                          product.productType === 'game_time' 
                            ? 'type-badge--game-time' 
                            : 'type-badge--subscription'
                        }`}>
                          {product.productType === 'game_time' ? 'Game Time' : 'Subscription'}
                        </span>
                      </td>
                      <td>
                        <div className="pricing-info">
                          <div className="price-item">{product.prices.gold}G</div>
                          <div className="price-item">${product.prices.usd}</div>
                          <div className="price-item">﷼{product.prices.toman.toLocaleString()}</div>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button action-button--approve"
                            onClick={() => handleToggleActive(product.id)}
                          >
                            Activate
                          </button>
                          <button
                            className="action-button action-button--reject"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Creation/Edit Form Modal */}
        {showProductForm && (
          <div className="modal-overlay" onClick={() => setShowProductForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <form onSubmit={handleCreateProduct} className="admin-form">
                <div className="form-row">
                  <div className="admin-form__group">
                    <label className="admin-form__label">Game</label>
                    <select
                      className="admin-form__input"
                      value={formData.gameId}
                      onChange={(e) => setFormData(prev => ({ ...prev, gameId: e.target.value }))}
                      required
                    >
                      <option value="">Select a game</option>
                      {games.filter(g => g.isActive).map((game) => (
                        <option key={game.id} value={game.id}>
                          {game.icon} {game.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form__group">
                    <label className="admin-form__label">Product Type</label>
                    <select
                      className="admin-form__input"
                      value={formData.productType}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        productType: e.target.value as 'game_time' | 'subscription' 
                      }))}
                      required
                    >
                      <option value="game_time">Game Time</option>
                      <option value="subscription">Subscription</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form__group">
                  <label className="admin-form__label">Product Name</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="admin-form__group">
                  <label className="admin-form__label">Description</label>
                  <textarea
                    className="admin-form__textarea"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the product"
                    required
                  />
                </div>

                <div className="admin-form__group">
                  <label className="admin-form__label">Duration (Days)</label>
                  <input
                    type="number"
                    className="admin-form__input"
                    value={formData.durationDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, durationDays: parseInt(e.target.value) }))}
                    min="1"
                    required
                  />
                </div>

                <div className="form-section">
                  <h4>Pricing</h4>
                  <div className="form-row">
                    <div className="admin-form__group">
                      <label className="admin-form__label">Gold Price</label>
                      <input
                        type="number"
                        className="admin-form__input"
                        value={formData.goldPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, goldPrice: parseInt(e.target.value) }))}
                        min="0"
                        required
                      />
                    </div>
                    <div className="admin-form__group">
                      <label className="admin-form__label">USD Price</label>
                      <input
                        type="number"
                        className="admin-form__input"
                        value={formData.usdPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, usdPrice: parseInt(e.target.value) }))}
                        min="0"
                        required
                      />
                    </div>
                    <div className="admin-form__group">
                      <label className="admin-form__label">Toman Price</label>
                      <input
                        type="number"
                        className="admin-form__input"
                        value={formData.tomanPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, tomanPrice: parseInt(e.target.value) }))}
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Stock Management</h4>
                  <div className="form-row">
                    <div className="admin-form__group">
                      <label className="admin-form__label">Stock Type</label>
                      <select
                        className="admin-form__input"
                        value={formData.stockType}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          stockType: e.target.value as 'unlimited' | 'limited' 
                        }))}
                      >
                        <option value="unlimited">Unlimited</option>
                        <option value="limited">Limited</option>
                      </select>
                    </div>
                    {formData.stockType === 'limited' && (
                      <div className="admin-form__group">
                        <label className="admin-form__label">Stock Quantity</label>
                        <input
                          type="number"
                          className="admin-form__input"
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) }))}
                          min="0"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="admin-button">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                  <button
                    type="button"
                    className="admin-button admin-button--secondary"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .product-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .product-name {
          font-weight: 600;
          color: var(--discord-text-primary);
          font-size: 14px;
        }

        .product-description {
          font-size: 12px;
          color: var(--discord-text-muted);
        }

        .game-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .game-icon {
          font-size: 16px;
        }

        .game-name {
          font-size: 14px;
          color: var(--discord-text-primary);
        }

        .type-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .type-badge--game-time {
          background: rgba(67, 181, 129, 0.2);
          color: var(--discord-success);
        }

        .type-badge--subscription {
          background: rgba(114, 137, 218, 0.2);
          color: var(--discord-accent);
        }

        .pricing-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .price-item {
          font-size: 12px;
          color: var(--discord-text-secondary);
          font-weight: 500;
        }

        .stock-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stock-badge--unlimited {
          background: rgba(67, 181, 129, 0.2);
          color: var(--discord-success);
        }

        .stock-badge--limited {
          background: rgba(250, 166, 26, 0.2);
          color: var(--discord-warning);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--discord-bg-secondary);
          border-radius: 8px;
          padding: 24px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          margin: 0 0 20px 0;
          color: var(--discord-text-primary);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-section {
          margin: 20px 0;
        }

        .form-section h4 {
          margin: 0 0 12px 0;
          color: var(--discord-text-primary);
          font-size: 16px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};