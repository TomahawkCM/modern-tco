# Budget App - Technical Architecture

**Last Updated**: 2025-11-09
**Version**: 1.0.0
**Status**: Active Development (QA & Launch Phase)

---

## 📋 Overview

The Budget App is a **local-first, privacy-focused household budget management system** built with Next.js 16 and IndexedDB. It operates 100% offline with optional client-side encryption.

### Key Features

- 📊 **9 Core Sections**: Dashboard, Transactions, Budgets, Loans, Investments, Reports, OCR, Import, Settings
- 💾 **Local-First Storage**: IndexedDB (Dexie.js) - no server required
- 🔒 **Privacy by Design**: Data never leaves device, optional encryption
- 📱 **PWA Support**: Install as native app, works offline
- ♿ **Accessibility**: WCAG 2.2 AA compliant, 3 theme modes
- 🎨 **Modern UI**: shadcn/ui components, Tailwind CSS, dark mode

---

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 16.0.0 | React framework with App Router |
| **Runtime** | React | 19.2.0 | UI library |
| **Language** | TypeScript | 5.9.3 | Type safety (strict mode) |
| **Database** | Dexie.js | 4.2.1 | IndexedDB wrapper |
| **Storage** | IndexedDB | - | Browser database (~50MB quota) |
| **UI Components** | shadcn/ui | 3.4.0 | Accessible components (Radix UI) |
| **Styling** | Tailwind CSS | 3.4.18 | Utility-first CSS |
| **Icons** | Lucide React | 0.544.0 | Icon library |
| **Charts** | Recharts | 3.1.2 | Data visualization |
| **Forms** | React Hook Form | 7.62.0 | Form management |
| **Validation** | Zod | 4.1.11 | Schema validation |
| **OCR** | Tesseract.js | 6.0.1 | Receipt scanning |
| **CSV Parsing** | PapaParse | 5.5.3 | CSV import |
| **AI** | OpenAI API | 6.3.0 | Chatbot (optional) |
| **Encryption** | Web Crypto API | - | Client-side encryption |
| **PWA** | Next.js PWA | - | Service workers, manifest |

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  Next.js 16 | React 19 | TypeScript 5.9                 │
│  - Client-side rendering (CSR)                           │
│  - Local state management                                │
│  - No server communication required                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│                  Storage Layer                           │
│  IndexedDB (via Dexie.js)                                │
│  - 13 tables (accounts, transactions, budgets, loans...) │
│  - ~50MB storage quota                                   │
│  - Versioned schema migrations (v1 → v9)                 │
│  - Optional Web Crypto API encryption                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              External Services (Optional)                │
│  - OpenAI API (AI chatbot)                               │
│  - PostHog (Analytics, if enabled)                       │
│  - Yahoo Finance API (Stock prices)                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure

```
src/
├── app/budget-app/              # Budget app routes (Next.js App Router)
│   ├── layout.tsx               # Budget app layout (sidebar, nav)
│   ├── page.tsx                 # Dashboard (/budget-app)
│   ├── transactions/
│   │   └── page.tsx             # Transactions list
│   ├── budgets/
│   │   └── page.tsx             # Budget management
│   ├── loans/
│   │   ├── page.tsx             # Loans list
│   │   ├── [id]/page.tsx        # Loan details
│   │   ├── [id]/edit/page.tsx   # Edit loan
│   │   └── new/page.tsx         # New loan
│   ├── investments/
│   │   └── page.tsx             # Investment tracking
│   ├── reports/
│   │   └── page.tsx             # Reports & analytics
│   ├── import/
│   │   └── page.tsx             # CSV/PDF/OFX import
│   ├── ocr/
│   │   └── page.tsx             # Receipt scanner (OCR)
│   ├── settings/
│   │   └── page.tsx             # Settings & privacy
│   └── ...
│
├── components/budget/           # Budget app components
│   ├── TransactionModal.tsx    # Add/edit transaction
│   ├── SplitTransactionModal.tsx
│   ├── OnboardingTour.tsx       # First-time user tour
│   ├── ShortcutsModal.tsx       # Keyboard shortcuts
│   ├── PWAInstallPrompt.tsx     # PWA install prompt
│   ├── Toast.tsx                # Toast notifications
│   ├── loans/
│   │   ├── LoanForm.tsx
│   │   ├── AmortizationChart.tsx
│   │   ├── ExtraPaymentCalculator.tsx
│   │   └── PaymentHistory.tsx
│   └── ...
│
├── lib/
│   ├── budget-db.ts             # Dexie database schema (13 tables)
│   ├── budget-privacy-settings.ts
│   ├── receipt-ocr.ts           # Tesseract OCR logic
│   ├── loans/
│   │   ├── loan-db.ts           # Loan-specific DB operations
│   │   └── amortization.ts      # Loan calculations
│   └── encryption/
│       ├── budget-encryption.ts # Web Crypto API wrapper
│       └── encrypted-db-wrapper.ts
│
├── hooks/
│   ├── useKeyboardShortcuts.ts  # Keyboard navigation
│   ├── usePWA.ts                # PWA install detection
│   └── useFocusTrap.ts          # Modal accessibility
│
├── types/budget.ts              # TypeScript types
│
└── contexts/
    └── BudgetContext.tsx        # Global budget state (optional)
```

