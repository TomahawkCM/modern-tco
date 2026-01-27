# Budget App - Complete Feature & Architecture Documentation

## Overview

A full-featured personal finance management application built with Next.js 16, React 19, TypeScript, and Supabase. Supports 114 languages, 71+ bank formats, and includes AI-powered features for intelligent transaction management.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [Search System](#search-system)
5. [Dashboard & Widgets](#dashboard--widgets)
6. [Bank Import System](#bank-import-system)
7. [AI-Powered Features](#ai-powered-features)
8. [Analytics & Insights](#analytics--insights)
9. [Financial Calculators](#financial-calculators)
10. [Internationalization](#internationalization)
11. [Security & Privacy](#security--privacy)
12. [Accessibility](#accessibility)
13. [Offline & Sync](#offline--sync)
14. [State Management](#state-management)
15. [File Structure](#file-structure)

---

## Tech Stack

| Layer             | Technology                                |
| ----------------- | ----------------------------------------- |
| **Framework**     | Next.js 16.0.0 (App Router)               |
| **UI Library**    | React 19.2.0                              |
| **Language**      | TypeScript 5.9.3 (strict mode)            |
| **Database**      | Supabase PostgreSQL + IndexedDB (offline) |
| **UI Components** | shadcn/ui + Radix UI                      |
| **Styling**       | Tailwind CSS 4.x                          |
| **Charts**        | Recharts + D3.js                          |
| **AI**            | OpenAI GPT-4                              |
| **OCR**           | Tesseract.js + PDF.js                     |
| **i18n**          | next-intl (114 locales)                   |
| **State**         | React Context (18 contexts)               |
| **Auth**          | Supabase Auth                             |
| **Analytics**     | PostHog                                   |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                        │
├─────────────────────────────────────────────────────────────────┤
│  Routes (src/app/budget-app/)                                   │
│  ├── /                    Dashboard with customizable widgets   │
│  ├── /transactions        Transaction list & management         │
│  ├── /budgets             Budget allocation & tracking          │
│  ├── /categories          Category management                   │
│  ├── /reports             Financial reports & charts            │
│  ├── /import              Multi-format import wizard            │
│  ├── /export              Data export (CSV, JSON, PDF)          │
│  ├── /investments         Portfolio tracking                    │
│  ├── /loans               Loan management & amortization        │
│  ├── /subscriptions       Subscription tracking                 │
│  ├── /ocr                 Receipt & statement OCR               │
│  ├── /planning/future     Future transaction planning           │
│  ├── /planning/retirement Retirement calculator                 │
│  ├── /calculators         Financial calculators hub             │
│  ├── /calculators/*       5 financial planning calculators      │
│  ├── /friday-review       Weekly financial review               │
│  ├── /settings            User preferences                      │
│  ├── /admin               Admin dashboard                       │
│  └── /landing             Marketing landing page                │
├─────────────────────────────────────────────────────────────────┤
│  Components (src/components/budget/)                            │
│  ├── Core UI (70+ components)                                   │
│  ├── Charts & Visualizations                                    │
│  ├── Modals & Dialogs                                           │
│  ├── Layout (Sidebar, MobileNav, PageHeader)                    │
│  ├── Calculators (CurrencyInput, PercentInput, ResultsPanel)    │
│  └── Landing Page Components                                    │
├─────────────────────────────────────────────────────────────────┤
│  Business Logic (src/lib/)                                      │
│  ├── AI Services          Smart categorization, predictions     │
│  ├── Analytics            Health score, trends, forecasting     │
│  ├── Calculators          Financial planning calculators        │
│  ├── Parsers              CSV, OFX, PDF bank statement parsing  │
│  ├── Import/Export        YNAB migration, data portability      │
│  ├── Encryption           Client-side AES-256 encryption        │
│  └── Sync                  LAN sync, offline support             │
├─────────────────────────────────────────────────────────────────┤
│  State Management (src/contexts/)                               │
│  └── 18 React Contexts for global state                         │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer                                                     │
│  ├── Supabase PostgreSQL  Primary cloud database with RLS       │
│  ├── IndexedDB            Offline-first local storage           │
│  └── localStorage         User preferences & cache              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Features

### Dashboard

- **Customizable Widget Grid** - Drag-and-drop layout editor
- **7 Built-in Widgets**:
  - Account Balances (net worth tracking)
  - Recent Transactions
  - Budget Progress (envelope-style)
  - Income vs Expenses
  - Spending by Category (pie/donut chart)
  - Monthly Trends (line/bar chart)
  - Upcoming Bills
- **Dashboard Presets** - Minimal, Standard, Detailed, Analytics
- **Widget Size Controls** - Small, Medium, Large, Full-width

### Transaction Management

- **Virtual Scrolling** - Handle 100K+ transactions smoothly
- **Bulk Actions** - Multi-select categorize, delete, tag
- **Split Transactions** - Divide single transactions across categories
- **Recurring Transactions** - Auto-detect and manage recurring payments
- **Quick Categorize** - Keyboard-driven rapid categorization
- **World-Class Search** - See [Search System](#search-system) below

### Budgeting

- **Envelope Budgeting** - YNAB-style zero-based budgeting
- **Category Groups** - Hierarchical category organization
- **Rollover** - Unused budget rolls to next month
- **Goals** - Savings goals with progress tracking
- **Overspending Alerts** - Real-time notifications

### Reports & Analytics

- **Spending Trends** - Monthly/yearly comparisons
- **Category Breakdown** - Detailed spending analysis
- **Income vs Expenses** - Net income tracking
- **Sankey Diagrams** - Money flow visualization
- **Spending Heatmap** - Calendar-based spending view
- **Health Score** - Overall financial health (0-100)

### Financial Calculators

- **Emergency Fund Calculator** - Calculate target savings and timeline
- **Savings Goal Calculator** - Project savings with compound interest
- **Debt Payoff Calculator** - Compare snowball vs avalanche strategies
- **Subscription Cost Calculator** - Analyze recurring expenses
- **50/30/20 Budget Analyzer** - Evaluate spending against the 50/30/20 rule

---

## Search System

### World-Class Transaction Search

Location: `src/lib/search/`

The budget app features a comprehensive search system with multiple search modes, fuzzy matching, and offline support.

### Search Features

| Feature                | Description                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| **Fuzzy Search**       | Typo-tolerant matching via Fuse.js (e.g., "starbukcs" → "Starbucks") |
| **Structured Queries** | Filter syntax: `amount:>100`, `category:food`, `date:last-week`      |
| **Natural Language**   | Parse queries like "coffee purchases last month over $20"            |
| **Autocomplete**       | Recent searches, saved filters, and smart suggestions                |
| **Offline Indexing**   | IndexedDB-based search index for instant offline search              |

### Search Library Modules

Location: `src/lib/search/`

| Module                       | Purpose                                |
| ---------------------------- | -------------------------------------- |
| `transaction-search.ts`      | Core Fuse.js fuzzy search service      |
| `query-parser.ts`            | Structured query syntax parser         |
| `natural-language-parser.ts` | NL query interpretation                |
| `autocomplete.ts`            | Suggestion engine with recent searches |
| `offline-search-index.ts`    | IndexedDB search indexing              |
| `index.ts`                   | Barrel export                          |

### Structured Query Syntax

```
amount:>100          # Transactions over $100
amount:<50           # Transactions under $50
amount:50-200        # Transactions between $50-$200
category:food        # Food category only
category:food,travel # Multiple categories
date:today           # Today's transactions
date:this-week       # This week
date:last-month      # Last month
date:2024-01-01      # Specific date
type:expense         # Expenses only
type:income          # Income only
account:checking     # Specific account
```

### Natural Language Examples

| Query                             | Interpretation                                    |
| --------------------------------- | ------------------------------------------------- |
| "coffee last week"                | Transactions containing "coffee" from last 7 days |
| "groceries over $50"              | Grocery category, amount > $50                    |
| "amazon purchases this month"     | Amazon transactions in current month              |
| "utilities between $100 and $200" | Utility category, $100-$200 range                 |

### Search Components

Location: `src/components/budget/search/`

| Component                  | Purpose                                 |
| -------------------------- | --------------------------------------- |
| `TransactionSearchBar.tsx` | Full-featured search input with filters |
| `AmountRangeFilter.tsx`    | Min/max amount range selector           |
| `index.ts`                 | Barrel export                           |

### Search Hook

Location: `src/hooks/useTransactionSearch.ts`

```typescript
const {
  query,
  setQuery,
  results,
  isSearching,
  suggestions,
  recentSearches,
  savedFilters,
  saveFilter,
  clearRecentSearches,
} = useTransactionSearch(transactions);
```

### Command Palette Integration

- Press `Cmd/Ctrl + K` to open command palette
- Type to search transactions instantly
- Switch between command mode and search mode
- Access recent searches and saved filters

---

## Dashboard & Widgets

### Widget Registry

Location: `src/dashboard/widgets/`

| Widget                     | Description              | Sizes   |
| -------------------------- | ------------------------ | ------- |
| `AccountBalancesWidget`    | Net worth & account list | S, M, L |
| `RecentTransactionsWidget` | Latest 5-10 transactions | S, M, L |
| `BudgetProgressWidget`     | Envelope budget bars     | M, L    |
| `IncomeVsExpensesWidget`   | Bar chart comparison     | M, L    |
| `SpendingByCategoryWidget` | Pie/donut chart          | M, L    |
| `MonthlyTrendsWidget`      | Line chart trends        | L, XL   |
| `UpcomingBillsWidget`      | Scheduled payments       | S, M    |

### Dashboard Features

- `WidgetGrid.tsx` - Responsive grid layout
- `WidgetEditMode.tsx` - Drag-and-drop editing
- `DashboardCustomizer.tsx` - Widget selection modal
- `presets.ts` - Pre-configured layouts
- `widget-storage.ts` - Persist layout to localStorage

---

## Bank Import System

### Supported Formats

**File Formats:**

- CSV (71+ bank-specific configurations)
- OFX/QFX (Open Financial Exchange)
- PDF (OCR-based extraction)

**Bank Coverage by Region:**

| Region    | Banks                                                               | Count |
| --------- | ------------------------------------------------------------------- | ----- |
| Canada    | TD, RBC, Scotiabank, CIBC, Tangerine, Simplii, BMO                  | 7     |
| USA       | Chase, Bank of America, Wells Fargo, Citibank, Capital One, US Bank | 6     |
| UK        | Barclays, HSBC, Lloyds, NatWest                                     | 7     |
| Europe    | N26, Revolut, ING, Deutsche Bank                                    | 8     |
| Australia | CommBank, ANZ, Westpac, NAB                                         | 6     |
| India     | HDFC, ICICI, Axis, SBI                                              | 7     |
| Singapore | DBS, OCBC, UOB                                                      | 6     |
| SE Asia   | Bangkok Bank, Kasikorn, Maybank, CIMB, GCash, BDO                   | 7     |
| Japan     | Rakuten, Mizuho, MUFG, SMBC, Japan Post                             | 6     |
| Indonesia | BCA, Mandiri, BNI, BRI                                              | 4     |
| Vietnam   | Vietcombank, Techcombank                                            | 2     |
| Neobanks  | Wise, GrabPay, Aspire, YouTrip                                      | 5     |

**Total: 71+ pre-configured bank formats**

### Import Components

- `ImportDialog.tsx` - Main import wizard
- `BankSelectionStep.tsx` - Bank picker with search
- `ColumnMapperModal.tsx` - Manual column mapping
- `AIColumnMapperModal.tsx` - AI-assisted mapping
- `ImportWizardStepper.tsx` - Multi-step progress
- `ValidationWarningsModal.tsx` - Data quality checks
- `ErrorRecoveryModal.tsx` - Error handling & retry

### Parser Modules

Location: `src/lib/parsers/`

| Module               | Purpose                              |
| -------------------- | ------------------------------------ |
| `csv-parser.ts`      | Multi-format CSV parsing (61K lines) |
| `ofx-parser.ts`      | OFX/QFX file parsing                 |
| `pdf-ocr-parser.ts`  | PDF statement OCR                    |
| `pdf-bank-parser.ts` | Structured PDF extraction            |
| `bank-configs.ts`    | 71 bank configurations               |
| `format-detector.ts` | Auto-detect file format              |

### YNAB Migration

- `YNABMigrationWizard.tsx` - Full YNAB import
- Imports: accounts, categories, transactions, budgets
- Preserves: envelope allocations, cleared status, memo fields

---

## AI-Powered Features

Location: `src/lib/ai/`

### Smart Import

| Module                            | Function                            |
| --------------------------------- | ----------------------------------- |
| `smart-bank-detection.ts`         | Auto-detect bank from CSV structure |
| `smart-column-mapper.ts`          | AI column name mapping              |
| `smart-duplicate-detection.ts`    | Fuzzy duplicate matching            |
| `smart-transaction-enrichment.ts` | Merchant name cleanup               |
| `smart-transaction-validator.ts`  | Data quality validation             |
| `smart-error-recovery.ts`         | Import error suggestions            |

### Smart Categorization

| Module                  | Function                     |
| ----------------------- | ---------------------------- |
| `vendor-matcher.ts`     | Rule-based merchant matching |
| `ai-vendor-matcher.ts`  | AI-powered categorization    |
| `merchant-tokenizer.ts` | Merchant name parsing        |
| `vendor-learning.ts`    | Learn from user corrections  |

### Predictive Analytics

| Module                       | Function                      |
| ---------------------------- | ----------------------------- |
| `predictive-spending.ts`     | Forecast future spending      |
| `anomaly-detection.ts`       | Unusual transaction detection |
| `natural-language-import.ts` | Import via natural language   |

### AI Chatbot

- `ChatbotContext.tsx` - Chatbot state management
- `chatbot-openai-service.ts` - OpenAI integration
- `chatbot-data-access.ts` - Query user's financial data
- `chatbot-prompts.ts` - System prompts
- Full conversational interface for financial queries

---

## Analytics & Insights

Location: `src/lib/analytics/`

| Module                        | Purpose                        |
| ----------------------------- | ------------------------------ |
| `health-score.ts`             | Financial health score (0-100) |
| `weekly-insights.ts`          | Friday review summaries        |
| `spending-insights.ts`        | Spending pattern analysis      |
| `recurring-detector.ts`       | Find recurring transactions    |
| `overspending-detector.ts`    | Budget violation alerts        |
| `anomaly-detector.ts`         | Unusual spending detection     |
| `trend-forecasting.ts`        | Trend extrapolation            |
| `lstm-predictive-spending.ts` | ML-based predictions           |

### Health Score Components

- Savings rate (20% weight)
- Budget adherence (20% weight)
- Expense stability (15% weight)
- Debt ratio (15% weight)
- Emergency fund (15% weight)
- Trend direction (15% weight)

### Visualization Components

- `SpendingTrendChart.tsx` - Line/area charts
- `PredictiveSpendingChart.tsx` - Forecast visualization
- `SpendingHeatMap.tsx` - Calendar heatmap
- `HealthScoreWidget.tsx` - Gauge chart
- `HealthScoreHistory.tsx` - Score over time
- `InvestmentCharts.tsx` - Portfolio charts
- `DebtAnalysis.tsx` - Debt payoff projections

---

## Financial Calculators

Location: `src/app/budget-app/calculators/`

### Calculator Hub

Central page with cards linking to all 5 financial calculators, featuring icons, descriptions, and responsive grid layout.

### Available Calculators

| Calculator        | Description                   | Key Features                                        |
| ----------------- | ----------------------------- | --------------------------------------------------- |
| Emergency Fund    | Plan emergency savings        | Target months, progress tracking, completion date   |
| Savings Goal      | Project savings with interest | Compound interest, dual mode (date/amount)          |
| Debt Payoff       | Compare repayment strategies  | Snowball vs Avalanche, payment schedules            |
| Subscription Cost | Analyze recurring expenses    | Frequency normalization, essential vs non-essential |
| 50/30/20 Analyzer | Budget rule compliance        | Needs/Wants/Savings breakdown, variance analysis    |

### Calculator Components

Location: `src/components/budget/calculators/`

| Component            | Purpose                                             |
| -------------------- | --------------------------------------------------- |
| `CurrencyInput.tsx`  | Locale-aware currency input with RTL support        |
| `PercentInput.tsx`   | Percentage input with locale formatting             |
| `ResultsPanel.tsx`   | Formatted results display (currency, percent, date) |
| `CalculatorCard.tsx` | Calculator card for hub page                        |

### Calculation Logic

Location: `src/lib/calculators/`

| Module                 | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `types.ts`             | TypeScript interfaces for all calculators |
| `emergency-fund.ts`    | Emergency fund calculations               |
| `savings-goal.ts`      | Compound interest projections             |
| `debt-payoff.ts`       | Snowball/Avalanche algorithms             |
| `subscription-cost.ts` | Subscription cost analysis                |
| `budget-analyzer.ts`   | 50/30/20 rule analysis                    |

### Currency Support

- **72+ currencies** supported via ISO 4217 codes
- **Zero-decimal currencies**: JPY, KRW, VND, IDR, CLP, HUF, ISK, TWD, etc.
- **Locale-aware formatting**: Decimal/thousand separators per locale
- **RTL support**: Proper display for Arabic, Hebrew, Farsi, Urdu

---

## Internationalization

### Coverage

- **114 locales** with full translations
- **1,200+ translation keys** per locale (including calculators namespace)
- **RTL support** for Arabic, Hebrew, Farsi, Urdu

### Language Groups

| Region   | Locales                                     |
| -------- | ------------------------------------------- |
| English  | US, GB, AU, CA, IN, IE, NZ, SG, ZA (10)     |
| Spanish  | ES, MX, AR, + 18 Latin American (21)        |
| Chinese  | Simplified, Traditional, HK (3)             |
| French   | FR, CA, CH, BE (4)                          |
| German   | DE, AT, CH (3)                              |
| Indian   | Hindi, Bengali, Tamil, Telugu, + 5 more (9) |
| SE Asian | Thai, Vietnamese, Indonesian, + 4 more (7)  |
| European | 20+ languages                               |

### i18n Components

- `LanguageSelector.tsx` - Language picker
- `ClientI18nProvider.tsx` - Context provider
- `src/i18n/config.ts` - Locale configuration
- `src/i18n/middleware.ts` - Route localization
- `src/i18n/utils/` - Format utilities (date, currency, number)

### Format Localization

- Date formats per locale
- Number formatting (decimal/thousand separators)
- Currency symbols and positioning
- RTL text direction

---

## Security & Privacy

### Client-Side Encryption

Location: `src/lib/encryption/`

| Module                      | Purpose                    |
| --------------------------- | -------------------------- |
| `encryption.ts`             | Core AES-256 encryption    |
| `budget-encryption.ts`      | Encrypt budget data        |
| `encrypted-db-wrapper.ts`   | IndexedDB encryption layer |
| `encrypted-transactions.ts` | Transaction encryption     |
| `migrate-to-encryption.ts`  | Upgrade unencrypted data   |

### Privacy Features

- **Zero-knowledge option** - All data encrypted client-side
- **No tracking mode** - Disable all analytics
- **Data export** - Full data portability
- **Data deletion** - Complete account removal
- **Privacy settings panel** - Granular controls

### Authentication

- Supabase Auth with RLS (Row Level Security)
- Email/password authentication
- OAuth providers (Google, GitHub)
- Password reset flow
- Session management

---

## Accessibility

### WCAG 2.1 AA Compliance

- Keyboard navigation throughout
- Screen reader optimized
- Focus management
- Skip links
- High contrast support

### Accessibility Components

- `AccessibilitySettingsPanel.tsx` - User preferences
- `AccessibleChart.tsx` - Chart with data tables
- `BudgetAccessibilityInitializer.tsx` - A11y setup
- `SeniorsModeToggle.tsx` - Large text mode

### Accessibility Hooks

- `use-keyboard-navigation.ts` - Arrow key navigation
- `use-screen-reader.ts` - Announcements
- `useFocusTrap.ts` - Modal focus trapping
- `useKeyboardShortcuts.ts` - Global shortcuts

### Keyboard Shortcuts

| Shortcut       | Action          |
| -------------- | --------------- |
| `Cmd/Ctrl + K` | Command palette |
| `Cmd/Ctrl + N` | New transaction |
| `Cmd/Ctrl + I` | Import data     |
| `Cmd/Ctrl + E` | Export data     |
| `Cmd/Ctrl + /` | Show shortcuts  |
| `Cmd/Ctrl + ,` | Settings        |

---

## Offline & Sync

### Offline-First Architecture

- IndexedDB for local storage
- Service Worker for caching
- Sync queue for pending changes
- Conflict resolution

### LAN Sync

Location: `src/lib/lan-sync*.ts`

| Module                             | Purpose               |
| ---------------------------------- | --------------------- |
| `lan-sync.ts`                      | Core sync logic       |
| `lan-sync-connection.ts`           | WebSocket connections |
| `lan-sync-devices.ts`              | Device discovery      |
| `lan-sync-encryption.ts`           | E2E encryption        |
| `lan-sync-encrypted-connection.ts` | Secure transport      |

### LAN Sync Components

- `LANSyncSettings.tsx` - Configuration UI
- `lan-sync/QRCodeDisplay.tsx` - Pairing QR
- `lan-sync/QRScanner.tsx` - Scan to pair
- `lan-sync/SyncStatusIndicator.tsx` - Sync status
- `lan-sync/PairingDialog.tsx` - Device pairing

### SimpleFIN Integration

Location: `src/lib/simplefin/`

- Direct bank connection via SimpleFIN Bridge
- Automatic transaction sync
- Real-time balance updates

---

## State Management

### React Contexts (18 total)

Location: `src/contexts/`

| Context                   | Purpose                |
| ------------------------- | ---------------------- |
| `AuthContext`             | Authentication state   |
| `SettingsContext`         | User preferences       |
| `ChatbotContext`          | AI chatbot state       |
| `LANSyncContext`          | Sync status            |
| `SeniorsModeContext`      | Accessibility mode     |
| `DatabaseContext`         | IndexedDB connection   |
| `ModuleContext`           | Learning modules (LMS) |
| `ProgressContext`         | Study progress (LMS)   |
| `ExamContext`             | Exam state (LMS)       |
| `PracticeContext`         | Practice mode (LMS)    |
| `ReviewContext`           | Review sessions (LMS)  |
| `QuestionsContext`        | Question bank (LMS)    |
| `SearchContext`           | Global search          |
| `AssessmentContext`       | Assessment state       |
| `IncorrectAnswersContext` | Wrong answers review   |
| `StudySessionContext`     | Study session state    |
| `GlobalNavContext`        | Navigation state       |

### Custom Hooks

Location: `src/hooks/`

| Hook                        | Purpose                   |
| --------------------------- | ------------------------- |
| `useDatabase`               | IndexedDB operations      |
| `useLocalStorage`           | Persistent state          |
| `useOfflineSync`            | Sync status               |
| `usePWA`                    | PWA install prompt        |
| `useKeyboardShortcuts`      | Global shortcuts          |
| `useMerchantCategorization` | Category suggestions      |
| `useDashboardLayout`        | Widget layout             |
| `useThemeMode`              | Dark/light mode           |
| `useTrialStatus`            | Subscription status       |
| `useSeniorsMode`            | A11y preferences          |
| `useFocusTrap`              | Modal focus               |
| `useTransactionSearch`      | Fuzzy search with filters |

---

## File Structure

```
src/
├── app/
│   └── budget-app/
│       ├── page.tsx              # Dashboard
│       ├── layout.tsx            # App shell
│       ├── transactions/         # Transaction list
│       ├── budgets/              # Budget management
│       ├── categories/           # Category editor
│       ├── reports/              # Financial reports
│       ├── import/               # Import wizard
│       ├── export/               # Export dialog
│       ├── investments/          # Portfolio tracking
│       ├── loans/                # Loan management
│       ├── subscriptions/        # Subscription tracker
│       ├── ocr/                  # Receipt scanning
│       ├── planning/             # Future planning
│       ├── calculators/          # Financial calculators (5)
│       ├── friday-review/        # Weekly review
│       ├── settings/             # User settings
│       ├── admin/                # Admin panel
│       ├── landing/              # Marketing page
│       └── auth/                 # Authentication
├── components/
│   └── budget/
│       ├── [70+ components]      # UI components
│       ├── charts/               # Chart components
│       ├── chatbot/              # AI chatbot UI
│       ├── landing/              # Landing page
│       ├── layout/               # Sidebar, nav
│       ├── loans/                # Loan components
│       ├── lan-sync/             # Sync components
│       ├── calculators/          # Calculator inputs & results
│       ├── search/               # Search bar & filters
│       ├── settings/             # Settings panels
│       └── ui/                   # Base UI elements
├── contexts/                     # React contexts (18)
├── dashboard/
│   └── widgets/
│       ├── implementations/      # Widget components
│       ├── WidgetGrid.tsx        # Grid layout
│       ├── WidgetEditMode.tsx    # Edit mode
│       └── presets.ts            # Layout presets
├── hooks/                        # Custom hooks (20)
├── i18n/
│   ├── messages/                 # 114 locale files
│   ├── config.ts                 # i18n config
│   └── utils/                    # Format utilities
├── lib/
│   ├── ai/                       # AI services (17 modules)
│   ├── analytics/                # Analytics (8 modules)
│   ├── calculators/              # Financial calculators (6 modules)
│   ├── categorization/           # ML categorization
│   ├── encryption/               # Encryption (5 modules)
│   ├── export/                   # Export utilities
│   ├── import/                   # YNAB import
│   ├── loans/                    # Loan calculations
│   ├── parsers/                  # File parsers (6 modules)
│   ├── search/                   # Search system (6 modules)
│   ├── simplefin/                # SimpleFIN integration
│   ├── sync/                     # Sync engine
│   ├── budget-db.ts              # Database operations
│   ├── lan-sync*.ts              # LAN sync (5 modules)
│   └── [utility modules]
└── types/
    └── budget.ts                 # TypeScript types
```

---

## Performance Optimizations

- **Virtual scrolling** for large lists (100K+ items)
- **Code splitting** per route
- **Lazy loading** for charts and heavy components
- **IndexedDB** for offline-first performance
- **Service Worker** caching
- **Image optimization** via Next.js
- **Bundle analysis** with `npm run analyze`

---

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint check
npm run typecheck    # TypeScript check
npm run test         # Run tests
npm run analyze      # Bundle analysis
```

### Testing

- Vitest for unit tests
- Playwright for E2E tests
- `src/lib/__tests__/` - Unit test location

---

## Deployment

- **Platform**: Vercel
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **Environment Variables**: See `.env.example`

---

## License

Proprietary - All rights reserved.
