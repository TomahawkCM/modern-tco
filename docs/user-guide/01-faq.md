# Budget App - Frequently Asked Questions (FAQ)

Complete answers to common questions about using Budget App.

---

## Getting Started

### Q: Do I need to create an account?

**A:** No! Budget App works without any account or login. Your data is stored securely on your device only.

**Benefits:**
- No passwords to remember
- No email required
- No personal information collected
- Start using immediately

---

### Q: Can I use Budget App on multiple devices?

**A:** Currently, your data is stored locally on each device. If you use Budget App on your phone and computer, they will have separate data.

**Workaround:**
- Export data from one device (More → Export)
- Import on another device (More → Import)

**Coming Soon:** Cloud sync to keep all your devices in sync automatically.

---

### Q: Is my financial data private and secure?

**A:** Yes, 100% private!

**How we protect your data:**
- ✅ **All data stays on your device** - Never sent to our servers
- ✅ **No cloud storage** - No risk of data breaches
- ✅ **No account required** - No password, email, or personal info
- ✅ **Open source** - Security experts can verify our code

**The only data that leaves your device:**
- AI chatbot queries (optional, requires internet)
- Anonymous usage statistics (optional, opt-in only)

---

### Q: Does Budget App work offline?

**A:** Yes! Budget App is a **Progressive Web App (PWA)** that works completely offline.

**Offline capabilities:**
- ✅ Add/edit/delete transactions
- ✅ Create/update budgets
- ✅ View reports and charts
- ✅ Import CSV files
- ❌ AI chatbot (requires internet)

**First-time setup:** You'll need internet to initially load the app. After that, it works 100% offline.

---

## Transactions

### Q: How do I categorize transactions?

**A:** Budget App has two ways to categorize:

**1. Automatic (AI-powered):**
- Type a description (e.g., "Starbucks")
- App suggests a category (e.g., "Dining Out")
- Accept or change the suggestion

**2. Manual:**
- Click the Category dropdown
- Choose from the list
- Or create a new category

**Tips for better auto-categorization:**
- Use specific merchant names ("Safeway" not "store")
- Be consistent with descriptions
- The app learns from your corrections

---

### Q: Can I split a transaction across multiple categories?

**A:** Yes! This feature is available for splitting expenses like grocery trips where you buy both food and household items.

**How to split:**
1. Click any transaction
2. Click "Split Transaction" button
3. Add splits with amounts and categories
4. Total must equal original amount
5. Save

**Example:**
- Original: $150 at Target
- Split 1: $100 → Groceries
- Split 2: $50 → Household Items

---

### Q: How do I add income?

**A:** Income is added the same way as expenses:

1. Click "Add Transaction"
2. **Select "Income" type** (instead of Expense)
3. Fill in amount and description
4. Choose income category (Salary, Freelance, Gifts, etc.)
5. Save

**Income shows in green** on your dashboard and transaction list.

---

### Q: Can I attach receipts to transactions?

**A:** Yes! Two ways:

**1. Scan Receipt (OCR):**
- Go to More → Scan Receipt
- Take photo or upload image
- App reads amount and merchant
- Confirm and save
- Receipt image is attached

**2. Manual Attachment:**
- Edit any transaction
- Click "Attach Receipt"
- Upload image (JPG, PNG, PDF)
- Image is stored with transaction

**Storage:** Receipt images are stored locally on your device (not in the cloud).

---

### Q: How do I handle refunds?

**Two options:**

**Option 1: Reverse Transaction (Recommended)**
- Add as positive transaction (income)
- Same category as original purchase
- Description: "Refund: [original purchase]"

**Example:**
- Original: -$50 (Dining Out)
- Refund: +$50 (Dining Out)
- Net effect: $0 in Dining Out category

**Option 2: Delete Original**
- Delete the original transaction
- Only if refund was immediate

---

### Q: Can I set up recurring transactions?

**A:** Not yet, but coming soon!

**Workaround for now:**
- Add recurring bills manually each month
- Use the chatbot: "Add $50 internet bill" (quick entry)
- Or import bank statements monthly (captures all recurring transactions)

