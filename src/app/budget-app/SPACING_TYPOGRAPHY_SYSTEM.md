# Budget App Spacing & Typography System

**Last Updated**: 2025-01-05
**Status**: ✅ Fully Implemented

## Overview

This document defines the spacing and typography standards for the Budget App, ensuring visual consistency, 8px grid compliance, and clear information hierarchy.

---

## Core Principles

1. **8px Grid System**: All spacing uses multiples of 8px for visual rhythm
2. **Typography Scale**: Standard Tailwind scale for consistent sizing
3. **Clear Hierarchy**: Predictable visual structure across all interfaces
4. **Accessibility**: WCAG 2.2 AA compliant spacing and text sizes

---

## Spacing System

### 8px Grid Reference

**Approved spacing values (Tailwind utilities)**:

| Tailwind Class | Pixels | REM    | Usage                                    |
| -------------- | ------ | ------ | ---------------------------------------- |
| `spacing-0`    | 0px    | 0rem   | No spacing                               |
| `spacing-2`    | 8px    | 0.5rem | Tight spacing (badges, compact elements) |
| `spacing-4`    | 16px   | 1rem   | Standard spacing (buttons, cards)        |
| `spacing-6`    | 24px   | 1.5rem | Comfortable spacing (sections)           |
| `spacing-8`    | 32px   | 2rem   | Generous spacing (page margins)          |
| `spacing-12`   | 48px   | 3rem   | Large spacing (hero sections)            |
| `spacing-16`   | 64px   | 4rem   | Extra-large spacing (page sections)      |

**Applied to**: padding (p-), margin (m-), gap (gap-), space (space-x/y-)

### Component-Specific Spacing

#### Buttons

```tsx
// ✅ Primary CTA
<button className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
  Save Changes
</button>

// ✅ Secondary button
<button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">
  Cancel
</button>

// ✅ Compact button
<button className="px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg">
  View Details
</button>

// ❌ Incorrect: Non-8px-grid spacing
<button className="px-3 py-3">Save</button> // 12px padding
```

**Button Group Spacing**:

```tsx
// ✅ Standard gap
<div className="flex gap-4">
  <button>Primary</button>
  <button>Secondary</button>
</div>

// ✅ Compact gap for inline actions
<div className="flex gap-2">
  <button>Edit</button>
  <button>Delete</button>
</div>
```

#### Cards

```tsx
// ✅ Standard card
<div className="bg-white rounded-lg border border-gray-200 p-6">
  <h3 className="text-lg font-semibold mb-4">Card Title</h3>
  <p className="text-gray-600">Content</p>
</div>

// ✅ Compact card
<div className="bg-white rounded-lg border border-gray-200 p-4">
  <h4 className="text-sm font-medium mb-2">Small Card</h4>
</div>

// ✅ Hero card with generous spacing
<div className="bg-white rounded-lg shadow-lg p-8">
  <h2 className="text-2xl font-bold mb-6">Welcome</h2>
</div>

// ❌ Incorrect: Non-8px-grid padding
<div className="p-3">Content</div> // 12px padding
```

#### Tables

```tsx
// ✅ Table cell spacing
<td className="px-4 py-2 text-sm text-gray-900">
  Transaction
</td>

// ✅ Table header spacing
<th className="px-4 py-2 text-xs font-medium text-gray-700 uppercase">
  Date
</th>

// ❌ Incorrect
<td className="px-4 py-3">Data</td> // 12px vertical padding
```

#### Forms

```tsx
// ✅ Form group spacing
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Amount
    </label>
    <input className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
  </div>
</div>

// ✅ Inline form fields
<div className="flex gap-4">
  <input className="flex-1 px-4 py-2" />
  <button className="px-6 py-2">Submit</button>
</div>

// ❌ Incorrect: Non-8px-grid gaps
<div className="space-y-3">...</div> // 12px vertical spacing
```

#### Badges & Pills

```tsx
// ✅ Standard badge
<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
  Active
</span>

// ✅ Tiny badge
<span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">
  Label
</span>

// Note: py-0.5 (2px) is acceptable for minimal UI elements
```

### Layout Spacing Patterns

