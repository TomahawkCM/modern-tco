/**
 * CAMT.053 (ISO 20022) Parser Tests
 * Tests for parsing XML bank-to-customer account statements
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseCAMT053File, isCAMT053Content } from '@/lib/parsers/camt053-parser';

describe('CAMT.053 Parser', () => {
  describe('isCAMT053Content', () => {
    it('should detect valid CAMT.053 content by namespace', () => {
      const xml = '<?xml version="1.0"?><Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">';
      expect(isCAMT053Content(xml)).toBe(true);
    });

    it('should detect valid CAMT.053 content by structure', () => {
      const xml = '<Document><BkToCstmrStmt><Stmt></Stmt></BkToCstmrStmt></Document>';
      expect(isCAMT053Content(xml)).toBe(true);
    });

    it('should reject non-CAMT content', () => {
      expect(isCAMT053Content('Date,Amount,Description')).toBe(false);
      expect(isCAMT053Content('!Type:Bank')).toBe(false);
      expect(isCAMT053Content(':20:MT940')).toBe(false);
    });
  });

  describe('parseCAMT053File', () => {
    it('should parse the ISO 20022 sample fixture', () => {
      const content = readFileSync(
        resolve(__dirname, '../fixtures/camt053/iso20022-sample.xml'),
        'utf-8'
      );

      const transactions = parseCAMT053File(content);

      expect(transactions.length).toBe(5);

      // Transaction 1: REWE (debit)
      expect(transactions[0].amount).toBe(-125.50);
      expect(transactions[0].description).toContain('REWE');
      expect(transactions[0].sourceFormat).toBe('camt053');
      expect(transactions[0].transactionType).toBe('DEBIT');
      expect(transactions[0].currency).toBe('EUR');

      // Transaction 2: Siemens (credit/salary)
      expect(transactions[1].amount).toBe(2800.00);
      expect(transactions[1].description).toContain('Siemens');
      expect(transactions[1].transactionType).toBe('CREDIT');

      // Transaction 3: Netflix (debit)
      expect(transactions[2].amount).toBe(-49.99);
      expect(transactions[2].description).toContain('Netflix');

      // Transaction 4: Stadtwerke (debit/rent)
      expect(transactions[3].amount).toBe(-750.00);

      // Transaction 5: Deutsche Telekom (debit)
      expect(transactions[4].amount).toBe(-35.00);
    });

    it('should parse inline CAMT.053 XML', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Id>STMT-001</Id>
      <Acct><Id><IBAN>DE89370400440532013000</IBAN></Id><Ccy>EUR</Ccy></Acct>
      <Ntry>
        <Amt Ccy="EUR">50.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2025-01-15</Dt></BookgDt>
        <NtryDtls><TxDtls>
          <RltdPties><Cdtr><Nm>Test Merchant</Nm></Cdtr></RltdPties>
          <RmtInf><Ustrd>Test purchase</Ustrd></RmtInf>
        </TxDtls></NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

      const transactions = parseCAMT053File(xml);
      expect(transactions.length).toBe(1);
      expect(transactions[0].amount).toBe(-50.00);
      expect(transactions[0].description).toContain('Test Merchant');
      expect(transactions[0].description).toContain('Test purchase');
      expect(transactions[0].currency).toBe('EUR');
    });

    it('should handle credit vs debit correctly', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt><Stmt><Id>S1</Id>
    <Ntry>
      <Amt Ccy="USD">100.00</Amt>
      <CdtDbtInd>CRDT</CdtDbtInd>
      <BookgDt><Dt>2025-01-15</Dt></BookgDt>
      <NtryDtls><TxDtls>
        <RmtInf><Ustrd>Salary deposit</Ustrd></RmtInf>
      </TxDtls></NtryDtls>
    </Ntry>
    <Ntry>
      <Amt Ccy="USD">25.00</Amt>
      <CdtDbtInd>DBIT</CdtDbtInd>
      <BookgDt><Dt>2025-01-16</Dt></BookgDt>
      <NtryDtls><TxDtls>
        <RmtInf><Ustrd>Coffee shop</Ustrd></RmtInf>
      </TxDtls></NtryDtls>
    </Ntry>
  </Stmt></BkToCstmrStmt>
</Document>`;

      const transactions = parseCAMT053File(xml);
      expect(transactions.length).toBe(2);
      expect(transactions[0].amount).toBe(100.00); // Credit = positive
      expect(transactions[1].amount).toBe(-25.00); // Debit = negative
    });

    it('should extract end-to-end ID for duplicate detection', () => {
      const xml = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt><Stmt><Id>S1</Id>
    <Ntry>
      <Amt Ccy="EUR">50.00</Amt>
      <CdtDbtInd>DBIT</CdtDbtInd>
      <BookgDt><Dt>2025-01-15</Dt></BookgDt>
      <NtryDtls><TxDtls>
        <Refs><EndToEndId>E2E-UNIQUE-123</EndToEndId></Refs>
        <RmtInf><Ustrd>Test</Ustrd></RmtInf>
      </TxDtls></NtryDtls>
    </Ntry>
  </Stmt></BkToCstmrStmt>
</Document>`;

      const transactions = parseCAMT053File(xml);
      expect(transactions[0].fitid).toBe('E2E-UNIQUE-123');
    });

    it('should handle entries without NtryDtls', () => {
      const xml = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt><Stmt><Id>S1</Id>
    <Ntry>
      <Amt Ccy="EUR">75.00</Amt>
      <CdtDbtInd>DBIT</CdtDbtInd>
      <BookgDt><Dt>2025-01-15</Dt></BookgDt>
      <AddtlNtryInf>ATM Withdrawal</AddtlNtryInf>
    </Ntry>
  </Stmt></BkToCstmrStmt>
</Document>`;

      const transactions = parseCAMT053File(xml);
      expect(transactions.length).toBe(1);
      expect(transactions[0].amount).toBe(-75.00);
      expect(transactions[0].description).toContain('ATM Withdrawal');
    });

    it('should return empty array for invalid XML', () => {
      const transactions = parseCAMT053File('<invalid>not camt</invalid>');
      expect(transactions).toEqual([]);
    });

    it('should return empty array for missing Document root', () => {
      const transactions = parseCAMT053File('<root><child/></root>');
      expect(transactions).toEqual([]);
    });

    it('should set high confidence when date and amount are present', () => {
      const content = readFileSync(
        resolve(__dirname, '../fixtures/camt053/iso20022-sample.xml'),
        'utf-8'
      );

      const transactions = parseCAMT053File(content);
      expect(transactions[0].confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should extract currency from account or entry', () => {
      const content = readFileSync(
        resolve(__dirname, '../fixtures/camt053/iso20022-sample.xml'),
        'utf-8'
      );

      const transactions = parseCAMT053File(content);
      transactions.forEach(tx => {
        expect(tx.currency).toBe('EUR');
      });
    });

    it('should build description from creditor name + remittance info', () => {
      const content = readFileSync(
        resolve(__dirname, '../fixtures/camt053/iso20022-sample.xml'),
        'utf-8'
      );

      const transactions = parseCAMT053File(content);
      // First transaction: REWE + Einkauf
      expect(transactions[0].description).toContain('REWE');
      expect(transactions[0].description).toContain('Einkauf');
    });
  });
});
