# PDF Import Redesign & Full Financial Import Suite

> **Created**: 2026-02-06
> **Status**: Planned
> **Epic**: Import Pipeline Internationalization
> **Affects**: Offline + Online versions

## Problem Statement

The current PDF import pipeline is **fundamentally broken for non-English users**:

1. **OCR character whitelist** (`pdf-ocr-parser.ts:244`) strips ALL non-ASCII characters — accented letters, Cyrillic, CJK, Arabic, Hebrew, etc.
2. **Hardcoded English OCR** (`bank-statement-ocr.ts:127`) — always passes `'eng'` to Tesseract.js
3. **English-only date parsing** — only recognizes `Jan, Feb, Mar...` month names
4. **English-only column detection** — only matches `date, description, amount, debit, credit, balance`
5. **US/UK currency format only** — only parses `$1,234.56`, not `1.234,56 €` or `₹1,23,456.78`
6. **No native text extraction** — jumps straight to OCR even though 90% of bank PDFs have extractable text

The app supports 113 locales for the UI but the import pipeline only works with English bank statements.

## Research Summary

Extensive research was conducted across PDF parsing libraries, OCR solutions, AI-powered extraction, international financial formats, and privacy considerations. Key findings:

### PDF Text Extraction (No OCR Needed for 90% of PDFs)
- **pdfjs-dist** (already installed) can extract text directly from digital PDFs
- Most bank statements downloaded from online banking contain selectable text
- This path is free, instant, language-agnostic, and fully private

### OCR Comparison
| Solution | Languages | Accuracy (financial docs) | Cost | Privacy |
|----------|-----------|--------------------------|------|---------|
| Tesseract.js | 100+ | 82-88% | Free | Local |
| OpenAI Vision (GPT-4o) | All | ~93-96% | ~$0.01/page | Cloud |
| AWS Textract | 6-8 | 96-98% | ~$0.03/page | Cloud |
| Azure Document Intelligence | US English (bank model) | 97-99% | ~$0.01/page | Cloud |
| Google Document AI | 200+ (OCR) | 96-98% | ~$0.75/doc | Cloud |
| PaddleOCR | 80+ | 91% | Free | Local (Python) |
| Surya OCR | 90+ | 97.7% | Free | Local (Python) |

### International Number Parsing
- **`@internationalized/number`** (Adobe, 1.7 kB) — best for locale-aware parsing via browser Intl API
- Handles all number systems: Latin, Arabic-Indic, Devanagari, Han
- All currency symbols and grouping patterns (US: `1,234.56`, EU: `1.234,56`, IN: `1,23,456.78`)

### International Date Parsing
- **`date-fns`** (already installed) with locale packs for known formats
- **`chrono-node`** (~50 kB) for natural language date parsing in multiple languages
- Combined approach handles `15 Ene 2025`, `15 Fév 2025`, `2025年1月15日`, etc.

### Structured Financial Formats
| Format | Type | Coverage | Parser Status |
|--------|------|----------|---------------|
| CSV | Universal | All banks | Done (existing) |
| OFX/QFX | Open Financial Exchange | US/Canada banks | Done (existing) |
| QIF | Quicken Interchange | Legacy, widely supported | Needed |
| MT940 | SWIFT text format | European/international banks | Needed |
| CAMT.053 | ISO 20022 XML | EU mandatory since Nov 2025 | Needed |

Supporting OFX + QIF alone would cover the majority of US bank users and eliminate PDF parsing entirely for those users. MT940 + CAMT.053 covers European/international banks.

---

## Architecture: Before vs After

### Current (Broken)
```
PDF → Tesseract.js (eng only, ASCII whitelist) → Regex parsing (English dates/amounts) → Transactions
```

