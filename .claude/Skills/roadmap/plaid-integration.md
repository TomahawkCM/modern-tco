---
name: plaid-integration
description: Use when implementing bank sync via Plaid or SimpleFIN, managing bank connections, or building automatic transaction import.
---

# Plaid Integration

## Overview

Implements automatic bank sync using Plaid (primary) or SimpleFIN (fallback). Handles Link initialization, token exchange, transaction sync, connection health monitoring, error recovery, and MFA handling. Designed with a manual-first fallback so the app works fully without bank sync.

## When to Use

- Setting up Plaid Link for bank connection
- Implementing transaction sync from connected banks
- Building connection health dashboard
- Handling MFA, re-authentication, and error recovery
- Implementing SimpleFIN as a Plaid alternative
- Building reconciliation between manual and synced transactions

## Core Principles

- **Manual-first** — App works fully without bank sync; sync is enhancement
- **User controls data** — User explicitly chooses which accounts to sync
- **Error recovery** — Graceful handling of all Plaid error codes
- **Zero-knowledge sync** — Transactions encrypted client-side after receipt from Plaid
- **Reconciliation** — Automatic dedup between manual entries and synced transactions

## Workflow

### Step 1: Plaid Link Setup

```tsx
// Server-side: Create link token
// src/app/api/plaid/create-link-token/route.ts
import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';

const plaidClient = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
}));

export async function POST(req: Request) {
  const { userId } = await req.json();

  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Budget App',
    products: ['transactions'],
    country_codes: ['US', 'CA', 'GB'],
    language: 'en',
  });

  return Response.json({ link_token: response.data.link_token });
}
```

### Step 2: Client-Side Link Component

```tsx
import { usePlaidLink } from 'react-plaid-link';

function ConnectBankButton() {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/plaid/create-link-token', {
      method: 'POST',
      body: JSON.stringify({ userId: currentUser.id }),
    })
      .then(r => r.json())
      .then(data => setLinkToken(data.link_token));
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      // Exchange public token for access token (server-side)
      await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        body: JSON.stringify({ public_token: publicToken }),
      });

      // Sync transactions
      await syncTransactions();
    },
    onExit: (err) => {
      if (err) console.error('Plaid Link error:', err);
    },
  });

  return (
    <Button onClick={() => open()} disabled={!ready}>
      Connect Bank Account
    </Button>
  );
}
```

### Step 3: Token Exchange (Server-Side)

```ts
// src/app/api/plaid/exchange-token/route.ts
export async function POST(req: Request) {
  const { public_token } = await req.json();

  const response = await plaidClient.itemPublicTokenExchange({
    public_token,
  });

  const accessToken = response.data.access_token;
  const itemId = response.data.item_id;

  // Store access token securely (encrypted, server-side only)
  await storeAccessToken(userId, itemId, accessToken);

  return Response.json({ success: true, item_id: itemId });
}
```

### Step 4: Transaction Sync

```ts
// src/app/api/plaid/sync/route.ts
export async function POST(req: Request) {
  const { itemId } = await req.json();
  const accessToken = await getAccessToken(itemId);

  let cursor = await getSyncCursor(itemId);
  let hasMore = true;
  const allTransactions = [];

  while (hasMore) {
    const response = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor: cursor || undefined,
    });

    allTransactions.push(...response.data.added);
    // Handle modified and removed transactions too

    cursor = response.data.next_cursor;
    hasMore = response.data.has_more;
  }

  await saveSyncCursor(itemId, cursor);

  // Return transactions for client-side encryption
  return Response.json({
    transactions: allTransactions.map(t => ({
      plaidId: t.transaction_id,
      date: t.date,
      amount: t.amount.toString(), // String for Decimal.js
      description: t.name,
      merchant: t.merchant_name,
      category: t.personal_finance_category?.primary,
      pending: t.pending,
    })),
  });
}
```

### Step 5: Connection Health Dashboard

```tsx
function ConnectionHealth({ connections }: Props) {
  return (
    <div className="space-y-3">
      {connections.map(conn => (
        <div key={conn.itemId} className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <BankLogo institution={conn.institution} />
            <div>
              <p className="font-medium">{conn.institutionName}</p>
              <p className="text-sm text-muted-foreground">
                Last synced: {formatRelativeTime(conn.lastSync)}
              </p>
            </div>
          </div>
          <ConnectionStatusBadge status={conn.status} />
        </div>
      ))}
    </div>
  );
}
```

### Step 6: Error Recovery

| Error Code | Meaning | Action |
|-----------|---------|--------|
| `ITEM_LOGIN_REQUIRED` | Credentials changed | Show re-auth Link |
| `INSTITUTION_NOT_RESPONDING` | Bank API down | Retry with backoff |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Queue and retry |
| `TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION` | Data changed mid-sync | Restart sync |
| `NO_ACCOUNTS` | No accounts found | Show help message |

## Key Files

| File | Role |
|------|------|
| `src/app/api/plaid/` | Plaid API routes (server-side) |
| `src/components/budget/` | Bank connection UI components |
| `src/lib/encryption/` | Encrypt synced transactions client-side |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Storing access tokens client-side | Always server-side, encrypted |
| Not handling Plaid webhook for updates | Set up webhook endpoint |
| Skipping reconciliation with manual entries | Dedup by date + amount + merchant |
| Not encrypting synced transactions | Encrypt client-side before IndexedDB |
| Ignoring pending transactions | Show as pending, update when posted |

## Validation Checklist

- [ ] Plaid Link opens and completes successfully
- [ ] Token exchange works (public → access)
- [ ] Transactions sync with cursor-based pagination
- [ ] Synced transactions encrypted before storage
- [ ] Connection health shows accurate status
- [ ] Error recovery handles all common error codes
- [ ] Manual-first: app works fully without Plaid
- [ ] Reconciliation prevents duplicate entries

## Related Skills

- `e2e-encryption` — encrypt synced transactions
- `investment-tracker` — Plaid Investments API
- `real-time-sync` — sync between devices after Plaid import
- `rules-engine` — auto-categorize synced transactions
