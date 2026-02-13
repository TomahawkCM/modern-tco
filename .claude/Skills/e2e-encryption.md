---
name: e2e-encryption
description: Use when implementing or modifying any encryption, key management, zero-knowledge feature, or handling PII in the budget app. Enforces correct cryptographic patterns.
---

# End-to-End Encryption

## Overview

The budget app uses a zero-knowledge architecture where all personal financial data (transactions, accounts, budgets) is encrypted client-side before storage. The server never sees plaintext PII. This skill ensures all new features maintain this security model using AES-256-GCM encryption with proper key derivation.

## When to Use

- Adding any feature that stores or transmits PII (personal identifiable information)
- Modifying the encryption layer or key management
- Implementing new data types that need encryption
- Building features that touch `encrypted-db-wrapper.ts`
- Migrating unencrypted data to encrypted storage
- Reviewing code that handles financial data

## Core Principles

- **Zero-knowledge** — Server stores only ciphertext; decryption keys never leave the client
- **AES-256-GCM** — Authenticated encryption with 96-bit nonces, 128-bit auth tags
- **Key derivation** — PBKDF2 (600,000 iterations) or Argon2id from user passphrase
- **Encrypt at the edge** — Data is encrypted immediately on input, decrypted only for display
- **Key rotation** — Support re-encrypting all data with a new key without data loss

## Workflow

### Step 1: Determine What Needs Encryption

Classify data sensitivity:

| Level | Examples | Action |
|-------|----------|--------|
| **PII** | Transaction amounts, descriptions, merchant names, account numbers | Must encrypt |
| **Sensitive** | Category names, budget amounts, goals | Must encrypt |
| **Non-sensitive** | UI preferences, feature flags, theme choice | No encryption needed |
| **Metadata** | Record count, last sync timestamp | No encryption needed |

### Step 2: Use the Encrypted DB Wrapper

All encrypted data goes through `encrypted-db-wrapper.ts`:

```ts
import { EncryptedDB } from '@/lib/encryption/encrypted-db-wrapper';

// Store encrypted data
await EncryptedDB.put('transactions', transactionId, {
  date: '2025-01-15',
  amount: '-45.99',
  description: 'Grocery store',
  merchant: 'Whole Foods',
  category: 'Food',
});

// Retrieve and auto-decrypt
const transaction = await EncryptedDB.get('transactions', transactionId);
```

### Step 3: Encryption Implementation Pattern

When building new encrypted storage:

```ts
import { encrypt, decrypt, deriveKey } from '@/lib/encryption/budget-encryption';

// Derive key from user passphrase (do once, cache in memory)
const key = await deriveKey(passphrase, salt);

// Encrypt before storage
const { ciphertext, iv, authTag } = await encrypt(
  JSON.stringify(sensitiveData),
  key
);

// Store ciphertext + iv + authTag (all base64)
await indexedDB.put({
  id: recordId,
  data: ciphertext,
  iv: iv,
  tag: authTag,
});

// Decrypt for display
const plaintext = await decrypt(ciphertext, key, iv, authTag);
const data = JSON.parse(plaintext);
```

### Step 4: Key Management

```
User passphrase
       │
       ▼
  PBKDF2 (600K iterations, SHA-256)
       │
       ▼
  Master Key (256-bit)
       │
       ├──► Data Encryption Key (DEK) — encrypts user data
       │
       └──► Key Encryption Key (KEK) — encrypts DEK for storage
```

Key storage rules:
- Master key: derived on-demand, kept in memory only, cleared on logout
- DEK: encrypted with KEK, stored in IndexedDB
- Salt: stored unencrypted (unique per user)
- Never store passphrase or master key to disk

### Step 5: Migration from Unencrypted Data

Use the existing migration utility:

```ts
import { migrateToEncryption } from '@/lib/encryption/migrate-to-encryption';

// Migrate existing unencrypted records
await migrateToEncryption({
  store: 'transactions',
  encryptionKey: derivedKey,
  batchSize: 100, // Process 100 records at a time
  onProgress: (done, total) => setProgress(done / total),
});
```

### Step 6: Testing Encrypted Features

```ts
import 'fake-indexeddb/auto';
import { encrypt, decrypt, deriveKey } from '@/lib/encryption/budget-encryption';

describe('encrypted feature', () => {
  let key: CryptoKey;

  beforeAll(async () => {
    key = await deriveKey('test-passphrase', 'test-salt');
  });

  it('round-trips data through encryption', async () => {
    const data = { amount: '99.99', description: 'Test' };
    const encrypted = await encrypt(JSON.stringify(data), key);
    const decrypted = JSON.parse(
      await decrypt(encrypted.ciphertext, key, encrypted.iv, encrypted.authTag)
    );
    expect(decrypted).toEqual(data);
  });
});
```

## Key Files

| File | Role |
|------|------|
| `src/lib/encryption/budget-encryption.ts` | Core encrypt/decrypt/deriveKey functions |
| `src/lib/encryption/encrypted-db-wrapper.ts` | High-level encrypted IndexedDB wrapper |
| `src/lib/encryption/encrypted-transactions.ts` | Transaction-specific encryption |
| `src/lib/encryption/migrate-to-encryption.ts` | Migration utility for existing data |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Storing plaintext PII "temporarily" | Always encrypt before any storage, even temporary |
| Reusing nonces/IVs | Generate fresh random IV for every encryption operation |
| Logging decrypted data | Never `console.log` decrypted PII; use `[ENCRYPTED]` placeholder |
| Storing encryption key in localStorage | Keep keys in memory only; re-derive on each session |
| Skipping auth tag verification | Always use GCM mode with auth tag; reject tampered data |
| Sending plaintext to server/API | Encrypt client-side before any network call |
| Using `Math.random()` for crypto | Use `crypto.getRandomValues()` for all random bytes |

## Validation Checklist

- [ ] All PII encrypted with AES-256-GCM before storage
- [ ] Fresh random IV (96-bit) generated per encryption
- [ ] Auth tag verified on every decryption
- [ ] No plaintext PII in localStorage, sessionStorage, or cookies
- [ ] No plaintext PII in console.log or error messages
- [ ] Key derived with PBKDF2 (≥600K iterations) or Argon2id
- [ ] Master key cleared from memory on logout/tab close
- [ ] Migration path exists for new encrypted fields
- [ ] Tests use `fake-indexeddb` and verify round-trip encryption

## Related Skills

- `document-vault` — E2E encrypted file/document storage
- `family-sharing` — encryption key sharing between family members
- `real-time-sync` — encrypted data sync between devices
- `code-review-budget` — encryption checks in code review
