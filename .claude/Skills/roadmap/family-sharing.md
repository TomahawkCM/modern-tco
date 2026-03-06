---
name: family-sharing
description: Use when implementing family groups, shared budgets, multi-user permissions, or household financial management features.
---

# Family Sharing

## Overview

Implements household financial management with a mine/yours/ours model. Family members can have personal budgets plus shared household budgets with configurable visibility and permissions. Supports group creation, invite flows, and per-member activity feeds.

## When to Use

- Building family group creation and management
- Implementing shared budget categories
- Adding invite and permission flows
- Creating mine/yours/ours budget visibility
- Building per-member activity feeds
- Handling conflict resolution for shared edits

## Core Principles

- **Mine/Yours/Ours** — Three-tier visibility: personal (private), partner (shared with one), household (visible to all)
- **Permission levels** — Admin, Member, Viewer with clear capability boundaries
- **Encrypted sharing** — Shared data encrypted with group key, not individual keys
- **Invite-only** — No automatic family detection; explicit invite required
- **Independent accounts** — Each member maintains their own encryption key for personal data

## Workflow

### Step 1: Family Group Model

```ts
interface FamilyGroup {
  id: string;
  name: string;
  createdAt: string;
  members: FamilyMember[];
  sharedCategories: string[];      // Category IDs visible to all
  groupEncryptionKeyId: string;    // Encrypted group DEK
}

interface FamilyMember {
  userId: string;
  displayName: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
  personalCategories: string[];    // Categories only they see
  publicKey: string;               // For encrypting group key to this member
}

type BudgetVisibility = 'personal' | 'shared' | 'household';
```

### Step 2: Invite Flow

```ts
// Admin generates invite
async function createInvite(groupId: string, role: FamilyMember['role']): Promise<string> {
  const inviteCode = crypto.randomUUID().slice(0, 8).toUpperCase();
  await supabase.from('family_invites').insert({
    code: inviteCode,
    group_id: groupId,
    role,
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days
    used: false,
  });
  return inviteCode;
}

// Member accepts invite
async function acceptInvite(code: string, userId: string): Promise<FamilyGroup> {
  const { data: invite } = await supabase
    .from('family_invites')
    .select('*')
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (!invite) throw new Error('Invalid or expired invite code');

  // Add member to group
  await supabase.from('family_members').insert({
    group_id: invite.group_id,
    user_id: userId,
    role: invite.role,
  });

  // Exchange group encryption key (encrypted with new member's public key)
  await shareGroupKey(invite.group_id, userId);

  // Mark invite as used
  await supabase.from('family_invites').update({ used: true }).eq('code', code);

  return getGroup(invite.group_id);
}
```

### Step 3: Permission Model

```ts
const PERMISSIONS: Record<FamilyMember['role'], string[]> = {
  admin: [
    'manage-members',
    'manage-categories',
    'view-all-transactions',
    'edit-shared-budgets',
    'create-shared-goals',
    'remove-members',
    'delete-group',
  ],
  member: [
    'view-shared-transactions',
    'add-transactions',
    'edit-own-transactions',
    'view-shared-budgets',
    'view-shared-goals',
  ],
  viewer: [
    'view-shared-transactions',
    'view-shared-budgets',
    'view-shared-goals',
  ],
};

function hasPermission(member: FamilyMember, permission: string): boolean {
  return PERMISSIONS[member.role].includes(permission);
}
```

### Step 4: Mine/Yours/Ours Budget View

```tsx
function HouseholdBudget({ group, currentUser }: Props) {
  const categories = useBudgetCategories();

  const personal = categories.filter(c => c.visibility === 'personal' && c.ownerId === currentUser.id);
  const shared = categories.filter(c => c.visibility === 'shared');
  const household = categories.filter(c => c.visibility === 'household');

  return (
    <div className="space-y-6">
      <Section title="Household Budget" categories={household} editable={hasPermission(currentUser, 'edit-shared-budgets')} />
      <Section title="Shared with Partner" categories={shared} editable />
      <Section title="My Personal Budget" categories={personal} editable />
    </div>
  );
}
```

### Step 5: Group Key Management

```ts
// When creating a group, generate a group DEK
async function createGroupKey(groupId: string, adminUserId: string): Promise<void> {
  // Generate group data encryption key
  const groupDEK = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Export and encrypt with admin's public key
  const rawKey = await crypto.subtle.exportKey('raw', groupDEK);
  const adminPublicKey = await getPublicKey(adminUserId);
  const encryptedGroupKey = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    adminPublicKey,
    rawKey
  );

  // Store encrypted group key
  await supabase.from('group_keys').insert({
    group_id: groupId,
    user_id: adminUserId,
    encrypted_key: arrayBufferToBase64(encryptedGroupKey),
  });
}

// Share group key with new member
async function shareGroupKey(groupId: string, newMemberId: string): Promise<void> {
  // Admin decrypts group key, re-encrypts with new member's public key
  const groupDEK = await decryptGroupKey(groupId);
  const memberPublicKey = await getPublicKey(newMemberId);
  const encryptedForMember = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    memberPublicKey,
    groupDEK
  );

  await supabase.from('group_keys').insert({
    group_id: groupId,
    user_id: newMemberId,
    encrypted_key: arrayBufferToBase64(encryptedForMember),
  });
}
```

### Step 6: Activity Feed

```tsx
function FamilyActivityFeed({ groupId }: Props) {
  const activities = useFamilyActivity(groupId);

  return (
    <div className="space-y-2">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-center gap-3 py-2">
          <Avatar member={activity.member} size="sm" />
          <div>
            <p className="text-sm">
              <span className="font-medium">{activity.member.displayName}</span>
              {' '}{activity.description}
            </p>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Key Files

| File | Role |
|------|------|
| `src/lib/encryption/` | Group key management, shared encryption |
| `src/contexts/` | Family context, shared budget context |
| `src/app/api/` | Family API routes |
| `src/components/budget/` | Family UI components |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Sharing personal encryption keys | Use separate group DEK for shared data |
| No invite expiration | Invites expire after 7 days |
| Viewers can edit | Enforce permissions on both UI and API |
| All data shared by default | Personal data private by default; user opts into sharing |
| No activity audit trail | Log all shared budget changes with member attribution |

## Validation Checklist

- [ ] Group key management uses asymmetric encryption for key exchange
- [ ] Personal data stays encrypted with personal key
- [ ] Shared data encrypted with group key
- [ ] Permission checks on all shared operations
- [ ] Invite flow with expiration and single-use codes
- [ ] Mine/Yours/Ours visibility works correctly
- [ ] Activity feed shows member actions
- [ ] Member removal revokes group key access

## Related Skills

- `e2e-encryption` — group key management patterns
- `real-time-sync` — syncing shared data between family members
- `supabase-patterns` — RLS policies for family sharing
