# Contributing to Tanium TCO Modern

Thank you for your interest in contributing! This document provides guidelines and setup instructions for developers.

---

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Workflow & PR Process](#workflow--pr-process)
- [Testing](#testing)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Development Setup

### Prerequisites

- **Node.js**: v18+ (recommended: v20 LTS)
- **npm**: v9+
- **Git**: Latest version
- **PostgreSQL** (optional, for TCO LMS features)
- **Chrome/Chromium** (for Playwright tests)

### Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/TomahawkCM/modern-tco.git
cd modern-tco

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Run development server
npm run dev

# 5. Access the app
# - Main app: http://localhost:3000
# - Budget app: http://localhost:3000/budget-app
```

### Environment Variables

Create `.env.local` with the following:

```env
# OpenAI (for AI features)
OPENAI_API_KEY=your_key_here

# Supabase (optional, for TCO LMS PostgreSQL backend)
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PostHog (optional, for analytics)
NEXT_PUBLIC_POSTHOG_KEY=your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 📂 Project Structure

```
modern-tco/
├── src/
│   ├── app/
│   │   ├── budget-app/         # Budget app (local-first, IndexedDB)
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── transactions/   # Transactions page
│   │   │   ├── budgets/        # Budgets page
│   │   │   ├── loans/          # Loan amortization
│   │   │   ├── investments/    # Investment tracking
│   │   │   ├── reports/        # Reports & analytics
│   │   │   ├── import/         # CSV/PDF/OFX import
│   │   │   ├── settings/       # Settings & privacy
│   │   │   └── layout.tsx      # Budget app layout
│   │   ├── (tco-lms)/          # TCO LMS (PostgreSQL backend)
│   │   │   ├── welcome/
│   │   │   ├── learn/
│   │   │   ├── practice/
│   │   │   ├── mock/
│   │   │   └── review/
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── budget/             # Budget app components
│   │   │   ├── TransactionModal.tsx
│   │   │   ├── SplitTransactionModal.tsx
│   │   │   ├── loans/          # Loan-specific components
│   │   │   └── ...
│   │   ├── ui/                 # shadcn/ui components
│   │   └── ...
│   ├── lib/
│   │   ├── budget-db.ts        # Dexie (IndexedDB) database
│   │   ├── loans/              # Loan calculation logic
│   │   ├── encryption/         # Client-side encryption
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   ├── contexts/               # React contexts (11+ contexts)
│   └── types/                  # TypeScript type definitions
├── tests/                      # Playwright E2E tests
├── docs/                       # Project documentation
├── scripts/                    # Build & deployment scripts
├── public/                     # Static assets
└── supabase/                   # Supabase migrations (TCO LMS)
```

### Architecture Overview

**Two Main Applications**:

1. **Budget App** (Local-First):
   - IndexedDB storage (Dexie.js)
   - 100% offline functionality
   - PWA support
   - Client-side encryption (optional)
   - No backend required

2. **TCO LMS** (Cloud Backend):
   - PostgreSQL (Supabase)
   - User authentication
   - Spaced repetition system
   - Mock exams & gamification

---

## 🎨 Coding Standards

### TypeScript

- **Strict Mode**: Enabled (`strict: true`)
- **No `any`**: Use specific types or `unknown`
- **Interface vs Type**: Use `interface` for objects, `type` for unions/primitives
- **File Naming**:
  - Components: `PascalCase.tsx`
  - Utilities: `camelCase.ts`
  - Constants: `UPPER_SNAKE_CASE.ts`

### React

- **Functional Components**: Always use function components with hooks
- **TypeScript Props**: Define prop interfaces explicitly
  ```tsx
  interface MyComponentProps {
    title: string;
    count?: number; // Optional props with ?
  }

  export function MyComponent({ title, count = 0 }: MyComponentProps) {
    return <div>{title}: {count}</div>;
  }
  ```
- **Client Components**: Use `'use client'` directive when needed (state, effects, browser APIs)
- **Server Components**: Default for data fetching, static rendering

### Styling

- **Tailwind CSS**: Primary styling system
- **Class Ordering**: Use `cn()` utility for conditional classes
  ```tsx
  import { cn } from '@/lib/utils';

  <div className={cn(
    "base-classes",
    condition && "conditional-classes",
    "more-classes"
  )} />
  ```
- **Responsive**: Mobile-first breakpoints
  - `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)

### Naming Conventions

- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Components**: `PascalCase`
- **Files**: Match export name (`MyComponent.tsx`)
- **Database Tables**: `snake_case`
- **API Routes**: `kebab-case`

---

## 🔄 Workflow & PR Process

### Branch Naming

```
feature/add-loan-calculator
fix/transaction-modal-crash
docs/update-readme
refactor/database-layer
test/budget-e2e
```

### Commit Messages

Follow Conventional Commits:

```
feat: Add loan amortization calculator
fix: Resolve transaction modal crash on empty category
docs: Update CONTRIBUTING.md with test guidelines
refactor: Extract database logic into separate module
test: Add E2E tests for budget creation workflow
chore: Update dependencies to latest versions
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes & Commit**
   ```bash
   git add .
   git commit -m "feat: Add my feature"
   ```

3. **Run Quality Checks** (before pushing)
   ```bash
   npm run typecheck       # TypeScript compilation
   npm run lint            # ESLint
   npm run format:check    # Prettier
   npm run test            # Unit tests (Vitest)
   ```

4. **Push & Create PR**
   ```bash
   git push origin feature/my-feature
   # Create PR on GitHub with description
   ```

5. **PR Checklist**
   - [ ] Tests pass (`npm run test`)
   - [ ] Type check passes (`npm run typecheck`)
   - [ ] Linter passes (`npm run lint`)
   - [ ] No console errors in browser
   - [ ] Accessibility verified (keyboard nav, screen reader)
   - [ ] Mobile responsive (test on 375px viewport)
   - [ ] Description explains what & why

6. **Review & Merge**
   - Address review feedback
   - Squash commits if needed
   - Merge via GitHub

---

## 🧪 Testing

### Running Tests

```bash
# Unit tests (Vitest)
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report

# E2E tests (Playwright)
npx playwright test                              # All E2E tests
npx playwright test tests/budget-app.spec.ts     # Specific file
npx playwright test --ui                         # UI mode
npx playwright test --headed                     # Headed mode

# Accessibility tests
npx playwright test tests/accessibility.spec.ts

# Type checking
npm run typecheck         # Check all TypeScript
npm run typecheck -- --watch  # Watch mode
```

### Writing Tests

**E2E Test Example** (`tests/my-feature.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss onboarding tour
    await page.addInitScript(() => {
      localStorage.setItem('budget-app-tour-completed', 'true');
    });

    await page.goto('/budget-app/my-feature');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    const button = page.getByRole('button', { name: /click me/i });
    await button.click();

    await expect(page.locator('text=/success/i')).toBeVisible();
  });
});
```

**Unit Test Example** (`src/lib/my-util.test.ts`):

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-util';

describe('myFunction', () => {
  it('should return correct result', () => {
    expect(myFunction(1, 2)).toBe(3);
  });

  it('should handle edge cases', () => {
    expect(myFunction(0, 0)).toBe(0);
  });
});
```

### Test Coverage Goals

- **Critical Paths**: 80%+ coverage
- **UI Components**: Manual testing + E2E
- **Utilities**: 90%+ unit test coverage
- **Accessibility**: WCAG 2.2 AA compliance

---

## 🗄️ Database Management

### Budget App (IndexedDB with Dexie)

**Schema Location**: `src/lib/budget-db.ts`

**Tables**:
- `accounts` - Bank accounts
- `transactions` - Financial transactions
- `categories` - Transaction categories
- `budgets` - Budget allocations
- `loans` - Loan tracking
- `loanPayments` - Payment history
- `investmentAccounts` - Investment accounts
- `holdings` - Stock/ETF holdings
- `receipts` - OCR receipt storage

**Adding a New Table**:

```typescript
// In src/lib/budget-db.ts

// 1. Add table to class
export class BudgetDatabase extends Dexie {
  myNewTable!: Table<MyNewType>;

  constructor() {
    super('HouseholdBudgetApp');

    // 2. Increment version & add schema
    this.version(10).stores({
      // ... existing tables ...
      myNewTable: 'id, field1, field2'  // Indexed fields
    });
  }
}

// 3. Define type in src/types/budget.ts
export interface MyNewType {
  id: string;
  field1: string;
  field2: number;
  createdAt: Date;
}
```

### TCO LMS (PostgreSQL via Supabase)

**Migrations**: `supabase/migrations/`

**Running Migrations**:

```bash
# Apply all migrations
npm run db:migrate

# Verify schema
npm run db:verify

# Seed data (questions, modules)
npm run content:seed
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect GitHub Repository**
   - Sign in to [Vercel](https://vercel.com)
   - Import `modern-tco` repository

2. **Environment Variables**
   - Add all `.env.local` variables in Vercel dashboard
   - Settings → Environment Variables

3. **Build Settings**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy**
   - Push to `main` branch triggers auto-deploy
   - Preview deployments on all PRs

### Build Optimization

**Bundle Size** (target: <300KB initial):

```bash
# Analyze bundle
npm run build
# Check .next/static/chunks for large bundles

# Code splitting
# - Use dynamic imports for heavy components
# - Lazy load routes with next/dynamic
```

**Performance** (target: Lighthouse 90+):

```bash
# Run Lighthouse
npm run lighthouse

# Optimize:
# - Lazy load images (<Image> component)
# - Minimize JavaScript bundles
# - Enable caching headers
# - Use CDN for static assets
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "npm install fails"**

```bash
# Clear cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
npm install
```

**2. "Port 3000 already in use"**

```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**3. "TypeScript errors after pulling"**

```bash
# Reinstall dependencies
npm install

# Clear Next.js cache
rm -rf .next

# Restart TypeScript server (VSCode)
# Cmd+Shift+P → "Restart TypeScript Server"
```

**4. "Budget app data not persisting"**

- Check browser console for IndexedDB errors
- Ensure third-party cookies enabled (some browsers block IndexedDB in private mode)
- Clear site data: DevTools → Application → Storage → Clear site data

**5. "Playwright tests failing"**

```bash
# Install browsers
npx playwright install chromium

# Update Playwright
npm install -D @playwright/test@latest

# Run with debug
npx playwright test --debug
```

---

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Dexie.js (IndexedDB)**: https://dexie.org
- **shadcn/ui**: https://ui.shadcn.com
- **Playwright**: https://playwright.dev

---

## 📞 Getting Help

- **Issues**: https://github.com/TomahawkCM/modern-tco/issues
- **Discussions**: https://github.com/TomahawkCM/modern-tco/discussions
- **Documentation**: `/docs` directory

---

## 🎉 Thank You!

Your contributions make this project better for everyone. Happy coding! 🚀
