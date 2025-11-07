# Budget App Color System Documentation

**Version:** 1.0  
**Last Updated:** November 6, 2025  
**Status:** Official Design Standard

---

## 🎨 Color Palette Overview

The Budget App uses a **single accent color system** with teal as the primary accent. This approach ensures visual consistency, improves accessibility, and aligns with modern design best practices.

### Design Philosophy

- **Single Accent Color:** Teal (#14b8a6) used ONLY for CTAs and key actions
- **Grayscale Foundation:** All non-accent UI elements use gray tones
- **Semantic Colors:** Green, red, and yellow ONLY for their specific meanings
- **No Gradients:** Forbidden across the entire application

---

## Primary Color Palette

### Teal Accent (Primary)

Use **only** for call-to-action buttons and key interactive elements that require user attention.

```css
--accent:       #14b8a6    /* Teal-500 - Primary CTAs */
--accent-hover: #0f766e    /* Teal-700 - Hover state */
--accent-light: #99f6e4    /* Teal-200 - Light backgrounds */
```

**Tailwind Classes:**
- `bg-teal-500` - Primary buttons
- `bg-teal-700` - Hover states
- `bg-teal-200` - Light backgrounds
- `text-teal-600` - Accent text
- `border-teal-500` - Accent borders

**Usage Examples:**
- ✅ Save button
- ✅ Add transaction button
- ✅ Import CSV button
- ✅ Active navigation item indicator
- ❌ Decorative elements
- ❌ Background colors for content areas

---

### Grayscale (Foundation)

Use for **all** structural elements, text, borders, and non-accent UI components.

```css
--gray-50:  #fafafa    /* Page background */
--gray-100: #f5f5f5    /* Card background */
--gray-200: #e5e5e5    /* Borders */
--gray-300: #d4d4d4    /* Disabled elements */
--gray-500: #737373    /* Secondary text */
--gray-700: #404040    /* Body text */
--gray-900: #171717    /* Headings */
```

**Tailwind Classes:**
- `bg-gray-50` - Page background
- `bg-gray-100` - Card/panel background
- `border-gray-200` - Subtle borders
- `border-gray-300` - Dividers
- `text-gray-500` - Muted text (dates, labels)
- `text-gray-700` - Body text
- `text-gray-900` - Headings, emphasis

**Usage Examples:**
- ✅ Card backgrounds (`bg-gray-100`)
- ✅ Page background (`bg-gray-50`)
- ✅ Border colors (`border-gray-200`)
- ✅ Disabled button states (`bg-gray-300`)
- ✅ All body text (`text-gray-700`)

---

### Semantic Colors

Use **exclusively** for their specific semantic meaning. Never for decoration.

#### Success / Income / Positive
```css
--success: #10b981    /* Green-500 */
```

**Tailwind:** `bg-green-500`, `text-green-600`

**Use For:**
- ✅ Income amounts
- ✅ Positive balances
- ✅ Success messages/toasts
- ✅ "On track" budget indicators
- ❌ Decorative elements
- ❌ General UI accents

#### Error / Expense / Negative
```css
--error: #ef4444    /* Red-500 */
```

**Tailwind:** `bg-red-500`, `text-red-600`

**Use For:**
- ✅ Expense amounts (when negative)
- ✅ Error messages/alerts
- ✅ Over-budget indicators
- ✅ Delete confirmation dialogs
- ❌ Generic warnings
- ❌ Decorative elements

#### Warning / Alert
```css
--warning: #f59e0b    /* Yellow-500 */
```

**Tailwind:** `bg-yellow-500`, `text-yellow-600`

**Use For:**
- ✅ Warning messages
- ✅ Near-budget-limit indicators
- ✅ Important notices
- ✅ Pending/review states
- ❌ General highlights
- ❌ Decorative elements

---

## 🚫 Forbidden Colors

These colors are **strictly prohibited** throughout the Budget App:

### Never Use
- ❌ **Purple** - Any shade (`purple-*`)
- ❌ **Orange** - Any shade (except semantic warning)
- ❌ **Cyan** - Any shade (`cyan-*`)
- ❌ **Blue** - Any shade (`blue-*`) except where semantically required
- ❌ **Gradients** - ANY gradient (`bg-gradient-to-*`)
- ❌ **Pink, Indigo, Violet** - All other accent colors

### Why Forbidden
- Creates visual noise and inconsistency
- Reduces accessibility (confusing for colorblind users)
- Violates single-accent color principle
- Makes UI feel cluttered and unprofessional

---

## Usage Rules & Guidelines

### Rule 1: Accent Color Hierarchy
**Use teal sparingly** - it should guide the user's eye to the most important actions.

```tsx
// ✅ CORRECT: Teal on primary CTA only
<button className="bg-teal-500 hover:bg-teal-700 text-white">
  Save Transaction
</button>
<button className="bg-gray-200 hover:bg-gray-300 text-gray-700">
  Cancel
</button>

// ❌ WRONG: Too many teal elements
<button className="bg-teal-500">Save</button>
<button className="bg-teal-500">Delete</button>
<button className="bg-teal-500">Edit</button>
```

### Rule 2: Semantic Colors Only for Meaning
Never use semantic colors for decoration or general UI elements.

```tsx
// ✅ CORRECT: Green indicates income
<span className="text-green-600 font-semibold">
  +$1,250.00
</span>

// ❌ WRONG: Green used decoratively
<div className="bg-green-100 p-4">
  <p>Welcome to Budget App!</p>
</div>
```

### Rule 3: Grayscale for Structure
All non-interactive, non-semantic elements should use grayscale.

```tsx
// ✅ CORRECT: Gray for cards, borders, text
<div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
  <h3 className="text-gray-900 font-bold">Recent Transactions</h3>
  <p className="text-gray-500 text-sm">Last 30 days</p>
</div>
```

### Rule 4: No Gradients Ever
Replace all gradients with solid colors or borders.

```tsx
// ❌ WRONG: Gradient usage
<div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2" />

// ✅ CORRECT: Solid color with border accent
<div className="border-l-4 border-teal-500 bg-white" />
```

---

## Accessibility Standards

### Contrast Ratios (WCAG 2.2 AA)

All color combinations **must** meet these minimum contrast ratios:

- **Text:** ≥4.5:1 for normal text, ≥3:1 for large text (18pt+)
- **UI Components:** ≥3:1 for interactive elements

#### Pre-Approved Combinations

✅ **Passing Combinations:**
- `text-gray-700` on `bg-white` (contrast: 10.46:1)
- `text-gray-900` on `bg-gray-50` (contrast: 16.8:1)
- `text-white` on `bg-teal-500` (contrast: 4.6:1)
- `text-white` on `bg-green-600` (contrast: 4.5:1)
- `text-white` on `bg-red-600` (contrast: 5.7:1)

❌ **Failing Combinations (Never Use):**
- `text-gray-500` on `bg-white` (contrast: 4.3:1 - FAILS)
- `text-teal-500` on `bg-white` (contrast: 3.2:1 - FAILS for body text)
- `text-gray-300` on `bg-gray-50` (contrast: 1.6:1 - FAILS)

### Testing Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools Accessibility Panel
- Lighthouse Accessibility Audit

---

## Component Color Patterns

### Buttons

```tsx
// Primary CTA
<button className="bg-teal-500 hover:bg-teal-700 text-white">
  Primary Action
</button>

// Secondary
<button className="bg-gray-200 hover:bg-gray-300 text-gray-700">
  Secondary Action
</button>

// Destructive
<button className="bg-red-500 hover:bg-red-700 text-white">
  Delete
</button>

// Disabled
<button className="bg-gray-300 text-gray-500 cursor-not-allowed" disabled>
  Disabled
</button>
```

### Cards & Panels

```tsx
<div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
  <h3 className="text-gray-900 font-bold text-lg mb-2">Card Title</h3>
  <p className="text-gray-700">Body text content</p>
  <p className="text-gray-500 text-sm mt-2">Metadata or timestamps</p>
</div>
```

### Form Inputs

```tsx
// Default
<input className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900
                  focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />

// Error state
<input className="border border-red-500 rounded-lg px-3 py-2 text-gray-900
                  focus:ring-2 focus:ring-red-500" />
<p className="text-red-600 text-sm mt-1">Error message here</p>
```

### Status Indicators

```tsx
// Income (positive)
<div className="flex items-center gap-2">
  <ArrowUp className="w-4 h-4 text-green-600" />
  <span className="text-green-600 font-semibold">+$450.00</span>
</div>

// Expense (negative)
<div className="flex items-center gap-2">
  <ArrowDown className="w-4 h-4 text-red-600" />
  <span className="text-gray-900 font-semibold">$87.32</span>
</div>

// Budget status
<div className="flex items-center gap-2">
  <AlertCircle className="w-4 h-4 text-yellow-600" />
  <span className="text-gray-700">Near limit</span>
</div>
```

### Navigation

```tsx
// Active
<a className="flex items-center gap-3 px-4 py-3 bg-teal-50 border-l-4 
              border-teal-500 text-teal-700 font-medium">
  Dashboard
</a>

// Inactive
<a className="flex items-center gap-3 px-4 py-3 text-gray-600 
              hover:bg-gray-50">
  Transactions
</a>
```

---

## Quick Reference

### Do's ✅
- Use teal (`#14b8a6`) for primary CTAs only
- Use grayscale for all structural elements
- Use semantic colors only for their meaning (green=income, red=expense, yellow=warning)
- Test all color combinations for WCAG AA compliance
- Use solid colors instead of gradients
- Maintain consistent color usage across all components

### Don'ts ❌
- Never use purple, orange, cyan, or blue as accents
- Never use gradients anywhere
- Never use semantic colors decoratively
- Never use color alone to convey information (always add icons/text)
- Never use low-contrast combinations (check WCAG AA)
- Never add new accent colors without approval

---

## Validation Checklist

Before merging any UI changes, verify:

- [ ] No gradients present (`grep -r "gradient" src/app/budget-app/`)
- [ ] Only teal, grayscale, and semantic colors used
- [ ] All text meets 4.5:1 contrast ratio
- [ ] Semantic colors used correctly (green=income, red=expense, yellow=warning)
- [ ] No forbidden colors (purple, orange, cyan, blue)
- [ ] Color choices align with this documentation

---

## Enforcement

### Automated Checks
- ESLint plugin for forbidden color classes (future enhancement)
- Visual regression testing with Percy/Chromatic
- Lighthouse accessibility audits (CI/CD)

### Manual Review
- Design review before PR merge
- Accessibility audit with WCAG validator
- Cross-reference with this document

---

## Resources

- **Design System PRD:** `BUDGET_APP_COMPLETE_PRD.md` (lines 56-85)
- **Tailwind Config:** `tailwind.config.ts`
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG22/quickref/
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/

---

**Last Updated:** November 6, 2025  
**Maintained By:** Budget App Design Team  
**Version:** 1.0

