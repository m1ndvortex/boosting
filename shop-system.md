# Shop System - Game Time Sales

## 📦 Overview
The Shop tab allows users to purchase game time (subscriptions) for various games. Users can pay using their wallet balance or directly via online payment methods.

---

## 🛒 Shop Features

### What's Sold in Shop
- **Game Time** - Subscription time for games
  - World of Warcraft: 30 days, 60 days, 90 days
  - Other games: Various subscription periods
- **Game Subscriptions**
- **Game Time Cards**

### Payment Options
Users can choose:
1. **Pay from Wallet** - Use existing wallet balance (Gold, USD, Toman)
2. **Pay Online** - Direct payment via payment gateway (Credit Card, Crypto, etc.)

---

## 👤 User Experience (Client Dashboard)

### Shop Tab Interface

```
┌────────────────────────────────────────────────────────┐
│ 🛒 Shop - Game Time                                    │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Game: [World of Warcraft ▼]                           │
│                                                         │
│ Available Products:                                    │
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 📅 WoW - 30 Days Game Time                       │  │
│ │                                                   │  │
│ │ Price: 500 Gold / $15 USD / 750,000 Toman       │  │
│ │                                                   │  │
│ │ [Buy with Wallet] [Buy with Card]               │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 📅 WoW - 60 Days Game Time                       │  │
│ │                                                   │  │
│ │ Price: 950 Gold / $28 USD / 1,400,000 Toman     │  │
│ │                                                   │  │
│ │ [Buy with Wallet] [Buy with Card]               │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 📅 WoW - 90 Days Game Time                       │  │
│ │                                                   │  │
│ │ Price: 1,350 Gold / $40 USD / 2,000,000 Toman   │  │
│ │                                                   │  │
│ │ [Buy with Wallet] [Buy with Card]               │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## 💳 Purchase Flow

### Option 1: Pay with Wallet

```
User clicks "Buy with Wallet"
    ↓
Select currency (Gold/USD/Toman)
    ↓
Check wallet balance
    ↓
✅ Sufficient balance:
    ↓
Confirm purchase
    ↓
Deduct from wallet
    ↓
Create shop order
    ↓
Send game time code to user
    ↓
User receives email with code
    ↓
Purchase complete

❌ Insufficient balance:
    ↓
Show error: "Insufficient balance. Please deposit first."
    ↓
[Deposit Now] button
```

### Option 2: Pay Online (Direct Payment)

```
User clicks "Buy with Card"
    ↓
Select currency (USD/Toman)
    ↓
Redirect to payment gateway
    ↓
User completes payment
    ↓
Payment gateway processes
    ↓
✅ Payment successful:
    ↓
Create shop order
    ↓
Send game time code to user
    ↓
User receives email with code
    ↓
Purchase complete

❌ Payment failed:
    ↓
Show error message
    ↓
User can retry
```

---

## 👑 Admin Dashboard - Shop Management

### Shop Management Interface

```
┌────────────────────────────────────────────────────────┐
│ Admin Dashboard > Shop Management                      │
├────────────────────────────────────────────────────────┤
│                                                         │
│ [+ Add New Product]                                    │
│                                                         │
│ Products List:                                         │
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ WoW - 30 Days Game Time                          │  │
│ │ Game: World of Warcraft                          │  │
│ │ Duration: 30 days                                │  │
│ │ Price: 500 Gold / $15 USD / 750,000 Toman       │  │
│ │ Status: Active                                   │  │
│ │ Stock: Unlimited                                 │  │
│ │                                                   │  │
│ │ [Edit] [Deactivate] [Delete]                    │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ WoW - 60 Days Game Time                          │  │
│ │ Game: World of Warcraft                          │  │
│ │ Duration: 60 days                                │  │
│ │ Price: 950 Gold / $28 USD / 1,400,000 Toman     │  │
│ │ Status: Active                                   │  │
│ │ Stock: Unlimited                                 │  │
│ │                                                   │  │
│ │ [Edit] [Deactivate] [Delete]                    │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Add/Edit Product Form

```
┌────────────────────────────────────────────────────────┐
│ Add New Shop Product                                   │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Product Type: [Game Time ▼]                           │
│                                                         │
│ Game: [World of Warcraft ▼]                           │
│                                                         │
│ Product Name: [WoW - 30 Days Game Time]               │
│                                                         │
│ Description:                                           │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 30 days of World of Warcraft game time          │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Duration: [30] days                                    │
│                                                         │
│ Pricing:                                               │
│ Gold:  [500]                                           │
│ USD:   [15]                                            │
│ Toman: [750000]                                        │
│                                                         │
│ Stock Management:                                      │
│ ○ Unlimited                                            │
│ ○ Limited: [___] units                                 │
│                                                         │
│ Status: ☑ Active                                       │
│                                                         │
│ [Save Product] [Cancel]                                │
└────────────────────────────────────────────────────────┘
```

