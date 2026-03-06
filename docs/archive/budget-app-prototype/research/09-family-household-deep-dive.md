# Family & Household Collaboration — Deep Dive

## Overview

Household collaboration lets multiple family members (partners, spouses, roommates) share a single budget space while maintaining individual privacy where needed. This is a **Phase 2** deliverable and the core value of the **Family tier ($89/year)**.

## Competitive Landscape for Family Features

| App                  | Multi-User       | Shared Budgets  | Individual Privacy          | Role Permissions                    | Activity Feed | Price              |
| -------------------- | ---------------- | --------------- | --------------------------- | ----------------------------------- | ------------- | ------------------ |
| **Monarch Money**    | Yes              | Yes             | Filter by Owner             | No formal roles                     | No            | $100/yr per person |
| **Honeydue**         | Yes (couples)    | Yes             | Per-account sharing         | No                                  | In-app chat   | Free               |
| **Quicken Simplifi** | 2 users          | Yes (Spaces)    | No                          | Equal access                        | No            | $48/yr total       |
| **Shareroo**         | Up to 10         | Yes             | Per-expense                 | No                                  | No            | Free/$5/mo         |
| **YNAB**             | Shared login     | Yes             | No privacy                  | No                                  | No            | $109/yr            |
| **Goodbudget**       | Shared login     | Yes (envelopes) | No                          | No                                  | Notifications | $80/yr             |
| **Origin**           | 2 (Partner Mode) | Yes             | "Yours/Theirs/Ours" toggles | No                                  | No            | $5/mo              |
| **Our App**          | Up to 5          | Yes             | Per-transaction privacy     | 4 roles (Owner/Admin/Member/Viewer) | Yes           | $89/yr total       |

### What Monarch Does (Our Benchmark)

- **Filter by Owner**: Users can designate accounts and transactions as "owned by" you, your partner, or both. A dropdown filter switches between views.
- **Separate logins**: Each household member has their own login credentials.
- **Limitation**: No formal role permissions. No activity feed. Each person pays $100/year.

### What Honeydue Does Well

- **Designed for couples**: Purpose-built for two people managing money together.
- **In-app chat**: Partners can chat about financial decisions directly in the app.
- **Account-level sharing**: Choose which accounts to share with partner.
- **Free**: No cost, making it the only free couples budgeting app.

### What Origin Does Well

- **"Yours, Theirs, Ours" toggles**: Elegant three-way view that makes it easy to see individual vs shared finances.
- **Partner Mode**: Invite partner for free (doesn't double the cost).
- **Personalized toggles**: Each user can move between viewing their own, partner's, or combined finances.

### Our Competitive Advantages

1. **Up to 5 members** (not just couples — roommates, multi-generational families)
2. **4 role levels** (Owner, Admin, Member, Viewer) — no competitor has formal roles
3. **Per-transaction privacy** (not just per-account)
4. **Activity feed** with real-time updates
5. **$89/year for the whole household** (vs $200+ for a couple on Monarch)
6. **Works with E2E encryption** (no competitor offers encrypted family sharing)

---

## Household Architecture

### Data Model

```
┌─────────────────────────────────────────────────┐
│                  HOUSEHOLD                       │
│                                                  │
│  Name: "The Robinsons"                          │
│  Owner: Rob (auth.users)                        │
│  Encryption: Standard                           │
│  Created: Jan 15, 2026                          │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ MEMBERS                                  │    │
│  │                                          │    │
│  │ Rob     — Owner  (full control)         │    │
│  │ Sarah   — Admin  (manage + write)       │    │
│  │ Jamie   — Member (write)                │    │
│  │ Grandma — Viewer (read-only)            │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ SHARED DATA                              │    │
│  │                                          │    │
│  │ Accounts: Joint Checking, Savings        │    │
│  │ Budgets: Groceries, Housing, Utilities   │    │
│  │ Goals: Vacation Fund ($5,000)            │    │
│  │ Transactions: All (unless marked private)│    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ PRIVATE DATA (per member)                │    │
│  │                                          │    │
│  │ Rob:   Personal credit card, gift txns   │    │
│  │ Sarah: Side hustle income                │    │
│  │ Jamie: Personal spending account         │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Role Permissions Matrix

| Capability                | Owner | Admin           | Member | Viewer |
| ------------------------- | ----- | --------------- | ------ | ------ |
| View shared transactions  | Yes   | Yes             | Yes    | Yes    |
| View shared budgets       | Yes   | Yes             | Yes    | Yes    |
| View activity feed        | Yes   | Yes             | Yes    | Yes    |
| View net worth (combined) | Yes   | Yes             | Yes    | Yes    |
| Add transactions          | Yes   | Yes             | Yes    | No     |
| Edit own transactions     | Yes   | Yes             | Yes    | No     |
| Edit others' transactions | Yes   | Yes             | No     | No     |
| Create/edit budgets       | Yes   | Yes             | No     | No     |
| Create/edit accounts      | Yes   | Yes             | No     | No     |
| Manage categories         | Yes   | Yes             | No     | No     |
| Delete transactions       | Yes   | Yes             | No     | No     |
| Delete accounts           | Yes   | Yes             | No     | No     |
| Invite new members        | Yes   | Yes             | No     | No     |
| Remove members            | Yes   | Yes (not owner) | No     | No     |
| Change member roles       | Yes   | No              | No     | No     |
| Change household settings | Yes   | No              | No     | No     |
| Change encryption mode    | Yes   | No              | No     | No     |
| Delete household          | Yes   | No              | No     | No     |
| Mark transactions private | Yes   | Yes             | Yes    | N/A    |
| View own private data     | Yes   | Yes             | Yes    | N/A    |
| View others' private data | No    | No              | No     | No     |

### Database Schema

```sql
-- Household container
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Budget',
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  encryption_mode TEXT DEFAULT 'standard'
    CHECK (encryption_mode IN ('standard', 'e2e', 'zero_knowledge')),
  max_members INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Household membership
CREATE TABLE household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  invited_by UUID REFERENCES auth.users(id),
  invitation_email TEXT,      -- For pending invitations
  invitation_code TEXT UNIQUE, -- 8-character code for joining
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,    -- NULL = pending invitation
  UNIQUE(household_id, user_id)
);

