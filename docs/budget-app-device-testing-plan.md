# Budget App - Real Device Testing Plan

**Task ID**: `9e3e301d-3001-4e08-9f59-21bbfd855a96`
**Assignee**: qa-engineer
**Status**: In Progress
**Date**: November 9, 2025

---

## 📊 Executive Summary

### Existing E2E Test Coverage

**Current Playwright Tests** (Desktop Chromium only):

- ✅ Critical flows: Transaction CRUD, Budget creation, CSV import, Theme switching
- ✅ Keyboard navigation: All workflows accessible, focus traps working
- ✅ Page load verification: All 6 major pages (Dashboard, Transactions, Budgets, Reports, Import, Settings)
- ✅ Accessibility: Focus indicators, modal behavior, checkbox interactions

**Gap**: No mobile device testing, no cross-browser testing (Firefox/Safari/Edge)

---

## 🎯 Device Testing Matrix

### Platform Coverage

| Platform    | Browser            | Screen Size               | Test Priority     | PWA Install | Offline     |
| ----------- | ------------------ | ------------------------- | ----------------- | ----------- | ----------- |
| **iOS**     | Safari 17+         | iPhone 13/14/15 (390x844) | **P0 Critical**   | ✅ Required | ✅ Required |
| **Android** | Chrome 120+        | Pixel 5/6 (393x851)       | **P0 Critical**   | ✅ Required | ✅ Required |
| **Desktop** | Chrome 120+        | 1920x1080                 | P0 (baseline)     | Optional    | ✅ Required |
| **Desktop** | Firefox 120+       | 1920x1080                 | **P1 Important**  | N/A         | ✅ Required |
| **Desktop** | Edge 120+          | 1920x1080                 | P1                | Optional    | ✅ Required |
| **Desktop** | Safari 17+ (macOS) | 1920x1080                 | **P1 Important**  | ✅ Required | ✅ Required |
| **Tablet**  | iPad Safari        | 1024x768                  | P2 (nice to have) | ✅ Optional | Optional    |

---

## 🧪 Test Scenarios Per Platform

### Critical User Flows (All Platforms)

#### 1. **Navigation & IA**

- [ ] Bottom tab bar visible and functional (mobile)
- [ ] Desktop sidebar navigation works
- [ ] "More" menu expands correctly
- [ ] Active page highlighted with teal accent
- [ ] Navigation smooth (no flickering/janking)

#### 2. **Transaction Management**

- [ ] "Add Transaction" button visible and tappable (≥48px)
- [ ] Modal opens smoothly
- [ ] Amount input: Native numeric keyboard (mobile)
- [ ] Date picker: Native date selector (mobile)
- [ ] Category dropdown: Touch-friendly
- [ ] Save button: Feedback on tap
- [ ] Transaction appears in list
- [ ] Edit transaction: Modal pre-fills correctly
- [ ] Delete transaction: Confirmation dialog works

#### 3. **Budget Creation**

- [ ] "Add Budget" button accessible
- [ ] Form fields keyboard-appropriate (mobile)
- [ ] Budget progress bar renders correctly
- [ ] Budget cards responsive layout

#### 4. **CSV Import**

- [ ] File picker opens (native file selector)
- [ ] Drag-drop zone works (desktop)
- [ ] File preview renders
- [ ] Duplicate detection displays
- [ ] Import confirms successfully

#### 5. **Theme Switching**

- [ ] Theme toggle accessible
- [ ] Light mode: Contrast ≥4.5:1
- [ ] Dark mode: Contrast ≥4.5:1
- [ ] High-contrast mode: Contrast ≥7:1
- [ ] Theme persists across page reloads
- [ ] No FOUC (Flash of Unstyled Content)

#### 6. **PWA Installation** (iOS/Android/Safari/Chrome)

- [ ] Install prompt appears
- [ ] Install completes successfully
- [ ] App icon appears on home screen
- [ ] Opens in standalone mode (no browser UI)
- [ ] Splash screen displays
- [ ] Theme color correct

#### 7. **Offline Functionality**

