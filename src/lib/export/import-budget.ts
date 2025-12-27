/**
 * Budget Import Module
 * Parse .budget file, verify checksum, decrypt, and import data.
 * See docs/BUDGET_FILE_FORMAT.md for specification.
 */

import { db } from '@/lib/budget-db';
import {
  type BudgetFile,
  type BudgetFileMetadata,
  type BudgetExportData,
  type EncryptedDataPayload,
  type ImportOptions,
  type ImportResult,
  type ValidationResult,
  isEncryptedData,
  BUDGET_FILE_VERSION,
} from './types';

// PBKDF2 configuration
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16; // bytes
const KEY_LENGTH = 256; // bits
const IV_LENGTH = 12; // bytes

/**
 * Calculate SHA-256 checksum of data
 */
async function calculateChecksum(data: object): Promise<string> {
  const dataString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataString);

  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `sha256:${hashHex}`;
}

/**
 * Derive encryption key from password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES-GCM key - cast salt to BufferSource for TypeScript compatibility
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data with password
 */
export async function encryptData(
  data: BudgetExportData,
  password: string
): Promise<EncryptedDataPayload> {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive key from password
  const key = await deriveKey(password, salt);

  // Encode data as JSON
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));

  // Encrypt with AES-GCM
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );

  // Extract ciphertext and auth tag (GCM appends 16-byte tag)
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const ciphertext = encryptedArray.slice(0, -16);
  const authTag = encryptedArray.slice(-16);

  return {
    encrypted: true,
    algorithm: 'AES-256-GCM',
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
    ciphertext: btoa(String.fromCharCode(...ciphertext)),
    authTag: btoa(String.fromCharCode(...authTag)),
  };
}

/**
 * Decrypt data with password
 */
export async function decryptData(
  encryptedPayload: EncryptedDataPayload,
  password: string
): Promise<BudgetExportData> {
  // Decode base64 values
  const iv = Uint8Array.from(atob(encryptedPayload.iv), c => c.charCodeAt(0));
  const salt = Uint8Array.from(atob(encryptedPayload.salt), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(encryptedPayload.ciphertext), c => c.charCodeAt(0));
  const authTag = Uint8Array.from(atob(encryptedPayload.authTag), c => c.charCodeAt(0));

  // Derive key from password
  const key = await deriveKey(password, salt);

  // Combine ciphertext and auth tag for decryption
  const encryptedData = new Uint8Array(ciphertext.length + authTag.length);
  encryptedData.set(ciphertext);
  encryptedData.set(authTag, ciphertext.length);

  try {
    // Decrypt with AES-GCM
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    // Decode JSON
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);
    return JSON.parse(jsonString) as BudgetExportData;
  } catch (error) {
    throw new Error('Decryption failed. Please check your password.');
  }
}

/**
 * Parse .budget file from JSON string or file
 */
export function parseBudgetFile(content: string): BudgetFile {
  try {
    const file = JSON.parse(content) as BudgetFile;

    if (!file.metadata || !file.data) {
      throw new Error('Invalid file format: missing metadata or data');
    }

    return file;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
}

/**
 * Validate budget file structure and integrity
 */
export async function validateBudgetFile(
  file: BudgetFile,
  password?: string
): Promise<ValidationResult> {
  const errors: ValidationResult['errors'] = [];
  const warnings: string[] = [];

  // Check metadata
  if (!file.metadata.version) {
    errors.push({ path: 'metadata.version', message: 'Missing version', severity: 'error' });
  }

  if (!file.metadata.exportedAt) {
    errors.push({ path: 'metadata.exportedAt', message: 'Missing export date', severity: 'error' });
  }

  if (!file.metadata.checksum) {
    errors.push({ path: 'metadata.checksum', message: 'Missing checksum', severity: 'error' });
  }

  // Check version compatibility
  const [major] = file.metadata.version.split('.');
  const [currentMajor] = BUDGET_FILE_VERSION.split('.');
  if (major !== currentMajor) {
    errors.push({
      path: 'metadata.version',
      message: `Incompatible version: ${file.metadata.version} (expected ${BUDGET_FILE_VERSION})`,
      severity: 'error',
    });
  }

  // If encrypted, verify we have a password
  if (isEncryptedData(file.data)) {
    if (!password) {
      errors.push({
        path: 'data',
        message: 'File is encrypted but no password provided',
        severity: 'error',
      });
    } else {
      // Try to decrypt to validate password
      try {
        await decryptData(file.data, password);
      } catch {
        errors.push({
          path: 'data',
          message: 'Decryption failed - incorrect password',
          severity: 'error',
        });
      }
    }
  } else {
    // Verify checksum for unencrypted data
    const calculatedChecksum = await calculateChecksum(file.data);
    if (calculatedChecksum !== file.metadata.checksum) {
      errors.push({
        path: 'metadata.checksum',
        message: 'Checksum mismatch - file may be corrupted',
        severity: 'error',
      });
    }
  }

  // Validate data structure
  if (!isEncryptedData(file.data)) {
    const data = file.data;

    // Check required arrays exist
    const requiredArrays: (keyof BudgetExportData)[] = [
      'accounts',
      'transactions',
      'categories',
      'budgets',
      'goals',
    ];

    for (const arrayName of requiredArrays) {
      if (!Array.isArray(data[arrayName])) {
        errors.push({
          path: `data.${arrayName}`,
          message: `Missing or invalid ${arrayName} array`,
          severity: 'error',
        });
      }
    }

    // Check for orphaned references
    if (Array.isArray(data.transactions) && Array.isArray(data.accounts)) {
      const accountIds = new Set(data.accounts.map(a => a.id));
      const orphanedTxns = data.transactions.filter(t => !accountIds.has(t.accountId));
      if (orphanedTxns.length > 0) {
        warnings.push(`${orphanedTxns.length} transactions reference missing accounts`);
      }
    }
  }

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings,
    metadata: file.metadata,
  };
}

