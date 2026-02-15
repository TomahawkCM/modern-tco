# Motion Design Tokens & Animation Guidelines

**Version**: 1.0  
**Date**: November 10, 2025  
**Archon Task**: 693a29c5-a6e4-4eca-a6ba-002faa303433  
**Status**: Implementation Ready

---

## Overview

This document defines the complete motion design token system for Budget App v1, with comprehensive **reduced motion support** for accessibility (WCAG 2.3.3 Level AAA).

**Key Principles**:

1. **Motion serves function** - Animations should provide feedback or guide attention, not just decoration
2. **Respect user preferences** - Always honor `prefers-reduced-motion` and manual accessibility settings
3. **Performance first** - Use GPU-accelerated properties (transform, opacity) over layout-triggering properties
4. **Consistency** - Use standardized durations and easing curves across the application

---

## 1. Duration Token Scale

### 1.1 Token Definitions

```css
:root {
  /* Core Duration Scale */
  --duration-instant: 0ms; /* No animation (accessibility override) */
  --duration-fast: 150ms; /* Micro-interactions (hover, button press) */
  --duration-normal: 300ms; /* Standard transitions (modals, dropdowns) */
  --duration-slow: 500ms; /* Deliberate animations (page transitions) */
  --duration-slower: 700ms; /* Complex animations (charts, illustrations) */

  /* Alias Tokens (semantic naming) */
  --duration-hover: var(--duration-fast);
  --duration-transition: var(--duration-normal);
  --duration-page: var(--duration-slow);
}
```

### 1.2 Usage Guidelines

| Duration           | Use For                                    | Examples                                                   |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------- |
| **instant (0ms)**  | Accessibility override, immediate feedback | Reduced motion mode, instant state changes                 |
| **fast (150ms)**   | Micro-interactions, hover states           | Button hover, link underline, toggle switch, focus ring    |
| **normal (300ms)** | Standard UI transitions                    | Modal open/close, dropdown expand, tab switch, toast slide |
| **slow (500ms)**   | Emphasized animations                      | Page transitions, drawer slide, notification enter/exit    |
| **slower (700ms)** | Complex multi-stage animations             | Chart render, skeleton → content, confetti effects         |

**General Rule**: Shorter durations (150-300ms) for user-triggered interactions, longer durations (500-700ms) for system-initiated changes.

---

## 2. Easing Curve Tokens

### 2.1 Token Definitions

```css
:root {
  /* Standard CSS Easings */
  --easing-linear: linear; /* Constant speed (rarely used) */
  --easing-ease: ease; /* Browser default (gentle) */
  --easing-ease-in: ease-in; /* Slow start, fast end */
  --easing-ease-out: ease-out; /* Fast start, slow end */
  --easing-ease-in-out: ease-in-out; /* Slow start and end */

  /* Custom Cubic Bezier Curves (Material Design inspired) */
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1); /* Standard easing */
  --easing-emphasized: cubic-bezier(0.2, 0, 0, 1); /* Emphasized deceleration */
  --easing-decelerate: cubic-bezier(0, 0, 0.2, 1); /* Fast start, slow end */
  --easing-accelerate: cubic-bezier(0.4, 0, 1, 1); /* Slow start, fast end */
  --easing-bounce: cubic-bezier(0.68, -0.55, 0.27, 1.55); /* Playful bounce (use sparingly) */

  /* Semantic Aliases */
  --easing-enter: var(--easing-emphasized); /* Elements entering screen */
  --easing-exit: var(--easing-accelerate); /* Elements exiting screen */
  --easing-interactive: var(--easing-default); /* Interactive feedback */
}
```

### 2.2 Easing Curve Visualizations

**Default (0.4, 0.0, 0.2, 1)**:

- Gentle acceleration at start, strong deceleration at end
- **Use for**: General transitions, hover states, focus changes

**Emphasized (0.2, 0.0, 0.0, 1)**:

- Strong deceleration, minimal acceleration
- **Use for**: Elements entering the viewport (modals, dropdowns, toasts)

