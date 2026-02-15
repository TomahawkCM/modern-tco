/**
 * Generate Test PDF Bank Statements
 *
 * Uses Puppeteer to render HTML bank statement tables to PDF.
 * Puppeteer's page.pdf() produces PDFs with real text layers (not images),
 * which pdfjs-dist can extract.
 *
 * Generates 6 PDFs:
 *   - English (USD)
 *   - German (EUR)
 *   - French (EUR)
 *   - Spanish (EUR)
 *   - Japanese (JPY)
 *   - Arabic (SAR)
 *
 * Usage: npx tsx scripts/generate-test-pdfs.ts
 */

import puppeteer from "puppeteer";
import * as path from "path";
import * as fs from "fs";

const OUTPUT_DIR = path.join(__dirname, "..", "tests", "fixtures", "pdf");

interface StatementConfig {
  locale: string;
  filename: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  currencySymbol: string;
  headers: {
    date: string;
    description: string;
    debit: string;
    credit: string;
    balance: string;
  };
  transactions: Array<{
    date: string;
    description: string;
    debit: string;
    credit: string;
    balance: string;
  }>;
  openingBalance: string;
  closingBalance: string;
  statementPeriod: string;
  direction?: "rtl" | "ltr";
  fontFamily?: string;
  googleFont?: string;
}