/**
 * Convert ISO date strings back to Date objects
 */
function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  try {
    return new Date(dateString);
  } catch {
    return null;
  }
}

/**
 * Import budget data into the database
 */
export async function importBudgetData(
  file: BudgetFile,
  options: ImportOptions
): Promise<ImportResult> {
  const { conflictResolution = 'skip', password } = options;

  // Validate first
  const validation = await validateBudgetFile(file, password);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.errors.map(e => e.message).join('; '),
      stats: createEmptyStats(),
      errors: validation.errors.map(e => ({
        table: e.path.split('.')[1] || 'unknown',
        id: '',
        message: e.message,
      })),
    };
  }

  // Decrypt if needed
  let data: BudgetExportData;
  if (isEncryptedData(file.data)) {
    if (!password) {
      return {
        success: false,
        message: 'Password required for encrypted file',
        stats: createEmptyStats(),
        errors: [{ table: 'data', id: '', message: 'Password required' }],
      };
    }
    data = await decryptData(file.data, password);
  } else {
    data = file.data;
  }

  const stats = createEmptyStats();
  const errors: ImportResult['errors'] = [];

  // Determine which tables to import
  const tablesToImport = options.includeTables || [
    'accounts',
    'transactions',
    'categories',
    'budgets',
    'goals',
    'loans',
    'subscriptions',
    'investments',
    'receipts',
  ];

  try {
    // Import in order (accounts first, then transactions, etc.)
    if (tablesToImport.includes('accounts')) {
      await importAccounts(data.accounts, conflictResolution, stats, errors);
    }

    if (tablesToImport.includes('categories')) {
      await importCategories(data.categories, conflictResolution, stats, errors);
    }

    if (tablesToImport.includes('transactions')) {
      await importTransactions(data.transactions, conflictResolution, stats, errors);
    }

    if (tablesToImport.includes('budgets')) {
      await importBudgets(data.budgets, conflictResolution, stats, errors);
    }

    if (tablesToImport.includes('goals')) {
      await importGoals(data.goals, conflictResolution, stats, errors);
    }

    if (tablesToImport.includes('loans') && data.loans) {
      await importLoans(data.loans, conflictResolution, stats, errors);
    }

    if (tablesToImport.includes('subscriptions') && data.subscriptions) {
      await importSubscriptions(data.subscriptions, conflictResolution, stats, errors);
    }

    // Save settings and preferences to localStorage
    if (data.settings) {
      localStorage.setItem('budget-settings', JSON.stringify(data.settings));
    }
    if (data.preferences) {
      localStorage.setItem('budget-preferences', JSON.stringify(data.preferences));
    }

    const totalImported = Object.values(stats).reduce((sum, s) => sum + s.imported, 0);
    const totalErrors = Object.values(stats).reduce((sum, s) => sum + s.errors, 0);

    return {
      success: totalErrors === 0,
      message: totalErrors === 0
        ? `Successfully imported ${totalImported} records`
        : `Imported ${totalImported} records with ${totalErrors} errors`,
      stats,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Import failed',
      stats,
      errors: [...errors, { table: 'unknown', id: '', message: String(error) }],
    };
  }
}

function createEmptyStats(): ImportResult['stats'] {
  return {
    accounts: { imported: 0, skipped: 0, errors: 0 },
    transactions: { imported: 0, skipped: 0, errors: 0 },
    categories: { imported: 0, skipped: 0, errors: 0 },
    budgets: { imported: 0, skipped: 0, errors: 0 },
    goals: { imported: 0, skipped: 0, errors: 0 },
    loans: { imported: 0, skipped: 0, errors: 0 },
    subscriptions: { imported: 0, skipped: 0, errors: 0 },
    investments: { imported: 0, skipped: 0, errors: 0 },
    receipts: { imported: 0, skipped: 0, errors: 0 },
  };
}

