# Lighthouse Fixes Summary & Implementation Guide

**Date:** September 30, 2025
**Status:** 🔴 P0 Fixes Required
**Target:** Performance ≥90, Accessibility ≥95

---

## 📊 Current Status

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Performance | 67 | 90 | -23 |
| Accessibility | 89 | 95 | -6 |
| Best Practices | 96 | 90 | ✅ |
| SEO | 63 | 90 | -27 |

---

## 🚨 Critical Issue Identified

### React Hydration Error #418

**Root Cause:** The inline script in `layout.tsx` (line 55) modifies `document.documentElement` based on localStorage, but this happens DURING hydration, causing React to detect a mismatch.

**Current Code (src/app/layout.tsx:30, 53-57):**
```tsx
<html lang="en" suppressHydrationWarning>
  {/* ... */}
  <body>
    <script dangerouslySetInnerHTML={{
      __html: `(() => {
        try {
          var v = localStorage.getItem('tco-large-text');
          if (v === '1') {
            document.documentElement.style.fontSize='18px';
            document.documentElement.setAttribute('data-large-text','1');
          }
          var hc = localStorage.getItem('tco-high-contrast');
          if (hc === '1') {
            document.documentElement.setAttribute('data-large-text','1');
          }
        } catch (e) {}
      })();`
    }} />
```

**Why It's Broken:**
1. Server renders HTML with default font size
2. Script runs on client and changes fontSize
3. React hydration sees mismatch → Error #418
4. App switches to full client rendering (major performance hit)

**Solution:**
The script needs to run BEFORE React loads, in the `<head>`, and we need to ensure `suppressHydrationWarning` properly covers the affected elements.

---

## 🛠️ P0 Fixes (Critical - Deploy Today)

### Fix 1: Move Script to Head & Fix Typo

**File:** `src/app/layout.tsx`

**Change:**
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnects... */}

        {/* MOVE THIS SCRIPT TO HEAD - Run BEFORE React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                var v = localStorage.getItem('tco-large-text');
                if (v === '1') {
                  document.documentElement.style.fontSize='18px';
                  document.documentElement.setAttribute('data-large-text','1');
                }
                var hc = localStorage.getItem('tco-high-contrast');
                if (hc === '1') {
                  document.documentElement.setAttribute('data-high-contrast','1'); // FIX TYPO: was 'data-large-text'
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* Remove script from here */}
        {children}
      </body>
    </html>
  );
}
```

**Why This Works:**
- Script runs in `<head>` BEFORE body renders
- React hydration sees consistent state
- `suppressHydrationWarning` on both `<html>` and `<body>` prevents warnings
- Fixes typo: high contrast was setting wrong attribute

**Expected Impact:** +20-25 performance points

---

### Fix 2: Add Accessibility Labels to Progress Bars

**Issue:** 8 `<Progress>` components missing `aria-label`

**Files to Update:**

1. **src/app/study/page.tsx (2 instances)**
```tsx
// Line 457
<Progress
  value={overallProgress}
  className="mt-4 h-3"
  aria-label={`Overall progress: ${overallProgress}%`}
/>

// Line 538
<Progress
  value={domain.progress}
  className="h-2"
  aria-label={`${domain.name} progress: ${domain.progress}%`}
/>
```

2. **src/app/practice/page.tsx (2 instances)**
```tsx
// Line 417
<Progress
  value={score}
  className="h-4"
  aria-label={`Practice score: ${score}%`}
/>

// Line 493
<Progress
  value={progress.percentage}
  className="h-3"
  aria-label={`Session progress: ${progress.percentage}%`}
/>
```

3. **src/app/analytics/page.tsx (2 instances)**
```tsx
// Line 354
<Progress
  value={overallStats.averageScore}
  className="h-4"
  aria-label={`Average score: ${overallStats.averageScore}%`}
/>

// Line 522
<Progress
  value={domain.score}
  className="h-2"
  aria-label={`${domain.name} score: ${domain.score}%`}
/>
```

4. **src/app/mock/page.tsx (2 instances)**
```tsx
// Line 348
<Progress
  value={score}
  className="h-4"
  aria-label={`Mock exam score: ${score}%`}
/>

// Line 451
<Progress
  value={progress.percentage}
  className="h-3"
  aria-label={`Exam progress: ${progress.percentage}%`}
/>
```

**Expected Impact:** +8-10 accessibility points

---

### Fix 3: Add Accessible Names to Icon Buttons

**Issue:** 2 buttons missing accessible names (likely icon-only buttons)

**Common Pattern to Fix:**
```tsx
// ❌ Bad - Screen reader can't announce
<button onClick={handleClick}>
  <MenuIcon />
</button>

// ✅ Good - Screen reader announces "Open menu"
<button onClick={handleClick} aria-label="Open menu">
  <MenuIcon />