**Decelerate (0.0, 0.0, 0.2, 1)**:

- Instant start, gradual slow-down
- **Use for**: Expanding elements, revealing content

**Accelerate (0.4, 0.0, 1, 1)**:

- Gradual start, instant stop
- **Use for**: Collapsing elements, dismissing notifications

**Bounce (0.68, -0.55, 0.27, 1.55)**:

- Overshoots target, bounces back
- **Use for**: Success states, playful interactions (sparingly, avoid in high-contrast mode)

### 2.3 Easing Selection Matrix

| Animation Type        | Recommended Easing | Reasoning                         |
| --------------------- | ------------------ | --------------------------------- |
| **Hover/Focus**       | default            | Subtle, responsive feel           |
| **Modal open**        | emphasized         | Draws attention, feels deliberate |
| **Modal close**       | accelerate         | Feels snappy, gets out of the way |
| **Dropdown expand**   | emphasized         | Smooth reveal                     |
| **Dropdown collapse** | accelerate         | Quick dismissal                   |
| **Toast enter**       | emphasized         | Attention-grabbing                |
| **Toast exit**        | accelerate         | Unobtrusive                       |
| **Page transition**   | default            | Smooth, not jarring               |
| **Button press**      | default            | Responsive feedback               |
| **Drawer slide**      | emphasized         | Elegant reveal                    |
| **Chart render**      | ease-out           | Smooth data visualization         |

---

## 3. Reduced Motion Support

### 3.1 System Preference Detection

```css
/* Automatically disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    /* Override all durations to near-instant */
    --duration-instant: 0ms;
    --duration-fast: 0.01ms; /* Not 0ms to preserve JS animation listeners */
    --duration-normal: 0.01ms;
    --duration-slow: 0.01ms;
    --duration-slower: 0.01ms;
  }

  /* Disable all animations and transitions globally */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Exceptions: Allow essential opacity fades for focus indicators */
  *:focus-visible {
    transition: opacity var(--duration-fast) var(--easing-default);
  }
}
```

**Why 0.01ms instead of 0ms?**

- JavaScript animation libraries often check for `duration > 0` to determine if animation is enabled
- 0.01ms is effectively instant for users but preserves compatibility with animation frameworks

### 3.2 Manual Toggle (Accessibility Settings)

```css
/* User-activated reduced motion via accessibility settings panel */
.reduce-motion {
  /* Override durations at root level */
  --duration-instant: 0ms;
  --duration-fast: 0.01ms;
  --duration-normal: 0.01ms;
  --duration-slow: 0.01ms;
  --duration-slower: 0.01ms;
}

.reduce-motion *,
.reduce-motion *::before,
.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```

**Implementation in AccessibilitySettingsPanel**:

```typescript
function toggleReducedMotion(enabled: boolean) {
  if (enabled) {
    document.documentElement.classList.add("reduce-motion");
    localStorage.setItem("reduceMotion", "true");
  } else {
    document.documentElement.classList.remove("reduce-motion");
    localStorage.setItem("reduceMotion", "false");
  }
}
```

### 3.3 Essential vs Decorative Animations

**Essential Animations** (preserve in reduced motion):

- Focus indicators (visual feedback for keyboard navigation)
- Loading spinners (communicate ongoing process)
- Progress bars (show task completion)

**Decorative Animations** (disable in reduced motion):

- Parallax effects
- Background animations (particles, beams)
- Bounce/overshoot effects
- Confetti/celebration animations
- Chart rendering animations

**Implementation Pattern**:

```css
/* Essential: Preserve focus indicator transition */
.button:focus-visible {
  outline: 2px solid hsl(var(--color-ring));
  /* This transition will be reduced but not eliminated */
  transition: outline-offset var(--duration-fast) var(--easing-default);
}

/* Decorative: Fully disable in reduced motion */
.decorative-particles {
  animation: particle-float 6s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .decorative-particles {
    animation: none;
    opacity: 0; /* Hide entirely */
  }
}
```

