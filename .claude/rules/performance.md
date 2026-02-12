---
paths:
  - "src/**"
---

# Performance Rules

- Use dynamic `import()` for heavy components (charts, PDF viewers, editors)
- Images: use `next/image` with proper `width`/`height` and `priority` for LCP
- Bundle: no new dependencies over 50KB without justification
- Avoid re-renders: memoize expensive computations with `useMemo`, callbacks with `useCallback`
- Lazy load below-fold content and modals
- Webpack dev requires 8GB+ memory — respect `cross-env` settings in `package.json`
- Avoid importing entire libraries when tree-shakable submodules exist (e.g., `lodash/get` not `lodash`)