```tsx
// ✅ Page layout
<div className="max-w-7xl mx-auto px-4 py-8">
  <h1 className="text-2xl font-bold mb-6">Page Title</h1>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Cards with 24px gap */}
  </div>
</div>

// ✅ Section spacing
<section className="mb-8">
  <h2 className="text-xl font-semibold mb-4">Section</h2>
</section>

// ✅ List spacing
<ul className="space-y-2">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

---

## Typography System

### Typography Scale

| Class       | Size            | Line Height    | Usage                                             |
| ----------- | --------------- | -------------- | ------------------------------------------------- |
| `text-xs`   | 12px (0.75rem)  | 16px (1rem)    | Badges, labels, captions, metadata, timestamps    |
| `text-sm`   | 14px (0.875rem) | 20px (1.25rem) | Body text, form labels, table cells, descriptions |
| `text-base` | 16px (1rem)     | 24px (1.5rem)  | Primary body text, form inputs                    |
| `text-lg`   | 18px (1.125rem) | 28px (1.75rem) | Section headings, card titles                     |
| `text-xl`   | 20px (1.25rem)  | 28px (1.75rem) | Modal headings, emphasized text                   |
| `text-2xl`  | 24px (1.5rem)   | 32px (2rem)    | Page headings, dashboard metrics                  |
| `text-3xl`  | 30px (1.875rem) | 36px (2.25rem) | Hero text, major headings                         |
| `text-4xl`  | 36px (2.25rem)  | 40px (2.5rem)  | Landing page headlines                            |

### Hierarchy Examples

```tsx
// ✅ Page heading
<h1 className="text-2xl font-bold text-gray-900 mb-6">
  Dashboard
</h1>

// ✅ Section heading
<h2 className="text-xl font-semibold text-gray-900 mb-4">
  Recent Transactions
</h2>

// ✅ Card heading
<h3 className="text-lg font-semibold text-gray-900 mb-2">
  Monthly Budget
</h3>

// ✅ Sub-heading
<h4 className="text-base font-medium text-gray-900 mb-2">
  Details
</h4>

// ✅ Body text
<p className="text-sm text-gray-700 leading-relaxed">
  This is the standard body text size used throughout the application.
</p>

// ✅ Muted text
<p className="text-sm text-gray-600">
  Secondary information or descriptions
</p>

// ✅ Metadata
<span className="text-xs text-gray-500">
  Last updated: 2 hours ago
</span>
```

### Font Weights

```tsx
// Font weight scale
font-normal    // 400 - Body text
font-medium    // 500 - Emphasized text, sub-headings
font-semibold  // 600 - Card titles, section headings
font-bold      // 700 - Page headings, primary emphasis

// ✅ Usage examples
<h1 className="text-2xl font-bold">Page Title</h1>
<h2 className="text-lg font-semibold">Section Title</h2>
<h3 className="text-base font-medium">Label</h3>
<p className="text-sm font-normal">Body text</p>
```

### Typography Spacing

```tsx
// ✅ Heading bottom margin
<h2 className="text-xl font-semibold mb-4">Heading</h2>

// ✅ Paragraph spacing
<p className="text-sm text-gray-700 mb-4">Paragraph 1</p>
<p className="text-sm text-gray-700">Paragraph 2</p>

// ✅ Label spacing
<label className="block text-sm font-medium text-gray-700 mb-2">
  Form Label
</label>

// ✅ Caption spacing
<p className="text-gray-600 mt-2">
  Caption or description
</p>
```

### Text Colors (Reference)

See `COLOR_SYSTEM.md` for complete color palette.

```tsx
// Primary text
text - gray - 900; // Primary body text (#171717)
text - gray - 700; // Primary UI text (#404040)
text - gray - 600; // Secondary text (#525252)
text - gray - 500; // Muted text (#737373)

// Accent text
text - teal - 600; // Links, CTAs (#0d9488)
text - teal - 700; // Hover states (#0f766e)