### Shop Orders Management

```
┌────────────────────────────────────────────────────────┐
│ Shop Orders                                            │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Filters: [All ▼] [Today ▼] [Search...]                │
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Order #SH-12345                                  │  │
│ │ User: john@example.com                           │  │
│ │ Product: WoW - 30 Days Game Time                 │  │
│ │ Price: $15 USD                                   │  │
│ │ Payment: Online (Credit Card)                    │  │
│ │ Status: Completed                                │  │
│ │ Date: 2025-01-15 10:30 AM                        │  │
│ │                                                   │  │
│ │ [View Details] [Resend Code]                     │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### ShopProduct Table
```sql
CREATE TABLE shop_products (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    product_type VARCHAR(50), -- 'game_time', 'subscription', etc.
    name VARCHAR(200),
    description TEXT,
    duration_days INTEGER, -- For game time products
    
    -- Multi-currency pricing
    price_gold DECIMAL(15, 2),
    price_usd DECIMAL(15, 2),
    price_toman DECIMAL(15, 0),
    
    -- Stock management
    stock_type VARCHAR(20), -- 'unlimited', 'limited'
    stock_quantity INTEGER NULL, -- NULL if unlimited
    stock_available INTEGER NULL, -- Current available stock
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id)
);
```

### ShopOrder Table
```sql
CREATE TABLE shop_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE, -- SH-12345
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES shop_products(id),
    
    -- Payment details
    price_paid DECIMAL(15, 2),
    currency_used VARCHAR(10), -- 'gold', 'usd', 'toman'
    payment_method VARCHAR(50), -- 'wallet', 'credit_card', 'crypto', etc.
    payment_gateway_id VARCHAR(200) NULL, -- Transaction ID from payment gateway
    
    -- Product delivery
    game_time_code VARCHAR(200) NULL, -- Generated code for game time
    delivery_status VARCHAR(20), -- 'pending', 'delivered', 'failed'
    delivered_at TIMESTAMP NULL,
    
    -- Status
    status VARCHAR(20), -- 'pending', 'completed', 'failed', 'refunded'
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Payment Processing

### Wallet Payment
```python
@api_view(['POST'])
def purchase_with_wallet(request):
    user = request.user
    product_id = request.data['product_id']
    currency = request.data['currency']  # 'gold', 'usd', 'toman'
    
    product = ShopProduct.objects.get(id=product_id)
    
    # Get price in selected currency
    price = getattr(product, f'price_{currency}')
    
    # Check wallet balance
    wallet = user.wallet
    balance = getattr(wallet, f'balance_{currency}')
    
    if balance < price:
        return Response({'error': 'Insufficient balance'}, status=400)
    
    # Deduct from wallet
    setattr(wallet, f'balance_{currency}', balance - price)
    wallet.save()
    
    # Create shop order
    order = ShopOrder.objects.create(
        user=user,
        product=product,
        price_paid=price,
        currency_used=currency,
        payment_method='wallet',
        status='completed'
    )
    
    # Generate game time code
    game_time_code = generate_game_time_code(product)
    order.game_time_code = game_time_code
    order.delivery_status = 'delivered'
    order.delivered_at = timezone.now()
    order.save()
    
    # Send email with code
    send_game_time_email(user, order)
    
    return Response({
        'message': 'Purchase successful',
        'order_id': order.id,
        'game_time_code': game_time_code
    })
```

