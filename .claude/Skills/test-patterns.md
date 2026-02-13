---
name: test-patterns
description: Use when writing unit tests, E2E tests, or setting up test fixtures for budget app features. Provides testing patterns for encryption, Decimal.js, IndexedDB, i18n, and Supabase.
---

# Test Patterns

## Overview

Standardized testing patterns for the budget app covering unit tests (Vitest), E2E tests (Playwright), and integration tests. Includes specific patterns for encrypted data, financial math with Decimal.js, IndexedDB mocking, and i18n-aware components.

## When to Use

- Writing unit tests for any budget app feature
- Setting up E2E test flows with Playwright
- Mocking IndexedDB, Supabase, or encryption
- Testing financial calculations (Decimal.js)
- Testing i18n-aware components
- Organizing test fixtures

## Core Principles

- **Test behavior, not implementation** — Assert on outputs, not internal state
- **Use real crypto in tests** — Don't mock encryption; use `fake-indexeddb` + real encrypt/decrypt
- **Decimal.js for assertions** — Never use `toBeCloseTo()` for money; use exact Decimal comparison
- **Isolate per test** — Each test gets fresh IndexedDB, fresh encryption key
- **Fixtures over factories** — Use shared fixture files for consistent test data

## Workflow

### Step 1: Unit Test Setup (Vitest)

File naming: `tests/<feature>.test.ts` or `src/<path>/<file>.test.ts`

```ts
// vitest.config.ts already configures:
// - jsdom environment for component tests
// - fake-indexeddb for storage tests
// - path aliases (@/ → src/)

import { describe, it, expect, beforeEach, vi } from 'vitest';
```

### Step 2: IndexedDB Tests

```ts
import 'fake-indexeddb/auto';

describe('transaction storage', () => {
  beforeEach(() => {
    // Reset IndexedDB between tests
    indexedDB = new IDBFactory();
  });

  it('stores and retrieves transactions', async () => {
    const db = await openDB('budget', 1);
    await db.put('transactions', { id: '1', amount: '-25.50' });
    const result = await db.get('transactions', '1');
    expect(result.amount).toBe('-25.50');
  });
});
```

### Step 3: Encryption Tests

```ts
import 'fake-indexeddb/auto';
import { encrypt, decrypt, deriveKey } from '@/lib/encryption/budget-encryption';

describe('encrypted data', () => {
  let key: CryptoKey;

  beforeAll(async () => {
    key = await deriveKey('test-passphrase-123', 'test-salt-abc');
  });

  it('encrypts and decrypts transaction data', async () => {
    const original = {
      amount: '-45.99',
      description: 'Grocery Store',
      merchant: 'Whole Foods',
    };

    const { ciphertext, iv, authTag } = await encrypt(
      JSON.stringify(original),
      key
    );

    // Ciphertext should be different from plaintext
    expect(ciphertext).not.toContain('Grocery');

    const decrypted = JSON.parse(
      await decrypt(ciphertext, key, iv, authTag)
    );
    expect(decrypted).toEqual(original);
  });

  it('rejects tampered ciphertext', async () => {
    const { ciphertext, iv, authTag } = await encrypt('secret', key);
    const tampered = ciphertext.slice(0, -4) + 'XXXX';
    await expect(decrypt(tampered, key, iv, authTag)).rejects.toThrow();
  });
});
```

### Step 4: Decimal.js Financial Tests

```ts
import Decimal from 'decimal.js';

describe('financial calculations', () => {
  it('calculates budget remaining correctly', () => {
    const budget = new Decimal('1000.00');
    const spent = new Decimal('745.53');
    const remaining = budget.minus(spent);

    // Use exact comparison, never toBeCloseTo()
    expect(remaining.toString()).toBe('254.47');
    expect(remaining.toNumber()).toBe(254.47);
  });

  it('handles currency addition without floating point errors', () => {
    const a = new Decimal('0.1');
    const b = new Decimal('0.2');
    expect(a.plus(b).toString()).toBe('0.3'); // Not 0.30000000000000004
  });

  it('calculates percentage of budget used', () => {
    const spent = new Decimal('750');
    const budget = new Decimal('1000');
    const pct = spent.div(budget).times(100).toDecimalPlaces(1);
    expect(pct.toString()).toBe('75.0');
  });
});
```

### Step 5: i18n Component Tests

```tsx
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/i18n/messages/en.json';

function renderWithI18n(component: React.ReactNode, locale = 'en') {
  return render(
    <NextIntlClientProvider messages={messages} locale={locale}>
      {component}
    </NextIntlClientProvider>
  );
}

describe('BudgetSummary', () => {
  it('displays translated budget label', () => {
    renderWithI18n(<BudgetSummary amount="1000" />);
    expect(screen.getByText(/budget/i)).toBeInTheDocument();
  });
});
```

### Step 6: Supabase Mock

```ts
import { vi } from 'vitest';

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  })),
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));
```

### Step 7: E2E Tests (Playwright)

```ts
// tests/e2e/budget-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Budget App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/budget-app');
  });

  test('creates a new transaction', async ({ page }) => {
    await page.click('[data-testid="add-transaction"]');
    await page.fill('[data-testid="amount-input"]', '45.99');
    await page.fill('[data-testid="description-input"]', 'Test Transaction');
    await page.click('[data-testid="save-button"]');

    await expect(page.locator('[data-testid="transaction-list"]'))
      .toContainText('45.99');
  });

  test('imports CSV file', async ({ page }) => {
    await page.goto('/budget-app/import');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample.csv');

    await expect(page.locator('[data-testid="import-preview"]'))
      .toBeVisible();
  });
});
```

### Step 8: Test Fixture Organization

```
tests/
  fixtures/
    csv/           → Sample CSV files for import testing
    pdf/           → Sample PDF bank statements
    qif/           → QIF format files
    mt940/         → MT940 format files
    camt053/       → CAMT.053 format files
    transactions/  → JSON transaction fixtures
    encryption/    → Pre-encrypted test data
  e2e/             → Playwright E2E tests
  *.test.ts        → Unit tests
```

## Key Files

| File | Role |
|------|------|
| `vitest.config.ts` | Unit test configuration |
| `playwright.config.ts` | E2E test configuration |
| `tests/` | All test files and fixtures |
| `tests/fixtures/` | Shared test data |
| `tests/e2e/` | Playwright E2E tests |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `toBeCloseTo()` for money | Use `Decimal.toString()` exact comparison |
| Mocking encryption instead of using real crypto | Use `fake-indexeddb` + real `encrypt/decrypt` |
| Not resetting IndexedDB between tests | Add `indexedDB = new IDBFactory()` in `beforeEach` |
| Hardcoding English strings in assertions | Use i18n keys or `renderWithI18n()` helper |
| E2E tests depending on specific data state | Set up test data in `beforeEach`, clean up in `afterEach` |
| Testing implementation details (internal state) | Assert on rendered output or function return values |

## Validation Checklist

- [ ] All tests pass: `npm test`
- [ ] E2E tests pass: `npm run e2e`
- [ ] No `toBeCloseTo()` used for financial amounts
- [ ] Encryption tests use real crypto (not mocked)
- [ ] IndexedDB properly reset between tests
- [ ] Fixtures in `tests/fixtures/` (not inline test data for shared data)
- [ ] E2E tests use `data-testid` attributes for selectors

## Related Skills

- `e2e-encryption` — encryption patterns to test
- `financial-calculator` — Decimal.js math patterns to test
- `import-pipeline` — import flow E2E test patterns