**Planned features:**
- Auto-add monthly bills
- Remind you to add transactions
- Detect recurring patterns

---

## Budgets

### Q: What happens when I go over budget?

**A:** Going over budget is just a **warning** - the app doesn't stop you from spending!

**What you'll see:**
- Progress bar turns **red**
- Shows "Over by $XX"
- Notification (if enabled)

**Why warnings matter:**
- Awareness helps you adjust future spending
- See patterns before payday arrives
- Motivates better financial choices

---

### Q: Can I create budgets for specific time periods?

**A:** Yes! Three types:

**1. Monthly** (Most common)
- Resets on the 1st of each month
- Best for: Groceries, dining out, entertainment

**2. Weekly**
- Resets every Monday
- Best for: Cash spending, allowances

**3. Yearly**
- Resets January 1st
- Best for: Vacations, gifts, clothing

**Custom dates:** Coming soon!

---

### Q: Do budgets automatically reset?

**A:** Yes!

- **Monthly budgets**: Reset on the 1st
- **Weekly budgets**: Reset on Monday
- **Yearly budgets**: Reset on January 1st

**Your spending history is preserved** - only the budget counter resets.

---

### Q: Can I set different budgets for different months?

**A:** Not yet, but coming soon!

**Current workaround:**
- Edit budget amount when needed (e.g., December holidays)
- Create note in budget title: "Groceries (Dec: $400)"

**Planned feature:**
- Seasonal budgets
- Variable amounts per month
- Budget templates

---

## Importing Bank Statements

### Q: Which banks are supported?

**A:** We support **15+ major banks**:

**Canadian Banks:**
- TD Canada Trust
- RBC (Royal Bank)
- Scotiabank
- BMO (Bank of Montreal)
- CIBC
- Tangerine
- Simplii Financial

**US Banks:**
- Chase
- Bank of America
- Wells Fargo
- Citi
- Capital One

**Don't see your bank?** Choose "Generic CSV" and manually map columns.

---

### Q: What file formats can I import?

**Supported formats:**

**1. CSV (Comma-Separated Values)**
- Most common format
- Download from your bank's website
- Look for "Export Transactions" or "Download"

**2. OFX/QFX (Quicken)**
- Used by Quicken and Mint
- More detailed transaction data
- Better duplicate detection

**3. PDF Bank Statements**
- Coming soon!
- Will extract transactions automatically

---

### Q: Why are some transactions marked as duplicates?

**A:** Budget App **automatically detects duplicates** to prevent double-counting.

**Duplicate detection checks:**
- ✅ Same date (±1 day tolerance)
- ✅ Same amount (exact match)
- ✅ Similar description (80% match)

**What happens to duplicates:**
- Marked in yellow during preview
- NOT imported automatically
- You can manually override if needed

**Why this matters:** If you import the same statement twice, you won't get duplicate transactions!

---

### Q: Can I import from multiple bank accounts?

**A:** Yes! Import from all your accounts:

**Steps:**
1. Import from Bank Account #1
2. Import from Bank Account #2
3. Import from Credit Card
4. All transactions combine in one list

**Pro Tip:** Create an "Account" for each import source to track where money came from.

---

### Q: What if my import fails?

**Common issues and fixes:**

**Problem: "Invalid file format"**
- Fix: Make sure file is CSV or OFX (not PDF or Excel .xlsx)
- Check: File extension should be .csv or .ofx

**Problem: "Missing required columns"**
- Fix: Your CSV must have Date, Amount, and Description columns
- Try: Use "Manual Column Mapping" option

**Problem: "File too large"**
- Fix: Split large files into smaller ones (max 5MB)
- Or: Import one month at a time

**Problem: "No transactions found"**
- Fix: Check if file has header row
- Try: Different bank format

---

## Loans & Debt

### Q: What types of loans can I track?

**Supported loan types:**

1. **Mortgage** (home loans)
2. **Auto Loans** (car/vehicle)
3. **Credit Cards** (revolving debt)
4. **Personal Loans** (unsecured)
5. **Student Loans**
6. **Line of Credit**

