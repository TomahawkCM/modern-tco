---
paths:
  - "src/app/budget-app/**"
  - "src/components/budget/**"
  - "src/lib/encryption/**"
---

# Budget App Rules

- All PII and financial data must use encrypted storage via `encrypted-db-wrapper.ts`
- Financial amounts: always use `Decimal.js` — never use floating point arithmetic for money
- All user-facing text must be locale-aware using `useTranslations` from `next-intl` (113 locales supported)
- Offline-first architecture: no network calls required for core functionality in offline mode
- Amount parsing must handle multiple formats: US (1,234.56), EU (1.234,56), Indian (1,23,456.78), Brazilian (1.234,56), Japanese (1,234)
- Date parsing must handle: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, DD.MM.YYYY and locale-specific formats
- Use `src/lib/parsers/` for all import parsing (CSV, PDF, QIF, MT940, CAMT.053)
- Budget components live in `src/components/budget/` — keep them self-contained
- Account types: checking, savings, credit, investments, loans — handle each appropriately
- Use Zod for validation of all user input and imported data