### Redesigned
```
File Upload → Format Detection → Route to Parser
  ├── CSV        → existing csv-parser (keep)
  ├── OFX/QFX    → existing ofx-parser (keep)
  ├── QIF        → NEW qif-parser
  ├── MT940      → NEW mt940-parser
  ├── CAMT.053   → NEW camt053-parser
  └── PDF        → NEW hybrid pipeline:
       ├── Step 1: Native text extraction (pdf.js) — FREE, all languages
       ├── Step 2: If text found → intelligent parsing
       │    ├── Online:  OpenAI API structured extraction
       │    └── Offline: Multi-language regex + @internationalized/number
       └── Step 3: If scanned (no text) → OCR
            ├── Online:  OpenAI Vision API (best accuracy, all languages)
            └── Offline: Tesseract.js (fixed: no ASCII whitelist, multi-lang)
```

### Privacy Architecture
```
Offline Version (Default):
  ALL processing happens client-side
  - pdf.js text extraction → local
  - Tesseract.js OCR → local (WebAssembly)
  - Parsing → local
  - Zero network calls

Online Version (Subscription):
  Local-first with cloud enhancement
  - Try local extraction first
  - OpenAI Vision for scanned PDFs (shared backend key)
  - User sees clear indicator when data leaves device
  - Rate limiting per subscription tier
```

---

## Phase 1: Fix Core PDF Pipeline (Critical)

### 1.1 Add Native Text Extraction
**Why**: 90% of bank-generated PDFs have selectable text. No OCR needed.

**File**: `src/lib/parsers/pdf-text-extractor.ts` (NEW)
- Use `pdfjs-dist` (already a dependency) to extract text layer with positions
- Returns text + position data for table structure detection
- Exports:
  - `extractPdfText(file: File): Promise<{text: string, hasText: boolean, pages: PageText[]}>`
  - `hasText` = true if >100 chars extracted (same logic as existing `pdfNeedsOCR()` in `pdf-ocr-parser.ts:680`)
- Language-agnostic — works with any text encoding in the PDF

### 1.2 Fix Tesseract.js Multi-Language Support (Offline)
**Files to modify**:
- `src/lib/parsers/pdf-ocr-parser.ts` — Remove ASCII whitelist (line 244), accept language parameter
- `src/lib/bank-statement-ocr.ts:127` — Accept language parameter instead of hardcoded `'eng'`
- `src/lib/receipt-ocr.ts` — Same fix, accept language parameter

**Specific changes**:
1. **Remove** `tessedit_char_whitelist` completely (line 244 of `pdf-ocr-parser.ts`) — this blocks ALL non-ASCII characters (é, ñ, ü, Cyrillic, CJK, Arabic, etc.)
2. **Add language detection** from user's app locale (map i18n locale code → Tesseract language code)
3. **Create** `src/lib/parsers/tesseract-lang-map.ts` — maps 113 app locales to Tesseract language codes
4. **Lazy-load** language data on demand (Tesseract language packs are 2-20 MB each; only download when user first imports in that language)
5. **Allow manual language override** in the import UI

### 1.3 Add International Amount Parsing
**File**: `src/lib/parsers/intl-amount-parser.ts` (NEW)
- Install `@internationalized/number` (~1.7 kB gzipped) for locale-aware number parsing
- Handles all global formats:
  - US/UK: `$1,234.56` or `1,234.56`
  - Europe: `1.234,56 €` or `EUR 1.234,56`
  - France: `1 234,56 €`
  - India: `₹1,23,456.78`
  - Japan: `¥1,234`
  - Brazil: `R$ 1.234,56`
  - Arabic: `١٬٢٣٤٫٥٦` (Arabic-Indic numerals)
- Exports:
  - `parseAmount(str: string, locale?: string): number | null`
  - `detectCurrencySymbol(str: string): { symbol: string, code: string } | null` (returns ISO 4217 code)
  - `formatAmountForLocale(amount: number, locale: string, currency: string): string`

### 1.4 Add International Date Parsing
**File**: `src/lib/parsers/intl-date-parser.ts` (NEW)
- Use `date-fns` (already installed) with locale packs for known format patterns
- Install `chrono-node` (~50 kB) as fallback for natural language dates
- Supports:
  - `15 Ene 2025` (Spanish)
  - `15 Fév 2025` (French)
  - `15. Jan. 2025` (German)
  - `2025年1月15日` (Japanese)
  - `١٥/٠١/٢٠٢٥` (Arabic)
  - All numeric formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD.MM.YYYY
