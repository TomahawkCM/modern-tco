/**
 * SimpleFIN API Client
 *
 * Implements the SimpleFIN Protocol v1.0.7 for bank data aggregation.
 * https://www.simplefin.org/protocol.html
 *
 * Flow:
 * 1. User gets Setup Token from SimpleFIN Bridge
 * 2. App claims Setup Token to get Access URL (contains credentials)
 * 3. App uses Access URL to fetch accounts/transactions
 *
 * Rate Limits:
 * - 24 requests per day per account
 * - 60 day max date range
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Organization information from SimpleFIN
 */
export interface SimpleFINOrganization {
  domain?: string;
  name?: string;
  "sfin-url": string;
  url?: string;
  id?: string;
}

/**
 * Transaction from SimpleFIN
 */
export interface SimpleFINTransaction {
  id: string;
  posted: number; // UNIX timestamp
  amount: string; // Numeric string (can be negative)
  description: string;
  transacted_at?: number; // UNIX timestamp when transaction happened
  pending?: boolean;
  extra?: Record<string, unknown>;
}

/**
 * Account from SimpleFIN
 */
export interface SimpleFINAccount {
  org: SimpleFINOrganization;
  id: string;
  name: string;
  currency: string; // ISO 4217 or custom currency URL
  balance: string; // Numeric string
  "available-balance"?: string;
  "balance-date": number; // UNIX timestamp
  transactions?: SimpleFINTransaction[];
  extra?: Record<string, unknown>;
}

/**
 * Account Set response from /accounts endpoint
 */
export interface SimpleFINAccountSet {
  errors: string[];
  accounts: SimpleFINAccount[];
}

/**
 * Server info response from /info endpoint
 */
export interface SimpleFINServerInfo {
  versions: string[];
}

/**
 * Options for fetching accounts
 */
export interface FetchAccountsOptions {
  startDate?: Date;
  endDate?: Date;
  includePending?: boolean;
  accountIds?: string[];
  balancesOnly?: boolean;
}

/**
 * SimpleFIN client configuration
 */
export interface SimpleFINConfig {
  /** Access URL with embedded credentials */
  accessUrl: string;
  /** Optional timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Error types for SimpleFIN operations
 */
export type SimpleFINErrorType =
  | "CLAIM_FAILED"
  | "AUTH_FAILED"
  | "PAYMENT_REQUIRED"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "INVALID_TOKEN"
  | "UNKNOWN";

/**
 * Custom error class for SimpleFIN operations
 */
export class SimpleFINError extends Error {
  type: SimpleFINErrorType;
  statusCode?: number;

