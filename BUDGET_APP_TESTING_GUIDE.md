# Budget App Testing Guide
**Session Date:** November 4, 2025  
**Features to Test:** 28 completed tasks across 5 phases

---

## 🚀 Getting Started

### Start the Development Server

```bash
# Kill any existing Node processes
taskkill /F /IM node.exe

# Start the dev server
npm run dev

# Wait for compilation (may take 30-60 seconds with new code)
# Look for: "Ready in X seconds"
# Server should be at: http://localhost:3000
```

### Navigate to Budget App

Open browser to: **http://localhost:3000/budget-app**

---

## 🧪 Feature Testing Checklist

### **1. Investment Tracking (Phase 8) - 6 Features**

#### Test Investment Accounts
- [ ] Navigate to **Investments** in sidebar
- [ ] Click "Add Account" button
- [ ] Create a TFSA account (name: "My TFSA", institution: "Questrade")
- [ ] Verify account appears in list
- [ ] Click Edit icon, modify name, save
- [ ] Verify account updated

#### Test Holdings with Live Data
- [ ] Click "Add Holding" on an account
- [ ] Type "AAPL" in symbol field
- [ ] Verify autocomplete suggestions appear
- [ ] Select AAPL from dropdown
- [ ] Enter: Quantity: 10, Purchase Price: $150
- [ ] Set purchase date
- [ ] Click "Save"
- [ ] Verify holding appears in table
- [ ] **Verify current price is fetched** (should be ~$178 or live price)
- [ ] **Verify gain/loss calculated** (should show positive gain)

#### Test Market Data API
- [ ] Wait for prices to load (green banner appears)
- [ ] Verify "Market prices updated [time]" banner shows
- [ ] Click "Refresh Prices" button
- [ ] Verify refresh icon spins
- [ ] Verify prices update
- [ ] Check console for Yahoo Finance API calls

#### Test Charts
- [ ] Scroll down to "Portfolio Analysis" section
- [ ] **Pie Chart**: Verify shows AAPL as 100% (if only 1 holding)
- [ ] Add another holding (e.g., MSFT: 5 shares @ $350)
- [ ] Verify pie chart splits between AAPL and MSFT
- [ ] **Bar Chart**: Verify shows green bar for gains
- [ ] **Performance Table**: Verify totals row matches metrics

#### Test Multiple Accounts
- [ ] Add RRSP account
- [ ] Add holding to RRSP (e.g., VGRO.TO: 100 shares @ $30)
- [ ] Verify "Account Type Allocation" pie chart appears
- [ ] Verify shows TFSA vs RRSP split

---

### **2. Receipt Attachments (Phase 7) - 3 Features**

#### Test Receipt Upload (from existing TransactionModal)
- [ ] Navigate to **Transactions**
- [ ] Click "+ Add Transaction" (or press **N** key)
- [ ] Fill in transaction details
- [ ] Look for receipt upload area
- [ ] Upload a test image (any JPG/PNG)
- [ ] Verify thumbnail preview shows
- [ ] Save transaction

#### Test Receipt Display
- [ ] Find transaction with receipt in table
- [ ] Verify small thumbnail appears in "Receipt" column
- [ ] Click thumbnail
- [ ] Verify full-size modal opens with image
- [ ] Verify filename and file size shown
- [ ] Click X to close modal

#### Test Receipt Delete
- [ ] Open receipt modal
- [ ] Click Delete button (trash icon)
- [ ] Confirm deletion
- [ ] Verify thumbnail removed from transaction row

---

### **3. Split Transactions (Phase 6) - 6 Features**

#### Test Basic Split
- [ ] Go to Transactions page
- [ ] Find any transaction (e.g., $100 grocery)
- [ ] Click **Split** button (purple icon)
- [ ] Verify split modal opens
- [ ] See 2 default splits (50/50)
- [ ] Change split 1: Category "Food & Dining", Amount $60
- [ ] Change split 2: Category "Miscellaneous", Amount $40
- [ ] Verify validation shows green ✓ "Matches original"
- [ ] Click "Save Split"

