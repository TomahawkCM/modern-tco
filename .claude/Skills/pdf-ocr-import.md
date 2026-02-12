---
name: pdf-ocr-import
description: Use when implementing, modifying, or testing any financial file import — PDF, CSV, OFX/QFX, QIF, MT940, CAMT.053. Covers OCR, international amount/date parsing, format detection, structured format parsing, transaction validation, and balance reconciliation. Also use when debugging import accuracy, adding new bank/language support, or writing import tests.
---

# Financial Import Pipeline

## Overview

Unified import pipeline supporting all major financial file formats in any language. Routes files through format detection → format-specific parser → transaction normalizer → validation → import.

**Critical rules**:
- NEVER hardcode `'eng'` or ASCII-only character sets
- ALL text/amount/date processing must be locale-aware
- Offline mode must NEVER make network calls
- Always try native PDF text extraction before OCR

## Architecture

```
File Upload → detectFileFormat()
  ├── CSV        → csv-parser.ts (existing)
  ├── OFX/QFX    → ofx-parser.ts (existing)
  ├── QIF        → qif-parser.ts
  ├── MT940      → mt940-parser.ts
  ├── CAMT.053   → camt053-parser.ts
  └── PDF        → hybrid pipeline:
       ├── Step 1: extractPdfText() via pdf.js (FREE, all languages)
       ├── Step 2: has text? → intl parsers (offline) or OpenAI (online)
       └── Step 3: no text? → Tesseract.js OCR (offline) or OpenAI Vision (online)
                           ↓
               All formats flow into:
               normalizeTransactions() → validateTransactions() → import
```

## Key Files

| File | Role |
|------|------|
| **Format Detection** | |
| `src/lib/parsers/format-detector.ts` | Auto-detect CSV, OFX, QFX, QIF, MT940, CAMT.053, PDF |
| **Existing Parsers** | |
| `src/lib/parsers/csv-parser.ts` | CSV import with bank configs |
| `src/lib/parsers/ofx-parser.ts` | OFX 1.x (SGML) and 2.x (XML) |
| **New Parsers** | |
| `src/lib/parsers/qif-parser.ts` | QIF (Quicken Interchange Format) |
| `src/lib/parsers/mt940-parser.ts` | SWIFT MT940 bank statements |
| `src/lib/parsers/camt053-parser.ts` | ISO 20022 CAMT.053 XML |
| **PDF Pipeline** | |
| `src/lib/parsers/pdf-text-extractor.ts` | Native text extraction via pdf.js |
| `src/lib/parsers/pdf-ocr-parser.ts` | Tesseract.js OCR pipeline |
| `src/lib/bank-statement-ocr.ts` | Bank statement OCR orchestrator |
| `src/lib/parsers/pdf-bank-parser.ts` | Column detection + table parsing |
| **International Parsing** | |
| `src/lib/parsers/intl-amount-parser.ts` | All currency/number formats |
| `src/lib/parsers/intl-date-parser.ts` | All date formats/languages |
| `src/lib/parsers/tesseract-lang-map.ts` | 113 locale → Tesseract language codes |
| **Post-Processing** | |
| `src/lib/parsers/transaction-normalizer.ts` | Normalize output from all parsers |
| **Online-Only** | |
| `src/lib/ai/openai-pdf-service.ts` | OpenAI Vision extraction |
| `src/app/api/import/pdf-extract/route.ts` | Backend API for AI extraction |

---

## Format-Specific Implementation

### CSV (Existing — `csv-parser.ts`)

Already implemented with 15+ bank configs. Key patterns to maintain:
- `BANK_CONFIGS` maps bank names → column positions, date formats, delimiters
- `detectBank()` auto-detects bank from header row
- `convertToTransactions()` maps parsed rows → `ParsedTransaction[]`

### OFX/QFX (Existing — `ofx-parser.ts`)

