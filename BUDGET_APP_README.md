# Household Budget App

A local, browser-based budget management application built for personal/family use. No authentication required, all data stored locally.

## Features Implemented (Phase 1)

### Core Infrastructure ✅
- **TypeScript Types**: Complete type definitions for all data models
- **Database Layer**: IndexedDB with temporary in-memory fallback (ready for Dexie.js)
- **CSV Parser**: Support for BMO and Home Trust bank statement formats
- **Auto-Categorization**: Rule-based system with 50+ Canadian merchant patterns
- **Layout & Navigation**: Clean, modern UI with sidebar navigation

### Pages Created ✅
1. **Dashboard** (`/budget-app`)
   - Net worth summary
   - Monthly income/expenses overview
   - Recent transactions list
   - Quick stats
   - Empty state with onboarding

2. **Transactions** (`/budget-app/transactions`)
   - Searchable transaction list
   - Category filtering
   - Sort by date/amount
   - Delete functionality
   - Summary cards (income, expenses, net)

3. **Import** (`/budget-app/import`)
   - Drag & drop CSV upload
   - Bank auto-detection (BMO, Home Trust)
   - Duplicate detection
   - Auto-categorization preview
   - Import summary with statistics

## Installation

### Step 1: Install Dependencies

```bash
npm install dexie dexie-react-hooks papaparse react-dropzone @types/papaparse
```

### Step 2: Update Database Layer

After installing Dexie, uncomment the Dexie code in:
- `src/lib/budget-db.ts` (lines 23-54)

And remove the temporary `MemoryStore` implementation (lines 56-131).

### Step 3: Run Development Server

```bash
npm run dev
```

Then navigate to: **http://localhost:3000/budget-app**

## File Structure

```
src/
├── app/budget-app/
│   ├── layout.tsx              # Main layout with sidebar
│   ├── page.tsx                # Dashboard
│   ├── transactions/
│   │   └── page.tsx            # Transaction list & management
│   ├── import/
│   │   └── page.tsx            # CSV import
│   └── (pending pages)
│       ├── budgets/
│       ├── planning/future/
│       ├── planning/retirement/
│       ├── reports/
│       ├── export/
│       └── settings/
├── lib/
│   ├── budget-db.ts            # IndexedDB database layer
│   ├── parsers/
│   │   └── csv-parser.ts       # Bank CSV parsing
│   └── categorization/
│       └── rules.ts            # Auto-categorization rules
└── types/
    └── budget.ts               # TypeScript type definitions
```

## Next Steps (Phase 2)

### High Priority Pages

1. **Budgets Page** (`/budget-app/budgets`)
   - Create/edit budgets by category
   - Monthly budget tracking
   - Progress visualization
   - Budget vs. actual spending

2. **Future Purchase Planner** (`/budget-app/planning/future`)
   - Goal creation (name, amount, target date)
   - Savings progress tracking
   - Timeline calculator
   - "What-if" scenarios

3. **Retirement Calculator** (`/budget-app/planning/retirement`)
   - Input form (age, savings, contributions, return rate)
   - Compound interest projection
   - Chart showing growth over time
   - Required monthly savings calculator

4. **Reports Page** (`/budget-app/reports`)
   - Spending trends (Recharts line/bar charts)
   - Category breakdown (pie chart)
   - Month-over-month comparison
   - Net worth tracking over time

5. **Export/Backup** (`/budget-app/export`)
   - Export to JSON (full backup)
   - Export transactions to CSV
   - Restore from backup
   - Print-friendly reports

6. **Settings** (`/budget-app/settings`)
   - Manage categories
   - Manage accounts
   - Import/export data
   - Clear all data option

### Features to Add

#### Transaction Management Enhancements
- [ ] Add transaction modal/form
- [ ] Edit transaction inline
- [ ] Bulk categorization
- [ ] Split transactions
- [ ] Attach receipts/notes
- [ ] Tags support

#### Smart Features
- [ ] Recurring transaction detection
- [ ] Bill reminders
- [ ] Spending alerts
- [ ] ML categorization (TensorFlow.js)
- [ ] Search by merchant

#### Charts & Visualizations
- [ ] Spending by category pie chart (Recharts)
- [ ] Income vs. Expenses line chart
- [ ] Monthly trends
- [ ] Budget progress bars
- [ ] Net worth tracking