- [ ] Service worker registers
- [ ] App loads offline (after first visit)
- [ ] Cached pages accessible
- [ ] "Offline" indicator displays
- [ ] Data syncs when back online

---

## 🔍 Platform-Specific Checks

### iOS Safari Specifics

- [ ] **Touch interactions**: Tap delay ≤300ms (Fast Click)
- [ ] **Input behavior**: Virtual keyboard doesn't obscure form fields
- [ ] **Safe areas**: Content not hidden by notch/home indicator
- [ ] **Scrolling**: Momentum scrolling works (overflow-scrolling)
- [ ] **Fixed elements**: Bottom tab bar stays fixed during scroll
- [ ] **Date/Time pickers**: Native iOS controls render
- [ ] **PWA icons**: 180x180 apple-touch-icon displays

### Android Chrome Specifics

- [ ] **Material Design**: Back button behavior
- [ ] **Input behavior**: Autocomplete suggestions work
- [ ] **Notifications**: Permission prompts (if implemented)
- [ ] **Scroll behavior**: Overscroll effects
- [ ] **PWA icons**: 192x192 and 512x512 manifest icons
- [ ] **Theme color**: Matches manifest.json

### Desktop Firefox Specifics

- [ ] **Flexbox/Grid**: Layout identical to Chrome
- [ ] **CSS variables**: Theme tokens apply correctly
- [ ] **Service worker**: Offline works same as Chrome
- [ ] **IndexedDB**: Database operations successful
- [ ] **Focus indicators**: Visible on all interactive elements

### Desktop Safari (macOS) Specifics

- [ ] **Webkit rendering**: No layout shifts
- [ ] **Date inputs**: Native date picker or polyfill
- [ ] **IndexedDB**: Quota limits respected
- [ ] **Focus styles**: Ring visible in light/dark mode
- [ ] **PWA**: Dock icon, standalone window

### Desktop Edge Specifics

- [ ] **Chromium parity**: Identical to Chrome
- [ ] **PWA**: Install from address bar works
- [ ] **Touch support**: Works on Surface devices

---

## 📋 Testing Checklist Template

Use this checklist for EACH platform:

### Pre-Test Setup

