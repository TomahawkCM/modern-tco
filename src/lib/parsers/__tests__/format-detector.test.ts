/**
 * Unit Tests for Format Detector Module
 * Tests content-based format detection for CSV, OFX, QFX, QBO
 */

import { describe, it, expect } from "@jest/globals";
import {
  detectFromContent,
  validateFormat,
  getFormatDisplayName,
  isFormatSupported,
  getSupportedFormats,
  type FileFormat,
} from "../format-detector";

describe("Format Detector Module", () => {
  // ========================================
  // detectFromContent() - OFX Tests
  // ========================================
  describe("detectFromContent() - OFX Format", () => {
    it("should detect OFX 2.x (XML) format", () => {
      const ofx2Content = `<?xml version="1.0" encoding="UTF-8"?>
<OFX>
  <SIGNONMSGSRSV1>
    <SONRS>
      <STATUS>
        <CODE>0</CODE>
      </STATUS>
    </SONRS>
  </SIGNONMSGSRSV1>
</OFX>`;

      const result = detectFromContent(ofx2Content);
      expect(result.format).toBe("ofx");
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.signature).toBe("XML-OFX");
    });

    it("should detect OFX 1.x (SGML) format with OFXHEADER", () => {
      const ofx1Content = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
<OFX>
<BANKMSGSRSV1>
</BANKMSGSRSV1>
</OFX>`;

      const result = detectFromContent(ofx1Content);
      expect(result.format).toBe("ofx");
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.signature).toBe("SGML-OFX");
    });

    it("should detect OFX with <OFXHEADER> tag", () => {
      const ofxContent = `<OFXHEADER>
<OFX>
<STMTTRNRS>
</STMTTRNRS>
</OFX>`;

      const result = detectFromContent(ofxContent);
      expect(result.format).toBe("ofx");
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("should handle case-insensitive OFX detection", () => {
      const ofxContentLower = `ofxheader:100
<ofx>
</ofx>`;

      const result = detectFromContent(ofxContentLower);
      expect(result.format).toBe("ofx");
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("should not detect non-OFX XML", () => {
      const genericXML = `<?xml version="1.0"?>
<ROOT>
  <DATA>Some data</DATA>
</ROOT>`;

      const result = detectFromContent(genericXML);
      expect(result.format).toBe("unknown");
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  // ========================================
  // detectFromContent() - QFX Tests
  // ========================================
  describe("detectFromContent() - QFX Format", () => {
    it("should detect QFX format with QFXHEADER", () => {
      const qfxContent = `QFXHEADER:100
<OFX>
<BANKMSGSRSV1>
</BANKMSGSRSV1>
</OFX>`;

      const result = detectFromContent(qfxContent);
      expect(result.format).toBe("qfx");
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.signature).toBe("QFX");
    });

    it("should detect QFX with <QFXHEADER> tag", () => {
      const qfxContent = `<QFXHEADER>
<OFX>
</OFX>`;

      const result = detectFromContent(qfxContent);
      expect(result.format).toBe("qfx");
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });

  // ========================================
  // detectFromContent() - QBO Tests
  // ========================================
  describe("detectFromContent() - QBO Format", () => {
    it("should detect QBO format with !Type:", () => {
      const qboContent = `!Type:Bank
D01/01/2025
T-50.00
PAMAZON.COM
^`;

      const result = detectFromContent(qboContent);
      expect(result.format).toBe("qbo");
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      expect(result.signature).toBe("QBO");
    });

    it("should handle case-insensitive QBO detection", () => {
      const qboContent = `!type:Bank
D01/01/2025`;

      const result = detectFromContent(qboContent);
      expect(result.format).toBe("qbo");
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  // ========================================
  // detectFromContent() - CSV Tests
  // ========================================
  describe("detectFromContent() - CSV Format", () => {
    it("should detect CSV with clear header and data rows", () => {
      const csvContent = `Date,Description,Amount
01/01/2025,STARBUCKS,-4.50
01/02/2025,PAYROLL,1000.00
01/03/2025,AMAZON,-25.00`;

      const result = detectFromContent(csvContent);
      expect(result.format).toBe("csv");
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.signature).toBe("CSV");
    });

    it("should detect CSV with BMO format (complex headers)", () => {
      const bmoCSV = `Account Number: 123456789
Date Range: 01/01/2025 - 01/31/2025

Date Posted,Description,Transaction Amount,Transaction Type
20250102,STARBUCKS,-4.50,POS
20250103,PAYROLL,1000.00,DEPOSIT`;

      const result = detectFromContent(bmoCSV);
      expect(result.format).toBe("csv");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should not detect single-line text as CSV", () => {
      const singleLine = "This is just a text file";

      const result = detectFromContent(singleLine);
      expect(result.format).toBe("unknown");
      expect(result.confidence).toBe(0);
    });

    it("should not detect text without commas as CSV", () => {
      const noCommas = `Date Description Amount
01/01/2025 STARBUCKS -4.50
01/02/2025 PAYROLL 1000.00`;

      const result = detectFromContent(noCommas);
      expect(result.format).toBe("unknown");
      expect(result.confidence).toBe(0);
    });

    it("should handle CSV with quoted fields", () => {
      const csvQuoted = `Date,"Description","Amount"
"01/01/2025","Coffee, tea","4.50"
"01/02/2025","Grocery store","85.00"`;

      const result = detectFromContent(csvQuoted);
      expect(result.format).toBe("csv");
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  // ========================================
  // validateFormat() Tests
  // ========================================
  describe("validateFormat()", () => {
    it("should validate correct OFX content", () => {
      const validOFX = `<?xml version="1.0"?>
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

      const result = validateFormat(validOFX, "ofx");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject OFX without <OFX> tag", () => {
      const invalidOFX = `<?xml version="1.0"?>
<ROOT>
  <DATA>Not OFX</DATA>
</ROOT>`;

      const result = validateFormat(invalidOFX, "ofx");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing <OFX> root element");
    });

    it("should reject OFX without transactions", () => {
      const noTransactions = `<OFX>
<SIGNONMSGSRSV1>
</SIGNONMSGSRSV1>
</OFX>`;

      const result = validateFormat(noTransactions, "ofx");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("No transaction data found");
    });

    it("should validate correct CSV content", () => {
      const validCSV = `Date,Description,Amount
01/01/2025,STARBUCKS,-4.50
01/02/2025,PAYROLL,1000.00`;

      const result = validateFormat(validCSV, "csv");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject CSV with only header row", () => {
      const headerOnly = `Date,Description,Amount`;

      const result = validateFormat(headerOnly, "csv");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("CSV file must have at least 2 rows (header + data)");
    });

    it("should validate correct QBO content", () => {
      const validQBO = `!Type:Bank
D01/01/2025
T-50.00`;

      const result = validateFormat(validQBO, "qbo");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject QBO without !Type declaration", () => {
      const invalidQBO = `D01/01/2025
T-50.00`;

      const result = validateFormat(invalidQBO, "qbo");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing !Type: declaration");
    });

    it("should reject unknown format", () => {
      const content = "Some random content";
      const result = validateFormat(content, "unknown");
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // Helper Functions Tests
  // ========================================
  describe("Helper Functions", () => {
    it("getFormatDisplayName() should return correct names", () => {
      expect(getFormatDisplayName("csv")).toBe("CSV (Comma-Separated Values)");
      expect(getFormatDisplayName("ofx")).toBe("OFX (Open Financial Exchange)");
      expect(getFormatDisplayName("qfx")).toBe("QFX (Quicken)");
      expect(getFormatDisplayName("qbo")).toBe("QBO (QuickBooks)");
      expect(getFormatDisplayName("unknown")).toBe("Unknown Format");
    });

    it("getSupportedFormats() should return correct list", () => {
      const supported = getSupportedFormats();
      expect(supported).toContain("csv");
      expect(supported).toContain("ofx");
      expect(supported).toContain("qfx");
      // QBO might not be fully supported yet
    });

    it("isFormatSupported() should correctly identify supported formats", () => {
      expect(isFormatSupported("csv")).toBe(true);
      expect(isFormatSupported("ofx")).toBe(true);
      expect(isFormatSupported("qfx")).toBe(true);
      expect(isFormatSupported("unknown")).toBe(false);
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe("Edge Cases", () => {
    it("should handle empty content", () => {
      const result = detectFromContent("");
      expect(result.format).toBe("unknown");
      expect(result.confidence).toBe(0);
    });

    it("should handle whitespace-only content", () => {
      const result = detectFromContent("   \n\n\t  ");
      expect(result.format).toBe("unknown");
      expect(result.confidence).toBe(0);
    });

    it("should handle content with only commas", () => {
      const result = detectFromContent(",,,\n,,,\n,,,");
      // Might detect as CSV with low confidence
      expect(result.confidence).toBeLessThan(0.7);
    });

    it("should handle mixed format indicators (OFX header + CSV data)", () => {
      // This is an edge case - file might be corrupted
      const mixedContent = `OFXHEADER:100
Date,Description,Amount
01/01/2025,Test,-50.00`;

      const result = detectFromContent(mixedContent);
      // Should prioritize OFX header (appears first)
      expect(result.format).toBe("ofx");
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });
});
