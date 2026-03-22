# StatementKit: Format Exporters + CLI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add format export (CSV, OFX 2.0, QIF, JSON) and a CLI tool (`npx statementkit parse/detect/banks/export`) to the StatementKit parser suite.

**Architecture:** Exporters are pure functions under `src/lib/parsers/exporters/` — each takes `ParsedTransaction[]` + options and returns a formatted string. The CLI (`src/lib/parsers/cli.ts`) uses `commander` (already installed) to wire file I/O to parsers + exporters. Format detection auto-routes to the correct parser. Export defaults to JSON.

**Tech Stack:** TypeScript, commander v14, fast-xml-parser (already installed), vitest

---

### Task 1: JSON Exporter

**Files:**

- Create: `src/lib/parsers/exporters/json-exporter.ts`
- Create: `src/lib/parsers/exporters/__tests__/json-exporter.test.ts`

**Step 1: Write the test**

```typescript
// src/lib/parsers/exporters/__tests__/json-exporter.test.ts
import { describe, it, expect } from "vitest";
import { exportJSON } from "../json-exporter";
import type { ParsedTransaction } from "../../types";

const sampleTxns: ParsedTransaction[] = [
  {
    date: new Date("2025-01-15"),
    description: "GROCERY STORE",
    amount: -45.99,
    isDuplicate: false,
    confidence: 1,
    currency: "USD",
    sourceFormat: "csv",
  },
  {
    date: new Date("2025-01-16"),
    description: "PAYROLL",
    amount: 2500.0,
    isDuplicate: false,
    confidence: 1,
    currency: "USD",
    sourceFormat: "csv",
  },
];

describe("json-exporter", () => {
  it("exports transactions as JSON array", () => {
    const result = exportJSON(sampleTxns);
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].description).toBe("GROCERY STORE");
    expect(parsed[0].amount).toBe(-45.99);
  });

  it("formats dates as ISO strings", () => {
    const result = exportJSON(sampleTxns);
    const parsed = JSON.parse(result);
    expect(parsed[0].date).toMatch(/^2025-01-15/);
  });

  it("includes only financial fields by default", () => {
    const result = exportJSON(sampleTxns);
    const parsed = JSON.parse(result);
    expect(parsed[0]).not.toHaveProperty("isDuplicate");
    expect(parsed[0]).not.toHaveProperty("confidence");
  });

  it("includes all fields with includeMetadata option", () => {
    const result = exportJSON(sampleTxns, { includeMetadata: true });
    const parsed = JSON.parse(result);
    expect(parsed[0]).toHaveProperty("isDuplicate");
    expect(parsed[0]).toHaveProperty("confidence");
  });

  it("pretty prints by default", () => {
    const result = exportJSON(sampleTxns);
    expect(result).toContain("\n");
  });

  it("supports compact mode", () => {
    const result = exportJSON(sampleTxns, { compact: true });
    expect(result).not.toContain("\n");
  });

  it("returns empty array for no transactions", () => {
    const result = exportJSON([]);
    expect(JSON.parse(result)).toEqual([]);
  });
});
```

**Step 2: Implement**

```typescript
// src/lib/parsers/exporters/json-exporter.ts
import type { ParsedTransaction } from "../types";

export interface JSONExportOptions {
  includeMetadata?: boolean;
  compact?: boolean;
}

export function exportJSON(
  transactions: ParsedTransaction[],
  options: JSONExportOptions = {}
): string {
  const { includeMetadata = false, compact = false } = options;

  const data = transactions.map((tx) => {
    const base: Record<string, unknown> = {
      date: tx.date.toISOString(),
      description: tx.description,
      amount: tx.amount,
    };
    if (tx.currency) base.currency = tx.currency;
    if (tx.sourceFormat) base.sourceFormat = tx.sourceFormat;
    if (tx.fitid) base.fitid = tx.fitid;
    if (tx.checkNum) base.checkNum = tx.checkNum;
    if (tx.transactionType) base.transactionType = tx.transactionType;
    if (tx.balance !== undefined) base.balance = tx.balance;

    if (includeMetadata) {
      base.isDuplicate = tx.isDuplicate;
      base.confidence = tx.confidence;
      if (tx.duplicateReason) base.duplicateReason = tx.duplicateReason;
      if (tx.matchedTransactionId) base.matchedTransactionId = tx.matchedTransactionId;
      if (tx.requiresReview) base.requiresReview = tx.requiresReview;
    }

    return base;
  });

  return JSON.stringify(data, null, compact ? undefined : 2);
}
```

---

### Task 2: CSV Exporter

**Files:**

