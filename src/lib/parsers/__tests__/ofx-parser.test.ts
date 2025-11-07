/**
 * Unit Tests for OFX Parser Module
 * Tests OFX 1.x (SGML) and OFX 2.x (XML) parsing
 */

import { describe, it, expect } from '@jest/globals';
import {
  detectOFXVariant,
  parseOFXDate,
  parseOFXContent,
  mapOFXTransaction,
  extractTransactions,
  validateOFXFile,
  parseOFXFile,
} from '../ofx-parser';
import type { OFXTransaction } from '@/types/budget';

describe('OFX Parser Module', () => {
  // ========================================
  // detectOFXVariant() Tests
  // ========================================
  describe('detectOFXVariant()', () => {
    it('should detect OFX 2.x (XML) format', () => {
      const ofx2Content = `<?xml version="1.0" encoding="UTF-8"?>
        <OFX>
          <SIGNONMSGSRSV1>
            <SONRS>
              <STATUS>
                <CODE>0</CODE>
                <SEVERITY>INFO</SEVERITY>
              </STATUS>
            </SONRS>
          </SIGNONMSGSRSV1>
        </OFX>`;

      const variant = detectOFXVariant(ofx2Content);
      expect(variant).toBe('ofx2');
    });

    it('should detect OFX 1.x (SGML) format', () => {
      const ofx1Content = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
</SONRS>
</SIGNONMSGSRSV1>
</OFX>`;

      const variant = detectOFXVariant(ofx1Content);
      expect(variant).toBe('ofx1');
    });

    it('should detect QFX (Quicken) format', () => {
      const qfxContent = `QFXHEADER:100
<OFX>
<BANKMSGSRSV1>
</BANKMSGSRSV1>
</OFX>`;

      const variant = detectOFXVariant(qfxContent);
      expect(variant).toBe('qfx');
    });

    it('should return null for invalid content', () => {
      const invalidContent = 'This is not an OFX file';
      const variant = detectOFXVariant(invalidContent);
      expect(variant).toBeNull();
    });
  });

  // ========================================
  // parseOFXDate() Tests
  // ========================================
  describe('parseOFXDate()', () => {
    it('should parse full OFX datetime: YYYYMMDDHHmmss', () => {
      const date = parseOFXDate('20250106120000');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // January = 0
      expect(date.getDate()).toBe(6);
      expect(date.getHours()).toBe(12);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
    });

    it('should parse date-only format: YYYYMMDD', () => {
      const date = parseOFXDate('20250106');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(6);
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
    });

    it('should parse date with fractional seconds: YYYYMMDDHHmmss.XXX', () => {
      const date = parseOFXDate('20250106120000.123');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(6);
      expect(date.getHours()).toBe(12);
    });

    it('should parse date with timezone: YYYYMMDDHHmmss+HHMM', () => {
      const date = parseOFXDate('20250106120000+0500');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(6);
      expect(date.getHours()).toBe(12);
    });

    it('should throw error for empty date string', () => {
      expect(() => parseOFXDate('')).toThrow('OFX date string is empty');
    });

    it('should throw error for invalid date format', () => {
      expect(() => parseOFXDate('invalid-date')).toThrow(
        'Failed to parse OFX date'
      );
    });
  });

  // ========================================
  // mapOFXTransaction() Tests
  // ========================================
  describe('mapOFXTransaction()', () => {
    it('should map OFX transaction with NAME and MEMO', () => {
      const ofxTxn: OFXTransaction = {
        TRNTYPE: 'DEBIT',
        DTPOSTED: '20250106120000',
        TRNAMT: '-50.00',
        FITID: '123456789',
        NAME: 'STARBUCKS',
        MEMO: 'Coffee purchase',
        CHECKNUM: undefined,
      };

      const parsed = mapOFXTransaction(ofxTxn, 'account-123');

      expect(parsed.description).toBe('STARBUCKS - Coffee purchase');
      expect(parsed.amount).toBe(-50.0);
      expect(parsed.fitid).toBe('123456789');
      expect(parsed.transactionType).toBe('DEBIT');
      expect(parsed.date.getFullYear()).toBe(2025);
      expect(parsed.confidence).toBe(1.0);
      expect(parsed.isDuplicate).toBe(false);
    });

    it('should handle transaction with only NAME', () => {
      const ofxTxn: OFXTransaction = {
        TRNTYPE: 'CREDIT',
        DTPOSTED: '20250106',
        TRNAMT: '1000.00',
        FITID: 'ABC123',
        NAME: 'PAYROLL DEPOSIT',
      };

      const parsed = mapOFXTransaction(ofxTxn, 'account-123');
      expect(parsed.description).toBe('PAYROLL DEPOSIT');
      expect(parsed.amount).toBe(1000.0);
    });

    it('should handle transaction with only MEMO', () => {
      const ofxTxn: OFXTransaction = {
        TRNTYPE: 'ATM',
        DTPOSTED: '20250106',
        TRNAMT: '-100.00',
        FITID: 'XYZ789',
        MEMO: 'ATM Withdrawal',
      };

      const parsed = mapOFXTransaction(ofxTxn, 'account-123');
      expect(parsed.description).toBe('ATM Withdrawal');
      expect(parsed.amount).toBe(-100.0);
    });

    it('should handle transaction with neither NAME nor MEMO', () => {
      const ofxTxn: OFXTransaction = {
        TRNTYPE: 'CHECK',
        DTPOSTED: '20250106',
        TRNAMT: '-250.00',
        FITID: 'CHK001',
        CHECKNUM: '1234',
      };

      const parsed = mapOFXTransaction(ofxTxn, 'account-123');
      expect(parsed.description).toBe('CHECK Transaction');
      expect(parsed.checkNum).toBe('1234');
    });

    it('should not duplicate identical NAME and MEMO', () => {
      const ofxTxn: OFXTransaction = {
        TRNTYPE: 'POS',
        DTPOSTED: '20250106',
        TRNAMT: '-30.00',
        FITID: 'POS123',
        NAME: 'AMAZON.COM',
        MEMO: 'AMAZON.COM',
      };

      const parsed = mapOFXTransaction(ofxTxn, 'account-123');
      expect(parsed.description).toBe('AMAZON.COM');
    });
  });

  // ========================================
  // validateOFXFile() Tests
  // ========================================
  describe('validateOFXFile()', () => {
    it('should validate correct OFX 2.x file', () => {
      const validOFX = `<?xml version="1.0" encoding="UTF-8"?>
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20250106</DTPOSTED>
            <TRNAMT>-50.00</TRNAMT>
            <FITID>12345</FITID>
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

      const result = validateOFXFile(validOFX);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty file', () => {
      const result = validateOFXFile('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File is empty');
    });

    it('should reject file without OFX tag', () => {
      const invalidOFX = `<?xml version="1.0"?>
<NOTOFX>
  <DATA>Invalid</DATA>
</NOTOFX>`;

      const result = validateOFXFile(invalidOFX);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing <OFX> root tag');
    });

    it('should reject file without transactions', () => {
      const noTransactions = `<?xml version="1.0"?>
<OFX>
  <SIGNONMSGSRSV1>
    <SONRS>
      <STATUS>
        <CODE>0</CODE>
      </STATUS>
    </SONRS>
  </SIGNONMSGSRSV1>
</OFX>`;

      const result = validateOFXFile(noTransactions);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No transactions found in file');
    });

    it('should reject file with unknown format', () => {
      const unknownFormat = `This is not OFX
<OFX>
<STMTTRN>
</STMTTRN>
</OFX>`;

      const result = validateOFXFile(unknownFormat);
      // Should fail format detection since it doesn't have proper headers
      expect(result.isValid).toBe(false);
    });
  });

  // ========================================
  // Integration Tests
  // ========================================
  describe('Integration: parseOFXContent() and extractTransactions()', () => {
    it('should parse complete OFX 2.x bank statement', () => {
      const ofx2Sample = `<?xml version="1.0" encoding="UTF-8"?>
<OFX>
  <SIGNONMSGSRSV1>
    <SONRS>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <DTSERVER>20250106120000</DTSERVER>
      <LANGUAGE>ENG</LANGUAGE>
    </SONRS>
  </SIGNONMSGSRSV1>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <TRNUID>1</TRNUID>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <STMTRS>
        <CURDEF>CAD</CURDEF>
        <BANKACCTFROM>
          <BANKID>12345</BANKID>
          <ACCTID>9876543210</ACCTID>
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <DTSTART>20250101</DTSTART>
          <DTEND>20250106</DTEND>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20250102120000</DTPOSTED>
            <TRNAMT>-50.00</TRNAMT>
            <FITID>TXN001</FITID>
            <NAME>STARBUCKS</NAME>
            <MEMO>Coffee purchase</MEMO>
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>CREDIT</TRNTYPE>
            <DTPOSTED>20250103090000</DTPOSTED>
            <TRNAMT>1000.00</TRNAMT>
            <FITID>TXN002</FITID>
            <NAME>PAYROLL DEPOSIT</NAME>
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>CHECK</TRNTYPE>
            <DTPOSTED>20250104</DTPOSTED>
            <TRNAMT>-250.00</TRNAMT>
            <FITID>TXN003</FITID>
            <CHECKNUM>1234</CHECKNUM>
            <MEMO>Rent payment</MEMO>
          </STMTTRN>
        </BANKTRANLIST>
        <LEDGERBAL>
          <BALAMT>5700.00</BALAMT>
          <DTASOF>20250106120000</DTASOF>
        </LEDGERBAL>
        <AVAILBAL>
          <BALAMT>5700.00</BALAMT>
          <DTASOF>20250106120000</DTASOF>
        </AVAILBAL>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

      const ofxData = parseOFXContent(ofx2Sample);

      // Test OFXData structure
      expect(ofxData.version).toBe('2.x');
      expect(ofxData.currency).toBe('CAD');
      expect(ofxData.accountInfo.ACCTID).toBe('9876543210');
      expect(ofxData.accountInfo.ACCTTYPE).toBe('CHECKING');
      expect(ofxData.accountInfo.BANKID).toBe('12345');

      // Test balances
      expect(ofxData.balances.ledgerBalance).toBe(5700.0);
      expect(ofxData.balances.availableBalance).toBe(5700.0);

      // Test date range
      expect(ofxData.dateStart).toBeDefined();
      expect(ofxData.dateEnd).toBeDefined();
      if (ofxData.dateStart) {
        expect(ofxData.dateStart.getFullYear()).toBe(2025);
        expect(ofxData.dateStart.getMonth()).toBe(0);
        expect(ofxData.dateStart.getDate()).toBe(1);
      }

      // Test transactions
      expect(ofxData.transactions).toHaveLength(3);

      const txn1 = ofxData.transactions[0];
      expect(txn1.TRNTYPE).toBe('DEBIT');
      expect(txn1.TRNAMT).toBe('-50.00');
      expect(txn1.FITID).toBe('TXN001');
      expect(txn1.NAME).toBe('STARBUCKS');
      expect(txn1.MEMO).toBe('Coffee purchase');

      const txn2 = ofxData.transactions[1];
      expect(txn2.TRNTYPE).toBe('CREDIT');
      expect(txn2.TRNAMT).toBe('1000.00');
      expect(txn2.FITID).toBe('TXN002');

      const txn3 = ofxData.transactions[2];
      expect(txn3.TRNTYPE).toBe('CHECK');
      expect(txn3.CHECKNUM).toBe('1234');
      expect(txn3.FITID).toBe('TXN003');

      // Test extractTransactions()
      const parsedTransactions = extractTransactions(ofxData, 'account-123');
      expect(parsedTransactions).toHaveLength(3);

      expect(parsedTransactions[0].amount).toBe(-50.0);
      expect(parsedTransactions[0].description).toBe(
        'STARBUCKS - Coffee purchase'
      );
      expect(parsedTransactions[0].fitid).toBe('TXN001');

      expect(parsedTransactions[1].amount).toBe(1000.0);
      expect(parsedTransactions[1].description).toBe('PAYROLL DEPOSIT');

      expect(parsedTransactions[2].amount).toBe(-250.0);
      expect(parsedTransactions[2].checkNum).toBe('1234');
    });

    it('should parse credit card OFX statement', () => {
      const ccOFX = `<?xml version="1.0"?>
<OFX>
  <CREDITCARDMSGSRSV1>
    <CCSTMTTRNRS>
      <TRNUID>1</TRNUID>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <CCSTMTRS>
        <CURDEF>USD</CURDEF>
        <CCACCTFROM>
          <ACCTID>1234567890123456</ACCTID>
        </CCACCTFROM>
        <BANKTRANLIST>
          <DTSTART>20250101</DTSTART>
          <DTEND>20250106</DTEND>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20250102</DTPOSTED>
            <TRNAMT>-150.00</TRNAMT>
            <FITID>CC001</FITID>
            <NAME>AMAZON.COM</NAME>
          </STMTTRN>
        </BANKTRANLIST>
        <LEDGERBAL>
          <BALAMT>-850.00</BALAMT>
          <DTASOF>20250106</DTASOF>
        </LEDGERBAL>
      </CCSTMTRS>
    </CCSTMTTRNRS>
  </CREDITCARDMSGSRSV1>
</OFX>`;

      const ofxData = parseOFXContent(ccOFX);

      expect(ofxData.currency).toBe('USD');
      expect(ofxData.accountInfo.ACCTID).toBe('1234567890123456');
      expect(ofxData.accountInfo.ACCTTYPE).toBe('CREDITCARD');
      expect(ofxData.balances.ledgerBalance).toBe(-850.0);
      expect(ofxData.transactions).toHaveLength(1);
    });
  });

  // ========================================
  // parseOFXFile() Integration Test
  // ========================================
  describe('Integration: parseOFXFile()', () => {
    it('should return complete structured data', async () => {
      const ofxSample = `<?xml version="1.0"?>
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <CURDEF>CAD</CURDEF>
        <BANKACCTFROM>
          <BANKID>12345</BANKID>
          <ACCTID>9876543210</ACCTID>
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <DTSTART>20250101</DTSTART>
          <DTEND>20250106</DTEND>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20250102</DTPOSTED>
            <TRNAMT>-50.00</TRNAMT>
            <FITID>TXN001</FITID>
            <NAME>TEST MERCHANT</NAME>
          </STMTTRN>
        </BANKTRANLIST>
        <LEDGERBAL>
          <BALAMT>5700.00</BALAMT>
          <DTASOF>20250106</DTASOF>
        </LEDGERBAL>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

      const result = await parseOFXFile(ofxSample, 'test-account-123');

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].amount).toBe(-50.0);

      expect(result.accountInfo.ACCTID).toBe('9876543210');
      expect(result.accountInfo.ACCTTYPE).toBe('CHECKING');

      expect(result.balances.ledgerBalance).toBe(5700.0);

      expect(result.metadata.version).toBe('2.x');
      expect(result.metadata.currency).toBe('CAD');
      expect(result.metadata.dateRange).toBeDefined();
      expect(result.metadata.dateRange?.start.getFullYear()).toBe(2025);
      expect(result.metadata.dateRange?.end.getFullYear()).toBe(2025);
    });
  });
});
