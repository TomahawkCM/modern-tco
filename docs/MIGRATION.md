# Migration Guide: Standalone to Online

## Overview

This document describes the migration path from the standalone version of the Budget App to the online version when it becomes available.

---

## Migration Path Overview

```
┌─────────────────────┐
│   Standalone Mode   │
│   (Local Storage)   │
└──────────┬──────────┘
           │
           │ Export .budget file
           │
           ▼
┌─────────────────────┐
│   Create Account    │
│   (Online Version)  │
└──────────┬──────────┘
           │
           │ Import .budget file
           │
           ▼
┌─────────────────────┐
│    Online Mode      │
│   (Cloud + Local)   │
└─────────────────────┘
```

---

## Pre-Migration Checklist

Before migrating to online mode:

### 1. Export Your Data

```
Settings > Data > Export Backup
- [x] Include all profiles
- [x] Include activity log
- [x] Enable encryption (recommended)
- [x] Save password securely
```

### 2. Review Your Profiles

- [ ] All profiles named appropriately
- [ ] PINs set for profiles that need protection
- [ ] Activity log reviewed and cleared if needed

### 3. Verify Export Integrity

```
Settings > Data > Import Preview
- Upload your export file
- Verify record counts match
- Check for any validation errors
```

---

## Migration Steps

### Step 1: Create Online Account

1. Visit the online version URL
2. Click "Create Account"
3. Provide email and password
4. Verify email address
5. Complete profile setup

### Step 2: Import Standalone Data

1. Go to Settings > Data > Import
2. Select your .budget export file
3. Enter decryption password (if encrypted)
4. Review import preview
5. Choose conflict resolution:
   - **Skip**: Keep existing data (if any)
   - **Overwrite**: Replace with imported data
   - **Rename**: Create copies with new IDs

### Step 3: Configure Online Features

1. **Enable Cloud Sync**
   - Settings > Sync > Enable
   - Choose sync frequency

2. **Set Up Family Sharing** (optional)
   - Settings > Family > Invite
   - Enter family member emails

3. **Configure Backups**
   - Settings > Backup > Configure
   - Set backup frequency
   - Review retention policy

---

## Data Mapping

### What Transfers

| Standalone    | Online        | Notes                       |
| ------------- | ------------- | --------------------------- |
| Profiles      | User accounts | One profile → one account   |
| Transactions  | Transactions  | Full history preserved      |
| Budgets       | Budgets       | Visibility settings kept    |
| Categories    | Categories    | Including custom categories |
| Goals         | Goals         | Progress preserved          |
| Loans         | Loans         | Payment history included    |
| Subscriptions | Subscriptions | All details preserved       |
| Activity Log  | Activity Log  | Historical records          |
| Settings      | Settings      | Per-profile settings        |
| Receipts      | Receipts      | Images transferred          |

### What Changes

| Aspect         | Standalone       | Online              |
| -------------- | ---------------- | ------------------- |
| Authentication | PIN (4-6 digits) | Password + 2FA      |
| Storage        | Local IndexedDB  | Cloud + Local cache |
| Sync           | Manual export    | Automatic           |
| Sharing        | Same device      | Cross-device        |
| Backup         | Manual           | Automatic           |

### What Doesn't Transfer

- **PIN hashes**: Must set new password
- **Local settings**: Browser-specific preferences
- **Session data**: Login state

---

## Profile to Account Migration

### Standalone Profiles

```
Standalone
├── Profile: "Parent 1" (default, PIN protected)
├── Profile: "Parent 2" (PIN protected)
└── Profile: "Kid" (no PIN)
```

### Online Accounts

```
Online
├── Account: parent1@email.com (admin)
│   └── Family: "Our Budget"
│       ├── Member: parent2@email.com (editor)
│       └── Member: kid@email.com (viewer)
```

### Migration Options

**Option A: One Account, Multiple Sub-profiles**

- Create one online account
- Maintain profiles within that account
- Suitable for family device

**Option B: Multiple Accounts, Family Sharing**

- Each profile becomes separate account
- Use family sharing to connect
- Suitable for individual devices

---

## Handling Budget Visibility

### Standalone Visibility

```typescript
budget.visibility = "shared" | "private";
budget.ownerId = profileId | null;
```

### Online Visibility

```typescript
budget.visibility = 'family' | 'personal'
budget.ownerId = accountId
budget.sharedWith = [accountId, ...]
```

### Mapping Rules

| Standalone              | Online                     |
| ----------------------- | -------------------------- |
| `visibility: 'shared'`  | `visibility: 'family'`     |
| `visibility: 'private'` | `visibility: 'personal'`   |
| `ownerId: null`         | `ownerId: familyOwner`     |
| `ownerId: profileId`    | `ownerId: mappedAccountId` |

---

## Rollback Plan

If you need to return to standalone mode:

### Step 1: Export from Online

```
Settings > Data > Export
- Include all data
- Download .budget file
```

### Step 2: Import to Standalone

1. Open standalone version
2. Import the .budget file
3. Set PINs for profiles

### Step 3: Disable Online Features

```
Online Account > Settings > Danger Zone
- Disable sync
- Delete cloud data (optional)
- Close account (optional)
```

---

## Troubleshooting

### Import Fails: "Version Mismatch"

**Cause**: Export from newer app version
**Solution**: Update standalone app before exporting

### Import Fails: "Checksum Error"

**Cause**: File corrupted or modified
**Solution**: Create new export from standalone

### Import Fails: "Decryption Failed"

**Cause**: Wrong password
**Solution**: Verify password, try re-exporting

### Profiles Not Mapping Correctly

**Cause**: ID conflicts
**Solution**: Use "rename" conflict resolution

### Activity Log Missing Entries

**Cause**: Log pruning occurred
**Solution**: Export includes only most recent 500 entries

---

## Timeline & Availability

### Current Status

| Feature         | Status         |
| --------------- | -------------- |
| Standalone Mode | ✅ Available   |
| Export/Import   | ✅ Available   |
| Online Mode     | 🔜 Coming Soon |
| Cloud Sync      | 🔜 Coming Soon |
| Family Sharing  | 🔜 Coming Soon |

### Planned Milestones

1. **Phase 1**: Online accounts with cloud storage
2. **Phase 2**: Cross-device sync
3. **Phase 3**: Family sharing and invites
4. **Phase 4**: Real-time collaboration

---

## FAQ

### Will I lose my data during migration?

No. Export your data first, then import to online. Your standalone data remains until you clear it.

### Can I use both modes simultaneously?

Yes, but data won't sync automatically. Export from standalone, import to online when ready.

### What happens to my PINs?

PINs don't transfer for security. You'll set new passwords for online accounts.

### Is there a migration deadline?

No. Standalone mode will continue to work indefinitely. Migrate when ready.

### Can I migrate just some profiles?

Yes. Export/import supports selective data. You can migrate profiles one at a time.

### Will online mode cost money?

Pricing details will be announced when online mode launches. Basic features are expected to remain free.

---

## Support

For migration assistance:

- Review this documentation
- Check FAQ section
- Contact support (when available)