Already implemented with OFX 1.x SGML and OFX 2.x XML support:
- `detectOFXVariant()` determines SGML vs XML
- `convertOFX1ToXML()` normalizes SGML to XML
- `parseOFXFile()` extracts transactions, account info, balances
- Uses `fast-xml-parser` for XML processing

### QIF Parser (New)

```typescript
// src/lib/parsers/qif-parser.ts
// QIF is line-based with single-character field codes

interface QIFTransaction {
  date: string;     // D field
  amount: string;   // T field
  payee: string;    // P field
  memo: string;     // M field
  category: string; // L field
  cleared: string;  // C field
  number: string;   // N field (check number)
}

function parseQIFFile(content: string, locale?: string): ParsedTransaction[] {
  const lines = content.split('\n');
  const transactions: ParsedTransaction[] = [];
  let current: Partial<QIFTransaction> = {};
  let accountType = 'Bank'; // from !Type: header

  for (const line of lines) {
    const code = line.charAt(0);
    const value = line.substring(1).trim();

    switch (code) {
      case '!': accountType = value.replace('Type:', ''); break;
      case 'D': current.date = value; break;
      case 'T': current.amount = value; break;
      case 'P': current.payee = value; break;
      case 'M': current.memo = value; break;
      case 'L': current.category = value; break;
      case 'C': current.cleared = value; break;
      case 'N': current.number = value; break;
      case '^': // End of record
        if (current.date || current.amount) {
          transactions.push({
            date: parseDate(current.date || '', locale) || new Date(),
            description: current.payee || current.memo || 'Unknown',
            amount: parseAmount(current.amount || '0', locale) || 0,
            isDuplicate: false,
            confidence: 0.95, // QIF is structured, high confidence
          });
        }
        current = {};
        break;
    }
  }
  return transactions;
}
```

**QIF testing patterns**:
```typescript
describe('qif-parser', () => {
  test('parses basic QIF file', () => {
    const qif = `!Type:Bank
D01/15/2025
T-50.00
PStarbucks
MCoffee
LFood:Coffee
^
D01/16/2025
T1200.00
PPayroll
MSalary deposit
LIncome:Salary
^`;
    const result = parseQIFFile(qif, 'en-US');
    expect(result).toHaveLength(2);
    expect(result[0].amount).toBe(-50);
    expect(result[0].description).toBe('Starbucks');
    expect(result[1].amount).toBe(1200);
  });

  test('handles QIF with European dates', () => {
    const qif = `!Type:Bank
D15/01/2025
T-50,00
PKaufland
^`;
    const result = parseQIFFile(qif, 'de-DE');
    expect(result[0].date.getDate()).toBe(15);
    expect(result[0].date.getMonth()).toBe(0); // January
    expect(result[0].amount).toBe(-50);
  });

  test('handles empty/minimal fields', () => {
    const qif = `!Type:CCard
D01/15/2025
T-25.99
^`;
    const result = parseQIFFile(qif);
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Unknown');
  });

  test('handles multiple account types', () => {
    const qif = `!Type:CCard
D01/15/2025
T-25.00
PNetflix
^`;
    const result = parseQIFFile(qif);
    expect(result).toHaveLength(1);
  });

  test('validates QIF structure', () => {
    expect(validateQIFFile('not a qif file').isValid).toBe(false);
    expect(validateQIFFile('!Type:Bank\nD01/01/2025\nT-10\n^').isValid).toBe(true);
  });
});
```

### MT940 Parser (New)

```typescript
// src/lib/parsers/mt940-parser.ts
// Uses mt940-js library (isomorphic, browser + Node)
import { read } from 'mt940-js';

function parseMT940File(content: string): ParsedTransaction[] {
  const statements = read(content);
  const transactions: ParsedTransaction[] = [];

  for (const statement of statements) {
    for (const tx of statement.transactions) {
      transactions.push({
        date: tx.valueDate || tx.entryDate || new Date(),
        description: tx.description || tx.informationToAccountOwner || 'Unknown',
        amount: tx.isCredit ? Math.abs(tx.amount) : -Math.abs(tx.amount),
        isDuplicate: false,
        confidence: 0.95,
        // MT940 extras available: tx.bankReference, tx.customerReference
      });
    }
  }
  return transactions;
}
```

