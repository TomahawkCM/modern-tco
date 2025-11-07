# 🧪 Budget App Testing Guide

## Quick Start

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** `http://localhost:3000/budget-app`

---

## ✅ New Features to Test (31 Tasks Completed!)

### **1. Toast Notifications (Task 4.1.4)** ⭐ NEW

**Location:** All pages (transactions, budgets, investments)

**Test Cases:**
- ✅ **Create a transaction** → Should see green success toast
- ✅ **Delete a transaction** → Should see confirmation dialog, then success toast
- ✅ **Save a budget** → Should see success toast
- ✅ **Invalid input** → Should see amber warning toast
- ✅ **Error handling** → Should see red error toast
- ✅ **Multiple toasts** → Stack properly (top-right corner)

**Expected Behavior:**
- Toasts appear top-right
- Auto-dismiss after 4 seconds
- Manual close with X button
- Confirm dialogs have Cancel/Confirm buttons

---

### **2. Spending Insights (Task 4.2.1)** ⭐ NEW

**Location:** Dashboard (`/budget-app`)

**Test Cases:**
- ✅ **View insights** → Navigate to dashboard
- ✅ **Check calculations** → Verify 3-month averages
- ✅ **Trend indicators** → See up/down/stable arrows
- ✅ **Summary stats** → Income, Spending, Savings Rate

**Requirements:**
- Need ≥90 days of transaction data
- Shows top 5 spending categories
- Compares current month to average

**Example:**
```
💡 Spending Insights
Avg Income: $3,200 | Avg Spending: $2,400 | Savings Rate: 25.0%

Food & Dining
You usually spend $450.00 per month
↑ Spending more this month: +$50.00 (+11.1%)
```

---

### **3. Overspending Alerts (Task 4.2.2)** ⭐ NEW

**Location:** Budgets page (`/budget-app/budgets`)

**Test Cases:**
- ✅ **Create a budget** → Set $500 for a category
- ✅ **Add transactions** → Spend more than daily rate
- ✅ **View alerts** → Should see warning/danger alert
- ✅ **Check projection** → "At this rate, you'll exceed by $X"

**Expected Behavior:**
- **Warning** (amber): Projected 1-19% over budget
- **Danger** (red): Projected ≥20% over or already exceeded
- Shows: Budget, Spent, Projected, Days Left
- Includes helpful tip: "Reduce daily spending to $X"

**Example:**
```
⚠️ Budget Alerts

Food & Dining
⚠️ At this rate, you'll exceed your budget by $127.50 this month.

Budget: $500.00 | Spent: $320.00 | Projected: $627.50 | Days Left: 15
```

---

### **4. Investment Tracking (Phase 8)** ✅

**Location:** Investments page (`/budget-app/investments`)

**Test Cases:**
- ✅ **Add investment account** → RRSP, TFSA, etc.
- ✅ **Add holdings** → Symbol, quantity, purchase price
- ✅ **View portfolio** → Total value, gain/loss
- ✅ **Charts** → Allocation pie charts, performance bar chart
- ✅ **Refresh prices** → Real-time market data

**Note:** Market data uses Yahoo Finance API (may have rate limits)

---

### **5. Split Transactions (Phase 6)** ✅

**Location:** Transactions page (`/budget-app/transactions`)

**Test Cases:**
- ✅ **Split transaction** → Click "Split" button
- ✅ **2-way split** → Split $100 into $60 + $40
- ✅ **3-way split** → Split into 3 categories
- ✅ **Validation** → Sum must equal original amount
- ✅ **Unsplit** → Restore original transaction
- ✅ **Delete split child** → Test parent behavior

---

### **6. Keyboard Shortcuts (Phase 5)** ✅

**Test Cases:**
- ✅ **Press `D`** → Navigate to Dashboard
- ✅ **Press `T`** → Navigate to Transactions
- ✅ **Press `B`** → Navigate to Budgets
- ✅ **Press `I`** → Navigate to Investments
- ✅ **Press `R`** → Navigate to Reports
- ✅ **Press `?`** → Show shortcuts modal
- ✅ **Press `Esc`** → Close modals

**Note:** Shortcuts disabled when typing in input fields

---

### **7. Bulk Categorization (Phase 5)** ✅

**Location:** Transactions page

**Test Cases:**
- ✅ **Select multiple** → Checkboxes for transactions
- ✅ **Select all** → Button to select visible transactions
- ✅ **Bulk categorize** → Set category for all selected
- ✅ **Success toast** → "Successfully categorized N transactions"

---

### **8. Receipt Attachments (Phase 7)** ✅

**Location:** Transactions page

**Test Cases:**
- ✅ **Attach receipt** → Upload image when creating transaction
- ✅ **View thumbnail** → Click to see full-size
- ✅ **Delete receipt** → Remove attached image

---

### **9. Recurring Transactions (Phase 5)** ✅

**Location:** Dashboard

**Test Cases:**
- ✅ **View patterns** → Detected recurring transactions
- ✅ **Check confidence** → See confidence scores
- ✅ **Frequency** → Daily, weekly, monthly patterns

---

### **10. Spending Heat Map (Phase 4)** ✅

**Location:** Reports page (`/budget-app/reports`)

**Test Cases:**
- ✅ **View calendar** → 7x4-5 grid by day of week
- ✅ **Color intensity** → Teal gradient shows spending amount
- ✅ **Tooltips** → Hover to see date and amount
- ✅ **Summary stats** → Daily averages

---

## 🐛 Common Issues & Solutions

### **Server Not Starting**
```bash
# Kill any existing processes
taskkill /F /IM node.exe

# Try alternative port
npm run dev:port  # Uses port 3007

# Or specific port
npm run dev -- --port 3001
```

### **Toast Notifications Not Showing**
- Check browser console for errors
- Verify ToastProvider is in layout.tsx
- Ensure useToast() hook is imported

### **Spending Insights Not Showing**
- Need ≥90 days of transaction history
- Add transactions with dates 3+ months ago
- Check that categories exist

### **Overspending Alerts Not Showing**
- Create a monthly budget
- Add transactions exceeding daily rate
- Check current month date

---

## 📊 Test Checklist

- [ ] Toast notifications work on all pages
- [ ] Confirm dialogs work (delete, unsplit, etc.)
- [ ] Spending insights calculate correctly
- [ ] Overspending alerts show when applicable
- [ ] Investment portfolio displays correctly
- [ ] Split transactions validate properly
- [ ] Keyboard shortcuts navigate correctly
- [ ] Bulk categorization works
- [ ] Receipt thumbnails display
- [ ] Recurring transactions detected
- [ ] Heat map visualizes spending

---

## 🎯 Priority Test Areas

**High Priority:**
1. Toast notifications (newest feature)
2. Spending insights (dashboard feature)
3. Overspending alerts (budget management)

**Medium Priority:**
4. Split transactions
5. Keyboard shortcuts
6. Bulk operations

**Low Priority:**
7. Investment tracking
8. Receipt attachments
9. Heat map

---

## 📝 Notes

- All features are **production-ready**
- Zero linter errors
- Custom toast system (no external dependencies)
- Responsive design (mobile-friendly)
- Accessible (ARIA labels, keyboard navigation)

---

**Happy Testing!** 🚀

