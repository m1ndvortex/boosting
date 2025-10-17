# Order Completion Flow

## 📋 Complete Order Workflow

### Overview
Orders go through multiple stages before completion and payment. Boosters cannot mark orders complete themselves - they must upload evidence and wait for approval.

---

## 🔄 Order Status Flow

```
1. Pending
   ↓
2. Assigned to Booster
   ↓
3. In Progress (Booster working)
   ↓
4. Evidence Submitted (Booster uploads proof)
   ↓
5. Under Review (Admin/Support/Advertiser reviewing)
   ↓
6. Completed (Approved) → Payment Released
   OR
   Rejected → Booster must resubmit
```

---

## 👤 Step-by-Step Process

### Step 1: Order Created
**Who:** Buyer purchases service  
**Status:** `Pending`

```
Order #12345
Service: Mythic+20 Boost
Buyer: john@example.com
Price: 500 Gold
Status: Pending
```

---

### Step 2: Booster Assigned
**Who:** Advertiser or Team Advertiser assigns booster  
**Status:** `Assigned`

```
Order #12345
Assigned to: Mike (Booster)
Status: Assigned
```

**Booster receives notification:**
- "You have been assigned to Order #12345"
- Can view order details
- Can start working

---

### Step 3: Booster Starts Work
**Who:** Booster  
**Status:** `In Progress`

**Booster actions:**
- Click "Start Order"
- Status changes to "In Progress"
- Buyer can see booster is working

```
Order #12345
Status: In Progress
Started: 2 hours ago
Booster: Mike
```

---

### Step 4: Booster Uploads Evidence
**Who:** Booster  
**Status:** `Evidence Submitted`

**After completing the boost, booster must:**
1. Upload screenshot/image as proof
2. Add completion notes
3. Submit for review

**Evidence Upload Interface:**
```
┌────────────────────────────────────────────────┐
│ Order #12345 - Mythic+20 Boost                │
├────────────────────────────────────────────────┤
│                                                 │
│ Upload Evidence:                               │
│ [📷 Upload Screenshot] (Required)              │
│                                                 │
│ Uploaded: screenshot_mythic20.png              │
│ [View Image]                                   │
│                                                 │
│ Completion Notes:                              │
│ ┌─────────────────────────────────────────┐   │
│ │ Completed +20 Necrotic Wake in time.    │   │
│ │ Got 3 items for buyer.                  │   │
│ │ Buyer was happy with service.           │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ [Submit for Review]                            │
└────────────────────────────────────────────────┘
```

**After submission:**
- Status: `Evidence Submitted`
- Booster cannot edit anymore
- Notification sent to reviewers

---

### Step 5: Review Process
**Who:** Admin, Support, Advertiser (who created service), or Team Advertiser  
**Status:** `Under Review`

**Reviewers can:**
- View uploaded evidence/screenshot
- Read completion notes
- Check if boost was done correctly
- Approve or Reject

**Review Interface:**
```
┌────────────────────────────────────────────────┐
│ Order #12345 - Review                         │
├────────────────────────────────────────────────┤
│                                                 │
│ Service: Mythic+20 Boost                       │
│ Booster: Mike                                  │
│ Buyer: john@example.com                        │
│ Price: 500 Gold                                │
│                                                 │
│ Evidence:                                      │
│ [📷 View Screenshot]                           │
│                                                 │
│ Booster Notes:                                 │
│ "Completed +20 Necrotic Wake in time.         │
│  Got 3 items for buyer."                      │
│                                                 │
│ Reviewer Actions:                              │
│ [✅ Approve & Complete] [❌ Reject]            │
│                                                 │
│ If rejecting, add reason:                      │
│ ┌─────────────────────────────────────────┐   │
│ │ Screenshot doesn't show completion      │   │
│ └─────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
```

---

### Step 6A: Approved - Order Completed
**Who:** Admin, Support, Advertiser, or Team Advertiser  
**Status:** `Completed`

**When approved:**
1. Order marked as `Completed`
2. Payment released to booster's wallet
3. Buyer notified
4. Booster notified
5. Order closed

**Payment Distribution:**
```
Order #12345 - Completed
Price: 500 Gold

Payment Distribution:
→ Booster (Mike): 500 Gold added to wallet

Notifications sent:
✅ Booster: "Order completed! 500 Gold added to your wallet"
✅ Buyer: "Your order has been completed"
✅ Advertiser: "Order completed successfully"
```

---

### Step 6B: Rejected - Needs Resubmission
**Who:** Admin, Support, Advertiser, or Team Advertiser  
**Status:** `Rejected`

**When rejected:**
1. Order status: `Rejected`
2. Rejection reason shown to booster
3. Booster must fix and resubmit
4. No payment released

**Rejection Notification:**
```
Order #12345 - Rejected

Reason: Screenshot doesn't show completion clearly.
Please upload a better screenshot showing the dungeon completion screen.

[Upload New Evidence]
```