### Online Payment
```python
@api_view(['POST'])
def purchase_with_card(request):
    user = request.user
    product_id = request.data['product_id']
    currency = request.data['currency']  # 'usd', 'toman'
    
    product = ShopProduct.objects.get(id=product_id)
    price = getattr(product, f'price_{currency}')
    
    # Create pending order
    order = ShopOrder.objects.create(
        user=user,
        product=product,
        price_paid=price,
        currency_used=currency,
        payment_method='credit_card',
        status='pending'
    )
    
    # Create payment gateway session
    payment_url = create_payment_session(
        amount=price,
        currency=currency,
        order_id=order.id,
        success_url=f'/api/shop/payment-callback?order_id={order.id}',
        cancel_url='/shop'
    )
    
    return Response({'payment_url': payment_url})

@api_view(['POST'])
def payment_callback(request):
    """Called by payment gateway after successful payment"""
    order_id = request.GET.get('order_id')
    order = ShopOrder.objects.get(id=order_id)
    
    # Verify payment with gateway
    if verify_payment(order):
        # Generate game time code
        game_time_code = generate_game_time_code(order.product)
        order.game_time_code = game_time_code
        order.status = 'completed'
        order.delivery_status = 'delivered'
        order.delivered_at = timezone.now()
        order.save()
        
        # Send email with code
        send_game_time_email(order.user, order)
        
        return Response({'message': 'Purchase successful'})
    else:
        order.status = 'failed'
        order.save()
        return Response({'error': 'Payment verification failed'}, status=400)
```

---

## 📧 Email Delivery

### Game Time Code Email
```
Subject: Your World of Warcraft Game Time Code

Hi John,

Thank you for your purchase!

Product: WoW - 30 Days Game Time
Order #: SH-12345
Price: $15 USD

Your Game Time Code:
XXXX-XXXX-XXXX-XXXX

How to redeem:
1. Log in to Battle.net
2. Go to Account Settings
3. Click "Redeem Code"
4. Enter the code above

Your game time will be added immediately.

Questions? Contact our support team.

Thank you!
```

---

## 🎯 Admin Features

### Shop Management
- ✅ Add new products
- ✅ Edit product details
- ✅ Set prices in multiple currencies
- ✅ Activate/Deactivate products
- ✅ Delete products
- ✅ Manage stock (unlimited or limited)
- ✅ Set sort order

### Order Management
- ✅ View all shop orders
- ✅ Filter by status, date, user
- ✅ View order details
- ✅ Resend game time codes
- ✅ Refund orders (if needed)
- ✅ View payment method used

### Analytics
- ✅ Total shop revenue
- ✅ Best-selling products
- ✅ Revenue by payment method
- ✅ Revenue by currency

---

## 📊 User Purchase History

### My Purchases Tab (Client Dashboard)
```
┌────────────────────────────────────────────────────────┐
│ My Shop Purchases                                      │
├────────────────────────────────────────────────────────┤
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Order #SH-12345                                  │  │
│ │ Product: WoW - 30 Days Game Time                 │  │
│ │ Price: $15 USD                                   │  │
│ │ Payment: Credit Card                             │  │
│ │ Date: 2025-01-15                                 │  │
│ │ Status: Delivered                                │  │
│ │                                                   │  │
│ │ Code: XXXX-XXXX-XXXX-XXXX                        │  │
│ │                                                   │  │
│ │ [View Details] [Copy Code]                       │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## 🔐 Security

### Payment Security
- ✅ Wallet payments: Instant, secure
- ✅ Online payments: PCI DSS compliant gateway
- ✅ Game time codes: Unique, one-time use
- ✅ Email delivery: Secure, encrypted

### Fraud Prevention
- ✅ Limit purchases per user per day
- ✅ Verify payment before code generation
- ✅ Track suspicious activity
- ✅ Admin can refund if needed

---

## 📝 API Endpoints

### Client Endpoints
```
GET  /api/shop/products              - List available products
GET  /api/shop/products/:id          - Product details
POST /api/shop/purchase/wallet       - Purchase with wallet
POST /api/shop/purchase/card         - Purchase with card
GET  /api/shop/my-orders             - User's purchase history
GET  /api/shop/orders/:id            - Order details
```

### Admin Endpoints
```
GET    /api/admin/shop/products      - List all products
POST   /api/admin/shop/products      - Create product
PUT    /api/admin/shop/products/:id  - Update product
DELETE /api/admin/shop/products/:id  - Delete product
GET    /api/admin/shop/orders        - All shop orders
POST   /api/admin/shop/orders/:id/resend - Resend code
POST   /api/admin/shop/orders/:id/refund - Refund order
```

---

## 🎯 Summary

### For Users:
- Browse game time products
- Choose payment method (wallet or card)
- Instant delivery of game time code
- View purchase history

### For Admins:
- Manage shop products
- Set prices in multiple currencies
- View all orders
- Resend codes if needed
- Track revenue

### Payment Options:
- **Wallet**: Use existing balance (Gold, USD, Toman)
- **Online**: Direct payment via gateway (Credit Card, Crypto)

---

**Status:** ✅ Shop system documented and ready for implementation