- Fallback chain: locale-specific pattern → chrono-node NLP → numeric patterns → JS Date constructor
- Exports:
  - `parseDate(str: string, locale?: string): Date | null`
  - `detectDateFormat(samples: string[]): string` (auto-detect DD/MM vs MM/DD from sample data)

### 1.5 Internationalize Column Detection
**File**: `src/lib/parsers/pdf-bank-parser.ts`
- Expand `COLUMN_KEYWORDS` (currently line 51-58) with translations in top 20 languages:
  - English, Spanish, French, German, Portuguese, Italian, Dutch, Polish, Russian, Turkish, Arabic, Hebrew, Hindi, Japanese, Chinese, Korean, Thai, Vietnamese, Indonesian, Swedish
- The existing fuzzy matching (Levenshtein distance) will tolerate OCR errors in any language
- Add common column header variations per language (e.g., German: `Datum`, `Buchungstag`, `Verwendungszweck`, `Betrag`, `Soll`, `Haben`, `Saldo`)

---

## Phase 2: OpenAI-Powered Extraction (Online Version)

### 2.1 Backend API Route for PDF Extraction
**File**: `src/app/api/import/pdf-extract/route.ts` (NEW)
- POST endpoint: receives PDF file as FormData
- Uses OpenAI Vision API (GPT-4o) with shared backend key stored in environment
- Structured output prompt:
  ```
  Extract all transactions from this bank statement.
  The statement may be in any language.
  Normalize all dates to ISO 8601 (YYYY-MM-DD).
  Normalize all amounts to decimal numbers (no thousands separators).
  Detect the currency and include the ISO 4217 code.
  Return JSON matching this schema:
  {
    "account_info": { "holder_name": string, "account_number": string, "bank_name": string },
    "statement_period": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
    "currency": "USD",
    "opening_balance": number,
    "closing_balance": number,
    "transactions": [
      { "date": "YYYY-MM-DD", "description": string, "amount": number, "type": "debit"|"credit", "balance": number|null }
    ]
  }
  ```
- Validation: Zod schema matching `ParsedTransaction` type
- Balance reconciliation check: verify sum of transactions ≈ closing - opening balance
- Rate limiting per subscription tier
- Error handling with user-friendly messages

### 2.2 OpenAI Service Module
**File**: `src/lib/ai/openai-pdf-service.ts` (NEW)
- Install `openai` npm package
- Wraps OpenAI API calls for PDF extraction
- Handles: base64 PDF → OpenAI Vision → structured JSON → validated transactions
- Retry logic with exponential backoff (3 attempts)
- Token usage tracking for subscription metering
- Exports:
  - `extractTransactionsWithAI(pdfBase64: string): Promise<AIExtractionResult>`
  - `type AIExtractionResult = { transactions: ParsedTransaction[], metadata: StatementMetadata, confidence: number }`

### 2.3 Online/Offline Feature Detection
**File**: `src/lib/feature-flags.ts` (modify or create)
- `isOnlineVersion(): boolean` — checks subscription status
- `canUseAIPdfExtraction(): boolean` — true if online + API available
- Used by import page to conditionally render AI extraction options

---

## Phase 3: Structured Financial Formats

### 3.1 QIF Parser
**File**: `src/lib/parsers/qif-parser.ts` (NEW)
- Parse QIF (Quicken Interchange Format)
- Line-based format with single-character field codes:
  - `D` = date, `T` = amount, `P` = payee, `M` = memo, `C` = cleared status, `L` = category, `^` = end of record
- Simple custom parser (~150 lines), no external dependencies needed
- Handles `!Type:Bank`, `!Type:CCard`, `!Type:Cash`, `!Type:Invst`
- Uses `intl-date-parser.ts` for multi-locale date parsing
- Exports:
  - `parseQIFFile(content: string, locale?: string): ParsedTransaction[]`
  - `validateQIFFile(content: string): { isValid: boolean, errors: string[] }`