**MT940 testing patterns**:
```typescript
describe('mt940-parser', () => {
  const SAMPLE_MT940 = `:20:STARTUMSE
:25:10020030/1234567890
:28C:00000/001
:60F:C250101EUR1234,56
:61:2501150115D50,00NMSC
:86:Payment to supplier
:61:2501160116C1200,00NMSC
:86:Salary deposit
:62F:C250116EUR2384,56`;

  test('parses transactions from MT940', () => {
    const result = parseMT940File(SAMPLE_MT940);
    expect(result).toHaveLength(2);
    expect(result[0].amount).toBe(-50);      // Debit
    expect(result[1].amount).toBe(1200);     // Credit
  });

  test('extracts dates correctly', () => {
    const result = parseMT940File(SAMPLE_MT940);
    expect(result[0].date.getFullYear()).toBe(2025);
    expect(result[0].date.getMonth()).toBe(0);  // January
    expect(result[0].date.getDate()).toBe(15);
  });

  test('extracts descriptions from :86: field', () => {
    const result = parseMT940File(SAMPLE_MT940);
    expect(result[0].description).toContain('Payment to supplier');
    expect(result[1].description).toContain('Salary deposit');
  });

  test('handles multi-statement MT940', () => {
    const multiStatement = SAMPLE_MT940 + '\n' + SAMPLE_MT940;
    const result = parseMT940File(multiStatement);
    expect(result).toHaveLength(4);
  });

  test('validates MT940 structure', () => {
    expect(validateMT940File(':20:VALID\n:25:ACCT\n:60F:C').isValid).toBe(true);
    expect(validateMT940File('not mt940').isValid).toBe(false);
  });

  test('handles German bank MT940 with structured :86: field', () => {
    const germanMT940 = `:20:STARTUMSE
:25:37040044/0532013000
:28C:00000/001
:60F:C250101EUR5000,00
:61:2501150115D123,45NMSC
:86:020?00ÜBERWEISUNG?20Miete Januar?21Ref: MIE-2025-01?32Max Mustermann?30COBADEFFXXX
:62F:C250115EUR4876,55`;
    const result = parseMT940File(germanMT940);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(-123.45);
  });
});
```

### CAMT.053 Parser (New)

```typescript
// src/lib/parsers/camt053-parser.ts
// Uses fast-xml-parser (already installed)
import { XMLParser } from 'fast-xml-parser';

function parseCAMT053File(content: string): ParsedTransaction[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const doc = parser.parse(content);

  // Navigate: Document > BkToCstmrStmt > Stmt > Ntry[]
  const stmt = doc?.Document?.BkToCstmrStmt?.Stmt;
  if (!stmt) throw new Error('Invalid CAMT.053: missing Stmt element');

  const entries = Array.isArray(stmt.Ntry) ? stmt.Ntry : [stmt.Ntry].filter(Boolean);
  const transactions: ParsedTransaction[] = [];

  for (const entry of entries) {
    const amount = parseFloat(entry.Amt?.['#text'] || entry.Amt || '0');
    const currency = entry.Amt?.['@_Ccy'] || 'EUR';
    const isCredit = entry.CdtDbtInd === 'CRDT';
    const date = entry.BookgDt?.Dt || entry.ValDt?.Dt;
    const description =
      entry.NtryDtls?.TxDtls?.RmtInf?.Ustrd ||
      entry.AddtlNtryInf ||
      'Unknown';

    transactions.push({
      date: date ? new Date(date) : new Date(),
      description: typeof description === 'string' ? description : String(description),
      amount: isCredit ? Math.abs(amount) : -Math.abs(amount),
      currency,
      isDuplicate: false,
      confidence: 0.98, // XML is structured, very high confidence
    });
  }
  return transactions;
}
```

