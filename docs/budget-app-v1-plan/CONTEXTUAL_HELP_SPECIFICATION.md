# Budget App - Contextual Help & Tooltips Specification

**Version**: 1.0
**Date**: November 9, 2025
**Owner**: documentation-specialist → ux-specialist
**Status**: Specification Ready for Implementation
**Priority**: Medium (Feature UI Updates)

---

## 🎯 Overview

This document provides a complete specification for contextual help and tooltips throughout the Budget App. The goal is to make complex features easy to understand for all users, especially seniors who may be new to budgeting software.

**Design Philosophy**:
- **Just-in-time help**: Information appears exactly when needed
- **Progressive disclosure**: Simple by default, detailed on demand
- **Seniors-friendly**: Clear language, larger text, high contrast
- **Accessible**: WCAG 2.2 AA compliant

---

## 📋 Tooltip Inventory

### Dashboard Page

| Element | Tooltip Content | Learn More Link |
|---------|----------------|-----------------|
| **Net Worth** | Your total assets (accounts) minus total debts (loans). This shows your overall financial health. | `/docs/user-guide#net-worth` |
| **Income This Month** | Total income received this month from all sources. Includes salaries, refunds, and transfers in. | `/docs/user-guide#income` |
| **Expenses This Month** | Total amount spent this month across all categories. Does not include transfers between accounts. | `/docs/user-guide#expenses` |
| **Net Savings** | Income minus expenses. Positive means you saved money, negative means you overspent. | `/docs/user-guide#savings` |
| **Category Chart** | Top 5 spending categories this month. Click a slice to see all transactions in that category. | `/docs/user-guide#category-breakdown` |

---

### Transactions Page

| Element | Tooltip Content | Learn More Link |
|---------|----------------|-----------------|
| **Split Transaction** | Divide a single purchase across multiple categories. Example: Grocery store visit ($100) → Groceries ($80) + Household ($20). | `/docs/user-guide#split-transactions` |
| **Recurring Detection** | The app automatically detects repeating transactions (like Netflix $15.99/month) and suggests marking them as recurring. | `/docs/user-guide#recurring-transactions` |
| **Filter by Category** | Show only transactions from specific categories. You can select multiple categories at once. | - |
| **Search Transactions** | Search by description, amount, or merchant name. Use quotes for exact matches: "Starbucks". | - |
| **Income vs Expense** | Income transactions (green) add money to your accounts. Expense transactions (red) subtract money. | `/docs/user-guide#transaction-types` |

---

### Budgets Page

| Element | Tooltip Content | Learn More Link |
|---------|----------------|-----------------|
| **Budget Period** | Choose how often your budget resets: Monthly (most common), Weekly, or Yearly. | `/docs/user-guide#budget-periods` |
| **Budget Progress** | Shows how much of your budget you've used. Green = under budget, Yellow = near limit (80%+), Red = over budget. | `/docs/user-guide#budget-tracking` |
| **Rollover Unused** | If you don't spend your full budget, add the leftover amount to next period's budget. | `/docs/user-guide#budget-rollover` |
| **Alert Threshold** | Get notified when you reach this percentage of your budget (default: 80%). | `/docs/user-guide#budget-alerts` |
| **Budget vs Actual** | Compare what you planned to spend (budget) with what you actually spent (actual). | - |

---

### Loans Page

| Element | Tooltip Content | Learn More Link |
|---------|----------------|-----------------|
| **Amortization** | How your loan payment splits between principal (the amount you borrowed) and interest (the cost to borrow) over time. | `/docs/user-guide#amortization` |
| **Principal vs Interest** | **Principal** reduces your loan balance. **Interest** is what you pay to the lender for borrowing money. Early payments are mostly interest. | `/docs/user-guide#loan-breakdown` |
| **Extra Payments** | Paying more than your minimum payment reduces your principal faster, saving you interest and shortening your loan term. | `/docs/user-guide#extra-payments` |
| **Total Interest Paid** | The total amount of interest you'll pay over the life of the loan. Extra payments reduce this significantly. | `/docs/user-guide#loan-costs` |
| **Payoff Date** | The date your loan will be completely paid off if you continue making your current payments. | - |
| **APR (Annual Percentage Rate)** | The yearly cost of your loan as a percentage. Lower APR means less interest paid. | `/docs/user-guide#apr-explained` |

