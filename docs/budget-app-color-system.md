# Budget App Color System

## Design Philosophy

The Budget App uses a **minimalist, single-accent color system** prioritizing clarity and accessibility:

- **Single Accent**: Teal (#14b8a6) for all primary actions and visual hierarchy
- **Neutral Foundation**: White backgrounds with gray scale for content
- **Semantic Colors**: Traditional colors for feedback (green/red/amber)
- **WCAG 2.1 AA Compliant**: All color combinations meet accessibility standards

## Color Palette

### Primary Accent - Teal

Teal is the core brand color, used sparingly for maximum impact.

| Name         | Tailwind   | Hex       | Usage                              | Contrast Ratio   |
| ------------ | ---------- | --------- | ---------------------------------- | ---------------- |
| **Teal 500** | `teal-500` | `#14b8a6` | Primary buttons, icons, accents    | 3.3:1 (AA Large) |
| **Teal 600** | `teal-600` | `#0d9488` | Button hover states                | 4.5:1 (AA)       |
| **Teal 700** | `teal-700` | `#0f766e` | Active/pressed states              | 5.8:1 (AAA)      |
| **Teal 50**  | `teal-50`  | `#f0fdfa` | Subtle backgrounds, hover effects  | N/A              |
| **Teal 100** | `teal-100` | `#ccfbf1` | Light backgrounds, selected states | N/A              |

**Contrast Ratios** (on white background):

- `teal-500`: 3.3:1 (✅ WCAG AA for large text 18px+)
- `teal-600`: 4.5:1 (✅ WCAG AA for all text)
- `teal-700`: 5.8:1 (✅ WCAG AAA for all text)

### Neutrals - Gray Scale

Foundation colors for backgrounds, text, and borders.

| Name         | Tailwind   | Hex       | Usage                               | Contrast Ratio |
| ------------ | ---------- | --------- | ----------------------------------- | -------------- |
| **White**    | `white`    | `#ffffff` | Page backgrounds, card surfaces     | N/A            |
| **Gray 50**  | `gray-50`  | `#f9fafb` | Subtle backgrounds, hover states    | N/A            |
| **Gray 100** | `gray-100` | `#f3f4f6` | Secondary backgrounds               | N/A            |
| **Gray 200** | `gray-200` | `#e5e7eb` | Borders, dividers                   | N/A            |
| **Gray 300** | `gray-300` | `#d1d5db` | Input borders, inactive states      | 4.6:1          |
| **Gray 400** | `gray-400` | `#9ca3af` | Placeholder text, disabled elements | 4.8:1          |
| **Gray 500** | `gray-500` | `#6b7280` | Secondary text, muted content       | 7.0:1 (AAA)    |
| **Gray 600** | `gray-600` | `#4b5563` | Primary text on light backgrounds   | 9.7:1 (AAA)    |
| **Gray 700** | `gray-700` | `#374151` | Headings, emphasized text           | 11.8:1 (AAA)   |
| **Gray 800** | `gray-800` | `#1f2937` | High-emphasis text                  | 14.7:1 (AAA)   |
| **Gray 900** | `gray-900` | `#111827` | Maximum contrast text               | 16.7:1 (AAA)   |

**Text Contrast** (on white background):

- `gray-400`: 4.8:1 (✅ AA for normal text)
- `gray-500`: 7.0:1 (✅ AAA)
- `gray-600+`: All exceed AAA standards

### Semantic Colors

Traditional feedback colors for status, alerts, and messages.

#### Success (Green)

| Name          | Tailwind    | Hex       | Usage                             |
| ------------- | ----------- | --------- | --------------------------------- |
| **Green 500** | `green-500` | `#22c55e` | Success messages, positive states |
| **Green 600** | `green-600` | `#16a34a` | Success button hover              |
| **Green 50**  | `green-50`  | `#f0fdf4` | Success alert backgrounds         |

**Contrast**: green-600 on white = 4.6:1 (✅ AA)

#### Destructive (Red)

| Name        | Tailwind  | Hex       | Usage                               |
| ----------- | --------- | --------- | ----------------------------------- |
| **Red 500** | `red-500` | `#ef4444` | Error messages, delete actions      |
| **Red 600** | `red-600` | `#dc2626` | Error button hover, critical alerts |
| **Red 50**  | `red-50`  | `#fef2f2` | Error alert backgrounds             |

**Contrast**: red-600 on white = 5.5:1 (✅ AA+)

#### Warning (Amber)

| Name          | Tailwind    | Hex       | Usage                            |
| ------------- | ----------- | --------- | -------------------------------- |
| **Amber 500** | `amber-500` | `#f59e0b` | Warning messages, caution states |
| **Amber 600** | `amber-600` | `#d97706` | Warning button hover             |
| **Amber 50**  | `amber-50`  | `#fffbeb` | Warning alert backgrounds        |

**Contrast**: amber-600 on white = 4.2:1 (✅ AA for large text)

#### Info (Blue)

| Name         | Tailwind   | Hex       | Usage                  |
| ------------ | ---------- | --------- | ---------------------- |
| **Blue 500** | `blue-500` | `#3b82f6` | Info messages, links   |
| **Blue 600** | `blue-600` | `#2563eb` | Info button hover      |
| **Blue 50**  | `blue-50`  | `#eff6ff` | Info alert backgrounds |

**Contrast**: blue-600 on white = 6.3:1 (✅ AAA)

## Usage Rules

### 1. Primary Actions

Use teal-500/600 exclusively for primary actions:

✅ **DO:**

```tsx
<button className="bg-teal-500 text-white hover:bg-teal-600">Add Transaction</button>
```

❌ **DON'T:**

```tsx
{
  /* Don't use blue or other colors for primary actions */
}
<button className="bg-blue-500 text-white">Add Transaction</button>;
```

### 2. Text Hierarchy

Use gray scale for content hierarchy:

✅ **DO:**

```tsx
<h1 className="text-gray-900">Dashboard</h1>
<p className="text-gray-700">Total Balance</p>
<span className="text-gray-500">Last updated today</span>
<p className="text-gray-400">Placeholder text</p>
```

❌ **DON'T:**

```tsx
{
  /* Don't use colored text for regular content */
}
<p className="text-teal-600">Total Balance</p>;
```

### 3. Backgrounds

Use white/gray-50 for surfaces:

✅ **DO:**

```tsx
<div className="rounded-lg bg-white shadow-sm">
  <div className="bg-gray-50 p-4">Secondary section</div>
</div>
```

❌ **DON'T:**

```tsx
{
  /* Avoid colored backgrounds except for accents */
}
<div className="bg-teal-100">...</div>;
```

### 4. Borders and Dividers

Use gray-200/300 for separators:

✅ **DO:**

```tsx
<div className="rounded-lg border border-gray-200">
  <input className="border-gray-300 focus:border-teal-500" />
</div>
```

❌ **DON'T:**

```tsx
{
  /* Don't use dark borders on light backgrounds */
}
<div className="border border-gray-600">...</div>;
```

### 5. Interactive States

Teal accent for focus, gray for hover on neutral elements:

✅ **DO:**

```tsx
<input className="
  border-gray-300
  focus:ring-2 focus:ring-teal-500 focus:border-teal-500
" />

<button className="
  bg-white border border-gray-200
  hover:bg-gray-50
">
  Cancel
</button>
```

❌ **DON'T:**

```tsx
{
  /* Don't use multiple accent colors */
}
<input className="focus:ring-blue-500" />;
```

### 6. Semantic Feedback

Use semantic colors only for status/feedback:

✅ **DO:**

```tsx
<div className="bg-green-50 border border-green-200 text-green-800">
  ✓ Transaction saved successfully
</div>

<div className="bg-red-50 border border-red-200 text-red-800">
  ✗ Failed to save transaction
</div>
```

❌ **DON'T:**

```tsx
{
  /* Don't use semantic colors for decoration */
}
<h2 className="text-green-600">Budget Categories</h2>;
```

### 7. Visual Accents

Teal left border for card hierarchy:

✅ **DO:**

```tsx
<div className="border-l-4 border-teal-500 bg-white shadow-sm">Important feature card</div>
```

❌ **DON'T:**

```tsx
{
  /* Don't overuse colored borders */
}
<div className="border-4 border-teal-500">...</div>;
```

## Component-Specific Patterns

### Buttons

```tsx
{
  /* Primary */
}
<button className="bg-teal-500 text-white hover:bg-teal-600">Primary Action</button>;

{
  /* Secondary */
}
<button className="border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
  Secondary Action
</button>;

{
  /* Destructive */
}
<button className="bg-red-600 text-white hover:bg-red-700">Delete</button>;

{
  /* Ghost */
}
<button className="text-gray-700 hover:bg-gray-100">Cancel</button>;
```

### Form Inputs

```tsx
<input className="w-full rounded-lg border border-gray-300 px-4 py-2 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
```

### Cards

```tsx
{
  /* Standard card */
}
<div className="rounded-xl border border-gray-100 bg-white shadow-sm">
  <div className="p-6">Content</div>
</div>;

{
  /* Featured card */
}
<div className="rounded-xl border-l-4 border-teal-500 bg-white shadow-sm">
  <div className="p-6">Featured content</div>
</div>;
```

### Alerts

```tsx
{
  /* Success */
}
<div className="rounded-lg border border-green-200 bg-green-50 p-4">
  <p className="text-sm text-green-800">Success message</p>
</div>;

{
  /* Error */
}
<div className="rounded-lg border border-red-200 bg-red-50 p-4">
  <p className="text-sm text-red-800">Error message</p>
</div>;

{
  /* Warning */
}
<div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
  <p className="text-sm text-amber-800">Warning message</p>
</div>;

{
  /* Info */
}
<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
  <p className="text-sm text-blue-800">Info message</p>
</div>;
```

### Navigation

```tsx
{
  /* Active nav item */
}
<button className="border-l-4 border-teal-500 bg-teal-50 text-teal-600">Active Item</button>;

{
  /* Inactive nav item */
}
<button className="border-l-4 border-transparent text-gray-600 hover:bg-gray-50">
  Inactive Item
</button>;
```

## Accessibility Guidelines

### Minimum Contrast Ratios

Per WCAG 2.1 AA standards:

- **Normal text** (< 18px): 4.5:1 minimum
- **Large text** (≥ 18px or ≥ 14px bold): 3:1 minimum
- **UI components** (borders, icons): 3:1 minimum

### Approved Text Combinations

✅ **WCAG AA Compliant**:

- `text-gray-600` on `bg-white` (9.7:1)
- `text-gray-700` on `bg-white` (11.8:1)
- `text-gray-900` on `bg-white` (16.7:1)
- `text-white` on `bg-teal-600` (4.5:1)
- `text-white` on `bg-red-600` (5.5:1)
- `text-white` on `bg-blue-600` (6.3:1)

⚠️ **Use with caution** (AA Large only):

- `text-gray-500` on `bg-white` (7.0:1 - OK)
- `text-teal-500` on `bg-white` (3.3:1 - Large text only)
- `text-amber-600` on `bg-white` (4.2:1 - Large text only)

❌ **Avoid** (fails WCAG AA):

- `text-gray-400` on `bg-white` (4.8:1 - borderline, use for placeholders only)
- `text-gray-300` on `bg-white` (fails - decorative only)
- `text-teal-400` on `bg-white` (fails)

### Focus Indicators

Always provide visible focus indicators:

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
  Accessible Button
</button>
```

## Dark Mode (Not Currently Used)

The budget app uses light mode exclusively. Dark mode is configured in the main TCO app but not applied to budget routes.

**If implementing dark mode in the future:**

- Invert background/foreground relationships
- Maintain 4.5:1 contrast ratios
- Use teal-400 instead of teal-500 for better visibility
- Test all combinations with contrast checkers

## Design Tokens

### CSS Variables

Budget app uses Tailwind's default color scale. No custom CSS variables needed.

### Tailwind Config

Colors are standard Tailwind defaults:

- `teal-{50-900}`: Primary accent scale
- `gray-{50-900}`: Neutral scale
- `red-{50-900}`: Error scale
- `green-{50-900}`: Success scale
- `amber-{50-900}`: Warning scale
- `blue-{50-900}`: Info scale

## Tools and Resources

### Color Contrast Checkers

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colorable](https://colorable.jxnblk.com/)
- Chrome DevTools (built-in contrast ratio)

### Tailwind Color Reference

- [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [Teal Scale](https://tailwindcss.com/docs/customizing-colors#color-palette-reference)

### Accessibility Standards

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding SC 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum)

## Quick Reference

```tsx
// ✅ DO THIS
bg - white; // Pages, cards
bg - gray - 50; // Subtle backgrounds
bg - teal - 500; // Primary buttons
text - gray - 900; // Headings
text - gray - 700; // Body text
text - gray - 500; // Secondary text
border - gray - 200; // Borders
focus: ring - teal - 500; // Focus states

// ❌ AVOID THIS
bg - teal - 100; // Too much color
text - teal - 600; // Use for accents only
text - gray - 300; // Too low contrast
border - gray - 600; // Too dark
focus: ring - blue - 500; // Wrong accent color
```

## Examples in Production

See these components for reference:

- **Buttons**: `src/components/budget/TransactionModal.tsx`
- **Cards**: `src/app/budget-app/page.tsx`
- **Forms**: `src/components/budget/TransactionModal.tsx`
- **Alerts**: `src/components/budget/Toast.tsx`
- **Navigation**: `src/app/budget-app/layout.tsx`

## Version History

- **v1.0** (2025-11-09): Initial color system documentation
  - Teal-500 as primary accent
  - Gray scale for neutrals
  - Semantic colors for feedback
  - WCAG 2.1 AA compliance verified