**CAMT.053 testing patterns**:
```typescript
describe('camt053-parser', () => {
  const SAMPLE_CAMT053 = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Acct><Id><IBAN>DE89370400440532013000</IBAN></Id></Acct>
      <Bal>
        <Tp><CdOrPrtry><Cd>OPBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="EUR">5000.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2025-01-01</Dt></Dt>
      </Bal>
      <Ntry>
        <Amt Ccy="EUR">123.45</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2025-01-15</Dt></BookgDt>
        <NtryDtls><TxDtls><RmtInf><Ustrd>Miete Januar 2025</Ustrd></RmtInf></TxDtls></NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">3500.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2025-01-16</Dt></BookgDt>
        <NtryDtls><TxDtls><RmtInf><Ustrd>Gehalt Januar</Ustrd></RmtInf></TxDtls></NtryDtls>
      </Ntry>
      <Bal>
        <Tp><CdOrPrtry><Cd>CLBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="EUR">8376.55</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2025-01-31</Dt></Dt>
      </Bal>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

  test('parses transactions from CAMT.053', () => {
    const result = parseCAMT053File(SAMPLE_CAMT053);
    expect(result).toHaveLength(2);
    expect(result[0].amount).toBe(-123.45);   // Debit
    expect(result[1].amount).toBe(3500);      // Credit
  });

  test('extracts ISO dates', () => {
    const result = parseCAMT053File(SAMPLE_CAMT053);
    expect(result[0].date.toISOString().split('T')[0]).toBe('2025-01-15');
  });

  test('extracts currency from Ccy attribute', () => {
    const result = parseCAMT053File(SAMPLE_CAMT053);
    expect(result[0].currency).toBe('EUR');
  });

  test('extracts descriptions from RmtInf/Ustrd', () => {
    const result = parseCAMT053File(SAMPLE_CAMT053);
    expect(result[0].description).toBe('Miete Januar 2025');
    expect(result[1].description).toBe('Gehalt Januar');
  });

  test('handles multi-currency CAMT.053', () => {
    const multiCcy = SAMPLE_CAMT053.replace(/EUR/g, 'USD');
    const result = parseCAMT053File(multiCcy);
    expect(result[0].currency).toBe('USD');
  });

  test('validates CAMT.053 namespace', () => {
    expect(validateCAMT053File(SAMPLE_CAMT053).isValid).toBe(true);
    expect(validateCAMT053File('<root>not camt</root>').isValid).toBe(false);
  });

  test('handles empty entries list', () => {
    const emptyCamt = SAMPLE_CAMT053.replace(/<Ntry>[\s\S]*?<\/Ntry>/g, '');
    const result = parseCAMT053File(emptyCamt);
    expect(result).toHaveLength(0);
  });
});
```

---

## Format Detection

### Updated Detection Signatures

```typescript
// In format-detector.ts — detectFromContent()
type FileFormat = 'csv' | 'ofx' | 'qfx' | 'qif' | 'mt940' | 'camt053' | 'pdf' | 'unknown';

// Detection priority (check in this order):
// 1. PDF: starts with '%PDF-'
// 2. CAMT.053: XML with 'urn:iso:std:iso:20022:tech:xsd:camt.053'
// 3. OFX 2.x: XML with '<OFX>'
// 4. OFX 1.x: contains 'OFXHEADER:'
// 5. QFX: contains 'QFXHEADER:'
// 6. MT940: contains ':20:' AND (':60F:' OR ':61:')
// 7. QIF: starts with '!Type:' (NOTE: currently misdetected as QBO — must fix)
// 8. CSV: comma-separated structure analysis
```