---

## 🗄️ Database Schema (Dexie.js)

**File**: `src/lib/budget-db.ts`

### Schema Version: 9

**13 Tables**:

1. **accounts** - Bank accounts
   ```typescript
   interface Account {
     id: string;
     name: string;
     institution: string;
     type: 'checking' | 'savings' | 'credit';
     balance: number;
     currency: string;
     createdAt: Date;
   }
   ```

2. **transactions** - Financial transactions
   ```typescript
   interface Transaction {
     id: string;
     accountId: string;
     date: Date;
     amount: number;
     category: string;
     description: string;
     type: 'income' | 'expense' | 'transfer';
     splitFromId?: string;  // For split transactions
     isSplit: boolean;
     receiptId?: string;
   }
   ```

3. **categories** - Transaction categories
   ```typescript
   interface Category {
     id: string;
     name: string;
     type: 'income' | 'expense';
     icon?: string;
     color?: string;
     order: number;
   }
   ```

4. **budgets** - Budget allocations
   ```typescript
   interface Budget {
     id: string;
     categoryId: string;
     amount: number;
     period: 'monthly' | 'yearly';
     startDate: Date;
     rollover: boolean;
   }
   ```

5. **loans** - Loan tracking
   ```typescript
   interface Loan {
     id: string;
     name: string;
     type: 'mortgage' | 'auto' | 'student' | 'personal';
     principal: number;
     interestRate: number;
     term: number; // months
     startDate: Date;
     monthlyPayment: number;
     status: 'active' | 'paid_off';
   }
   ```

6. **loanPayments** - Payment history
   ```typescript
   interface LoanPayment {
     id: string;
     loanId: string;
     date: Date;
     amount: number;
     principal: number;
     interest: number;
     extraPayment: number;
   }
   ```

7. **investmentAccounts** - Investment accounts
8. **holdings** - Stock/ETF holdings
9. **priceCache** - Market data cache
10. **futurePurchases** - Planned purchases
11. **retirementPlans** - Retirement planning
12. **importMappings** - CSV import mappings
13. **receipts** - OCR receipt storage

### Indexing Strategy

```typescript
this.version(9).stores({
  accounts: 'id, name, institution, type',
  transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
  categories: 'id, name, type, order',
  budgets: 'id, categoryId, period, startDate',
  loans: 'id, name, type, status, createdAt',
  loanPayments: 'id, loanId, date',
  // ... compound indexes for efficient queries
});
```

**Key Features**:
- **Migrations**: Auto-upgrade from v1 → v9
- **Transactions**: Atomic operations
- **Queries**: Indexed for performance
- **Storage**: ~50MB quota (managed by browser)

---

## 🔄 State Management

### Approach: Minimal Global State

**Philosophy**: Keep state local to components when possible, use contexts sparingly.

### State Patterns

1. **Local Component State** (90% of cases)
   ```tsx
   const [isOpen, setIsOpen] = useState(false);
   ```

2. **Database as Source of Truth**
   ```tsx
   useEffect(() => {
     db.transactions
       .where('accountId').equals(accountId)
       .toArray()
       .then(setTransactions);
   }, [accountId]);
   ```

3. **React Context** (for truly global state)
   - Theme (light/dark/high-contrast)
   - Privacy settings (AI features, encryption)
   - Onboarding tour progress

4. **URL State** (for shareable state)
   ```tsx
   const searchParams = useSearchParams();
   const filter = searchParams.get('filter'); // /transactions?filter=groceries
   ```

### Data Flow

```
User Action (e.g., "Add Transaction")
  ↓
Event Handler
  ↓
Dexie Database Write
  ↓
useEffect Re-fetch
  ↓
setState Update
  ↓
Re-render
  ↓
UI Update
```

---