- Create: `src/lib/parsers/exporters/csv-exporter.ts`
- Create: `src/lib/parsers/exporters/__tests__/csv-exporter.test.ts`

**Step 1: Write the test**

```typescript
// src/lib/parsers/exporters/__tests__/csv-exporter.test.ts
import { describe, it, expect } from "vitest";
import { exportCSV } from "../csv-exporter";
import type { ParsedTransaction } from "../../types";

const sampleTxns: ParsedTransaction[] = [
  {
    date: new Date("2025-01-15"),
    description: "GROCERY STORE",
    amount: -45.99,
    isDuplicate: false,
    confidence: 1,
    currency: "USD",
    sourceFormat: "csv",
  },
  {
    date: new Date("2025-01-16"),
    description: 'CAFE "CENTRAL"',
    amount: -12.5,
    isDuplicate: false,
    confidence: 1,
    sourceFormat: "csv",
  },
];

describe("csv-exporter", () => {
  it("exports with header row", () => {
    const result = exportCSV(sampleTxns);
    const lines = result.split("\n");
    expect(lines[0]).toBe("Date,Description,Amount,Currency");
  });

  it("formats dates as YYYY-MM-DD", () => {
    const result = exportCSV(sampleTxns);
    expect(result).toContain("2025-01-15");
  });

  it("escapes descriptions containing commas or quotes", () => {
    const result = exportCSV(sampleTxns);
    expect(result).toContain('"CAFE ""CENTRAL"""');
  });

  it("uses custom delimiter", () => {
    const result = exportCSV(sampleTxns, { delimiter: ";" });
    const lines = result.split("\n");
    expect(lines[0]).toBe("Date;Description;Amount;Currency");
  });

  it("includes optional columns when present", () => {
    const txns: ParsedTransaction[] = [
      {
        date: new Date("2025-01-15"),
        description: "CHECK",
        amount: -100,
        isDuplicate: false,
        confidence: 1,
        checkNum: "1234",
        transactionType: "CHECK",
        sourceFormat: "ofx",
      },
    ];
    const result = exportCSV(txns);
    expect(result).toContain("Type");
    expect(result).toContain("CHECK");
  });

  it("returns header only for empty transactions", () => {
    const result = exportCSV([]);
    expect(result.split("\n")).toHaveLength(1);
  });
});
```

**Step 2: Implement**

```typescript
// src/lib/parsers/exporters/csv-exporter.ts
import type { ParsedTransaction } from "../types";

export interface CSVExportOptions {
  delimiter?: string;
  dateFormat?: "iso" | "us" | "eu";
}

function escapeCSV(value: string, delimiter: string): string {
  if (value.includes(delimiter) || value.includes('"') || value.includes("\n")) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function formatDate(date: Date, format: string): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  switch (format) {
    case "us":
      return `${m}/${d}/${y}`;
    case "eu":
      return `${d}/${m}/${y}`;
    default:
      return `${y}-${m}-${d}`;
  }
}

export function exportCSV(
  transactions: ParsedTransaction[],
  options: CSVExportOptions = {}
): string {
  const { delimiter = ",", dateFormat = "iso" } = options;

  // Determine which optional columns have data
  const hasType = transactions.some((tx) => tx.transactionType);
  const hasCheckNum = transactions.some((tx) => tx.checkNum);
  const hasBalance = transactions.some((tx) => tx.balance !== undefined);

  // Build header
  const headers = ["Date", "Description", "Amount", "Currency"];
  if (hasType) headers.push("Type");
  if (hasCheckNum) headers.push("CheckNum");
  if (hasBalance) headers.push("Balance");

  const lines = [headers.join(delimiter)];

  for (const tx of transactions) {
    const row = [
      formatDate(tx.date, dateFormat),
      escapeCSV(tx.description, delimiter),
      tx.amount.toString(),
      tx.currency ?? "",
    ];
    if (hasType) row.push(tx.transactionType ?? "");
    if (hasCheckNum) row.push(tx.checkNum ?? "");
    if (hasBalance) row.push(tx.balance !== undefined ? tx.balance.toString() : "");
    lines.push(row.join(delimiter));
  }

  return lines.join("\n");
}
```

---

### Task 3: QIF Exporter

**Files:**

- Create: `src/lib/parsers/exporters/qif-exporter.ts`
- Create: `src/lib/parsers/exporters/__tests__/qif-exporter.test.ts`

**Step 1: Write the test**