**Format detection tests**:
```typescript
describe('format-detector', () => {
  test('detects PDF from content signature', async () => {
    const result = detectFromContent('%PDF-1.4 ...');
    expect(result.format).toBe('pdf');
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  test('detects QIF (not QBO)', () => {
    const result = detectFromContent('!Type:Bank\nD01/15/2025\nT-50.00\n^');
    expect(result.format).toBe('qif');
    expect(result.format).not.toBe('qbo'); // Common misdetection!
  });

  test('detects MT940 from SWIFT tags', () => {
    const result = detectFromContent(':20:STARTUMSE\n:25:10020030/1234567890\n:60F:C250101EUR1234,56');
    expect(result.format).toBe('mt940');
  });

  test('detects CAMT.053 from ISO 20022 namespace', () => {
    const result = detectFromContent('<?xml version="1.0"?><Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">');
    expect(result.format).toBe('camt053');
  });

  test('detects OFX 1.x from SGML header', () => {
    const result = detectFromContent('OFXHEADER:100\nDATA:OFXSGML\n<OFX>');
    expect(result.format).toBe('ofx');
  });

  test('detects OFX 2.x from XML with OFX tag', () => {
    const result = detectFromContent('<?xml version="1.0"?><OFX>');
    expect(result.format).toBe('ofx');
  });

  test('distinguishes CAMT.053 XML from OFX XML', () => {
    // Both are XML, but CAMT.053 has ISO 20022 namespace
    const camt = '<?xml version="1.0"?><Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">';
    const ofx = '<?xml version="1.0"?><OFX>';
    expect(detectFromContent(camt).format).toBe('camt053');
    expect(detectFromContent(ofx).format).toBe('ofx');
  });

  test('detects CSV with confidence', () => {
    const result = detectFromContent('Date,Description,Amount\n01/15/2025,Starbucks,-5.00');
    expect(result.format).toBe('csv');
  });

  test('returns unknown for garbage', () => {
    const result = detectFromContent('random binary garbage');
    expect(result.format).toBe('unknown');
  });
});
```

---

## PDF Pipeline (Detailed)

### 1. Native Text Extraction (Always Try First)

```typescript
import * as pdfjs from 'pdfjs-dist';

async function extractPdfText(file: File): Promise<{text: string, hasText: boolean, pages: PageText[]}> {
  const pdf = await pdfjs.getDocument(await file.arrayBuffer()).promise;
  const pages: PageText[] = [];
  let totalText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join(' ');
    pages.push({ pageNumber: i, text, items: content.items });
    totalText += text;
  }

  return { text: totalText, hasText: totalText.trim().length > 100, pages };
}
```

### 2. Tesseract.js Multi-Language OCR

```typescript
// WRONG: Hardcoded English, ASCII whitelist
const worker = await Tesseract.createWorker('eng');
await worker.setParameters({ tessedit_char_whitelist: 'ABC...xyz0-9' }); // BLOCKS non-ASCII

// CORRECT: Locale-aware, no whitelist
import { getOCRLanguage } from './tesseract-lang-map';
const lang = getOCRLanguage(userLocale); // 'de-DE' → 'deu', 'ja-JP' → 'jpn'
const worker = await Tesseract.createWorker(lang);
// NO tessedit_char_whitelist — allow all characters
```

### 3. Multilingual Column Detection

```typescript
// Expand COLUMN_KEYWORDS in pdf-bank-parser.ts for top 20 languages
const COLUMN_KEYWORDS = {
  date: [
    'date', 'trans date', 'transaction date', 'posting date', 'posted',
    'datum', 'buchungstag', 'valuta',         // German
    'fecha', 'fecha operación',                // Spanish
    'date opération', 'date valeur',           // French
    '日付', '取引日',                            // Japanese
    '日期', '交易日期',                           // Chinese
    'تاريخ',                                   // Arabic
    'дата', 'дата операции',                   // Russian
    'tarih', 'işlem tarihi',                   // Turkish
    'data', 'data operação',                   // Portuguese
  ],
  // Similar expansions for description, amount, debit, credit, balance
};
```

---

## International Parsing (Shared by All Formats)

### Amount Parsing

