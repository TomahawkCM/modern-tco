---
name: accessibility-audit
description: Use when building UI components, running accessibility checks, fixing a11y issues, or ensuring WCAG 2.1 AA compliance.
---

# Accessibility Audit

## Overview

Ensures all budget app UI meets WCAG 2.1 AA standards — keyboard navigation, screen reader compatibility, color contrast, focus management, and seniors mode. Financial apps have diverse users including seniors managing retirement finances, so accessibility is a core requirement.

## When to Use

- Building any new UI component
- Running accessibility audits on existing pages
- Fixing reported a11y issues
- Adding keyboard navigation to interactive elements
- Testing with screen readers
- Implementing seniors mode (larger text, higher contrast)

## Core Principles

- **WCAG 2.1 AA minimum** — All components must meet AA; strive for AAA
- **Keyboard-first** — Every interaction possible with keyboard alone
- **Screen reader tested** — Test with VoiceOver (Mac), NVDA (Windows), TalkBack (Android)
- **Color is never the only indicator** — Always pair with text, icon, or pattern
- **Focus visible** — Focus indicators visible in all themes (light/dark)

## Workflow

### Step 1: Component Accessibility Checklist

For every new component, verify:

```
□ Semantic HTML (button, nav, main, section, heading hierarchy)
□ ARIA labels on interactive elements without visible text
□ Keyboard focusable (Tab/Shift+Tab navigation)
□ Focus indicator visible (2px+ outline, not just color change)
□ Color contrast ≥ 4.5:1 for text, ≥ 3:1 for large text
□ Touch targets ≥ 44×44px
□ No content conveyed by color alone
□ Alt text on all meaningful images
□ Form labels associated with inputs
□ Error messages linked to fields (aria-describedby)
```

### Step 2: Keyboard Navigation

```tsx
// Use semantic HTML — buttons are keyboard-accessible by default
<button onClick={onSave}>Save</button>  // ✓ Focusable, Enter/Space activates

// NOT div with onClick
<div onClick={onSave}>Save</div>  // ✗ Not focusable, not keyboard-accessible

// Custom keyboard shortcuts
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';

function TransactionList() {
  useKeyboardNavigation({
    'j': () => focusNextItem(),       // vim-style down
    'k': () => focusPrevItem(),       // vim-style up
    'Enter': () => openSelected(),
    'Escape': () => clearSelection(),
  });
}
```

### Step 3: Focus Management

```tsx
// Focus trap for modals/dialogs
function Modal({ open, onClose, children }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      // Focus first focusable element
      const firstFocusable = contentRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent ref={contentRef}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// Skip link for main content
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}
```

### Step 4: Color Contrast

Minimum ratios (WCAG 2.1 AA):

| Element | Normal Text | Large Text (≥18px bold / ≥24px) |
|---------|-------------|--------------------------------|
| Foreground on background | 4.5:1 | 3:1 |
| UI components (borders, icons) | 3:1 | 3:1 |
| Focus indicator | 3:1 | 3:1 |

```tsx
// Check contrast programmatically
function checkContrast(foreground: string, background: string): number {
  // Returns contrast ratio (e.g., 4.5)
  const lum1 = getRelativeLuminance(foreground);
  const lum2 = getRelativeLuminance(background);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

### Step 5: Screen Reader Patterns

```tsx
// Announce dynamic content changes
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Budget amounts — read as currency
<span aria-label={`Spent $${amount} of $${budget}`}>
  ${amount} / ${budget}
</span>

// Progress bars
<div
  role="progressbar"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Budget usage: 75%"
>
  <div className="h-2 w-3/4 bg-green-500 rounded" />
</div>

// Charts — provide data table alternative
<div role="img" aria-label="Spending by category: Food 35%, Transport 20%, Entertainment 15%, Other 30%">
  <PieChart data={data} />
</div>
<details>
  <summary>View chart data as table</summary>
  <table>{/* accessible data table */}</table>
</details>
```

### Step 6: Seniors Mode

```tsx
function SeniorsMode() {
  const [seniorMode, setSeniorMode] = useState(false);

  useEffect(() => {
    if (seniorMode) {
      document.documentElement.classList.add('seniors-mode');
    } else {
      document.documentElement.classList.remove('seniors-mode');
    }
  }, [seniorMode]);
}

// In globals.css
.seniors-mode {
  --text-base: 1.125rem;   /* 18px instead of 16px */
  --text-sm: 1rem;         /* 16px instead of 14px */
  --text-xs: 0.875rem;     /* 14px instead of 12px */

  /* Increase touch targets */
  button, [role="button"], a {
    min-height: 48px;
    min-width: 48px;
  }

  /* Higher contrast */
  --color-text-secondary: hsl(0 0% 35%); /* Darker than default */
}
```

### Step 7: Testing with Tools

```bash
# Lighthouse a11y audit
npx lighthouse http://localhost:3000/budget-app --only-categories=accessibility

# axe-core via CLI
npx @axe-core/cli http://localhost:3000/budget-app

# In browser console (axe DevTools)
axe.run().then(results => console.log(results.violations));
```

## Key Files

| File | Role |
|------|------|
| `src/hooks/use-keyboard-navigation.ts` | Keyboard navigation hook |
| `src/app/globals.css` | Focus styles, seniors mode CSS |
| `src/components/ui/` | Base UI components (should all be accessible) |
| `src/components/budget/` | Budget components to audit |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `div` with `onClick` instead of `button` | Use semantic `<button>` for clickable elements |
| Removing focus outline for aesthetics | Style it differently, never remove (`outline-none` is banned) |
| Color-only status indicators (red/green) | Add icon or text label alongside color |
| Missing form labels | Every `<input>` needs associated `<label>` or `aria-label` |
| Charts without alternative text | Add `aria-label` summary + expandable data table |
| Keyboard trap in modals | Ensure Escape closes, Tab cycles within modal |

## Validation Checklist

- [ ] Lighthouse Accessibility score ≥ 90
- [ ] All pages navigable by keyboard alone
- [ ] Focus indicator visible on every interactive element
- [ ] Color contrast ≥ 4.5:1 for all text
- [ ] Screen reader announces all dynamic content changes
- [ ] Skip link present on all pages
- [ ] Form errors announced and linked to fields
- [ ] Seniors mode scales text and targets correctly
- [ ] No `outline-none` without replacement focus style

## Reference

- `references/accessibility-checklist.md` — detailed WCAG checklist

## Related Skills

- `mobile-first-ux` — touch targets overlap with a11y requirements
- `design-tokens` — color tokens must meet contrast ratios
- `test-patterns` — a11y testing patterns (axe-core integration)
