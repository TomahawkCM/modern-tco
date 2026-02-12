---
name: tensorflowjs-budget-ml
description: Use when adding, modifying, testing, or debugging any TensorFlow.js or ML feature in the budget app. Covers model architecture, data preparation, privacy gates, tensor memory management, training patterns, IndexedDB model storage, and the categorization priority chain. Also use when upgrading statistical analytics (anomaly detection, forecasting) to ML approaches.
---

# TensorFlow.js Budget ML

## Overview

The budget app uses TensorFlow.js for client-side machine learning with two production models (LSTM spending predictor, Dense NN transaction categorizer) plus statistical analytics (Z-score anomaly detection, linear regression forecasting, rolling averages). All ML runs in-browser — no data leaves the device.

**Core principle**: Rule-based first, ML as enhancement, statistics as fallback.

**When to use this skill**:
- Adding a new ML model or feature
- Modifying existing LSTM or categorizer
- Debugging tensor memory leaks or training issues
- Upgrading a statistical method to an ML approach
- Writing tests for ML code
- Reviewing privacy compliance of ML features

## Key Files

| File | Role |
|------|------|
| **TensorFlow.js Models** | |
| `src/lib/analytics/lstm-predictive-spending.ts` | LSTM time-series forecasting (monthly spending by category) |
| `src/lib/categorization/ml-categorizer.ts` | Dense NN transaction categorizer (bag-of-words → softmax) |
| `src/lib/categorization/training-data-generator.ts` | Synthetic training data from rules, one-hot encoding |
| **Categorization Chain** | |
| `src/lib/categorization/rules.ts` | Rule-based categorizer + hybrid ML fallback orchestration |
| `src/lib/vendor-learning.ts` | Vendor learning (user corrections → persistent per-merchant memory) |
| **Statistical Analytics** | |
| `src/lib/analytics/anomaly-detector.ts` | Z-score outlier detection (ML upgrade candidate) |
| `src/lib/analytics/spending-insights.ts` | 3-month rolling average spending insights |
| `src/lib/analytics/trend-forecasting.ts` | Linear regression with 30-day projections |
| **Data Layer** | |
| `src/lib/budget-db.ts` | Dexie.js IndexedDB (stores transactions, prediction accuracy) |
| `src/lib/encryption/encrypted-db-wrapper.ts` | AES-GCM transparent encryption proxy for Dexie tables |
| `src/lib/budget-privacy-settings.ts` | Privacy settings interface (gates all ML features) |
| **Types** | |
| `src/types/budget.ts` | `Transaction`, `CategorizationResult`, `CategoryRule` |

---

## Architecture Patterns

### Model Summary

| | LSTM Spending Predictor | Dense NN Categorizer |
|---|---|---|
| **File** | `lstm-predictive-spending.ts` | `ml-categorizer.ts` |
| **Architecture** | LSTM(64) → Dropout(0.2) → LSTM(32) → Dense(1) | Dense(64,relu) → Dropout(0.3) → Dense(32,relu) → Dropout(0.2) → Dense(N,softmax) |
| **Input** | `[sequenceLength, 1]` — monthly spend amounts | `[100]` — bag-of-words vector |
| **Output** | `[1]` — next month predicted amount | `[N]` — category probabilities |
| **Loss** | `meanSquaredError` | `categoricalCrossentropy` |
| **Optimizer** | `adam(0.001)` | `adam(0.001)` |
| **Epochs** | 50 | 50 |
| **Batch** | 32 | 32 |
| **Storage** | In-memory `Map` cache only | `indexeddb://budget-categorizer` + localStorage metadata |
| **Fallback** | Simple average (6-month) | Rule-based → `'Miscellaneous'` |

### Categorization Priority Chain

The hybrid categorizer in `rules.ts:categorizeTransactionHybrid()` follows this priority:

```
1. Vendor Learning (confidence: 0.99)     ← User corrections, highest priority
   ↓ no match
2. Rule-Based (confidence: 0.85-0.95)     ← Regex patterns in CATEGORY_RULES[]
   ↓ no match
3. ML Categorizer (threshold: 0.6)        ← Dense NN, dynamic import
   ↓ no match or confidence < 0.6
4. Fallback: 'Miscellaneous' (confidence: 0.5)
```

