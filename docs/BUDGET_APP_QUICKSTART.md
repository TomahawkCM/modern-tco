# Budget App - Quick Start Guide

## Get Started

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase project with `SUPABASE_ACCESS_TOKEN` configured

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Environment

Copy `.env.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_ACCESS_TOKEN=your-access-token
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key  # optional
```

### Step 3: Start the App

```bash
npm run dev
```

Open your browser to: **http://localhost:3000/budget-app**

> Note: First startup may take 30-60 seconds due to webpack compilation with `--max-old-space-size=8192`.

---

## What You Get

### Pages

- **Dashboard** - Financial overview with metric cards, spending charts, recurring detection
- **Transactions** - View, search, filter, split, bulk categorize
- **Import** - CSV, PDF, and OCR bank statement import with format auto-detection
- **Budgets** - Budget creation and tracking with progress bars
- **Investments** - Portfolio tracking with live market data (Yahoo Finance)
- **Net Worth** - Net worth dashboard with forecasting
- **Reports** - Spending heat map, category breakdown, trends
- **Calculators** - Retirement, mortgage, savings goal calculators
- **Settings** - Account management, categories, preferences
- **Admin** - User management, system stats (admin role required)

### Key Features

- Multi-format bank import (CSV/PDF/OCR) with AI merchant matching
- Auto-categorization with confidence meters and learning
- Split transactions (2-5 way)
- Receipt attachments with thumbnail preview
- Keyboard shortcuts (press `?` for help)
- End-to-end encryption for PII data
- PWA support (installable, offline-capable)
- 113-locale internationalization (next-intl)

---

## Architecture

| Layer          | Technology                                       |
| -------------- | ------------------------------------------------ |
| Framework      | Next.js 16, React 19                             |
| Language       | TypeScript 5.9 (strict mode)                     |
| Database       | Supabase PostgreSQL + Dexie.js (IndexedDB cache) |
| UI             | shadcn/ui + Radix UI, Tailwind CSS               |
| State          | 18 React contexts                                |
| Auth           | Supabase Auth                                    |
| Encryption     | AES-256-GCM via `encrypted-db-wrapper.ts`        |
| Charts         | Recharts                                         |
| i18n           | next-intl (113 locales)                          |
| Financial math | Decimal.js (never floating point)                |

---

## Quick Commands

```bash
npm run dev            # Dev server (8GB memory)
npm run build          # Production build (16GB memory)
npm run lint           # ESLint
npm run check-types    # TypeScript checking
npm test               # Vitest unit tests
npm run e2e            # Playwright E2E tests
npm run format         # Prettier formatting
```

---

## Key Directories

```
src/app/budget-app/          # 36 pages
src/components/budget/       # 50+ components
src/contexts/                # 18 React contexts
src/lib/                     # Utils, parsers, encryption
src/app/api/                 # 22 API routes
src/i18n/messages/           # 113 locale files
supabase/migrations/         # Database migrations
```

---

## Data Privacy

- All PII encrypted at rest (AES-256-GCM)
- Zero-knowledge architecture — server never sees plaintext
- Local IndexedDB cache for offline access
- Use `encrypted-db-wrapper.ts` for all sensitive data operations

---

## Documentation

| File                          | Contents                   |
| ----------------------------- | -------------------------- |
| `docs/BUDGET_APP_FEATURES.md` | Feature documentation      |
| `docs/BUDGET_APP_PRD.md`      | Product requirements       |
| `docs/BUDGET_APP_TESTING.md`  | Testing guide              |
| `docs/PRIVACY.md`             | Privacy and encryption     |
| `docs/SESSION_TRACKER.md`     | Implementation session log |
| `.claude/CLAUDE.md`           | Development conventions    |