### 3.2 MT940 Parser
**File**: `src/lib/parsers/mt940-parser.ts` (NEW)
- Install `mt940-js` (isomorphic, works in browser + Node.js)
- Parse SWIFT MT940 bank statement format (European/international standard)
- Key fields mapped:
  - `:20:` Transaction Reference Number
  - `:25:` Account Identification
  - `:60F:` Opening Balance
  - `:61:` Statement Line (individual transactions)
  - `:62F:` Closing Balance
  - `:86:` Information to Account Owner (description)
- Map MT940 transaction fields → `ParsedTransaction` type
- Exports:
  - `parseMT940File(content: string): ParsedTransaction[]`
  - `validateMT940File(content: string): { isValid: boolean, errors: string[] }`

### 3.3 CAMT.053 Parser
**File**: `src/lib/parsers/camt053-parser.ts` (NEW)
- Use `fast-xml-parser` (already installed as dependency of ofx-parser)
- Parse ISO 20022 CAMT.053 XML format (Bank-to-Customer Account Statement)
- **Mandatory in EU since November 2025** — growing worldwide adoption
- Key XML elements mapped:
  - `<GrpHdr>` → statement metadata
  - `<Stmt>/<Acct>` → account info
  - `<Stmt>/<Bal>` → opening/closing balances
  - `<Stmt>/<Ntry>` → individual transaction entries
  - `<Ntry>/<NtryDtls>/<TxDtls>` → transaction details
- Handles multiple currencies (from `<Amt Ccy="EUR">`)
- Exports:
  - `parseCAMT053File(content: string): ParsedTransaction[]`
  - `validateCAMT053File(content: string): { isValid: boolean, errors: string[] }`

### 3.4 Update Format Detector
**File**: `src/lib/parsers/format-detector.ts`
- Add to `FileFormat` type: `'qif' | 'mt940' | 'camt053'`
- Add content detection signatures:
  - **QIF**: starts with `!Type:` — NOTE: currently misdetected as `qbo`, must fix
  - **MT940**: contains `:20:` + `:60F:` or `:61:` SWIFT tags
  - **CAMT.053**: XML with namespace `urn:iso:std:iso:20022:tech:xsd:camt.053`
- Update `getSupportedFormats()` to include new formats
- Update `getFormatDisplayName()` with human-readable names
- Update `isFormatSupported()` to return true for new formats
- Fix `validateFormat()` to handle new formats

---

## Phase 4: Import Page UI Updates

### 4.1 Update File Upload
**File**: `src/app/budget-app/import/page.tsx`
- Accept new file extensions: `.qif`, `.sta`, `.mt940`, `.xml` (CAMT.053)
- Update `accept` attribute in file input to include new MIME types
- Route detected format to appropriate parser in the processing pipeline
- Show format-specific icons and labels (e.g., "SWIFT MT940 detected")
- Display supported formats list on the upload area

### 4.2 PDF Import Flow (Redesigned)
Replace current PDF handling with a smarter flow:
1. **Auto-detect**: Run `extractPdfText()` to check if PDF has selectable text
2. **Text-based PDF**: Extract text → parse with intl parsers (fast, free) → show preview
3. **Scanned PDF**:
   - **Online users**: Show "Use AI extraction (recommended)" button → calls OpenAI API route
   - **Offline users**: Show "Use OCR" button → Tesseract.js with locale-detected language
4. **Language selection**: Auto-detect from app locale, with manual override dropdown
5. **Confidence display**: Show per-transaction confidence scores, flag low-confidence items for manual review
6. **Progress indicator**: Keep existing `PDFOCRProgress.tsx` component, update messaging

### 4.3 Currency Detection in Preview
- Show detected currency per transaction (from `intl-amount-parser.ts`)
- Allow user to set/override the statement currency
- Show currency mismatch warning if account currency differs from detected currency
- Offer auto-conversion option (using existing exchange rate logic if available)

---

## Phase 5: Shared Infrastructure

