# Open Banking & Bank Sync Strategy

## Current State

The app already has a full SimpleFIN integration at `src/lib/simplefin/`:

- `simplefin-client.ts` — API client with access URL encryption
- `simplefin-sync-service.ts` — Scheduled sync with deduplication
- `simplefin-types.ts` — TypeScript types for accounts and transactions
- Encryption of access tokens via PBKDF2 + AES

Additionally, the app supports 71+ bank CSV configurations for manual import.

## Open Banking Provider Comparison

### SimpleFIN (Primary — Already Integrated)

| Attribute        | Details                                          |
| ---------------- | ------------------------------------------------ |
| **Coverage**     | US/Canada (via MX upstream data provider)        |
| **Pricing**      | $1.50/month or $15/year (paid by user)           |
| **Data Access**  | Read-only transactions and balances              |
| **Rate Limits**  | 24 requests/day (intended for daily updates)     |
| **Institutions** | Up to 25 institutions, 25 apps per user          |
| **Privacy**      | App never sees bank credentials                  |
| **Protocol**     | Simple REST API, Setup Token → Access Token flow |
| **Best For**     | Privacy-focused users, individual/small apps     |
| **Used By**      | Actual Budget, Home Assistant, YNAB (community)  |

**SimpleFIN Protocol Flow**:

1. User gets Setup Token from SimpleFIN Bridge
2. App exchanges Setup Token for Access Token
3. App uses Access Token to pull transactions
4. User can revoke Access Token at any time

### Plaid (Enterprise — Future Adapter)

| Attribute       | Details                                                            |
| --------------- | ------------------------------------------------------------------ |
| **Coverage**    | 8,000+ banks, primarily US/Canada, expanding globally              |
| **Pricing**     | Enterprise/per-API-call (expensive for small apps)                 |
| **Data Access** | Balances, transactions, investments, liabilities, income, identity |
| **Scale**       | Billions of API calls/month, enterprise-grade                      |
| **Valuation**   | $6.1B (April 2025, down from $13.4B in 2021)                       |
| **Best For**    | Full-stack fintech apps, lending, identity verification            |
| **Regulatory**  | Not directly regulated but follows industry standards              |

### TrueLayer (EU/UK — Future Adapter)

| Attribute       | Details                                   |
| --------------- | ----------------------------------------- |
| **Coverage**    | UK and EU (PSD2-compliant)                |
| **Pricing**     | Transaction-based                         |
| **Data Access** | Account data + payment initiation         |
| **Regulatory**  | FCA-regulated, PSD2-compliant             |
| **Best For**    | Pay-by-bank checkout, EU/UK payment flows |
| **Strengths**   | Fast, secure, instant bank payments       |
| **Limitations** | UK/EU only, payment-focused               |

### goCardless (EU/UK — Used by Actual Budget)

| Attribute       | Details                                          |
| --------------- | ------------------------------------------------ |
| **Coverage**    | EU/UK banks                                      |
| **Data Access** | Read-only account data and transactions          |
| **Pricing**     | Free tier available (90-day transaction history) |
| **Best For**    | EU/UK bank sync for personal finance apps        |

## Recommended Strategy

### Phase 1 (MVP): SimpleFIN Only

- Already integrated and working
- $1.50/month cost is borne by the user (transparent pricing)
- Covers US/Canada (largest budget app market)
- Privacy-aligned (read-only, user controls access)

### Phase 2: Add goCardless for EU/UK

- Covers European market (our 114 locales advantage)
- Free tier available
- Used by Actual Budget (proven in personal finance)

### Phase 3: Plaid Adapter for Enterprise

- For users who want broader institution coverage
- Cost subsidized by Pro/Family subscription
- Enables features like investment tracking, income verification

### Adapter Architecture

```typescript
// Unified bank sync interface
interface BankSyncProvider {
  name: string;
  regions: string[];
  connect(userId: string): Promise<ConnectionResult>;
  getAccounts(connectionId: string): Promise<BankAccount[]>;
  getTransactions(connectionId: string, since: Date): Promise<BankTransaction[]>;
  disconnect(connectionId: string): Promise<void>;
}

// Implementations
class SimpleFINProvider implements BankSyncProvider { ... } // exists
class GoCardlessProvider implements BankSyncProvider { ... } // Phase 2
class PlaidProvider implements BankSyncProvider { ... }      // Phase 3
```

## Sources

- [Plaid vs Tink vs TrueLayer Comparison (2026)](https://www.fintegrationfs.com/post/plaid-vs-tink-vs-truelayer-which-open-banking-api-is-best-for-your-fintech)
- [Open Banking Providers: 64+ Platforms (2026)](https://www.openbankingtracker.com/open-banking-providers)
- [Open Banking API Integration Guide (2026)](https://www.openbankingtracker.com/guides/open-banking-api-integration)
- [SimpleFIN Protocol](https://www.simplefin.org/protocol.html)
- [SimpleFIN Bridge Developer Guide](https://beta-bridge.simplefin.org/info/developers)
- [Actual Budget SimpleFIN Setup](https://actualbudget.org/docs/advanced/bank-sync/simplefin/)
- [Best Open Banking API Providers 2025](https://itexus.com/best-open-banking-api-providers/)
