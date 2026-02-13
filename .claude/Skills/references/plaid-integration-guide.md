# Plaid Integration Guide Reference

## Plaid Products

| Product | Purpose | Use Case |
|---------|---------|----------|
| Transactions | Transaction history | Bank sync, spending analysis |
| Auth | Account/routing numbers | Direct payments |
| Balance | Real-time balances | Net worth tracking |
| Investments | Holdings & transactions | Portfolio tracking |
| Liabilities | Loans, credit cards | Debt tracking |
| Identity | Account holder info | Verification |

## Token Flow

```
1. Client requests link_token from server
2. Server creates link_token via Plaid API
3. Client opens Plaid Link with link_token
4. User selects bank and authenticates
5. Plaid Link returns public_token to client
6. Client sends public_token to server
7. Server exchanges public_token for access_token
8. Server stores access_token (encrypted)
9. Server uses access_token for data requests
```

## Environment Configuration

| Environment | Purpose | Data |
|-------------|---------|------|
| Sandbox | Development | Fake data, instant |
| Development | Testing | Real banks, limited |
| Production | Live | Real banks, full access |

```env
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox  # sandbox | development | production
```

## Common Error Codes

| Code | Meaning | User Action |
|------|---------|-------------|
| `ITEM_LOGIN_REQUIRED` | Bank credentials changed | Re-authenticate via Link |
| `INSTITUTION_NOT_RESPONDING` | Bank API temporarily down | Wait and retry |
| `INSTITUTION_NOT_AVAILABLE` | Bank not supported | Use manual import |
| `INVALID_CREDENTIALS` | Wrong username/password | Re-enter credentials |
| `INVALID_MFA` | Wrong MFA code | Re-enter MFA |
| `MFA_NOT_SUPPORTED` | MFA type unsupported | Contact support |
| `PRODUCT_NOT_READY` | Data still loading | Poll with backoff |
| `RATE_LIMIT_EXCEEDED` | Too many API calls | Exponential backoff |
| `NO_ACCOUNTS` | No accounts found | Verify bank selection |

## Webhook Events

| Event | When | Action |
|-------|------|--------|
| `TRANSACTIONS.SYNC_UPDATES_AVAILABLE` | New transactions ready | Trigger sync |
| `TRANSACTIONS.RECURRING_TRANSACTIONS_UPDATE` | Recurring detected | Update subscriptions |
| `ITEM.ERROR` | Connection error | Show error UI |
| `ITEM.PENDING_EXPIRATION` | Consent expiring | Prompt re-auth |
| `ITEM.USER_PERMISSION_REVOKED` | User revoked access | Remove connection |

## Transaction Sync API (v2)

```ts
// Initial sync (no cursor)
POST /transactions/sync
{
  "access_token": "access-xxx",
  "cursor": ""  // empty for initial
}

// Response
{
  "added": [...],
  "modified": [...],
  "removed": [...],
  "next_cursor": "cursor-xxx",
  "has_more": true
}

// Subsequent syncs (with cursor)
POST /transactions/sync
{
  "access_token": "access-xxx",
  "cursor": "cursor-xxx"  // from previous response
}
```

## Institution Coverage

| Country | Coverage | Notes |
|---------|----------|-------|
| US | ~11,000 institutions | Excellent |
| Canada | ~200 institutions | Good (major banks) |
| UK | ~50 institutions | Open Banking |
| EU | Limited | PSD2-based |

## SimpleFIN Alternative

For institutions not covered by Plaid:

```
SimpleFIN Bridge:
- Works with many credit unions
- No OAuth — uses access URL
- Free for users (funded by donations)
- JSON API, simpler than Plaid
- Less comprehensive data

Setup:
1. User creates SimpleFIN account
2. User connects bank via SimpleFIN
3. User shares access URL with app
4. App fetches transactions via access URL
```

## Cost Considerations

| Tier | Price | Includes |
|------|-------|----------|
| Free (sandbox) | $0 | Testing only |
| Launch | $0 startup | First 100 items free |
| Growth | Variable | Per-item pricing |
| Custom | Negotiated | Enterprise pricing |

Note: Each "item" = one bank connection. Pricing is per-item per-month.

## Security Requirements

- Access tokens: Store server-side only, encrypted at rest
- Webhook verification: Validate Plaid webhook signatures
- Data minimization: Only request products you need
- Token rotation: Use item/access_token/invalidate when removing connections
- Compliance: SOC 2 Type II, PCI DSS compliant
