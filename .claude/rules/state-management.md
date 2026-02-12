---
paths:
  - "src/contexts/**"
---

# State Management Rules

- 18 React contexts exist — check `src/contexts/` before creating new ones
- Prefer extending an existing context over adding a new one
- Every context must have a dedicated provider wrapper component
- Avoid prop drilling through more than 2 levels — use context instead
- Large contexts should be split by domain (auth, budget, ui, etc.)
- Always provide a custom hook (e.g., `useBudgetContext`) rather than exposing `useContext` directly
