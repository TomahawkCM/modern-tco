---
name: import-pipeline
description: Use when testing or extending the Budget App bank statement import pipeline
---

# Import Pipeline Workflow

Reference and workflow for the 9-stage Budget App import pipeline.

## Pipeline Stages

```
1. Upload → 2. Format Detection → 3. Bank Detection → 4. Parsing
→ 5. Duplicate Detection → 6. Validation → 7. Enrichment
→ 8. Preview → 9. Import
```

| Stage | Purpose | Key file(s) |
|-------|---------|-------------|
| 1. Upload | Accept file from user | `src/app/budget-app/import/page.tsx` |
| 2. Format Detection | Identify CSV, OFX, PDF, QIF, MT940, CAMT.053 | `src/lib/parsers/format-detector.ts` |
| 3. Bank Detection | Match bank by file signatures + AI fallback | `src/lib/parsers/smart-bank-detection.ts` |
| 4. Parsing | Extract transactions using bank-specific logic | See parser table below |
| 5. Duplicate Detection | FITID, fuzzy match, AI matching | `src/lib/parsers/smart-duplicate-detection.ts` |
| 6. Validation | Anomaly + business rule checks | Validation components |
| 7. Enrichment | Merchant normalization, category assignment | `src/lib/parsers/transaction-normalizer.ts` |
| 8. Preview | User review before import | Import page components |
| 9. Import | Bulk add to IndexedDB | `src/lib/encryption/budget-db.ts` |

## Parsers

| Format | Parser file | Test fixtures |
|--------|------------|---------------|
| CSV | `src/lib/parsers/csv-parser.ts` | Various bank CSVs |
| OFX | `src/lib/parsers/ofx-parser.ts` | — |
| PDF | `src/lib/parsers/pdf-bank-parser.ts` | `tests/fixtures/pdf/` |
| QIF | `src/lib/parsers/qif-parser.ts` | `tests/fixtures/qif/` |
| MT940 | `src/lib/parsers/mt940-parser.ts` | `tests/fixtures/mt940/` |
| CAMT.053 | `src/lib/parsers/camt053-parser.ts` | `tests/fixtures/camt053/` |

## Supporting modules

| Module | File |
|--------|------|
| Bank configs | `src/lib/parsers/bank-configs.ts` |
| Smart column mapper | `src/lib/parsers/smart-column-mapper.ts` |
| Date parser (intl) | `src/lib/parsers/intl-date-parser.ts` |
| Amount parser (intl) | `src/lib/parsers/intl-amount-parser.ts` |
| PDF text extractor | `src/lib/parsers/pdf-text-extractor.ts` |
| OCR (Tesseract) | `src/lib/parsers/pdf-ocr-parser.ts` |
| OCR lang map | `src/lib/parsers/tesseract-lang-map.ts` |

## Adding a new parser

1. Create `src/lib/parsers/{format}-parser.ts` following the existing parser pattern
2. Register the format in `src/lib/parsers/format-detector.ts`
3. Add bank-specific configs to `src/lib/parsers/bank-configs.ts` if needed
4. Create test fixtures in `tests/fixtures/{format}/`
5. Add tests in `tests/` covering: parsing, edge cases, encoding, date/amount formats
6. Update the import page UI if the format needs special handling

## Testing an existing parser

1. Check test fixtures exist in `tests/fixtures/{format}/`
2. Run parser-specific tests: `npm test -- --grep "{format}"`
3. For E2E import flow: `npm run e2e -- tests/e2e/import-formats.spec.ts`
4. Verify amount parsing handles locale variations (US, EU, Indian, Brazilian, Japanese)
5. Verify date parsing handles format variations (MM/DD, DD/MM, YYYY-MM-DD, DD.MM.YYYY)

## Related

- Import page: `src/app/budget-app/import/page.tsx`
- Budget app rule: `.claude/rules/budget-app.md`
- AGENTS.md pipeline reference: `.claude/AGENTS.md`