</button>
```

**Files to Check:**
- Navigation menu toggle (mobile)
- Search button
- User menu button
- Any icon-only action buttons

**Search Command:**
```bash
# Find potential icon-only buttons
grep -rn "<button" src/ --include="*.tsx" | grep -i "icon" | head -20
```

**Expected Impact:** +2 accessibility points

---

## 🔍 P1 Fixes (High Priority - This Week)

### Fix 4: Investigate 404 Error

**Action:**
1. Open production URL in browser
2. Open DevTools → Network tab
3. Filter by "4xx" or "404"
4. Identify missing resource

**Common Causes:**
- Missing favicon
- Font file 404
- Image path error
- Source map 404 (can be ignored)

**Fix:** Update path or remove broken reference

**Expected Impact:** +3-5 performance points

---

### Fix 5: Reduce Unused JavaScript

**Bundles with Waste:**
- `5040-944346c613642967.js` - 25KB wasted (75% unused)
- `1733-50d8dd25d364c77c.js` - 21KB wasted (55% unused)

**Quick Win - Lazy Load Heavy Components:**

```tsx
// Before - Eager load
import { HeavyComponent } from '@/components/HeavyComponent';

// After - Lazy load
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // If component doesn't need SSR
});
```

**Candidates for Lazy Loading:**
- Analytics components (not needed immediately)
- Chart libraries (load on demand)
- Modal/Dialog content (load when opened)
- Video players (load when user clicks play)

**Expected Impact:** +5-8 performance points

---

## 📋 Deployment Checklist

### Before Deploy:
- [ ] Update `layout.tsx` - move script to head, fix typo, add suppressHydrationWarning to body
- [ ] Add `aria-label` to all 8 Progress components
- [ ] Add `aria-label` to icon-only buttons (find and fix)
- [ ] Test locally: `npm run build && npm run start`
- [ ] Verify no hydration errors in console

### Deploy:
```bash
# Build and verify
npm run build

# Deploy to Vercel
vercel --prod

# Monitor deployment
vercel logs --prod
```

### After Deploy:
- [ ] Run Lighthouse again
- [ ] Verify scores improved
- [ ] Check browser console for errors
- [ ] Test on mobile device

---

## 🎯 Expected Results After P0 Fixes

| Metric | Before | After P0 | Target | Status |
|--------|--------|----------|--------|--------|
| Performance | 67 | 85-92 | 90 | ✅ Expected |
| Accessibility | 89 | 97-100 | 95 | ✅ Expected |
| Best Practices | 96 | 96 | 90 | ✅ Maintained |
| SEO | 63 | 65-70 | 90 | ⚠️ P2 work |

---

## 🔄 Quick Implementation Commands

### 1. Find All Progress Components to Fix:
```bash
grep -rn "<Progress" src/app --include="*.tsx" -B 2 -A 1 > progress-fix-list.txt
cat progress-fix-list.txt
```

### 2. Find Icon-Only Buttons:
```bash
grep -rn "<button" src/ --include="*.tsx" | grep -E "(Icon|Svg|<svg)" | grep -v "aria-label"
```

### 3. Test Build Locally:
```bash
npm run build 2>&1 | grep -i "error\|warning" | head -20
```

### 4. Test for Hydration Errors:
```bash
# Start production build locally
npm run start

# Open http://localhost:3000 in browser
# Check console for:
# - "Hydration failed"
# - "Error #418"
# - "Text content does not match"
```

---

## 📊 Validation After Fixes

### Run Lighthouse Locally:
```bash
lighthouse http://localhost:3000 \
  --only-categories=performance,accessibility \
  --output=html \
  --output-path=./lighthouse-after-fixes.html \
  --chrome-flags="--headless"

# Open report
open lighthouse-after-fixes.html
```

### Compare Before/After:
```bash
# Before (current):
# Performance: 67
# Accessibility: 89

# After (expected):
# Performance: 85-92
# Accessibility: 97-100
```

---

## 🚀 Next Steps After P0

### P1 (This Week):
1. Lazy load heavy components
2. Fix 404 errors
3. Optimize images (WebP/AVIF)

### P2 (Next Sprint):
1. SEO optimization (meta descriptions, alt text)
2. Further bundle optimization
3. CDN optimization for fonts/images

---

**Files to Modify:**
1. ✅ `src/app/layout.tsx` - Move script, fix typo, add suppressHydrationWarning
2. ✅ `src/app/study/page.tsx` - Add 2 aria-labels
3. ✅ `src/app/practice/page.tsx` - Add 2 aria-labels
4. ✅ `src/app/analytics/page.tsx` - Add 2 aria-labels
5. ✅ `src/app/mock/page.tsx` - Add 2 aria-labels
6. 🔍 Find and fix 2 icon-only buttons

**Estimated Time:** 30-45 minutes
**Expected Performance Gain:** +18-25 points
**Expected Accessibility Gain:** +8-11 points

---

**Generated:** September 30, 2025
**Priority:** 🔴 P0 - Deploy immediately after fixes
**Next Review:** After deployment + Lighthouse re-run
