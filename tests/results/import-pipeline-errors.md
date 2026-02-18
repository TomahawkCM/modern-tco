# Import Pipeline Test Results

**Run date**: 2026-02-08
**Playwright version**: 1.55.1
**Node**: v22+
**Test file**: `tests/e2e/import-formats.spec.ts`

## Summary

| Category                                  | Passed | Failed | Total  |
| ----------------------------------------- | ------ | ------ | ------ |
| PDF Import (6 languages)                  | 0      | 6      | 6      |
| Text Format Import (QIF, MT940, CAMT.053) | 0      | 3      | 3      |
| Format Detection                          | 4      | 0      | 4      |
| Error Handling                            | 4      | 0      | 4      |
| **Total**                                 | **8**  | **9**  | **17** |

## Detailed Results

### Format Detection (all PASS)

| Format   | File                       | Detected As                      | Status |
| -------- | -------------------------- | -------------------------------- | ------ |
| PDF      | `bank-statement-en-us.pdf` | PDF                              | PASS   |
| QIF      | `checking-sample.qif`      | QIF (Quicken Interchange Format) | PASS   |
| MT940    | `deutsche-bank-sample.sta` | MT940 (SWIFT)                    | PASS   |
| CAMT.053 | `iso20022-sample.xml`      | CAMT.053 (ISO 20022)             | PASS   |

**Conclusion**: `format-detector.ts` correctly identifies all 4 formats via content signatures and extension fallback.

---

### PDF Import Tests (all FAIL - 0 transactions found)

| Language       | File                       | Txns Found | Stage        | Root Cause                                       |
| -------------- | -------------------------- | ---------- | ------------ | ------------------------------------------------ |
| English (USD)  | `bank-statement-en-us.pdf` | 0          | verification | Processing error - see below                     |
| German (EUR)   | `bank-statement-de-de.pdf` | 0          | verification | `Object.defineProperty` webpack error            |
| French (EUR)   | `bank-statement-fr-fr.pdf` | 0          | verification | Processing error                                 |
| Spanish (EUR)  | `bank-statement-es-es.pdf` | 0          | verification | Processing error                                 |
| Japanese (JPY) | `bank-statement-ja-jp.pdf` | 0          | verification | Processing error + `startsWithDate()` limitation |
| Arabic (SAR)   | `bank-statement-ar-sa.pdf` | 0          | verification | Processing error + RTL extraction issue          |

**Console error captured** (German PDF test):

```
[ImportPage] ERROR processing file: TypeError: Object.defineProperty called on non-object
    at Object.defineProperty (<anonymous>)
    at __webpack_require__.r (http://localhost:3007/_next/static/ch...)
```

**Analysis**: PDF processing fails universally across all languages. The `Object.defineProperty` webpack error suggests a module loading issue with `pdfjs-dist` or one of its dependencies during client-side dynamic import. This is a **build/bundling issue**, not a parsing issue.

**Required fixes**:

1. **Critical**: Fix `pdfjs-dist` webpack bundling — the `__webpack_require__.r` error indicates the PDF worker or module isn't being loaded correctly in the Next.js client bundle
2. **Medium**: Add Japanese date pattern to `startsWithDate()` in `pdf-bank-parser.ts:742` — add `/^\s*\d{4}年\d{1,2}月\d{1,2}日/`
3. **Medium**: Add RTL detection for Arabic PDF text extraction — pdfjs-dist extracts text in visual order which may reverse column positions for RTL content

---

### QIF Import (FAIL - 0 transactions found)

| Format | File                  | Txns Found | Expected | Status |
| ------ | --------------------- | ---------- | -------- | ------ |
| QIF    | `checking-sample.qif` | 0          | 5        | FAIL   |

**Analysis**: The QIF file was correctly detected (format detection test passes), and the file was uploaded and "Process File" clicked successfully. However, the import page shows 0 transactions after processing. The `parseQIFFile()` function in `qif-parser.ts` depends on `parseDate()` from `intl-date-parser.ts` and `parseAmount()` from `intl-amount-parser.ts`.

**Likely root cause**: The page's `processFile()` function may not have a code path that routes QIF files to `parseQIFFile()`, or the parsed transactions fail validation/conversion.

