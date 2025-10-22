import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { ProductCard } from '../../components/shop/ProductCard';
import { PurchaseHistory } from '../../components/shop/PurchaseHistory';
import { PaymentGateway } from '../../components/shop/PaymentGateway';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { ShopService } from '../../services/shopService';
import type { ShopProduct, ShopOrder, Currency } from '../../types';
import './ShopPage.css';

export const ShopPage: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: walletState, refreshWallet } = useWallet();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'history'>('products');
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('gold');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadProducts();
    if (authState.user) {
      loadOrders();
    }
  }, [authState.user]);

  const loadProducts = () => {
    const availableProducts = ShopService.getProducts();
    setProducts(availableProducts);
  };

  const loadOrders = () => {
    if (!authState.user) return;
    const userOrders = ShopService.getUserOrders(authState.user.id);
    setOrders(userOrders);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePurchase = async (
    product: ShopProduct,
    currency: Currency,
    paymentMethod: 'wallet' | 'card'
  ) => {
    if (!authState.user) return;

    if (paymentMethod === 'wallet') {
      await handleWalletPurchase(product, currency);
    } else {
      handleCardPurchase(product, currency);
    }
  };

  const handleWalletPurchase = async (product: ShopProduct, currency: Currency) => {
    if (!authState.user) return;

    setIsProcessing(true);
    try {
      const price = product.prices[currency];
      const userWallet = walletState.wallet;

      if (!userWallet || userWallet.balances[currency] < price) {
        showNotification('error', `Insufficient ${currency.toUpperCase()} balance`);
        return;
      }

      const order = await ShopService.purchaseWithWallet(authState.user.id, product.id, currency);
      
      // Refresh wallet and orders
      await refreshWallet();
      loadOrders();
      
      showNotification('success', `Successfully purchased ${product.name}! Game time code: ${order.gameTimeCode}`);
    } catch (error) {
      console.error('Wallet purchase failed:', error);
      showNotification('error', error instanceof Error ? error.message : 'Purchase failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardPurchase = (product: ShopProduct, currency: Currency) => {
    if (currency === 'gold') {
      showNotification('error', 'Card payments are not supported for Gold currency');
      return;
    }

    setSelectedProduct(product);
    setSelectedCurrency(currency);
    setIsPaymentGatewayOpen(true);
  };

  const handlePaymentGatewaySuccess = async () => {
    if (!authState.user || !selectedProduct) return;

    try {
      const order = await ShopService.purchaseWithCard(
        authState.user.id,
        selectedProduct.id,
        selectedCurrency
      );
      
      loadOrders();
      setIsPaymentGatewayOpen(false);
      setSelectedProduct(null);
      
      showNotification('success', `Payment successful! Game time code: ${order.gameTimeCode}`);
    } catch (error) {
      console.error('Card purchase failed:', error);
      showNotification('error', error instanceof Error ? error.message : 'Purchase failed');
    }
  };

  const handlePaymentGatewayCancel = () => {
    setIsPaymentGatewayOpen(false);
    setSelectedProduct(null);
  };

  if (!authState.user) {
    return (
      <div className="shop-page">
        <Header
          title="Shop"
          subtitle="Please log in to access the shop"
        />
      </div>
    );
  }

  return (
    <div className="shop-page">
      <Header
        title="Shop"
        subtitle="Game time products and subscriptions"
      />
      
      {notification && (
        <div className={`shop-page__notification shop-page__notification--${notification.type}`}>
          <span className="shop-page__notification-icon">
            {notification.type === 'success' ? '✅' : '❌'}
          </span>
          <span className="shop-page__notification-message">{notification.message}</span>
          <button
            className="shop-page__notification-close"
            onClick={() => setNotification(null)}
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="shop-page__content">
        <div className="shop-page__tabs">
          <button
            className={`shop-page__tab ${activeTab === 'products' ? 'shop-page__tab--active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <span className="shop-page__tab-icon">🛍️</span>
            Products
          </button>
          <button
            className={`shop-page__tab ${activeTab === 'history' ? 'shop-page__tab--active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="shop-page__tab-icon">📋</span>
            Purchase History
          </button>
        </div>

        <div className="shop-page__tab-content">
          {activeTab === 'products' && (
            <div className="shop-page__products">
              <div className="shop-page__products-header">
                <h2 className="shop-page__products-title">Available Products</h2>
                <p className="shop-page__products-subtitle">
                  Purchase game time with your wallet balance or direct payment
                </p>
              </div>
              
              <div className="shop-page__products-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPurchase={handlePurchase}
                    className={isProcessing ? 'shop-page__product-card--disabled' : ''}
                  />
                ))}
              </div>
              
              {products.length === 0 && (
                <div className="shop-page__empty">
                  <div className="shop-page__empty-icon">🏪</div>
                  <h3>No Products Available</h3>
                  <p>Check back later for new game time products.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <PurchaseHistory
              orders={orders}
              products={products}
            />
          )}
        </div>
      </div>

      <PaymentGateway
        isOpen={isPaymentGatewayOpen}
        product={selectedProduct}
        currency={selectedCurrency}
        onSuccess={handlePaymentGatewaySuccess}
        onCancel={handlePaymentGatewayCancel}
      />
    </div>
  );
};