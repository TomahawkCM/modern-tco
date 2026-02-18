# Budget App Design Guide

## Design System Compliance

**Last Updated:** 2025-11-03
**Version:** 1.0.0

### Core Principle: No Gradients

Per BUDGET_APP_COMPLETE_PRD.md requirements, the Budget App follows a **strict no-gradient policy**. All UI elements use solid colors for improved accessibility and professional appearance.

## Color Palette

### Primary Accent Color

```css
/* SINGLE ACCENT COLOR - Use sparingly for key actions and highlights */
--accent: #14b8a6; /* Teal - Primary CTAs, active states */
--accent-hover: #0f766e; /* Darker teal - Hover states */
--accent-light: #99f6e4; /* Light teal - Subtle backgrounds */
```

### Grayscale (Primary UI Colors)

```css
/* USE GRAYSCALE FOR 90% OF UI ELEMENTS */
--gray-50: #fafafa; /* Page background */
--gray-100: #f5f5f5; /* Card backgrounds, icon containers */
--gray-200: #e5e5e5; /* Borders, dividers */
--gray-300: #d4d4d4; /* Disabled states */
--gray-500: #737373; /* Secondary text */
--gray-700: #404040; /* Body text */
--gray-900: #171717; /* Headings, primary text */
```

### Semantic Colors (Specific Meanings Only)

```css
/* USE ONLY FOR THEIR SEMANTIC PURPOSE */
--success: #10b981; /* Green - Income, positive values */
--error: #ef4444; /* Red - Expenses, errors, overspending */
--warning: #f59e0b; /* Yellow - Alerts, warnings, near budget limit */
```

## Component Patterns

### Metric Cards

- **Border Pattern:** Use `border-l-4 border-teal-500` for visual hierarchy
- **Icon Backgrounds:** Solid `bg-gray-100` instead of gradients
- **No gradient headers or overlays**

### Buttons

```css
/* Primary Button */
.btn-primary {
  @apply bg-teal-500 text-white hover:bg-teal-600;
}

/* Secondary Button */
.btn-secondary {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50;
}
```

### Charts

- Chart gradients (linearGradient) are acceptable for data visualization only
- Use solid colors for all other chart elements
- Maintain semantic color meanings (green for income, red for expenses)

## Forbidden Patterns

❌ **NEVER USE:**

- `bg-gradient-to-r`, `bg-gradient-to-br`, or any Tailwind gradient classes
- Multiple accent colors (purple, orange, cyan, blue for decoration)
- Gradient overlays or backgrounds
- Rainbow or multi-color schemes

## Accessibility Requirements

- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text and UI components
- All interactive elements must have visible focus indicators
- Use semantic HTML elements

## Implementation Checklist

- [ ] No CSS gradients in components
- [ ] Single teal accent color throughout
- [ ] Gray-based color scheme for majority of UI
- [ ] Semantic colors only for their intended purpose
- [ ] Left borders or solid backgrounds for visual interest
- [ ] Proper contrast ratios maintained

## Migration Notes

**Phase 1 Completion (2025-11-03):**

- Removed 16 gradient instances from dashboard
- Replaced with teal accent borders and gray backgrounds
- Maintained visual hierarchy without gradients
- All buttons converted to solid colors

## References

- BUDGET_APP_COMPLETE_PRD.md (lines 89-120)
- WCAG 2.2 AA Compliance Guidelines
- .claude/Skills/design-guide.md
