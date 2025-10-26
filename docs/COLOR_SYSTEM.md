# Color System Architecture

## Overview

The Modern Tanium TCO Learning Management System uses a **dual color system** that combines:
1. **shadcn/ui Semantic Colors** (CSS variables)
2. **Archon Cyberpunk Theme** (Tailwind utility classes)

This document outlines the current state, inconsistencies, and best practices for maintaining color consistency across the application.

---

## 🎨 Current Color Systems

### 1. Semantic Color Variables (shadcn/ui)

Defined in `src/app/globals.css`, these CSS variables provide theme-aware colors that automatically adapt to light/dark mode:

#### Dark Mode (Primary Theme)
```css
--background: 240 100% 3%        /* Very dark blue/black */
--foreground: 0 0% 100%          /* Pure white text */
--card: 240 23% 9%               /* Dark card background */
--card-foreground: 0 0% 100%     /* White text on cards */
--muted: 240 23% 9%              /* Muted background (dark) */
--muted-foreground: 0 0% 60%     /* Gray text for secondary content */
--primary: 195 100% 50%          /* Electric cyan (#00d4ff) */
--primary-foreground: 240 100% 3%/* Dark text on cyan */
--secondary: 195 100% 50%        /* Cyan accent */
--secondary-foreground: 0 0% 100%/* White text on cyan */
```

#### Light Mode (Fallback)
```css
--background: 0 0% 100%          /* Pure white */
--foreground: 222.2 84% 4.9%     /* Very dark text */
--secondary: 210 40% 96%         /* Light blue/gray */
--secondary-foreground: 222.2 84% 4.9% /* Dark text */
```

**Usage Pattern:**
```tsx
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Secondary text</p>
</div>
```

### 2. Archon Cyberpunk Colors (Tailwind Extensions)

Defined in `tailwind.config.ts`, these provide the cyberpunk aesthetic:

```typescript
archon: {
  'bg-start': '#0a0a0f',         // Deep dark blue/black
  'bg-end': '#1a1a2e',           // Dark gradient end
  'cyan-bright': '#00d4ff',      // Electric cyan
  'cyan-primary': '#0ea5e9',     // Primary cyan
  'purple-primary': '#8b5cf6',   // Purple highlights
  'text-primary': '#ffffff',     // White text
  'text-muted': 'rgba(255, 255, 255, 0.6)', // 60% opacity
}
```

**Usage Pattern:**
```tsx
<div className="bg-archon-bg-start">
  <h1 className="text-archon-cyan-bright">Cyberpunk Heading</h1>
</div>
```

---

## ⚠️ Known Inconsistencies

### 1. Button vs Badge Components

**Badge Component** (`src/components/ui/badge.tsx`):
- ✅ Uses semantic CSS variables correctly
- ✅ Adapts to light/dark mode automatically
```tsx
secondary: "bg-secondary text-secondary-foreground"
```

**Button Component** (`src/components/ui/button.tsx`):
- ❌ Uses hard-coded Tailwind colors
- ❌ Does NOT use semantic variables
```tsx
default: "bg-cyan-600 text-white"
secondary: "bg-slate-600 text-slate-100"
```

**Impact:** Buttons don't respect the semantic color system, making theme changes difficult.

**Recommendation:** Refactor Button component to use semantic variables:
```tsx
default: "bg-primary text-primary-foreground"
secondary: "bg-secondary text-secondary-foreground"
```

### 2. Hard-coded Color Overrides

**Anti-Pattern (FIXED in FlashcardReview.tsx):**
```tsx
// ❌ BAD - Overrides semantic colors
<Badge variant="secondary" className="text-white">

// ✅ GOOD - Respects semantic system
<Badge variant="secondary">
```

**Reason:** Badge already sets `text-secondary-foreground` (white in dark mode), so forcing `text-white` is redundant and can cause issues if the semantic variable changes.

### 3. Missing Explicit Text Colors

**Problem:** Some text elements don't specify colors and rely on inheritance, which may fail in complex DOM structures.

**Anti-Pattern:**
```tsx
<div className="bg-muted">
  <p className="text-2xl font-bold">{stats.total}</p> {/* No color! */}
</div>
```

**Solution (FIXED):**
```tsx
<div className="bg-muted">
  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
</div>
```

---

## ✅ Best Practices

### 1. Always Use Semantic Colors for UI Components

