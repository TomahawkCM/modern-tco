/**
 * SimpleFIN Integration Module
 *
 * Provides bank connection and transaction sync via SimpleFIN Bridge.
 *
 * @module simplefin
 */

// Client
export {
  SimpleFINClient,
  SimpleFINError,
  decodeSetupToken,
  parseAccessUrl,
  parseSimpleFINAmount,
  simpleFINTimestampToDate,
  isCustomCurrency,
  formatSimpleFINAccount,
} from "./client";

export type {
  SimpleFINConfig,
  SimpleFINErrorType,
  SimpleFINOrganization,
  SimpleFINTransaction,
  SimpleFINAccount,
  SimpleFINAccountSet,
  SimpleFINServerInfo,
  FetchAccountsOptions,
} from "./client";

// Types
export { DEFAULT_SIMPLEFIN_SETTINGS, parseSimpleFINAccountForDisplay } from "./types";

export type {
  ConnectionStatus,
  SimpleFINConnection,
  LinkedAccount,
  AccountSyncResult,
  SyncResult,
  SyncProgress,
  MappedTransaction,
  ImportPreview,
  SimpleFINSettings,
  ParsedSimpleFINAccount,
} from "./types";

// Encryption
export {
  SecureTokenStorage,
  deriveKey,
  generateKey,
  exportKey,
  importKey,
  encryptAccessUrl,
  decryptAccessUrl,
  generateSalt,
  saltToBase64,
  base64ToSalt,
} from "./encryption";

// Sync
export {
  SimpleFINSyncService,
  SyncScheduler,
  generateTransactionHash,
  mapSimpleFINTransaction,
  toBudgetTransaction,
  findDuplicates,
} from "./sync";

// Default export
export { SimpleFINClient as default } from "./client";