**Required fix**: Verify the QIF code path in `import/page.tsx` `processFile()` function — ensure QIF format is routed to `parseQIFFile()` and results are converted to the expected format.

---

### MT940 Import (FAIL - 0 transactions found)

| Format | File                       | Txns Found | Expected | Status |
| ------ | -------------------------- | ---------- | -------- | ------ |
| MT940  | `deutsche-bank-sample.sta` | 0          | 5        | FAIL   |

**Analysis**: MT940 format was detected correctly. Processing failed to produce transactions.

**Likely root cause**: `mt940-js` dynamic import (`await import('mt940-js')`) may fail in the browser due to Node.js-specific APIs (the library uses `Buffer` and `ArrayBuffer` conversion). The manual fallback parser should catch this, but its regex may not match the fixture format.

**Required fix**:

1. Check `parseMT940File()` error handling path — ensure the manual fallback parser works
2. Verify the `:61:` regex in `parseMT940Manual()` matches the fixture's transaction format (`:61:250115D45,50N023NONREF`)

---

### CAMT.053 Import (FAIL - 0 transactions found)

| Format   | File                  | Txns Found | Expected | Status |
| -------- | --------------------- | ---------- | -------- | ------ |
| CAMT.053 | `iso20022-sample.xml` | 0          | 5        | FAIL   |

**Analysis**: CAMT.053 format was detected correctly via content signature. Processing failed to produce transactions.

**Likely root cause**: The `fast-xml-parser` library is a dependency and should work in the browser. The issue may be that the import page's `processFile()` doesn't have a complete code path for CAMT.053 format, or the XML namespace handling differs between the fixture and the parser's expectations.

**Required fix**: Verify the CAMT.053 code path in `import/page.tsx` `processFile()` function — ensure XML content is passed to `parseCAMT053File()` and results are displayed.

---

### Error Handling Tests (all PASS)

| Test            | Format   | Status | Notes                                   |
| --------------- | -------- | ------ | --------------------------------------- |
| Empty PDF       | PDF      | PASS   | Gracefully showed error/no-data message |
| Empty QIF       | QIF      | PASS   | Gracefully showed error/no-data message |
| Malformed MT940 | MT940    | PASS   | Gracefully showed error/no-data message |
| Invalid XML     | CAMT.053 | PASS   | Gracefully showed error/no-data message |

**Conclusion**: Error handling is robust — malformed/empty files don't crash the app.

---

## Priority Fix List

### P0 (Critical - blocks all PDF imports)

1. **Fix pdfjs-dist webpack bundling** — `Object.defineProperty` error in `__webpack_require__.r` prevents all PDF processing

### P1 (High - blocks format import paths)

2. **Verify QIF processing code path** in `import/page.tsx` — ensure `processFile()` routes QIF to `parseQIFFile()`
3. **Verify MT940 processing code path** — ensure manual fallback parser handles `:61:` format correctly
4. **Verify CAMT.053 processing code path** — ensure XML is passed to `parseCAMT053File()`

### P2 (Medium - i18n/locale-specific)

5. **Add Japanese date pattern** to `startsWithDate()` — `2025年1月15日` format not recognized
6. **Add RTL column detection** for Arabic PDFs — pdfjs-dist text extraction may reverse column order
7. **European amount format** — German/French/Spanish PDFs use comma decimals (1.234,56) which may not parse correctly

---

## Test Artifacts

- **Fixtures**: `tests/fixtures/pdf/` (6 PDFs), `tests/fixtures/qif/`, `tests/fixtures/mt940/`, `tests/fixtures/camt053/`
- **Screenshots**: `tests/screenshots/` (on failure)
- **Playwright report**: `playwright-report/`
- **Generator**: `scripts/generate-test-pdfs.ts`

## Run Commands

```bash
# Generate PDF fixtures
npm run generate:test-pdfs

# Run all import pipeline tests
npx playwright test tests/e2e/import-formats.spec.ts -c tests/e2e/playwright.config.ts --workers=1

# Run specific format
npx playwright test tests/e2e/import-formats.spec.ts -g "QIF" -c tests/e2e/playwright.config.ts
```
