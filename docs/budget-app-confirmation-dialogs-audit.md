# Budget App - Confirmation Dialogs Audit & Design

**Task ID**: `a6d31bba-08e4-4f98-ab25-eda213c23ea7`
**Date**: November 9, 2025
**Status**: Design Phase

---

## 📊 Audit Summary

### Existing Confirmation Systems Found

**TWO DIFFERENT SYSTEMS** currently in use (inconsistent):

1. **`toast.confirm()`** - Custom toast-based confirmation
   - Used in: transactions, budgets, investments, bulk categorization, unsplit
   - Pattern: `const confirmed = await toast.confirm('message'); if (!confirmed) return;`
   - Issues: Generic messages, no impact details, not using AlertDialog

2. **Native `confirm()`** - Browser confirmation dialog
   - Used in: planning/future, planning/retirement
   - Pattern: `if (!confirm('message')) return;`
   - Issues: Non-accessible, no styling control, inconsistent UX

---

## 🔍 Detailed Findings

### 1. Transactions (`src/app/budget-app/transactions/page.tsx`)

**Delete Transaction** (Lines 125-157):

```typescript
async function deleteTransaction(id: string) {
  const confirmed = await toast.confirm("Are you sure you want to delete this transaction?");
  if (!confirmed) return;

  // Complex split transaction logic
  // Shows impact for split: "This is the last split item. Restore the original transaction?"
}
```

**Issues**:

- ❌ Generic message: "Are you sure you want to delete this transaction?"
- ❌ No transaction details shown (amount, date, description)
- ✅ Shows impact for split transactions (good!)
- ❌ Not using AlertDialog component

**Unsplit Transaction** (Lines 178-192):

```typescript
async function handleUnsplit(transaction: Transaction) {
  const confirmed = await toast.confirm("Restore the original unsplit transaction?");
  if (!confirmed) return;
}
```

**Bulk Categorization** (Lines 219-250):

```typescript
async function applyBulkCategorization() {
  const confirmMessage = `Categorize ${selectedTransactionIds.size} transaction(s) as "${bulkCategory}"${bulkSubcategory ? ` - ${bulkSubcategory}` : ""}?`;
  const confirmed = await toast.confirm(confirmMessage);
  if (!confirmed) return;
}
```

**Issues**:

- ✅ Good impact message (shows count and category) - **KEEP THIS PATTERN**
- ❌ Not using AlertDialog

**Delete Triggers**:

- Desktop: Trash2 button (line 710)
- Mobile: Swipe-to-delete gesture (line 792) + Trash2 button (line 982)

---

### 2. Budgets (`src/app/budget-app/budgets/page.tsx`)

**Delete Budget** (Lines 124-136):

```typescript
async function deleteBudget(budgetId: string) {
  const confirmed = await toast.confirm("Are you sure you want to delete this budget?");
  if (!confirmed) return;

  await db.budgets.delete(budgetId);
}
```

**Issues**:

- ❌ Generic message
- ❌ No impact shown:
  - Budget amount ($X/month or $X/year)
  - Category name
  - Current spending progress (X% used, $Y spent)
  - Transaction count
- ❌ Not using AlertDialog

**Delete Trigger**: Trash2 button (line 263)

---

### 3. Investments (`src/app/budget-app/investments/page.tsx`)

**Delete Account** (Line 123):

```typescript
const confirmed = await toast.confirm("Delete this investment account and all its holdings?");
```

**Delete Holding** (Line 137):

```typescript
const confirmed = await toast.confirm("Delete this holding?");
```

**Issues**:

- ✅ Account delete shows impact: "and all its holdings" - good!
- ❌ Holding delete is generic
- ❌ No specific details (account name, balance, holding count)
- ❌ Not using AlertDialog

---

### 4. Planning - Future Purchases (`src/app/budget-app/planning/future/page.tsx`)

**Delete Goal** (Lines 51-52):

```typescript
async function deletePurchase(id: string) {
  if (!confirm("Are you sure you want to delete this goal?")) return;
}
```

**Issues**:

- ❌ **USING NATIVE confirm()** - different system!
- ❌ Generic message
- ❌ No goal details (name, target amount, saved amount, timeline)
- ❌ Non-accessible (browser default)

---

### 5. Planning - Retirement (`src/app/budget-app/planning/retirement/page.tsx`)

**Delete Plan** (Lines 258-259):

```typescript
async function deletePlan(id: string) {
  if (!confirm("Are you sure you want to delete this retirement plan?")) return;
}
```

**Issues**:

- ❌ **USING NATIVE confirm()** - different system!
- ❌ Generic message
- ❌ No plan details (name, target amount, contributions, retirement age)
- ❌ Non-accessible

---

## ✅ Excellent Example Found

**`src/components/settings/ResetProgressDialog.tsx`** (Lines 1-358)

This component demonstrates **PERFECT** confirmation dialog pattern:

```typescript
// Two-step confirmation
const [showFinalWarning, setShowFinalWarning] = useState(false);

// Step 1: Shows detailed impact
<AlertTriangle className="w-6 h-6 text-red-600" />
<strong>You will lose:</strong>
<ul>
  <li>{overallStats.totalQuestions} answered questions</li>
  <li>{totalIncorrect} questions marked for review</li>
  <li>All module progress and completion status</li>
  <li>Performance analytics and insights</li>
  <li>Study streak of {overallStats.studyStreak} days</li>
</ul>

// Step 2: Final confirmation with typed confirmation
<Alert className="border-red-200 bg-red-50/10">
  <AlertTriangle />
  <strong>Final Confirmation:</strong>
  Type "RESET" to confirm you want to permanently delete all progress.
</Alert>
<Input
  value={confirmText}
  onChange={(e) => setConfirmText(e.target.value)}
  placeholder="Type RESET to confirm"
/>

// Clear destructive action button (not "OK")
<Button variant="destructive" disabled={confirmText !== 'RESET'}>
  <AlertTriangle className="mr-2 h-4 w-4" />
  Reset Everything
</Button>

// Prominent cancel button
<Button variant="outline" onClick={() => onOpenChange(false)}>
  Cancel
</Button>
```

**Why This is Excellent**:

- ✅ Uses shadcn AlertDialog (already installed)
- ✅ Shows detailed impact with specific data
- ✅ Two-step confirmation for critical actions
- ✅ Clear destructive action labels ("Reset Everything" not "OK")
- ✅ Prominent cancel button
- ✅ Loading states during async operations
- ✅ Keyboard accessible (Escape to close)
- ✅ Focus trap (stays in dialog)

---

## 🎯 Design Solution

### Component Architecture

**Create**: `src/components/budget/ConfirmDialog.tsx`

**Design Principles** (from task requirements + ResetProgressDialog best practices):

1. **Use shadcn AlertDialog** (already installed at `src/components/ui/alert-dialog.tsx`)
2. **Show Impact** - Display what will be lost/changed with specific details
3. **Clear Labels** - "Delete Transaction" not "OK", "Cancel" not "No"
4. **Prominent Cancel** - Cancel button should be equally or more prominent than action
5. **Destructive Styling** - Use red for dangerous actions
6. **Keyboard Accessible** - Escape closes, focus trap works
7. **Loading States** - Disable buttons during async operations

### Component API Design

```typescript
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;

  // Content
  title: string;
  description: string;
  impact?: {
    title: string;
    items: string[];
  };

  // Button labels
  confirmLabel?: string; // Default: "Confirm"
  cancelLabel?: string; // Default: "Cancel"

  // Styling
  variant?: "destructive" | "default"; // Default: 'default'
  icon?: React.ReactNode; // Optional icon for title

  // Two-step confirmation (optional)
  requireTypedConfirmation?: {
    text: string; // e.g., "DELETE"
    placeholder: string; // e.g., "Type DELETE to confirm"
  };
}
```

### Usage Examples

**Transaction Delete**:

```typescript
<ConfirmDialog
  open={deleteConfirmOpen}
  onOpenChange={setDeleteConfirmOpen}
  onConfirm={async () => {
    await db.transactions.delete(transactionId);
    await loadData();
  }}
  title="Delete Transaction"
  description="This action cannot be undone."
  impact={{
    title: "You will lose:",
    items: [
      `$${Math.abs(transaction.amount).toFixed(2)} transaction from ${new Date(transaction.date).toLocaleDateString()}`,
      `Description: "${transaction.description}"`,
      transaction.category ? `Category: ${transaction.category}` : null,
      transaction.receiptUrl ? "Attached receipt" : null,
    ].filter(Boolean)
  }}
  confirmLabel="Delete Transaction"
  variant="destructive"
  icon={<Trash2 className="w-5 h-5" />}
/>
```

**Budget Delete**:

```typescript
<ConfirmDialog
  open={deleteConfirmOpen}
  onOpenChange={setDeleteConfirmOpen}
  onConfirm={async () => {
    await db.budgets.delete(budgetId);
    await loadData();
  }}
  title="Delete Budget"
  description="This will remove the budget limit for this category."
  impact={{
    title: "You will lose:",
    items: [
      `${categoryName}: $${budgetAmount.toFixed(2)}/${period}`,
      `Current progress: ${percentage.toFixed(0)}% spent ($${spent.toFixed(2)})`,
      `${transactionCount} transaction${transactionCount === 1 ? '' : 's'} will become unbudgeted`,
    ]
  }}
  confirmLabel="Delete Budget"
  variant="destructive"
/>
```

**Investment Account Delete** (Two-step):

```typescript
<ConfirmDialog
  open={deleteConfirmOpen}
  onOpenChange={setDeleteConfirmOpen}
  onConfirm={async () => {
    await db.investmentAccounts.delete(accountId);
    await loadData();
  }}
  title="Delete Investment Account"
  description="This will permanently delete the account and all associated holdings."
  impact={{
    title: "You will lose:",
    items: [
      `Account: ${accountName}`,
      `${holdingsCount} holding${holdingsCount === 1 ? '' : 's'}`,
      `Total value: $${totalValue.toFixed(2)}`,
      `All transaction history`,
    ]
  }}
  confirmLabel="Delete Account & Holdings"
  variant="destructive"
  requireTypedConfirmation={{
    text: "DELETE",
    placeholder: "Type DELETE to confirm"
  }}
/>
```

**Bulk Categorization** (Non-destructive):

```typescript
<ConfirmDialog
  open={bulkConfirmOpen}
  onOpenChange={setBulkConfirmOpen}
  onConfirm={async () => {
    await applyBulkCategorization();
  }}
  title="Bulk Categorize Transactions"
  description={`Apply "${bulkCategory}${bulkSubcategory ? ` - ${bulkSubcategory}` : ''}" to ${selectedTransactionIds.size} transaction(s)?`}
  confirmLabel="Apply to Selected"
  variant="default"
/>
```

---

## 📋 Implementation Checklist

### Phase 1: Create Component

- [ ] Create `src/components/budget/ConfirmDialog.tsx`
- [ ] Import shadcn AlertDialog components
- [ ] Implement basic structure with title, description, buttons
- [ ] Add impact list rendering
- [ ] Add optional typed confirmation (two-step)
- [ ] Add loading states
- [ ] Add keyboard handling (Escape closes)
- [ ] Add focus trap
- [ ] Test accessibility (keyboard navigation, screen reader)

### Phase 2: Replace Existing Confirmations

**Transactions** (`src/app/budget-app/transactions/page.tsx`):

- [ ] Replace `deleteTransaction()` confirmation (line 126)
- [ ] Replace `handleUnsplit()` confirmation (line 181)
- [ ] Replace `applyBulkCategorization()` confirmation (line 231)
- [ ] Update desktop delete button click handler (line 710)
- [ ] Update mobile delete button click handler (line 982)
- [ ] Handle swipe-to-delete gesture (line 792)

**Budgets** (`src/app/budget-app/budgets/page.tsx`):

- [ ] Replace `deleteBudget()` confirmation (line 125)
- [ ] Update delete button click handler (line 263)

**Investments** (`src/app/budget-app/investments/page.tsx`):

- [ ] Replace account delete confirmation (line 123)
- [ ] Replace holding delete confirmation (line 137)

**Planning - Future** (`src/app/budget-app/planning/future/page.tsx`):

- [ ] Replace native `confirm()` in `deletePurchase()` (line 52)

**Planning - Retirement** (`src/app/budget-app/planning/retirement/page.tsx`):

- [ ] Replace native `confirm()` in `deletePlan()` (line 259)

### Phase 3: Testing