```typescript
import { NumberParser } from '@internationalized/number';

function parseAmount(str: string, locale: string = 'en-US'): number | null {
  const cleaned = str.replace(/[^\d,.\-\s()]/g, '').trim();
  if (!cleaned) return null;

  const isNeg = cleaned.startsWith('(') && cleaned.endsWith(')');
  const numStr = isNeg ? cleaned.slice(1, -1) : cleaned;

  try {
    const parser = new NumberParser(locale, { style: 'decimal' });
    const result = parser.parse(numStr);
    return isNeg ? -Math.abs(result) : result;
  } catch {
    return fallbackParse(numStr, isNeg);
  }
}

function fallbackParse(str: string, isNeg: boolean): number | null {
  const lastComma = str.lastIndexOf(',');
  const lastPeriod = str.lastIndexOf('.');
  let cleaned = str;
  if (lastComma > lastPeriod) {
    cleaned = str.replace(/\./g, '').replace(',', '.'); // EU format
  } else {
    cleaned = str.replace(/,/g, ''); // US format
  }
  const result = parseFloat(cleaned);
  return isNaN(result) ? null : (isNeg ? -Math.abs(result) : result);
}
```

### Date Parsing

```typescript
import { parse } from 'date-fns';
import * as chrono from 'chrono-node';
import { de, fr, es, ja, pt, it, nl, ru, tr } from 'date-fns/locale';

function parseDate(str: string, locale?: string): Date | null {
  // 1. Numeric patterns (fastest)
  // 2. date-fns with locale pack
  // 3. chrono-node NLP fallback
  // 4. JS Date constructor fallback
  // See full implementation in PDF Pipeline section above
}
```

---

## Testing Patterns

### Amount Parser Tests (CRITICAL — Most Common Import Bugs)

```typescript
describe('intl-amount-parser', () => {
  test.each([
    // US/UK
    ['$1,234.56', 'en-US', 1234.56],
    ['-$50.00', 'en-US', -50],
    ['($1,234.56)', 'en-US', -1234.56],
    // European (comma decimal, period grouping)
    ['1.234,56', 'de-DE', 1234.56],
    ['1.234,56 €', 'de-DE', 1234.56],
    ['-1.234,56', 'de-DE', -1234.56],
    // French (space grouping, comma decimal)
    ['1 234,56', 'fr-FR', 1234.56],
    ['1 234,56 €', 'fr-FR', 1234.56],
    // Indian (lakh grouping)
    ['₹1,23,456.78', 'en-IN', 123456.78],
    // Brazilian
    ['R$ 1.234,56', 'pt-BR', 1234.56],
    // Japanese (no decimals for JPY)
    ['¥1,234', 'ja-JP', 1234],
    // Edge cases
    ['0.00', 'en-US', 0],
    ['', 'en-US', null],
    ['abc', 'en-US', null],
    ['1234', 'en-US', 1234],
  ])('"%s" (%s) → %s', (input, locale, expected) => {
    const result = parseAmount(input, locale);
    expected === null ? expect(result).toBeNull() : expect(result).toBeCloseTo(expected as number);
  });
});
```

### Date Parser Tests

```typescript
describe('intl-date-parser', () => {
  test.each([
    // ISO
    ['2025-01-15', undefined, '2025-01-15'],
    // Numeric by locale
    ['15/01/2025', 'en-GB', '2025-01-15'],  // DD/MM
    ['01/15/2025', 'en-US', '2025-01-15'],  // MM/DD
    ['15.01.2025', 'de-DE', '2025-01-15'],  // DD.MM
    // Localized months
    ['15 Jan 2025', 'en-US', '2025-01-15'],
    ['15 Ene 2025', 'es-ES', '2025-01-15'],
    ['15 Fév 2025', 'fr-FR', '2025-02-15'],
    ['15. Jan. 2025', 'de-DE', '2025-01-15'],
  ])('"%s" (%s) → %s', (input, locale, expected) => {
    const result = parseDate(input, locale);
    expect(result?.toISOString().split('T')[0]).toBe(expected);
  });

  test('returns null for garbage', () => expect(parseDate('not a date')).toBeNull());
  test('returns null for empty', () => expect(parseDate('')).toBeNull());
});
```