**For each loan, track:**
- Remaining balance
- Interest rate
- Monthly payment
- Payoff date
- Total interest paid

---

### Q: How accurate is the loan calculator?

**A:** Very accurate! We use **industry-standard amortization formulas**:

- Same math as banks use
- Accounts for compound interest
- Proper principal/interest split

**However:**
- Always verify with your lender's statements
- May not account for fees or insurance
- Assumes regular monthly payments

**Best practice:** Compare our calculations to your actual loan statement monthly.

---

### Q: Can I track extra payments?

**A:** Yes, with the **Extra Payment Calculator**!

**What it shows:**
- New payoff date
- Total interest saved
- Years saved
- Impact visualization

**How to use:**
1. Open any loan
2. Go to "Extra Payments" tab
3. Move slider to test amounts
4. See instant results

**Note:** This is a calculator only - you still need to record actual extra payments with your lender.

---

### Q: What if my loan has a variable interest rate?

**A:** Currently, Budget App assumes **fixed interest rates**.

**Workaround:**
- Update interest rate when it changes
- Create note with rate history
- Track in spreadsheet alongside app

**Planned feature:**
- Variable rate loans
- Rate change history
- Automatic rate updates (with bank integration)

---

## AI Chatbot

### Q: What can the chatbot do?

**Current capabilities:**

**Spending Analysis:**
- "How much did I spend on groceries this month?"
- "What are my top 3 spending categories?"
- "Show dining out transactions from last week"

**Budget Status:**
- "Am I under budget for entertainment?"
- "How much budget do I have left for groceries?"

**Trends & Insights:**
- "Am I spending more this month than last month?"
- "What's my average monthly spending?"

**Income:**
- "How much income did I earn in October?"
- "Show my income sources"

**Coming Soon:**
- Add transactions via chat
- Create budgets via chat
- Financial advice and tips

---

### Q: Is the chatbot secure? Can it access my data?

**A:** Yes, secure! But here's what happens:

**What the chatbot sees:**
- Your transaction amounts (when you ask questions)
- Category names and dates
- Budget amounts

**What it DOESN'T see:**
- Specific merchant names (unless you ask about them)
- Your personal information
- Data from other users

**How it works:**
- Your question + relevant data sent to OpenAI
- AI processes and responds
- Response shown in app
- **Conversation not stored** on our servers

**Privacy controls:**
- Disable chatbot in Settings → Privacy
- Clear chat history anytime
- Opt out of AI features entirely

---

### Q: Why isn't the chatbot responding?

**Check these:**

**1. Internet Connection**
- Chatbot requires internet
- Offline mode doesn't support AI

**2. Ad Blockers**
- Disable for Budget App
- May block API calls

**3. Browser Privacy Mode**
- Some browsers restrict AI features
- Try regular browsing mode

**4. Service Status**
- OpenAI may be temporarily down
- Check status at status.openai.com

---

### Q: Can the chatbot make changes to my data?

**A:** Currently, NO.

**What it can do:**
- Answer questions
- Provide insights
- Show summaries

**What it CANNOT do (yet):**
- Add transactions
- Edit budgets
- Delete data
- Make any changes

**Coming Soon:** Action mode with confirmation dialogs for safety.

---

## Reports & Charts

### Q: What reports are available?

**Current reports:**

**1. Dashboard Overview**
- Summary cards (net worth, income, expenses)
- Category spending pie chart
- Recent transactions list

**2. Monthly Report**
- Spending by category (bar chart)
- Income vs expenses (line chart)
- Budget performance
- Month-over-month comparison

**3. Category Breakdown**
- Drill down into any category
- See all transactions
- Trends over time

**4. Loan Summary**
- All loans at a glance
- Total debt
- Total monthly payments
- Payoff timeline

**Coming Soon:**
- Year-over-year comparisons
- Custom date ranges
- Spending forecasts
- Tax summaries

---

### Q: Can I export reports to Excel?

**A:** Yes! Export data to CSV:

1. Go to More → Export Data
2. Choose export type:
   - **All Transactions** (full history)
   - **Current Month** (this month only)
   - **Date Range** (custom period)
3. Click "Export CSV"
4. Open in Excel, Google Sheets, or any spreadsheet app

