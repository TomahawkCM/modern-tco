/**
 * StatementKit CLI
 *
 * Parse bank statements from the command line.
 *
 * Usage:
 *   npx statementkit parse statement.csv [--bank td] [--output json]
 *   npx statementkit detect statement.pdf
 *   npx statementkit banks [--region NA]
 *   npx statementkit export statement.ofx --format csv
 */

import { Command } from "commander";
import { readFile, writeFile } from "fs/promises";
import { resolve, extname, basename } from "path";

import { detectFromContent, type FileFormat } from "./format-detector";
import { parseCSVContent, convertToTransactions } from "./csv-parser";
import { parseOFXFile } from "./ofx-parser";
import { parseQIFFile } from "./qif-parser";
import { parseMT940File, parseMT942File, isMT942Content } from "./mt940-parser";
import { parseCAMTFile } from "./camt-parser";
import { detectBankWithConfidence } from "./bank-detector";
import { getAllBankKeys, getBankConfig } from "./bank-configs";
import { getBanksByRegion } from "./bank-configs";
import { loadBankConfigJSON, suggestBankConfig, resetCustomBanks } from "./bank-registry";
import { generateBankConfigTemplate } from "./bank-config-schema";
import { exportTransactions, getSupportedExportFormats, type ExportFormat } from "./exporters";
import type { ParsedTransaction, BankConfig } from "./types";

const program = new Command();

program
  .name("statementkit")
  .description("Parse bank statements in any format — CSV, OFX, QIF, MT940, CAMT, PDF")
  .version("0.1.0");

// ============================================================================
// parse command
// ============================================================================