## 🎨 Component Patterns

### 1. Compound Components (Modals)

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Add Transaction</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>New Transaction</DialogTitle>
    </DialogHeader>
    <TransactionForm onSubmit={handleSubmit} />
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>Cancel</Button>
      <Button type="submit">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 2. Custom Hooks (Reusable Logic)

```tsx
function useTransactions(accountId: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    db.transactions
      .where('accountId').equals(accountId)
      .toArray()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, [accountId]);

  return { transactions, loading };
}
```

### 3. Controlled Forms (React Hook Form)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
});

function TransactionForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, category: '', description: '' },
  });

  const onSubmit = (data) => {
    db.transactions.add({ ...data, id: uuid(), date: new Date() });
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

---

## 🔐 Security & Privacy

### Client-Side Encryption (Optional)

**File**: `src/lib/encryption/budget-encryption.ts`

**Features**:
- Web Crypto API (AES-GCM 256-bit)
- User-provided passphrase (PBKDF2 key derivation)
- Encrypts: transactions, accounts, budgets
- Transparent: Encrypted at rest, decrypted on read

**Usage**:

```typescript
import { encryptTransaction, decryptTransaction } from '@/lib/encryption';

// Encrypt before storing
const encrypted = await encryptTransaction(transaction, userKey);
await db.transactions.add(encrypted);

// Decrypt after reading
const decrypted = await decryptTransaction(encrypted, userKey);
```

### Privacy Features

1. **No Tracking by Default**: PostHog disabled unless user opts in
2. **Local-Only Storage**: Data never sent to server
3. **Optional AI**: ChatGPT disabled by default (settings toggle)
4. **No Third-Party Cookies**: 100% first-party
5. **Transparent**: Settings clearly explain data usage

---

## 📱 PWA Support

### Manifest (`public/manifest.json`)

```json
{
  "name": "Household Budget App",
  "short_name": "Budget",
  "start_url": "/budget-app",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#14b8a6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker

**File**: `public/sw.js` (generated by Next.js)

**Caching Strategy**:
- **App Shell**: Cache static assets (HTML, CSS, JS)
- **Offline Fallback**: Show offline page when no network
- **Runtime Caching**: Cache API responses (if used)

---

## 🧪 Testing Strategy

### Test Coverage

1. **E2E Tests** (Playwright) - **Target: 80%+**
   - `tests/budget-app-critical-flows.spec.ts`
   - Transaction CRUD, Budget creation, CSV import, Theme switching

2. **Accessibility Tests** (axe-core)
   - `tests/accessibility.spec.ts`
   - WCAG 2.2 AA compliance, Keyboard navigation, Screen readers

3. **Unit Tests** (Vitest) - **Target: 90%+**
   - Loan calculations (`src/lib/loans/amortization.test.ts`)
   - Utility functions

### Running Tests

```bash
# E2E tests
npx playwright test

# Accessibility tests
npx playwright test tests/accessibility.spec.ts

# Unit tests
npm run test
```

---

## 📊 Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Lighthouse Performance** | 90+ | Fast page loads |
| **Time to Interactive (TTI)** | <3s on 3G | Seniors often on slower connections |
| **First Load JS** | <300KB | Minimize bundle size |
| **Accessibility Score** | 95+ | WCAG 2.2 AA compliance |
| **Touch Target Size** | ≥48px | Seniors-friendly (WCAG 2.2) |
| **Base Font Size** | 18px | Readable for older adults |

### Optimizations

- **Code Splitting**: Route-based + dynamic imports
- **Image Optimization**: Next/Image with lazy loading
- **Bundle Analysis**: Webpack Bundle Analyzer
- **Database Queries**: Indexed queries (Dexie)

---

## 🚀 Build & Deployment

### Development

```bash
npm run dev  # http://localhost:3000/budget-app
```

### Production Build

```bash
npm run build  # Next.js production build
npm run start  # Start production server
```

### Deployment (Vercel)

1. Push to GitHub
2. Connect repository to Vercel
3. Auto-deploy on push to `main`

**Environment Variables**: None required (local-only app)

---

## 📝 Future Enhancements

1. **Cloud Sync** (optional): Encrypted backup to user's cloud storage
2. **Multi-Currency**: Support for international currencies
3. **Bank Integration**: Plaid/Flinks for automatic transaction import
4. **Mobile Apps**: React Native wrapper for iOS/Android
5. **Advanced Analytics**: ML-powered spending predictions

---

_Last Updated: 2025-11-09 | Status: QA & Launch Phase_
