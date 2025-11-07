# Budget App Installation Guide

## Quick Setup (3 Commands)

Since you've updated npm to version 11.6.2, follow these steps from your Windows terminal:

### 1. Navigate to Project Directory

```powershell
cd C:\Users\robne\Documents\mapmydeals-gpt5\Tanium TCO\modern-tco
```

Or if using the WSL mount:
```powershell
cd "\\wsl.localhost\Ubuntu\home\robne\projects\active\tanium-tco\modern-tco"
```

### 2. Install Dependencies

```powershell
npm install dexie dexie-react-hooks papaparse react-dropzone @types/papaparse
```

This will install:
- `dexie` - IndexedDB database wrapper
- `dexie-react-hooks` - React hooks for Dexie
- `papaparse` - CSV file parser
- `react-dropzone` - File upload component
- `@types/papaparse` - TypeScript types

### 3. Enable Database Persistence

**Option A: Automatic (Recommended)**

Run this PowerShell command to update the database file:

```powershell
# Backup the original file
Copy-Item "src\lib\budget-db.ts" "src\lib\budget-db.ts.backup"

# This will be done manually in step 4
```

**Option B: Manual Edit**

Open `src/lib/budget-db.ts` and make these changes:

1. **Uncomment lines 9-11** (import statements):
   ```typescript
   import Dexie, { Table } from 'dexie';
   ```

2. **Uncomment lines 23-54** (BudgetDatabase class):
   ```typescript
   export class BudgetDatabase extends Dexie {
     accounts!: Table<Account>;
     transactions!: Table<Transaction>;
     // ... rest of the class
   }

   export const db = new BudgetDatabase();
   ```

3. **Delete or comment out lines 56-131** (TemporaryDatabase):
   - Either delete the entire `TemporaryDatabase` class
   - Or comment it out with `/* ... */`

### 4. Run the Development Server

```powershell
npm run dev
```

### 5. Open in Browser

Navigate to: **http://localhost:3000/budget-app**

---

## What to Do Next

### First Time Setup

1. **Add an Account**
   - Go to Settings → Accounts tab
   - Click "Add Account"
   - Enter: BMO Checking, BMO, Checking, $1000.00, CAD
   - Save

2. **Import Transactions**
   - Download a CSV from your bank (BMO or Home Trust)
   - Go to Import
   - Drag & drop the CSV file
   - Review preview
   - Click "Import X Transactions"

3. **Set Budgets**
   - Go to Budgets
   - Click "Add Budget" for each category
   - Example: Food & Dining, $800, Monthly

4. **Explore Features**
   - Dashboard - See overview
   - Transactions - View/edit transactions
   - Reports - View spending charts
   - Future Plans - Create savings goals
   - Retirement - Calculate projections

---

## Verify Installation

Run these commands to verify everything is installed:

```powershell
# Check if dependencies are installed
npm list dexie
npm list papaparse
npm list react-dropzone

# Should show versions like:
# ├─┬ dexie@4.0.11
# ├─┬ papaparse@5.4.1
# ├─┬ react-dropzone@14.3.5
```

---

## Troubleshooting

### Issue: npm command not found
**Solution**: Make sure you're in PowerShell or Command Prompt, not WSL bash.

### Issue: Cannot find module 'dexie'
**Solution**: Run `npm install` again from the project root.

### Issue: Port 3000 already in use
**Solution**:
- Close other Next.js dev servers
- Or use: `npm run dev:port` (runs on port 3007)

### Issue: Data not persisting
**Solution**: Make sure you completed Step 3 (enabling database persistence).

### Issue: TypeScript errors
**Solution**: Run `npm run typecheck` to see specific errors. The Budget App is fully typed, so this shouldn't happen.

---

## File Changes Made

The following files were created for the Budget App:

### New Files Created
```
src/
├── app/budget-app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── budgets/page.tsx
│   ├── transactions/page.tsx
│   ├── import/page.tsx
│   ├── export/page.tsx
│   ├── settings/page.tsx
│   ├── reports/page.tsx
│   └── planning/
│       ├── future/page.tsx
│       └── retirement/page.tsx
├── components/budget/
│   └── TransactionModal.tsx
├── lib/
│   ├── budget-db.ts
│   ├── parsers/csv-parser.ts
│   └── categorization/rules.ts
└── types/
    └── budget.ts

Documentation:
├── BUDGET_APP_README.md
├── BUDGET_APP_QUICKSTART.md
├── BUDGET_APP_COMPLETE.md
└── INSTALL_BUDGET_APP.md (this file)
```

### Modified Files
```
package.json - Dependencies will be added after npm install
```

---

## Dependencies Added

After running `npm install`, your package.json will include:

```json
{
  "dependencies": {
    "dexie": "^4.0.11",
    "dexie-react-hooks": "^2.0.0",
    "papaparse": "^5.4.1",
    "react-dropzone": "^14.3.5",
    "@types/papaparse": "^5.3.14"
  }
}
```

---

## Quick Test

After installation, test the app:

1. **Start dev server**: `npm run dev`
2. **Open**: http://localhost:3000/budget-app
3. **You should see**:
   - Dashboard with "Welcome to Your Budget App!"
   - Sidebar navigation
   - "Import CSV" and "Add Transaction" buttons

If you see this, the installation was successful! 🎉

---

## Need Help?

- Check [BUDGET_APP_README.md](BUDGET_APP_README.md) for full documentation
- Check [BUDGET_APP_QUICKSTART.md](BUDGET_APP_QUICKSTART.md) for usage guide
- Check [BUDGET_APP_COMPLETE.md](BUDGET_APP_COMPLETE.md) for technical details

---

**You're all set! Enjoy your Budget App!** 💰