-- Transaction ownership + privacy
-- (Added columns to existing budget_transactions table)
ALTER TABLE budget_transactions ADD COLUMN
  owner_id UUID REFERENCES auth.users(id),  -- Who created this
  is_private BOOLEAN DEFAULT false;          -- Only visible to owner
```

### RLS Policies for Household + Privacy

```sql
-- Members can see shared transactions in their household
CREATE POLICY "household_shared_read" ON budget_transactions
FOR SELECT USING (
  -- Must be in the household
  household_id IN (SELECT user_household_ids())
  AND (
    -- Either it's not private
    is_private = false
    -- Or it belongs to the current user
    OR owner_id = auth.uid()
  )
);

-- Members can only write if they have write role
CREATE POLICY "household_write" ON budget_transactions
FOR INSERT WITH CHECK (
  household_id IN (
    SELECT household_id FROM household_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin', 'member')
  )
);

-- Members can edit their own transactions, admins can edit anyone's
CREATE POLICY "household_update" ON budget_transactions
FOR UPDATE USING (
  household_id IN (SELECT user_household_ids())
  AND (
    owner_id = auth.uid()  -- Own transactions
    OR EXISTS (
      SELECT 1 FROM household_members
      WHERE user_id = auth.uid()
      AND household_id = budget_transactions.household_id
      AND role IN ('owner', 'admin')
    )
  )
);

