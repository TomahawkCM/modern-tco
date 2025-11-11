# Budget App - Critical Bugs Found During Device Testing

**Source**: Device Testing Task `9e3e301d-3001-4e08-9f59-21bbfd855a96`
**Date**: November 9, 2025
**Tester**: QA Engineer

---

## 🚨 P0 BLOCKER #1: Transaction Modal - Select Dropdown Timeout

**Severity**: P0 - Blocker
**Impact**: Users CANNOT add transactions (core functionality broken)
**Affected Platforms**: Desktop Chrome, Mobile Chrome (likely all platforms)
**Location**: `src/components/budget/TransactionModal.tsx`

### Description
When clicking "Add Transaction", the modal opens but the select dropdown becomes unresponsive. Playwright tests timeout after 30 seconds trying to interact with the select element.

### Steps to Reproduce
1. Navigate to http://localhost:3001/budget-app/transactions
2. Click "Add Transaction" button
3. Modal opens successfully
4. Attempt to interact with the first select dropdown (Type field)
5. Element does not respond - timeout after 30s

### Expected Behavior
- Dropdown should be immediately interactive
- User can select "Expense", "Income", or "Transfer"
- Form submission should work

### Actual Behavior
- Playwright test fails: `locator.selectOption: Test timeout of 30000ms exceeded`
- Select element resolves in DOM but is not interactive
- Test location: `tests/budget-app-critical-flows.spec.ts:40`

### Root Cause Hypotheses
1. **Disabled State**: Select element may have `disabled` attribute on mount
2. **Overlay Blocking**: Z-index issue or modal backdrop blocking interaction
3. **Race Condition**: Element renders before being fully interactive
4. **Custom Component**: If using custom select (not native), may have accessibility issues

### Recommended Fix
```tsx
// Check TransactionModal.tsx
// Ensure select is not disabled
<select
  name="type"
  value={formData.type}
  onChange={handleChange}
  disabled={false} // <-- Verify this
  className="..."
>
  <option value="expense">Expense</option>
  <option value="income">Income</option>
  <option value="transfer">Transfer</option>
</select>

// If using custom select component:
// - Add proper ARIA attributes
// - Ensure keyboard accessibility
// - Test with real select element first
```

### Verification Steps
1. Fix the issue
2. Run: `npx playwright test tests/budget-app-critical-flows.spec.ts:40`
3. Manually test: Click "Add Transaction" and interact with dropdown
4. Verify on mobile emulation (Pixel 5, iPhone 13)

### Priority Justification
**BLOCKER**: Without this fix, users cannot add transactions - the primary function of the budget app is broken.

---

## 🚨 P1 HIGH: CSV Import - UI Elements Not Found

**Severity**: P1 - High
**Impact**: Users cannot import bank statements
**Affected Platforms**: Desktop Chrome, Mobile Chrome (likely all platforms)
**Location**: `src/app/budget-app/import/page.tsx`

### Description
The CSV import page loads successfully, but Playwright cannot find the file input or drag-drop zone elements. This blocks the entire import workflow.

### Steps to Reproduce
1. Navigate to http://localhost:3001/budget-app/import
2. Page loads without errors
3. Look for file input (`<input type="file">`)
4. Look for drag-drop zone (`[data-dropzone]` or text matching "drag.*drop")
5. Neither element is detected

### Expected Behavior
- File input should be visible and accessible
- OR drag-drop zone should be visible
- User can upload CSV files

### Actual Behavior
- Playwright test fails: Elements not found
- Test location: `tests/budget-app-critical-flows.spec.ts:240`
- Page loads but import UI is missing or hidden

### Root Cause Hypotheses
1. **Hidden by CSS**: Elements exist but have `display: none` or `visibility: hidden`
2. **Conditional Rendering**: Elements only render under certain conditions
3. **Missing Implementation**: Import UI not yet built
4. **Wrong Selectors**: Test is looking for wrong elements/attributes

### Recommended Fix
```tsx
// Ensure file input exists and is visible
// src/app/budget-app/import/page.tsx

export default function ImportPage() {
  return (
    <div>
      <h1>Import Transactions</h1>

      {/* File input must be in DOM and visible */}
      <input
        type="file"
        accept=".csv,.ofx,.qfx"
        aria-label="Upload transaction file"
        data-testid="csv-file-input"
        className="..." // No display:none!
      />

      {/* OR drag-drop zone */}
      <div
        data-dropzone
        className="border-2 border-dashed border-gray-300 p-8"
      >
        <p>Drag and drop your CSV file here</p>
      </div>
    </div>
  );
}
```

### Verification Steps
1. Fix the issue
2. Run: `npx playwright test tests/budget-app-critical-flows.spec.ts:240`
3. Manually test: Visit /budget-app/import and upload a CSV
4. Verify file picker opens
5. Test on mobile (ensure file picker is accessible)

### Priority Justification
**HIGH**: CSV import is a key feature for power users and seniors migrating from other apps. Without this, migration is significantly harder.

---

## ⚠️ P1 IMPORTANT: Theme Toggle Not in Settings

**Severity**: P1 - Important
**Impact**: Users may not find theme controls (accessibility issue)
**Affected Platforms**: All
**Location**: Unknown (not in `/budget-app/settings`)

### Description
Playwright test warns: "Theme toggle not found in settings - check header/menu"
The theme toggle exists somewhere (theme persistence test passes), but it's not in the expected location (Settings page).