**What's included:**
- Date, amount, description
- Category and subcategory
- Account information
- Notes and tags

---

### Q: How do I see spending trends over time?

**Multiple ways:**

**1. Dashboard → Income vs Expense Trend**
- Line chart showing last 6 months
- Green line (income), Red line (expenses)

**2. Category Page → Trends Tab**
- Select any category
- See spending by month
- Identify patterns

**3. Reports → Monthly Summary**
- Compare current month to previous
- See percentage changes

**4. Ask the Chatbot**
- "Am I spending more this month?"
- "Show grocery spending trend"

---

## Settings & Customization

### Q: Can I change the theme (light/dark mode)?

**A:** Yes! Three theme options:

**1. Light Mode** (Default)
- White background
- Black text
- Best for daytime

**2. Dark Mode**
- Black background
- White text
- Easier on eyes at night
- Saves battery (OLED screens)

**3. High Contrast**
- Extra dark background
- Extra bright text
- Best for low vision
- Enhanced readability

**How to change:**
1. Go to More → Settings
2. Under "Appearance"
3. Select your theme

---

### Q: Can I customize categories?

**A:** Yes! Full control over categories:

**Add New Category:**
1. Go to Categories section
2. Click "Add Category"
3. Name it and choose icon/color
4. Save

**Edit Category:**
1. Click any category
2. Change name, icon, or color
3. Update

**Delete Category:**
1. Click category
2. Click "Delete"
3. Reassign existing transactions to another category

**Add Subcategories:**
- Some categories have subcategories (e.g., Groceries → Produce, Dairy)
- Add your own under any category

---

### Q: How do I backup my data?

**A:** Always backup before clearing browser data!

**Manual Backup (Recommended):**
1. Go to More → Export Data
2. Choose "All Transactions"
3. Save CSV file to safe location
4. Also export budgets and loans separately

**Automatic Backup:**
- Data is stored in browser's local storage
- Survives page refresh
- **BUT** cleared if you clear browser data!

**Best Practice:**
- Export monthly
- Save to cloud storage (Dropbox, Google Drive)
- Keep at least 3 months of backups

---

### Q: Can I delete all my data and start over?

**A:** Yes, but **this cannot be undone**!

**How to reset:**
1. Go to More → Settings → Privacy
2. Scroll to "Danger Zone"
3. Click "Delete All Data"
4. Confirm (requires typing "DELETE")
5. All transactions, budgets, and loans are erased

**⚠️ WARNING:** Export your data first if you want to keep anything!

---

## Troubleshooting

### Q: Why can't I see my transactions?

**Common causes:**

**1. Date Filter Active**
- Check date range at top
- Reset to "All Time"

**2. Category Filter Active**
- Clear category filters
- Click "Show All"

**3. Wrong Account Selected**
- If using multiple accounts
- Switch to "All Accounts"

**4. Browser Cache Issue**
- Refresh page (F5)
- Hard refresh (Ctrl+Shift+R)

---

### Q: The app is running slow. How do I fix it?

**Try these steps:**

**1. Clear Old Data**
- Archive transactions older than 2 years
- Delete unused categories
- Remove old budgets

**2. Browser Cache**
- Clear browser cache
- Close other tabs
- Restart browser

**3. Large Import Files**
- Split large imports into smaller files
- Import one month at a time

**4. Try Different Browser**
- Chrome (fastest)
- Firefox
- Safari
- Edge

---

### Q: I accidentally deleted a transaction. Can I recover it?

**A:** Unfortunately, deleted transactions cannot be recovered.

**Prevention tips:**
- Export data weekly (automatic backup)
- Double-check before deleting
- Use "Archive" instead of delete for old transactions

**If you have a backup:**
1. Export data before deletion (if possible)
2. Find transaction in CSV backup
3. Manually re-add

---

## Mobile & Desktop

### Q: Is there a mobile app?

**A:** Budget App is a **Progressive Web App (PWA)** - works like a native app without app store download!

**How to install:**

**iPhone/iPad:**
1. Open Budget App in Safari
2. Tap Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen!

