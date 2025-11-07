---
name: design-guide
description: Professional UI design guidelines ensuring clean, modern, and consistent interfaces. Use when creating any UI components, web applications, React artifacts, HTML pages, or any visual interface elements including buttons, forms, cards, layouts, or complete applications.
---

# Design Guide

Apply these principles to every UI component you build to ensure modern, professional interfaces.

## Core Principles

### Clean and Minimal
- Prioritize white space over density
- Remove unnecessary elements
- Each component should have clear breathing room
- Avoid visual clutter and competing elements

### Color Palette Strategy
- **Base**: Use grays (100-900) and off-whites (#fafafa, #f5f5f5)
- **Accent**: Choose ONE accent color, use sparingly for CTAs and key actions
- **Never**: Generic purple/blue gradients, rainbow effects, or multiple competing accent colors

### Spacing System (8px Grid)
Use consistent spacing values: 8, 16, 24, 32, 48, 64px

```
padding/margin: 8px   - Tight spacing (within buttons, small gaps)
padding/margin: 16px  - Standard spacing (between elements)
padding/margin: 24px  - Comfortable spacing (card padding)
padding/margin: 32px  - Section spacing
padding/margin: 48px  - Large section breaks
padding/margin: 64px  - Major layout divisions
```

### Typography Hierarchy
- **Body text**: 16px minimum (never smaller)
- **Maximum fonts**: 2 font families total
- **Clear hierarchy**: Use size, weight, and spacing to create levels
- **Line height**: 1.5-1.7 for body text, tighter for headings

Example scale:
```
h1: 32px - 48px, font-weight 700
h2: 24px - 32px, font-weight 600
h3: 20px - 24px, font-weight 600
body: 16px, font-weight 400
small: 14px (use sparingly)
```

### Shadows and Depth
- Use subtle shadows: `box-shadow: 0 1px 3px rgba(0,0,0,0.1)`
- Hover states: `box-shadow: 0 4px 6px rgba(0,0,0,0.1)`
- Avoid heavy, dramatic shadows
- Consider using borders as lightweight alternatives

### Rounded Corners
- Be selective: Not every element needs rounded corners
- Consistent border-radius: 4px (subtle), 8px (standard), 12px (prominent)
- Match the element's personality: sharp for data tables, rounded for cards

### Interactive States
Always define clear states for interactive elements:

```css
/* Button example */
default: subtle shadow, clear affordance
hover: slightly elevated shadow, subtle background change
active: pressed appearance, darker shade
disabled: reduced opacity (0.5-0.6), cursor: not-allowed
focus: visible outline or ring for keyboard navigation
```

## Component Patterns

### Buttons
✅ **Good**:
- Padding: 12px 24px (vertical horizontal)
- Subtle shadow: 0 1px 3px rgba(0,0,0,0.1)
- Clear hover state with smooth transition
- Solid colors, no gradients
- Font weight 500-600

❌ **Bad**:
- Gradient backgrounds
- Heavy drop shadows
- No hover feedback
- Tiny padding (cramped appearance)

### Cards
✅ **Good**:
- Choose one: clean border (1px solid #e5e5e5) OR subtle shadow
- Padding: 24px
- Border-radius: 8px
- Background: white or light gray

❌ **Bad**:
- Both border and shadow
- Inconsistent padding
- Multiple background colors
- Over-styled with decorative elements

### Forms
✅ **Good**:
- Labels above inputs, clear and readable
- Input height: 40-48px minimum
- Spacing between fields: 16-24px
- Clear error states with red text and/or border
- Placeholder text in light gray
- Focus states with accent color ring/border

❌ **Bad**:
- Missing or unclear labels
- Tiny inputs (height < 40px)
- Inconsistent spacing
- Unclear error messages
- No focus indicators

### Layouts
✅ **Good**:
- Mobile-first responsive approach
- Consistent max-width for content (1200px typical)
- Grid-based layouts with consistent gutters
- Adequate white space between sections

❌ **Bad**:
- Desktop-only thinking
- Content stretching to full width on large screens
- Inconsistent spacing
- Cramped mobile layouts

## Common Mistakes to Avoid

1. **Rainbow syndrome**: Every element a different color
2. **Gradient overload**: Purple/blue gradients everywhere
3. **Typography chaos**: More than 2 fonts, inconsistent sizing
4. **Microscopic text**: Body text below 16px
5. **Spacing anarchy**: Random spacing values (13px, 19px, 27px)
6. **Shadow drama**: Heavy drop shadows on everything
7. **No interactive feedback**: Static buttons, unclear clickable areas
8. **Color soup**: Multiple accent colors competing for attention

## Quick Reference Checklist

Before finalizing any UI:
- [ ] White space feels comfortable, not cramped
- [ ] Only ONE accent color used
- [ ] All spacing uses 8px grid (8, 16, 24, 32, 48, 64)
- [ ] Body text is 16px or larger
- [ ] Maximum 2 font families
- [ ] Shadows are subtle
- [ ] Interactive states are clear (hover, active, disabled)
- [ ] Mobile-responsive design
- [ ] No gradients (unless specifically requested)
- [ ] Consistent rounded corners (not everything rounded)

## Color Palette Examples

Neutral base with single accent:

```css
/* Grays */
--gray-50: #fafafa;
--gray-100: #f5f5f5;
--gray-200: #e5e5e5;
--gray-300: #d4d4d4;
--gray-700: #404040;
--gray-900: #171717;

/* Choose ONE accent - examples */
--accent-blue: #3b82f6;    /* Only if specifically requested */
--accent-green: #10b981;   /* Fresh, positive */
--accent-orange: #f97316;  /* Energetic */
--accent-teal: #14b8a6;    /* Modern, professional */
```

Use gray-100/200 for backgrounds, gray-700/900 for text, accent color for primary actions only.
