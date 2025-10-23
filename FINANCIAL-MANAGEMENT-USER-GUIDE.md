# Financial Management - Quick User Guide

## 🚀 Accessing the System

1. Login as admin at http://localhost:5173/admin
2. Click **"💰 Financial Management"** in the sidebar

## 📋 Dashboard Overview

### Statistics Cards (Top of Page)
- **⏳ Pending Withdrawals** - Requires immediate action
- **✅ Completed** - Successfully processed
- **🔄 Processing** - Currently being handled
- **❌ Rejected** - Declined with reason

## 🔍 Finding Withdrawals

### Filter by Status
Use the dropdown menu to show only:
- All Statuses
- Pending Approval
- Processing
- Completed
- Rejected

### Search
Type in the search box to find by:
- User email (e.g., "john.doe@example.com")
- User name (e.g., "John")
- Bank name (e.g., "Chase Bank")
- Account number (last 4 digits)

## 📊 Withdrawal Table Columns

| Column | Description |
|--------|-------------|
| **User Email** | Email of person requesting withdrawal |
| **Amount** | Withdrawal amount with currency |
| **Payment Method** | bank_transfer, paypal, wire_transfer, crypto |
| **Bank Name** | Financial institution name |
| **Account** | Last 4 digits of account (masked for security) |
| **Status** | Current state with color badge |
| **Request Date** | When withdrawal was requested |
| **Actions** | Available operations |

## 🎯 Common Actions

### 1️⃣ View Details
**When:** Any time you want to see complete information

**Steps:**
1. Click **"View"** button on any withdrawal
2. Review all sections:
   - Transaction Information (ID, email, amount, status, date)
   - Bank Information (bank name, account holder, account number, IBAN, SWIFT)
   - Request Notes (user's message)
   - Transaction Evidence (if completed)
   - Rejection Reason (if rejected)
3. Click **"Close"** or use available actions

### 2️⃣ Approve Withdrawal
**When:** Pending approval and ready to process payment

**Steps:**
1. Click **"Approve"** button (or "Approve with Evidence" in detail modal)
2. Evidence modal opens - fill in:
   - **Transaction Code** (required) - Your bank's transaction ID
   - **Bank Transaction ID** (optional) - Additional reference number
   - **Proof Image** (optional) - Upload receipt/proof (max 5MB, JPG/PNG/PDF)
   - **Admin Notes** (optional) - Internal notes about the payment
3. Click **"Submit & Approve"**
4. Status changes to "Completed"
5. User's balance is automatically deducted

**Example:**
```
Transaction Code: TXN-CHASE-2025-10-22-001
Bank Transaction ID: CHASE-REF-789456123
Admin Notes: Wire transfer completed successfully. Customer notified via email.
```

### 3️⃣ Reject Withdrawal
**When:** Cannot process due to verification issues, policy violations, etc.

**Steps:**
1. Click **"Reject"** button
2. Rejection modal opens
3. Enter detailed reason explaining why:
   - Be specific and clear
   - Provide next steps if possible
   - Be professional and helpful
4. Click **"Confirm Rejection"**
5. Status changes to "Rejected"
6. User can see this reason

**Example Reasons:**
- "Insufficient account verification. Please provide valid ID documents before requesting withdrawal."
- "Unable to process international transfers to Iranian banks due to banking restrictions. Please provide an alternative payment method such as cryptocurrency."
- "Withdrawal amount exceeds account balance. Available balance: $150."

### 4️⃣ Set as Processing
**When:** You've started working on it but haven't completed yet

**Steps:**
1. Click **"View"** on pending withdrawal
2. Click **"Set as Processing"** button
3. Status changes to "Processing"
4. This signals to other admins that it's being handled

### 5️⃣ Edit Evidence
**When:** Need to update transaction proof after approval

**Steps:**
1. Click **"Edit Evidence"** on completed withdrawal
2. Evidence modal opens with existing data pre-filled
3. Modify any fields
4. Click **"Update Evidence"**

### 6️⃣ Delete Withdrawal
**When:** User made mistake or wants to cancel (only for pending requests)

**Steps:**
1. Click **"View"** on pending withdrawal
2. Click **"Delete"** button
3. Confirm deletion
4. Withdrawal is permanently removed

**Note:** Cannot delete completed, processing, or rejected withdrawals.

## ⚠️ Important Notes

### Security
- Account numbers are masked in table view (************3456)
- Full account details only visible in detail modal
- Evidence includes admin ID and timestamp for audit trail

### File Uploads
- Maximum file size: 5MB
- Accepted formats: JPG, PNG, PDF
- Files are converted to base64 and stored
- Optional but recommended for proof of payment

### Status Flow
```
Pending Approval
    ↓
Processing (optional)
    ↓
Completed (with evidence)
OR
Rejected (with reason)
```

### Balance Management
- Balance is deducted ONLY when withdrawal is approved
- Rejected withdrawals do NOT affect balance
- Processing status does NOT affect balance yet

## 🎨 Status Badge Colors

| Status | Color | Meaning |
|--------|-------|---------|
| ⏳ Pending Approval | Yellow | Needs action |
| 🔄 Processing | Blue | In progress |
| ✅ Completed | Green | Successfully paid |
| ❌ Rejected | Red | Declined |
| ❗ Failed | Gray | System error |

## 🔧 Troubleshooting

### "No withdrawal requests" showing
- Check if status filter is set correctly
- Clear search box
- Refresh page (click away and back to Financial Management)

### Cannot approve withdrawal
- Verify transaction code is entered
- Check if user has sufficient balance
- Ensure withdrawal is in "pending" status

### File upload not working
- Check file size (max 5MB)
- Verify file type (JPG, PNG, or PDF only)
- Try a different file

## 📞 Quick Reference

| I want to... | Action |
|--------------|--------|
| See all pending withdrawals | Filter: "Pending Approval" |
| Find specific user | Search by email |
| Process payment | Click "Approve" → Add evidence → Submit |
| Decline request | Click "Reject" → Enter reason → Confirm |
| View bank details | Click "View" → See Bank Information section |
| Update transaction proof | Click "Edit Evidence" → Modify → Update |
| Mark as being worked on | Click "View" → "Set as Processing" |

---

**Need Help?** Contact system administrator or refer to FINANCIAL-MANAGEMENT-COMPLETE.md for technical details.