- [ ] Clear browser cache/data
- [ ] Disable browser extensions
- [ ] Set viewport to target resolution
- [ ] Note browser version
- [ ] Connect to test server (http://localhost:3001 or production URL)

### Test Execution

- [ ] Navigate to /budget-app
- [ ] Verify page loads without errors (check console)
- [ ] Test navigation (all 6 pages)
- [ ] Add transaction (check form behavior)
- [ ] Create budget (check dropdown/inputs)
- [ ] Switch theme (verify contrast)
- [ ] Test offline mode (DevTools → Network → Offline)
- [ ] Install PWA (if supported)
- [ ] Test in standalone mode
- [ ] Take screenshots of:
  - Dashboard
  - Transaction modal
  - Budget page
  - Dark mode
  - High-contrast mode
  - PWA home screen icon

### Post-Test Documentation

- [ ] Log any visual bugs (screenshots)
- [ ] Log any functional bugs (steps to reproduce)
- [ ] Note performance issues (lag, jank)
- [ ] Create GitHub issues for P0/P1 bugs

---

## 🐛 Issue Severity Classification

### P0 - Blocker (Fix before launch)

- App crashes or throws errors
- Critical workflow broken (can't add transaction)
- PWA doesn't install on iOS/Android
- Accessibility violation (WCAG 2.2 AA fail)
- Contrast ratio <4.5:1 (text)

### P1 - High (Fix in Week 4)

- Visual bugs (layout broken, text overlapping)
- Touch targets <48px
- Theme mode not working
- Performance issue (>3s load time)
- Offline mode broken

### P2 - Medium (Fix in v1.1)

- Minor visual inconsistencies
- Non-critical UI polish
- Optional features not working

### P3 - Low (Backlog)

- Nice-to-have enhancements
- Edge case bugs

---

## 🛠️ Testing Tools & Environment

### Local Testing

```bash
# Start dev server
npm run dev

# Server runs on http://localhost:3001
# Access from mobile devices on same network: http://<YOUR-IP>:3001
```

### Mobile Device Testing (Same Network)

1. Find your computer's local IP:

   ```bash
   # macOS/Linux
   ipconfig getifaddr en0

   # Windows
   ipconfig
   ```

2. On mobile device, navigate to: `http://<YOUR-IP>:3001/budget-app`

### Browser DevTools Testing

**Chrome DevTools**:

- Device emulation: Toggle device toolbar (Cmd+Shift+M)
- Lighthouse audit: Run accessibility/performance tests
- Network throttling: Simulate 3G/offline

**Firefox DevTools**:

- Responsive Design Mode (Cmd+Option+M)
- Accessibility Inspector

**Safari Web Inspector**:

- Develop → Enter Responsive Design Mode

### PWA Testing

**Chrome (Desktop/Android)**:

- Install: Address bar → Install icon
- Verify: chrome://apps

**Safari (iOS)**:

- Share → Add to Home Screen
- Verify: Home screen icon

**Edge**:

- Settings → Apps → Install

---

## 📊 Test Results Template

### Platform: [iOS Safari / Android Chrome / etc.]

**Browser Version**: [e.g., Safari 17.2]
**Device**: [e.g., iPhone 14, Pixel 6]
**Screen Size**: [e.g., 390x844]
**Date**: [e.g., 2025-11-09]
**Tester**: [Your name]

#### Test Results Summary

- ✅ **Pass**: [Count] tests passed
- ⚠️ **Warn**: [Count] minor issues
- ❌ **Fail**: [Count] critical failures

#### Critical Bugs Found

| Issue                                   | Severity | Steps to Reproduce                          | Screenshot |
| --------------------------------------- | -------- | ------------------------------------------- | ---------- |
| Example: Transaction modal doesn't open | P0       | 1. Tap "Add Transaction" 2. Nothing happens | [link]     |

#### Screenshots

- Dashboard: [link]
- Dark Mode: [link]
- PWA Install: [link]

#### Performance Metrics

- Page Load Time: [e.g., 2.1s]
- Time to Interactive: [e.g., 2.8s]
- Lighthouse Performance: [e.g., 94/100]
- Lighthouse Accessibility: [e.g., 98/100]

---

## 🚀 Execution Plan

### Phase 1: Baseline Desktop Testing (1-2 hours)

1. **Chrome** (current Playwright coverage - verify manually)
2. **Firefox** (critical path flows)
3. **Edge** (smoke test major pages)

### Phase 2: Mobile Device Testing (2-3 hours)

4. **iOS Safari** (iPhone 13+)
   - Critical flows
   - PWA installation
   - Offline mode
5. **Android Chrome** (Pixel 5+)
   - Critical flows
   - PWA installation
   - Offline mode

### Phase 3: Safari macOS Testing (1 hour)

6. **Safari macOS** (if available)
   - Critical flows
   - PWA installation
   - Webkit-specific rendering

### Phase 4: Documentation & Remediation (2 hours)

7. Compile all findings into this document
8. Create GitHub issues for P0/P1 bugs
9. Update Archon task with results
10. Mark task as "done"

**Total Estimated Time**: 6-8 hours

---

## 📝 Next Steps

1. **Setup**: Ensure test server accessible from mobile devices
2. **Execute**: Run through test matrix systematically
3. **Document**: Log all issues with screenshots and severity
4. **Report**: Update Archon task with findings
5. **Remediate**: Create tickets for P0/P1 issues found

---

## 🔗 Related Documentation

- [Budget App v1 Plan](./budget-app-v1-plan/README.md)
- [Accessibility Checklist](./budget-app-v1-plan/00-IMPLEMENTATION-GUIDE.md#6-accessibility-checklist-wcag-22-aa)
- [PRD](./budget-app-v1-plan/02-PRD-Budget-App-v1.md)
- [Existing Playwright Tests](../tests/budget-app-critical-flows.spec.ts)

---

**Status**: Ready for execution
**Blocker**: None
**Risk**: Medium (requires physical devices or cloud testing platform)

---

_Last updated: November 9, 2025_
_Archon Task: `9e3e301d-3001-4e08-9f59-21bbfd855a96`_