#### Data Management
- [ ] Account management (add/edit/delete)
- [ ] Category customization
- [ ] Budget templates
- [ ] Recurring budgets

## Bank CSV Formats Supported

### BMO (Bank of Montreal)
```csv
Transaction Date,Description,Amount
01/15/2025,SOBEYS #1234,-87.32
01/14/2025,TIM HORTONS,-4.50
```

### Home Trust
```csv
Date,Details,Debit/Credit
2025-01-15,METRO GROCERY,-52.18
2025-01-14,SALARY DEPOSIT,3250.00
```

## Adding More Banks

To add support for additional banks, edit `src/lib/parsers/csv-parser.ts`:

```typescript
export const BANK_CONFIGS: Record<string, BankConfig> = {
  // ... existing configs
  yourBank: {
    name: 'Your Bank',
    dateColumn: 'Date',           // Column name for date
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'yyyy-MM-dd',     // Date format
    amountMultiplier: -1,         // Use -1 if expenses are positive
    hasHeader: true,
  },
};
```

## Categorization Rules

The app includes 50+ rules for Canadian merchants. To add custom rules:

```typescript
import { addCustomRule } from '@/lib/categorization/rules';

addCustomRule({
  pattern: /your merchant/i,
  category: 'Shopping',
  subcategory: 'Electronics',
  confidence: 0.9,
});
```

## Data Storage

### Current: In-Memory (Temporary)
- Data lost on page refresh
- Good for testing

### After Installing Dexie: IndexedDB
- Persistent local storage
- ~50-100MB+ storage capacity
- Data survives browser restarts
- No server required

### Future: Optional Supabase Sync
- Multi-device sync
- Cloud backup
- User authentication
- Shared household budgets

## Security & Privacy

✅ **All data stays local** - nothing sent to servers
✅ **No authentication** - just for you and your family
✅ **No tracking** - no analytics, no cookies
✅ **Export anytime** - your data is always accessible
✅ **Open source** - full code transparency

## Customization

### Colors
Edit `src/lib/budget-db.ts` to change category colors:

```typescript
{
  name: 'Food & Dining',
  color: '#10b981',  // Change this hex color
  icon: 'utensils',
  // ...
}
```

### Categories
Add/remove categories in `DEFAULT_CATEGORIES` array in `src/lib/budget-db.ts`.

## Troubleshooting

### Issue: Data not persisting
**Solution**: Install Dexie.js and uncomment the code in `budget-db.ts`

### Issue: CSV import fails
**Solution**:
1. Check your CSV has headers
2. Verify bank format matches configuration
3. Try manual bank selection instead of auto-detect

### Issue: Duplicate transactions imported
**Solution**: The system auto-detects duplicates but may miss some. Check the preview before importing.

## Performance

- **Fast**: All processing happens client-side
- **Offline**: Works without internet after initial load
- **Lightweight**: ~500KB total bundle size
- **No backend**: No API calls, no latency

## Roadmap

### Phase 1: MVP ✅ (Current)
- [x] Database schema
- [x] CSV import (BMO, Home Trust)
- [x] Transaction management
- [x] Auto-categorization
- [x] Dashboard

### Phase 2: Core Features (Next)
- [ ] Budget tracking
- [ ] Future purchase planner
- [ ] Retirement calculator
- [ ] Reports & charts
- [ ] Export/backup

### Phase 3: Enhanced Features
- [ ] Recurring transaction detection
- [ ] ML categorization (TensorFlow.js)
- [ ] Split transactions
- [ ] Receipt attachments
- [ ] Advanced reports

### Phase 4: Polish
- [ ] Mobile responsive design
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] PWA support

## Contributing

This is a personal project, but feel free to:
- Report bugs
- Suggest features
- Customize for your own use
- Fork and modify

## License

MIT - Use freely for personal or commercial projects

## Support

For questions or issues:
1. Check this README
2. Review the code comments
3. Test with sample CSV files

## Credits

Built with:
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Charts (coming soon)
- **Dexie.js** - IndexedDB wrapper
- **PapaParse** - CSV parsing
- **Lucide React** - Icons

---

**Happy budgeting!** 💰
