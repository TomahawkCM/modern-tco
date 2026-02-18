/**
 * Budget Import Module
 * Parse .budget file, verify checksum, decrypt, and import data.
 * See docs/BUDGET_FILE_FORMAT.md for specification.
 */

import { db } from "@/lib/budget-db";
import {
  type BudgetFile,
  type BudgetFileMetadata,
  type BudgetExportData,
  type EncryptedDataPayload,
  type ImportOptions,
  type ImportResult,
  type ImportProgress,
  type ValidationResult,
  isEncryptedData,
  BUDGET_FILE_VERSION,
} from "./types";

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

  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return `sha256:${hashHex}`;
}

/**
 * Derive encryption key from password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey("raw", passwordBuffer, "PBKDF2", false, [
    "deriveBits",
    "deriveKey",
  ]);

  // Derive AES-GCM key — Uint8Array.from() creates a new Uint8Array<ArrayBuffer>
  // which satisfies both TypeScript's BufferSource type and Node.js Web Crypto API
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: Uint8Array.from(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
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
  const encryptedBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, dataBuffer);

  // Extract ciphertext and auth tag (GCM appends 16-byte tag)
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const ciphertext = encryptedArray.slice(0, -16);
  const authTag = encryptedArray.slice(-16);

  return {
    encrypted: true,
    algorithm: "AES-256-GCM",
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
  const iv = Uint8Array.from(atob(encryptedPayload.iv), (c) => c.charCodeAt(0));
  const salt = Uint8Array.from(atob(encryptedPayload.salt), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(encryptedPayload.ciphertext), (c) => c.charCodeAt(0));
  const authTag = Uint8Array.from(atob(encryptedPayload.authTag), (c) => c.charCodeAt(0));

  // Derive key from password
  const key = await deriveKey(password, salt);

  // Combine ciphertext and auth tag for decryption
  const encryptedData = new Uint8Array(ciphertext.length + authTag.length);
  encryptedData.set(ciphertext);
  encryptedData.set(authTag, ciphertext.length);

  try {
    // Decrypt with AES-GCM
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedData
    );

    // Decode JSON
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);
    return JSON.parse(jsonString) as BudgetExportData;
  } catch (error) {
    throw new Error("Decryption failed. Please check your password.");
  }
}

/**
 * Parse .budget file from JSON string or file
 */