---

## 4. Interaction-Specific Guidelines

### 4.1 Hover States

```css
.button,
.link,
.card {
  transition: all var(--duration-fast) var(--easing-default);
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.link:hover {
  color: hsl(var(--color-primary));
  text-decoration-thickness: 2px;
}
```

**Guidelines**:

- Duration: **fast (150ms)**
- Easing: **default**
- Properties: `transform`, `box-shadow`, `color`, `background-color`, `border-color`
- Avoid: Layout-shifting properties (`width`, `height`, `padding`, `margin`)

### 4.2 Button Press (Active State)

```css
button:not(:disabled) {
  transition: transform var(--duration-fast) var(--easing-default);
}

button:not(:disabled):active {
  transform: scale(0.95);
}
```

**Guidelines**:

- Duration: **fast (150ms)**
- Easing: **default**
- Effect: Subtle scale-down (0.95) for tactile feedback

### 4.3 Modal / Dialog Open

```css
.dialog[data-state="open"] {
  animation: dialog-enter var(--duration-normal) var(--easing-emphasized);
}

@keyframes dialog-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

**Guidelines**:

- Duration: **normal (300ms)**
- Easing: **emphasized** (draws attention)
- Animation: Fade + slight scale + vertical shift

### 4.4 Modal / Dialog Close

```css
.dialog[data-state="closed"] {
  animation: dialog-exit var(--duration-fast) var(--easing-accelerate);
}

@keyframes dialog-exit {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
}
```

**Guidelines**:

- Duration: **fast (150ms)** - shorter than open for snappier feel
- Easing: **accelerate** (quick dismissal)

### 4.5 Dropdown / Popover

```css
.dropdown-content[data-state="open"] {
  animation: dropdown-enter var(--duration-fast) var(--easing-emphasized);
}

