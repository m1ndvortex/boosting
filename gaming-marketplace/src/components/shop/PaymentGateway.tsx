import React, { useState, useEffect } from 'react';
import type { ShopProduct, Currency, GoldWalletBalance } from '../../types';
import { ShopService } from '../../services/shopService';
import { useMultiWallet } from '../../contexts/MultiWalletContext';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../discord/Modal';
import './PaymentGateway.css';

export interface PaymentGatewayProps {
  isOpen: boolean;
  product: ShopProduct | null;
  currency: Currency;
  walletId?: string;
  goldType?: 'suspended' | 'withdrawable';
  onSuccess: () => void;
  onCancel: () => void;
  className?: string;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  isOpen,
  product,
  currency,
  walletId,
  goldType,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const { state: authState } = useAuth();
  const { state: multiWalletState } = useMultiWallet();
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [selectedGoldWallet, setSelectedGoldWallet] = useState<string>(walletId || '');
  const [selectedGoldType, setSelectedGoldType] = useState<'suspended' | 'withdrawable'>(goldType || 'withdrawable');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('payment');
      setPaymentMethod('');
      setSelectedGoldWallet(walletId || '');
      setSelectedGoldType(goldType || 'withdrawable');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setHolderName('');
    }
  }, [isOpen, walletId, goldType]);

  if (!product) return null;

  const price = product.prices[currency];
  const formattedPrice = ShopService.formatCurrency(price, currency);

  const getAvailableGoldWallets = (): GoldWalletBalance[] => {
    if (!multiWalletState.wallet || currency !== 'gold') return [];
    return Object.values(multiWalletState.wallet.goldWallets);
  };

  const getGoldWalletBalance = (walletId: string, goldType: 'suspended' | 'withdrawable'): number => {
    if (!multiWalletState.wallet) return 0;
    const goldWallet = multiWalletState.wallet.goldWallets[walletId];
    if (!goldWallet) return 0;
    return goldType === 'suspended' ? goldWallet.suspendedGold : goldWallet.withdrawableGold;
  };

  const getPaymentMethods = () => {
    if (currency === 'usd') {
      return [
        { id: 'credit_card', name: 'Credit Card', icon: '💳' },
        { id: 'crypto', name: 'Crypto Wallet', icon: '₿' }
      ];
    } else if (currency === 'toman') {
      return [
        { id: 'credit_card', name: 'Credit Card', icon: '💳' },
        { id: 'iranian_bank', name: 'Iranian Bank Card', icon: '🏦' }
      ];
    }
    return [];
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentMethod || !authState.user || !product) return;

    setStep('processing');

    try {
      if (paymentMethod === 'wallet') {
        // Use multi-wallet system for wallet payments
        await ShopService.purchaseWithWallet(
          authState.user.id,
          product.id,
          currency,
          currency === 'gold' ? selectedGoldWallet : undefined,
          currency === 'gold' ? selectedGoldType : undefined
        );
      } else {
        // Use card payment for non-wallet payments
        await ShopService.purchaseWithCard(
          authState.user.id,
          product.id,
          currency
        );
      }

      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Payment failed:', error);
      // In a real app, you would show an error state
      setStep('payment');
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const renderPaymentStep = () => (
    <div className="payment-gateway__content">
      <div className="payment-gateway__header">
        <h2 className="payment-gateway__title">Complete Payment</h2>
        <div className="payment-gateway__product-info">
          <span className="payment-gateway__product-name">{product.name}</span>
          <span className="payment-gateway__product-price">{formattedPrice}</span>
        </div>
      </div>

      <form onSubmit={handlePaymentSubmit} className="payment-gateway__form">
        <div className="payment-gateway__section">
          <h3 className="payment-gateway__section-title">Payment Method</h3>
          <div className="payment-gateway__methods">
            {/* Wallet Payment Option */}
            <label
              className={`payment-gateway__method ${
                paymentMethod === 'wallet' ? 'payment-gateway__method--selected' : ''
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="wallet"
                checked={paymentMethod === 'wallet'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="payment-gateway__method-input"
              />
              <span className="payment-gateway__method-icon">💰</span>
              <span className="payment-gateway__method-name">Wallet</span>
            </label>
            
            {/* Other Payment Methods */}
            {getPaymentMethods().map((method) => (
              <label
                key={method.id}
                className={`payment-gateway__method ${
                  paymentMethod === method.id ? 'payment-gateway__method--selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="payment-gateway__method-input"
                />
                <span className="payment-gateway__method-icon">{method.icon}</span>
                <span className="payment-gateway__method-name">{method.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Gold Wallet Selection */}
        {paymentMethod === 'wallet' && currency === 'gold' && (
          <div className="payment-gateway__section">
            <h3 className="payment-gateway__section-title">Select Gold Wallet</h3>
            <div className="payment-gateway__gold-wallets">
              {getAvailableGoldWallets().map(goldWallet => (
                <label
                  key={goldWallet.realmId}
                  className={`payment-gateway__gold-wallet-option ${
                    selectedGoldWallet === goldWallet.realmId ? 'payment-gateway__gold-wallet-option--selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="goldWallet"
                    value={goldWallet.realmId}
                    checked={selectedGoldWallet === goldWallet.realmId}
                    onChange={(e) => setSelectedGoldWallet(e.target.value)}
                  />
                  
                  <div className="payment-gateway__gold-wallet-info">
                    <div className="payment-gateway__gold-wallet-name">
                      {`${goldWallet.realmName} Gold`}
                    </div>
                    <div className="payment-gateway__gold-wallet-balances">
                      <div className="payment-gateway__gold-balance">
                        <span>Withdrawable: {goldWallet.withdrawableGold.toLocaleString()}G</span>
                      </div>
                      <div className="payment-gateway__gold-balance">
                        <span>Suspended: {goldWallet.suspendedGold.toLocaleString()}G</span>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Gold Type Selection */}
            {selectedGoldWallet && (
              <div className="payment-gateway__gold-type-selection">
                <h4 className="payment-gateway__subsection-title">Gold Type</h4>
                <div className="payment-gateway__gold-type-options">
                  <label className={`payment-gateway__gold-type-option ${selectedGoldType === 'withdrawable' ? 'payment-gateway__gold-type-option--selected' : ''}`}>
                    <input
                      type="radio"
                      name="goldType"
                      value="withdrawable"
                      checked={selectedGoldType === 'withdrawable'}
                      onChange={(e) => setSelectedGoldType(e.target.value as 'suspended' | 'withdrawable')}
                    />
                    <span>Use Withdrawable Gold ({getGoldWalletBalance(selectedGoldWallet, 'withdrawable').toLocaleString()}G)</span>
                  </label>
                  <label className={`payment-gateway__gold-type-option ${selectedGoldType === 'suspended' ? 'payment-gateway__gold-type-option--selected' : ''}`}>
                    <input
                      type="radio"
                      name="goldType"
                      value="suspended"
                      checked={selectedGoldType === 'suspended'}
                      onChange={(e) => setSelectedGoldType(e.target.value as 'suspended' | 'withdrawable')}
                    />
                    <span>Use Suspended Gold ({getGoldWalletBalance(selectedGoldWallet, 'suspended').toLocaleString()}G)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {paymentMethod === 'credit_card' && (
          <div className="payment-gateway__section">
            <h3 className="payment-gateway__section-title">Card Details</h3>
            <div className="payment-gateway__card-form">
              <div className="payment-gateway__field">
                <label className="payment-gateway__label">Card Number</label>
                <input
                  type="text"
                  className="payment-gateway__input"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  required
                />
              </div>
              <div className="payment-gateway__field-row">
                <div className="payment-gateway__field">
                  <label className="payment-gateway__label">Expiry Date</label>
                  <input
                    type="text"
                    className="payment-gateway__input"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="payment-gateway__field">
                  <label className="payment-gateway__label">CVV</label>
                  <input
                    type="text"
                    className="payment-gateway__input"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={4}
                    required
                  />
                </div>
              </div>
              <div className="payment-gateway__field">
                <label className="payment-gateway__label">Cardholder Name</label>
                <input
                  type="text"
                  className="payment-gateway__input"
                  placeholder="John Doe"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'crypto' && (
          <div className="payment-gateway__section">
            <h3 className="payment-gateway__section-title">Crypto Payment</h3>
            <div className="payment-gateway__crypto-info">
              <p>You will be redirected to our crypto payment processor to complete the transaction.</p>
              <div className="payment-gateway__crypto-amount">
                <span>Amount: {formattedPrice}</span>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'iranian_bank' && (
          <div className="payment-gateway__section">
            <h3 className="payment-gateway__section-title">Iranian Bank Payment</h3>
            <div className="payment-gateway__bank-info">
              <p>You will be redirected to the Iranian banking system to complete the payment.</p>
              <div className="payment-gateway__bank-amount">
                <span>Amount: {formattedPrice}</span>
              </div>
            </div>
          </div>
        )}

        <div className="payment-gateway__actions">
          <button
            type="button"
            className="payment-gateway__button payment-gateway__button--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="payment-gateway__button payment-gateway__button--pay"
            disabled={!paymentMethod}
          >
            Pay {formattedPrice}
          </button>
        </div>
      </form>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="payment-gateway__processing">
      <div className="payment-gateway__processing-icon">⏳</div>
      <h2 className="payment-gateway__processing-title">Processing Payment</h2>
      <p className="payment-gateway__processing-text">
        Please wait while we process your payment...
      </p>
      <div className="payment-gateway__loading">
        <div className="payment-gateway__loading-bar"></div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="payment-gateway__success">
      <div className="payment-gateway__success-icon">✅</div>
      <h2 className="payment-gateway__success-title">Payment Successful!</h2>
      <p className="payment-gateway__success-text">
        Your payment has been processed successfully. You will receive your game time code shortly.
      </p>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case 'payment':
        return renderPaymentStep();
      case 'processing':
        return renderProcessingStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderPaymentStep();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === 'processing' ? () => {} : onCancel}
      size="md"
      closeOnOverlayClick={step !== 'processing'}
      closeOnEscape={step !== 'processing'}
    >
      <div className={`payment-gateway ${className}`}>
        {renderContent()}
      </div>
    </Modal>
  );
};