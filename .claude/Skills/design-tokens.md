---
name: design-tokens
description: Use when creating/updating design system tokens, colors, typography, spacing, or theme configuration. Enforces consistent design language across the budget app.
---

# Design Tokens

## Overview

Manages the design system foundation — spacing, colors, typography, shadows, borders, and animation tokens. All UI components derive their visual properties from these tokens, ensuring consistency between light/dark themes and across responsive breakpoints.

## When to Use

- Creating or modifying color schemes (light/dark mode)
- Adding new spacing, typography, or shadow values
- Updating Tailwind config with new design tokens
- Building a new component that needs to reference system-level styles
- Reviewing visual consistency across components

## Core Principles

- **8px grid system** — All spacing values are multiples of 8px (4px for micro-adjustments)
- **Semantic naming** — Tokens describe purpose, not value (`--color-surface-primary` not `--color-gray-100`)
- **Theme-aware** — Every color token has light and dark variants
- **Single source of truth** — Tailwind config + CSS custom properties are the canonical definitions
- **Progressive enhancement** — Base tokens → component tokens → utility overrides

## Workflow

### Step 1: Audit Existing Tokens

Check current token definitions:

```bash
# Tailwind config
cat tailwind.config.ts

# CSS custom properties
grep -r "var(--" src/app/globals.css | head -40
```

### Step 2: Define Token in CSS Custom Properties

Add semantic tokens to `src/app/globals.css`:

```css
:root {
  /* Spacing - 8px grid */
  --space-1: 0.25rem;  /* 4px - micro */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */

  /* Colors - semantic */
  --color-surface-primary: hsl(0 0% 100%);
  --color-surface-secondary: hsl(0 0% 97%);
  --color-text-primary: hsl(0 0% 9%);
  --color-text-secondary: hsl(0 0% 45%);
  --color-accent: hsl(142 76% 36%);       /* budget green */
  --color-danger: hsl(0 84% 60%);
  --color-warning: hsl(38 92% 50%);
  --color-success: hsl(142 71% 45%);

  /* Typography scale */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */

  /* Shadows */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px rgb(0 0 0 / 0.07);
  --shadow-lg: 0 10px 15px rgb(0 0 0 / 0.1);

  /* Border radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Animation */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.dark {
  --color-surface-primary: hsl(0 0% 9%);
  --color-surface-secondary: hsl(0 0% 14%);
  --color-text-primary: hsl(0 0% 95%);
  --color-text-secondary: hsl(0 0% 64%);
}
```

### Step 3: Map to Tailwind Config

Extend `tailwind.config.ts` with token references:

```ts
theme: {
  extend: {
    colors: {
      surface: {
        primary: 'var(--color-surface-primary)',
        secondary: 'var(--color-surface-secondary)',
      },
      // ...
    },
    spacing: {
      // Uses default Tailwind scale aligned to 8px grid
    },
    borderRadius: {
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
    },
  },
}
```

### Step 4: Use Tokens in Components

Always reference tokens, never hardcode values:

```tsx
// GOOD
<div className="p-4 rounded-lg bg-surface-primary text-text-primary shadow-md">

// BAD
<div className="p-[17px] rounded-[7px] bg-white text-gray-900 shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
```

### Step 5: Validate Theme Consistency

Run visual checks across light and dark modes:

```bash
# Check for hardcoded colors that should use tokens
grep -rn "bg-white\|bg-black\|bg-gray\|text-gray\|text-white\|text-black" src/components/budget/ | head -20
```

## Key Files

| File | Role |
|------|------|
| `src/app/globals.css` | CSS custom properties (token definitions) |
| `tailwind.config.ts` | Tailwind theme extension with tokens |
| `src/components/ui/` | shadcn/ui base components using tokens |
| `src/components/budget/` | Budget-specific components |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Hardcoding `bg-white`/`bg-black` | Use semantic `bg-surface-primary` |
| Using `px` values directly in components | Use spacing scale (`p-2`, `p-4`, `gap-3`) |
| Adding color without dark mode variant | Always define both `:root` and `.dark` values |
| Creating one-off shadows | Use shadow tokens (`shadow-sm`, `shadow-md`, `shadow-lg`) |
| Font size as arbitrary value `text-[15px]` | Use type scale (`text-sm`, `text-base`, `text-lg`) |

## Validation Checklist

- [ ] All new tokens added to both `:root` and `.dark`
- [ ] Spacing values are multiples of 4px (prefer 8px)
- [ ] No hardcoded color/shadow/radius values in components
- [ ] Tailwind config reflects CSS custom property updates
- [ ] Visual check in both light and dark mode
- [ ] Typography uses the defined scale

## Related Skills

- `mobile-first-ux` — responsive design system using these tokens
- `accessibility-audit` — color contrast requirements for token values
- `design-guide` — higher-level UI design principles