export function parseBudgetFile(content: string): BudgetFile {
  try {
    const file = JSON.parse(content) as BudgetFile;

    if (!file.metadata || !file.data) {
      throw new Error("Invalid file format: missing metadata or data");
    }

    return file;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON format");
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
  const errors: ValidationResult["errors"] = [];
  const warnings: string[] = [];

  // Check metadata
  if (!file.metadata.version) {
    errors.push({ path: "metadata.version", message: "Missing version", severity: "error" });
  }

  if (!file.metadata.exportedAt) {
    errors.push({ path: "metadata.exportedAt", message: "Missing export date", severity: "error" });
  }

  if (!file.metadata.checksum) {
    errors.push({ path: "metadata.checksum", message: "Missing checksum", severity: "error" });
  }

  // Check version compatibility
  const [major] = file.metadata.version.split(".");
  const [currentMajor] = BUDGET_FILE_VERSION.split(".");
  if (major !== currentMajor) {
    errors.push({
      path: "metadata.version",
      message: `Incompatible version: ${file.metadata.version} (expected ${BUDGET_FILE_VERSION})`,
      severity: "error",
    });
  }

  // If encrypted, verify we have a password
  if (isEncryptedData(file.data)) {
    if (!password) {
      errors.push({
        path: "data",
        message: "File is encrypted but no password provided",
        severity: "error",
      });
    } else {
      // Try to decrypt to validate password
      try {
        await decryptData(file.data, password);
      } catch {
        errors.push({
          path: "data",
          message: "Decryption failed - incorrect password",
          severity: "error",
        });
      }
    }
  } else {
    // Verify checksum for unencrypted data
    const calculatedChecksum = await calculateChecksum(file.data);
    if (calculatedChecksum !== file.metadata.checksum) {
      errors.push({
        path: "metadata.checksum",
        message: "Checksum mismatch - file may be corrupted",
        severity: "error",
      });
    }
  }

  // Validate data structure
  if (!isEncryptedData(file.data)) {
    const { data } = file;

    // Check required arrays exist
    const requiredArrays: (keyof BudgetExportData)[] = [
      "accounts",
      "transactions",
      "categories",
      "budgets",
      "goals",
    ];

    for (const arrayName of requiredArrays) {
      if (!Array.isArray(data[arrayName])) {
        errors.push({
          path: `data.${arrayName}`,
          message: `Missing or invalid ${arrayName} array`,
          severity: "error",
        });
      }
    }

    // Check for orphaned references
    if (Array.isArray(data.transactions) && Array.isArray(data.accounts)) {
      const accountIds = new Set(data.accounts.map((a) => a.id));
      const orphanedTxns = data.transactions.filter((t) => !accountIds.has(t.accountId));
      if (orphanedTxns.length > 0) {
        warnings.push(`${orphanedTxns.length} transactions reference missing accounts`);
      }
    }
  }

  return {
    valid: errors.filter((e) => e.severity === "error").length === 0,
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
 * Helper to emit progress updates
 */
function emitProgress(
  onProgress: ((progress: ImportProgress) => void) | undefined,
  progress: ImportProgress
) {
  if (onProgress) {
    onProgress(progress);
  }
}

/**
 * Import budget data into the database
 */
export async function importBudgetData(
  file: BudgetFile,
  options: ImportOptions
): Promise<ImportResult> {
  const { conflictResolution = "skip", password, onProgress } = options;

  // Emit validating progress
  emitProgress(onProgress, {
    stage: "validating",
    currentTable: "",
    tableIndex: 0,
    totalTables: 0,
    itemsProcessed: 0,
    totalItems: 0,
    message: "Validating file...",
  });

  // Validate first
  const validation = await validateBudgetFile(file, password);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.errors.map((e) => e.message).join("; "),
      stats: createEmptyStats(),
      errors: validation.errors.map((e) => ({
        table: e.path.split(".")[1] || "unknown",
        id: "",
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
        message: "Password required for encrypted file",
        stats: createEmptyStats(),
        errors: [{ table: "data", id: "", message: "Password required" }],
      };
    }

    emitProgress(onProgress, {
      stage: "decrypting",
      currentTable: "",
      tableIndex: 0,
      totalTables: 0,
      itemsProcessed: 0,
      totalItems: 0,
      message: "Decrypting data...",
    });

    data = await decryptData(file.data, password);
  } else {
    data = file.data;
  }

  const stats = createEmptyStats();
  const errors: ImportResult["errors"] = [];

  // Determine which tables to import
  const tablesToImport = options.includeTables || [
    "accounts",
    "transactions",
    "categories",
    "budgets",
    "goals",
    "loans",
    "subscriptions",
    "investments",
    "receipts",
    "profiles",
    "activityLog",
  ];

  // Build list of tables with their data for progress tracking
  type TableConfig = {
    name: string;
    displayName: string;
    data: unknown[];
    importFn: () => Promise<void>;
  };

  // Profile ID mapping for updating references
  const profileIdMap = new Map<string, string>();

  const tableConfigs: TableConfig[] = [];

  // Configure tables in import order
  if (tablesToImport.includes("profiles") && data.profiles?.length) {
    tableConfigs.push({
      name: "profiles",
      displayName: "profiles",
      data: data.profiles,
      importFn: async () => {
        await importProfilesWithProgress(
          data.profiles,
          conflictResolution,
          stats,
          errors,
          profileIdMap,
          onProgress,
          tableConfigs.findIndex((t) => t.name === "profiles"),
          tableConfigs.length
        );
      },
    });
  }

  if (tablesToImport.includes("accounts") && data.accounts?.length) {
    tableConfigs.push({
      name: "accounts",
      displayName: "accounts",
      data: data.accounts,
      importFn: async () => {
        await importAccountsWithProgress(
          data.accounts,
          conflictResolution,
          stats,
          errors,
          onProgress,
          tableConfigs.findIndex((t) => t.name === "accounts"),
          tableConfigs.length
        );
      },
    });
  }

  if (tablesToImport.includes("categories") && data.categories?.length) {
    tableConfigs.push({
      name: "categories",
      displayName: "categories",
      data: data.categories,
      importFn: async () => {
        await importCategoriesWithProgress(
          data.categories,
          conflictResolution,
          stats,
          errors,
          onProgress,
          tableConfigs.findIndex((t) => t.name === "categories"),
          tableConfigs.length
        );
      },
    });
  }

  if (tablesToImport.includes("transactions") && data.transactions?.length) {
    tableConfigs.push({
      name: "transactions",
      displayName: "transactions",
      data: data.transactions,
      importFn: async () => {
        await importTransactionsWithProgress(
          data.transactions,
          conflictResolution,
          stats,
          errors,
          onProgress,
          tableConfigs.findIndex((t) => t.name === "transactions"),
          tableConfigs.length
        );
      },
    });
  }

  if (tablesToImport.includes("budgets") && data.budgets?.length) {
    tableConfigs.push({
      name: "budgets",
      displayName: "budgets",
      data: data.budgets,
      importFn: async () => {
        await importBudgetsWithProgress(
          data.budgets,
          conflictResolution,
          stats,
          errors,
          profileIdMap,
          onProgress,
          tableConfigs.findIndex((t) => t.name === "budgets"),
          tableConfigs.length
        );
      },
    });
  }

  if (tablesToImport.includes("goals") && data.goals?.length) {
    tableConfigs.push({
      name: "goals",
      displayName: "goals",
      data: data.goals,
      importFn: async () => {
        await importGoalsWithProgress(
          data.goals,
          conflictResolution,
          stats,
          errors,
          onProgress,
          tableConfigs.findIndex((t) => t.name === "goals"),
          tableConfigs.length
        );
      },
    });
  }

  if (tablesToImport.includes("loans") && data.loans?.length) {
    tableConfigs.push({
      name: "loans",
      displayName: "loans",
      data: data.loans,
      importFn: async () => {
        await importLoansWithProgress(
          data.loans,
          conflictResolution,
          stats,
          errors,
          onProgress,
          tableConfigs.findIndex((t) => t.name === "loans"),
          tableConfigs.length
        );
      },
    });
  }

  if (tablesToImport.includes("subscriptions") && data.subscriptions?.length) {
    tableConfigs.push({
      name: "subscriptions",
      displayName: "subscriptions",
      data: data.subscriptions,
      importFn: async () => {
        await importSubscriptionsWithProgress(
          data.subscriptions,
          conflictResolution,
          stats,
          errors,
          onProgress,
          tableConfigs.findIndex((t) => t.name === "subscriptions"),
          tableConfigs.length
        );
      },
    });
  }

  if (tablesToImport.includes("activityLog") && data.activityLog?.length) {
    tableConfigs.push({
      name: "activityLog",
      displayName: "activity log",
      data: data.activityLog,
      importFn: async () => {
        await importActivityLogWithProgress(
          data.activityLog,
          conflictResolution,
          stats,
          errors,
          profileIdMap,
          onProgress,
          tableConfigs.findIndex((t) => t.name === "activityLog"),
          tableConfigs.length
        );
      },
    });
  }

  try {
    // Import each table in order
    for (const config of tableConfigs) {
      await config.importFn();
    }

    // Save settings and preferences to localStorage
    if (data.settings) {
      localStorage.setItem("budget-settings", JSON.stringify(data.settings));
    }
    if (data.preferences) {
      localStorage.setItem("budget-preferences", JSON.stringify(data.preferences));
    }

    const totalImported = Object.values(stats).reduce((sum, s) => sum + s.imported, 0);
    const totalErrors = Object.values(stats).reduce((sum, s) => sum + s.errors, 0);

    // Emit complete progress
    emitProgress(onProgress, {
      stage: "complete",
      currentTable: "",
      tableIndex: tableConfigs.length,
      totalTables: tableConfigs.length,
      itemsProcessed: totalImported,
      totalItems: totalImported,
      message: "Import complete",
    });

    return {
      success: totalErrors === 0,
      message:
        totalErrors === 0
          ? `Successfully imported ${totalImported} records`
          : `Imported ${totalImported} records with ${totalErrors} errors`,
      stats,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Import failed",
      stats,
      errors: [...errors, { table: "unknown", id: "", message: String(error) }],
    };
  }
}

function createEmptyStats(): ImportResult["stats"] {
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
    profiles: { imported: 0, skipped: 0, errors: 0 },
    activityLog: { imported: 0, skipped: 0, errors: 0 },
  };
}

type ConflictResolution = "skip" | "overwrite" | "rename";
type Stats = ImportResult["stats"][keyof ImportResult["stats"]];

async function importAccounts(
  accounts: BudgetExportData["accounts"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"]
) {
  for (const account of accounts) {
    try {
      const existing = await db.accounts.get(account.id);

      if (existing) {
        if (resolution === "skip") {
          stats.accounts.skipped++;
          continue;
        } else if (resolution === "rename") {
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
      errors.push({ table: "accounts", id: account.id, message: String(error) });
    }
  }
}

async function importCategories(
  categories: BudgetExportData["categories"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"]
) {
  for (const category of categories) {
    try {
      const existing = await db.categories.get(category.id);

      if (existing) {
        if (resolution === "skip") {
          stats.categories.skipped++;
          continue;
        } else if (resolution === "rename") {
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
      errors.push({ table: "categories", id: category.id, message: String(error) });
    }
  }
}

async function importTransactions(
  transactions: BudgetExportData["transactions"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"]
) {
  for (const tx of transactions) {
    try {
      const existing = await db.transactions.get(tx.id);

      if (existing) {
        if (resolution === "skip") {
          stats.transactions.skipped++;
          continue;
        } else if (resolution === "rename") {
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
      errors.push({ table: "transactions", id: tx.id, message: String(error) });
    }
  }
}

async function importBudgets(
  budgets: BudgetExportData["budgets"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"],
  profileIdMap: Map<string, string>
) {
  for (const budget of budgets) {
    try {
      const existing = await db.budgets.get(budget.id);

      if (existing) {
        if (resolution === "skip") {
          stats.budgets.skipped++;
          continue;
        } else if (resolution === "rename") {
          budget.id = `${budget.id}-imported-${Date.now()}`;
        }
      }

      // Map ownerId to new profile ID if it was renamed during import
      let mappedOwnerId = budget.ownerId;
      if (mappedOwnerId && profileIdMap.has(mappedOwnerId)) {
        mappedOwnerId = profileIdMap.get(mappedOwnerId);
      }

      await db.budgets.put({
        ...budget,
        ownerId: mappedOwnerId,
        startDate: parseDate(budget.startDate) || new Date(),
        endDate: budget.endDate ? parseDate(budget.endDate) : null,
        createdAt: parseDate(budget.createdAt) || new Date(),
        updatedAt: parseDate(budget.updatedAt) || new Date(),
      });
      stats.budgets.imported++;
    } catch (error) {
      stats.budgets.errors++;
      errors.push({ table: "budgets", id: budget.id, message: String(error) });
    }
  }
}

async function importGoals(
  goals: BudgetExportData["goals"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"]
) {
  for (const goal of goals) {
    try {
      const existing = await db.futurePurchases.get(goal.id);

      if (existing) {
        if (resolution === "skip") {
          stats.goals.skipped++;
          continue;
        } else if (resolution === "rename") {
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
      errors.push({ table: "goals", id: goal.id, message: String(error) });
    }
  }
}

async function importLoans(
  loans: BudgetExportData["loans"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"]
) {
  for (const loan of loans) {
    try {
      const existing = await db.loans.get(loan.id);

      if (existing) {
        if (resolution === "skip") {
          stats.loans.skipped++;
          continue;
        } else if (resolution === "rename") {
          loan.id = `${loan.id}-imported-${Date.now()}`;
        }
      }

      await db.loans.put({
        ...loan,
        startDate: parseDate(loan.startDate) || new Date(),
        nextPaymentDate: parseDate(loan.nextPaymentDate) || new Date(),
        defermentEndDate: loan.defermentEndDate
          ? parseDate(loan.defermentEndDate) || undefined
          : undefined,
        createdAt: parseDate(loan.createdAt) || new Date(),
        updatedAt: parseDate(loan.updatedAt) || new Date(),
      });
      stats.loans.imported++;
    } catch (error) {
      stats.loans.errors++;
      errors.push({ table: "loans", id: loan.id, message: String(error) });
    }
  }
}

async function importSubscriptions(
  subscriptions: BudgetExportData["subscriptions"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"]
) {
  for (const sub of subscriptions) {
    try {
      const existing = await db.subscriptions.get(sub.id);

      if (existing) {
        if (resolution === "skip") {
          stats.subscriptions.skipped++;
          continue;
        } else if (resolution === "rename") {
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
      errors.push({ table: "subscriptions", id: sub.id, message: String(error) });
    }
  }
}

async function importProfiles(
  profiles: BudgetExportData["profiles"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"],
  profileIdMap: Map<string, string>
) {
  for (const profile of profiles) {
    try {
      const existing = await db.profiles.get(profile.id);
      const originalId = profile.id;

      if (existing) {
        if (resolution === "skip") {
          stats.profiles.skipped++;
          // Map to existing profile for reference updates
          profileIdMap.set(originalId, existing.id);
          continue;
        } else if (resolution === "rename") {
          profile.id = `${profile.id}-imported-${Date.now()}`;
          // Track the ID mapping for updating references
          profileIdMap.set(originalId, profile.id);
        }
        // overwrite: continue with put, keep same ID
      }

      // Note: We don't import pinHash/pinSalt for security
      // Imported profiles will have no PIN protection
      await db.profiles.put({
        id: profile.id,
        name: profile.name,
        isDefault: profile.isDefault,
        avatarColor: profile.avatarColor,
        avatarImage: profile.avatarImage,
        order: profile.order,
        pinHash: null, // Security: don't import PIN data
        pinSalt: null, // Security: don't import PIN data
        createdAt: parseDate(profile.createdAt) || new Date(),
        updatedAt: parseDate(profile.updatedAt) || new Date(),
      });
      stats.profiles.imported++;
    } catch (error) {
      stats.profiles.errors++;
      errors.push({ table: "profiles", id: profile.id, message: String(error) });
    }
  }
}

async function importActivityLog(
  activityLog: BudgetExportData["activityLog"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"],
  profileIdMap: Map<string, string>
) {
  for (const entry of activityLog) {
    try {
      const existing = await db.activityLog.get(entry.id);

      if (existing) {
        if (resolution === "skip") {
          stats.activityLog.skipped++;
          continue;
        } else if (resolution === "rename") {
          entry.id = `${entry.id}-imported-${Date.now()}`;
        }
      }

      // Map profileId to new profile ID if it was renamed during import
      let mappedProfileId = entry.profileId;
      if (profileIdMap.has(mappedProfileId)) {
        mappedProfileId = profileIdMap.get(mappedProfileId)!;
      }

      await db.activityLog.put({
        id: entry.id,
        profileId: mappedProfileId,
        profileName: entry.profileName,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        entityName: entry.entityName,
        details: entry.details,
        timestamp: parseDate(entry.timestamp) || new Date(),
      });
      stats.activityLog.imported++;
    } catch (error) {
      stats.activityLog.errors++;
      errors.push({ table: "activityLog", id: entry.id, message: String(error) });
    }
  }
}

// Progress-enabled import functions
// These wrap the original import logic but emit progress updates

const PROGRESS_UPDATE_INTERVAL = 10; // Emit progress every N items for responsiveness

async function importAccountsWithProgress(
  accounts: BudgetExportData["accounts"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"],
  onProgress: ((progress: ImportProgress) => void) | undefined,
  tableIndex: number,
  totalTables: number
) {
  const total = accounts.length;
  emitProgress(onProgress, {
    stage: "importing",
    currentTable: "accounts",
    tableIndex,
    totalTables,
    itemsProcessed: 0,
    totalItems: total,
    message: `Importing accounts...`,
  });

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    try {
      const existing = await db.accounts.get(account.id);

      if (existing) {
        if (resolution === "skip") {
          stats.accounts.skipped++;
          continue;
        } else if (resolution === "rename") {
          account.id = `${account.id}-imported-${Date.now()}`;
        }
      }

      await db.accounts.put({
        ...account,
        createdAt: parseDate(account.createdAt) || new Date(),
        updatedAt: parseDate(account.updatedAt) || new Date(),
      });
      stats.accounts.imported++;
    } catch (error) {
      stats.accounts.errors++;
      errors.push({ table: "accounts", id: account.id, message: String(error) });
    }

    // Emit progress periodically
    if ((i + 1) % PROGRESS_UPDATE_INTERVAL === 0 || i === accounts.length - 1) {
      emitProgress(onProgress, {
        stage: "importing",
        currentTable: "accounts",
        tableIndex,
        totalTables,
        itemsProcessed: i + 1,
        totalItems: total,
        message: `Importing accounts...`,
      });
    }
  }
}

async function importCategoriesWithProgress(
  categories: BudgetExportData["categories"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"],
  onProgress: ((progress: ImportProgress) => void) | undefined,
  tableIndex: number,
  totalTables: number
) {
  const total = categories.length;
  emitProgress(onProgress, {
    stage: "importing",
    currentTable: "categories",
    tableIndex,
    totalTables,
    itemsProcessed: 0,
    totalItems: total,
    message: `Importing categories...`,
  });

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    try {
      const existing = await db.categories.get(category.id);

      if (existing) {
        if (resolution === "skip") {
          stats.categories.skipped++;
          continue;
        } else if (resolution === "rename") {
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
      errors.push({ table: "categories", id: category.id, message: String(error) });
    }

    if ((i + 1) % PROGRESS_UPDATE_INTERVAL === 0 || i === categories.length - 1) {
      emitProgress(onProgress, {
        stage: "importing",
        currentTable: "categories",
        tableIndex,
        totalTables,
        itemsProcessed: i + 1,
        totalItems: total,
        message: `Importing categories...`,
      });
    }
  }
}

async function importTransactionsWithProgress(
  transactions: BudgetExportData["transactions"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"],
  onProgress: ((progress: ImportProgress) => void) | undefined,
  tableIndex: number,
  totalTables: number
) {
  const total = transactions.length;
  emitProgress(onProgress, {
    stage: "importing",
    currentTable: "transactions",
    tableIndex,
    totalTables,
    itemsProcessed: 0,
    totalItems: total,
    message: `Importing transactions...`,
  });

  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    try {
      const existing = await db.transactions.get(tx.id);

      if (existing) {
        if (resolution === "skip") {
          stats.transactions.skipped++;
          continue;
        } else if (resolution === "rename") {
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
      errors.push({ table: "transactions", id: tx.id, message: String(error) });
    }

    if ((i + 1) % PROGRESS_UPDATE_INTERVAL === 0 || i === transactions.length - 1) {
      emitProgress(onProgress, {
        stage: "importing",
        currentTable: "transactions",
        tableIndex,
        totalTables,
        itemsProcessed: i + 1,
        totalItems: total,
        message: `Importing transactions...`,
      });
    }
  }
}

async function importBudgetsWithProgress(
  budgets: BudgetExportData["budgets"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"],
  profileIdMap: Map<string, string>,
  onProgress: ((progress: ImportProgress) => void) | undefined,
  tableIndex: number,
  totalTables: number
) {
  const total = budgets.length;
  emitProgress(onProgress, {
    stage: "importing",
    currentTable: "budgets",
    tableIndex,
    totalTables,
    itemsProcessed: 0,
    totalItems: total,
    message: `Importing budgets...`,
  });

  for (let i = 0; i < budgets.length; i++) {
    const budget = budgets[i];
    try {
      const existing = await db.budgets.get(budget.id);

      if (existing) {
        if (resolution === "skip") {
          stats.budgets.skipped++;
          continue;
        } else if (resolution === "rename") {
          budget.id = `${budget.id}-imported-${Date.now()}`;
        }
      }

      let mappedOwnerId = budget.ownerId;
      if (mappedOwnerId && profileIdMap.has(mappedOwnerId)) {
        mappedOwnerId = profileIdMap.get(mappedOwnerId);
      }

      await db.budgets.put({
        ...budget,
        ownerId: mappedOwnerId,
        startDate: parseDate(budget.startDate) || new Date(),
        endDate: budget.endDate ? parseDate(budget.endDate) : null,
        createdAt: parseDate(budget.createdAt) || new Date(),
        updatedAt: parseDate(budget.updatedAt) || new Date(),
      });
      stats.budgets.imported++;
    } catch (error) {
      stats.budgets.errors++;
      errors.push({ table: "budgets", id: budget.id, message: String(error) });
    }

    if ((i + 1) % PROGRESS_UPDATE_INTERVAL === 0 || i === budgets.length - 1) {
      emitProgress(onProgress, {
        stage: "importing",
        currentTable: "budgets",
        tableIndex,
        totalTables,
        itemsProcessed: i + 1,
        totalItems: total,
        message: `Importing budgets...`,
      });
    }
  }
}

async function importGoalsWithProgress(
  goals: BudgetExportData["goals"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"],
  onProgress: ((progress: ImportProgress) => void) | undefined,
  tableIndex: number,
  totalTables: number
) {
  const total = goals.length;
  emitProgress(onProgress, {
    stage: "importing",
    currentTable: "goals",
    tableIndex,
    totalTables,
    itemsProcessed: 0,
    totalItems: total,
    message: `Importing goals...`,
  });

  for (let i = 0; i < goals.length; i++) {
    const goal = goals[i];
    try {
      const existing = await db.futurePurchases.get(goal.id);

      if (existing) {
        if (resolution === "skip") {
          stats.goals.skipped++;
          continue;
        } else if (resolution === "rename") {
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
      errors.push({ table: "goals", id: goal.id, message: String(error) });
    }

    if ((i + 1) % PROGRESS_UPDATE_INTERVAL === 0 || i === goals.length - 1) {
      emitProgress(onProgress, {
        stage: "importing",
        currentTable: "goals",
        tableIndex,
        totalTables,
        itemsProcessed: i + 1,
        totalItems: total,
        message: `Importing goals...`,
      });
    }
  }
}

async function importLoansWithProgress(
  loans: BudgetExportData["loans"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"],
  onProgress: ((progress: ImportProgress) => void) | undefined,
  tableIndex: number,
  totalTables: number
) {
  const total = loans.length;
  emitProgress(onProgress, {
    stage: "importing",
    currentTable: "loans",
    tableIndex,
    totalTables,
    itemsProcessed: 0,
    totalItems: total,
    message: `Importing loans...`,
  });

  for (let i = 0; i < loans.length; i++) {
    const loan = loans[i];
    try {
      const existing = await db.loans.get(loan.id);

      if (existing) {
        if (resolution === "skip") {
          stats.loans.skipped++;
          continue;
        } else if (resolution === "rename") {
          loan.id = `${loan.id}-imported-${Date.now()}`;
        }
      }

      await db.loans.put({
        ...loan,
        startDate: parseDate(loan.startDate) || new Date(),
        nextPaymentDate: parseDate(loan.nextPaymentDate) || new Date(),
        defermentEndDate: loan.defermentEndDate
          ? parseDate(loan.defermentEndDate) || undefined
          : undefined,
        createdAt: parseDate(loan.createdAt) || new Date(),
        updatedAt: parseDate(loan.updatedAt) || new Date(),
      });
      stats.loans.imported++;
    } catch (error) {
      stats.loans.errors++;
      errors.push({ table: "loans", id: loan.id, message: String(error) });
    }

    if ((i + 1) % PROGRESS_UPDATE_INTERVAL === 0 || i === loans.length - 1) {
      emitProgress(onProgress, {
        stage: "importing",
        currentTable: "loans",
        tableIndex,
        totalTables,
        itemsProcessed: i + 1,
        totalItems: total,
        message: `Importing loans...`,
      });
    }
  }
}

async function importSubscriptionsWithProgress(
  subscriptions: BudgetExportData["subscriptions"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"],
  onProgress: ((progress: ImportProgress) => void) | undefined,
  tableIndex: number,
  totalTables: number
) {
  const total = subscriptions.length;
  emitProgress(onProgress, {
    stage: "importing",
    currentTable: "subscriptions",
    tableIndex,
    totalTables,
    itemsProcessed: 0,
    totalItems: total,
    message: `Importing subscriptions...`,
  });

  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i];
    try {
      const existing = await db.subscriptions.get(sub.id);

      if (existing) {
        if (resolution === "skip") {
          stats.subscriptions.skipped++;
          continue;
        } else if (resolution === "rename") {
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
      errors.push({ table: "subscriptions", id: sub.id, message: String(error) });
    }

    if ((i + 1) % PROGRESS_UPDATE_INTERVAL === 0 || i === subscriptions.length - 1) {
      emitProgress(onProgress, {
        stage: "importing",
        currentTable: "subscriptions",
        tableIndex,
        totalTables,
        itemsProcessed: i + 1,
        totalItems: total,
        message: `Importing subscriptions...`,
      });
    }
  }
}

async function importProfilesWithProgress(
  profiles: BudgetExportData["profiles"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"],
  profileIdMap: Map<string, string>,
  onProgress: ((progress: ImportProgress) => void) | undefined,
  tableIndex: number,
  totalTables: number
) {
  const total = profiles.length;
  emitProgress(onProgress, {
    stage: "importing",
    currentTable: "profiles",
    tableIndex,
    totalTables,
    itemsProcessed: 0,
    totalItems: total,
    message: `Importing profiles...`,
  });

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    try {
      const existing = await db.profiles.get(profile.id);
      const originalId = profile.id;

      if (existing) {
        if (resolution === "skip") {
          stats.profiles.skipped++;
          profileIdMap.set(originalId, existing.id);
          continue;
        } else if (resolution === "rename") {
          profile.id = `${profile.id}-imported-${Date.now()}`;
          profileIdMap.set(originalId, profile.id);
        }
      }

      await db.profiles.put({
        id: profile.id,
        name: profile.name,
        isDefault: profile.isDefault,
        avatarColor: profile.avatarColor,
        avatarImage: profile.avatarImage,
        order: profile.order,
        pinHash: null,
        pinSalt: null,
        createdAt: parseDate(profile.createdAt) || new Date(),
        updatedAt: parseDate(profile.updatedAt) || new Date(),
      });
      stats.profiles.imported++;
    } catch (error) {
      stats.profiles.errors++;
      errors.push({ table: "profiles", id: profile.id, message: String(error) });
    }

    if ((i + 1) % PROGRESS_UPDATE_INTERVAL === 0 || i === profiles.length - 1) {
      emitProgress(onProgress, {
        stage: "importing",
        currentTable: "profiles",
        tableIndex,
        totalTables,
        itemsProcessed: i + 1,
        totalItems: total,
        message: `Importing profiles...`,
      });
    }
  }
}

async function importActivityLogWithProgress(
  activityLog: BudgetExportData["activityLog"],
  resolution: ConflictResolution,
  stats: ImportResult["stats"],
  errors: ImportResult["errors"],
  profileIdMap: Map<string, string>,
  onProgress: ((progress: ImportProgress) => void) | undefined,
  tableIndex: number,
  totalTables: number
) {
  const total = activityLog.length;
  emitProgress(onProgress, {
    stage: "importing",
    currentTable: "activityLog",
    tableIndex,
    totalTables,
    itemsProcessed: 0,
    totalItems: total,
    message: `Importing activity log...`,
  });

  for (let i = 0; i < activityLog.length; i++) {
    const entry = activityLog[i];
    try {
      const existing = await db.activityLog.get(entry.id);

      if (existing) {
        if (resolution === "skip") {
          stats.activityLog.skipped++;
          continue;
        } else if (resolution === "rename") {
          entry.id = `${entry.id}-imported-${Date.now()}`;
        }
      }

      let mappedProfileId = entry.profileId;
      if (profileIdMap.has(mappedProfileId)) {
        mappedProfileId = profileIdMap.get(mappedProfileId)!;
      }

      await db.activityLog.put({
        id: entry.id,
        profileId: mappedProfileId,
        profileName: entry.profileName,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        entityName: entry.entityName,
        details: entry.details,
        timestamp: parseDate(entry.timestamp) || new Date(),
      });
      stats.activityLog.imported++;
    } catch (error) {
      stats.activityLog.errors++;
      errors.push({ table: "activityLog", id: entry.id, message: String(error) });
    }

    if ((i + 1) % PROGRESS_UPDATE_INTERVAL === 0 || i === activityLog.length - 1) {
      emitProgress(onProgress, {
        stage: "importing",
        currentTable: "activityLog",
        tableIndex,
        totalTables,
        itemsProcessed: i + 1,
        totalItems: total,
        message: `Importing activity log...`,
      });
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
      errors: validation.errors.map((e) => e.message),
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
        errors: ["Password required for encrypted file"],
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
    profiles: data.profiles?.length || 0,
    activityLog: data.activityLog?.length || 0,
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

  // Check for profile conflicts
  if (data.profiles) {
    for (const profile of data.profiles) {
      if (await db.profiles.get(profile.id)) {
        conflicts.profiles = (conflicts.profiles || 0) + 1;
      }
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
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}
