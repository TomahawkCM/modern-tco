# Encryption Architecture Reference

## Zero-Knowledge Architecture

```
┌─────────────────────────────────────────────────┐
│                   CLIENT SIDE                    │
│                                                  │
│  User Passphrase ──► PBKDF2 ──► Master Key      │
│                        │                         │
│                        ▼                         │
│              ┌─── Key Derivation ───┐            │
│              │                      │            │
│              ▼                      ▼            │
│         Data Key (DEK)       Key Encryption      │
│              │               Key (KEK)           │
│              ▼                                   │
│     Plaintext Data ──► AES-256-GCM ──► Ciphertext│
│                                          │       │
└──────────────────────────────────────────│───────┘
                                           │
                              ─────────────│───────
                                           │
┌──────────────────────────────────────────│───────┐
│                   SERVER SIDE            │       │
│                                          ▼       │
│              Only ciphertext stored              │
│              No access to keys                   │
│              No access to plaintext              │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Encryption Specs

| Parameter | Value | Standard |
|-----------|-------|----------|
| Algorithm | AES-256-GCM | NIST SP 800-38D |
| Key size | 256 bits | — |
| Nonce/IV size | 96 bits (12 bytes) | GCM recommended |
| Auth tag size | 128 bits (16 bytes) | Full tag |
| KDF | PBKDF2-SHA256 | NIST SP 800-132 |
| KDF iterations | 600,000 | OWASP 2024 recommendation |
| Salt size | 128 bits (16 bytes) | — |

## Data Classification

### Must Encrypt (PII / Financial)
- Transaction amounts
- Transaction descriptions/notes
- Merchant names
- Account names and numbers
- Budget amounts and categories
- Income amounts
- Goal details
- Receipt images/documents

### Do Not Encrypt (Metadata)
- Record IDs (UUIDs)
- Record timestamps (created/modified)
- Feature flags and preferences
- UI state (theme, sidebar collapsed)
- Sync timestamps
- Record counts

## Key Hierarchy

```
User Passphrase (never stored)
    │
    ├── PBKDF2(passphrase, salt, 600K iterations)
    │       │
    │       └── Master Key (256-bit, memory only)
    │               │
    │               ├── HKDF("data-encryption") ──► DEK (encrypts user data)
    │               │
    │               └── HKDF("key-encryption") ──► KEK (encrypts DEK for storage)
    │
    └── Salt (16 bytes, stored unencrypted per-user)
```

## Storage Format

Each encrypted record in IndexedDB:

```json
{
  "id": "uuid-v4",
  "data": "base64-encoded-ciphertext",
  "iv": "base64-encoded-96-bit-nonce",
  "tag": "base64-encoded-128-bit-auth-tag",
  "version": 1,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

## Key Rotation Procedure

1. Derive new master key from new passphrase
2. Derive new DEK from new master key
3. For each encrypted record:
   a. Decrypt with old DEK
   b. Re-encrypt with new DEK
   c. Store with new IV (never reuse)
4. Derive new KEK, encrypt new DEK, store
5. Wipe old key material from memory
6. Verify: decrypt random sample with new key

## Threat Model

| Threat | Mitigation |
|--------|-----------|
| Server compromise | Zero-knowledge: server has only ciphertext |
| XSS attack | CSP headers, input sanitization, no eval |
| Man-in-the-middle | HTTPS + certificate pinning (PWA) |
| Brute-force passphrase | PBKDF2 600K iterations + strong passphrase policy |
| Memory dump | Key cleared on logout, `crypto.subtle` uses secure memory |
| Nonce reuse | Fresh `crypto.getRandomValues()` per encryption |
| Side-channel timing | WebCrypto API handles constant-time operations |
| Compromised device | User responsible; 2FA for cloud sync |

## Family Sharing Key Exchange

For shared household budgets:

```
User A (Admin)                    User B (Member)
     │                                 │
     ├── Generate shared DEK           │
     │                                 │
     ├── Encrypt DEK with B's          │
     │   public key ─────────────────► Decrypt with
     │                                 │ B's private key
     │                                 │
     ├── Both encrypt/decrypt          ├── Both encrypt/decrypt
     │   shared budget with DEK        │   shared budget with DEK
```

## Implementation Files

| File | Purpose |
|------|---------|
| `src/lib/encryption/budget-encryption.ts` | Core encrypt/decrypt, key derivation |
| `src/lib/encryption/encrypted-db-wrapper.ts` | High-level encrypted IndexedDB API |
| `src/lib/encryption/encrypted-transactions.ts` | Transaction-specific encryption helpers |
| `src/lib/encryption/migrate-to-encryption.ts` | Migration from unencrypted to encrypted |