**Text Colors:**
```tsx
// Primary content
<h1 className="text-foreground">Main Heading</h1>

// Secondary/muted content
<p className="text-muted-foreground">Helper text</p>

// Destructive/error states
<span className="text-destructive-foreground">Error message</span>
```

**Background Colors:**
```tsx
// Page background
<div className="bg-background">

// Card/panel backgrounds
<div className="bg-card">

// Muted/subtle backgrounds
<div className="bg-muted">
```

### 2. Avoid Hard-coded Color Overrides

**❌ Don't:**
```tsx
<Badge variant="secondary" className="text-white">
<Button className="bg-cyan-500">
```

**✅ Do:**
```tsx
<Badge variant="secondary">
<Button variant="default">
```

### 3. Use Archon Colors for Decorative Elements Only

**Good use cases:**
- Gradient backgrounds
- Glow effects
- Accent borders
- Hero sections

**Example:**
```tsx
<div className="bg-archon-bg archon-text-glow">
  <span className="text-archon-cyan-bright">TCO Certification</span>
</div>
```

### 4. Explicit Colors on Nested Elements

When nesting elements with different backgrounds, always specify text colors:

```tsx
<div className="bg-muted">
  <div className="p-4">
    <p className="text-sm text-muted-foreground">Label</p>
    <p className="text-2xl font-bold text-foreground">Value</p>
  </div>
</div>
```

---

## 🔧 Recommended Refactoring

### High Priority
1. **Button Component Refactor**
   - Replace hard-coded colors with semantic variables
   - Ensure consistent behavior with Badge, Card, etc.
   - Estimated effort: 2 hours

### Medium Priority
2. **Audit All Components**
   - Search for `className="text-white"` instances
   - Search for `bg-cyan-`, `bg-slate-`, etc.
   - Replace with semantic equivalents
   - Estimated effort: 4 hours

3. **Consolidate Color System**
   - Choose primary system (shadcn semantic vs Archon)
   - Document migration path
   - Update component library
   - Estimated effort: 8 hours

---

## 📚 Quick Reference

### Common Color Patterns

| Use Case | Class Pattern | Example |
|----------|---------------|---------|
| Primary text | `text-foreground` | Headings, main content |
| Secondary text | `text-muted-foreground` | Labels, helper text |
| Card backgrounds | `bg-card` | Cards, panels |
| Muted backgrounds | `bg-muted` | Stats boxes, subtle sections |
| Primary buttons | `bg-primary text-primary-foreground` | CTA buttons |
| Secondary buttons | `bg-secondary text-secondary-foreground` | Alternative actions |
| Error states | `bg-destructive text-destructive-foreground` | Warnings, errors |

### Color Hierarchy

```
Background Layer (Darkest)
  └─ bg-background (240 100% 3%)
     └─ bg-card (240 23% 9%)
        └─ bg-muted (240 23% 9%)
           └─ bg-accent (195 100% 50%)

Text Layer (Lightest)
  └─ text-foreground (100% white)
     └─ text-muted-foreground (60% gray)
```

---

## 🐛 Troubleshooting

### "Black text on black background"
**Cause:** Missing explicit text color on nested elements
**Fix:** Add `text-foreground` to bold/heading elements

### "Badge text invisible"
**Cause:** Hard-coded `text-white` override
**Fix:** Remove color overrides, use semantic variants

### "Colors don't match design system"
**Cause:** Component using hard-coded Tailwind colors
**Fix:** Refactor to use semantic CSS variables

---

## 📝 Change Log

### 2025-10-08: Flashcard Module Color Fixes
- **Fixed:** Removed `text-white` overrides from Badge components (FlashcardReview.tsx:346, 496)
- **Fixed:** Added explicit `text-foreground` to stat numbers (FlashcardReview.tsx, FlashcardDashboard.tsx)
- **Fixed:** Added `text-foreground` to question/answer headings
- **Impact:** Resolved black-on-black text visibility issues in dark mode

---

## 🎯 Future Considerations

1. **Theme Switching:** If light mode becomes supported, all components will need to respect semantic variables
2. **Color Contrast:** Run automated WCAG 2.1 AA compliance checks
3. **Component Library:** Consider Storybook for documenting color usage patterns
4. **Design Tokens:** Migrate to design token system for multi-brand support

---

**Maintained by:** Modern TCO Development Team
**Last Updated:** 2025-10-08