type ConflictResolution = 'skip' | 'overwrite' | 'rename';
type Stats = ImportResult['stats'][keyof ImportResult['stats']];

async function importAccounts(
  accounts: BudgetExportData['accounts'],
  resolution: ConflictResolution,
  stats: ImportResult['stats'],
  errors: ImportResult['errors']
) {
  for (const account of accounts) {
    try {
      const existing = await db.accounts.get(account.id);

      if (existing) {
        if (resolution === 'skip') {
          stats.accounts.skipped++;
          continue;
        } else if (resolution === 'rename') {
          account.id = `${account.id}-imported-${Date.now()}`;
        }
        // overwrite: continue with put
      }

      await db.accounts.put({
        ...account,
        createdAt: parseDate(account.createdAt) || new Date(),
        updatedAt: parseDate(account.updatedAt) || new Date(),
      });
      stats.accounts.imported++;
    } catch (error) {
      stats.accounts.errors++;
      errors.push({ table: 'accounts', id: account.id, message: String(error) });
    }
  }
}

async function importCategories(
  categories: BudgetExportData['categories'],
  resolution: ConflictResolution,
  stats: ImportResult['stats'],
  errors: ImportResult['errors']
) {
  for (const category of categories) {
    try {
      const existing = await db.categories.get(category.id);

      if (existing) {
        if (resolution === 'skip') {
          stats.categories.skipped++;
          continue;
        } else if (resolution === 'rename') {
          category.id = `${category.id}-imported-${Date.now()}`;
        }
      }

      await db.categories.put({
        ...category,
        archivedAt: category.archivedAt ? parseDate(category.archivedAt) || undefined : undefined,
        createdAt: parseDate(category.createdAt) || new Date(),
      });
      stats.categories.imported++;
    } catch (error) {
      stats.categories.errors++;
      errors.push({ table: 'categories', id: category.id, message: String(error) });
    }
  }
}

async function importTransactions(
  transactions: BudgetExportData['transactions'],
  resolution: ConflictResolution,
  stats: ImportResult['stats'],
  errors: ImportResult['errors']
) {
  for (const tx of transactions) {
    try {
      const existing = await db.transactions.get(tx.id);

      if (existing) {
        if (resolution === 'skip') {
          stats.transactions.skipped++;
          continue;
        } else if (resolution === 'rename') {
          tx.id = `${tx.id}-imported-${Date.now()}`;
        }
      }

      await db.transactions.put({
        ...tx,
        date: parseDate(tx.date) || new Date(),
        createdAt: parseDate(tx.createdAt) || new Date(),
        updatedAt: parseDate(tx.updatedAt) || new Date(),
      });
      stats.transactions.imported++;
    } catch (error) {
      stats.transactions.errors++;
      errors.push({ table: 'transactions', id: tx.id, message: String(error) });
    }
  }
}

async function importBudgets(
  budgets: BudgetExportData['budgets'],
  resolution: ConflictResolution,
  stats: ImportResult['stats'],
  errors: ImportResult['errors']
) {
  for (const budget of budgets) {
    try {
      const existing = await db.budgets.get(budget.id);

      if (existing) {
        if (resolution === 'skip') {
          stats.budgets.skipped++;
          continue;
        } else if (resolution === 'rename') {
          budget.id = `${budget.id}-imported-${Date.now()}`;
        }
      }

      await db.budgets.put({
        ...budget,
        startDate: parseDate(budget.startDate) || new Date(),
        endDate: budget.endDate ? parseDate(budget.endDate) : null,
        createdAt: parseDate(budget.createdAt) || new Date(),
        updatedAt: parseDate(budget.updatedAt) || new Date(),
      });
      stats.budgets.imported++;
    } catch (error) {
      stats.budgets.errors++;
      errors.push({ table: 'budgets', id: budget.id, message: String(error) });
    }
  }
}

async function importGoals(
  goals: BudgetExportData['goals'],
  resolution: ConflictResolution,
  stats: ImportResult['stats'],
  errors: ImportResult['errors']
) {
  for (const goal of goals) {
    try {
      const existing = await db.futurePurchases.get(goal.id);

      if (existing) {
        if (resolution === 'skip') {
          stats.goals.skipped++;
          continue;
        } else if (resolution === 'rename') {
          goal.id = `${goal.id}-imported-${Date.now()}`;
        }
      }

      await db.futurePurchases.put({
        ...goal,
        targetDate: parseDate(goal.targetDate) || new Date(),
        createdAt: parseDate(goal.createdAt) || new Date(),
        updatedAt: parseDate(goal.updatedAt) || new Date(),
      });
      stats.goals.imported++;
    } catch (error) {
      stats.goals.errors++;
      errors.push({ table: 'goals', id: goal.id, message: String(error) });
    }
  }
}

