# Budget App - Testing Instructions

**For:** Session 2025-11-06 Implementations  
**Tests:** Accessibility, PWA, Mobile Features

---

## 🧪 Quick Test Guide

### 1. Test Accessibility Features (5 minutes)

#### Non-Color Status Indicators

**Test Dashboard:**

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:3000/budget-app
```

**What to Check:**

- ✅ Recent transactions show ↑ for income, ↓ for expense
- ✅ Summary cards have TrendingUp/TrendingDown icons
- ✅ Over-budget warnings show AlertCircle icon
- ✅ All amounts have both color AND icon

**Visual Test:**

- Use Chrome DevTools → Rendering → Emulate vision deficiencies
- Select "Achromatopsia" (grayscale)
- Verify income/expense still distinguishable by icons

#### Focus Indicators

**Keyboard Test:**

1. Click in browser address bar
2. Press `Tab` repeatedly
3. Watch focus move through interactive elements
4. **Expected:** 2px teal ring with offset around each focused element

**What to Check:**

- ✅ Navigation links show teal focus ring
- ✅ Footer links (Import, Export, Settings) show focus ring
- ✅ Bottom nav buttons show focus ring (mobile)
- ✅ Keyboard shortcuts button shows focus ring

---

### 2. Test PWA Features (10 minutes)

#### Service Worker Registration

**Test:**

```bash
# Start dev server
npm run dev

# Open http://localhost:3000/budget-app
```

**Check Chrome DevTools:**

1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers" in left sidebar
4. **Expected:** See sw.js registered and activated

**Console Check:**

```
[PWA] Service Worker registered: ServiceWorkerRegistration
[Service Worker] Loaded successfully
```

#### Offline Mode

**Test:**

1. Visit http://localhost:3000/budget-app
2. Wait for service worker to activate
3. Chrome DevTools → Network → Check "Offline"
4. Refresh the page
5. **Expected:** Page loads from cache, app works

**What to Check:**

- ✅ Dashboard loads while offline
- ✅ Transactions page loads while offline
- ✅ Navigation works while offline
- ✅ Console shows "[Service Worker] Cache hit" messages

#### Install Prompt

**Test (Chrome/Edge only):**

1. Visit http://localhost:3000/budget-app three times (refresh or close/reopen)
2. **Expected:** Install prompt appears in bottom-right
3. Prompt should show:
   - "Install Budget App" title
   - Benefits list (Works offline, Fast & secure, No app store)
   - Install and "Not now" buttons

**Trigger Manual Install:**

- Chrome: Address bar → Install icon ⊕
- Edge: Settings menu → Apps → Install this site as an app

---

### 3. Test Mobile Features (5 minutes)

#### Responsive Sidebar

**Test:**

```bash
# Resize browser window to <768px width
# Or use Chrome DevTools → Device Toolbar → iPhone 12 Pro
```

**What to Check:**

- ✅ Sidebar hidden by default on mobile
- ✅ Hamburger menu (☰) appears in top-left
- ✅ Clicking hamburger opens sidebar
- ✅ Overlay appears behind sidebar
- ✅ Clicking overlay closes sidebar

#### Bottom Navigation

**Test:**

- Resize to mobile width (<768px)
- **Expected:** Bottom tab bar with Home, Transactions, Categories, Budgets, More

**What to Check:**

- ✅ 4 tabs visible + More button
- ✅ Icons and labels clear
- ✅ Clicking tab navigates to page
- ✅ Touch targets ≥44px
- ✅ Focus indicators work (Tab key)

---

## 🎯 Detailed Test Scenarios

### Scenario 1: Colorblind User

**Goal:** Verify income/expense distinguishable without color

**Steps:**

1. Open http://localhost:3000/budget-app/transactions
2. Load sample data (if no transactions)
3. Enable Chrome DevTools → Rendering → Achromatopsia (grayscale)
4. Look at transaction list

**Expected Results:**

- ✅ Income has ↑ icon (even in grayscale)
- ✅ Expense has ↓ icon (even in grayscale)
- ✅ Summary cards have TrendingUp/Down icons
- ✅ Status clear without relying on green/red colors

---

### Scenario 2: Keyboard-Only User

**Goal:** Navigate app without mouse

**Steps:**

1. Open http://localhost:3000/budget-app
2. Press `Tab` to start keyboard navigation
3. Navigate to Transactions using only keyboard
4. Try to search and filter transactions

**Expected Results:**

- ✅ Can Tab through all navigation links
- ✅ Visible teal focus ring on each element
- ✅ Can reach all buttons and links
- ✅ Tab order is logical (top→bottom, left→right)
- ✅ Can activate links with `Enter`
- ✅ Can close modals with `Esc`

**Keyboard Shortcuts to Test:**

- `/` → Should focus search bar
- `?` → Should open shortcuts modal
- `Esc` → Should close modals

---

### Scenario 3: Mobile User

**Goal:** Use app on mobile device

**Steps:**

1. Open on iPhone or Android device
2. Navigate to http://localhost:3000/budget-app (or use your deployment URL)
3. Visit 3 times
4. Look for install prompt

**Expected Results:**

- ✅ Bottom navigation visible
- ✅ Hamburger menu works
- ✅ Install prompt appears after 3 visits
- ✅ Can install to home screen
- ✅ App opens in standalone mode

---

### Scenario 4: Offline User

**Goal:** Use app without internet

**Steps:**

1. Visit http://localhost:3000/budget-app (online)
2. Wait 2-3 seconds for service worker
3. Turn on airplane mode (or DevTools offline)
4. Navigate between pages

**Expected Results:**

- ✅ Dashboard loads from cache
- ✅ Transactions page works
- ✅ Navigation between pages works
- ✅ Data persists (IndexedDB)
- ✅ No "Connection lost" errors

---

## 🐛 Troubleshooting

### Issue: Service Worker Not Registering

**Check:**

```bash
# Verify sw.js file exists
ls -la public/sw.js