// Semantic text
text - green - 600; // Income, positive (#16a34a)
text - red - 600; // Expenses, negative (#dc2626)
text - amber - 600; // Warnings (#d97706)
```

---

## Component Pattern Library

### Dashboard Metric Card

```tsx
<div className="rounded-lg border border-gray-200 bg-white p-6">
  <div className="mb-4 flex items-center justify-between">
    <h3 className="text-sm font-medium text-gray-600">Total Spent</h3>
    <TrendingDown className="h-5 w-5 text-gray-400" />
  </div>
  <p className="mb-2 text-2xl font-bold text-gray-900">$4,256.80</p>
  <p className="text-xs text-gray-500">+12.5% from last month</p>
</div>
```

### Transaction List Item

```tsx
<div className="flex items-center justify-between rounded-lg px-4 py-4 hover:bg-gray-50">
  <div className="flex items-center gap-4">
    <div className="rounded-lg bg-teal-100 p-2">
      <ShoppingCart className="h-5 w-5 text-teal-600" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-900">Amazon</p>
      <p className="text-xs text-gray-500">Shopping • Dec 15, 2024</p>
    </div>
  </div>
  <p className="text-sm font-semibold text-red-600">-$127.45</p>
</div>
```

### Form with Validation

```tsx
<form className="space-y-6">
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-700">Amount</label>
    <input
      type="number"
      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
      placeholder="0.00"
    />
    <p className="mt-2 text-xs text-gray-500">Enter the transaction amount</p>
  </div>

  <div className="flex gap-4">
    <button className="flex-1 rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50">
      Cancel
    </button>
    <button className="flex-1 rounded-lg bg-teal-600 px-6 py-2 text-white hover:bg-teal-700">
      Save
    </button>
  </div>
</form>
```

---

## Migration Guidelines

### Common Replacements Made

```tsx
// Spacing violations fixed:
py-3 → py-2         // Button padding (12px → 8px)
px-3 → px-4         // Horizontal padding (12px → 16px)
gap-3 → gap-4       // Layout gaps (12px → 16px)
p-3 → p-4           // Card padding (12px → 16px)
mt-1 → mt-2         // Small margins (4px → 8px)
space-y-3 → space-y-4 // Stack spacing (12px → 16px)

// Typography violations fixed:
text-md → text-base  // Non-standard class (16px)
```

### Verification Commands

```bash
# Check for spacing violations
grep -rn "\( p-1 \| p-3 \| gap-3 \)" src/app/budget-app/ --include="*.tsx"
# Expected: 0 results

# Check for typography violations
grep -rn "text-md" src/app/budget-app/ --include="*.tsx"
# Expected: 0 results

# Verify only standard Tailwind classes used
grep -roh "text-[a-z0-9]*" src/app/budget-app/ --include="*.tsx" | sort -u
# Expected: xs, sm, base, lg, xl, 2xl, 3xl, 4xl only
```

---

## Accessibility Compliance

### Spacing for Touch Targets

- **Minimum touch target**: 44px × 44px (WCAG 2.2)
- **Implementation**: `min-h-[44px] min-w-[44px]` or `p-3` (12px padding achieves 44px with content)

```tsx
// ✅ Compliant touch target
<button className="inline-flex items-center px-4 py-2 min-h-[44px] rounded-lg">
  Click Me
</button>

// ✅ Icon button with adequate spacing
<button className="p-2 hover:bg-gray-100 rounded-lg">
  <X className="w-5 h-5" /> {/* Icon + padding = 44px */}
</button>
```

### Text Size for Readability

- **Body text minimum**: 14px (`text-sm`) for normal text
- **Small text minimum**: 12px (`text-xs`) for labels/captions only
- **Line height**: 1.5× font size for body text (default in Tailwind)

---

## Resources

- **Spacing Audit**: `/tmp/spacing-audit-summary.txt`
- **Spacing Replacements**: `/tmp/spacing-replacement-summary.txt`
- **Typography Audit**: `/tmp/typography-audit-summary.txt`
- **Color System**: `src/app/budget-app/COLOR_SYSTEM.md`
- **Tailwind Docs**: https://tailwindcss.com/docs/customizing-spacing

---

## Support

For questions about spacing or typography:

1. Check this document for standard patterns
2. Verify against 8px grid (spacing-2, 4, 6, 8, 12, 16)
3. Use standard Tailwind typography scale (xs, sm, base, lg, xl, 2xl)
4. When in doubt, follow existing component patterns

**Last Review**: 2025-01-05
**Next Review**: After major design updates
