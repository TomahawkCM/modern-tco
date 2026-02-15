# Budget App Design System Audit

**Date**: November 10, 2025  
**Auditor**: Claude (User session)  
**Archon Task**: 68ffc607-4c54-418b-af0b-48b391c31c87  
**Project**: Budget App v1 Modernization

---

## Executive Summary

The budget app has a **mature design system** with strong accessibility foundations, but requires several updates to meet the v1 modernization goals, particularly for seniors-friendliness and WCAG 2.2 AA compliance.

**Key Findings**:

- ✅ **Strong foundation**: 3 theme modes, semantic tokens, reduced motion support
- ✅ **Rich component library**: 63 shadcn/ui components + 50 custom budget components
- ⚠️ **Base typography**: 16px (needs increase to 18px for seniors)
- ⚠️ **Touch targets**: Need audit for 48px minimum compliance
- ⚠️ **Token architecture**: Needs better documentation and standardization

---

## 1. Color Tokens

### Current Palette

**Light Mode** (globals.css:6-30):

```css
--background: 0 0% 100%; /* #ffffff */
--foreground: 222.2 84% 4.9%; /* #0a1628 */
--primary: 210 79% 46%; /* #1d72b8 (blue) */
--border: 214.3 31.8% 91.4%; /* #e5e9f0 */
```

**Dark Mode** (globals.css:38-82):

```css
--background: 0 0% 4%; /* #0a0a0a */
--foreground: 0 0% 98%; /* #fafafa */
--primary: 217 91% 60%; /* #3b82f6 (blue-500) */
--card: 220 20% 15%; /* #1a1f2e (blue-gray) */
```

**High-Contrast Mode** (globals.css:84-133):

```css
--background: 0 0% 0%; /* #000000 pure black */
--foreground: 0 0% 100%; /* #ffffff pure white */
--primary: 180 100% 50%; /* #00ffff bright cyan */
--accent: 60 100% 50%; /* #ffff00 bright yellow */
```

### Extended Palette (tailwind.config.ts:20-106)

**Archon Cyberpunk Theme** (Blue Palette):

- Primary Blues: `#3b82f6` (blue-500), `#60a5fa` (lighter), `#2563eb` (darker)
- Purple Accents: `#8b5cf6` (violet), `#a78bfa` (lighter)
- Status Colors: `#22c55e` (green), `#f97316` (orange)

**Tanium Legacy Colors**:

- Primary: `#1a365d`
- Accent: `#3182ce`
- Success: `#38a169`
- Warning: `#d69e2e`
- Error: `#e53e3e`

### Semantic Tokens (Mapped to HSL Variables)