#### Test Split Display
- [ ] Verify original transaction disappears
- [ ] Verify 2 new transactions appear
- [ ] Verify each has purple "Split" badge
- [ ] Verify amounts are $60 and $40
- [ ] Verify categories are correct

#### Test Invalid Split
- [ ] Split another transaction
- [ ] Set split 1: $50, split 2: $30 (total $80, wrong)
- [ ] Verify red error panel: "Under by $20"
- [ ] Verify Save button is disabled
- [ ] Click "Distribute Evenly"
- [ ] Verify splits become equal (50/50 for $100 transaction)

#### Test Unsplit
- [ ] Find a split transaction (has purple "Split" badge)
- [ ] Click **Split** button (unsplit for split transactions)
- [ ] Confirm "Restore original?"
- [ ] Verify split children disappear
- [ ] Verify original transaction reappears

#### Test 3-Way Split
- [ ] Split a $150 transaction
- [ ] Click "+ Add Split"
- [ ] Verify 3rd split appears
- [ ] Set amounts: $50, $60, $40
- [ ] Verify totals to $150
- [ ] Save and verify 3 transactions appear

#### Test Delete Cascade
- [ ] Delete one child of a multi-split transaction
- [ ] Verify it's removed
- [ ] Delete the last remaining child
- [ ] Verify prompt: "Restore original?"
- [ ] Confirm, verify original restored

---

### **4. Bulk Categorization (Phase 5)**

#### Test Multi-Select
- [ ] Go to Transactions page
- [ ] Verify checkbox column appears (first column)
- [ ] Check header checkbox
- [ ] Verify all visible transactions selected
- [ ] Verify rows highlight in teal (bg-teal-50)
- [ ] Uncheck header, verify all deselected

#### Test Bulk Categorize
- [ ] Select 3-5 uncategorized transactions
- [ ] Verify teal bulk actions bar appears
- [ ] Verify shows "X transaction(s) selected"
- [ ] Select category from dropdown (e.g., "Food & Dining")
- [ ] Select subcategory (e.g., "Groceries")
- [ ] Click "Apply to Selected"
- [ ] Confirm the action
- [ ] Verify all selected transactions now have that category
- [ ] Verify selection clears
- [ ] Verify bulk bar disappears

---

### **5. Keyboard Shortcuts (Phase 5)**

#### Test Navigation Shortcuts
- [ ] Press **D** - verify navigates to Dashboard
- [ ] Press **T** - verify navigates to Transactions
- [ ] Press **B** - verify navigates to Budgets
- [ ] Press **I** - verify navigates to Investments
- [ ] Press **R** - verify navigates to Reports

