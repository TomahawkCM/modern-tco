# Privacy & Security Documentation

## Overview

The Budget App is designed with privacy and security as core principles. This document explains how your data is stored, protected, and managed.

---

## Data Storage

### Standalone Mode

In standalone mode, **all data stays on your device**:

- **Storage method**: IndexedDB (browser local storage)
- **Location**: Your browser's local storage
- **Network access**: None - no data is sent anywhere
- **Data persistence**: Until you clear browser data

```
Your Device
├── Browser
│   └── IndexedDB
│       └── BudgetDatabase
│           ├── profiles
│           ├── transactions
│           ├── budgets
│           ├── activityLog
│           └── ... (other tables)
```

### What We Store Locally

| Data Type     | Stored | Sensitive |
| ------------- | :----: | :-------: |
| Transactions  |   ✅   |  Medium   |
| Accounts      |   ✅   |  Medium   |
| Categories    |   ✅   |    Low    |
| Budgets       |   ✅   |    Low    |
| Goals         |   ✅   |    Low    |
| Loans         |   ✅   |   High    |
| Subscriptions |   ✅   |  Medium   |
| Profiles      |   ✅   |    Low    |
| PIN hashes    |   ✅   |   High    |
| Activity log  |   ✅   |    Low    |
| Settings      |   ✅   |    Low    |
| Receipts      |   ✅   |  Medium   |

### What We Never Store

- Plaintext PINs
- Bank credentials
- Full account numbers
- Social security numbers
- Credit card numbers

---

## PIN Security

### Hash Algorithm

PINs are secured using industry-standard cryptography:

```typescript
Algorithm: PBKDF2
Hash function: SHA-256
Iterations: 100,000
Salt: Random 16 bytes per profile
Key length: 256 bits
```

### How PIN Storage Works

1. User enters PIN (e.g., "1234")
2. System generates random salt
3. PBKDF2 derives key from PIN + salt
4. Only hash and salt are stored
5. Original PIN is never stored

```typescript
// Storage structure (no plaintext PIN)
{
  id: "profile-123",
  name: "Parent",
  pinHash: "a3f2b8c9d4e5...", // 64-char hex
  pinSalt: "7f8e9d0c1b2a...", // 32-char hex
}
```

### PIN Verification

When verifying a PIN:

1. Retrieve stored salt for profile
2. Hash entered PIN with stored salt
3. Compare hash to stored hash
4. Grant access if hashes match

```typescript
// Verification (timing-safe comparison)
const inputHash = await hashPIN(enteredPin, storedSalt);
const isValid = timingSafeEqual(inputHash, storedHash);
```

### Brute Force Protection

- **Max attempts**: 3 consecutive failures
- **Lockout duration**: 30 seconds
- **State storage**: In-memory only (resets on refresh)

### PIN Requirements

- **Length**: 4-6 digits
- **No sequences**: "1234", "4321" rejected
- **No repeats**: "1111", "0000" rejected

---

## Auto-Lock Security

### Inactivity Timeout

- **Default timeout**: 15 minutes
- **Events that reset timer**: Any user interaction
- **Lock behavior**: Returns to profile selection

### What Happens on Lock

1. Current profile cleared from memory
2. PIN entry required to access profile
3. Session data preserved in IndexedDB
4. No data loss occurs

---

## Export Security

### Unencrypted Export

- File format: JSON (.budget)
- Checksum: SHA-256 integrity verification
- **Excluded data**: PIN hashes and salts

```json
{
  "profiles": [
    {
      "id": "profile-123",
      "name": "Parent",
      "isDefault": true
      // Note: pinHash and pinSalt NOT included
    }
  ]
}
```

### Encrypted Export

- Encryption: AES-256-GCM
- Key derivation: PBKDF2 (100,000 iterations)
- IV: Random 12 bytes per export
- Authentication tag: Included for integrity

```json
{
  "metadata": {
    "encrypted": true,
    "encryptionMethod": "AES-256-GCM"
  },
  "data": {
    "encrypted": true,
    "algorithm": "AES-256-GCM",
    "iv": "base64...",
    "salt": "base64...",
    "ciphertext": "base64...",
    "authTag": "base64..."
  }
}
```

### Export Best Practices

1. **Use encryption** for sensitive exports
2. **Choose strong password** (12+ characters)
3. **Store securely** (encrypted drive, password manager)
4. **Delete after import** if no longer needed

---

## Import Security

### Validation Steps

1. **Format check**: Valid JSON structure
2. **Version check**: Compatible schema version
3. **Checksum verification**: Data integrity
4. **Password validation**: For encrypted files

### PIN Handling on Import

- **Imported profiles have no PIN**
- User must set new PIN after import
- Prevents PIN reuse across devices

---

## Activity Logging

### What's Logged

| Action         | Entity                    | Details           |
| -------------- | ------------------------- | ----------------- |
| create         | transaction, budget, etc. | Name, amount      |
| update         | transaction, budget, etc. | Changed fields    |
| delete         | transaction, budget, etc. | Deleted item name |
| login          | profile                   | Profile name      |
| logout         | profile                   | Profile name      |
| export         | system                    | Export type       |
| import         | system                    | Import source     |
| pin_change     | profile                   | Action type       |
| profile_switch | profile                   | Target profile    |

### Log Retention

- **Maximum entries**: 500
- **Auto-pruning**: Oldest entries removed
- **Export included**: Yes (in .budget files)

### Log Access

- Visible to all profiles
- Filterable by profile
- Shows who made changes

---

## Privacy Guarantees (Standalone Mode)

### What We Guarantee

1. **No network requests** - App works completely offline
2. **No telemetry** - No usage data collected
3. **No tracking** - No cookies or analytics
4. **No cloud storage** - Data stays local
5. **No account required** - Use anonymously

### Browser Permissions

The app requires only:

- **IndexedDB access** - For local data storage
- **Web Crypto API** - For PIN hashing and encryption

The app does NOT require:

- Network access
- Location access
- Camera/microphone
- Push notifications

---

## Security Recommendations

### For Users

1. **Set PINs** for profiles with sensitive data
2. **Use strong PINs** (avoid birthdays, sequences)
3. **Export backups regularly** with encryption
4. **Clear browser data** on shared devices
5. **Update browser** for security patches

### For Shared Devices

1. **Always lock profile** when stepping away
2. **Use private/incognito mode** on public computers
3. **Clear all data** after using shared devices
4. **Don't save encrypted exports** to shared storage

---

## Data Deletion

### Deleting a Profile

When you delete a profile:

- Profile record removed from database
- PIN hash and salt deleted
- Activity log entries remain (attribution preserved)
- Private budgets owned by profile are NOT automatically deleted

### Clearing All Data

To completely remove all data:

1. Go to browser settings
2. Clear site data for this domain
3. Or use browser's "Clear browsing data" feature

---

## Technical Security Details

### Cryptographic Primitives

```typescript
// PIN hashing
PBKDF2-SHA256, 100,000 iterations, 256-bit output

// Export encryption
AES-256-GCM with PBKDF2-derived key

// Checksum
SHA-256 hash of JSON-serialized data

// Random generation
crypto.getRandomValues() (CSPRNG)
```

### Security Headers (Production)

When deployed, recommended security headers:

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Contact

For security concerns or vulnerability reports, please contact the development team through the appropriate channels.