### Model Creation Pattern

Both models use `tf.sequential()`:

```typescript
// LSTM pattern (lstm-predictive-spending.ts)
const model = tf.sequential({
  layers: [
    tf.layers.lstm({ units, returnSequences: true, inputShape: [sequenceLength, 1] }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.lstm({ units: units / 2, returnSequences: false }),
    tf.layers.dense({ units: 1 }),
  ],
});
model.compile({
  optimizer: tf.train.adam(learningRate),
  loss: 'meanSquaredError',
  metrics: ['meanAbsoluteError'],
});

// Dense NN pattern (ml-categorizer.ts)
const model = tf.sequential();
model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [inputSize] }));
model.add(tf.layers.dropout({ rate: 0.3 }));
model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
model.add(tf.layers.dropout({ rate: 0.2 }));
model.add(tf.layers.dense({ units: outputSize, activation: 'softmax' }));
model.compile({
  optimizer: tf.train.adam(0.001),
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy'],
});
```

### Inference Pattern

Always: create tensor → predict → extract data → dispose.

```typescript
// From ml-categorizer.ts:predict()
const vector = this.vectorizer.transform(description);
const inputTensor = tf.tensor2d([vector]);
const prediction = this.model.predict(inputTensor) as tf.Tensor;
const probabilities = await prediction.data();

// Extract result BEFORE disposing
const category = oneHotToCategory(Array.from(probabilities), this.categories);
const confidence = Math.max(...probabilities);

// ALWAYS dispose
inputTensor.dispose();
prediction.dispose();
```

### Singleton & Cache Patterns

```typescript
// Module-level singleton (ml-categorizer.ts)
let mlCategorizerInstance: MLCategorizer | null = null;
export function getMLCategorizer(): MLCategorizer {
  if (!mlCategorizerInstance) {
    mlCategorizerInstance = new MLCategorizer();
  }
  return mlCategorizerInstance;
}

// Map-based model cache (lstm-predictive-spending.ts)
const modelCache: Map<string, tf.LayersModel> = new Map();
const cacheKey = `${category}_${config.sequenceLength}_${config.units}`;
if (modelCache.has(cacheKey)) return modelCache.get(cacheKey)!;
// ...train...
modelCache.set(cacheKey, model);

// Cache cleanup
export function clearModelCache(): void {
  modelCache.forEach((model) => model.dispose());  // Dispose models!
  modelCache.clear();
}
```

---

## Data Preparation

### Transaction Data from IndexedDB

Transactions come from Dexie.js with optional encryption. Read through the encryption wrapper — never query IndexedDB directly for PII:

```typescript
// Data flows: Dexie table → encrypted-db-wrapper (auto-decrypt) → Transaction[]
// The LSTM and categorizer receive plain Transaction[] after decryption
```

### Time-Series Preparation (LSTM)

From `lstm-predictive-spending.ts:prepareTimeSeriesData()`:

```typescript
// 1. Filter by category and date range
// 2. Group by month key: "YYYY-MM"
// 3. Fill missing months with 0 (gap-filling is critical)
// 4. Return number[] of monthly totals

const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
monthlyTotals.set(monthKey, current + Math.abs(tx.amount));

// Fill gaps — iterate month by month from start to now
while (currentDate <= now) {
  data.push(monthlyTotals.get(monthKey) || 0);  // 0 for missing months
  currentDate.setMonth(currentDate.getMonth() + 1);
}
```

### Normalization (Min-Max to [0,1])

```typescript
// From lstm-predictive-spending.ts
function normalizeData(data: number[]): { normalized: number[]; min: number; max: number } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;  // Avoid division by zero
  return { normalized: data.map((v) => (v - min) / range), min, max };
}

function denormalizeData(normalized: number, min: number, max: number): number {
  return normalized * (max - min || 1) + min;
}
```

**Important**: Always save `min` and `max` alongside the model for denormalization during inference.

### Text Vectorization (Bag-of-Words)

From `ml-categorizer.ts:TextVectorizer`:

```typescript
// 1. fit(): count word frequencies → keep top 100 → build word→index Map
// 2. transform(): text → tokenize → count occurrences → fixed-length vector

// Tokenization: lowercase → remove non-alphanumeric → split on whitespace → filter length > 2
private tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}
```

### One-Hot Encoding (Categories)

From `training-data-generator.ts`:

```typescript
export function categoryToOneHot(category: string, allCategories: string[]): number[] {
  const oneHot = new Array(allCategories.length).fill(0);
  const index = allCategories.indexOf(category);
  if (index !== -1) oneHot[index] = 1;
  return oneHot;
}

export function oneHotToCategory(oneHot: number[], allCategories: string[]): string {
  const maxIndex = oneHot.indexOf(Math.max(...oneHot));
  return allCategories[maxIndex] || 'Miscellaneous';
}
```

### Sequence Creation (LSTM Sliding Window)

```typescript
// From lstm-predictive-spending.ts:createSequences()
// Given normalized monthly data [m1, m2, m3, m4, m5, m6, m7]
// With sequenceLength=6, produces:
//   input: [m1,m2,m3,m4,m5,m6] → output: m7

for (let i = sequenceLength; i < data.length; i++) {
  inputs.push(data.slice(i - sequenceLength, i));
  outputs.push(data[i]);
}
```

---

## Model Storage

### IndexedDB Persistence

Used by the Dense NN categorizer:

```typescript
// Save
await model.save('indexeddb://budget-categorizer');
localStorage.setItem('categorizer-vocabulary', JSON.stringify(Array.from(vocabulary.entries())));
localStorage.setItem('categorizer-categories', JSON.stringify(categories));

// Load
const model = await tf.loadLayersModel('indexeddb://budget-categorizer');
const vocab = new Map(JSON.parse(localStorage.getItem('categorizer-vocabulary')!));
const categories = JSON.parse(localStorage.getItem('categorizer-categories')!);
```

### In-Memory Cache

Used by the LSTM predictor:

```typescript
const modelCache: Map<string, tf.LayersModel> = new Map();
// Key pattern: `${category}_${sequenceLength}_${units}`
```

### When to Use Which

| Storage | Use Case | Reason |
|---------|----------|--------|
| `indexeddb://` | Models trained once, reused across sessions | Persistent, survives page reload |
| In-memory `Map` | Models retrained frequently with fresh data | Fast, no persistence overhead |
| localStorage | Metadata (vocabulary, categories, normalization params) | Small, synchronous access |

---

## Privacy-First Guidelines

### Hard Rules

1. **No external API calls**: TF.js models run 100% client-side. Never `fetch()` model weights or training data from a server.
2. **Check privacy settings**: Every ML feature must be gated behind its privacy setting.
3. **SSR guard**: Always check `typeof window === 'undefined'` before accessing localStorage or TF.js.

### Privacy Settings Integration

From `src/lib/budget-privacy-settings.ts`:

| Setting | Gates | Default |
|---------|-------|---------|
| `enablePredictiveSpending` | LSTM spending predictions | `true` |
| `enableAnomalyDetection` | Z-score anomaly alerts | `true` |
| `enableAIFeatures` | Master switch for OpenAI features | `true` |
| `enableSmartDuplicateDetection` | ML-enhanced duplicate matching | `true` |

### Privacy Gate Pattern

Every ML module exports an `is[Feature]Enabled()` function:

```typescript
// Pattern from lstm-predictive-spending.ts
export function isPredictiveSpendingEnabled(): boolean {
  if (typeof window === 'undefined') return false;  // SSR guard

  try {
    const settings = localStorage.getItem('budget-app-privacy-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.enablePredictiveSpending === true;
    }
  } catch (error) {
    console.warn('[Feature] Failed to check privacy settings:', error);
  }

  return false;  // Default: disabled if settings missing
}
```

**For new ML features**: Add a new boolean to the `PrivacySettings` interface in `budget-privacy-settings.ts`, set a sensible default, and export a corresponding `is[Feature]Enabled()` check.

### Multi-Profile Considerations

Transactions have an `accountId` field. When querying training data, always filter by the current user's accounts to prevent cross-profile data leakage:

```typescript
const userTransactions = transactions.filter(tx => userAccountIds.includes(tx.accountId));
```

---

## Performance

### Lazy Loading TF.js

TF.js is ~1MB+ gzipped. Never import at the top level of a component or page:

```typescript
// WRONG — blocks page load
import * as tf from '@tensorflow/tfjs';

// CORRECT — dynamic import when needed
const { getMLCategorizer } = await import('./ml-categorizer');

// CORRECT — in the module itself, top-level is fine (the module is lazy-loaded)
// lstm-predictive-spending.ts imports tf at top level, but the module is only
// imported dynamically via: await import('@/lib/analytics/lstm-predictive-spending')
```

The hybrid categorizer in `rules.ts` already uses this pattern:

```typescript
const { getMLCategorizer } = await import('./ml-categorizer');
```

### Memory Management

TF.js tensors must be manually disposed. Three patterns:

```typescript
// 1. Manual dispose (used throughout codebase)
const tensor = tf.tensor2d([vector]);
const prediction = model.predict(tensor) as tf.Tensor;
const data = await prediction.data();
tensor.dispose();
prediction.dispose();

// 2. tf.tidy() for synchronous operations (auto-disposes intermediates)
const result = tf.tidy(() => {
  const a = tf.tensor([1, 2, 3]);
  const b = a.mul(tf.scalar(2));
  return b;  // Only `result` survives; `a` is disposed
});
result.dispose();  // Still need to dispose the return value

// 3. Model disposal on cache clear
modelCache.forEach((model) => model.dispose());
modelCache.clear();
```

**Warning**: `tf.tidy()` does NOT work with `async` code. For async operations (like `model.predict()` followed by `.data()`), use manual dispose.

### Training Settings

| Setting | LSTM | Categorizer | Notes |
|---------|------|-------------|-------|
| Epochs | 50 | 50 | Lower to 20 for retrain-on-update |
| Batch size | 32 | 32 | Increase for >10K samples |
| Validation split | 0.2 | 0.2 | Standard 80/20 |
| Learning rate | 0.001 | 0.001 | Adam default |
| Verbose | 0 | 0 | Set to 1 only for debugging |
| Shuffle | — | true | Categorizer shuffles; LSTM preserves order |

### Bundle Size Rules

- `@tensorflow/tfjs` is already a dependency — no additional justification needed
- Do NOT add `@tensorflow-models/*` packages without bundle size analysis and justification
- Prefer writing custom layers over importing pre-built model packages

---

## Testing Patterns

### Vitest + fake-indexeddb Setup

```typescript
import 'fake-indexeddb/auto';
import { describe, test, expect, beforeEach, vi } from 'vitest';
```

### TF.js Mock for Fast Unit Tests

When testing data preparation or business logic, mock TF.js to avoid slow model creation:

```typescript
vi.mock('@tensorflow/tfjs', () => ({
  sequential: vi.fn(() => ({
    add: vi.fn(),
    compile: vi.fn(),
    fit: vi.fn().mockResolvedValue({}),
    predict: vi.fn(() => ({
      data: vi.fn().mockResolvedValue(new Float32Array([0.5])),
      dispose: vi.fn(),
    })),
    evaluate: vi.fn(() => [
      { data: vi.fn().mockResolvedValue(new Float32Array([0.1])), dispose: vi.fn() },
      { data: vi.fn().mockResolvedValue(new Float32Array([0.85])), dispose: vi.fn() },
    ]),
    save: vi.fn().mockResolvedValue({}),
    dispose: vi.fn(),
  })),
  loadLayersModel: vi.fn(),
  layers: {
    lstm: vi.fn(() => ({})),
    dense: vi.fn(() => ({})),
    dropout: vi.fn(() => ({})),
  },
  train: { adam: vi.fn() },
  tensor2d: vi.fn(() => ({ dispose: vi.fn() })),
  tensor3d: vi.fn(() => ({ dispose: vi.fn() })),
  tidy: vi.fn((fn: () => unknown) => fn()),
}));
```

### Testing Data Preparation (No Mock Needed)

Data preparation functions are pure — test directly:

```typescript
import { prepareTimeSeriesData, normalizeData } from '../analytics/lstm-predictive-spending';
import { generateTrainingData, categoryToOneHot, oneHotToCategory } from '../categorization/training-data-generator';

describe('prepareTimeSeriesData', () => {
  test('fills missing months with 0', () => {
    const transactions = [
      { date: new Date('2025-01-15'), amount: -100, category: 'Food' },
      // February missing
      { date: new Date('2025-03-15'), amount: -150, category: 'Food' },
    ];
    const data = prepareTimeSeriesData(transactions as any, 'Food', 3);
    expect(data).toContain(0); // February gap-filled
  });
});

describe('normalizeData', () => {
  test('normalizes to [0, 1] range', () => {
    const { normalized } = normalizeData([100, 200, 300]);
    expect(Math.min(...normalized)).toBe(0);
    expect(Math.max(...normalized)).toBe(1);
  });

  test('handles all-equal values', () => {
    const { normalized } = normalizeData([50, 50, 50]);
    expect(normalized.every(v => v === 0)).toBe(true); // (50-50)/(50-50||1) = 0
  });
});

describe('oneHotToCategory', () => {
  test('returns category with highest probability', () => {
    const categories = ['Food', 'Transport', 'Shopping'];
    expect(oneHotToCategory([0.1, 0.8, 0.1], categories)).toBe('Transport');
  });

  test('returns Miscellaneous for empty', () => {
    expect(oneHotToCategory([], [])).toBe('Miscellaneous');
  });
});
```

### Testing Privacy Gates

```typescript
describe('isPredictiveSpendingEnabled', () => {
  beforeEach(() => localStorage.clear());

  test('returns false on server (no window)', () => {
    const original = globalThis.window;
    // @ts-expect-error — simulating SSR
    delete globalThis.window;
    expect(isPredictiveSpendingEnabled()).toBe(false);
    globalThis.window = original;
  });

  test('returns false when setting disabled', () => {
    localStorage.setItem('budget-app-privacy-settings', JSON.stringify({
      enablePredictiveSpending: false,
    }));
    expect(isPredictiveSpendingEnabled()).toBe(false);
  });

  test('returns true when setting enabled', () => {
    localStorage.setItem('budget-app-privacy-settings', JSON.stringify({
      enablePredictiveSpending: true,
    }));
    expect(isPredictiveSpendingEnabled()).toBe(true);
  });

  test('returns false on corrupted settings', () => {
    localStorage.setItem('budget-app-privacy-settings', 'not json');
    expect(isPredictiveSpendingEnabled()).toBe(false);
  });
});
```

### Testing Fallback Behavior

```typescript
describe('predictSpending fallback', () => {
  test('returns simple average when LSTM fails (insufficient data)', async () => {
    const transactions = [
      { date: new Date(), amount: -100, category: 'Food' },
    ];
    // Only 1 month of data — LSTM needs sequenceLength+1 (7)
    const predictions = await predictSpending(transactions as any, 'Food', 1);
    expect(predictions).toHaveLength(1);
    expect(predictions[0].confidence).toBe(0.5); // Fallback confidence
  });
});
```

---

## Use Cases & Architecture Recommendations

### Existing: Transaction Categorization (Dense NN)

- **Input**: Transaction description string
- **Architecture**: Bag-of-words (top 100 words) → Dense(64→32→N) → softmax
- **Training data**: Synthetic from `CATEGORY_RULES[]` regex patterns (via `training-data-generator.ts`)
- **Confidence threshold**: 0.6 (below this, falls back to `'Miscellaneous'`)
- **Storage**: `indexeddb://budget-categorizer` + localStorage for vocabulary/categories

### Existing: LSTM Spending Prediction

- **Input**: 6-month sequence of monthly category totals
- **Architecture**: LSTM(64) → Dropout → LSTM(32) → Dense(1)
- **Minimum data**: 7 months (sequenceLength + 1)
- **Confidence**: Based on 15% uncertainty estimate with 95% CI
- **Seasonal**: `detectSeasonalFactor()` adjusts for month-over-month patterns
- **Storage**: In-memory Map cache (keyed by category + config)