#### Test Action Shortcuts
- [ ] Press **/** - verify search input focused (if on page with search)
- [ ] Press **?** - verify shortcuts modal opens
- [ ] Verify modal shows all 9 shortcuts
- [ ] Press **Esc** - verify modal closes

#### Test Input Safety
- [ ] Open transaction modal (press N or click Add)
- [ ] Click in description input field
- [ ] Type "B" - verify it types "B", NOT navigate to Budgets
- [ ] Type "/" - verify it types "/", NOT focus search
- [ ] Press **Esc** - verify modal closes (works even in inputs)

---

### **6. Onboarding Tour (Phase 5)**

#### Test First Visit
- [ ] Clear localStorage: Open DevTools → Application → Local Storage → Clear All
- [ ] Refresh page
- [ ] Verify onboarding tour modal appears
- [ ] Verify shows "Step 1 of 5"
- [ ] Verify progress bar at top

#### Test Tour Navigation
- [ ] Click "Start Tour" (Step 1)
- [ ] Verify navigates to Import page (Step 2)
- [ ] Verify description mentions CSV import
- [ ] Click "Next"
- [ ] Verify goes to Transactions page (Step 3)
- [ ] Click "Previous"
- [ ] Verify goes back to Step 2
- [ ] Click "Skip tour" - confirm
- [ ] Verify tour closes

#### Test Tour Completion
- [ ] Restart tour (clear localStorage and refresh)
- [ ] Click through all 5 steps
- [ ] On Step 5, verify "Get Started" button
- [ ] Verify "Don't show again" checkbox
- [ ] Click "Get Started"
- [ ] Verify tour closes and doesn't reappear on refresh

---

### **7. Confidence Meter (Phase 5)**

#### Test Auto-Categorization
- [ ] Open new transaction modal
- [ ] Type description: "Tim Hortons"
- [ ] Verify auto-categorizes as "Food & Dining - Coffee"
- [ ] Verify confidence meter appears (5 green bars)
- [ ] Verify shows "Very Confident" (95%+)
- [ ] Verify "Learn from this" button appears

#### Test Learning
- [ ] Click "Learn from this" button
- [ ] Verify shows green "Learned!" message
- [ ] Verify confidence meter disappears
- [ ] Save transaction
- [ ] Add another "Tim Hortons" transaction
- [ ] Verify still auto-categorizes correctly

---

### **8. Spending Heat Map (Phase 4)**

#### Test Heat Map Display
- [ ] Navigate to Reports page
- [ ] Scroll down to "Spending Heat Map"
- [ ] Verify 7-column grid (Sun-Sat)
- [ ] Verify 4-5 rows (weeks in current month)
- [ ] Verify days with spending have teal colors
- [ ] Verify days without spending are light gray

#### Test Hover Tooltips
- [ ] Hover over a day with spending
- [ ] Verify tooltip appears above cell
- [ ] Verify shows: date, amount, transaction count
- [ ] Move to another day, verify tooltip updates

#### Test Stats
- [ ] Verify "Total Spent" shows sum
- [ ] Verify "Busiest Day" shows day of week
- [ ] Verify "Avg Per Day" calculated correctly
- [ ] Verify color legend at bottom

---

### **9. Recurring Transactions (Phase 4)**

#### Test Detection
- [ ] Import/add multiple transactions with same merchant
- [ ] Examples to test:
  - Add "Netflix" $15.99 on Jan 1, Feb 1, Mar 1 (monthly)
  - Add "Gym" $40 on Jan 7, Jan 21, Feb 4 (biweekly)
- [ ] Refresh Dashboard
- [ ] Verify "Recurring Transactions" card appears
- [ ] Verify Netflix shows as "Monthly" with teal badge
- [ ] Verify Gym shows as "Biweekly" with purple badge

#### Test Upcoming Alerts
- [ ] Find pattern with next date within 7 days
- [ ] Verify row has amber background
- [ ] Verify shows "in X days"
- [ ] Verify total monthly estimate at top right

---

## 🎯 Critical Tests

### **Priority 1: Investment Tracking**
The most complex feature - verify:
- ✅ Yahoo Finance API calls work (check Network tab)
- ✅ Prices cache and refresh
- ✅ Charts render correctly
- ✅ Calculations accurate (manually verify gain/loss)

### **Priority 2: Split Transactions**
Complex data relationships - verify:
- ✅ Parent marked isSplit=true and hidden
- ✅ Children have splitFromId and visible
- ✅ Unsplit restores correctly
- ✅ Delete cascade works

### **Priority 3: Bulk Operations**
User efficiency - verify:
- ✅ Multi-select works smoothly
- ✅ Bulk categorize applies to all selected
- ✅ Selection state maintains during filtering

---

## 🐛 Known Issues to Check

1. **Compilation Errors**: If dev server won't start, check for TypeScript errors
2. **API Rate Limits**: Yahoo Finance may rate limit if testing too many symbols
3. **Browser Compatibility**: Test in Chrome/Edge (primary browsers)

---

## 📊 Testing Data Setup

### Create Test Investment Portfolio:
```
Account 1: "My TFSA" (TFSA)
  - AAPL: 10 shares @ $150 (should show gains)
  - MSFT: 5 shares @ $350 (should show gains)
  
Account 2: "RRSP" (RRSP)
  - VGRO.TO: 100 shares @ $30 (Canadian ETF)
  - TD.TO: 20 shares @ $75 (Canadian bank stock)
```

### Create Test Recurring Transactions:
```
Netflix: $15.99 on 1st of each month (x3 months)
Spotify: $10.99 on 15th of each month (x3 months)
Gym: $40 every 2 weeks (x4 times)
```

### Create Test Split Transaction:
```
Costco: $250
  Split into:
  - Groceries: $180
  - Household: $70
```

---

## ✅ Expected Results

### **Investment Portfolio Page**
- 4 summary cards at top (Total Value, Cost, Gain/Loss, Return %)
- Account cards with expandable holdings
- Holdings table with live prices
- 3 charts (2 pie charts, 1 bar chart)
- Performance summary table
- Refresh button working

### **Transactions Page**
- Receipt thumbnail column (on large screens)
- Split button for all transactions
- Purple "Split" badges on split children
- Checkbox column for multi-select
- Teal bulk actions bar when selected
- Color-coded categories (teal badges)

### **Dashboard**
- Metric cards with current totals
- Recurring transactions card (if patterns detected)
- Monthly estimated recurring cost
- Color-coded frequency badges
- Upcoming charges highlighted in amber

### **Reports Page**
- Spending heat map calendar
- Color intensity shows spending
- Hover tooltips with details
- Summary stats (Total, Busiest Day, Average)

---

## 🔍 Debugging Help

### If Server Won't Start:
```bash
# Check for errors
npm run dev

# Look for compilation errors in output
# Common issues:
# - Missing imports
# - Type errors
# - Syntax errors
```

### If API Calls Fail:
- Check browser Console for errors
- Check Network tab for Yahoo Finance requests
- Verify internet connection
- API URL: https://query1.finance.yahoo.com/v8/finance/chart/[SYMBOL]

### If Charts Don't Render:
- Verify recharts is installed: `npm list recharts`
- Check browser console for errors
- Ensure transactions/holdings exist

---

## 📝 Test Report Template

```
FEATURE: Investment Tracking
STATUS: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
NOTES: 
- API calls working: Yes/No
- Charts rendering: Yes/No
- Calculations accurate: Yes/No
- Issues found: [list any bugs]

FEATURE: Split Transactions
STATUS: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
NOTES:
- Split modal works: Yes/No
- Validation accurate: Yes/No
- Unsplit works: Yes/No
- Issues found: [list any bugs]

[Continue for each feature...]
```

---

## 🎯 Success Criteria

**Investment Tracking:**
- ✅ Live prices fetch from API
- ✅ Charts display portfolio data
- ✅ Gain/loss calculations correct
- ✅ Refresh button works

**Receipt Attachments:**
- ✅ Thumbnails appear in table
- ✅ Modal shows full-size image
- ✅ Delete removes receipt

**Split Transactions:**
- ✅ Can split 2-5 ways
- ✅ Validation prevents invalid totals
- ✅ Original hidden, children visible
- ✅ Unsplit restores original

**Bulk Operations:**
- ✅ Can select multiple transactions
- ✅ Bulk categorize applies to all
- ✅ Visual feedback (teal highlight)

**Keyboard Shortcuts:**
- ✅ All 9 shortcuts work
- ✅ Don't interfere with typing
- ✅ ? opens help modal

**Onboarding Tour:**
- ✅ Shows on first visit
- ✅ 5 steps navigate correctly
- ✅ Completion tracked

**Confidence Meters:**
- ✅ Auto-categorization works
- ✅ 5-bar meter displays
- ✅ "Learn from this" records feedback

**Heat Map:**
- ✅ Calendar grid renders
- ✅ Color intensity correlates to spending
- ✅ Tooltips show details

**Recurring Detection:**
- ✅ Patterns detected (≥3 occurrences)
- ✅ Frequency badges shown
- ✅ Next date predicted
- ✅ Monthly total calculated

---

Good luck with testing! All features should be fully functional. Report any bugs you find.

