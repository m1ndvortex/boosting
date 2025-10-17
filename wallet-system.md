# Wallet System Specification

## Overview
Enterprise-grade multi-currency wallet system supporting Gold (in-game currency), USD, and Toman with conversion capabilities and admin-controlled financial transactions.

---

## Multi-Currency Support

### Supported Currencies

#### 1. Gold
- **Type:** In-game currency
- **Use Case:** Primary currency for gaming services
- **Decimal Places:** 2
- **Symbol:** G

#### 2. USD
- **Type:** US Dollar
- **Use Case:** International payments
- **Decimal Places:** 2
- **Symbol:** $

#### 3. Toman
- **Type:** Iranian Rial
- **Use Case:** Local Iranian payments
- **Decimal Places:** 0
- **Symbol:** ﷼

---

## Wallet Structure

### User Wallet
Each registered user has ONE wallet with three balance fields:

```json
{
  "user_id": 123,
  "balance_gold": 1500.50,
  "balance_usd": 250.00,
  "balance_toman": 5000000,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### Wallet Operations
- **Deposit**: Add funds to wallet (requires admin approval)
- **Withdrawal**: Remove funds from wallet (requires admin approval)
- **Conversion**: Convert between currencies (instant)
- **Purchase**: Deduct funds for service purchase (instant)
- **Refund**: Return funds for cancelled orders (instant)

---

## Currency Conversion System

### Exchange Rates

#### Rate Management (Admin Only)
Admins define and update exchange rates for all currency pairs:

```json
{
  "rates": [
    {
      "from": "gold",
      "to": "usd",
      "rate": 0.10,
      "updated_at": "2025-01-15T10:00:00Z"
    },
    {
      "from": "usd",
      "to": "toman",
      "rate": 50000,
      "updated_at": "2025-01-15T10:00:00Z"
    },
    {
      "from": "gold",
      "to": "toman",
      "rate": 5000,
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### Conversion Pairs
- Gold ↔ USD
- USD ↔ Toman
- Gold ↔ Toman

#### Rate Updates
- Admin can update rates anytime
- New rates apply immediately to future conversions
- Historical conversions retain original rate

### Conversion Process

#### User Flow
1. User selects source currency and amount
2. System displays current exchange rate
3. System calculates target amount
4. User confirms conversion
5. Balances updated instantly
6. Conversion recorded in transaction history

#### Example Conversion
```
User wants to convert 100 Gold to USD
Current rate: 1 Gold = 0.10 USD

Calculation:
100 Gold × 0.10 = 10 USD

Result:
- balance_gold: 1500.50 → 1400.50 (-100)
- balance_usd: 250.00 → 260.00 (+10)
```

#### Conversion Rules
- Minimum conversion amount: Configurable per currency
- No conversion fees (can be added later)
- Instant processing (no approval needed)
- Cannot convert if insufficient balance
- Conversion history tracked

---

## Payment Methods

### Supported Payment Methods

#### 1. Credit Card (International)
**Details Stored:**
- Card type (Visa, Mastercard, etc.)
- Last 4 digits
- Expiry date
- Cardholder name
- Billing address

**Use Cases:**
- Deposits in USD
- International users

**Verification:**
- Card verification required
- Small charge + refund for verification

#### 2. Crypto Wallet
**Details Stored:**
- Wallet address
- Cryptocurrency type (Bitcoin, Ethereum, USDT, etc.)
- QR code (generated)

**Use Cases:**
- Deposits in USD (converted from crypto)
- Anonymous payments

**Verification:**
- Test transaction required
- Wallet ownership proof

#### 3. Iranian Bank Card
**Details Stored:**
- Card number (last 4 digits)
- Bank name
- Account holder name
- IBAN (optional)

**Use Cases:**
- Deposits in Toman
- Withdrawals in Toman
- Iranian users

**Verification:**
- Bank account verification
- ID verification

### Payment Method Management

#### Add Payment Method
1. User selects payment method type
2. User enters payment details
3. System validates format
4. Verification process initiated
5. Status: "Pending Verification"
6. Admin/System verifies
7. Status: "Verified"

#### Security
- Payment details encrypted at rest
- PCI DSS compliance for credit cards
- Sensitive data never logged
- Two-factor authentication for changes

---

## Deposit System

### Deposit Workflow

#### Step 1: User Initiates Deposit
**User Actions:**
- Click "Deposit" button
- Select payment method
- Enter amount
- Select currency (Gold/USD/Toman)
- Proceed to payment

#### Step 2: Payment Processing
**System Actions:**
- Redirect to payment gateway (Stripe, PayPal, etc.)
- User completes payment
- Payment gateway processes transaction
- Payment gateway returns result

#### Step 3: Instant Update
**If Payment Successful:**
- Create transaction record
- Status: "Completed"
- Update wallet balance immediately
- Send confirmation email to user
- No admin approval needed

**If Payment Failed:**
- Transaction status: "Failed"
- Display error message to user
- No balance change
- User can try again

### Deposit Limits
**Configurable by Admin:**
- Minimum deposit amount per currency
- Maximum deposit amount per transaction
- Daily deposit limit per user
- Monthly deposit limit per user

**Example Limits:**
```json
{
  "gold": {
    "min": 10,
    "max": 10000,
    "daily_limit": 50000,
    "monthly_limit": 200000
  },
  "usd": {
    "min": 5,
    "max": 1000,
    "daily_limit": 5000,
    "monthly_limit": 20000
  },
  "toman": {
    "min": 100000,
    "max": 50000000,
    "daily_limit": 200000000,
    "monthly_limit": 1000000000
  }
}
```

---

## Withdrawal System

### Withdrawal Workflow

#### Step 1: User Initiates Withdrawal
**User Actions:**
- Click "Withdraw" button
- Select currency
- Enter amount
- Select payment method (must be verified)
- Submit request

**Validation:**
- Sufficient balance check
- Minimum withdrawal amount
- Daily/monthly limit check
- Payment method verified

#### Step 2: Pending Approval
**System Actions:**
- Create withdrawal transaction
- Deduct amount from available balance (hold)
- Status: "Pending"
- Notify admins

#### Step 3: Admin Review
**Admin Actions:**
- View pending withdrawals
- Verify user identity
- Check for fraud indicators
- Process payment
- Approve or Reject

#### Step 4: Processing
**If Approved:**
- Process payment to user's payment method
- Transaction status: "Approved"
- Funds transferred
- Send confirmation to user

**If Rejected:**
- Transaction status: "Rejected"
- Return held amount to available balance
- Add rejection reason
- Notify user

### Withdrawal Limits
**Configurable by Admin:**
- Minimum withdrawal amount
- Maximum withdrawal per transaction
- Daily withdrawal limit
- Monthly withdrawal limit
- Withdrawal fees (optional)

**Example Limits:**
```json
{
  "gold": {
    "min": 50,
    "max": 5000,
    "daily_limit": 10000,
    "monthly_limit": 50000,
    "fee_percentage": 0
  },
  "usd": {
    "min": 10,
    "max": 500,
    "daily_limit": 1000,
    "monthly_limit": 5000,
    "fee_percentage": 2.5
  },
  "toman": {
    "min": 500000,
    "max": 20000000,
    "daily_limit": 50000000,
    "monthly_limit": 200000000,
    "fee_percentage": 0
  }
}
```

---

## Transaction Types

### 1. Deposit
- **Description:** Add funds to wallet
- **Requires Approval:** Yes
- **Affects Balance:** Increases
- **Reversible:** No (after approval)

### 2. Withdrawal
- **Description:** Remove funds from wallet
- **Requires Approval:** Yes
- **Affects Balance:** Decreases
- **Reversible:** Yes (before approval)

### 3. Conversion
- **Description:** Convert between currencies
- **Requires Approval:** No
- **Affects Balance:** Both currencies
- **Reversible:** No

### 4. Purchase
- **Description:** Buy service
- **Requires Approval:** No
- **Affects Balance:** Decreases
- **Reversible:** Yes (refund)

### 5. Refund
- **Description:** Return funds for cancelled order
- **Requires Approval:** No (automatic)
- **Affects Balance:** Increases
- **Reversible:** No

### 6. Earning
- **Description:** Receive payment for service (advertiser/booster)
- **Requires Approval:** No (automatic)
- **Affects Balance:** Increases
- **Reversible:** No

---

## Transaction History

### Transaction Record
```json
{
  "transaction_number": "TXN-2025-001234",
  "wallet_id": 123,
  "type": "deposit",
  "amount": 100.00,
  "currency": "usd",
  "status": "approved",
  "payment_method": "credit_card",
  "payment_details": {
    "card_last4": "1234",
    "card_type": "visa"
  },
  "admin_notes": "Verified payment received",
  "approved_by": 1,
  "approved_at": "2025-01-15T11:00:00Z",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

### Transaction Statuses
- **Pending:** Awaiting admin approval
- **Approved:** Approved and processed
- **Rejected:** Rejected by admin
- **Completed:** Successfully completed
- **Failed:** Processing failed
- **Cancelled:** Cancelled by user (before approval)

### User View
Users can view their transaction history with:
- Transaction number
- Type
- Amount and currency
- Status
- Date
- Admin notes (if any)

### Filters
- Date range
- Transaction type
- Currency
- Status

---

## Security & Fraud Prevention

### Security Measures
1. **Two-Factor Authentication**
   - Required for withdrawals
   - Optional for deposits

2. **Payment Method Verification**
   - All payment methods must be verified
   - Identity verification for large amounts

3. **Transaction Limits**
   - Daily and monthly limits
   - Configurable per user/role

4. **Admin Approval**
   - All deposits require approval
   - All withdrawals require approval
   - Prevents unauthorized transactions

5. **Encryption**
   - Payment details encrypted at rest
   - SSL/TLS for data in transit

6. **Audit Logs**
   - All transactions logged
   - Admin actions tracked
   - IP address recorded

### Fraud Detection
- Unusual transaction patterns
- Multiple failed attempts
- Rapid deposit/withdrawal cycles
- Mismatched payment methods
- Flagged users

---

## Admin Financial Dashboard

### Pending Transactions
**Display:**
- Transaction number
- User name
- Type (Deposit/Withdrawal)
- Amount and currency
- Payment method
- Requested date
- Actions (Approve, Reject, View Details)

### Withdrawal Details Modal
- Full withdrawal information
- User profile link
- Payment method details
- User's transaction history
- Fraud indicators
- Approve/Reject buttons
- Admin notes field

### Deposit History (View Only)
- Completed deposits
- Payment gateway transaction IDs
- No approval actions (already processed)

### Financial Reports
1. **Transaction Volume**
   - Total deposits (by currency) - All completed
   - Total withdrawals (by currency)
   - Net flow

2. **Pending Withdrawals**
   - Count of pending withdrawals
   - Total amount pending withdrawal

3. **User Balances**
   - Total platform balance (by currency)
   - Top users by balance

4. **Revenue**
   - Platform fees collected
   - Payment gateway fees

### Exchange Rate Management
- View current rates
- Update rates
- Rate history
- Rate change notifications

---

## API Endpoints

### Wallet Endpoints
```
GET    /api/wallet                    - Get user wallet
GET    /api/wallet/transactions       - Get transaction history
POST   /api/wallet/deposit/initiate   - Initiate deposit (get payment gateway URL)
POST   /api/wallet/deposit/callback   - Payment gateway callback (process deposit)
POST   /api/wallet/withdraw           - Request withdrawal (requires admin approval)
POST   /api/wallet/convert            - Convert currency
GET    /api/wallet/exchange-rates     - Get current rates
```

### Payment Method Endpoints
```
GET    /api/payment-methods           - List payment methods
POST   /api/payment-methods           - Add payment method
PUT    /api/payment-methods/:id       - Update payment method
DELETE /api/payment-methods/:id       - Remove payment method
POST   /api/payment-methods/:id/verify - Verify payment method
```

### Admin Endpoints
```
GET    /api/admin/withdrawals/pending         - Pending withdrawals
PUT    /api/admin/withdrawals/:id/approve     - Approve withdrawal
PUT    /api/admin/withdrawals/:id/reject      - Reject withdrawal
GET    /api/admin/deposits/history            - View deposit history (completed)
GET    /api/admin/exchange-rates              - Get exchange rates
PUT    /api/admin/exchange-rates              - Update exchange rates
GET    /api/admin/financial-reports           - Financial reports
```

---

## Database Schema

### Wallet Table
```sql
CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    balance_gold DECIMAL(15, 2) DEFAULT 0,
    balance_usd DECIMAL(15, 2) DEFAULT 0,
    balance_toman DECIMAL(15, 0) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Transaction Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(50) UNIQUE,
    wallet_id INTEGER REFERENCES wallets(id),
    type VARCHAR(20), -- deposit, withdrawal, conversion, purchase, refund
    amount DECIMAL(15, 2),
    currency VARCHAR(10), -- gold, usd, toman
    status VARCHAR(20), -- pending, approved, rejected, completed
    payment_method VARCHAR(50),
    payment_details JSONB, -- encrypted
    admin_notes TEXT,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Exchange Rate Table
```sql
CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    from_currency VARCHAR(10),
    to_currency VARCHAR(10),
    rate DECIMAL(15, 6),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(from_currency, to_currency)
);
```

---

## Implementation Notes

### Django Models
```python
from django.db import models
from django.contrib.auth.models import User

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance_gold = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    balance_usd = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    balance_toman = models.DecimalField(max_digits=15, decimal_places=0, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def get_balance(self, currency):
        return getattr(self, f'balance_{currency}')
    
    def update_balance(self, currency, amount):
        current = self.get_balance(currency)
        setattr(self, f'balance_{currency}', current + amount)
        self.save()
```

### Conversion Logic
```python
def convert_currency(wallet, from_currency, to_currency, amount):
    # Get exchange rate
    rate = ExchangeRate.objects.get(
        from_currency=from_currency,
        to_currency=to_currency,
        is_active=True
    )
    
    # Calculate converted amount
    converted_amount = amount * rate.rate
    
    # Update balances
    wallet.update_balance(from_currency, -amount)
    wallet.update_balance(to_currency, converted_amount)
    
    # Record transaction
    Transaction.objects.create(
        wallet=wallet,
        type='conversion',
        amount=amount,
        currency=from_currency,
        status='completed',
        # ... other fields
    )
    
    return converted_amount
```
