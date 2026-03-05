# S12 — PDF Text Extraction Integration + Parser Tests

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate existing native PDF text extraction into the import pipeline (try text first, fall back to OCR) and add tests for pdf-text-extractor and transaction-normalizer.

**Architecture:** `pdf-text-extractor.ts` and `transaction-normalizer.ts` already exist but aren't wired into the import flow. The import page currently always uses OCR. This session adds the smart routing: text extraction first, OCR fallback.

**Tech Stack:** pdfjs-dist (already installed), Tesseract.js, Vitest

---

## Batch 1: Tests for existing parsers

### Task 1: Tests for transaction-normalizer

**Files:**

- Create: `src/lib/parsers/__tests__/transaction-normalizer.test.ts`

Tests: normalizeTransaction handles date strings, amount strings, description cleanup, currency detection. normalizeTransactions processes arrays.

### Task 2: Tests for pdf-text-extractor

**Files:**

- Create: `src/lib/parsers/__tests__/pdf-text-extractor.test.ts`

Note: pdf-text-extractor depends on browser APIs (pdfjs-dist). Tests will verify exports exist and type contracts. Full integration requires browser environment.

---

## Batch 2: Import pipeline integration

### Task 3: Integrate text extraction into import page

**Files:**

- Modify: `src/app/budget-app/import/page.tsx`

Logic: For PDF files, try `pdfHasText()` first. If text layer exists, use `extractPdfText()` and parse directly. If no text layer, fall back to OCR via `extractBankStatementData()`.

### Task 4: Update SESSION_TRACKER + gap analysis

**Files:**

- Modify: `Online Budget app/docs/SESSION_TRACKER.md`
- Modify: `docs/BUDGET_APP_GAP_ANALYSIS_2026-03-03.md`

---

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx vitest run` — all existing + new tests pass
- `npx eslint . --quiet` — 0 errors
