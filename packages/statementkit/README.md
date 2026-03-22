# StatementKit

Privacy-first bank statement parsing SDK. Parse CSV, OFX, QFX, QIF, MT940, CAMT.052/053/054, and scanned PDFs.

- **30+ banks** across 8 regions (NA, EU, UK, AU, Asia)
- **68 OCR languages** via Tesseract.js
- **70+ currency symbols** with locale-aware parsing
- **11 file formats** with content-based auto-detection
- **100% offline** — no API keys, no network calls for core parsing
- **AI optional** — bring your own key (BYOK) for smart enrichment

## Install

```bash
npm install statementkit
```

For PDF OCR support (optional):

```bash
npm install statementkit pdfjs-dist tesseract.js
```

## Quick Start

```typescript
import { detectFromContent, parseOFXFile, exportTransactions } from "statementkit";

// Auto-detect format
const detection = detectFromContent(fileContent);
console.log(detection.format, detection.confidence);

// Parse OFX/QFX
const result = await parseOFXFile(content, "my-account");
console.log(`Found ${result.transactions.length} transactions`);

// Export to CSV
const csv = exportTransactions(result.transactions, "csv");
```

## CLI

```bash
# Parse a statement
npx statementkit parse statement.csv --bank td --output json

# Detect file format
npx statementkit detect mystery-file.dat

# List supported banks
npx statementkit banks --region NA

# Convert between formats
npx statementkit export statement.ofx --format csv --out-file output.csv

# Generate bank config template
npx statementkit config template --key my_bank > config.json

# Validate a config
npx statementkit config validate config.json

# Auto-suggest config from CSV
npx statementkit config suggest sample.csv
```

## Supported Formats

| Format   | Extension | Description                         |
| -------- | --------- | ----------------------------------- |
| CSV      | .csv      | Universal, with 30+ bank configs    |
| OFX      | .ofx      | Open Financial Exchange 1.x/2.x     |
| QFX      | .qfx      | Quicken Financial Exchange          |
| QBO      | .qbo      | QuickBooks format                   |
| QIF      | .qif      | Quicken Interchange Format          |
| MT940    | .sta      | SWIFT bank statement                |
| MT942    | .sta      | SWIFT intraday report               |
| CAMT.052 | .xml      | ISO 20022 intraday report           |
| CAMT.053 | .xml      | ISO 20022 end-of-day statement      |
| CAMT.054 | .xml      | ISO 20022 debit/credit notification |
| PDF      | .pdf      | Scanned statements via OCR          |

## Custom Bank Configs

```typescript
import { registerBank } from "statementkit";

registerBank("myBank", {
  name: "My Bank",
  dateColumn: "Datum",
  descriptionColumn: "Omschrijving",
  amountColumn: "Bedrag",
  dateFormat: "dd-MM-yyyy",
  hasHeader: true,
  region: "EU",
  decimalSeparator: ",",
});
```

Or load from JSON:

```typescript
import { loadBankConfigJSON } from "statementkit";

const json = fs.readFileSync("bank-configs.json", "utf-8");
const result = loadBankConfigJSON(json);
console.log(`Registered: ${result.registered.join(", ")}`);
```

## AI Enrichment (BYOK)

```typescript
import { setAIProvider, type AIProvider } from "statementkit";

const myProvider: AIProvider = {
  async chatCompletion(prompt, options) {
    const response = await openai.chat.completions.create({
      model: options?.model ?? "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    return { success: true, data: response.choices[0].message.content ?? "" };
  },
};

setAIProvider(myProvider);
```

## License

MIT