program
  .command("parse")
  .description("Parse a bank statement file and output transactions")
  .argument("<file>", "Path to bank statement file")
  .option("-b, --bank <key>", "Bank config key (e.g., td, bmo, chase_credit)")
  .option("-o, --output <format>", "Output format: json, csv, qif, ofx", "json")
  .option("-l, --locale <locale>", "Locale hint for date/amount parsing (e.g., de-DE)")
  .option("--out-file <path>", "Write output to file instead of stdout")
  .option("--compact", "Compact JSON output (no indentation)")
  .option("--delimiter <char>", "CSV delimiter for output", ",")
  .option("--metadata", "Include metadata fields in JSON output")
  .action(async (filePath: string, opts) => {
    try {
      const absPath = resolve(filePath);
      const content = await readFile(absPath, "utf-8");

      // Detect format
      const detection = detectFromContent(content);
      const format = resolveFormat(detection.format, extname(absPath));

      if (format === "unknown" || format === "pdf") {
        console.error(
          format === "pdf"
            ? "Error: PDF parsing requires a browser environment (Tesseract OCR). Use the SDK API instead."
            : `Error: Could not detect format for ${basename(absPath)}. Use --bank to specify.`
        );
        process.exit(1);
      }

      // Parse
      const transactions = await parseFile(content, format, opts.bank, opts.locale);

      if (transactions.length === 0) {
        console.error("Warning: No transactions found.");
      }

      // Export
      const outputFormat = opts.output as ExportFormat;
      if (!getSupportedExportFormats().includes(outputFormat)) {
        console.error(
          `Error: Unsupported output format "${outputFormat}". Supported: ${getSupportedExportFormats().join(", ")}`
        );
        process.exit(1);
      }

      const result = exportTransactions(transactions, outputFormat, {
        compact: opts.compact,
        includeMetadata: opts.metadata,
        delimiter: opts.delimiter,
      });

      if (opts.outFile) {
        await writeFile(resolve(opts.outFile), result, "utf-8");
        console.error(`Wrote ${transactions.length} transactions to ${opts.outFile}`);
      } else {
        process.stdout.write(`${result}\n`);
      }
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

// ============================================================================
// detect command
// ============================================================================

program
  .command("detect")
  .description("Detect the format of a bank statement file")
  .argument("<file>", "Path to bank statement file")
  .action(async (filePath: string) => {
    try {
      const absPath = resolve(filePath);
      const content = await readFile(absPath, "utf-8");
      const detection = detectFromContent(content);

      console.log(
        JSON.stringify(
          {
            file: basename(absPath),
            format: detection.format,
            confidence: detection.confidence,
            signature: detection.signature ?? null,
          },
          null,
          2
        )
      );

      // If CSV, also try bank detection
      if (detection.format === "csv") {
        const rows = content.split("\n").filter((l) => l.trim());
        if (rows.length > 0) {
          const headers = rows[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
          const bankResult = detectBankWithConfidence(headers);
          if (bankResult.bank) {
            console.log(
              JSON.stringify(
                {
                  detectedBank: bankResult.bank,
                  bankConfidence: bankResult.confidence,
                  alternatives: bankResult.alternatives?.slice(0, 3) ?? [],
                },
                null,
                2
              )
            );
          }
        }
      }
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

// ============================================================================
// banks command
// ============================================================================

program
  .command("banks")
  .description("List all supported bank configurations")
  .option("-r, --region <region>", "Filter by region: NA, EU, UK, AU, ASIA")
  .option("--json", "Output as JSON")
  .action((opts) => {
    let bankKeys: string[];

    if (opts.region) {
      const region = opts.region.toUpperCase() as "NA" | "EU" | "UK" | "AU" | "ASIA";
      const regionBanks = getBanksByRegion(region);
      bankKeys = Object.keys(regionBanks);
    } else {
      bankKeys = getAllBankKeys();
    }

    if (opts.json) {
      const banks = bankKeys.map((key) => {
        const config = getBankConfig(key);
        return {
          key,
          name: config?.name ?? key,
          region: config?.region ?? "unknown",
          encoding: config?.encoding ?? "UTF-8",
          verified: config?.verified ?? false,
        };
      });
      console.log(JSON.stringify(banks, null, 2));
    } else {
      console.log(`Supported banks (${bankKeys.length}):\n`);
      for (const key of bankKeys.sort()) {
        const config = getBankConfig(key);
        const region = config?.region ?? "??";
        const verified = config?.verified ? " ✓" : "";
        console.log(
          `  ${key.padEnd(30)} ${(config?.name ?? "").padEnd(35)} [${region}]${verified}`
        );
      }
    }
  });

// ============================================================================
// config command
// ============================================================================

const configCmd = program.command("config").description("Manage bank configurations");

configCmd
  .command("template")
  .description("Generate a bank config template JSON file")
  .option("-k, --key <key>", "Bank key name", "my_bank")
  .option("--out-file <path>", "Write template to file")
  .action(async (opts) => {
    const template = generateBankConfigTemplate(opts.key);
    if (opts.outFile) {
      await writeFile(resolve(opts.outFile), template, "utf-8");
      console.error(`Template written to ${opts.outFile}`);
    } else {
      process.stdout.write(`${template}\n`);
    }
  });

configCmd
  .command("validate")
  .description("Validate a bank config JSON file")
  .argument("<file>", "Path to bank config JSON file")
  .action(async (filePath: string) => {
    try {
      const content = await readFile(resolve(filePath), "utf-8");
      const result = loadBankConfigJSON(content);
      resetCustomBanks(); // Don't persist — just validate

      const validCount = result.registered.length;
      const errorCount = Object.keys(result.errors).length;

      if (validCount > 0) {
        console.log(`Valid banks (${validCount}): ${result.registered.join(", ")}`);
      }
      if (errorCount > 0) {
        console.error(`\nErrors (${errorCount}):`);
        for (const [key, errs] of Object.entries(result.errors)) {
          console.error(`  ${key}:`);
          for (const e of errs) {
            console.error(`    - ${e}`);
          }
        }
        process.exit(1);
      }
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

configCmd
  .command("suggest")
  .description("Auto-suggest a bank config from a sample CSV file")
  .argument("<file>", "Path to CSV file")
  .action(async (filePath: string) => {
    try {
      const content = await readFile(resolve(filePath), "utf-8");
      const lines = content.split("\n").filter((l) => l.trim());

      if (lines.length < 2) {
        console.error("Error: CSV must have at least a header and one data row.");
        process.exit(1);
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const sampleRows = lines
        .slice(1, 6)
        .map((l) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));

      const result = suggestBankConfig(headers, sampleRows);

      console.log(
        JSON.stringify(
          {
            confidence: `${Math.round(result.confidence * 100)}%`,
            suggestedConfig: result.config,
            suggestions: result.suggestions,
          },
          null,
          2
        )
      );
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

// ============================================================================
// export command
// ============================================================================

program
  .command("export")
  .description("Parse a file and re-export to a different format")
  .argument("<file>", "Path to bank statement file")
  .requiredOption("-f, --format <format>", "Target format: json, csv, qif, ofx")
  .option("-b, --bank <key>", "Bank config key")
  .option("-l, --locale <locale>", "Locale hint")
  .option("--out-file <path>", "Write output to file instead of stdout")
  .action(async (filePath: string, opts) => {
    try {
      const absPath = resolve(filePath);
      const content = await readFile(absPath, "utf-8");
      const detection = detectFromContent(content);
      const format = resolveFormat(detection.format, extname(absPath));

      if (format === "unknown" || format === "pdf") {
        console.error(`Error: Cannot parse format "${format}" in CLI mode.`);
        process.exit(1);
      }

      const transactions = await parseFile(content, format, opts.bank, opts.locale);
      const outputFormat = opts.format as ExportFormat;

      if (!getSupportedExportFormats().includes(outputFormat)) {
        console.error(`Error: Unsupported export format "${outputFormat}".`);
        process.exit(1);
      }

      const result = exportTransactions(transactions, outputFormat);

      if (opts.outFile) {
        await writeFile(resolve(opts.outFile), result, "utf-8");
        console.error(
          `Exported ${transactions.length} transactions to ${opts.outFile} (${outputFormat})`
        );
      } else {
        process.stdout.write(`${result}\n`);
      }
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

// ============================================================================
// Helpers
// ============================================================================

/**
 * Resolve file format from content detection + file extension fallback.
 */
function resolveFormat(detected: FileFormat, ext: string): FileFormat {
  if (detected !== "unknown") return detected;

  const extMap: Record<string, FileFormat> = {
    ".csv": "csv",
    ".ofx": "ofx",
    ".qfx": "qfx",
    ".qbo": "qbo",
    ".qif": "qif",
    ".mt940": "mt940",
    ".sta": "mt940",
    ".xml": "camt053",
    ".pdf": "pdf",
  };

  return extMap[ext.toLowerCase()] ?? "unknown";
}

/**
 * Parse file content using the appropriate parser.
 */
async function parseFile(
  content: string,
  format: FileFormat,
  bankKey?: string,
  locale?: string
): Promise<ParsedTransaction[]> {
  switch (format) {
    case "csv": {
      let bankConfig: BankConfig | undefined;
      if (bankKey) {
        const config = getBankConfig(bankKey);
        if (!config) {
          console.error(`Warning: Unknown bank "${bankKey}". Using auto-detection.`);
        } else {
          bankConfig = config;
        }
      }

      const skipRows = bankConfig?.skipRows ?? 0;
      const rows = parseCSVContent(content, skipRows);

      if (rows.length === 0) return [];

      // Auto-detect bank if not specified
      if (!bankConfig) {
        const headers = Object.keys(rows[0]);
        const detection = detectBankWithConfidence(headers);
        if (detection.bank) {
          bankConfig = getBankConfig(detection.bank) ?? undefined;
          console.error(
            `Auto-detected bank: ${detection.bank} (${(detection.confidence * 100).toFixed(0)}% confidence)`
          );
        }
      }

      if (!bankConfig) {
        console.error("Warning: Could not detect bank. Trying universal parser.");
        // Fallback: try to extract transactions from generic column names
        const { convertToTransactionsUniversal } = await import("./csv-parser");
        const result = await convertToTransactionsUniversal(rows, "cli");
        return result.transactions;
      }

      return convertToTransactions(rows, bankConfig, "cli");
    }

    case "ofx":
    case "qfx":
    case "qbo": {
      const result = await parseOFXFile(content, "cli");
      return result.transactions;
    }

    case "qif":
      return parseQIFFile(content, { locale });

    case "mt940": {
      if (isMT942Content(content)) {
        return parseMT942File(content);
      }
      return parseMT940File(content);
    }

    case "camt052":
    case "camt053":
    case "camt054":
      return parseCAMTFile(content);

    default:
      throw new Error(`Parser not available for format: ${format}`);
  }
}

// Run CLI
program.parse();
