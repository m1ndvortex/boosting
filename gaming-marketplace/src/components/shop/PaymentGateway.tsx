import React, { useState, useEffect } from 'react';
import type { ShopProduct, Currency } from '../../types';
import { ShopService } from '../../services/shopService';
import { Modal } from '../discord/Modal';
import './PaymentGateway.css';

export interface PaymentGatewayProps {
  isOpen: boolean;
  product: ShopProduct | null;
  currency: Currency;
  onSuccess: () => void;
  onCancel: () => void;
  className?: string;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  isOpen,
  product,
  currency,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('payment');
      setPaymentMethod('');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setHolderName('');
    }
  }, [isOpen]);

  if (!product) return null;

  const price = product.prices[currency];
  const formattedPrice = ShopService.formatCurrency(price, currency);

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
    
    if (!paymentMethod) return;

    setStep('processing');

    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 3000);
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