@keyframes dropdown-enter {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Guidelines**:

- Duration: **fast (150ms)** - quick reveal
- Easing: **emphasized**
- Animation: Fade + vertical slide from origin

### 4.6 Toast Notifications

```css
.toast[data-state="open"] {
  animation: toast-enter var(--duration-normal) var(--easing-emphasized);
}

.toast[data-state="closed"] {
  animation: toast-exit var(--duration-normal) var(--easing-accelerate);
}

@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-exit {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
```

**Guidelines**:

- Duration: **normal (300ms)**
- Easing: **emphasized** (enter), **accelerate** (exit)
- Animation: Horizontal slide from edge

### 4.7 Page Transitions

```css
.page-enter {
  animation: page-enter var(--duration-slow) var(--easing-default);
}

@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Guidelines**:

- Duration: **slow (500ms)** - allows content to settle
- Easing: **default** (smooth, not jarring)
- Animation: Fade + vertical shift

### 4.8 Tab Switching

```css
.tab-panel[data-state="active"] {
  animation: tab-enter var(--duration-normal) var(--easing-default);
}

@keyframes tab-enter {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

**Guidelines**:

- Duration: **normal (300ms)**
- Easing: **default**
- Animation: Fade + horizontal shift (direction matches tab position)

### 4.9 Accordion / Collapsible

```css
.accordion-content[data-state="open"] {
  animation: accordion-expand var(--duration-normal) var(--easing-emphasized);
}

.accordion-content[data-state="closed"] {
  animation: accordion-collapse var(--duration-normal) var(--easing-accelerate);
}

@keyframes accordion-expand {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
    opacity: 1;
  }
}
```

**Guidelines**:

- Duration: **normal (300ms)**
- Easing: **emphasized** (expand), **accelerate** (collapse)
- Use `height: auto` with JS measurement for dynamic content

### 4.10 Loading States

```css
.skeleton {
  animation: skeleton-pulse var(--duration-slower) var(--easing-ease-in-out) infinite;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Loading spinner (preserve in reduced motion for accessibility) */
.spinner {
  animation: spin var(--duration-slower) linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Exception: Keep spinner visible even in reduced motion */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: spin 2s linear infinite; /* Slower but still visible */
  }
}
```

**Guidelines**:

- Skeleton: **slower (700ms)**, pulse between 0.5-1 opacity
- Spinner: **linear easing** (constant rotation), **preserve in reduced motion** (essential feedback)

### 4.11 Chart Rendering

```css
.chart-bar {
  animation: chart-bar-grow var(--duration-slower) var(--easing-ease-out);
}

@keyframes chart-bar-grow {
  from {
    transform: scaleY(0);
    transform-origin: bottom;
  }
  to {
    transform: scaleY(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .chart-bar {
    animation: none;
    transform: scaleY(1); /* Show final state immediately */
  }
}
```

**Guidelines**:

- Duration: **slower (700ms)** - allows eye to follow data
- Easing: **ease-out** (smooth deceleration)
- **Disable in reduced motion** (decorative, not essential)

---

## 5. Performance Optimization

### 5.1 GPU-Accelerated Properties

**Use these properties for smooth 60fps animations**:

- `transform` (translate, scale, rotate, skew)
- `opacity`

**Avoid these properties (trigger layout/paint)**:

- `top`, `left`, `bottom`, `right`
- `width`, `height`
- `padding`, `margin`
- `background-position`

**Example - Good**:

```css
/* ✅ GPU-accelerated transform */
.modal-enter {
  transform: translateY(20px);
  opacity: 0;
}
```

**Example - Bad**:

```css
/* ❌ Triggers layout recalculation */
.modal-enter {
  top: 20px;
  opacity: 0;
}
```

### 5.2 Will-Change Hint

```css
/* Add will-change for frequently animated elements */
.button {
  will-change: transform;
  transition: transform var(--duration-fast) var(--easing-default);
}

.button:hover {
  transform: translateY(-2px);
}

/* Remove will-change after animation completes */
.button:not(:hover):not(:active) {
  will-change: auto;
}
```

**Guidelines**:

- Use `will-change` sparingly (creates new layer, costs memory)
- Only for elements that animate frequently (hover states, draggable items)
- Remove after animation completes to free resources

---

## 6. Implementation Checklist

### 6.1 Token Integration

- [ ] Add all duration tokens to `globals.css` `:root` block
- [ ] Add all easing tokens to `globals.css` `:root` block
- [ ] Implement `@media (prefers-reduced-motion: reduce)` overrides
- [ ] Implement `.reduce-motion` class for manual toggle
- [ ] Update `AccessibilitySettingsPanel.tsx` with reduced motion toggle
- [ ] Test token application across budget app pages

### 6.2 Component Updates

- [ ] Replace hard-coded animation durations with tokens
- [ ] Replace hard-coded easing with token-based curves
- [ ] Verify all animations use GPU-accelerated properties
- [ ] Add `@media (prefers-reduced-motion)` exceptions for essential animations
- [ ] Test all animations in 3 theme modes (light, dark, high-contrast)

### 6.3 Testing

- [ ] Enable system-level reduced motion preference and verify all decorative animations are disabled
- [ ] Toggle manual reduced motion in AccessibilitySettingsPanel and verify behavior
- [ ] Verify essential animations (loading spinners, progress bars) still work in reduced motion
- [ ] Check Chrome DevTools Performance tab for 60fps during animations
- [ ] Verify no layout thrashing (avoid width/height/padding animations)

---

## 7. Motion Guidelines Summary

### 7.1 Quick Reference Table

| Interaction Type | Duration       | Easing                | Animation Properties                   |
| ---------------- | -------------- | --------------------- | -------------------------------------- |
| Hover            | fast (150ms)   | default               | transform, box-shadow, color           |
| Button press     | fast (150ms)   | default               | transform (scale 0.95)                 |
| Focus change     | fast (150ms)   | default               | outline-offset                         |
| Modal open       | normal (300ms) | emphasized            | opacity, transform (translateY, scale) |
| Modal close      | fast (150ms)   | accelerate            | opacity, transform                     |
| Dropdown         | fast (150ms)   | emphasized            | opacity, transform (translateY)        |
| Toast            | normal (300ms) | emphasized/accelerate | opacity, transform (translateX)        |
| Page transition  | slow (500ms)   | default               | opacity, transform (translateY)        |
| Tab switch       | normal (300ms) | default               | opacity, transform (translateX)        |
| Accordion        | normal (300ms) | emphasized/accelerate | height, opacity                        |
| Skeleton pulse   | slower (700ms) | ease-in-out           | opacity (infinite)                     |
| Loading spinner  | slower (700ms) | linear                | transform (rotate, infinite)           |
| Chart render     | slower (700ms) | ease-out              | transform (scaleY)                     |

### 7.2 Do's and Don'ts

**✅ DO**:

- Use tokens for all durations and easing curves
- Honor `prefers-reduced-motion` system preference
- Provide manual reduced motion toggle in accessibility settings
- Use GPU-accelerated properties (`transform`, `opacity`)
- Keep decorative animations short (<500ms)
- Preserve essential animations (loading states) in reduced motion

**❌ DON'T**:

- Hard-code animation durations (use tokens)
- Ignore reduced motion preferences
- Animate layout-triggering properties (`width`, `height`, `top`, `left`)
- Use bounce/overshoot easing in high-contrast mode (distracting)
- Create animations longer than 700ms (perceived as laggy)
- Disable essential feedback animations (loading spinners, progress)

---

## 8. Accessibility Compliance

### 8.1 WCAG 2.3.3 (Level AAA)

**Animation from Interactions**: Motion animation triggered by user interaction can be disabled, unless the animation is **essential** to the functionality or information being conveyed.

**Our Implementation**:

- ✅ System preference detection (`prefers-reduced-motion`)
- ✅ Manual toggle in accessibility settings panel
- ✅ Essential animations preserved (loading spinners, progress bars)
- ✅ Decorative animations fully disabled (parallax, particles, bounces)

### 8.2 WCAG 2.2.2 (Level A)

**Pause, Stop, Hide**: For any moving, blinking, or scrolling content that:

- Starts automatically
- Lasts more than 5 seconds
- Is presented in parallel with other content

Users must be able to **pause, stop, or hide** it.

**Our Implementation**:

- ✅ No auto-playing decorative animations in budget app
- ✅ Charts render on-demand (user navigates to page)
- ✅ Loading states have finite duration (<3 seconds typical)

---

## 9. Next Steps

### 9.1 Implementation Order

1. **Week 1, Day 1**: Add motion tokens to `globals.css`
2. **Week 1, Day 1**: Implement reduced motion overrides
3. **Week 1, Day 2**: Update `AccessibilitySettingsPanel.tsx` with reduced motion toggle
4. **Week 1, Day 2-3**: Audit and update component animations (buttons, modals, toasts)
5. **Week 1, Day 4**: Test reduced motion functionality across all pages
6. **Week 1, Day 5**: Performance testing (Chrome DevTools, ensure 60fps)

### 9.2 Documentation

- Create `/docs/animation-patterns.md` with usage examples
- Add motion guidelines to Storybook
- Document exceptions (essential vs decorative animations)

### 9.3 Testing Checklist

- [ ] System reduced motion preference respected
- [ ] Manual reduced motion toggle works
- [ ] Essential animations preserved (loading spinners)
- [ ] Decorative animations disabled (particles, parallax)
- [ ] All animations 60fps (Chrome DevTools Performance)
- [ ] No layout thrashing (avoid width/height animations)
- [ ] Lighthouse Performance score maintained (90+)

---

**Status**: ✅ **Motion Token Guidelines Complete - Ready for Implementation**  
**Next Task**: Implement these tokens in `globals.css` and update budget app components  
**Archon Task ID**: 693a29c5-a6e4-4eca-a6ba-002faa303433 → **READY FOR REVIEW**