async function importLoans(
  loans: BudgetExportData['loans'],
  resolution: ConflictResolution,
  stats: ImportResult['stats'],
  errors: ImportResult['errors']
) {
  for (const loan of loans) {
    try {
      const existing = await db.loans.get(loan.id);

      if (existing) {
        if (resolution === 'skip') {
          stats.loans.skipped++;
          continue;
        } else if (resolution === 'rename') {
          loan.id = `${loan.id}-imported-${Date.now()}`;
        }
      }

      await db.loans.put({
        ...loan,
        startDate: parseDate(loan.startDate) || new Date(),
        nextPaymentDate: parseDate(loan.nextPaymentDate) || new Date(),
        defermentEndDate: loan.defermentEndDate ? parseDate(loan.defermentEndDate) || undefined : undefined,
        createdAt: parseDate(loan.createdAt) || new Date(),
        updatedAt: parseDate(loan.updatedAt) || new Date(),
      });
      stats.loans.imported++;
    } catch (error) {
      stats.loans.errors++;
      errors.push({ table: 'loans', id: loan.id, message: String(error) });
    }
  }
}

async function importSubscriptions(
  subscriptions: BudgetExportData['subscriptions'],
  resolution: ConflictResolution,
  stats: ImportResult['stats'],
  errors: ImportResult['errors']
) {
  for (const sub of subscriptions) {
    try {
      const existing = await db.subscriptions.get(sub.id);

      if (existing) {
        if (resolution === 'skip') {
          stats.subscriptions.skipped++;
          continue;
        } else if (resolution === 'rename') {
          sub.id = `${sub.id}-imported-${Date.now()}`;
        }
      }

      await db.subscriptions.put({
        ...sub,
        startDate: parseDate(sub.startDate) || new Date(),
        nextBillingDate: parseDate(sub.nextBillingDate) || new Date(),
        trialEndDate: sub.trialEndDate ? parseDate(sub.trialEndDate) || undefined : undefined,
        cancelledDate: sub.cancelledDate ? parseDate(sub.cancelledDate) || undefined : undefined,
        createdAt: parseDate(sub.createdAt) || new Date(),
        updatedAt: parseDate(sub.updatedAt) || new Date(),
      });
      stats.subscriptions.imported++;
    } catch (error) {
      stats.subscriptions.errors++;
      errors.push({ table: 'subscriptions', id: sub.id, message: String(error) });
    }
  }
}

/**
 * Preview import without actually importing
 */
export async function previewImport(
  file: BudgetFile,
  password?: string
): Promise<{
  valid: boolean;
  metadata: BudgetFileMetadata;
  counts: Record<string, number>;
  conflicts: Record<string, number>;
  errors: string[];
}> {
  const validation = await validateBudgetFile(file, password);

  if (!validation.valid) {
    return {
      valid: false,
      metadata: file.metadata,
      counts: {},
      conflicts: {},
      errors: validation.errors.map(e => e.message),
    };
  }

  // Decrypt if needed
  let data: BudgetExportData;
  if (isEncryptedData(file.data)) {
    if (!password) {
      return {
        valid: false,
        metadata: file.metadata,
        counts: {},
        conflicts: {},
        errors: ['Password required for encrypted file'],
      };
    }
    data = await decryptData(file.data, password);
  } else {
    data = file.data;
  }

  // Count records and check for conflicts
  const counts: Record<string, number> = {
    accounts: data.accounts.length,
    transactions: data.transactions.length,
    categories: data.categories.length,
    budgets: data.budgets.length,
    goals: data.goals.length,
    loans: data.loans.length,
    subscriptions: data.subscriptions.length,
  };

  const conflicts: Record<string, number> = {};

  // Check for existing IDs
  for (const account of data.accounts) {
    if (await db.accounts.get(account.id)) {
      conflicts.accounts = (conflicts.accounts || 0) + 1;
    }
  }

  for (const tx of data.transactions) {
    if (await db.transactions.get(tx.id)) {
      conflicts.transactions = (conflicts.transactions || 0) + 1;
    }
  }

  for (const cat of data.categories) {
    if (await db.categories.get(cat.id)) {
      conflicts.categories = (conflicts.categories || 0) + 1;
    }
  }

  return {
    valid: true,
    metadata: file.metadata,
    counts,
    conflicts,
    errors: [],
  };
}

/**
 * Read file from input element
 */
export async function readBudgetFile(file: File): Promise<BudgetFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const content = reader.result as string;
        const budgetFile = parseBudgetFile(content);
        resolve(budgetFile);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