### PDF Text Extraction Tests

```typescript
describe('pdf-text-extractor', () => {
  test('detects digital PDF (has text)', async () => {
    const result = await extractPdfText(loadTestPdf('digital-statement.pdf'));
    expect(result.hasText).toBe(true);
    expect(result.text.length).toBeGreaterThan(100);
  });

  test('detects scanned PDF (no text)', async () => {
    const result = await extractPdfText(loadTestPdf('scanned-statement.pdf'));
    expect(result.hasText).toBe(false);
  });

  test('preserves non-Latin text (CJK)', async () => {
    const result = await extractPdfText(loadTestPdf('japanese-statement.pdf'));
    expect(result.text).toMatch(/[\u3000-\u9fff]/);
  });
});
```

### Tesseract Language Map Tests

```typescript
describe('tesseract-lang-map', () => {
  test('maps all 113 app locales', () => {
    for (const locale of getAllAppLocales()) {
      expect(getOCRLanguage(locale)).toBeTruthy();
    }
  });

  test.each([
    ['en-US', 'eng'], ['de-DE', 'deu'], ['fr-FR', 'fra'],
    ['ja-JP', 'jpn'], ['zh-CN', 'chi_sim'], ['ar-SA', 'ara'],
    ['ko-KR', 'kor'], ['ru-RU', 'rus'], ['hi-IN', 'hin'],
  ])('%s → %s', (locale, expected) => {
    expect(getOCRLanguage(locale)).toBe(expected);
  });
});
```

### Column Detection Tests (Multilingual)

```typescript
describe('pdf-bank-parser multilingual', () => {
  test.each([
    ['German', 'Datum  Buchungstext  Betrag  Saldo'],
    ['French', 'Date opération  Libellé  Débit  Crédit  Solde'],
    ['Spanish', 'Fecha  Descripción  Cargo  Abono  Saldo'],
  ])('detects %s headers', (_lang, headerRow) => {
    const result = detectColumnPositions([headerRow]);
    expect(result.mapping.dateColumn).not.toBeNull();
    expect(result.mapping.confidence).toBeGreaterThan(0.5);
  });

  test('fuzzy matches OCR errors', () => {
    const result = detectColumnPositions(['Dalum  Buchungstext  Betrag']); // Dalum → Datum
    expect(result.mapping.dateColumn).not.toBeNull();
  });
});
```

### Integration Tests (Full Pipeline per Format)

```typescript
describe('import pipeline integration', () => {
  test('CSV → normalizer → validated transactions', async () => {
    const content = 'Date,Description,Amount\n01/15/2025,Starbucks,-5.00';
    const parsed = parseCSVContent(content, 'auto');
    const normalized = normalizeTransactions(parsed, 'en-US');
    const validation = validateTransactions(normalized);
    expect(validation.valid).toBe(true);
    expect(normalized[0].amount).toBe(-5);
  });

  test('OFX → normalizer → validated transactions', async () => {
    const content = loadTestFile('sample.ofx');
    const parsed = parseOFXFile(content);
    const normalized = normalizeTransactions(parsed.transactions, 'en-US');
    expect(normalized.length).toBeGreaterThan(0);
  });

  test('QIF → normalizer → validated transactions', () => {
    const content = loadTestFile('sample.qif');
    const parsed = parseQIFFile(content, 'en-US');
    const normalized = normalizeTransactions(parsed, 'en-US');
    expect(normalized.length).toBeGreaterThan(0);
  });

  test('MT940 → normalizer → validated transactions', () => {
    const content = loadTestFile('sample.mt940');
    const parsed = parseMT940File(content);
    const normalized = normalizeTransactions(parsed);
    expect(normalized.length).toBeGreaterThan(0);
  });

  test('CAMT.053 → normalizer → validated transactions', () => {
    const content = loadTestFile('sample.camt053.xml');
    const parsed = parseCAMT053File(content);
    const normalized = normalizeTransactions(parsed);
    expect(normalized.length).toBeGreaterThan(0);
    expect(normalized[0].currency).toBe('EUR');
  });

  test('PDF (digital) → text extraction → normalizer → validated', async () => {
    const file = loadTestPdf('digital-statement.pdf');
    const textResult = await extractPdfText(file);
    expect(textResult.hasText).toBe(true);
    const parsed = await parseTextBasedPdf(textResult, 'en-US');
    expect(parsed.length).toBeGreaterThan(0);
  });

  test('offline mode: no fetch calls for any format', async () => {
    const spy = jest.spyOn(global, 'fetch');
    await importPdfOffline(loadTestPdf('statement.pdf'), 'en-US');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
```

