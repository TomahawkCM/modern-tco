# Production Deployment Checklist - Budget App

**Status**: Ready for Production Deployment
**Last Updated**: November 9, 2025
**Version**: 1.0

This checklist covers everything needed to deploy the Budget App to production (Vercel) and verify PWA installation across all platforms.

---

## 📋 Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Vercel Configuration](#vercel-configuration)
- [Environment Variables](#environment-variables)
- [PWA Verification](#pwa-verification)
- [Testing Matrix](#testing-matrix)
- [Post-Deployment Verification](#post-deployment-verification)
- [Rollback Plan](#rollback-plan)
- [Known Issues & Workarounds](#known-issues--workarounds)

---

## Pre-Deployment Checklist

### Critical Requirements

- [ ] **Code Quality**
  - [x] All TypeScript errors resolved (verified with `npm run typecheck`)
  - [x] All linting errors resolved (verified with `npm run lint`)
  - [x] All tests passing (verified with `npm test`)
  - [x] Production build successful (`npm run build`)

- [ ] **Dependencies**
  - [x] All dependencies up to date and security audited
  - [x] No critical vulnerabilities (`npm audit`)
  - [x] Bundle size optimized (< 2MB total)

- [ ] **Documentation**
  - [x] User documentation complete (see `docs/user-guide/`)
  - [x] Developer documentation up to date
  - [x] API documentation current
  - [x] CHANGELOG.md updated

- [ ] **Testing**
  - [x] E2E tests passing (Playwright)
  - [x] Accessibility tests passing (WCAG 2.2 AA)
  - [x] Performance tests passing (Lighthouse)
  - [x] Manual testing complete on real devices

### 📱 PWA Requirements

- [ ] **PWA Assets**
  - [x] Manifest file exists (`public/manifest.json`)
  - [x] Service worker exists (`public/sw.js`)
  - [x] App icons created (192px, 512px) ✅
  - [ ] App shortcut icons created (96px) ⚠️ **NEEDED**
  - [ ] Screenshots created (desktop + mobile) ⚠️ **NEEDED**
  - [ ] Offline fallback page created ⚠️ **NEEDED**

- [ ] **PWA Configuration**
  - [x] Theme color set (#14b8a6)
  - [x] Start URL configured (/budget-app)
  - [x] Display mode set (standalone)
  - [x] App shortcuts defined (3)
  - [x] Share target configured (CSV import)

### 🔒 Security Checklist

- [ ] **Environment Variables**
  - [ ] All secrets stored in Vercel environment variables (not in code)
  - [ ] `.env.local` NOT committed to Git
  - [ ] API keys rotated before production
  - [ ] Supabase RLS policies enabled

- [ ] **Privacy Compliance**
  - [x] Privacy policy displayed in app
  - [x] User consent for analytics implemented
  - [x] Data minimization enforced (no PII in analytics)
  - [x] GDPR/CCPA opt-out controls available

---

## Vercel Configuration

### 1. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 2. Link Project to Vercel

```bash
# Login to Vercel
vercel login

# Link to existing project or create new
vercel link

# Follow prompts:
# - Scope: Your Vercel account/team
# - Link to existing project? Yes
# - Project name: modern-tco (or budget-app)
```

### 3. Configure Project Settings

**In Vercel Dashboard** (https://vercel.com/dashboard):

1. Go to Project Settings
2. **Framework Preset**: Next.js
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`
5. **Install Command**: `npm install`
6. **Node Version**: 20.x (latest LTS)

### 4. Configure Build Settings

**In Vercel Dashboard → Settings → Build & Development Settings**:

- **Build Command Override**:

  ```bash
  npm run build
  ```

- **Output Directory Override**:

  ```
  .next
  ```

- **Install Command Override**:
  ```bash
  npm ci
  ```

### 5. Configure Deployment Protection

**In Vercel Dashboard → Settings → Deployment Protection**:

- [ ] Enable Vercel Authentication for Preview Deployments (optional)
- [ ] Enable Password Protection for Preview Deployments (optional)
- [ ] Configure Allowed IPs (if needed)

---

## Environment Variables

### Required Variables (Production)

**Add these in Vercel Dashboard → Settings → Environment Variables → Production**:

```bash
# Database (Supabase) - REQUIRED
NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Services (Optional but recommended)
ANTHROPIC_API_KEY=sk-ant-api03-xxx
NEXT_PUBLIC_OPENAI_API_KEY=sk-xxx  # For budget app AI features

# Analytics & Error Tracking - REQUIRED for monitoring
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production

# Application Configuration
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

### Optional Variables

```bash
# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Supabase Access Token (for MCP/CLI)
SUPABASE_ACCESS_TOKEN=sbp_xxx

# Custom Domain
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Environment Scope Configuration

**For each variable, set scope**:

- ✅ Production (always)
- ⚠️ Preview (optional, use staging values)
- ❌ Development (no, use `.env.local`)

### Verification Command

```bash
# Deploy with environment check
vercel env pull .env.vercel
cat .env.vercel  # Verify values (without secrets)
```

---

## PWA Verification

### Pre-Deployment PWA Checklist

**Create Missing Assets**:

1. **App Shortcut Icons** (96x96px):

   ```bash
   # Create these in public/icons/:
   # - add-transaction.png
   # - import.png
   # - reports.png
   ```

2. **Screenshots**:

   ```bash
   # Create public/screenshots/:
   mkdir -p public/screenshots

   # Desktop screenshot (1280x720px):
   # - budget-app-desktop.png
   # - Show dashboard with transactions, charts

   # Mobile screenshot (750x1334px):
   # - budget-app-mobile.png
   # - Show mobile view with bottom navigation
   ```

3. **Offline Fallback Page**:
   ```bash
   # Create src/app/budget-app/offline/page.tsx
   # See BUDGET_APP_PWA_IMPLEMENTATION.md for template
   ```

### Lighthouse PWA Audit (Local)

```bash
# Install Lighthouse if not already installed
npm install -g @lhci/cli lighthouse

# Build production bundle
npm run build

# Start production server
npm run start

# Run Lighthouse PWA audit
lighthouse http://localhost:3000/budget-app \
  --only-categories=pwa \
  --output=json \
  --output-path=lighthouse-pwa-report.json \
  --view

# Target Score: 100/100
```

**Required Checks** (all must pass):

- ✅ Registers a service worker that controls page and start_url
- ✅ Web app manifest meets the installability requirements
- ✅ Configured for a custom splash screen
- ✅ Sets a theme color for the address bar
- ✅ Content is sized correctly for the viewport
- ✅ Has a maskable icon
- ✅ Provides a valid apple-touch-icon
- ✅ Provides valid apple-touch-startup-image
- ✅ Configured for iOS PWA

### Post-Deployment PWA Audit

```bash
# After deployment, audit production URL
lighthouse https://yourdomain.com/budget-app \
  --only-categories=pwa \
  --view

# Expected: 100/100
```

---

## Testing Matrix

### Desktop Testing

**Chrome/Edge (Windows/Mac/Linux)**:

| Test                | Steps                                                                                | Expected Result                                            |
| ------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| **Install Prompt**  | 1. Open https://yourdomain.com/budget-app<br>2. Wait for install icon in address bar | Install icon appears                                       |
| **Installation**    | 1. Click install icon<br>2. Click "Install"                                          | App installs in ~2 seconds                                 |
| **Standalone Mode** | 1. Open installed app                                                                | Runs in standalone window (no browser UI)                  |
| **Offline Mode**    | 1. Disconnect internet<br>2. Open app<br>3. Navigate between cached pages            | App loads, transactions visible                            |
| **Service Worker**  | 1. Open DevTools → Application → Service Workers                                     | Status: "activated and running"                            |
| **Shortcuts**       | 1. Right-click app icon in taskbar/dock                                              | 3 shortcuts visible (Add Transaction, Import CSV, Reports) |

### iOS Testing (Safari)

**iPhone/iPad**:

| Test               | Steps                                                                    | Expected Result                     |
| ------------------ | ------------------------------------------------------------------------ | ----------------------------------- |
| **Manual Install** | 1. Open in Safari<br>2. Tap Share → "Add to Home Screen"<br>3. Tap "Add" | Icon appears on home screen         |
| **Launch**         | 1. Tap home screen icon                                                  | Opens in full-screen (no Safari UI) |
| **Offline Mode**   | 1. Enable Airplane Mode<br>2. Open app                                   | App loads with cached content       |
| **Theme Color**    | 1. Observe status bar                                                    | Status bar is teal (#14b8a6)        |

### Android Testing (Chrome)

**Android Phone/Tablet**:

| Test             | Steps                                                           | Expected Result                  |
| ---------------- | --------------------------------------------------------------- | -------------------------------- |
| **Auto Prompt**  | 1. Open https://yourdomain.com/budget-app<br>2. Wait 30 seconds | Install banner appears at bottom |
| **Installation** | 1. Tap "Install"<br>2. Tap "Install" in dialog                  | App appears in app drawer        |
| **Launch**       | 1. Open from app drawer                                         | Opens in standalone window       |
| **Offline Mode** | 1. Enable Airplane Mode<br>2. Open app                          | App loads with cached content    |
| **Shortcuts**    | 1. Long-press app icon                                          | 3 shortcuts visible              |
| **Share Target** | 1. Share CSV file → Budget App                                  | App opens import flow            |

### Performance Testing

**Lighthouse Performance Audit**:

```bash
lighthouse https://yourdomain.com/budget-app \
  --only-categories=performance \
  --view
```

**Target Scores**:

- Performance: 90+ ✅
- First Contentful Paint (FCP): < 1.8s ✅
- Largest Contentful Paint (LCP): < 2.5s ✅
- Time to Interactive (TTI): < 3.5s ✅
- Total Blocking Time (TBT): < 300ms ✅
- Cumulative Layout Shift (CLS): < 0.1 ✅

---

## Post-Deployment Verification

### 1. Basic Functionality Test

**In Production**:

```bash
# Open production URL
open https://yourdomain.com/budget-app

# Checklist:
- [ ] App loads successfully
- [ ] Authentication works (if implemented)
- [ ] Transactions CRUD works
- [ ] Budgets CRUD works
- [ ] CSV import works
- [ ] PDF/OCR scanning works (if implemented)
- [ ] Reports generate correctly
- [ ] No console errors
```

### 2. Analytics Verification

**PostHog Dashboard** (https://app.posthog.com):

1. Go to Activity → Live Events
2. Perform actions in production app
3. Verify events appear:
   - `page_view`
   - `transaction_added`
   - `budget_created`
4. Check no PII in event properties

**Sentry Dashboard** (https://sentry.io):

1. Trigger test error:
   ```javascript
   // In browser console:
   throw new Error("Production deployment test error");
   ```
2. Verify error appears in Sentry Issues
3. Check environment tag: "production"
4. Verify source maps work (readable stack trace)

### 3. Performance Monitoring

**Vercel Analytics** (https://vercel.com/analytics):

1. Check real-time visitors
2. Monitor Core Web Vitals:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)
3. Set up alerts for performance degradation

### 4. Database Connectivity

```bash
# Test Supabase connection
# In production app browser console:
console.log('Testing Supabase connection...');
const { data, error } = await supabase.from('budget_transactions').select('count');
console.log('Database query result:', data, error);
```

Expected: No errors, count returned.

### 5. PWA Installation Verification

**Test on each platform**:

- [ ] Desktop (Chrome/Edge): Install works, standalone mode ✅
- [ ] iOS (Safari): Add to Home Screen works ✅
- [ ] Android (Chrome): Install banner appears, install works ✅

---

## Rollback Plan

### If Deployment Fails

**Option 1: Instant Rollback (Vercel)**:

```bash
# Via Vercel Dashboard:
# 1. Go to Deployments
# 2. Find last working deployment
# 3. Click "..." → "Promote to Production"

# Via CLI:
vercel rollback
```

**Option 2: Redeploy Previous Version**:

```bash
# Checkout previous commit
git log --oneline -10  # Find last working commit
git checkout <commit-hash>

# Deploy
vercel --prod

# Return to latest
git checkout main
```

### If Critical Bug Found Post-Deployment

1. **Immediate**: Rollback to last working deployment
2. **Fix locally**: Create hotfix branch
3. **Test thoroughly**: Run all tests
4. **Deploy fix**: `vercel --prod`
5. **Verify**: Check production again
6. **Post-mortem**: Document what went wrong

---

## Known Issues & Workarounds

### Issue 1: Service Worker Not Updating

**Symptom**: Users see old version after deployment

**Workaround**:

```javascript
// In public/sw.js, increment version:
const CACHE_VERSION = "v2"; // Increment this on each deploy

// Or force update in browser console:
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((registration) => registration.unregister());
});
```

### Issue 2: iOS Safari Service Worker Limitations

**Symptom**: Offline mode doesn't work on iOS

**Known Limitation**: iOS Safari has limited service worker support
**Workaround**:

- Use AppCache manifest (deprecated but still works on iOS)
- Or accept limitation and show "Offline mode not supported on iOS" message

### Issue 3: Android Chrome Install Banner Not Showing

**Symptom**: No install prompt on Android

**Solutions**:

1. Ensure HTTPS (required)
2. Verify manifest is valid (Chrome DevTools → Application → Manifest)
3. Check service worker is registered and active
4. Wait 30 seconds for prompt to appear
5. Use manual install: Menu → "Install app"

### Issue 4: Vercel Build Timeout

**Symptom**: Build exceeds 45 minutes (Hobby plan limit)

**Solutions**:

1. Optimize build: Remove unused dependencies
2. Enable Next.js caching: `vercel build --yes`
3. Upgrade to Pro plan (60 minute timeout)

---

## Deployment Commands

### Full Production Deployment

```bash
# 1. Verify everything is ready
npm run typecheck  # No TypeScript errors
npm run lint       # No linting errors
npm run build      # Build succeeds
npm test           # All tests pass

# 2. Commit latest changes
git add .
git commit -m "chore: Prepare for production deployment"
git push origin main

# 3. Deploy to Vercel
vercel --prod

# 4. Verify deployment
# - Check deployment URL in terminal
# - Open in browser
# - Run smoke tests
# - Check analytics dashboards
```

### Staging Deployment (Optional)

```bash
# Deploy to preview environment
vercel

# Get preview URL (e.g., https://modern-tco-abc123.vercel.app)
# Test thoroughly before promoting to production
```

---

## Success Criteria

Deployment is considered successful when:

- [ ] App loads on production URL
- [ ] All major features work (transactions, budgets, reports)
- [ ] PWA installation works on iOS, Android, Desktop
- [ ] Lighthouse PWA score: 100/100
- [ ] Lighthouse Performance score: 90+
- [ ] No critical errors in Sentry
- [ ] Analytics events flowing to PostHog
- [ ] Service worker active and caching correctly
- [ ] Offline mode works (on supported browsers)
- [ ] No console errors in production
- [ ] Custom domain configured (if applicable)

---

## Post-Deployment Tasks

### Immediate (Within 1 Hour)

- [ ] Monitor Sentry for errors
- [ ] Check PostHog for traffic
- [ ] Verify Vercel deployment logs
- [ ] Test on real devices (iOS, Android)
- [ ] Announce to stakeholders

### Short Term (Within 24 Hours)

- [ ] Monitor Core Web Vitals
- [ ] Check user feedback channels
- [ ] Review analytics for anomalies
- [ ] Document any issues found

### Medium Term (Within 1 Week)

- [ ] Collect user feedback
- [ ] Analyze PWA install rate
- [ ] Review error trends in Sentry
- [ ] Plan next iteration improvements

---

## Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **PWA Checklist**: https://web.dev/pwa-checklist/
- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci
- **Service Worker Debugging**: https://web.dev/service-worker-lifecycle/

---

**Last Updated**: November 9, 2025
**Deployment Platform**: Vercel
**Framework**: Next.js 16.0.0
**App Version**: 1.0 (Budget App PWA)
**Maintained By**: Budget App Development Team
