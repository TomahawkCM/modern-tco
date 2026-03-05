# S11 — OCR Pipeline Internationalization

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the broken non-English PDF import by removing the ASCII whitelist, wiring the existing i18n parsers into the OCR pipeline, and adding language parameters throughout.

**Architecture:** The i18n infrastructure already exists (`tesseract-lang-map.ts`, `intl-amount-parser.ts`, `intl-date-parser.ts`) but is not wired into the 3 OCR files (`pdf-ocr-parser.ts`, `bank-statement-ocr.ts`, `receipt-ocr.ts`). This session integrates the existing parsers and removes hardcoded English.

**Tech Stack:** Tesseract.js, `@internationalized/number`, `chrono-node`, TypeScript

---

## Batch 1: Fix pdf-ocr-parser.ts + bank-statement-ocr.ts

### Task 1: Remove ASCII whitelist from pdf-ocr-parser.ts

**Files:**

- Modify: `src/lib/parsers/pdf-ocr-parser.ts:251-254`

**Step 1:** Remove `tessedit_char_whitelist` from Tesseract parameters (line 252-253). Keep `preserve_interword_spaces`.

**Step 2:** Verify `language` parameter already exists at line 235 (default `"eng"`) — confirmed, no change needed.

**Step 3:** Run `npx tsc --noEmit` — 0 errors expected.

---

### Task 2: Wire language parameter into bank-statement-ocr.ts

**Files:**

- Modify: `src/lib/bank-statement-ocr.ts:80-84,127`

**Step 1:** Add `language?: string` parameter to `extractBankStatementData()` (line 80-84).

**Step 2:** Import `getOCRLanguage` from `./parsers/tesseract-lang-map`.

**Step 3:** Replace hardcoded `"eng"` at line 127 with `language ?? "eng"`.

**Step 4:** Run `npx tsc --noEmit` — 0 errors expected.

---

### Task 3: Replace English-only date parsing in bank-statement-ocr.ts

**Files:**

- Modify: `src/lib/bank-statement-ocr.ts:675-734,838-856`

**Step 1:** Import `parseDate` from `./parsers/intl-date-parser`.

**Step 2:** Replace `extractDateFromLine()` body with call to `parseDate(line)`, keeping the same validation (not future, not >10 years old).

**Step 3:** Delete the now-unused `getMonthNumber()` function (lines 838-856).

**Step 4:** Run `npx tsc --noEmit` — 0 errors expected.

---

## Batch 2: Fix bank-statement-ocr amounts + receipt-ocr.ts

### Task 4: Replace English-only amount parsing in bank-statement-ocr.ts

**Files:**

- Modify: `src/lib/bank-statement-ocr.ts:740-789`

**Step 1:** Import `parseAmount` from `./parsers/intl-amount-parser`.

**Step 2:** Replace `extractAmountFromLine()` body:

- Try `parseAmount(line)` first
- Fall back to existing regex patterns for edge cases (parentheses negation)
- Preserve rightmost-amount logic for multi-amount lines

**Step 3:** Run `npx tsc --noEmit` — 0 errors expected.

---

### Task 5: Wire language parameter into receipt-ocr.ts

**Files:**

- Modify: `src/lib/receipt-ocr.ts:53-54,98-99`

**Step 1:** Add `language?: string` parameter to `extractFromImage()` and `extractFromPdf()`.

**Step 2:** Replace hardcoded `"eng"` at lines 54 and 99 with `language ?? "eng"`.

**Step 3:** Update the main `extractReceiptData()` export to accept and pass `language`.

**Step 4:** Run `npx tsc --noEmit` — 0 errors expected.

---

### Task 6: Replace English-only date/amount parsing in receipt-ocr.ts

**Files:**

- Modify: `src/lib/receipt-ocr.ts:287-414`

**Step 1:** Import `parseDate` from `./parsers/intl-date-parser` and `parseAmount` from `./parsers/intl-amount-parser`.

**Step 2:** Replace `extractAmount()`:

- Try total label patterns first (TOTAL, AMOUNT, etc.) but use `parseAmount()` on matched text
- Fall back to `parseAmount()` for general amount detection

**Step 3:** Replace `extractDate()`:

- Use `parseDate(text)` with same validation (not future, not >5 years old)

**Step 4:** Delete now-unused `getMonthNumber()` function (lines 396-414).

**Step 5:** Run `npx tsc --noEmit` — 0 errors expected.

---

## Batch 3: Tests + Integration + SESSION_TRACKER

### Task 7: Write tests for OCR i18n integration

**Files:**

- Create: `src/lib/__tests__/bank-statement-ocr-i18n.test.ts`
- Create: `src/lib/__tests__/receipt-ocr-i18n.test.ts`

**Tests for bank-statement-ocr-i18n.test.ts:**

1. `extractDateFromLine` parses German date (15. Jan 2025)
2. `extractDateFromLine` parses Spanish date (15 Ene 2025)
3. `extractDateFromLine` parses French date (15 Fev 2025)
4. `extractDateFromLine` parses numeric EU format (15/01/2025)
5. `extractAmountFromLine` parses EU format (1.234,56)
6. `extractAmountFromLine` parses BR format (R$ 1.234,56)
7. `extractAmountFromLine` parses negative with parentheses (1.234,56)
8. `extractAmountFromLine` preserves US format ($1,234.56)

**Tests for receipt-ocr-i18n.test.ts:**

1. `extractAmount` finds EUR total (TOTAL: 12,50 EUR)
2. `extractDate` parses French date (15 Fev 2025)
3. `extractDate` parses ISO date (2025-01-15)

### Task 8: Wire language through import page

**Files:**

- Modify: `src/app/budget-app/import/page.tsx:616-618`

**Step 1:** Pass user locale to `extractBankStatementData()` via `getOCRLanguage(locale)`.
**Step 2:** The locale is already available via `useLocale()` from next-intl.

### Task 9: Update SESSION_TRACKER + gap analysis

**Files:**

- Modify: `Online Budget app/docs/SESSION_TRACKER.md`
- Modify: `docs/BUDGET_APP_GAP_ANALYSIS_2026-03-03.md`

---

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx vitest run` — all existing + new tests pass
- `npx eslint . --quiet` — 0 errors
- ASCII whitelist removed from pdf-ocr-parser.ts
- bank-statement-ocr.ts uses intl-date-parser and intl-amount-parser
- receipt-ocr.ts uses intl-date-parser and intl-amount-parser
- Language parameter flows from import page → OCR functions