**Booster can:**
- Upload new evidence
- Add more notes
- Resubmit for review

---

## 👥 Who Can Approve Orders?

### Admin
- ✅ Can approve ANY order
- ✅ Full access to all orders
- ✅ Can override any decision

### Support
- ✅ Can approve ANY order
- ✅ Helps with order disputes
- ✅ Reviews evidence quality

### Advertiser
- ✅ Can approve orders for THEIR services only
- ✅ Reviews their own service quality
- ❌ Cannot approve other advertisers' orders

### Team Advertiser
- ✅ Can approve orders for THEIR services
- ✅ Can approve orders for TEAM services
- ✅ Reviews team member work

### Booster
- ❌ Cannot approve orders
- ❌ Cannot mark as complete
- ✅ Can only upload evidence and submit

---

## 💰 Payment Flow

### Before Approval
```
Order Price: 500 Gold
Status: Evidence Submitted

Buyer's wallet: -500 Gold (already paid)
Platform holding: 500 Gold
Booster's wallet: No change (waiting)
```

### After Approval
```
Order Price: 500 Gold
Status: Completed

Platform releases: 500 Gold
Booster's wallet: +500 Gold
```

### If Rejected
```
Order Price: 500 Gold
Status: Rejected

Platform still holding: 500 Gold
Booster's wallet: No change (must resubmit)
```

---

## 📸 Evidence/Image Management

### Image Upload Requirements

**Accepted Formats:**
- PNG, JPG, JPEG
- Max size: 10MB
- Min resolution: 800x600

**What to Upload:**
- Screenshot showing completion
- In-game achievement screen
- Dungeon/raid completion screen
- Character level-up screen
- Any proof of service completion

**Storage:**
- Images stored securely
- Linked to order ID
- Accessible by reviewers
- Kept for 30 days after completion

### Image Upload API
```python
@api_view(['POST'])
@require_role('booster')
def upload_order_evidence(request, order_id):
    booster = request.user
    order = Order.objects.get(id=order_id)
    
    # Verify booster is assigned to this order
    if order.booster_id != booster.id:
        return Response({'error': 'Not your order'}, status=403)
    
    # Verify order status
    if order.status not in ['assigned', 'in_progress']:
        return Response({'error': 'Cannot upload evidence for this order'}, status=400)
    
    # Upload image
    image = request.FILES['evidence_image']
    notes = request.data.get('notes', '')
    
    # Save evidence
    evidence = OrderEvidence.objects.create(
        order=order,
        uploaded_by=booster,
        image=image,
        notes=notes
    )
    
    # Update order status
    order.status = 'evidence_submitted'
    order.save()
    
    # Notify reviewers
    notify_reviewers_evidence_submitted(order)
    
    return Response({
        'message': 'Evidence uploaded successfully',
        'evidence_id': evidence.id
    })
```

---

## 🗄️ Database Schema

### OrderEvidence Table
```sql
CREATE TABLE order_evidence (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    uploaded_by INTEGER REFERENCES users(id), -- Booster
    image_url VARCHAR(500), -- S3 or local storage path
    notes TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    reviewed_by INTEGER REFERENCES users(id) NULL, -- Who approved/rejected
    review_status VARCHAR(20), -- 'pending', 'approved', 'rejected'
    review_notes TEXT NULL, -- Rejection reason
    reviewed_at TIMESTAMP NULL
);
```

### Updated Order Table
```sql
ALTER TABLE orders ADD COLUMN status VARCHAR(20);
-- Status values:
-- 'pending' - Just created
-- 'assigned' - Booster assigned
-- 'in_progress' - Booster working
-- 'evidence_submitted' - Waiting for review
-- 'under_review' - Being reviewed
-- 'completed' - Approved and paid
-- 'rejected' - Evidence rejected, needs resubmission
-- 'cancelled' - Order cancelled
-- 'disputed' - Dispute raised
```

---

## 📊 Order Statistics

### For Boosters
- Total orders completed
- Pending review count
- Rejection rate
- Average completion time
- Total earnings

### For Advertisers
- Orders for their services
- Completion rate
- Average review time
- Customer satisfaction

### For Admins
- Total orders
- Pending reviews
- Average approval time
- Rejection reasons (analytics)

---

## 🎯 Summary

### Booster Workflow
1. Get assigned to order
2. Start working (mark "In Progress")
3. Complete the boost
4. Upload evidence/screenshot
5. Submit for review
6. Wait for approval
7. Get paid when approved

### Reviewer Workflow
1. Receive notification of evidence submission
2. View order details
3. Check uploaded evidence
4. Read booster notes
5. Approve or Reject
6. If approved: Payment released
7. If rejected: Booster must resubmit

### Key Points
- ✅ Boosters upload evidence, cannot mark complete
- ✅ Approval required from Admin/Support/Advertiser/Team Advertiser
- ✅ Payment released only after approval
- ✅ Evidence stored for accountability
- ✅ Rejection allows resubmission

---

**Status:** ✅ Order completion flow documented
