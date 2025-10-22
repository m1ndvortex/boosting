# Order Completion System - Quick Summary

## 🎯 Key Points

### Booster Workflow
1. ✅ Get assigned to order
2. ✅ Mark as "In Progress"
3. ✅ Complete the boost
4. ✅ Upload evidence/screenshot
5. ✅ Submit for review
6. ⏳ Wait for approval
7. 💰 Get paid when approved

### Booster CANNOT:
- ❌ Mark order as complete
- ❌ Approve their own work
- ❌ Release payment to themselves

### Who Can Approve Orders:
- ✅ Admin (any order)
- ✅ Support (any order)
- ✅ Advertiser (their own services only)
- ✅ Team Advertiser (their services + team services)

---

## 📸 Evidence System

### What Boosters Upload:
- Screenshot/image showing completion
- Completion notes
- Proof of service delivery

### Image Requirements:
- Format: PNG, JPG, JPEG
- Max size: 10MB
- Must show clear proof of completion

### Storage:
- Stored securely (S3 or local)
- Linked to order
- Accessible by reviewers
- Kept for 30 days

---

## 💰 Payment Flow

### Before Approval:
```
Buyer paid: 500 Gold
Platform holding: 500 Gold
Booster wallet: 0 Gold (waiting)
```

### After Approval:
```
Platform releases: 500 Gold
Booster wallet: +500 Gold
```

### If Rejected:
```
Platform still holding: 500 Gold
Booster must resubmit evidence
```

---

## 📊 Order Statuses

| Status | Description | Who Can Set |
|--------|-------------|-------------|
| `pending` | Order created | System |
| `assigned` | Booster assigned | Advertiser/Team Advertiser |
| `in_progress` | Booster working | Booster |
| `evidence_submitted` | Proof uploaded | Booster |
| `under_review` | Being reviewed | System |
| `completed` | Approved & paid | Admin/Support/Advertiser |
| `rejected` | Evidence rejected | Admin/Support/Advertiser |
| `cancelled` | Order cancelled | Admin/Buyer |
| `disputed` | Dispute raised | Buyer/Admin |

---

## 🗄️ Database Tables

### orders
```sql
- status (pending/assigned/in_progress/evidence_submitted/under_review/completed/rejected/cancelled/disputed)
- evidence_submitted_at
- reviewed_by (who approved)
- reviewed_at
```

### order_evidence
```sql
- order_id
- uploaded_by (booster)
- image_url
- notes
- review_status (pending/approved/rejected)
- reviewed_by
- review_notes (rejection reason)
```

---

## 🔄 Complete Flow Diagram

```
Buyer purchases service
    ↓
Order created (status: pending)
    ↓
Advertiser assigns booster
    ↓
Order status: assigned
    ↓
Booster starts work
    ↓
Order status: in_progress
    ↓
Booster completes boost
    ↓
Booster uploads screenshot + notes
    ↓
Order status: evidence_submitted
    ↓
Notification sent to reviewers
    ↓
Admin/Support/Advertiser reviews
    ↓
Order status: under_review
    ↓
    ├─ APPROVED ─────────────┐
    │                         ↓
    │                  Order status: completed
    │                         ↓
    │                  Payment released to booster
    │                         ↓
    │                  All parties notified
    │
    └─ REJECTED ─────────────┐
                             ↓
                      Order status: rejected
                             ↓
                      Booster notified with reason
                             ↓
                      Booster uploads new evidence
                             ↓
                      Back to review
```

---

## 📝 API Endpoints

### Booster Endpoints
```
POST /api/orders/:id/start              - Mark as "In Progress"
POST /api/orders/:id/upload-evidence    - Upload screenshot
POST /api/orders/:id/submit-review      - Submit for review
GET  /api/orders/my-orders              - View assigned orders
```

### Reviewer Endpoints
```
GET  /api/orders/pending-review         - Orders awaiting review
GET  /api/orders/:id/evidence           - View evidence
POST /api/orders/:id/approve            - Approve & complete
POST /api/orders/:id/reject             - Reject with reason
```

---

**Status:** ✅ Order completion system documented