### Upgrade Candidate: Anomaly Detection (Z-Score → Autoencoder)

Current implementation in `anomaly-detector.ts` uses Z-score (statistical). Potential ML upgrade:

```
Current: group by merchant → calculate mean/stddev → Z-score > 2.5 → alert
Upgrade: Autoencoder NN → reconstruct "normal" transactions → high reconstruction error → anomaly
```

Autoencoder advantages: catches multi-dimensional anomalies (unusual amount AND unusual time AND unusual merchant combination). Implement only when Z-score proves insufficient.

### New Candidate: Recurring Transaction Detection

Binary classifier to detect recurring patterns:

```
Input: [amount_variance, day_of_month_variance, description_similarity, frequency_score]
Output: [is_recurring probability]
Architecture: Dense(16→8→1, sigmoid) — keep it small
```

Currently `isRecurring` is set manually. ML could auto-detect.

### Anti-Recommendations

| Idea | Why Not |
|------|---------|
| Budget optimization | Not a pattern recognition problem — use constraint solvers |
| Fraud detection | Requires cross-user data; privacy-first app has no server-side aggregation |
| NLP description cleanup | Simple regex/string manipulation already works; TF.js NLP models are too heavy |

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Top-level `import * as tf` in React component | Dynamic `import()` — TF.js is 1MB+, blocks render |
| Not disposing tensors after `.predict()` | Always `inputTensor.dispose()` and `prediction.dispose()` |
| Using `tf.tidy()` with async code | `tf.tidy()` is sync-only; use manual dispose for async |
| Training without checking data length | Check `data.length >= sequenceLength + 1` before LSTM training |
| Storing model weights in localStorage | Use `indexeddb://` — localStorage has 5MB limit |
| Hardcoding category list | Use `getUniqueCategories()` from training data |
| Skipping the privacy gate check | Every ML feature needs `is[Feature]Enabled()` + SSR guard |
| Not handling model load failure | `loadLayersModel()` throws if no saved model — catch and retrain |
| Missing `verbose: 0` in production training | Set `verbose: 0` to avoid console spam; `1` only for debug |
| Forgetting fallback when ML fails | LSTM falls back to simple average; categorizer falls back to rules |
| Not filling time-series gaps | Missing months must be `0`, not omitted — LSTM expects contiguous sequence |
| Creating tensors in a loop without dispose | Memory leaks — dispose inside loop or use `tf.tidy()` for sync loops |

## Red Flags: Stop and Review

- `import * as tf` at top level of a page/component (not a dedicated ML module)
- No `dispose()` call after `predict()` or tensor creation
- `model.fit()` without `verbose: 0` in production code
- `localStorage.setItem()` for model weights (use IndexedDB)
- Missing `typeof window === 'undefined'` check in privacy gate
- `fetch()` call in an ML module (all ML is local-only)
- New `@tensorflow-models/*` dependency without bundle size justification
- Hardcoded category array instead of deriving from training data
- `tf.tidy()` wrapping an `async` function
- No fallback path when ML prediction fails or returns low confidence

## Validation Checklist

Before shipping any ML feature:

- [ ] Privacy gate: `is[Feature]Enabled()` function exported and checked before any ML call
- [ ] SSR guard: `typeof window === 'undefined'` returns safe default (false/null)
- [ ] No network calls: grep for `fetch(` in the ML module — must be zero
- [ ] Tensor cleanup: every `tf.tensor*()` and `model.predict()` has a matching `.dispose()`
- [ ] Fallback: ML failure returns reasonable non-ML result (average, rules, null)
- [ ] Minimum data check: training throws/skips if insufficient data
- [ ] Dynamic import: TF.js module is loaded via `await import()`, not static import in components
- [ ] Model storage: large models use `indexeddb://`, metadata uses localStorage
- [ ] Normalization params saved: `min`/`max` or vocabulary stored alongside model
- [ ] Tests: data preparation tested without TF.js mock; full pipeline tested with mock
- [ ] Confidence threshold: predictions below threshold fall back to non-ML path
- [ ] `verbose: 0` in `model.fit()` for production
- [ ] Cache cleanup: `clearModelCache()` or equivalent disposes models, not just clears the Map