```typescript
// src/lib/parsers/exporters/__tests__/qif-exporter.test.ts
import { describe, it, expect } from "vitest";
import { exportQIF } from "../qif-exporter";
import type { ParsedTransaction } from "../../types";

const sampleTxns: ParsedTransaction[] = [
  {
    date: new Date("2025-01-15"),
    description: "GROCERY STORE",
    amount: -45.99,
    isDuplicate: false,
    confidence: 1,
    checkNum: "1001",
    sourceFormat: "csv",
  },
];

describe("qif-exporter", () => {
  it("starts with account type header", () => {
    const result = exportQIF(sampleTxns);
    expect(result.startsWith("!Type:Bank")).toBe(true);
  });

  it("exports D (date) in MM/DD/YYYY format", () => {
    const result = exportQIF(sampleTxns);
    expect(result).toContain("D01/15/2025");
  });

  it("exports T (amount)", () => {
    const result = exportQIF(sampleTxns);
    expect(result).toContain("T-45.99");
  });

  it("exports P (payee)", () => {
    const result = exportQIF(sampleTxns);
    expect(result).toContain("PGROCERY STORE");
  });

  it("exports N (check number) when present", () => {
    const result = exportQIF(sampleTxns);
    expect(result).toContain("N1001");
  });

  it("ends each record with ^", () => {
    const result = exportQIF(sampleTxns);
    expect(result.trim().endsWith("^")).toBe(true);
  });

  it("supports credit card account type", () => {
    const result = exportQIF(sampleTxns, { accountType: "CCard" });
    expect(result.startsWith("!Type:CCard")).toBe(true);
  });

  it("returns header only for empty transactions", () => {
    const result = exportQIF([]);
    expect(result.trim()).toBe("!Type:Bank");
  });
});
```

**Step 2: Implement**

```typescript
// src/lib/parsers/exporters/qif-exporter.ts
import type { ParsedTransaction } from "../types";

export interface QIFExportOptions {
  accountType?: "Bank" | "CCard" | "Cash" | "Invst";
}

export function exportQIF(
  transactions: ParsedTransaction[],
  options: QIFExportOptions = {}
): string {
  const { accountType = "Bank" } = options;
  const lines: string[] = [`!Type:${accountType}`];

  for (const tx of transactions) {
    const m = String(tx.date.getMonth() + 1).padStart(2, "0");
    const d = String(tx.date.getDate()).padStart(2, "0");
    const y = tx.date.getFullYear();

    lines.push(`D${m}/${d}/${y}`);
    lines.push(`T${tx.amount}`);
    lines.push(`P${tx.description}`);
    if (tx.checkNum) lines.push(`N${tx.checkNum}`);
    lines.push("^");
  }

  return lines.join("\n");
}
```

---

### Task 4: OFX 2.0 Exporter

**Files:**

- Create: `src/lib/parsers/exporters/ofx-exporter.ts`
- Create: `src/lib/parsers/exporters/__tests__/ofx-exporter.test.ts`

**Step 1: Write the test**

```typescript
// src/lib/parsers/exporters/__tests__/ofx-exporter.test.ts
import { describe, it, expect } from "vitest";
import { exportOFX } from "../ofx-exporter";
import type { ParsedTransaction } from "../../types";

const sampleTxns: ParsedTransaction[] = [
  {
    date: new Date("2025-01-15"),
    description: "GROCERY STORE",
    amount: -45.99,
    isDuplicate: false,
    confidence: 1,
    currency: "USD",
    fitid: "202501150001",
    transactionType: "DEBIT",
    sourceFormat: "csv",
  },
];

describe("ofx-exporter", () => {
  it("produces valid XML with OFX header", () => {
    const result = exportOFX(sampleTxns);
    expect(result).toContain("<?xml");
    expect(result).toContain("<OFX>");
    expect(result).toContain("</OFX>");
  });

  it("wraps transactions in STMTRS", () => {
    const result = exportOFX(sampleTxns);
    expect(result).toContain("<STMTRS>");
    expect(result).toContain("<BANKTRANLIST>");
  });

  it("formats dates as YYYYMMDD", () => {
    const result = exportOFX(sampleTxns);
    expect(result).toContain("<DTPOSTED>20250115");
  });

  it("includes TRNAMT", () => {
    const result = exportOFX(sampleTxns);
    expect(result).toContain("<TRNAMT>-45.99");
  });

  it("includes FITID", () => {
    const result = exportOFX(sampleTxns);
    expect(result).toContain("<FITID>202501150001");
  });

  it("generates FITID when not present", () => {
    const txns = [{ ...sampleTxns[0], fitid: undefined }];
    const result = exportOFX(txns);
    expect(result).toMatch(/<FITID>[^<]+/);
  });

  it("uses custom currency", () => {
    const result = exportOFX(sampleTxns, { currency: "CAD" });
    expect(result).toContain("<CURDEF>CAD");
  });

  it("handles empty transactions", () => {
    const result = exportOFX([]);
    expect(result).toContain("<BANKTRANLIST>");
    expect(result).toContain("</BANKTRANLIST>");
  });
});
```