### Expected Behavior
- Theme toggle should be in Settings page OR
- Theme toggle should be in header/navigation OR
- Theme toggle should be accessible via keyboard (Cmd+T or similar)

### Actual Behavior
- Theme toggle not found at `/budget-app/settings`
- Location unclear to automated tests

### Recommended Actions
1. **Verify Location**: Where is the theme toggle actually rendered?
2. **Update Tests**: Test should check both Settings AND header
3. **User Research**: Is current location intuitive?
4. **Accessibility**: Ensure keyboard accessible (focus indicator visible)

### Verification Steps
1. Manually test: Find theme toggle
2. Update test to check correct location
3. Ensure WCAG 2.2 AA compliance (focus indicator, keyboard access)

---

## 📋 P2 MEDIUM: Conditional Test Skips

**Severity**: P2 - Medium
**Impact**: Incomplete test coverage
**Count**: 7 skipped tests

### Skipped Tests
1. Edit existing transaction (requires transaction to exist)
2. Delete transaction (requires transaction to exist)
3. Create budget (button not found)
4. Switch between light/dark themes (toggle not accessible)
5. AI features toggle (section not found)

### Root Cause
Tests use conditional logic: `if (!elementExists) test.skip()`
This is fragile and hides real issues.

### Recommended Fix
```typescript
// Use beforeEach to setup test data
test.beforeEach(async ({ page }) => {
  // Seed test data
  await page.evaluate(() => {
    // Add sample transaction to IndexedDB
    // So edit/delete tests always have data
  });
});

// OR use test fixtures
test.use({ storageState: 'tests/fixtures/with-transactions.json' });
```

### Priority Justification
**MEDIUM**: Tests should not skip - they should fail loudly if features are broken.

---

## 🛠️ Firefox/WebKit Testing Blocked

**Severity**: P1 - Important
**Impact**: Cannot validate cross-browser compatibility
**Platforms**: Firefox, Safari (WebKit), Mobile Safari
**Blocker**: Missing system dependencies on Ubuntu/WSL

### Missing Dependencies (35 libraries)
- libgtk-4.so.1
- libgraphene-1.0.so.0
- GStreamer libraries (12)
- Flite libraries (10)
- WebP, AVIF, Harfbuzz libraries

### Recommended Actions
```bash
# Option 1: Install Playwright dependencies
npx playwright install-deps firefox webkit

# Option 2: Manual install on Ubuntu
sudo apt-get update
sudo apt-get install -y \
  libgtk-4-1 libgraphene-1.0-0 libxslt1.1 \
  libwoff2-1.0.2 libvpx9 libevent-2.1-7 \
  gstreamer1.0-plugins-base gstreamer1.0-plugins-good \
  libwebpdemux2 libavif16 libharfbuzz-icu0

# Option 3: Use cloud testing (BrowserStack, Sauce Labs)
```

### Priority Justification
**IMPORTANT**: Firefox has ~3-5% market share, Safari (iOS) has ~60% mobile share. Must validate before launch.

---

## 📱 Real Device Testing Required

**Severity**: P0 - Critical
**Impact**: Cannot validate touch interactions, PWA installation, native behavior
**Platforms**: iOS Safari, Android Chrome
**Status**: PENDING

### Test Checklist
- [ ] iPhone 13+ (iOS 17+)
- [ ] Android Pixel/Galaxy (Android 12+)
- [ ] Touch targets ≥48px
- [ ] PWA installation flow
- [ ] Offline functionality
- [ ] Native date/time pickers
- [ ] Virtual keyboard behavior

### Access Method
```
Server: http://10.255.255.254:3001/budget-app
(Same WiFi network as dev machine)
```

### Priority Justification
**CRITICAL**: Mobile emulation cannot test:
- Real touch interactions
- PWA install prompts (iOS requires real device)
- Native input behaviors
- Platform-specific bugs

---

## 🚀 Resolution Timeline

### This Week (Before Next Demo)
1. **P0 #1**: Fix transaction modal select dropdown - **1-2 hours**
2. **P1 #1**: Fix CSV import UI elements - **1-2 hours**
3. **P1 #2**: Clarify theme toggle location - **30 minutes**
4. **P1 #3**: Install Playwright dependencies - **15 minutes**

### Week 4 (Before Launch)
5. **Real Device Testing**: Test on iOS/Android - **4-6 hours**
6. **P2**: Fix conditional test skips - **2-3 hours**
7. **Re-run All Tests**: Verify all platforms passing - **1 hour**

### Total Estimated Time
**Immediate Fixes**: 4-5 hours
**Full Resolution**: 11-16 hours

---

## ✅ Success Criteria

**Before marking device testing task "done"**:
- [ ] P0 #1: Transaction modal select works
- [ ] P1 #1: CSV import UI accessible
- [ ] Firefox/WebKit tests running (dependencies installed)
- [ ] All Playwright tests passing on Chromium
- [ ] Real iOS device tested (iPhone 13+)
- [ ] Real Android device tested (Pixel/Galaxy)
- [ ] PWA installation verified on mobile
- [ ] No P0 bugs remaining

**Launch Readiness**:
- [ ] All P0/P1 bugs resolved
- [ ] 90%+ Playwright test pass rate
- [ ] Cross-browser compatibility verified
- [ ] Mobile device testing complete
- [ ] Accessibility audit passing (WCAG 2.2 AA)

---

_Last updated: November 9, 2025_
_Source: budget-app-device-testing-results.md_
_Archon Task: `9e3e301d-3001-4e08-9f59-21bbfd855a96`_