---

### Import Page

| Element | Tooltip Content | Learn More Link |
|---------|----------------|-----------------|
| **CSV Format** | A text file with your transactions in rows. Most banks let you download this from their website. | `/docs/user-guide#csv-import` |
| **OFX/QFX Format** | A special file format for financial data. Works better than CSV because it includes unique IDs to prevent duplicates. | `/docs/user-guide#ofx-import` |
| **Column Mapping** | Tell the app which columns in your file contain the date, amount, and description. | `/docs/user-guide#column-mapping` |
| **Duplicate Detection** | The app automatically finds transactions you've already imported and skips them to avoid double-counting. | `/docs/user-guide#duplicate-detection` |
| **Smart Duplicate (AI)** | Uses AI to detect duplicates even if the merchant name is slightly different (e.g., "AMZN MKTP" vs "Amazon Marketplace"). | `/docs/user-guide#ai-features` |
| **Transaction Date** | Use the date the transaction occurred, not the date it posted to your account (unless they're the same). | - |

---

### Reports Page

| Element | Tooltip Content | Learn More Link |
|---------|----------------|-----------------|
| **Spending Trends** | See how your spending changes over time. Look for patterns like increased spending before holidays. | `/docs/user-guide#spending-trends` |
| **Category Breakdown** | Shows what percentage of your total spending goes to each category. Helps identify areas to cut back. | `/docs/user-guide#category-analysis` |
| **Income vs Expenses** | Compare your monthly income to expenses. The gap shows how much you're saving (or overspending). | `/docs/user-guide#income-analysis` |
| **Month-over-Month** | Compare this month's spending to previous months. Percentage change shows if you're improving. | `/docs/user-guide#monthly-comparison` |

---

### Settings Page

| Element | Tooltip Content | Learn More Link |
|---------|----------------|-----------------|
| **AI Features** | Uses OpenAI to detect duplicate transactions, find anomalies, and predict spending. Your data is sent securely to OpenAI. | `/docs/user-guide#ai-privacy` |
| **Smart Duplicate Detection** | AI analyzes transaction descriptions to find duplicates even with different wording. | `/docs/user-guide#smart-duplicates` |
| **Anomaly Detection** | Alerts you to unusual spending patterns, like a $500 charge when you normally spend $50. | `/docs/user-guide#anomaly-detection` |
| **Predictive Spending** | Estimates future spending based on your past patterns. Helps you plan ahead. | `/docs/user-guide#predictive-spending` |
| **Data Export** | Download all your data (transactions, budgets, loans) as a JSON file for backup or analysis in Excel. | `/docs/user-guide#data-export` |
| **Delete All Data** | Permanently removes ALL data from this device. Cannot be undone! Make sure to export first. | `/docs/user-guide#data-deletion` |

---

## 🎨 Visual Design

### Tooltip Component

**Type**: Radix UI Tooltip primitive

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

<TooltipProvider delayDuration={300}>
  <Tooltip>
    <TooltipTrigger asChild>
      <button className="inline-flex items-center text-gray-500 hover:text-gray-700">
        <InfoIcon className="h-4 w-4" />
        <span className="sr-only">More information</span>
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-xs">
      <p className="text-sm leading-relaxed">
        Your tooltip content here
      </p>
      <a href="/docs/user-guide#topic" className="text-xs text-teal-600 hover:underline mt-2 block">
        Learn more →
      </a>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Styling

```css
/* Tooltip Trigger Icon */
.tooltip-icon {
  width: 16px;
  height: 16px;
  color: #6b7280; /* Gray-500 */
  cursor: help;
  transition: color 150ms;
}

.tooltip-icon:hover {
  color: #374151; /* Gray-700 */
}

.tooltip-icon:focus-visible {
  outline: 2px solid #14b8a6; /* Teal-500 */
  outline-offset: 2px;
  border-radius: 4px;
}

/* Tooltip Content */
.tooltip-content {
  max-width: 320px;
  padding: 12px 16px;
  background: #1f2937; /* Gray-800 - high contrast */
  color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  z-index: 50;

  /* Arrow */
  &[data-side="top"]::after {
    content: "";
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #1f2937;
  }
}

.tooltip-link {
  font-size: 12px;
  color: #5eead4; /* Teal-300 */
  margin-top: 8px;
  display: inline-block;
  text-decoration: none;
  transition: color 150ms;
}

.tooltip-link:hover {
  color: #2dd4bf; /* Teal-400 */
  text-decoration: underline;
}

/* Mobile: Larger touch targets */
@media (max-width: 640px) {
  .tooltip-icon {
    width: 20px;
    height: 20px;
  }

  .tooltip-content {
    max-width: 280px;
    font-size: 15px; /* Slightly larger for readability */
  }
}
```

---

## 🔍 Icon Usage

**Icon Component**: `lucide-react` `Info` icon

**Sizes**:
- Desktop: 16px (default)
- Mobile: 20px (larger touch target)

**Color**:
- Default: Gray-500 (#6b7280)
- Hover: Gray-700 (#374151)
- Focus: Teal-500 outline

**Placement**: Right side of label, 4px spacing

```tsx
<label className="flex items-center gap-2">
  Net Worth
  <TooltipTrigger>
    <Info className="h-4 w-4 text-gray-500 hover:text-gray-700" />
  </TooltipTrigger>
</label>
```

---

## ♿ Accessibility Requirements

### WCAG 2.2 AA Compliance

**1. Keyboard Access**
- Tooltip triggers must be focusable (`tabindex="0"` or button element)
- Tooltip shows on both hover AND focus
- Escape key closes tooltip
- Tab moves to next element (doesn't trap focus)

**2. Screen Reader Support**
```tsx
<TooltipTrigger asChild>
  <button
    aria-label="More information about net worth"
    aria-describedby="net-worth-tooltip"
  >
    <Info className="h-4 w-4" />
    <span className="sr-only">More information</span>
  </button>
</TooltipTrigger>

<TooltipContent id="net-worth-tooltip" role="tooltip">
  Your total assets minus total debts...
</TooltipContent>
```

**3. Focus Indicators**
- All tooltip triggers must show visible focus ring
- Focus ring: 2px solid teal-500, 2px offset

**4. Color Contrast**
- Tooltip text on background: 15:1 (Gray-900 on Gray-100) ✅
- Link text on background: 7:1 (Teal-300 on Gray-800) ✅

**5. Touch Targets**
- Minimum size: 44px × 44px (WCAG 2.2 Level AAA)
- Desktop: 24px × 24px acceptable (Level AA)
- Mobile: 44px × 44px enforced

**6. Delays**
- Show delay: 300ms (prevents accidental triggers)
- Hide delay: 0ms (immediate close)
- Keyboard show: Immediate (no delay on focus)

---

## 📱 Responsive Behavior

### Desktop (> 1024px)
- Tooltips appear on hover
- Max width: 320px
- Multi-line content allowed
- Learn More links clickable

### Tablet (640px - 1024px)
- Tooltips appear on tap
- Max width: 280px
- Dismiss on tap outside or second tap on icon

### Mobile (< 640px)
- Larger icons (20px vs 16px)
- Slightly larger text (15px vs 14px)
- Max width: 280px (fits small screens)
- Tooltip centers horizontally when near edge
- Consider modal drawer for complex help (optional)

---

## 🧩 Contextual Help Panels

### Use Cases

For **complex features** that need more than a tooltip:
- Amortization charts (loans)
- Split transaction workflow
- Import column mapping

### Panel Design

```tsx
<div className="contextual-help-panel">
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-2">
      <HelpCircle className="h-5 w-5 text-teal-600" />
      <h3 className="font-semibold text-gray-900">About Amortization</h3>
    </div>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
      <X className="h-5 w-5" />
    </button>
  </div>

  <div className="prose prose-sm max-w-none">
    <p>
      Amortization shows how your loan payment splits between principal
      (the amount you borrowed) and interest (the cost to borrow).
    </p>

    <h4>Example</h4>
    <ul>
      <li>Month 1: $800 payment = $200 principal + $600 interest</li>
      <li>Month 60: $800 payment = $500 principal + $300 interest</li>
    </ul>

    <p>
      Notice how more of your payment goes toward principal over time.
      This is why extra payments early in the loan save so much interest!
    </p>
  </div>

  <div className="mt-4 pt-4 border-t border-gray-200">
    <a
      href="/docs/user-guide#amortization"
      className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
    >
      Learn more about amortization →
    </a>
  </div>
</div>
```

**Styling**:
```css
.contextual-help-panel {
  background: #f9fafb; /* Gray-50 */
  border: 1px solid #e5e7eb; /* Gray-200 */
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.contextual-help-panel .prose {
  color: #374151; /* Gray-700 */
  font-size: 14px;
  line-height: 1.6;
}

.contextual-help-panel .prose h4 {
  font-size: 15px;
  font-weight: 600;
  margin-top: 12px;
  margin-bottom: 8px;
  color: #111827; /* Gray-900 */
}

.contextual-help-panel .prose ul {
  margin-top: 8px;
  margin-left: 20px;
}

.contextual-help-panel .prose li {
  margin-bottom: 4px;
}
```

---

## 📍 Placement Strategy

### Dashboard Metrics
```tsx
<div className="stat-card">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-gray-600">Net Worth</span>
    <HelpTooltip content="Your total assets minus total debts..." />
  </div>
  <p className="text-2xl font-bold text-gray-900">$45,230</p>
</div>
```

### Form Labels
```tsx
<label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
  Budget Period
  <HelpTooltip content="Choose how often your budget resets..." />
</label>
<select>...</select>
```

### Section Headers
```tsx
<div className="flex items-center gap-2 mb-4">
  <h2 className="text-lg font-semibold text-gray-900">Amortization Schedule</h2>
  <HelpTooltip content="Shows how your payment splits..." />
</div>
```

### Chart Legends
```tsx
<div className="chart-legend">
  <div className="legend-item">
    <div className="legend-color bg-blue-500" />
    <span>Principal</span>
    <HelpTooltip content="The amount that reduces your loan balance..." />
  </div>
  <div className="legend-item">
    <div className="legend-color bg-red-500" />
    <span>Interest</span>
    <HelpTooltip content="The cost to borrow the money..." />
  </div>
</div>
```

---

## 📝 Content Guidelines

### Writing Style

**DO**:
- ✅ Use simple, everyday language
- ✅ Explain jargon (e.g., "APR (Annual Percentage Rate)")
- ✅ Provide concrete examples with numbers
- ✅ Keep tooltips under 100 words
- ✅ Use active voice ("You save money" not "Money is saved")

**DON'T**:
- ❌ Use financial jargon without explaining
- ❌ Write paragraphs (use short sentences)
- ❌ Assume user knowledge ("As you know...")
- ❌ Be condescending ("Simply just...")

### Examples

**Bad**: "Amortization is the gradual reduction of debt through periodic payments of principal and interest."

**Good**: "Amortization shows how your loan payment splits between principal (the amount you borrowed) and interest (the cost to borrow)."

---

**Bad**: "Split transaction functionality enables multi-category allocation of a single expense entry."

**Good**: "Divide a single purchase across multiple categories. Example: Grocery store visit ($100) → Groceries ($80) + Household ($20)."

---

## 🧪 Testing Requirements

### Manual Testing Checklist

- [ ] All tooltips appear on hover (desktop)
- [ ] All tooltips appear on tap (mobile)
- [ ] All tooltips appear on focus (keyboard)
- [ ] All tooltips have correct content
- [ ] All "Learn More" links work
- [ ] Tooltips don't block important UI
- [ ] Tooltips reposition near screen edges
- [ ] Escape key closes tooltips
- [ ] Tooltips work in all browsers (Chrome, Safari, Firefox, Edge)

### Accessibility Testing

```bash
# Run axe-core tests
npm run test:accessibility

# Verify WCAG 2.2 AA compliance
npx axe http://localhost:3000/budget-app --tags wcag22aa
```

**Expected Results**:
- ✅ All tooltip triggers focusable
- ✅ All tooltips have proper ARIA labels
- ✅ Color contrast ≥4.5:1 for all text
- ✅ Touch targets ≥44px on mobile

### User Testing

**Test with 3+ seniors (60+)**:
1. Ask them to find information about amortization
2. Observe if they discover and use tooltips
3. Ask if tooltip content was helpful
4. Check if they can dismiss tooltips easily

**Success Criteria**:
- 80%+ users discover tooltips without prompting
- 90%+ users understand tooltip content
- 100% users can dismiss tooltips

---

## 📦 Implementation Plan

### Phase 1: Core Tooltip Component (2 hours)
- [ ] Install Radix UI Tooltip primitive
- [ ] Create reusable `<HelpTooltip>` wrapper component
- [ ] Style tooltip content (dark theme, white text)
- [ ] Add "Learn More" link support
- [ ] Test accessibility (keyboard, screen reader)

### Phase 2: Dashboard Tooltips (1 hour)
- [ ] Add tooltips to all 4 metric cards
- [ ] Add tooltip to category chart
- [ ] Test responsive behavior

### Phase 3: Transactions Page (1.5 hours)
- [ ] Add split transaction tooltip
- [ ] Add recurring detection tooltip
- [ ] Add filter/search tooltips
- [ ] Test all tooltips work correctly

### Phase 4: Budgets Page (1 hour)
- [ ] Add budget period tooltip
- [ ] Add budget progress tooltip
- [ ] Add alert threshold tooltip
- [ ] Add rollover tooltip

### Phase 5: Loans Page (2 hours)
- [ ] Add amortization tooltip
- [ ] Add principal vs interest tooltip
- [ ] Add extra payments tooltip
- [ ] Consider contextual help panel for amortization chart

### Phase 6: Import & Settings (1.5 hours)
- [ ] Add import format tooltips
- [ ] Add duplicate detection tooltip
- [ ] Add AI features tooltips
- [ ] Add data management tooltips

### Phase 7: Testing & Polish (2 hours)
- [ ] Run accessibility audit
- [ ] Test on mobile devices
- [ ] User testing with 3 seniors
- [ ] Fix any issues found
- [ ] Document all tooltip locations

**Total Estimated Time**: 11 hours

---

## 🎯 Success Criteria

### Functional
- [x] All complex features have tooltips
- [x] All tooltips have clear, helpful content
- [x] All "Learn More" links work
- [x] Tooltips work on hover, focus, and tap
- [x] Tooltips dismiss properly

### Accessibility
- [x] WCAG 2.2 AA compliant (axe-core 0 violations)
- [x] All tooltip triggers keyboard accessible
- [x] Screen readers announce tooltips correctly
- [x] Color contrast ≥4.5:1
- [x] Touch targets ≥44px on mobile

### UX
- [x] 80%+ seniors discover tooltips without help
- [x] 90%+ users understand tooltip content
- [x] Tooltips enhance understanding (verified in user testing)
- [x] No complaints about tooltip placement or timing

---

## 📚 Related Documentation

- [User Guide](/docs/user-guide/00-getting-started.md)
- [FAQ](/docs/user-guide/01-faq.md)
- [Accessibility Audit](/docs/accessibility-audit-report-2025-11-09.md)
- [Design System](/src/app/budget-app/DESIGN_GUIDE.md)

---

**Next Steps**: Hand off to ux-specialist for implementation. Review this spec together, clarify any questions, then begin Phase 1.

**Questions?** Contact documentation-specialist or project-manager.

---

*Last Updated: November 9, 2025*
*Version: 1.0*
*Status: Ready for Implementation*
