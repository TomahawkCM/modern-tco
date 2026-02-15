# Competitive Analysis - Quick Reference

**Full Report**: See `competitive-analysis.md` (12 sections, detailed findings)
**Date**: November 9, 2025
**Apps**: Mint (shutdown), YNAB, Monarch Money, Copilot, Simplifi

---

## TL;DR: Top 5 Takeaways

1. **Navigation**: Hybrid mobile nav (tab bar + menu) is modern standard → **We should adopt**
2. **Accessibility**: ZERO budget apps offer high-contrast mode or claim WCAG 2.2 AA → **Massive competitive advantage**
3. **Seniors-Friendly**: No apps use 18px+ base typography or 48px+ touch targets → **Untapped market**
4. **Best UX**: Copilot (4.8/5 rating, native iOS/Mac) shows users want native performance + clean design
5. **Market Gap**: Mint shutdown left users wanting free + privacy-first option → **Our PWA model wins**

---

## Quick Pattern Reference

### Navigation (Adopt These)

✅ **Mobile**: Bottom tab bar (Home, Transactions, Budgets, Loans, More) + hamburger in "More"
✅ **Desktop**: Left sidebar with collapsible groups (Core, Planning, Wealth, Tools)
✅ **Power Users**: Command palette (Cmd/Ctrl+K) for quick navigation
✅ **Widgets**: Home screen widgets for budget summary (reduce app opens)

### Dashboard (Adopt These)

✅ **Metric Cards**: Large numbers + trend arrows (↑↓) + non-color indicators
✅ **Visual Progress**: Progress bars + percentages (not color-only)
✅ **Customization**: Drag-and-drop reordering, show/hide widgets
✅ **Mobile Layout**: Single-column, sparklines instead of complex charts
✅ **Accessibility**: Data table toggle for screen readers

### Forms (Adopt These)

✅ **Smart Defaults**: Today's date, last category used, suggested payee
✅ **Simplicity**: Amount, category, date, note (optional fields collapsible)
✅ **Native Inputs**: `type="number"`, `type="date"` for better mobile UX
✅ **AI Categorization**: Use OpenAI API (we're already planning this)
✅ **Bulk Actions**: Select multiple transactions for edit/delete/categorize

### Accessibility (P0 - MVP Must-Haves)

✅ **3 Theme Modes**: Light, dark, **high-contrast** (7:1+ contrast) - **Industry first**
✅ **18px Base Typography**: Seniors-friendly (competitors use 14-16px)
✅ **48px Touch Targets**: WCAG 2.2 Level AA (competitors likely use 44px)
✅ **Reduced Motion**: Respect `prefers-reduced-motion` media query
✅ **Screen Reader**: ARIA labels, keyboard navigation, tested with NVDA/VoiceOver
✅ **WCAG 2.2 AA**: Target 95+ Lighthouse score (no competitors claim this)

---

## Competitive Positioning

### Our Strengths vs Competitors

| Feature                | Budget App v1 | Copilot (Best)           | YNAB         | Others  |
| ---------------------- | ------------- | ------------------------ | ------------ | ------- |
| **Free**               | ✅            | ❌ ($95/yr)              | ❌ ($100/yr) | ❌      |
| **Local-First**        | ✅            | ❌                       | ❌           | ❌      |
| **Offline PWA**        | ✅            | ❌                       | ❌           | ❌      |
| **18px Typography**    | ✅            | Unknown                  | ❌           | ❌      |
| **48px Touch Targets** | ✅            | Unknown                  | ❌           | ❌      |
| **High-Contrast Mode** | ✅            | ❌                       | ❌           | ❌      |
| **WCAG 2.2 AA**        | ✅ (target)   | Unknown                  | Partial      | Unknown |
| **AI Chatbot**         | ✅ (OpenAI)   | ✅ (categorization only) | ❌           | ❌      |

### Positioning Statement

**"The only budget app built for everyone: free, private, accessible, and seniors-friendly."**

**Target users:**

- Seniors (60+) seeking simple budgeting
- Privacy-conscious (local-first data)
- Accessibility-focused (screen readers, high-contrast, reduced motion)
- Former Mint users (free alternative)
- Mobile-first users

---

## What Competitors Do Well

### Copilot (4.8/5 rating - Highest)

- **Native apps** (Mac/iPhone/iPad) = best performance
- **Light + Dark mode** support
- **Widgets** for quick checks
- **Quick launcher** (Cmd+K pattern)
- **Bulk actions** for power users
- **AI categorization** with custom rules

### YNAB

- **Accessibility commitment** (only app with documented screen reader support)
- **Active VoiceOver improvements**
- **iOS widgets**

### Monarch Money

- **Clean, modern design** with visual appeal
- **New mobile nav** (2024): Transactions center, menu for all
- **Dashboard customization**
- **Visual progress bars**

### Simplifi

- **Straightforward navigation** ("never stuck or confused")
- **Dashboard tiles with swipe**
- **Menu-based access** to all features

---

## What NO Competitor Does (Our Opportunities)

1. **High-contrast mode** → First budget app with 7:1+ contrast theme
2. **WCAG 2.2 AA compliance** → First to claim 95+ Lighthouse score
3. **Seniors-optimized** → First with 18px+ typography + 48px+ touch targets
4. **Free + Privacy-first** → Mint shutdown left gap
5. **AI chatbot** → Only Copilot has AI (categorization only, not conversational)

---

## P0 Recommendations (MVP Must-Haves)

**From the full analysis, these are blocking for v1 launch:**

### Navigation & IA

1. Bottom tab bar (4-5 items) + "More" menu for mobile
2. Desktop left sidebar with collapsible groups
3. Command palette (Cmd/Ctrl+K) for power users

### Accessibility (Non-Negotiable)

4. 3 theme modes: Light, Dark, **High-Contrast**
5. 18px base typography (seniors-friendly)
6. 48px minimum touch targets (WCAG 2.2 Level AA)
7. Reduced motion mode (`prefers-reduced-motion`)
8. Screen reader support (ARIA labels, keyboard nav, tested)

### Dashboard & UX

9. Widget customization (drag-and-drop, show/hide)
10. Visual progress bars (not color-only)
11. Smart transaction forms (auto-categorization, smart defaults)

---

## Next Steps (Week 1)

1. ✅ **Epic 1 Complete**: Research done, patterns identified
2. **Epic 2 Next**: Audit current design system, map to these patterns
3. **Design System**: Define 3 theme token architectures (light/dark/high-contrast)
4. **IA Design**: Create sitemap with hybrid navigation
5. **Prototyping**: Sketch mobile tab bar + desktop sidebar layouts

---

**For Full Details**: Read `competitive-analysis.md` (12 sections, pattern library, screenshots references)
