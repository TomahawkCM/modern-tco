# Codebase Reference

## Product Overview

**Online Budget App** - A privacy-first personal finance manager with end-to-end encryption, multi-format bank import, and AI-powered categorization. Part of the Modern TCO dual-app monorepo.

## Technical Stack

- **Framework**: Next.js 16, React 19, TypeScript 5.9 (strict mode)
- **Database**: Supabase PostgreSQL (server) + Dexie.js IndexedDB (client cache)
- **UI**: shadcn/ui + Radix UI, Tailwind CSS
- **State**: 18 React contexts in `src/contexts/`
- **Charts**: Recharts
- **ML**: TensorFlow.js (`src/lib/analytics/lstm-predictive-spending.ts`)
- **i18n**: next-intl (113 locales in `src/i18n/messages/`)
- **Financial math**: Decimal.js (never floating point)
- **Encryption**: AES-256-GCM via `src/lib/encrypted-db-wrapper.ts`
- **Auth**: Supabase Auth with admin role support
- **API**: 22 routes in `src/app/api/`
- **Deployment**: Vercel (CLI deploy, git integration disabled)

## Key Features

### 1. Multi-Format Bank Import
- CSV, PDF, and OCR bank statement import (`src/app/budget-app/import/`)
- Format auto-detection with configurable parser pipeline
- Supports BMO, Home Trust, and generic Canadian bank formats
- Duplicate detection and batch import

### 2. AI-Powered Transaction Categorization
- TensorFlow.js LSTM model for predictive spending
- Rule-based engine with 50+ Canadian merchant patterns
- Confidence scoring with visual meters
- Learns from user corrections

### 3. Investment Tracking
- Portfolio management with live market data (Yahoo Finance)
- Account types: TFSA, RRSP, non-registered
- Holdings with real-time price updates
- Charts: allocation pie, performance bar, area chart
- `src/app/budget-app/investments/page.tsx`

### 4. Net Worth Dashboard
- Net worth tracking with forecasting
- Asset and liability management
- Export to spreadsheet
- `src/app/budget-app/net-worth/client.tsx`

### 5. Budget Management
- Create budgets by category with templates (50/30/20, custom)
- Track spending vs budget with progress bars
- Rollover support, visual alerts for over-budget

### 6. Transaction Management
- Split transactions (2-5 way)
- Bulk categorization with multi-select
- Receipt attachments with thumbnail preview
- Recurring transaction detection
- Keyboard shortcuts (press `?` for help)

### 7. Financial Calculators
- Retirement calculator, mortgage calculator, savings goals
- `src/app/budget-app/calculators/`

### 8. Reports & Analytics
- Spending heat map, category breakdowns, trends
- `src/app/budget-app/reports/`

### 9. Data Privacy & Security
- End-to-end encryption for all PII (AES-256-GCM)
- Zero-knowledge architecture — server never sees plaintext
- Supabase RLS policies for row-level security
- Encrypted local cache via IndexedDB

### 10. Admin Dashboard
- User management, system statistics
- Admin role required
- `src/app/budget-app/admin/`

### 11. PWA Support
- Service worker for offline capability
- Install prompt after 3 visits
- Manifest with icons

## Codebase Structure

```
src/app/budget-app/          # 36 pages
src/components/budget/       # 50+ components
src/contexts/                # 18 React contexts
src/lib/                     # Utils, parsers, encryption, analytics
src/app/api/                 # 22 API routes
src/i18n/messages/           # 113 locale files
supabase/migrations/         # Database schema migrations
```

## External Integrations

- **Supabase**: PostgreSQL database, auth, real-time subscriptions
- **OpenAI**: AI merchant matching for import pipeline
- **SimpleFIN**: Bank connection aggregator (planned)
- **Yahoo Finance**: Live market data for investment tracking
- **PostHog**: Analytics (optional, requires `NEXT_PUBLIC_POSTHOG_KEY`)

## Target Users

- Privacy-conscious individuals and families
- Canadian users (pre-configured bank formats and merchant rules)
- Users who want control over their financial data with encryption
- People managing budgets, investments, and net worth in one app