### 5.1 Unified Transaction Normalizer
**File**: `src/lib/parsers/transaction-normalizer.ts` (NEW)
- Common post-processing pipeline for ALL parsers (PDF, OFX, QIF, MT940, CAMT.053)
- Steps:
  1. Normalize dates to consistent `Date` objects
  2. Normalize amounts using `intl-amount-parser.ts`
  3. Detect and tag currency (ISO 4217)
  4. Clean description text (remove excess whitespace, normalize unicode)
  5. Generate transaction confidence score
- Exports:
  - `normalizeTransaction(raw: ParsedTransaction, locale?: string): ParsedTransaction`
  - `normalizeTransactions(raw: ParsedTransaction[], locale?: string): ParsedTransaction[]`

### 5.2 Tesseract Language Map
**File**: `src/lib/parsers/tesseract-lang-map.ts` (NEW)
- Map all 113 app locales → Tesseract.js language codes
- Examples: `'de-DE' → 'deu'`, `'ja-JP' → 'jpn'`, `'ar-SA' → 'ara'`, `'zh-CN' → 'chi_sim'`
- Handles locales with no exact Tesseract match by falling back to base language
- Exports:
  - `getOCRLanguage(appLocale: string): string`
  - `getOCRLanguageName(code: string): string` (for UI display)
  - `SUPPORTED_OCR_LANGUAGES: Record<string, string>` (for dropdown)

---

## File Summary

### Files Modified (Existing)

| File | Changes |
|------|---------|
| `src/lib/parsers/pdf-ocr-parser.ts` | Remove ASCII whitelist (line 244), accept language param |
| `src/lib/bank-statement-ocr.ts` | Accept language param instead of hardcoded `'eng'` |
| `src/lib/receipt-ocr.ts` | Accept language param |
| `src/lib/parsers/pdf-bank-parser.ts` | Add multilingual column keywords (20 languages) |
| `src/lib/parsers/format-detector.ts` | Add QIF, MT940, CAMT.053 detection; fix QIF vs QBO |
| `src/app/budget-app/import/page.tsx` | New file types, redesigned PDF flow, currency detection |
| `src/types/budget.ts` | Update `FileFormat` type, add `currency` field to `ParsedTransaction` |
| `package.json` | Add 4 new dependencies |

### Files Created (New)

| File | Purpose | Est. Lines |
|------|---------|------------|
| `src/lib/parsers/pdf-text-extractor.ts` | Native PDF text extraction via pdf.js | ~120 |
| `src/lib/parsers/intl-amount-parser.ts` | International amount/currency parsing | ~150 |
| `src/lib/parsers/intl-date-parser.ts` | International date parsing (20+ languages) | ~200 |
| `src/lib/parsers/qif-parser.ts` | QIF format parser | ~150 |
| `src/lib/parsers/mt940-parser.ts` | MT940/SWIFT format parser | ~120 |
| `src/lib/parsers/camt053-parser.ts` | ISO 20022 CAMT.053 XML parser | ~200 |
| `src/lib/parsers/transaction-normalizer.ts` | Common post-processing for all parsers | ~100 |
| `src/lib/parsers/tesseract-lang-map.ts` | 113 locale → Tesseract language code mapping | ~180 |
| `src/lib/ai/openai-pdf-service.ts` | OpenAI Vision PDF extraction (online) | ~150 |
| `src/app/api/import/pdf-extract/route.ts` | Backend API endpoint for AI extraction | ~120 |

### New Dependencies

| Package | Size (gzip) | Purpose |
|---------|-------------|---------|
| `@internationalized/number` | 1.7 kB | Locale-aware number parsing (all currencies) |
| `chrono-node` | ~50 kB | Natural language date parsing (multi-language) |
| `mt940-js` | ~15 kB | MT940/SWIFT bank statement parsing (isomorphic) |
| `openai` | ~100 kB | OpenAI API client (online version only) |

**Already installed** (reuse): `pdfjs-dist`, `fast-xml-parser`, `date-fns`, `tesseract.js`, `@anthropic-ai/sdk`

---

## Implementation Order

