# Modern‑TCO Lint & Type Fix Plan (Execution‑Ready)

This plan batches fixes to cut 80–90% of errors fast, then handles the hard ones with patterns.

## Phase 0 — Baseline (once)

```powershell
# From repo root
corepack enable
pnpm -v 2>$null; if ($LASTEXITCODE -ne 0) { npm i -g pnpm }
pnpm dlx envinfo --system --binaries --browsers --npmPackages eslint,typescript,prettier

# Ensure tools locally (safe for npm too)
pnpm add -D eslint @typescript-eslint/{parser,eslint-plugin} eslint-config-next prettier eslint-config-prettier eslint-plugin-react-hooks
pnpm add -D eslint-plugin-unused-imports
```

> If you use npm, replace `pnpm` with `npm`.

## Phase 1 — Autofixable bulk (run now)

```powershell
# Run my helper (does eslint --fix, organize imports, and a clean report)
.\fix-lint.ps1
```

What gets auto‑fixed:

- **type‑only imports** → `import type { … }`
- **unused imports/vars** → removed or prefixed with `_`
- **`||` → `??`** (safer nullish coalescing) where ESLint can infer
- **object‑shorthand**, basic string concat, formatting, etc.

## Phase 2 — Quick manual patterns (apply broadly)

### A) `no-case-declarations`

Wrap each `case` body in braces:

```ts
switch (x) {
  case "A": {
    const tmp = 1; // OK
    doThing(tmp);
    break;
  }
}
```

### B) `no-floating-promises` / `no-misused-promises`

UI handlers must return `void`. Use `void` for fire‑and‑forget:

```tsx
// Bad
<Button onClick={saveAsync}>Save</Button>
// Good
<Button onClick={() => void saveAsync()}>
// or ensure the handler is `async` and awaited where valid
```

### C) React Hooks deps (`react-hooks/exhaustive-deps`)

- Wrap **handlers** in `useCallback` and **derived data** in `useMemo`.
- Add all referenced variables to the dep array or safely restructure.

```tsx
const handleSubmit = useCallback(async () => {
  /* ... */
}, [session, userId]);
useEffect(() => {
  void handleSubmit();
}, [handleSubmit]);
```

### D) Enum comparison mismatches (`no-unsafe-enum-comparison`)

Ensure BOTH sides share the enum type:

```ts
enum Mode {
  A = "A",
  B = "B",
}
const mode: Mode = Mode.A;
if (mode === Mode.B) {
  /* ... */
} // OK
```

### E) Icons / imports “defined but never used”

Delete unused imports fast (autofix handles most; remaining are conditional paths).

### F) `prefer-optional-chain` / `prefer-nullish-coalescing`

```ts
// Before
const time = (session && session.timeLimit) || 0;
// After
const time = session?.timeLimit ?? 0;
```

## Phase 3 — “any” hotspots (introduce types where used)

Create/extend domain types in a `types/` folder:

```ts
// types/study.ts
export type Question = {
  id: string;
  prompt: string;
  answers: string[];
  correctIndex: number;
  domain: TCODomain;
};

export type AssessmentSession = {
  id: string;
  questions: Question[];
  timeLimit?: number;
  startedAt: number; // epoch ms
  selections: Record<string, number | null>; // qid -> chosen index
};
```

Replace `any` at callsites:

```ts
function scoreSession(sess: AssessmentSession) {
  /* ... */
}
```

## Phase 4 — File‑specific fixes called out by the report

1. **AssessmentSession.tsx**

- Await/`void` every async call (`no-floating-promises`).
- Replace `||` → `??` for `timeLimit`, `questions.length` scalars.
- Memoize handlers used by effects.

2. **StudyGuideList.tsx**

- Brace `case` blocks.
- Convert progress math to typed helpers and use `??` for defaults.

3. **exam/exam-mode-tabs.tsx & chart.tsx**

- Replace `any` with small view models (e.g., `{ id: string; name: string; color?: string }`).
- Guard optional props via `?.` and `??`.
- Class utilities must receive `ClassValue`.

4. **Practice* and Review* components**

- Remove stray `console.log` (allow only `warn`/`error`).
- Ensure async handlers return `void` or are awaited.

## Phase 5 — Guardrails (config)

**.eslintrc.cjs (template — merge, don’t overwrite)**

```js
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { project: ["./tsconfig.json"] },
  plugins: ["@typescript-eslint", "react-hooks", "unused-imports"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  rules: {
    "unused-imports/no-unused-imports": "warn",
    "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: true } }],
    "@typescript-eslint/prefer-nullish-coalescing": ["error", { ignoreTernaryTests: true }],
    "@typescript-eslint/prefer-optional-chain": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-case-declarations": "error",
  },
};
```

**tsconfig.json (key bits)**

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": false,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Phase 6 — Verify

```powershell
pnpm run lint
pnpm run typecheck
pnpm run build
```

---

### Troubleshooting

- **Too many type errors after adding types?**
  - Introduce types gradually per module; start with `Question`, `AssessmentSession`, `TCODomain`.
- **3rd‑party `any` payloads (e.g., Supabase rows)**
  - Define minimal row shapes and cast at the API boundary only.
- **React hook dep loops**
  - Move inline functions into `useCallback`, and props derivations into `useMemo`.