---

## Validation Checklist (All Formats)

Every imported transaction MUST pass these validations:

### Required Fields
- [ ] `date` is valid, not future, not > 10 years old
- [ ] `amount` is finite (not NaN, not Infinity)
- [ ] `description` is non-empty (min 2 chars after trim)

### Amount Validation
- [ ] Correct decimal precision (2 for most currencies, 0 for JPY/KRW)
- [ ] Negative = debits/expenses, positive = credits/income
- [ ] No unexplained zero amounts

### Balance Reconciliation (OFX, MT940, CAMT.053 provide balances)
- [ ] Opening + sum(transactions) ≈ closing (tolerance: 0.01 in statement currency)
- [ ] Flag mismatch as warning, don't block import

### Currency Validation
- [ ] Detected currency is valid ISO 4217 code
- [ ] Consistent currency within a single statement
- [ ] Mismatch with account currency triggers user prompt

### Duplicate Detection
- [ ] Check against existing transactions (date + amount + description)
- [ ] Mark duplicates with `isDuplicate: true`
- [ ] Show to user for confirmation

### Format-Specific Validation

| Format | Extra Checks |
|--------|-------------|
| CSV | Column count consistency, encoding detection |
| OFX/QFX | `<OFX>` root exists, `STMTTRN` elements present |
| QIF | `!Type:` header present, `^` delimiters present |
| MT940 | `:20:` + `:60F:` + `:62F:` tags present, balance tags parse |
| CAMT.053 | ISO 20022 namespace present, `<Stmt>` element exists |
| PDF | Text extraction vs OCR path chosen correctly |

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Hardcoding `'eng'` in Tesseract | Use `getOCRLanguage(userLocale)` |
| ASCII-only `tessedit_char_whitelist` | Remove whitelist entirely |
| Assuming `1,234` = US format | Locale-aware: `1,234` = `1.234` in Germany |
| Parsing `01/02/2025` as Jan 2 | Respect locale: UK/EU = Feb 1 |
| Skipping native PDF text extraction | Always try `extractPdfText()` first |
| Network calls in offline mode | Offline must NEVER call `fetch()` |
| Tests with English-only data | Include CJK, Arabic, Cyrillic test fixtures |
| `parseFloat()` on international amounts | Use `@internationalized/number` |
| Creating Tesseract workers per page | Reuse workers (creation = 2-5s each) |
| Misdetecting QIF as QBO | QIF starts with `!Type:`, check before QBO |
| Not checking CAMT.053 namespace | Validate `urn:iso:std:iso:20022:tech:xsd:camt.053` |
| Ignoring MT940 `:86:` structured subfields | Parse `?20`, `?21`, `?32` subfields for descriptions |

## Red Flags: Stop and Review

- Hardcoded language code without locale parameter
- Regex matching ASCII-only letters (`[a-zA-Z]`)
- Amount parsing assuming `.` is always decimal separator
- Date parsing assuming English month names
- `fetch()` in a function meant to work offline
- Tests using only English sample data
- `parseFloat()` on user-visible currency strings
- Format detection that doesn't distinguish QIF from QBO
- Missing namespace validation for XML formats (CAMT.053, OFX 2.x)
