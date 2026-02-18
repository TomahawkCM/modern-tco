# Analytics & Error Monitoring Setup Guide

**Status**: Production Ready
**Last Updated**: November 9, 2025
**Version**: 1.0

This guide covers the complete setup for PostHog analytics and Sentry error tracking in the Budget App.

---

## 📋 Table of Contents

- [Overview](#overview)
- [PostHog Analytics Setup](#posthog-analytics-setup)
- [Sentry Error Tracking Setup](#sentry-error-tracking-setup)
- [Environment Variables](#environment-variables)
- [Privacy Compliance](#privacy-compliance)
- [Testing Verification](#testing-verification)
- [Production Deployment](#production-deployment)
- [Monitoring & Dashboards](#monitoring--dashboards)
- [Troubleshooting](#troubleshooting)

---

## Overview

### What's Included

**PostHog Analytics**:

- User behavior tracking (page views, feature usage)
- Custom budget app events (50+ event types)
- Performance metrics (DAU, WAU, MAU)
- Privacy-compliant data collection

**Sentry Error Tracking**:

- Client-side error monitoring
- Performance tracing (5% sample rate)
- Source maps for production debugging
- Context-rich error reports

**Privacy Features**:

- User opt-out controls in Settings
- No PII tracking (no transaction amounts, descriptions, account numbers)
- Data sanitization before sending
- GDPR/CCPA compliant

### Architecture

```
User Interaction
    ↓
Budget App Component (e.g., TransactionModal)
    ↓
trackBudgetEvent() → Privacy Check → Sanitize Data
    ↓                                     ↓
PostHog API                         Sentry API
    ↓                                     ↓
Analytics Dashboard              Error Dashboard
```

---

## PostHog Analytics Setup

### 1. Create PostHog Project

1. **Sign up at [PostHog](https://posthog.com)**:
   - Go to https://app.posthog.com/signup
   - Create account with your email
   - Choose cloud hosting (or self-hosted if preferred)

2. **Create new project**:
   - Project name: "Budget App"
   - Company name: Your organization
   - Website URL: https://yourdomain.com

3. **Get API key**:
   - Go to Settings → Project Settings
   - Copy your **Project API Key** (starts with `phc_`)
   - **Important**: This is a client-side key (safe to expose)

### 2. Configure PostHog in Budget App

**Add environment variable** (`.env.local` or Vercel environment):

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Verification**:

```bash
# Check environment variable is set
npm run dev

# In browser console, check:
console.log(process.env.NEXT_PUBLIC_POSTHOG_KEY);
# Should output: "phc_..."
```

### 3. Enable PostHog Features

**Recommended settings in PostHog dashboard**:

1. **Session Recording** (Settings → Session Recording):
   - ✅ Enable session recording
   - ⚠️ **Privacy**: Mask text inputs (enabled by default)
   - Set sample rate: 10% (reduce for high traffic)

2. **Event Autocapture** (Settings → Autocapture):
   - ✅ Enable autocapture
   - Capture: Clicks, page views, form submits
   - ❌ Disable: Input values, sensitive data

3. **Feature Flags** (optional):
   - Create flags for A/B testing new features
   - Example: `enable-chatbot`, `enable-ai-predictions`

### 4. Verify PostHog Integration

**Check events are being sent**:

1. Open Budget App in browser
2. Perform actions (add transaction, create budget)
3. Go to PostHog → Activity → Live Events
4. You should see events like:
   - `transaction_added`
   - `budget_created`
   - `page_view`

**Check user properties**:

```typescript
// In browser console:
posthog?.identify("user-id", {
  plan: "free",
  budgets_count: 5,
});
```

---

## Sentry Error Tracking Setup

### 1. Create Sentry Project

1. **Sign up at [Sentry](https://sentry.io)**:
   - Go to https://sentry.io/signup
   - Create account with your email

2. **Create new project**:
   - Platform: **Next.js**
   - Project name: "budget-app"
   - Set alerts: Weekly email summary

3. **Get DSN**:
   - Go to Settings → Projects → budget-app → Client Keys (DSN)
   - Copy your **DSN** (looks like `https://abc123@o123.ingest.sentry.io/456`)

### 2. Configure Sentry in Budget App

**Add environment variable** (`.env.local` or Vercel environment):

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn_here
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

**Verification**:

```bash
# Check environment variable is set
npm run dev

# In browser console, check:
console.log(process.env.NEXT_PUBLIC_SENTRY_DSN);
# Should output: "https://..."
```

### 3. Enable Sentry Features

**Recommended settings in Sentry dashboard**:

1. **Alerts** (Settings → Alerts):
   - Create alert: "High error rate" (> 10 errors in 5 minutes)
   - Notification: Email + Slack (if integrated)

2. **Performance Monitoring** (Performance tab):
   - ✅ Enable performance monitoring
   - Sample rate: 5% (already set in code)
   - Track: Page loads, API calls, database queries

3. **Source Maps** (Settings → Source Maps):
   - ✅ Enable source maps upload (for production debugging)
   - Upload via CI/CD (see Production Deployment section)

### 4. Verify Sentry Integration

**Trigger test error**:

```typescript
// In browser console:
throw new Error("Sentry test error");
```

**Check error appears in Sentry**:

1. Go to Sentry → Issues
2. You should see: "Sentry test error"
3. Click to view details (stack trace, user context, breadcrumbs)

---

## Environment Variables

### Required Variables

```bash
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production  # or 'staging', 'development'
```

### Optional Variables

```bash
# Sentry Performance Tracing
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05  # 5% of transactions (default)

# PostHog Session Recording
NEXT_PUBLIC_POSTHOG_RECORD_SESSIONS=true  # Enable session recording
```

### Deployment Environments

**Development** (`.env.local`):

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_dev_key
NEXT_PUBLIC_SENTRY_DSN=  # Leave empty to disable in dev
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

**Staging** (Vercel environment variables):

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_staging_key
NEXT_PUBLIC_SENTRY_DSN=https://staging_dsn
NEXT_PUBLIC_SENTRY_ENVIRONMENT=staging
```

**Production** (Vercel environment variables):

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_prod_key
NEXT_PUBLIC_SENTRY_DSN=https://prod_dsn
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

---

## Privacy Compliance

### GDPR/CCPA Requirements

**User Consent** (implemented in Privacy Settings):

1. **Analytics opt-out**: Settings → Privacy & AI Controls → "Enable Analytics"
2. **Error tracking opt-out**: Settings → Privacy & AI Controls → "Enable Error Tracking"
3. **Default**: Both enabled (user can disable anytime)

**Data Minimization**:

- ✅ Only track event metadata (no PII)
- ✅ Sanitize transaction descriptions (remove sensitive info)
- ✅ No account numbers, credit card numbers, SSNs
- ✅ No personal identifiers (name, email) unless user opts in

### Privacy-Safe Data

**What we track**:

- Feature usage counts (e.g., "5 transactions added")
- Category names (e.g., "Groceries", "Dining Out")
- Success/failure status
- Performance metrics (page load time, database query time)

**What we DON'T track**:

- Transaction amounts (except counts)
- Transaction descriptions (sanitized)
- Account balances
- Account numbers
- Bank names
- User's real name/email (unless they identify themselves)

### Privacy Checklist

Before production deployment:

- [ ] Environment variables configured
- [ ] Privacy settings page displays opt-out toggles
- [ ] `trackBudgetEvent()` respects user opt-out
- [ ] No PII in PostHog events (verify in PostHog dashboard)
- [ ] No PII in Sentry errors (verify in Sentry dashboard)
- [ ] Privacy policy updated with analytics disclosure
- [ ] Cookie consent banner displays (if required in your region)

---

## Testing Verification

### Local Testing

**1. Verify analytics initialization**:

```bash
# Start development server
npm run dev

# Open browser console
# You should see:
[PostHog] Initialized
[Sentry] Initialized
```

**2. Trigger test events**:

```typescript
// In browser console:
import { trackBudgetEvent } from "@/lib/budget-analytics";

trackBudgetEvent("transaction_added", {
  section: "transactions",
  method: "manual",
  success: true,
});

// Check PostHog dashboard → Activity → Live Events
// Event should appear within seconds
```

**3. Trigger test error**:

```typescript
// In browser console:
throw new Error("Test error for Sentry");

// Check Sentry dashboard → Issues
// Error should appear within seconds
```

### Component Testing

**Test TransactionModal tracking**:

1. Open Budget App → Transactions
2. Click "Add Transaction"
3. Fill in form and save
4. **Expected**: `transaction_added` event in PostHog
5. Check PostHog dashboard → Activity → Live Events

**Test privacy opt-out**:

1. Go to Settings → Privacy & AI Controls
2. Toggle OFF "Enable Analytics"
3. Add a transaction
4. **Expected**: No events in PostHog (user opted out)

### Production Testing

**Smoke test after deployment**:

```bash
# 1. Check environment variables are set
curl https://yourdomain.com/_next/static/chunks/webpack.js | grep NEXT_PUBLIC_POSTHOG_KEY
# Should NOT show your key (it's bundled)

# 2. Open production site in browser
# 3. Open browser console
# 4. Check for initialization logs
# 5. Perform actions (add transaction, create budget)
# 6. Verify events in PostHog dashboard
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Environment variables set in Vercel/deployment platform
- [ ] PostHog project API key configured
- [ ] Sentry project DSN configured
- [ ] Privacy policy updated
- [ ] Cookie consent implemented (if required)
- [ ] Analytics opt-out tested
- [ ] Source maps configured for Sentry

### Vercel Deployment

**1. Set environment variables in Vercel**:

```bash
# Via Vercel CLI
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
# Paste your key when prompted

vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Paste your DSN when prompted

vercel env add NEXT_PUBLIC_SENTRY_ENVIRONMENT production
# Enter: production
```

**Or via Vercel dashboard**:

1. Go to Project Settings → Environment Variables
2. Add each variable with production scope

**2. Deploy**:

```bash
# Deploy to production
vercel --prod

# Verify deployment
curl https://yourdomain.com/api/health
```

### Post-Deployment Verification

**1. Verify PostHog events**:

- Open production site
- Perform actions (add transaction, view reports)
- Check PostHog dashboard → Activity → Live Events
- Verify events appear with `$current_url` = your production domain

**2. Verify Sentry errors**:

- Trigger test error in production (via browser console)
- Check Sentry dashboard → Issues
- Verify error has correct environment tag ("production")

**3. Check performance**:

- Run Lighthouse audit
- Verify analytics/error tracking doesn't impact:
  - Time to Interactive (TTI) < 3.5s
  - First Contentful Paint (FCP) < 1.8s
  - Total Blocking Time (TBT) < 300ms

---

## Monitoring & Dashboards

### PostHog Dashboards

**Create custom dashboards** (PostHog → Dashboards → New Dashboard):

**1. Budget App Overview Dashboard**:

- DAU / WAU / MAU chart
- Top 10 events (past 7 days)
- Feature usage breakdown (transactions, budgets, loans, reports)
- User retention cohort

**2. Transaction Tracking Dashboard**:

- `transaction_added` events (daily)
- `csv_import_completed` events
- `ocr_success` rate
- Top categories used

**3. Error Rate Dashboard**:

- `client_error` events
- `import_failure_rate`
- `ocr_failure_rate`
- Error trends (past 30 days)

### Sentry Alerts

**Create alerts** (Sentry → Alerts → Create Alert):

**1. High Error Rate Alert**:

- Condition: Error count > 10 in 5 minutes
- Notify: Email + Slack
- Environment: production

**2. Performance Degradation Alert**:

- Condition: p95 page load time > 5 seconds
- Notify: Email
- Environment: production

**3. New Issue Alert**:

- Condition: First seen issue (new error type)
- Notify: Email
- Environment: production

### Key Metrics to Monitor

**Daily**:

- DAU (Daily Active Users)
- Error rate (errors per 1000 requests)
- Page load time (p95)

**Weekly**:

- WAU (Weekly Active Users)
- Feature adoption (% users using new features)
- Retention rate (week-over-week)

**Monthly**:

- MAU (Monthly Active Users)
- Churn rate
- Average session duration

---

## Troubleshooting

### PostHog Events Not Appearing

**Symptom**: Events not showing in PostHog dashboard

**Solutions**:

1. **Check environment variable**:

   ```bash
   # In browser console:
   console.log(process.env.NEXT_PUBLIC_POSTHOG_KEY);
   # Should output your key
   ```

2. **Check user opted out**:
   - Go to Settings → Privacy & AI Controls
   - Ensure "Enable Analytics" is toggled ON

3. **Check network requests**:
   - Open browser DevTools → Network tab
   - Filter: "posthog"
   - You should see POST requests to PostHog API
   - If blocked, check ad blockers / privacy extensions

4. **Check PostHog SDK loaded**:
   ```typescript
   // In browser console:
   console.log(window.posthog);
   // Should output PostHog object
   ```

### Sentry Errors Not Appearing

**Symptom**: Errors not showing in Sentry dashboard

**Solutions**:

1. **Check environment variable**:

   ```bash
   # In browser console:
   console.log(process.env.NEXT_PUBLIC_SENTRY_DSN);
   # Should output your DSN
   ```

2. **Check Sentry SDK loaded**:

   ```typescript
   // In browser console:
   console.log(window.Sentry);
   // Should output Sentry object
   ```

3. **Check network requests**:
   - Open browser DevTools → Network tab
   - Filter: "sentry"
   - You should see POST requests to Sentry API

4. **Trigger test error**:
   ```typescript
   throw new Error("Sentry test error");
   ```

### Performance Impact

**Symptom**: Slow page loads after enabling analytics

**Solutions**:

1. **Lazy load analytics**:
   - Already implemented via `requestIdleCallback`
   - Loads after page is interactive

2. **Reduce Sentry sample rate**:

   ```typescript
   // In monitoring-client.tsx:
   tracesSampleRate: 0.01, // Reduce from 0.05 to 0.01 (1%)
   ```

3. **Disable session recording** (PostHog):
   - Go to PostHog → Settings → Session Recording
   - Reduce sample rate to 5% or disable

### Privacy Concerns

**Symptom**: PII appearing in PostHog/Sentry events

**Solutions**:

1. **Check sanitization**:
   - Review `src/lib/budget-analytics.ts` → `sanitizeProperties()`
   - Ensure only allowlisted properties pass through

2. **Configure Sentry scrubbing**:
   - Go to Sentry → Settings → Data Scrubbing
   - Add sensitive field names: `accountNumber`, `ssn`, `email`

3. **Review PostHog autocapture**:
   - Go to PostHog → Settings → Autocapture
   - Ensure "Mask text inputs" is enabled

---

## Next Steps

**After deployment**:

1. **Monitor for 1 week**:
   - Check PostHog dashboards daily
   - Review Sentry errors daily
   - Verify no PII in events

2. **Create baseline metrics**:
   - Record DAU/WAU/MAU after 1 week
   - Set targets for next month

3. **Set up alerts**:
   - High error rate → Email/Slack
   - Performance degradation → Email

4. **Iterate on dashboards**:
   - Add custom insights
   - Track new features as they launch

---

## Resources

**PostHog**:

- Docs: https://posthog.com/docs
- API Reference: https://posthog.com/docs/api
- Community: https://posthog.com/questions

**Sentry**:

- Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Source Maps: https://docs.sentry.io/platforms/javascript/sourcemaps/
- Performance: https://docs.sentry.io/product/performance/

**Budget App**:

- Code: `src/lib/budget-analytics.ts` (analytics wrapper)
- Privacy: `src/lib/budget-privacy-settings.ts` (user controls)
- Client: `src/app/analytics-client.tsx` (PostHog integration)
- Monitoring: `src/app/monitoring-client.tsx` (Sentry integration)

---

**Last Updated**: November 9, 2025
**Maintainer**: Budget App Team
**Version**: 1.0