- [ ] Test keyboard navigation (Tab, Escape, Enter)
- [ ] Test screen reader announcements
- [ ] Test focus trap (can't tab outside dialog)
- [ ] Test on mobile (touch interactions)
- [ ] Test loading states (disable buttons during async)
- [ ] Test two-step confirmation for critical actions
- [ ] Verify all toast.confirm() calls removed
- [ ] Verify all native confirm() calls removed

### Phase 4: Documentation

- [ ] Add JSDoc comments to ConfirmDialog component
- [ ] Update this audit document with implementation details
- [ ] Mark Archon task as "done"

---

## 🎨 Visual Design

**Destructive Actions** (Red theme):

```
┌─────────────────────────────────────┐
│ [🗑️] Delete Transaction             │
│─────────────────────────────────────│
│ This action cannot be undone.       │
│                                     │
│ ⚠️ You will lose:                   │
│ • $45.67 transaction from 11/9/25   │
│ • Description: "Grocery shopping"   │
│ • Category: Food & Dining           │
│ • Attached receipt                  │
│                                     │
│ ┌─────────┐  ┌──────────────────┐  │
│ │ Cancel  │  │ Delete Transaction │ │
│ └─────────┘  └──────────────────┘  │
│   (outline)    (red, destructive)   │
└─────────────────────────────────────┘
```

**Non-Destructive Actions** (Teal theme):

```
┌─────────────────────────────────────┐
│ Bulk Categorize Transactions        │
│─────────────────────────────────────│
│ Apply "Food & Dining - Groceries"   │
│ to 5 transaction(s)?                │
│                                     │
│ ┌─────────┐  ┌──────────────────┐  │
│ │ Cancel  │  │ Apply to Selected │ │
│ └─────────┘  └──────────────────┘  │
│   (outline)    (teal, default)      │
└─────────────────────────────────────┘
```

**Two-Step Confirmation** (Critical actions):

```
┌─────────────────────────────────────┐
│ [⚠️] Delete Investment Account      │
│─────────────────────────────────────│
│ This will permanently delete the    │
│ account and all associated holdings.│
│                                     │
│ ⚠️ You will lose:                   │
│ • Account: Vanguard Roth IRA        │
│ • 12 holdings                       │
│ • Total value: $45,234.12           │
│ • All transaction history           │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ ⚠️ Final Confirmation:        │   │
│ │ Type "DELETE" to confirm      │   │
│ │                               │   │
│ │ [____________] (input box)    │   │
│ └───────────────────────────────┘   │
│                                     │
│ ┌─────────┐  ┌──────────────────┐  │
│ │ Cancel  │  │ Delete Account   │  │
│ └─────────┘  └──────────────────┘  │
│               (disabled until typed)│
└─────────────────────────────────────┘
```

---

## 📚 Component Dependencies

**Already Installed**:

- ✅ `src/components/ui/alert-dialog.tsx` - shadcn AlertDialog (Radix UI)
- ✅ `src/components/ui/button.tsx` - shadcn Button
- ✅ `src/components/ui/input.tsx` - shadcn Input (for typed confirmation)
- ✅ `src/components/ui/alert.tsx` - shadcn Alert (for impact warnings)

**No New Dependencies Required** - Everything is already available!

---

## 🔧 Technical Notes

### toast.confirm() Implementation

The current `toast.confirm()` is likely a custom hook returning a Promise<boolean>. We need to find and potentially deprecate it:

**Search for**: `useToast` hook definition to understand current implementation
**Replace with**: New `ConfirmDialog` component + React state

### State Management Pattern

**Before** (toast.confirm):

```typescript
async function deleteTransaction(id: string) {
  const confirmed = await toast.confirm("Delete?");
  if (!confirmed) return;
  await db.transactions.delete(id);
}
```

**After** (ConfirmDialog):

```typescript
const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
const [deletingId, setDeletingId] = useState<string | null>(null);

function initiateDelete(id: string) {
  setDeletingId(id);
  setDeleteConfirmOpen(true);
}

async function confirmDelete() {
  if (!deletingId) return;
  await db.transactions.delete(deletingId);
  await loadData();
  setDeleteConfirmOpen(false);
  setDeletingId(null);
}

// In render:
<button onClick={() => initiateDelete(tx.id)}>Delete</button>

<ConfirmDialog
  open={deleteConfirmOpen}
  onOpenChange={setDeleteConfirmOpen}
  onConfirm={confirmDelete}
  {...}
/>
```

---

## ✅ Success Criteria

**Before marking task as "done"**:

1. ✅ All `toast.confirm()` calls replaced
2. ✅ All native `confirm()` calls replaced
3. ✅ ConfirmDialog component created and tested
4. ✅ Impact messages show specific details (amounts, counts, names)
5. ✅ Clear destructive action labels (not "OK")
6. ✅ Prominent cancel buttons
7. ✅ Keyboard accessible (Tab, Escape, Enter)
8. ✅ Screen reader compatible
9. ✅ Loading states work correctly
10. ✅ Two-step confirmation works for critical actions (optional)

---

**Next Steps**:

1. Create `ConfirmDialog.tsx` component
2. Test component in isolation (keyboard, screen reader)
3. Replace confirmations systematically (transactions first)
4. Test each page after replacement
5. Mark Archon task as "done"

---

_Last updated: November 9, 2025_
_Archon Task: `a6d31bba-08e4-4f98-ab25-eda213c23ea7`_