const statements: StatementConfig[] = [
  // ============================================================
  // English (US) - USD
  // ============================================================
  {
    locale: "en-US",
    filename: "bank-statement-en-us.pdf",
    bankName: "First National Bank",
    accountNumber: "XXXX-XXXX-1234",
    currency: "USD",
    currencySymbol: "$",
    headers: {
      date: "Date",
      description: "Description",
      debit: "Debit",
      credit: "Credit",
      balance: "Balance",
    },
    openingBalance: "$5,000.00",
    closingBalance: "$6,192.76",
    statementPeriod: "January 1, 2025 - January 31, 2025",
    transactions: [
      {
        date: "01/15/2025",
        description: "AMAZON.COM PURCHASE",
        debit: "$45.99",
        credit: "",
        balance: "$4,954.01",
      },
      {
        date: "01/16/2025",
        description: "STARBUCKS #1234 COFFEE",
        debit: "$12.50",
        credit: "",
        balance: "$4,941.51",
      },
      {
        date: "01/17/2025",
        description: "PAYROLL DEPOSIT - ACME CORP",
        debit: "",
        credit: "$2,500.00",
        balance: "$7,441.51",
      },
      {
        date: "01/18/2025",
        description: "WHOLE FOODS MARKET #10432",
        debit: "$89.75",
        credit: "",
        balance: "$7,351.76",
      },
      {
        date: "01/20/2025",
        description: "COMCAST CABLE MONTHLY",
        debit: "$150.00",
        credit: "",
        balance: "$7,201.76",
      },
      {
        date: "01/22/2025",
        description: "ELECTRIC COMPANY PAYMENT",
        debit: "$234.00",
        credit: "",
        balance: "$6,967.76",
      },
      {
        date: "01/25/2025",
        description: "TRANSFER FROM SAVINGS",
        debit: "",
        credit: "$500.00",
        balance: "$7,467.76",
      },
      {
        date: "01/28/2025",
        description: "RENT PAYMENT - APT 4B",
        debit: "$1,275.00",
        credit: "",
        balance: "$6,192.76",
      },
    ],
  },

  // ============================================================
  // German (DE) - EUR
  // ============================================================
  {
    locale: "de-DE",
    filename: "bank-statement-de-de.pdf",
    bankName: "Deutsche Volksbank eG",
    accountNumber: "DE89 3704 0044 0532 0130 00",
    currency: "EUR",
    currencySymbol: "\u20AC",
    headers: {
      date: "Datum",
      description: "Beschreibung",
      debit: "Soll",
      credit: "Haben",
      balance: "Saldo",
    },
    openingBalance: "5.000,00 \u20AC",
    closingBalance: "6.279,60 \u20AC",
    statementPeriod: "01.01.2025 - 31.01.2025",
    transactions: [
      {
        date: "15.01.2025",
        description: "EDEKA SUPERMARKT MUENCHEN",
        debit: "45,50 \u20AC",
        credit: "",
        balance: "4.954,50 \u20AC",
      },
      {
        date: "16.01.2025",
        description: "GEHALTSZAHLUNG SIEMENS AG",
        debit: "",
        credit: "1.250,00 \u20AC",
        balance: "6.204,50 \u20AC",
      },
      {
        date: "17.01.2025",
        description: "AMAZON EU SARL BESTELLUNG",
        debit: "89,90 \u20AC",
        credit: "",
        balance: "6.114,60 \u20AC",
      },
      {
        date: "18.01.2025",
        description: "DEUTSCHE TELEKOM RECHNUNG",
        debit: "35,00 \u20AC",
        credit: "",
        balance: "6.079,60 \u20AC",
      },
      {
        date: "20.01.2025",
        description: "UEBERWEISUNG MUELLER HANS",
        debit: "",
        credit: "200,00 \u20AC",
        balance: "6.279,60 \u20AC",
      },
    ],
  },

  // ============================================================
  // French (FR) - EUR
  // ============================================================
  {
    locale: "fr-FR",
    filename: "bank-statement-fr-fr.pdf",
    bankName: "Cr\u00E9dit Agricole",
    accountNumber: "FR76 3000 6000 0112 3456 7890 189",
    currency: "EUR",
    currencySymbol: "\u20AC",
    headers: {
      date: "Date",
      description: "Libell\u00E9",
      debit: "D\u00E9bit",
      credit: "Cr\u00E9dit",
      balance: "Solde",
    },
    openingBalance: "5 000,00 \u20AC",
    closingBalance: "6 115,50 \u20AC",
    statementPeriod: "01/01/2025 - 31/01/2025",
    transactions: [
      {
        date: "15/01/2025",
        description: "CARREFOUR ACHAT CB",
        debit: "67,30 \u20AC",
        credit: "",
        balance: "4 932,70 \u20AC",
      },
      {
        date: "16/01/2025",
        description: "VIREMENT SALAIRE RENAULT SA",
        debit: "",
        credit: "1 450,00 \u20AC",
        balance: "6 382,70 \u20AC",
      },
      {
        date: "17/01/2025",
        description: "PRLV ORANGE MOBILE",
        debit: "42,90 \u20AC",
        credit: "",
        balance: "6 339,80 \u20AC",
      },
      {
        date: "18/01/2025",
        description: "PRLV EDF ELECTRICITE",
        debit: "124,30 \u20AC",
        credit: "",
        balance: "6 215,50 \u20AC",
      },
      {
        date: "20/01/2025",
        description: "PRLV ASSURANCE AXA",
        debit: "100,00 \u20AC",
        credit: "",
        balance: "6 115,50 \u20AC",
      },
    ],
  },

  // ============================================================
  // Spanish (ES) - EUR
  // ============================================================
  {
    locale: "es-ES",
    filename: "bank-statement-es-es.pdf",
    bankName: "Banco Santander",
    accountNumber: "ES91 2100 0418 4502 0005 1332",
    currency: "EUR",
    currencySymbol: "\u20AC",
    headers: {
      date: "Fecha",
      description: "Descripci\u00F3n",
      debit: "D\u00E9bito",
      credit: "Cr\u00E9dito",
      balance: "Saldo",
    },
    openingBalance: "5.000,00 \u20AC",
    closingBalance: "5.842,20 \u20AC",
    statementPeriod: "01/01/2025 - 31/01/2025",
    transactions: [
      {
        date: "15/01/2025",
        description: "MERCADONA S.A. COMPRA",
        debit: "78,30 \u20AC",
        credit: "",
        balance: "4.921,70 \u20AC",
      },
      {
        date: "16/01/2025",
        description: "NOMINA TELEFONICA S.A.",
        debit: "",
        credit: "1.200,00 \u20AC",
        balance: "6.121,70 \u20AC",
      },
      {
        date: "17/01/2025",
        description: "RECIBO VODAFONE ESPANA",
        debit: "45,50 \u20AC",
        credit: "",
        balance: "6.076,20 \u20AC",
      },
      {
        date: "18/01/2025",
        description: "RECIBO IBERDROLA ENERGIA",
        debit: "134,00 \u20AC",
        credit: "",
        balance: "5.942,20 \u20AC",
      },
      {
        date: "20/01/2025",
        description: "RECIBO SEGURO MAPFRE",
        debit: "100,00 \u20AC",
        credit: "",
        balance: "5.842,20 \u20AC",
      },
    ],
  },

  // ============================================================
  // Japanese (JP) - JPY
  // ============================================================
  {
    locale: "ja-JP",
    filename: "bank-statement-ja-jp.pdf",
    bankName: "\u4E09\u83F1UFJ\u9280\u884C",
    accountNumber: "1234567890",
    currency: "JPY",
    currencySymbol: "\u00A5",
    headers: {
      date: "\u65E5\u4ED8",
      description: "\u6458\u8981",
      debit: "\u51FA\u91D1",
      credit: "\u5165\u91D1",
      balance: "\u6B8B\u9AD8",
    },
    openingBalance: "\u00A5500,000",
    closingBalance: "\u00A5621,200",
    statementPeriod: "2025\u5E741\u67081\u65E5 - 2025\u5E741\u670831\u65E5",
    fontFamily: "'Noto Sans JP', sans-serif",
    googleFont: "Noto+Sans+JP",
    transactions: [
      {
        date: "2025\u5E741\u670815\u65E5",
        description: "\u30A4\u30AA\u30F3\u30E2\u30FC\u30EB\u8CB7\u3044\u7269",
        debit: "\u00A53,500",
        credit: "",
        balance: "\u00A5496,500",
      },
      {
        date: "2025\u5E741\u670816\u65E5",
        description: "\u7D66\u4E0E\u632F\u8FBC \u30C8\u30E8\u30BF\u81EA\u52D5\u8ECA",
        debit: "",
        credit: "\u00A5250,000",
        balance: "\u00A5746,500",
      },
      {
        date: "2025\u5E741\u670817\u65E5",
        description: "Amazon.co.jp \u8CFC\u5165",
        debit: "\u00A58,800",
        credit: "",
        balance: "\u00A5737,700",
      },
      {
        date: "2025\u5E741\u670818\u65E5",
        description: "NTT\u30C9\u30B3\u30E2 \u643A\u5E2F\u6599\u91D1",
        debit: "\u00A57,500",
        credit: "",
        balance: "\u00A5730,200",
      },
      {
        date: "2025\u5E741\u670820\u65E5",
        description: "\u96FB\u6C17\u4EE3 \u6771\u4EAC\u96FB\u529B",
        debit: "\u00A512,000",
        credit: "",
        balance: "\u00A5718,200",
      },
      {
        date: "2025\u5E741\u670825\u65E5",
        description: "\u5BB6\u8CC3\u632F\u8FBC",
        debit: "\u00A597,000",
        credit: "",
        balance: "\u00A5621,200",
      },
    ],
  },

  // ============================================================
  // Arabic (SA) - SAR
  // ============================================================
  {
    locale: "ar-SA",
    filename: "bank-statement-ar-sa.pdf",
    bankName:
      "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A",
    accountNumber: "SA03 8000 0000 6080 1016 7519",
    currency: "SAR",
    currencySymbol: "\uFDFC",
    headers: {
      date: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E",
      description: "\u0627\u0644\u0648\u0635\u0641",
      debit: "\u0645\u062F\u064A\u0646",
      credit: "\u062F\u0627\u0626\u0646",
      balance: "\u0627\u0644\u0631\u0635\u064A\u062F",
    },
    openingBalance: "\uFDFC 50,000.00",
    closingBalance: "\uFDFC 57,350.00",
    statementPeriod: "01/01/2025 - 31/01/2025",
    direction: "rtl",
    fontFamily: "'Noto Sans Arabic', sans-serif",
    googleFont: "Noto+Sans+Arabic",
    transactions: [
      {
        date: "15/01/2025",
        description:
          "\u0645\u0634\u062A\u0631\u064A\u0627\u062A \u0647\u0627\u064A\u0628\u0631 \u0645\u0627\u0631\u0643\u062A",
        debit: "\uFDFC 350.00",
        credit: "",
        balance: "\uFDFC 49,650.00",
      },
      {
        date: "16/01/2025",
        description:
          "\u0631\u0627\u062A\u0628 \u0634\u0631\u0643\u0629 \u0623\u0631\u0627\u0645\u0643\u0648",
        debit: "",
        credit: "\uFDFC 12,000.00",
        balance: "\uFDFC 61,650.00",
      },
      {
        date: "17/01/2025",
        description:
          "\u0641\u0627\u062A\u0648\u0631\u0629 STC \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A",
        debit: "\uFDFC 250.00",
        credit: "",
        balance: "\uFDFC 61,400.00",
      },
      {
        date: "18/01/2025",
        description:
          "\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621",
        debit: "\uFDFC 450.00",
        credit: "",
        balance: "\uFDFC 60,950.00",
      },
      {
        date: "20/01/2025",
        description: "\u0625\u064A\u062C\u0627\u0631 \u0634\u0642\u0629",
        debit: "\uFDFC 3,600.00",
        credit: "",
        balance: "\uFDFC 57,350.00",
      },
    ],
  },
];

