---
name: rules-engine
description: Use when implementing automation rules for transaction categorization, tagging, alerts, or any client-side rule evaluation system.
---

# Rules Engine

## Overview

Implements a client-side rule evaluation engine for automatic transaction categorization, tagging, splitting, and alerting. Rules run entirely client-side to preserve the zero-knowledge architecture. Users define conditions (merchant contains, amount range, description regex) and actions (categorize, tag, split, alert).

## When to Use

- Building automatic transaction categorization rules
- Implementing user-defined tagging rules
- Creating alert/notification rules for spending
- Adding split transaction rules
- Importing rules from other apps (YNAB, Mint)
- Implementing rule priority and conflict resolution

## Core Principles

- **Client-side evaluation** — All rules run in-browser; no data sent to server for rule matching
- **Conditions + Actions** — Rules are `if [conditions] then [actions]` pairs
- **Priority ordering** — Rules have explicit priority; first match wins (or all-match mode)
- **Conflict detection** — Warn when rules conflict (same condition, different actions)
- **Importable** — Support importing rules from YNAB, Mint export formats

## Workflow

### Step 1: Rule Data Model

```ts
interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;        // Lower = higher priority
  matchMode: 'first' | 'all';  // Stop at first match or apply all
  conditions: RuleCondition[];
  conditionOperator: 'AND' | 'OR';
  actions: RuleAction[];
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

type RuleCondition =
  | { type: 'merchant-contains'; value: string; caseSensitive?: boolean }
  | { type: 'merchant-equals'; value: string }
  | { type: 'description-contains'; value: string }
  | { type: 'description-regex'; pattern: string }
  | { type: 'amount-greater-than'; value: string }   // Decimal string
  | { type: 'amount-less-than'; value: string }
  | { type: 'amount-between'; min: string; max: string }
  | { type: 'amount-equals'; value: string }
  | { type: 'date-day-of-week'; days: number[] }      // 0=Sun, 6=Sat
  | { type: 'date-day-of-month'; days: number[] }
  | { type: 'category-is'; value: string }
  | { type: 'is-recurring'; value: boolean };

type RuleAction =
  | { type: 'set-category'; categoryId: string }
  | { type: 'add-tag'; tag: string }
  | { type: 'remove-tag'; tag: string }
  | { type: 'set-note'; note: string }
  | { type: 'split'; splits: { categoryId: string; amount: string; percentage?: string }[] }
  | { type: 'alert'; message: string; severity: 'info' | 'warning' | 'critical' }
  | { type: 'flag-for-review' };
```

### Step 2: Rule Evaluation Engine

```ts
import Decimal from 'decimal.js';

function evaluateRule(rule: Rule, transaction: Transaction): boolean {
  if (!rule.enabled) return false;

  const results = rule.conditions.map(condition =>
    evaluateCondition(condition, transaction)
  );

  return rule.conditionOperator === 'AND'
    ? results.every(Boolean)
    : results.some(Boolean);
}

function evaluateCondition(condition: RuleCondition, tx: Transaction): boolean {
  switch (condition.type) {
    case 'merchant-contains':
      return condition.caseSensitive
        ? tx.merchant.includes(condition.value)
        : tx.merchant.toLowerCase().includes(condition.value.toLowerCase());

    case 'merchant-equals':
      return tx.merchant.toLowerCase() === condition.value.toLowerCase();

    case 'description-regex':
      return new RegExp(condition.pattern, 'i').test(tx.description);

    case 'amount-greater-than':
      return new Decimal(tx.amount).abs().gt(new Decimal(condition.value));

    case 'amount-between':
      const amt = new Decimal(tx.amount).abs();
      return amt.gte(new Decimal(condition.min)) && amt.lte(new Decimal(condition.max));

    case 'is-recurring':
      return tx.isRecurring === condition.value;

    default:
      return false;
  }
}
```

### Step 3: Apply Rules to Transactions

```ts
function applyRules(
  rules: Rule[],
  transactions: Transaction[]
): RuleResult[] {
  // Sort rules by priority (lower number = higher priority)
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
  const results: RuleResult[] = [];

  for (const tx of transactions) {
    const appliedActions: RuleAction[] = [];

    for (const rule of sortedRules) {
      if (evaluateRule(rule, tx)) {
        appliedActions.push(...rule.actions);

        // Update rule stats
        rule.lastTriggered = new Date().toISOString();
        rule.triggerCount++;

        if (rule.matchMode === 'first') break;
      }
    }

    if (appliedActions.length > 0) {
      results.push({ transactionId: tx.id, actions: appliedActions });
    }
  }

  return results;
}
```

### Step 4: Conflict Detection

```ts
function detectConflicts(rules: Rule[]): RuleConflict[] {
  const conflicts: RuleConflict[] = [];

  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      if (conditionsOverlap(rules[i].conditions, rules[j].conditions)) {
        const actionConflict = actionsConflict(rules[i].actions, rules[j].actions);
        if (actionConflict) {
          conflicts.push({
            rule1: rules[i],
            rule2: rules[j],
            conflictType: actionConflict,
            resolution: `Rule "${rules[i].name}" has higher priority (${rules[i].priority})`,
          });
        }
      }
    }
  }

  return conflicts;
}
```

### Step 5: Rule Builder UI

```tsx
function RuleBuilder({ rule, onSave }: Props) {
  return (
    <Card>
      <CardHeader>
        <Input placeholder="Rule name" value={rule.name} onChange={...} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>When {rule.conditionOperator === 'AND' ? 'ALL' : 'ANY'} conditions match:</Label>
          {rule.conditions.map((condition, i) => (
            <ConditionRow key={i} condition={condition} onChange={...} onRemove={...} />
          ))}
          <Button variant="outline" size="sm" onClick={addCondition}>+ Add Condition</Button>
        </div>
        <div>
          <Label>Then do:</Label>
          {rule.actions.map((action, i) => (
            <ActionRow key={i} action={action} onChange={...} onRemove={...} />
          ))}
          <Button variant="outline" size="sm" onClick={addAction}>+ Add Action</Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onSave(rule)}>Save Rule</Button>
      </CardFooter>
    </Card>
  );
}
```

## Key Files

| File | Role |
|------|------|
| `src/components/budget/` | Rule builder UI |
| `src/lib/` | Rule evaluation engine |
| `src/lib/ai/smart-transaction-enrichment.ts` | AI-based categorization (complementary) |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Evaluating rules server-side | Must be client-side (zero-knowledge) |
| Not sorting by priority before evaluation | Always sort by priority first |
| Regex without timeout/limit | Use safe regex patterns, limit complexity |
| Modifying transactions in-place | Return action results, apply separately |
| No conflict warnings | Detect and warn about overlapping rules |

## Validation Checklist

- [ ] All rule evaluation runs client-side
- [ ] Rules sorted by priority before evaluation
- [ ] Amount comparisons use Decimal.js
- [ ] Conflict detection warns about overlapping rules
- [ ] Rule stats tracked (last triggered, trigger count)
- [ ] User can enable/disable individual rules
- [ ] Rules stored encrypted (via EncryptedDB)
- [ ] Manual override always available (rules don't lock categorization)

## Related Skills

- `e2e-encryption` — rules stored encrypted
- `subscription-tracker` — recurring transaction detection feeds rules
- `ai-coach` — AI categorization as fallback to rules
