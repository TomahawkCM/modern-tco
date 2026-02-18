# Budget App - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install dexie dexie-react-hooks papaparse react-dropzone @types/papaparse
```

### Step 2: Enable Database Persistence

Open `src/lib/budget-db.ts` and:

1. **Uncomment lines 23-54** (the Dexie database class)
2. **Delete or comment out lines 56-131** (the temporary MemoryStore)

The file should look like this after editing:

```typescript
import Dexie, { Table } from "dexie"; // ← Make sure this is uncommented

export class BudgetDatabase extends Dexie {
  // ← Uncomment this whole section
  accounts!: Table<Account>;
  transactions!: Table<Transaction>;
  // ... rest of the class
}

export const db = new BudgetDatabase(); // ← Use this instead of TemporaryDatabase
```

### Step 3: Start the App

```bash
npm run dev
```

Open your browser to: **http://localhost:3000/budget-app**

---

## 📦 What You Get (Phase 1 MVP)

### Pages Built & Ready to Use:

✅ **Dashboard** - Overview of your finances
✅ **Transactions** - View, search, filter transactions
✅ **Import** - Upload CSV files from BMO or Home Trust
✅ **Layout** - Clean navigation sidebar

### Features Working:

✅ CSV import with duplicate detection
✅ Auto-categorization (50+ Canadian merchant rules)
✅ Transaction management (view, delete, filter, search)
✅ Net worth calculation
✅ Monthly income/expense tracking
✅ Local data storage (IndexedDB)

---

## 📝 How to Use

### 1. Import Your Bank Statements

1. Download CSV from your bank (BMO or Home Trust)
2. Go to `/budget-app/import`
3. Select your bank or use auto-detect
4. Drag & drop or choose your CSV file
5. Review the preview (duplicates marked in yellow)
6. Click "Import X Transactions"

### 2. View Your Transactions

1. Go to `/budget-app/transactions`
2. Search, filter by category, or sort
3. Review auto-categorized transactions
4. Delete any errors

### 3. Check Your Dashboard

1. Go to `/budget-app` (homepage)
2. See your net worth, income, expenses
3. View recent transactions
4. Check quick stats

---

## 🏦 Supported Bank Formats

### BMO (Bank of Montreal)

```csv
Transaction Date,Description,Amount
01/15/2025,SOBEYS #1234,-87.32
01/14/2025,SALARY DEPOSIT,3250.00
```

### Home Trust

```csv
Date,Details,Debit/Credit
2025-01-15,METRO GROCERY,-52.18
2025-01-14,SALARY DEPOSIT,3250.00
```

---

## 🎨 What's Next (Phase 2)

### Pages to Build:

- [ ] Budget tracking (`/budget-app/budgets`)
- [ ] Future purchase planner (`/budget-app/planning/future`)
- [ ] Retirement calculator (`/budget-app/planning/retirement`)
- [ ] Reports & charts (`/budget-app/reports`)
- [ ] Data export (`/budget-app/export`)
- [ ] Settings (`/budget-app/settings`)

### Features to Add:

- [ ] Add/edit transactions manually
- [ ] Recharts visualizations
- [ ] Budget progress bars
- [ ] Savings goals tracking
- [ ] Recurring transaction detection
- [ ] Export to JSON/CSV

Want me to build these next? Just ask!

---

## 🔧 Customization

### Add Your Own Bank

Edit `src/lib/parsers/csv-parser.ts`:

```typescript
export const BANK_CONFIGS: Record<string, BankConfig> = {
  // ... existing
  myBank: {
    name: "My Bank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
    hasHeader: true,
  },
};
```

### Add Custom Categories

Edit `src/lib/budget-db.ts` → `DEFAULT_CATEGORIES` array:

```typescript
{
  name: 'My Category',
  type: 'expense',
  subcategories: ['Sub1', 'Sub2'],
  color: '#ff6b6b',
  icon: 'icon-name',
  isDefault: true,
  order: 14,
}
```

### Add Categorization Rules

Edit `src/lib/categorization/rules.ts`:

```typescript
{
  pattern: /my merchant|another store/i,
  category: 'Shopping',
  subcategory: 'Clothing',
  confidence: 0.9,
}
```

---

## 🐛 Troubleshooting

### "Data disappears when I refresh"

→ Install Dexie and uncomment the database code (Step 2 above)

### "CSV import doesn't work"

→ Make sure your CSV has headers and matches the bank format

### "Categories are wrong"

→ Categorization is automatic but imperfect. Add custom rules or manually categorize

### "Page shows errors"

→ Run `npm install` to ensure all dependencies are installed

---

## 💡 Pro Tips

1. **Export regularly** - Once export page is built, back up your data weekly
2. **Review categories** - Check auto-categorization and correct as needed
3. **Use consistent merchants** - Helps with auto-categorization learning
4. **Set budgets** - Coming in Phase 2, helps track spending
5. **Check duplicates** - Always review the import preview before confirming

---

## 📊 Data Privacy

✅ **100% Local** - All data stays in your browser's IndexedDB
✅ **No server** - Nothing sent over the internet
✅ **No auth** - Just you and your family
✅ **Your data** - Export anytime, full ownership

---

## 🎯 Quick Commands

```bash
# Install dependencies
npm install dexie dexie-react-hooks papaparse react-dropzone @types/papaparse

# Start development server
npm run dev

# Build for production (optional)
npm run build

# Run type checking
npm run typecheck

# Run linter
npm run lint
```

---

## 📞 Need Help?

1. Check `BUDGET_APP_README.md` for full documentation
2. Review code comments in the source files
3. Test with sample CSV files first
4. Ask for Phase 2 features when ready!

---

**You're all set! Start by installing dependencies and importing your first CSV file.** 🎉