- `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `warning`

---

## 2. Typography

### Current Scale

**Base Font Size**: `16px` (globals.css:29)  
⚠️ **Issue**: Does NOT meet v1 requirement of 18px base for seniors-friendliness

**Type Scale** (Tailwind defaults, not customized):

- `text-xs`: 12px (0.75rem)
- `text-sm`: 14px (0.875rem)
- `text-base`: 16px (1rem) ⚠️ Should be 18px
- `text-lg`: 18px (1.125rem)
- `text-xl`: 20px (1.25rem)
- `text-2xl`: 24px (1.5rem)
- `text-3xl`: 30px (1.875rem)

**Font Stack** (globals.css:32-35):

```css
font-family:
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  sans-serif;
```

### Typography Issues Identified

1. **Base size too small**: 16px → needs 18px for seniors
2. **No customized type scale**: Using Tailwind defaults
3. **Line height not documented**: Should be 1.5-1.75 for readability
4. **Font weight hierarchy unclear**: No documented weight scale

---

## 3. Spacing System

### Current Scale (Tailwind defaults, not customized)

```
0:   0px
1:   4px    (0.25rem)
2:   8px    (0.5rem)
3:   12px   (0.75rem)
4:   16px   (1rem)
5:   20px   (1.25rem)
6:   24px   (1.5rem)
8:   32px   (2rem)
10:  40px   (2.5rem)
12:  48px   (3rem)
16:  64px   (4rem)
```

**Usage Pattern**: Standard Tailwind spacing, no custom tokens documented.

### Spacing Issues Identified

1. **No semantic spacing tokens**: e.g., `--spacing-section`, `--spacing-card-padding`
2. **Touch target compliance unclear**: Need 48px minimum (currently using `p-3` = 12px, `p-4` = 16px)
3. **Inconsistent component padding**: No documented standards

---

## 4. Component Inventory

### shadcn/ui Components (63 total)

**Core UI** (15):

- button, input, textarea, select, checkbox, radio-group, switch, slider, label, separator, badge, avatar, skeleton, progress, toast

**Layout** (8):

- card, sheet, dialog, drawer, popover, dropdown-menu, tooltip, hover-card

**Navigation** (5):

- breadcrumb, navigation-menu, command, menubar, tabs

**Data Display** (6):

- table, chart, accordion, collapsible, scroll-area, carousel

**Forms** (4):

- form, calendar, toggle, toggle-group

**Feedback** (3):

- alert, alert-dialog, loading-spinner, loading-states

**Specialized** (22):

- theme-provider, exam-dialog, help-tooltip, helpful-error
- **Magic UI Components**: 3d-card, animated-testimonials, background-beams, bento-grid, floating-navbar, hero-parallax, infinite-moving-cards, meteors, sparkles, text-generate-effect
- **Cyberpunk folder**: (need to investigate)

### Custom Budget Components (50+)

**Modals & Dialogs** (6):

- TransactionModal, SplitTransactionModal, HoldingModal, InvestmentAccountModal, ShortcutsModal, ConfirmDialog, ChatbotOptInDialog

**Charts & Visualizations** (7):

- AmortizationChart, InvestmentCharts, SpendingTrendChart, SpendingHeatMap, PredictiveSpendingChart, DebtOverview, DebtAnalysis, AccessibleChart

**Forms & Inputs** (5):

- CategoryCombobox, LoanForm, ReceiptUpload, BankSelectionStep, ImportWizardStepper

**Lists & Tables** (4):

- RecurringTransactions, PaymentHistory, AnomalyAlerts, OverspendingAlerts

**UI Polish** (8):

- LoadingSkeleton, Toast, SuccessCheckmark, ConfidenceMeter, ReceiptThumbnail, PWAInstallPrompt, EmptyState, HelpTooltip

**Chatbot** (8):

- Chatbot, ChatbotHelp, ChatbotButton, ChatbotPanel, ChatbotWidget, ChatbotHeader, ChatbotFooter, ChatbotInput, ChatbotMessages, MessageBubble, TypingIndicator

**Dashboard** (4):

- DashboardCustomizer, DraggableWidget, SpendingInsights, CommandPalette

**Loans** (3):

- ExtraPaymentCalculator, AmortizationChart, PaymentHistory

**Accessibility** (3):

- AccessibilitySettingsPanel, AccessibleChart, OnboardingTour

---

## 5. Motion & Animations

### Current Tokens (globals.css:222-318)

**Duration Scale** (implicit, not tokenized):

- Fast: 150ms (button press)
- Normal: 300ms (transitions)
- Slow: 500ms (fadeIn animations)

**Easing Curves** (not documented):

- Default: ease-out (button:354)
- Emphasized: cubic-bezier(0.4, 0, 0.2, 1) (glass-button:344)

**Keyframe Animations** (13 total):

- `cyber-pulse`, `neon-glow`, `particle-float`, `cyber-border`, `hologram-shimmer`, `progress-glow`
- `shimmer`, `fadeIn`, `accordion-down`, `accordion-up`, `typing-bounce`

### Reduced Motion Support

**System Preference** (globals.css:403-421):

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Manual Toggle** (globals.css:424-431):

```css
.reduce-motion * {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```

### Motion Issues Identified

1. **No tokenized duration scale**: Hard-coded values (150ms, 300ms, 500ms)
2. **Easing curves not documented**: No CSS variables for easing
3. **Animation guidelines missing**: No documentation for when to use which animation
4. **Too many decorative animations**: Cyberpunk animations may not be seniors-friendly

---

## 6. Accessibility Features

### Current Implementation

**Theme Modes** (3):

- ✅ Light mode (default)
- ✅ Dark mode (`.dark` class)
- ✅ High-contrast mode (`.high-contrast` class)

**High-Contrast Enhancements** (globals.css:434-535):

- ✅ 2px borders on buttons, inputs, cards
- ✅ 4px focus outlines
- ✅ Underlined links with bright cyan
- ✅ 2.5px stroke-width for icons
- ✅ No shadows/text-shadows for clarity
- ✅ Bright yellow selection highlight

**Reduced Motion**:

- ✅ System preference detection
- ✅ Manual toggle via `.reduce-motion` class
- ✅ Instant transitions (0.01ms)

**Touch Targets**:

- ⚠️ **Needs verification**: Are all interactive elements ≥48px × 48px?

**Focus Indicators**:

- ✅ Visible focus rings (2px teal in light/dark, 4px yellow in high-contrast)

### Accessibility Issues Identified

1. **Base font size**: 16px → needs 18px for WCAG 2.2 compliance (target size)
2. **Touch target audit needed**: Verify all buttons/links ≥48px
3. **Color contrast audit needed**: Verify 4.5:1 for text, 3:1 for UI in all modes
4. **ARIA documentation missing**: No guidelines for component ARIA usage

---

## 7. Design Token Architecture

### Current Structure

**CSS Custom Properties** (globals.css):

- ✅ Semantic tokens (background, foreground, primary, etc.)
- ✅ HSL color format for flexibility
- ✅ Theme mode overrides via `.dark` and `.high-contrast`

**Tailwind Extensions** (tailwind.config.ts):

- ✅ Extended color palette (archon, tanium)
- ✅ Border radius tokens (`--radius`)
- ✅ Keyframe animations
- ✅ Background gradients

### Token Issues Identified

1. **No comprehensive token sheet**: Tokens spread across files
2. **Inconsistent naming**: `archon-bg` vs `--background`
3. **Missing tokens**:
   - Typography scale tokens (font-size, line-height, font-weight)
   - Spacing semantic tokens (section, card, input padding)
   - Motion tokens (duration-fast, easing-default)
4. **Documentation gap**: No central token reference guide
5. **Legacy tokens**: Tanium colors unused, should be removed or documented

---

## 8. Inconsistencies & Areas for Standardization

### Color Inconsistencies

1. **Dual color systems**: Archon + Tanium palettes (tanium appears unused)
2. **Hard-coded colors**: Some components may use hex codes instead of tokens
3. **Accent color confusion**: `--accent` (purple) vs `--primary` (blue)

### Typography Inconsistencies

1. **Base size mismatch**: globals.css (16px) vs v1 plan requirement (18px)
2. **No documented hierarchy**: H1-H6 styles not defined
3. **Inconsistent text sizes**: Some components may use arbitrary sizes

### Spacing Inconsistencies

1. **No semantic spacing**: Using arbitrary Tailwind classes (`p-4`, `gap-6`)
2. **Component padding varies**: Cards use `p-4`, `p-6`, `p-8` inconsistently
3. **Touch target gaps**: Buttons may have padding but not meet 48px total height

### Component Inconsistencies

1. **Button variants**: Multiple button styles (archon-button, glass-button, primary, secondary)
2. **Card variants**: `.archon-card`, `.glass-card`, `.question-card` - need standardization
3. **Modal patterns**: 7 modal components with potentially inconsistent behavior
4. **Chart accessibility**: Need to verify all charts have text alternatives

---

## 9. Missing Tokens

### Typography Tokens Needed

```css
/* Font Size Scale */
--font-size-xs: 14px;
--font-size-sm: 16px;
--font-size-base: 18px; /* NEW: seniors-friendly */
--font-size-lg: 20px;
--font-size-xl: 24px;
--font-size-2xl: 30px;
--font-size-3xl: 36px;

/* Line Height Scale */
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;

/* Font Weight Scale */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Spacing Tokens Needed

```css
/* Semantic Spacing */
--spacing-section: 64px; /* Between major sections */
--spacing-card: 24px; /* Card padding */
--spacing-input: 12px; /* Input padding */
--spacing-button: 16px; /* Button padding */
--spacing-icon: 40px; /* Icon button size */
--spacing-touch-target: 48px; /* Minimum touch target */
```

### Motion Tokens Needed

```css
/* Duration Scale */
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

/* Easing Curves */
--easing-default: cubic-bezier(0.4, 0, 0.2, 1);
--easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
--easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
--easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
```

---

## 10. shadcn/ui Components in Use

### Verified Components (63)

**Buttons & Actions**:

- button.tsx ✅
- toggle.tsx ✅
- toggle-group.tsx ✅

**Form Inputs**:

- input.tsx ✅
- textarea.tsx ✅
- select.tsx ✅
- checkbox.tsx ✅
- radio-group.tsx ✅
- switch.tsx ✅
- slider.tsx ✅
- calendar.tsx ✅

**Layout**:

- card.tsx ✅
- separator.tsx ✅
- scroll-area.tsx ✅
- resizable.tsx ✅

**Overlays**:

- dialog.tsx ✅
- sheet.tsx ✅
- drawer.tsx ✅
- popover.tsx ✅
- tooltip.tsx ✅
- hover-card.tsx ✅
- dropdown-menu.tsx ✅
- alert-dialog.tsx ✅

**Navigation**:

- breadcrumb.tsx ✅
- navigation-menu.tsx ✅
- menubar.tsx ✅
- tabs.tsx ✅
- command.tsx ✅

**Data Display**:

- table.tsx ✅
- chart.tsx ✅
- badge.tsx ✅
- avatar.tsx ✅

**Feedback**:

- alert.tsx ✅
- toast.tsx + toaster.tsx ✅
- progress.tsx ✅
- skeleton.tsx ✅
- loading-spinner.tsx ✅
- loading-states.tsx ✅

**Form Components**:

- form.tsx ✅
- label.tsx ✅

**Advanced/Effects**:

- accordion.tsx ✅
- collapsible.tsx ✅
- carousel.tsx ✅
- pagination.tsx ✅

**Magic UI (Decorative)**:

- 3d-card.tsx
- animated-testimonials.tsx
- background-beams.tsx
- bento-grid.tsx
- floating-navbar.tsx
- hero-parallax.tsx
- infinite-moving-cards.tsx
- meteors.tsx
- sparkles.tsx
- text-generate-effect.tsx

**Custom/Specialized**:

- theme-provider.tsx ✅
- exam-dialog.tsx (TCO-specific)
- help-tooltip.tsx ✅
- helpful-error.tsx ✅
- cyberpunk/ (folder - needs investigation)

---

## 11. Recommendations

### Priority 1 (Blocking v1 Launch)

1. **Increase base typography to 18px** → Task: "05610c47-d0e5-4af3-95b2-32e4b1d86e59"
2. **Define comprehensive token architecture** → Task: "11aeb011-1fff-49c8-b0b7-bdb5aa0c5d1f"
3. **Implement design token CSS variables** → Task: "390a7c46-5f4c-4375-ad94-a77631b020ee"
4. **Create motion design tokens with reduced motion** → Task: "693a29c5-a6e4-4eca-a6ba-002faa303433"
5. **Audit touch targets for 48px compliance**
6. **Verify color contrast in all theme modes**

### Priority 2 (Should-Have)

7. **Build Storybook component playground** → Task: "a0004154-9f3d-4c69-aee7-17f3fae3a036"
8. **Create component library documentation** → Task: "5223a479-3492-4fbf-8059-015c3d923c61"
9. **Standardize button variants** (reduce from 5+ to 3-4 clear patterns)
10. **Standardize card variants** (archon-card, glass-card, or default card)
11. **Remove unused Tanium color tokens**
12. **Document ARIA patterns for all components**

### Priority 3 (Nice-to-Have)

13. **Create typography hierarchy documentation** (H1-H6, body, captions)
14. **Define semantic spacing tokens**
15. **Reduce cyberpunk decorative animations** (may not be seniors-friendly)
16. **Create design system website** (separate from Storybook)

---

## 12. Next Steps

### Immediate Actions

1. ✅ **This audit complete** → Mark task "68ffc607" as "review"
2. **Next task**: "Define theme modes token architecture" (task_id: 11aeb011-1fff-49c8-b0b7-bdb5aa0c5d1f)
3. **Then**: "Create motion design tokens" (task_id: 693a29c5-a6e4-4eca-a6ba-002faa303433)
4. **Then**: "Increase base typography scale to 18px" (task_id: 05610c47-d0e5-4af3-95b2-32e4b1d86e59)
5. **Then**: "Implement design token CSS variables" (task_id: 390a7c46-5f4c-4375-ad94-a77631b020ee)

### Testing Requirements

- **Color contrast audit**: Use axe DevTools or Lighthouse on all pages in all modes
- **Touch target audit**: Use Lighthouse "Target Size" audit (WCAG 2.2 Level AA)
- **Typography audit**: Test with seniors (60+) for readability
- **Component audit**: Review all 50+ budget components for token usage

---

## 13. Conclusion

The budget app has a **strong design system foundation** with mature accessibility features (3 theme modes, reduced motion, high-contrast enhancements). However, it requires **key updates** to meet v1 modernization goals:

- ✅ **Strengths**: Rich component library, semantic tokens, accessibility focus
- ⚠️ **Gaps**: Base typography (16px → 18px), token documentation, touch target verification
- 🔧 **Action**: Execute Epic 2 tasks to standardize tokens and increase base font size

**Status**: Audit complete, ready for Epic 2 implementation.

---

**Archon Task**: 68ffc607-4c54-418b-af0b-48b391c31c87 → **READY FOR REVIEW**