| Step | Phase | Description | Estimated Effort |
|------|-------|-------------|------------------|
| 1 | 1.1 | Native PDF text extraction | Small |
| 2 | 1.2 | Fix Tesseract.js multi-language | Small |
| 3 | 1.3 | International amount parsing | Medium |
| 4 | 1.4 | International date parsing | Medium |
| 5 | 1.5 | Multilingual column detection | Medium |
| 6 | 5.1-5.2 | Shared infrastructure (normalizer, lang map) | Small |
| 7 | 3.1 | QIF parser | Small |
| 8 | 3.2 | MT940 parser | Small |
| 9 | 3.3 | CAMT.053 parser | Medium |
| 10 | 3.4 | Update format detector | Small |
| 11 | 4.1-4.3 | Import page UI updates | Large |
| 12 | 2.1-2.3 | OpenAI integration (online version) | Medium |

---

## Verification Plan

### Unit Tests
- `intl-amount-parser.test.ts` — Parse amounts in 15+ locale formats (US, DE, FR, IN, JP, BR, AR, RU, KR, CN, etc.)
- `intl-date-parser.test.ts` — Parse dates in 15+ languages
- `qif-parser.test.ts` — Parse sample QIF files from different banks
- `mt940-parser.test.ts` — Parse sample MT940 files
- `camt053-parser.test.ts` — Parse sample CAMT.053 XML from EU banks
- `pdf-text-extractor.test.ts` — Extract text from test PDFs (digital + scanned)
- `tesseract-lang-map.test.ts` — All 113 app locales map to valid Tesseract language codes
- `transaction-normalizer.test.ts` — Normalize transactions from all parser types

### Integration Tests
- Import a text-based PDF bank statement (native extraction path, no OCR)
- Import a scanned PDF in non-English language (OCR path)
- Import OFX, QIF, MT940, CAMT.053 sample files end-to-end
- Test format detector correctly routes all new formats
- Test offline mode makes zero network calls

### Manual Testing Scenarios
- Upload a German bank statement PDF → verify `Datum`, `Betrag` column detection
- Upload a French bank statement → verify `1.234,56 €` amount parsing
- Upload a Japanese bank statement → verify CJK text extraction works
- Upload an Arabic bank statement → verify RTL text handling
- Test offline mode → confirm no API calls made
- Test online mode → confirm OpenAI extraction for scanned PDF
- Upload each supported format type and verify successful import

### Playwright Visual Tests
- Import page displays all supported formats in the upload area
- PDF import flow shows text extraction vs OCR options correctly
- Language selection dropdown appears and functions
- Confidence indicators display on transaction preview
- Error states display correctly for invalid files

---

## Sources

- [7 PDF Parsing Libraries for Node.js (Strapi)](https://strapi.io/blog/7-best-javascript-pdf-parsing-libraries-nodejs-2025)
- [Claude PDF Support Documentation](https://docs.anthropic.com/en/docs/build-with-claude/pdf-support)
- [LLMs for Structured Data Extraction from PDFs (Unstract)](https://unstract.com/blog/comparing-approaches-for-using-llms-for-structured-data-extraction-from-pdfs/)
- [Stop Writing Bank Statement Parsers, Use LLMs Instead (Medium)](https://medium.com/@mahmudulhoque/stop-writing-bank-statement-parsers-use-llms-instead-50902360a604)
- [Bank Statement Extraction Guide (Heron Data)](https://www.herondata.io/blog/bank-statement-extraction)
- [AWS Textract Bank Statement Processor](https://github.com/aws-samples/textract-bank-statement-processor)
- [Azure Document Intelligence Bank Statement Model](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/prebuilt/bank-statement)
- [Google Document AI Bank Statement Parser](https://docs.cloud.google.com/document-ai/docs/processors-list)
- [8 Top Open-Source OCR Models Compared (Modal)](https://modal.com/blog/8-top-open-source-ocr-models-compared)
- [Surya OCR GitHub](https://github.com/datalab-to/surya)
- [@internationalized/number (Adobe)](https://react-spectrum.adobe.com/internationalized/number/index.html)
- [chrono-node (GitHub)](https://github.com/wanasit/chrono)
- [ISO 20022 CAMT.053 Transition Guide](https://corporates.db.com/in-focus/Focus-topics/iso20022/blogs/transitioning-to-iso-20022-account-statements)
