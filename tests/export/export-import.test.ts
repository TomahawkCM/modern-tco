/**
 * Export/Import Tests
 * Tests for .budget file parsing, encryption, validation, and type guards
 */

import { describe, it, expect } from 'vitest';
import {
  isEncryptedData,
  BUDGET_FILE_VERSION,
  APP_VERSION,
  DEFAULT_SETTINGS,
  DEFAULT_PREFERENCES,
} from '@/lib/export/types';
import {
  encryptData,
  decryptData,
  parseBudgetFile,
} from '@/lib/export/import-budget';
import type {
  BudgetFile,
  BudgetExportData,
  EncryptedDataPayload,
} from '@/lib/export/types';

// ============================================================================
// Type Guards & Constants
// ============================================================================

describe('Export Types', () => {
  describe('isEncryptedData', () => {
    it('should identify encrypted payload', () => {
      const encrypted: EncryptedDataPayload = {
        encrypted: true,
        algorithm: 'AES-256-GCM',
        iv: 'base64iv',
        salt: 'base64salt',
        ciphertext: 'base64data',
        authTag: 'base64tag',
      };
      expect(isEncryptedData(encrypted)).toBe(true);
    });

    it('should identify unencrypted data', () => {
      const plainData: BudgetExportData = {
        accounts: [],
        transactions: [],
        categories: [],
        budgets: [],
        goals: [],
        loans: [],
        loanPayments: [],
        subscriptions: [],
        excludedSubscriptions: [],
        investments: [],
        portfolios: [],
        investmentHoldings: [],
        investmentTransactions: [],
        investmentAccounts: [],
        holdings: [],
        retirementPlans: [],
        importMappings: [],
        importHistory: [],
        receipts: [],
        settings: DEFAULT_SETTINGS,
        preferences: DEFAULT_PREFERENCES,
        profiles: [],
        activityLog: [],
      };
      expect(isEncryptedData(plainData)).toBe(false);
    });
  });

  describe('Constants', () => {
    it('should have valid version format', () => {
      expect(BUDGET_FILE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have valid app version', () => {
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have default settings', () => {
      expect(DEFAULT_SETTINGS).toBeDefined();
      expect(DEFAULT_SETTINGS).toHaveProperty('currency');
      expect(DEFAULT_SETTINGS).toHaveProperty('locale');
    });

    it('should have default preferences', () => {
      expect(DEFAULT_PREFERENCES).toBeDefined();
    });
  });
});

// ============================================================================
// File Encryption/Decryption Round-Trip
// ============================================================================

describe('Budget File Encryption', () => {
  const sampleData: BudgetExportData = {
    accounts: [{ id: 'acc1', name: 'Checking', type: 'checking', balance: 5000, currency: 'USD', createdAt: new Date().toISOString() } as any],
    transactions: [{ id: 'tx1', accountId: 'acc1', amount: -25, description: 'Coffee', date: '2025-01-15' } as any],
    categories: [],
    budgets: [],
    goals: [],
    loans: [],
    loanPayments: [],
    subscriptions: [],
    excludedSubscriptions: [],
    investments: [],
    portfolios: [],
    investmentHoldings: [],
    investmentTransactions: [],
    investmentAccounts: [],
    holdings: [],
    retirementPlans: [],
    importMappings: [],
    importHistory: [],
    receipts: [],
    settings: DEFAULT_SETTINGS,
    preferences: DEFAULT_PREFERENCES,
    profiles: [],
    activityLog: [],
  };

  it('should encrypt and decrypt data round-trip', async () => {
    const password = 'test-password-123!';

    const encrypted = await encryptData(sampleData, password);

    expect(encrypted.encrypted).toBe(true);
    expect(encrypted.algorithm).toBe('AES-256-GCM');
    expect(encrypted.iv).toBeTruthy();
    expect(encrypted.salt).toBeTruthy();
    expect(encrypted.ciphertext).toBeTruthy();
    expect(encrypted.authTag).toBeTruthy();

    const decrypted = await decryptData(encrypted, password);

    expect(decrypted.accounts.length).toBe(1);
    expect((decrypted.accounts[0] as any).name).toBe('Checking');
    expect(decrypted.transactions.length).toBe(1);
    expect((decrypted.transactions[0] as any).description).toBe('Coffee');
  });

  it('should fail to decrypt with wrong password', async () => {
    const encrypted = await encryptData(sampleData, 'correct-password');
    await expect(decryptData(encrypted, 'wrong-password')).rejects.toThrow();
  });

  it('should produce different ciphertext for same data (random salt/IV)', async () => {
    const enc1 = await encryptData(sampleData, 'password');
    const enc2 = await encryptData(sampleData, 'password');

    expect(enc1.salt).not.toBe(enc2.salt);
    expect(enc1.iv).not.toBe(enc2.iv);
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
  });
});

// ============================================================================
// File Parsing
// ============================================================================

describe('parseBudgetFile', () => {
  it('should parse valid budget file JSON', () => {
    const fileContent: BudgetFile = {
      metadata: {
        version: '1.0.0',
        appVersion: '2.0.0',
        exportedAt: new Date().toISOString(),
        deviceName: 'Test Device',
        checksum: 'sha256:abc123',
      },
      data: {
        accounts: [],
        transactions: [],
        categories: [],
        budgets: [],
        goals: [],
        loans: [],
        loanPayments: [],
        subscriptions: [],
        excludedSubscriptions: [],
        investments: [],
        portfolios: [],
        investmentHoldings: [],
        investmentTransactions: [],
        investmentAccounts: [],
        holdings: [],
        retirementPlans: [],
        importMappings: [],
        importHistory: [],
        receipts: [],
        settings: DEFAULT_SETTINGS,
        preferences: DEFAULT_PREFERENCES,
        profiles: [],
        activityLog: [],
      },
    };

    const result = parseBudgetFile(JSON.stringify(fileContent));
    expect(result.metadata.version).toBe('1.0.0');
    expect(result.data).toBeDefined();
  });

  it('should throw for invalid JSON', () => {
    expect(() => parseBudgetFile('not json {')).toThrow('Invalid JSON format');
  });

  it('should throw for missing metadata', () => {
    expect(() => parseBudgetFile('{"data": {}}')).toThrow('missing metadata');
  });

  it('should throw for missing data', () => {
    expect(() => parseBudgetFile('{"metadata": {"version": "1.0.0"}}')).toThrow('missing metadata or data');
  });

  it('should handle empty string', () => {
    expect(() => parseBudgetFile('')).toThrow();
  });

  it('should parse file with encrypted data', () => {
    const fileContent: BudgetFile = {
      metadata: {
        version: '1.0.0',
        appVersion: '2.0.0',
        exportedAt: new Date().toISOString(),
        checksum: 'sha256:abc123',
        encrypted: true,
      },
      data: {
        encrypted: true,
        algorithm: 'AES-256-GCM',
        iv: 'base64iv',
        salt: 'base64salt',
        ciphertext: 'base64data',
        authTag: 'base64tag',
      } as any,
    };

    const result = parseBudgetFile(JSON.stringify(fileContent));
    expect(result.metadata.encrypted).toBe(true);
    expect(isEncryptedData(result.data)).toBe(true);
  });
});