  constructor(message: string, type: SimpleFINErrorType, statusCode?: number) {
    super(message);
    this.name = "SimpleFINError";
    this.type = type;
    this.statusCode = statusCode;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Decode Base64 Setup Token to get the claim URL
 */
export function decodeSetupToken(setupToken: string): string {
  try {
    // Handle both browser and Node.js environments
    if (typeof atob !== "undefined") {
      return atob(setupToken);
    } else {
      return Buffer.from(setupToken, "base64").toString("utf-8");
    }
  } catch {
    throw new SimpleFINError("Invalid setup token: failed to decode Base64", "INVALID_TOKEN");
  }
}

/**
 * Parse Access URL to extract credentials and base URL
 */
export function parseAccessUrl(accessUrl: string): {
  username: string;
  password: string;
  baseUrl: string;
} {
  try {
    const url = new URL(accessUrl);
    const { username } = url;
    const { password } = url;

    // Remove credentials from URL
    url.username = "";
    url.password = "";
    const baseUrl = url.toString().replace(/\/$/, "");

    return { username, password, baseUrl };
  } catch {
    throw new SimpleFINError("Invalid access URL format", "INVALID_TOKEN");
  }
}

/**
 * Build query string from options
 */
function buildAccountsQuery(options: FetchAccountsOptions): string {
  const params = new URLSearchParams();

  if (options.startDate) {
    params.set("start-date", Math.floor(options.startDate.getTime() / 1000).toString());
  }

  if (options.endDate) {
    params.set("end-date", Math.floor(options.endDate.getTime() / 1000).toString());
  }

  if (options.includePending) {
    params.set("pending", "1");
  }

  if (options.balancesOnly) {
    params.set("balances-only", "1");
  }

  if (options.accountIds?.length) {
    options.accountIds.forEach((id) => params.append("account", id));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

// =============================================================================
// MAIN CLIENT CLASS
// =============================================================================

/**
 * SimpleFIN API Client
 *
 * Usage:
 * ```typescript
 * // 1. Claim access URL from setup token
 * const accessUrl = await SimpleFINClient.claimToken(setupToken);
 *
 * // 2. Create client with access URL
 * const client = new SimpleFINClient({ accessUrl });
 *
 * // 3. Fetch accounts and transactions
 * const data = await client.getAccounts({
 *   startDate: new Date('2024-01-01'),
 *   includePending: true
 * });
 * ```
 */
export class SimpleFINClient {
  private config: SimpleFINConfig;
  private credentials: { username: string; password: string; baseUrl: string };

  constructor(config: SimpleFINConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
    this.credentials = parseAccessUrl(config.accessUrl);
  }

  /**
   * Claim an Access URL from a Setup Token
   *
   * This can only be done ONCE per setup token. Store the returned
   * access URL securely - it contains authentication credentials.
   *
   * @param setupToken - Base64-encoded setup token from SimpleFIN Bridge
   * @returns Access URL with embedded credentials
   * @throws SimpleFINError if claim fails (token already used or invalid)
   */
  static async claimToken(setupToken: string): Promise<string> {
    const claimUrl = decodeSetupToken(setupToken);

    // Validate URL
    if (!claimUrl.startsWith("https://")) {
      throw new SimpleFINError("Setup token must decode to an HTTPS URL", "INVALID_TOKEN");
    }

    try {
      const response = await fetch(claimUrl, {
        method: "POST",
        headers: {
          "Content-Length": "0",
        },
      });

      if (response.status === 403) {
        throw new SimpleFINError(
          "Setup token has already been claimed or is invalid. " +
            "The token may have been compromised - please disable it in SimpleFIN Bridge.",
          "CLAIM_FAILED",
          403
        );
      }

      if (!response.ok) {
        throw new SimpleFINError(
          `Failed to claim token: ${response.status} ${response.statusText}`,
          "CLAIM_FAILED",
          response.status
        );
      }

      const accessUrl = await response.text();

      // Validate access URL format
      if (!accessUrl.includes("@")) {
        throw new SimpleFINError("Invalid access URL returned from claim", "CLAIM_FAILED");
      }

      return accessUrl.trim();
    } catch (error) {
      if (error instanceof SimpleFINError) {
        throw error;
      }
      throw new SimpleFINError(
        `Network error claiming token: ${error instanceof Error ? error.message : "Unknown error"}`,
        "NETWORK_ERROR"
      );
    }
  }

  /**
   * Get server info (supported protocol versions)
   */
  async getServerInfo(): Promise<SimpleFINServerInfo> {
    return this.request<SimpleFINServerInfo>("/info");
  }

  /**
   * Fetch accounts and transactions
   *
   * Rate limits apply:
   * - 24 requests per day per token
   * - 60 day max date range
   *
   * @param options - Filtering options
   * @returns Account set with accounts and any errors
   */
  async getAccounts(options: FetchAccountsOptions = {}): Promise<SimpleFINAccountSet> {
    // Validate date range (max 60 days)
    if (options.startDate && options.endDate) {
      const daysDiff = Math.ceil(
        (options.endDate.getTime() - options.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff > 60) {
        throw new SimpleFINError(
          `Date range cannot exceed 60 days (requested ${daysDiff} days)`,
          "RATE_LIMITED"
        );
      }
    }

    const query = buildAccountsQuery(options);
    return this.request<SimpleFINAccountSet>(`/accounts${query}`);
  }

  /**
   * Fetch only account balances (no transactions)
   * More efficient when you don't need transaction details.
   */
  async getBalances(): Promise<SimpleFINAccountSet> {
    return this.getAccounts({ balancesOnly: true });
  }

  /**
   * Fetch transactions for a specific account
   */
  async getAccountTransactions(
    accountId: string,
    options: Omit<FetchAccountsOptions, "accountIds" | "balancesOnly"> = {}
  ): Promise<SimpleFINAccount | null> {
    const result = await this.getAccounts({
      ...options,
      accountIds: [accountId],
    });
    return result.accounts.find((a) => a.id === accountId) || null;
  }

  /**
   * Make authenticated request to SimpleFIN API
   */
  private async request<T>(path: string): Promise<T> {
    const { username, password, baseUrl } = this.credentials;
    const url = `${baseUrl}${path}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 403) {
        throw new SimpleFINError(
          "Authentication failed. Access may have been revoked.",
          "AUTH_FAILED",
          403
        );
      }

      if (response.status === 402) {
        throw new SimpleFINError(
          "Payment required. Please renew your SimpleFIN Bridge subscription.",
          "PAYMENT_REQUIRED",
          402
        );
      }

      if (response.status === 429) {
        throw new SimpleFINError(
          "Rate limit exceeded. SimpleFIN allows 24 requests per day.",
          "RATE_LIMITED",
          429
        );
      }

      if (!response.ok) {
        throw new SimpleFINError(
          `Request failed: ${response.status} ${response.statusText}`,
          "UNKNOWN",
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof SimpleFINError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new SimpleFINError(
          `Request timed out after ${this.config.timeout}ms`,
          "NETWORK_ERROR"
        );
      }

      throw new SimpleFINError(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "NETWORK_ERROR"
      );
    }
  }

  /**
   * Validate that the access URL is still working
   */
  async validateConnection(): Promise<{
    valid: boolean;
    accounts: number;
    errors: string[];
  }> {
    try {
      const result = await this.getBalances();
      return {
        valid: true,
        accounts: result.accounts.length,
        errors: result.errors,
      };
    } catch (error) {
      if (error instanceof SimpleFINError) {
        return {
          valid: false,
          accounts: 0,
          errors: [error.message],
        };
      }
      return {
        valid: false,
        accounts: 0,
        errors: ["Unknown error validating connection"],
      };
    }
  }
}

// =============================================================================
// HELPER FUNCTIONS FOR TRANSACTION CONVERSION
// =============================================================================

/**
 * Convert SimpleFIN amount string to number
 * SimpleFIN amounts are strings that can be negative
 */
export function parseSimpleFINAmount(amount: string): number {
  return parseFloat(amount);
}

/**
 * Convert UNIX timestamp to Date
 */
export function simpleFINTimestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

/**
 * Check if currency is a custom currency URL
 */
export function isCustomCurrency(currency: string): boolean {
  return currency.startsWith("http://") || currency.startsWith("https://");
}

/**
 * Format SimpleFIN account for display
 */
export function formatSimpleFINAccount(account: SimpleFINAccount): string {
  const org = account.org.name || account.org.domain || "Unknown";
  return `${org} - ${account.name}`;
}

export default SimpleFINClient;
