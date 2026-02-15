# Accessibility Testing Guide

## Automated Testing (CI/CD)

The budget app has automated accessibility testing configured to run on every pull request that touches budget app code.

### What Gets Tested

**Tools:**

- **Lighthouse CI**: Tests accessibility score (threshold: ≥95%)
- **Pa11y**: Tests for WCAG 2.1 AA violations (threshold: 0 errors)

**Routes Tested:**

- `/budget-app` (Dashboard)
- `/budget-app/transactions`
- `/budget-app/budgets`
- `/budget-app/loans`
- `/budget-app/investments`
- `/budget-app/reports`
- `/budget-app/categories`

**Standards:**

- WCAG 2.1 Level AA compliance
- Color contrast ratios (4.5:1 for text, 3:1 for UI components)
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Proper ARIA attributes

### CI Workflow

The workflow runs automatically when you:

1. Open a pull request
2. Push changes to an open PR
3. Modify budget app code paths

**Workflow file:** `.github/workflows/accessibility-tests.yml`

### Viewing Reports

When the workflow completes:

1. **In the PR**: A bot comment shows pass/fail status for each tool
2. **In Actions tab**: View detailed logs
3. **Artifacts**: Download full HTML reports (retained for 30 days)

**Downloading Reports:**

1. Go to the failed workflow run
2. Scroll to "Artifacts" section at bottom
3. Download `accessibility-reports.zip`
4. Extract and open:
   - `lighthouse/*.html` - Interactive Lighthouse reports
   - `pa11y-results.json` - Detailed WCAG violations

## Running Tests Locally

### Prerequisites

```bash
npm install
npm install -g @lhci/cli pa11y pa11y-ci
```

### Method 1: Quick Local Test

```bash
# Build and start production server
npm run build
npm start &

# Wait for server
npx wait-on http://localhost:3001

# Run Lighthouse CI
lhci autorun --config=lighthouserc.json

# Run Pa11y
pa11y-ci --config=.pa11yci.json

# Stop server
killall node
```

### Method 2: Test Single Page

```bash
# Start dev server
npm run dev

# In another terminal - test with Lighthouse
npx lighthouse http://localhost:3001/budget-app --only-categories=accessibility --view

# Test with Pa11y
npx pa11y http://localhost:3001/budget-app --runner axe --standard WCAG2AA
```

### Method 3: Visual Audit (Manual)

Use browser dev tools:

**Chrome DevTools:**

1. Open budget app page
2. F12 → Lighthouse tab
3. Select "Accessibility" category
4. Run audit
5. Review issues

**Firefox Accessibility Inspector:**

1. Open budget app page
2. F12 → Accessibility tab
3. Enable "Check for issues"
4. Review violations

## Common Issues and Fixes

### Color Contrast

**Issue:** Text doesn't meet 4.5:1 contrast ratio

**Check:**

```bash
# Use Chrome DevTools color picker
# Shows contrast ratio for selected color
```

**Fix:**

```css
/* Bad - low contrast */
color: #999999;
background: #ffffff; /* 2.8:1 */

/* Good - sufficient contrast */
color: #666666;
background: #ffffff; /* 5.7:1 */
```

### Missing Alt Text

**Issue:** Images without alt attributes

**Fix:**

```tsx
{
  /* Bad */
}
<img src="/icon.png" />;

{
  /* Good */
}
<img src="/icon.png" alt="Budget category icon" />;

{
  /* Decorative images */
}
<img src="/decoration.png" alt="" role="presentation" />;
```

### Form Labels

**Issue:** Form inputs without associated labels

**Fix:**

```tsx
{/* Bad */}
<input type="text" placeholder="Enter amount" />

{/* Good */}
<label htmlFor="amount">Amount</label>
<input id="amount" type="text" />

{/* Or using aria-label */}
<input type="text" aria-label="Transaction amount" />
```

### Keyboard Navigation

**Issue:** Interactive elements not keyboard accessible

**Fix:**

```tsx
{
  /* Bad - div with onClick */
}
<div onClick={handleClick}>Click me</div>;

{
  /* Good - button element */
}
<button onClick={handleClick}>Click me</button>;

{
  /* Or make div accessible */
}
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={(e) => e.key === "Enter" && handleClick()}
>
  Click me
</div>;
```

### Focus Indicators

**Issue:** No visible focus indicator

**Fix:**

```css
/* Bad - removes focus outline */
button:focus {
  outline: none;
}

/* Good - custom focus style */
button:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}
```

### Heading Hierarchy

**Issue:** Skipped heading levels (h1 → h3)

**Fix:**

```tsx
{/* Bad */}
<h1>Dashboard</h1>
<h3>Recent Transactions</h3>

{/* Good */}
<h1>Dashboard</h1>
<h2>Recent Transactions</h2>
```

## Testing Checklist

Before submitting a PR:

- [ ] Run Lighthouse audit locally (≥95% score)
- [ ] Run Pa11y locally (0 errors)
- [ ] Test keyboard navigation (Tab, Enter, Esc, Arrow keys)
- [ ] Verify all images have alt text
- [ ] Check color contrast ratios
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Verify focus indicators are visible
- [ ] Check heading hierarchy (no skipped levels)
- [ ] Test form labels and error messages
- [ ] Verify ARIA attributes are correct

## Resources

### Official Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse Accessibility Scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)

### Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

### Testing

- [NVDA Screen Reader](https://www.nvaccess.org/download/) (Windows)
- [VoiceOver](https://support.apple.com/guide/voiceover/welcome/mac) (macOS)
- [Keyboard Testing Guide](https://webaim.org/articles/keyboard/)

## Configuration Files

### lighthouserc.json

Located in project root. Configure:

- `url`: Routes to test
- `numberOfRuns`: Runs per route (default: 3)
- `minScore`: Passing threshold (0.95 = 95%)

### .pa11yci.json

Located in project root. Configure:

- `urls`: Routes to test
- `standard`: WCAG standard (WCAG2AA)
- `runners`: Testing engine (axe)
- `timeout`: Max wait time per page
- `wait`: Delay before testing (for React hydration)

## Troubleshooting

### Tests Failing Locally But Passing in CI

**Cause:** Different browser versions or environment

**Fix:**

```bash
# Use same Chrome version as CI
npx @lhci/cli --chrome-flags="--headless"
```

### Pa11y Timeout Errors

**Cause:** React hydration not complete

**Fix:** Increase wait time in `.pa11yci.json`:

```json
{
  "defaults": {
    "wait": 5000,
    "actions": ["wait for element body to be visible", "wait for 5000ms"]
  }
}
```

### False Positives

**Cause:** Third-party code (PostHog, analytics)

**Fix:** Hide elements in `.pa11yci.json`:

```json
{
  "defaults": {
    "hideElements": ".posthog-toolbar, #analytics-script"
  }
}
```

## Support

If you have questions about accessibility testing:

1. Check this documentation
2. Review failed test artifacts
3. Consult WCAG 2.1 guidelines
4. Ask in #budget-app Slack channel
