---
name: feature-flag-ops
description: Use when adding new feature flags, managing gradual feature rollout, toggling features between standalone/online modes, or implementing "coming soon" UI.
---

# Feature Flag Operations

## Overview

Manages the feature flag system that controls which features are active in the budget app. Flags support mode-based activation (standalone vs. online), gradual rollout, and "coming soon" indicators. The system uses a JSON config file as the source of truth with a TypeScript API for runtime checks.

## When to Use

- Adding a new feature that should be toggleable
- Implementing "coming soon" placeholders for planned features
- Switching features between standalone and online modes
- Setting up A/B tests or gradual rollout
- Checking which features are currently enabled

## Core Principles

- **`features.json` is the source of truth** — All flag definitions live here
- **`features.ts` is the API** — All runtime checks go through `isFeatureEnabled()`
- **Default to off** — New features start disabled until verified
- **Mode-aware** — Flags can be active in standalone, online, or both modes
- **No dead flags** — Remove flags once a feature is fully shipped and stable

## Workflow

### Step 1: Define Feature Flag in JSON

Add to `src/config/features.json`:

```json
{
  "features": {
    "existing-feature": { ... },
    "my-new-feature": {
      "name": "My New Feature",
      "description": "Brief description of what this flag controls",
      "enabled": false,
      "mode": "standalone",
      "category": "budget",
      "rolloutPercentage": 0,
      "metadata": {
        "ticket": "GH-123",
        "addedDate": "2025-06-01"
      }
    }
  }
}
```

Flag properties:
- `enabled`: boolean — master on/off switch
- `mode`: `"standalone"` | `"online"` | `"both"` — which app mode
- `category`: `"budget"` | `"lms"` | `"system"` — for grouping
- `rolloutPercentage`: 0-100 — for gradual rollout (0 = flag-only, 100 = everyone)

### Step 2: Check Flag in Code

Use the TypeScript API from `features.ts`:

```ts
import { isFeatureEnabled, getEnabledFeatures } from '@/config/features';

// Simple boolean check
if (isFeatureEnabled('my-new-feature')) {
  return <NewFeatureComponent />;
}

// Get all enabled features (for debugging)
const enabled = getEnabledFeatures();
console.log('Active features:', enabled);
```

### Step 3: "Coming Soon" UI Pattern

For features that are planned but not yet implemented:

```tsx
import { isFeatureEnabled } from '@/config/features';

function InvestmentSection() {
  if (!isFeatureEnabled('investment-tracker')) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Investment Tracker
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Track your investment portfolio and net worth.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <InvestmentTracker />;
}
```

### Step 4: Mode-Based Activation

Handle standalone vs. online mode:

```ts
import { isFeatureEnabled } from '@/config/features';

// This feature only works in online mode (needs server)
if (isFeatureEnabled('bank-sync')) {
  return <PlaidLinkButton />;
}

// This feature works in both modes
if (isFeatureEnabled('budget-calculator')) {
  return <BudgetCalculator />;
}
```

### Step 5: Gradual Rollout

For features being tested with a subset of users:

```ts
// In features.json
{
  "bank-sync-v2": {
    "enabled": true,
    "rolloutPercentage": 25,  // 25% of users
    // ...
  }
}

// The isFeatureEnabled() function handles percentage calculation
// based on a stable user hash
```

### Step 6: Removing a Feature Flag

When a feature is stable and fully shipped:

1. Remove the flag from `features.json`
2. Remove all `isFeatureEnabled('flag-name')` checks
3. Keep the feature code, remove the conditional wrappers
4. Update any "Coming Soon" UI to show the full feature

## Key Files

| File | Role |
|------|------|
| `src/config/features.json` | Feature flag definitions (source of truth) |
| `src/config/features.ts` | Runtime API (`isFeatureEnabled()`, `getEnabledFeatures()`) |
| `src/components/budget/` | Components that check feature flags |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Checking flag via direct JSON import | Use `isFeatureEnabled()` API — it handles mode/rollout logic |
| Leaving dead flags after full rollout | Remove flag + conditionals when feature is stable |
| No "Coming Soon" UI for disabled features | Always show placeholder with badge for planned features |
| Forgetting mode property | Always specify `mode: "standalone" | "online" | "both"` |
| Feature flag for trivial changes | Only use flags for features that need gradual rollout or mode control |

## Validation Checklist

- [ ] Flag added to `features.json` with all required properties
- [ ] Code uses `isFeatureEnabled()` (not direct JSON import)
- [ ] "Coming Soon" UI shown when flag is disabled
- [ ] Mode property correctly set (standalone/online/both)
- [ ] Tests pass with flag both enabled and disabled
- [ ] Flag documented with ticket/date metadata

## Related Skills

- `code-review-budget` — feature flag checks in code review
- `launch-planner` — determining when to enable flags
- `roadmap-builder` — planning feature flag lifecycle
