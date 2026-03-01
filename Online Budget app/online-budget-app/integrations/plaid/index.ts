/**
 * Plaid Integration Adapter
 *
 * Wraps Plaid API. Never exposes raw provider objects outside this layer.
 */

import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
  type Transaction as PlaidTransaction,
  type RemovedTransaction,
} from "plaid";

// ── Singleton Plaid client ──────────────────────────────────────────

let plaidInstance: PlaidApi | null = null;

/**
 * Returns a singleton PlaidApi instance.
 * Throws if PLAID_CLIENT_ID or PLAID_SECRET are not set.
 */
export function getPlaidClient(): PlaidApi {
  if (plaidInstance) return plaidInstance;

  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;

  if (!clientId) {
    throw new Error("PLAID_CLIENT_ID is not set");
  }
  if (!secret) {
    throw new Error("PLAID_SECRET is not set");
  }

  const env = (process.env.PLAID_ENV ?? "sandbox") as keyof typeof PlaidEnvironments;
  const basePath = PlaidEnvironments[env] ?? PlaidEnvironments.sandbox;

  const configuration = new Configuration({
    basePath,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": clientId,
        "PLAID-SECRET": secret,
      },
    },
  });

  plaidInstance = new PlaidApi(configuration);
  return plaidInstance;
}

/**
 * Returns true when the required Plaid env vars are configured.
 */
export function isPlaidConfigured(): boolean {
  return !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
}

// ── Link Token ──────────────────────────────────────────────────────

/**
 * Create a Plaid Link token for the given user.
 */
export async function createLinkToken(userId: string): Promise<string> {
  const client = getPlaidClient();

  const response = await client.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: "Budget App",
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
  });

  return response.data.link_token;
}

// ── Public Token Exchange ───────────────────────────────────────────

export interface ExchangeResult {
  accessToken: string;
  itemId: string;
}

/**
 * Exchange a Plaid public token for a persistent access token.
 */
export async function exchangePublicToken(publicToken: string): Promise<ExchangeResult> {
  const client = getPlaidClient();

  const response = await client.itemPublicTokenExchange({
    public_token: publicToken,
  });

  return {
    accessToken: response.data.access_token,
    itemId: response.data.item_id,
  };
}

// ── Transaction Sync ────────────────────────────────────────────────

export interface SyncResult {
  added: PlaidTransaction[];
  modified: PlaidTransaction[];
  removed: RemovedTransaction[];
  nextCursor: string;
}

/**
 * Sync transactions using cursor-based pagination.
 * Continues fetching until `has_more` is false.
 */
export async function syncTransactions(accessToken: string, cursor?: string): Promise<SyncResult> {
  const client = getPlaidClient();

  let currentCursor = cursor ?? "";
  let added: PlaidTransaction[] = [];
  let modified: PlaidTransaction[] = [];
  let removed: RemovedTransaction[] = [];
  let hasMore = true;

  while (hasMore) {
    const response = await client.transactionsSync({
      access_token: accessToken,
      cursor: currentCursor || undefined,
    });

    added = added.concat(response.data.added);
    modified = modified.concat(response.data.modified);
    removed = removed.concat(response.data.removed);
    hasMore = response.data.has_more;
    currentCursor = response.data.next_cursor;
  }

  return {
    added,
    modified,
    removed,
    nextCursor: currentCursor,
  };
}

// ── Accounts ────────────────────────────────────────────────────────

export interface PlaidAccount {
  accountId: string;
  name: string;
  officialName: string | null;
  type: string;
  subtype: string | null;
  balanceCurrent: number | null;
  balanceAvailable: number | null;
  currency: string | null;
}

/**
 * Retrieve accounts associated with an access token.
 */
export async function getAccounts(accessToken: string): Promise<PlaidAccount[]> {
  const client = getPlaidClient();

  const response = await client.accountsGet({
    access_token: accessToken,
  });

  return response.data.accounts.map((account) => ({
    accountId: account.account_id,
    name: account.name,
    officialName: account.official_name ?? null,
    type: account.type,
    subtype: account.subtype ?? null,
    balanceCurrent: account.balances.current ?? null,
    balanceAvailable: account.balances.available ?? null,
    currency: account.balances.iso_currency_code ?? null,
  }));
}