**Android:**
1. Open Budget App in Chrome
2. Tap menu (three dots)
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Install"
5. App icon appears on home screen!

**Desktop:**
1. Open Budget App in Chrome or Edge
2. Look for install icon in address bar
3. Click "Install"
4. App opens in its own window!

---

### Q: Does the mobile version have all features?

**A:** Yes! Mobile and desktop have **identical features**.

**Mobile-optimized:**
- ✅ Touch-friendly buttons (48px+)
- ✅ Swipe gestures
- ✅ Bottom tab navigation
- ✅ Native keyboard support
- ✅ Pull-to-refresh
- ✅ Camera access (for receipt scanning)

**No compromises!**

---

## Data & Privacy

### Q: Can you see my financial data?

**A:** **NO!** We have ZERO access to your data.

**Why:**
- All data stored locally on YOUR device
- No cloud storage
- No server databases
- No data transmission (except optional chatbot)

**We literally cannot see:**
- Your transactions
- Your budgets
- Your loan information
- Your spending habits

**Proof:** Open browser DevTools → Application → Local Storage. Your data is right there on YOUR device!

---

### Q: What happens if I clear my browser data?

**A:** ⚠️ **Your Budget App data will be deleted!**

**Before clearing browser data:**
1. Export all transactions (More → Export)
2. Save CSV file to safe location
3. Export budgets and loans too

**After clearing:**
1. Reload Budget App
2. Import saved CSV file
3. Recreate budgets manually (or import if you exported)

**Prevent accidental deletion:**
- Most browsers let you exclude specific sites from clearing
- Add Budget App to exclusion list

---

### Q: Do you sell my data to third parties?

**A:** **Absolutely not!**

**Why we can't sell your data:**
1. We don't have your data (it's on YOUR device)
2. We don't track personal information
3. We don't show ads
4. We're committed to privacy

**Our business model:**
- Free and open source
- Community-supported
- No monetization of user data

---

## Future Features

### Q: What features are coming soon?

**Roadmap (next 6 months):**

**Q1 2026:**
- ✅ Recurring transactions
- ✅ Cloud sync (optional)
- ✅ Shared budgets (couples/families)
- ✅ Receipt OCR improvements

**Q2 2026:**
- ✅ Investment tracking
- ✅ Retirement planning
- ✅ Bill reminders
- ✅ Spending insights & tips

**Q3 2026:**
- ✅ Bank account linking (read-only)
- ✅ Automatic transaction import
- ✅ Multi-currency support

**Requests:**
- Vote on features at our feedback page
- Suggest new ideas
- Join beta testing

---

### Q: Can I request a feature?

**A:** Yes! We love hearing from users.

**How to request:**
1. Go to More → Feedback
2. Click "Request Feature"
3. Describe your idea
4. Vote on existing requests

**Most requested features:**
- Recurring transactions ⭐⭐⭐⭐⭐
- Cloud sync ⭐⭐⭐⭐⭐
- Investment tracking ⭐⭐⭐⭐
- Shared budgets ⭐⭐⭐

---

## Getting More Help

### Q: Where can I find video tutorials?

**A:** Coming soon!

**Planned videos:**
- Getting started (5 min)
- Adding transactions (3 min)
- Creating budgets (4 min)
- Importing bank statements (7 min)
- Using the AI chatbot (5 min)

**Subscribe:** More → Settings → Notifications → Tutorial Updates

---

### Q: How do I report a bug?

**A:** We want to fix it quickly!

**Steps:**
1. Go to More → Settings → Report Issue
2. **Include:**
   - What you were trying to do
   - What happened instead
   - Screenshot (if possible)
   - Browser and device info
3. Click "Submit"

**We'll respond within 48 hours.**

---

### Q: Can I contribute to Budget App?

**A:** Yes! Budget App is **open source**.

**Ways to contribute:**
- Report bugs
- Suggest features
- Write documentation
- Translate to other languages
- Code new features (GitHub)
- Help other users (forum)

**Join the community:** github.com/budget-app/community

---

*Last updated: November 9, 2025*
*Have more questions? Ask our AI chatbot or visit the help forum!*