**Step 2: Implement**

```typescript
// src/lib/parsers/exporters/ofx-exporter.ts
import type { ParsedTransaction } from "../types";

export interface OFXExportOptions {
  currency?: string;
  accountId?: string;
  bankId?: string;
  accountType?: "CHECKING" | "SAVINGS" | "CREDITCARD";
}

function formatOFXDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportOFX(
  transactions: ParsedTransaction[],
  options: OFXExportOptions = {}
): string {
  const {
    currency = "USD",
    accountId = "0000000000",
    bankId = "000000000",
    accountType = "CHECKING",
  } = options;

  const now = formatOFXDate(new Date());
  const dates = transactions.map((tx) => tx.date.getTime());
  const startDate = dates.length > 0 ? formatOFXDate(new Date(Math.min(...dates))) : now;
  const endDate = dates.length > 0 ? formatOFXDate(new Date(Math.max(...dates))) : now;

  const txnEntries = transactions
    .map((tx, i) => {
      const trnType = tx.transactionType ?? (tx.amount < 0 ? "DEBIT" : "CREDIT");
      const fitid = tx.fitid ?? `${formatOFXDate(tx.date)}${String(i).padStart(4, "0")}`;
      return `<STMTTRN>
<TRNTYPE>${trnType}
<DTPOSTED>${formatOFXDate(tx.date)}
<TRNAMT>${tx.amount}
<FITID>${fitid}
<NAME>${xmlEscape(tx.description)}
</STMTTRN>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?OFX OFXHEADER="200" VERSION="220" SECURITY="NONE" OLDFILEUID="NONE" NEWFILEUID="NONE"?>
<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS><CODE>0<SEVERITY>INFO</STATUS>
<DTSERVER>${now}
<LANGUAGE>ENG
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<CURDEF>${currency}
<BANKACCTFROM>
<BANKID>${bankId}
<ACCTID>${accountId}
<ACCTTYPE>${accountType}
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>${startDate}
<DTEND>${endDate}
${txnEntries}
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;
}
```

---

### Task 5: Exporter Index

**Files:**

- Create: `src/lib/parsers/exporters/index.ts`
- Create: `src/lib/parsers/exporters/__tests__/index.test.ts`

Unified `exportTransactions(txns, format, options)` API.

```typescript
// src/lib/parsers/exporters/index.ts
import type { ParsedTransaction } from "../types";
import { exportJSON, type JSONExportOptions } from "./json-exporter";
import { exportCSV, type CSVExportOptions } from "./csv-exporter";
import { exportQIF, type QIFExportOptions } from "./qif-exporter";
import { exportOFX, type OFXExportOptions } from "./ofx-exporter";

export type ExportFormat = "json" | "csv" | "qif" | "ofx";

export type ExportOptions =
  | {
      format: "json";
      options?: JSONExportOptions;
    }
  | {
      format: "csv";
      options?: CSVExportOptions;
    }
  | {
      format: "qif";
      options?: QIFExportOptions;
    }
  | {
      format: "ofx";
      options?: OFXExportOptions;
    };

export function exportTransactions(
  transactions: ParsedTransaction[],
  format: ExportFormat,
  options?: Record<string, unknown>
): string {
  switch (format) {
    case "json":
      return exportJSON(transactions, options as JSONExportOptions);
    case "csv":
      return exportCSV(transactions, options as CSVExportOptions);
    case "qif":
      return exportQIF(transactions, options as QIFExportOptions);
    case "ofx":
      return exportOFX(transactions, options as OFXExportOptions);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export function getSupportedExportFormats(): ExportFormat[] {
  return ["json", "csv", "qif", "ofx"];
}

export { exportJSON, exportCSV, exportQIF, exportOFX };
export type { JSONExportOptions, CSVExportOptions, QIFExportOptions, OFXExportOptions };
```

---

### Task 6: CLI Tool

**Files:**

- Create: `src/lib/parsers/cli.ts`
- Create: `src/lib/parsers/__tests__/cli.test.ts`

The CLI wires file I/O to parsers + exporters. Commands:

- `parse <file>` — detect format, parse, output as JSON/CSV/QIF/OFX
- `detect <file>` — print detected format + confidence
- `banks` — list supported banks
- `export <file> --format csv` — parse then re-export to different format

**Implementation:** See cli.ts code in Task 6 step 2. Uses commander, fs/promises, and the existing parsers.

---

### Task 7: Run all tests, commit, push