# Check browser console for errors
# DevTools → Console → Look for [PWA] or [Service Worker] messages
```

**Solutions:**

- Ensure browser supports service workers (Chrome, Edge, Firefox)
- Check HTTPS (or use localhost)
- Clear service workers: DevTools → Application → Service Workers → Unregister all

---

### Issue: Install Prompt Not Showing

**Check:**

```bash
# Verify manifest.json exists
ls -la public/manifest.json

# Check browser console
# Should see: [PWA] Install prompt event fired
```

**Solutions:**

- Visit page 3 times (localStorage.getItem('budget-app-visits'))
- Check beforeinstallprompt event in console
- iOS Safari doesn't support install prompts (use manual "Add to Home Screen")
- Check manifest is valid: DevTools → Application → Manifest

---

### Issue: Focus Indicators Not Visible

**Check:**

- Press Tab key to navigate
- Look for teal ring around focused element

**Solutions:**

- Clear browser cache (Ctrl+Shift+Delete)
- Check Tailwind CSS is loaded
- Verify classes aren't overridden by other styles
- Try Shift+Tab to go backwards

---

### Issue: Icons Not Showing

**Check:**

- Look for broken image icons
- Check browser console for 404 errors

**Solutions:**

- Create placeholder icons (see PWA Implementation guide)
- Or temporarily comment out icon references in manifest.json
- Use PWA Builder to generate icons from a source image

---

## 📊 Expected Test Results

### Before Testing

- 8 tasks marked "todo" or "review" in Archon
- No PWA manifest or service worker
- Color-only status indicators
- No focus indicators on some elements

### After Testing

- 8 tasks completed and working
- ✅ PWA installable
- ✅ Offline mode working
- ✅ Accessibility improved
- ✅ Mobile experience enhanced

### Metrics Targets

- Lighthouse Accessibility: ≥95% (target)
- Lighthouse PWA: 100% (target with icons)
- Pa11y WCAG AA: 0 errors (target)
- Mobile-Friendly: ≥90% (target)

---

## 🚦 Testing Checklist

### Quick Smoke Test (5 min)

- [ ] App loads at http://localhost:3000/budget-app
- [ ] Navigation sidebar works
- [ ] Bottom navigation works (mobile)
- [ ] Income/expense icons visible
- [ ] Focus indicators show on Tab press
- [ ] Service worker registered (DevTools → Application)

### Full Test Suite (30 min)

#### Accessibility

- [ ] All amounts have icons + text
- [ ] Focus ring visible on all interactive elements
- [ ] Tab order is logical
- [ ] Screen reader labels present (inspect HTML)
- [ ] Works in grayscale mode

#### PWA

- [ ] Service worker active
- [ ] App works offline
- [ ] Install prompt appears (after 3 visits)
- [ ] Can install on Chrome/Edge
- [ ] Runs in standalone mode

#### Mobile

- [ ] Sidebar collapses on mobile
- [ ] Bottom navigation shows
- [ ] Touch targets ≥44px
- [ ] Responsive on all screen sizes

---

## 📞 Support

**If you find issues:**

1. Check browser console for errors
2. Review documentation files
3. Check linter output: `npm run lint`
4. Run build: `npm run build`

**Documentation:**

- PWA: `BUDGET_APP_PWA_IMPLEMENTATION.md`
- Colors: `BUDGET_APP_COLOR_SYSTEM.md`
- Focus: `BUDGET_APP_ACCESSIBILITY_FOCUS.md`
- Session: `BUDGET_APP_SESSION_SUMMARY_2025-11-06.md`

---

**Happy Testing!** 🧪

All implemented features have been designed for quality, accessibility, and user experience.

**Last Updated:** November 6, 2025