-- Only owner and admin can delete
CREATE POLICY "household_delete" ON budget_transactions
FOR DELETE USING (
  household_id IN (
    SELECT household_id FROM household_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);
```

---

## User Flows

### Flow 1: Creating a Household

```
Rob opens Settings → Household

┌──────────────────────────────────────────┐
│  Create Your Household                    │
│                                          │
│  Name: [The Robinsons          ]         │
│                                          │
│  This creates a shared budget space      │
│  where you can invite family members     │
│  to manage finances together.            │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ Create Household                  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Requires Family plan ($89/year)         │
│                                          │
└──────────────────────────────────────────┘
```

On creation:

1. `households` row created with Rob as owner
2. `household_members` row created with role = "owner"
3. All existing data gets `household_id` assigned
4. Rob's subscription upgraded to Family plan if not already

### Flow 2: Inviting a Family Member

```
Rob opens Settings → Household → Invite Member

┌──────────────────────────────────────────┐
│  Invite to Household                      │
│                                          │
│  Email: [sarah@example.com       ]       │
│                                          │
│  Role: [Member ▼]                        │
│    • Admin — Can manage budgets, invite  │
│    • Member — Can add transactions       │
│    • Viewer — Read-only access           │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ Send Invitation                   │    │
│  └──────────────────────────────────┘    │
│                                          │
│  — OR —                                  │
│                                          │
│  Share this code: ABC-12345              │
│  [Copy Code]  [Share via...]             │
│                                          │
└──────────────────────────────────────────┘
```

**Two invitation methods:**

1. **Email invitation**: Sends email with link. Recipient clicks link, signs up/in, automatically joins household.
2. **Invitation code**: 8-character code shared via text/messaging. Recipient enters code in app to join.

### Flow 3: Accepting an Invitation

```
Sarah opens the app for the first time via invitation link:

┌──────────────────────────────────────────┐
│  You've been invited!                     │
│                                          │
│  Rob invited you to join                 │
│  "The Robinsons" household.              │
│                                          │
│  As a Member, you can:                   │
│  ✓ View shared budgets & transactions    │
│  ✓ Add your own transactions             │
│  ✓ Track shared savings goals            │
│  ✓ See the activity feed                 │
│                                          │
│  Your private transactions stay private. │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ Accept & Join                     │    │
│  └──────────────────────────────────┘    │
│  [Decline]                               │
│                                          │
└──────────────────────────────────────────┘
```

On acceptance:

1. `household_members.accepted_at` updated
2. Full sync of household data to Sarah's device
3. Sarah's IndexedDB populated with shared data
4. Rob gets notification: "Sarah joined the household"

### Flow 4: Marking a Transaction as Private

```
Sarah adds a transaction:

┌──────────────────────────────────────────┐
│  New Transaction                          │
│                                          │
│  Amount:   [$35.00              ]        │
│  Where:    [Gift Shop            ]       │
│  Category: [Shopping ▼           ]       │
│  Date:     [Feb 22, 2026         ]       │
│  Account:  [Sarah's Personal Card ▼]     │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ 🔒 Keep this private            │    │
│  │    Only you can see this         │    │
│  └──────────────────────────────────┘    │
│                                          │
│  [Save]                                  │
│                                          │
└──────────────────────────────────────────┘
```

When `is_private = true`:

- RLS policy ensures only `owner_id = auth.uid()` can see it
- Does NOT appear in shared budget totals
- Does NOT appear in activity feed
- Does NOT sync to other household members' devices
- Useful for: surprise gifts, personal purchases, sensitive spending

### Flow 5: Activity Feed

```
Dashboard → Activity Feed

┌──────────────────────────────────────────┐
│  Activity                          [⚙️]  │
│                                          │
│  Today                                   │
│  ┌──────────────────────────────────┐    │
│  │ 🟢 Sarah added $45.00            │    │
│  │    Target · Groceries             │    │
│  │    2 minutes ago                  │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │ 🔵 Rob updated budget             │    │
│  │    Dining: $300 → $350            │    │
│  │    1 hour ago                     │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │ 🟢 Sarah added $12.99            │    │
│  │    Netflix · Entertainment        │    │
│  │    3 hours ago                    │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Yesterday                               │
│  ┌──────────────────────────────────┐    │
│  │ 🟣 Jamie joined the household    │    │
│  │    5:30 PM                        │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │ 🔵 Rob created savings goal      │    │
│  │    "Vacation" — $5,000 target     │    │
│  │    2:15 PM                        │    │
│  └──────────────────────────────────┘    │
│                                          │
│  [Load more...]                          │
│                                          │
└──────────────────────────────────────────┘
```

**Activity types logged:**

- Transaction added/edited/deleted (by whom)
- Budget created/changed (old → new amount)
- Account added/removed
- Savings goal created/milestone reached
- Member joined/left household
- Role changed

**Existing infrastructure**: The `activityLog` table in IndexedDB already tracks create/update/delete actions. Extend with `user_id` and `user_name` fields for household attribution.

### Flow 6: Shared Savings Goals

```
Goals page:

┌──────────────────────────────────────────┐
│  Shared Goals                             │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ ✈️ Vacation Fund                  │    │
│  │ Target: $5,000                    │    │
│  │ Saved:  $3,200 (64%)             │    │
│  │ ████████████░░░░░░░░░ 64%        │    │
│  │                                    │    │
│  │ Contributions:                    │    │
│  │ Rob:    $2,000 ████████████       │    │
│  │ Sarah:  $1,000 ██████             │    │
│  │ Jamie:  $200   █                  │    │
│  │                                    │    │
│  │ Deadline: June 1, 2026            │    │
│  │ On track ✓ (~$450/month needed)   │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ 🏠 Home Down Payment              │    │
│  │ Target: $50,000                   │    │
│  │ Saved:  $12,500 (25%)            │    │
│  │ ████░░░░░░░░░░░░░░░░ 25%        │    │
│  │                                    │    │
│  │ Contributions:                    │    │
│  │ Rob:    $8,000                    │    │
│  │ Sarah:  $4,500                    │    │
│  └──────────────────────────────────┘    │
│                                          │
└──────────────────────────────────────────┘
```

### Flow 7: Household Dashboard

For Family plan users, the dashboard adds household-specific views:

```
Dashboard with household features:

┌──────────────────────────────────────────┐
│ Good morning, Rob           [🔔 3] [⚙️] │
│                                          │
│ View: [All ▼]  [Mine ▼]  [Sarah's ▼]   │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Household Summary — February         │ │
│ │                                      │ │
│ │ Combined Income:    $5,200           │ │
│ │ Combined Spending:  $3,800           │ │
│ │ Combined Net:       +$1,400          │ │
│ │                                      │ │
│ │ Rob:    +$800                        │ │
│ │ Sarah:  +$450                        │ │
│ │ Jamie:  +$150                        │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Recent Activity                 [→]  │ │
│ │ Sarah: $45 at Target (Groceries)     │ │
│ │ Rob: Updated Dining budget           │ │
│ │ Jamie: $12 at Starbucks (Coffee)     │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Shared Goals                    [→]  │ │
│ │ ✈️ Vacation: $3,200/$5,000 (64%)     │ │
│ │ 🏠 Down Payment: $12.5K/$50K (25%)  │ │
│ └──────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

**Key UX pattern** (inspired by Origin's "Yours/Theirs/Ours"):

- **"All"** view: Combined household finances
- **"Mine"** view: Only my accounts, transactions, budgets
- **"[Member Name]"** view: Only that member's data (if they haven't marked it private)

---

## Household + Sync Interaction

### How Household Data Syncs

```
Rob's Phone                 Supabase                 Sarah's Laptop
    |                          |                          |
    |  Rob adds $45 at Target  |                          |
    |  household_id = ABC      |                          |
    |  owner_id = Rob          |                          |
    |  is_private = false      |                          |
    |                          |                          |
    |-- POST transaction ----->| (RLS: Rob is member)     |
    |                          |-- Realtime broadcast --->|
    |                          |                          |
    |                          |  Sarah's device syncs    |
    |                          |  (RLS: Sarah is member   |
    |                          |   of household ABC,      |
    |                          |   is_private = false)     |
    |                          |                          |
    |                          |  Transaction appears on  |
    |                          |  Sarah's dashboard       |
```

**Private transaction flow:**

```
Sarah adds private gift purchase:
    |  is_private = true       |                          |
    |  owner_id = Sarah        |                          |
    |                          |                          |
    |-- POST transaction ----->| (RLS: Sarah is member)   |
    |                          |                          |
    |                          |  Rob's device syncs      |
    |                          |  RLS blocks: is_private  |
    |                          |  = true AND owner_id     |
    |                          |  != Rob's uid            |
    |                          |                          |
    |                          |  Transaction does NOT    |
    |                          |  appear on Rob's device  |
```

### Household + E2E Encryption

When E2E encryption is enabled for a household:

1. **Shared key**: One Data Encryption Key (DEK) per household, shared among all members
2. **Key distribution**: Owner generates DEK, wraps it with each member's public key (ECDH), stores wrapped keys in `encryption_keys` table
3. **Member joins**: Owner wraps DEK with new member's public key and uploads
4. **Member removed**: DEK rotated (new key generated, all data re-encrypted, new key distributed to remaining members)
5. **Private data**: Uses member's personal DEK (not shared with household)

---

## Household Management UI

### Settings → Household

```
┌──────────────────────────────────────────┐
│  Household Settings                       │
│                                          │
│  Name: [The Robinsons         ] [Save]   │
│                                          │
│  Members (3 of 5):                       │
│  ┌──────────────────────────────────┐    │
│  │ 👤 Rob         Owner    [You]    │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │ 👤 Sarah       Admin   [Edit ▼] │    │
│  │                         • Admin  │    │
│  │                         • Member │    │
│  │                         • Viewer │    │
│  │                         • Remove │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │ 👤 Jamie       Member  [Edit ▼] │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Pending Invitations:                    │
│  ┌──────────────────────────────────┐    │
│  │ ✉️ grandma@email.com  Viewer     │    │
│  │   Sent Feb 20  [Resend] [Cancel] │    │
│  └──────────────────────────────────┘    │
│                                          │
│  [+ Invite Member]                       │
│                                          │
│  ──────────────────────────              │
│                                          │
│  Encryption: Standard                    │
│  [Change Encryption Mode]                │
│                                          │
│  ⚠️ Danger Zone                          │
│  [Leave Household]                       │
│  [Delete Household] (Owner only)         │
│                                          │
└──────────────────────────────────────────┘
```

### Notification Preferences (Per Member)

```
┌──────────────────────────────────────────┐
│  Household Notifications                  │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ ☑ New transactions by others     │    │
│  │ ☑ Budget changes                 │    │
│  │ ☑ Savings goal milestones        │    │
│  │ ☐ Every transaction (too noisy)  │    │
│  │ ☑ Weekly household recap         │    │
│  │ ☑ New member joined              │    │
│  └──────────────────────────────────┘    │
│                                          │
└──────────────────────────────────────────┘
```

---

## Edge Cases

### 1. Owner Leaves or Account Deleted

- Ownership transfers to the next Admin (by `accepted_at` seniority)
- If no Admin exists, the first Member becomes Admin, then Owner
- If only one member remains, they become Owner
- If Owner deletes their account, household is preserved with new owner

### 2. Member Removed While Offline

- Removed member's device still has local data in IndexedDB
- On next sync attempt, RLS blocks all queries (no longer in `household_members`)
- App shows: "You are no longer a member of this household. Your personal data is still available."
- Member's personal (private) transactions remain accessible locally

### 3. Exceeding Member Limit

- Family plan supports 5 members
- Attempting to invite a 6th shows: "Your household has reached the maximum of 5 members. Remove a member to add someone new."
- Future: Enterprise tier for larger households/teams

### 4. Role Downgrade While Editing

- If an Admin is downgraded to Member while they have the budget editor open
- Next API call (save budget) fails with 403
- UI shows: "Your permissions have changed. You no longer have access to edit budgets."
- No data loss — unsaved changes shown with option to copy

### 5. Split Household (Divorce/Roommate Moves Out)

- Member can "Leave Household" → their shared data remains with the household
- Member gets option: "Export your personal transactions before leaving?"
- Personal (private) transactions are removed from the household
- Member starts fresh as a Free user with their exported data

### 6. Two Household Members Offline, Both Edit Same Budget

- Same conflict resolution as multi-device sync
- If both change `amount` (critical field) → conflict dialog
- If they change different fields → auto-merge
- Activity feed shows both changes for transparency

---

## Existing Infrastructure to Reuse

| Component                   | Path                                                    | What It Provides                                   |
| --------------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| Multi-profile system        | `src/lib/budget-db.ts` (profiles table)                 | Foundation for per-user data                       |
| Private/shared budgets flag | `src/config/features.ts` (`privatePublicBudgets: true`) | Feature flag already exists                        |
| Activity logging            | `src/lib/budget-db.ts` (`addActivityLog()`)             | Tracks create/update/delete with timestamps        |
| Sync engine                 | `src/lib/sync/sync-engine.ts`                           | Conflict resolution for concurrent household edits |
| Auth context                | `src/contexts/AuthContext.tsx`                          | User identity, session management                  |
| Supabase auth               | `src/utils/supabase/client.ts`                          | User accounts and sessions                         |

## Sources

- [Monarch Money: For Couples](https://www.monarch.com/for-couples)
- [Best Budgeting Apps for Couples 2025 — Penny Hoarder](https://www.thepennyhoarder.com/budgeting/best-budgeting-apps-couples/)
- [Origin Partner Mode — Fortune](https://fortune.com/article/origin-partner-mode-budget-couples/)
- [Best Budgeting Apps for Families 2026 — Family Money Adventure](https://familymoneyadventure.com/best-family-budgeting-apps/)
- [Best Budget Apps for Couples — U.S. News](https://money.usnews.com/money/personal-finance/articles/best-budget-apps-for-couples)
- [Best Budgeting Apps for Couples — Albert](https://albert.com/blog/best-budgeting-apps-for-couples-a-complete-guide)
- [Shared Family Budgeting Guide — Rocket Money](https://www.rocketmoney.com/learn/personal-finance/shared-family-budgeting-guide)
