import { describe, it, expect } from "vitest";
import { parseCAMT053File, isCAMT053Content } from "../camt053-parser";

const SAMPLE_CAMT053 = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Id>STMT001</Id>
      <Acct>
        <Id><IBAN>DE89370400440532013000</IBAN></Id>
        <Ccy>EUR</Ccy>
      </Acct>
      <Ntry>
        <Amt Ccy="EUR">45.99</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2025-01-15</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RltdPties>
              <Cdtr><Nm>Grocery Store</Nm></Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Weekly groceries</Ustrd>
            </RmtInf>
            <Refs>
              <EndToEndId>E2E001</EndToEndId>
            </Refs>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">2500.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2025-01-20</Dt></BookgDt>
        <AddtlNtryInf>Monthly salary</AddtlNtryInf>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

describe("camt053-parser", () => {
  describe("parseCAMT053File", () => {
    it("parses multiple entries", () => {
      const result = parseCAMT053File(SAMPLE_CAMT053);
      expect(result).toHaveLength(2);
    });

    it("parses debit transaction correctly", () => {
      const result = parseCAMT053File(SAMPLE_CAMT053);
      const debit = result[0];
      expect(debit.amount).toBe(-45.99);
      expect(debit.transactionType).toBe("DEBIT");
    });

    it("parses credit transaction correctly", () => {
      const result = parseCAMT053File(SAMPLE_CAMT053);
      const credit = result[1];
      expect(credit.amount).toBe(2500);
      expect(credit.transactionType).toBe("CREDIT");
    });

    it("parses booking date", () => {
      const result = parseCAMT053File(SAMPLE_CAMT053);
      // Date string "2025-01-15" parsed as UTC — check UTC components
      expect(result[0].date.getUTCFullYear()).toBe(2025);
      expect(result[0].date.getUTCMonth()).toBe(0);
      expect(result[0].date.getUTCDate()).toBe(15);
    });

    it("extracts creditor name in description", () => {
      const result = parseCAMT053File(SAMPLE_CAMT053);
      expect(result[0].description).toContain("Grocery Store");
    });

    it("extracts remittance info in description", () => {
      const result = parseCAMT053File(SAMPLE_CAMT053);
      expect(result[0].description).toContain("Weekly groceries");
    });

    it("extracts end-to-end ID as fitid", () => {
      const result = parseCAMT053File(SAMPLE_CAMT053);
      expect(result[0].fitid).toBe("E2E001");
    });

    it("sets currency from account", () => {
      const result = parseCAMT053File(SAMPLE_CAMT053);
      expect(result[0].currency).toBe("EUR");
    });

    it("sets sourceFormat to camt053", () => {
      const result = parseCAMT053File(SAMPLE_CAMT053);
      expect(result[0].sourceFormat).toBe("camt053");
    });

    it("uses AddtlNtryInf for entry without TxDtls", () => {
      const result = parseCAMT053File(SAMPLE_CAMT053);
      expect(result[1].description).toBe("Monthly salary");
    });

    it("sets high confidence for detailed transactions", () => {
      const result = parseCAMT053File(SAMPLE_CAMT053);
      expect(result[0].confidence).toBe(0.95);
    });

    it("returns empty array for invalid XML", () => {
      const result = parseCAMT053File("<invalid>xml</invalid>");
      expect(result).toHaveLength(0);
    });
  });

  describe("isCAMT053Content", () => {
    it("detects CAMT.053 by namespace", () => {
      expect(isCAMT053Content(SAMPLE_CAMT053)).toBe(true);
    });

    it("detects CAMT.053 by structure", () => {
      expect(isCAMT053Content("<Document><BkToCstmrStmt></BkToCstmrStmt></Document>")).toBe(true);
    });

    it("rejects non-CAMT content", () => {
      expect(isCAMT053Content("<root><data/></root>")).toBe(false);
    });
  });
});