function generateHTML(config: StatementConfig): string {
  const dir = config.direction || "ltr";
  const fontFamily = config.fontFamily || "'Segoe UI', Arial, sans-serif";
  const googleFontLink = config.googleFont
    ? `<link href="https://fonts.googleapis.com/css2?family=${config.googleFont}&display=swap" rel="stylesheet">`
    : "";

  const transactionRows = config.transactions
    .map(
      (tx) => `
      <tr>
        <td style="padding: 12px 24px; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">${tx.date}</td>
        <td style="padding: 12px 24px; border-bottom: 1px solid #e5e7eb;">${tx.description}</td>
        <td style="padding: 12px 24px; border-bottom: 1px solid #e5e7eb; text-align: right; white-space: nowrap; color: ${tx.debit ? "#dc2626" : "transparent"};">${tx.debit || "—"}</td>
        <td style="padding: 12px 24px; border-bottom: 1px solid #e5e7eb; text-align: right; white-space: nowrap; color: ${tx.credit ? "#16a34a" : "transparent"};">${tx.credit || "—"}</td>
        <td style="padding: 12px 24px; border-bottom: 1px solid #e5e7eb; text-align: right; white-space: nowrap; font-weight: 500;">${tx.balance}</td>
      </tr>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${config.locale}">
<head>
  <meta charset="UTF-8">
  ${googleFontLink}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${fontFamily};
      font-size: 11px;
      color: #1f2937;
      padding: 40px;
      direction: ${dir};
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #1e40af;
    }
    .header h1 {
      font-size: 20px;
      color: #1e40af;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 11px;
      color: #6b7280;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 11px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background-color: #1e40af;
      color: white;
      padding: 12px 24px;
      text-align: ${dir === "rtl" ? "right" : "left"};
      font-weight: 600;
      font-size: 11px;
      white-space: nowrap;
    }
    th:nth-child(3), th:nth-child(4), th:nth-child(5) {
      text-align: right;
    }
    .balance-row {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      padding: 10px 0;
      border-top: 2px solid #1e40af;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${config.bankName}</h1>
    <p>Account: ${config.accountNumber}</p>
    <p>Statement Period: ${config.statementPeriod}</p>
  </div>

  <div class="info-row">
    <span>Opening Balance: ${config.openingBalance}</span>
    <span>Currency: ${config.currency}</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>${config.headers.date}</th>
        <th>${config.headers.description}</th>
        <th style="text-align: right;">${config.headers.debit}</th>
        <th style="text-align: right;">${config.headers.credit}</th>
        <th style="text-align: right;">${config.headers.balance}</th>
      </tr>
    </thead>
    <tbody>
      ${transactionRows}
    </tbody>
  </table>

  <div class="balance-row">
    <span>Closing Balance: ${config.closingBalance}</span>
  </div>
</body>
</html>`;
}

async function main() {
  console.log("Generating test PDF bank statements...");
  console.log(`Output directory: ${OUTPUT_DIR}`);

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const config of statements) {
    console.log(`  Generating ${config.filename} (${config.locale})...`);

    const page = await browser.newPage();
    const html = generateHTML(config);

    await page.setContent(html, { waitUntil: "networkidle0" });

    // Wait for fonts to load (especially Google Fonts for CJK/Arabic)
    if (config.googleFont) {
      await page.waitForFunction(() => document.fonts.ready);
      // Extra wait for font rendering
      await new Promise((r) => setTimeout(r, 1000));
    }

    const outputPath = path.join(OUTPUT_DIR, config.filename);
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });

    const stats = fs.statSync(outputPath);
    console.log(`    -> ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);

    await page.close();
  }

  await browser.close();

  console.log(`\nDone! Generated ${statements.length} PDFs in ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error("Failed to generate PDFs:", err);
  process.exit(1);
});
