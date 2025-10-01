# Vercel Production Deployment Instructions

**Date:** September 30, 2025
**Project:** Modern Tanium TCO Learning Management System
**Status:** ✅ Ready for Production

---

## 🚀 Quick Deploy (Automated)

### Option 1: One-Command Deploy

```bash
# Run the automated deployment script
./deploy-to-vercel.sh
```

This script will:
1. ✅ Verify Vercel login
2. ✅ Set all required environment variables
3. ✅ Ask for confirmation
4. ✅ Deploy to production

---

## 📋 Manual Deployment Steps

### Step 1: Verify Vercel Login

```bash
vercel whoami
# Should show: robneveu-1549
```

### Step 2: Set Environment Variables

#### Required (Critical):

```bash
# Supabase Configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter: https://qnwcwoutgarhqxlgsjzs.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NzM0MjgsImV4cCI6MjA3MjI0OTQyOH0.nooeC4pyNsoRok5zKat9iwUk9rgCfz_b5SWqZ7_dgtQ

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY3MzQyOCwiZXhwIjoyMDcyMjQ5NDI4fQ.U_FDgUC__dtFPVd5jrTpmwaWiDWJ701w4lRbe4qy1T4

# Node Environment
vercel env add NODE_ENV production
# Enter: production
```

#### Optional (Recommended):

```bash
# App Configuration
vercel env add NEXT_PUBLIC_APP_NAME production
# Enter: Tanium Certified Operator Exam

vercel env add NEXT_PUBLIC_APP_VERSION production
# Enter: 1.0.0

# Analytics (optional - gracefully disabled if missing)
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
# Enter: <your-posthog-key> or skip

vercel env add NEXT_PUBLIC_POSTHOG_HOST production
# Enter: https://us.i.posthog.com or skip

# Error Tracking (optional)
vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Enter: <your-sentry-dsn> or skip

# Payments (optional)
vercel env add STRIPE_SECRET_KEY production
# Enter: <your-stripe-key> or skip
```

### Step 3: Verify Environment Variables

```bash
vercel env ls
```

Should show all configured variables with "Production" environment.

### Step 4: Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or with specific git commit
vercel --prod --force
```

### Step 5: Monitor Deployment

```bash
# Watch deployment logs
vercel logs --prod

# Check deployment status
vercel ls
```

---

## ✅ Post-Deployment Verification

### 1. Check Health Endpoint

```bash
curl https://your-app.vercel.app/api/health
# Should return: {"status":"ok"}
```

### 2. Test Supabase Connection

```bash
# Visit app in browser
open https://your-app.vercel.app

# Check browser console for errors (F12 > Console)
# Should see no Supabase connection errors
```

### 3. Verify CSP Headers

```bash
curl -I https://your-app.vercel.app | grep Content-Security-Policy
# Should show CSP header with Supabase domains
```

### 4. Test Critical Paths

Visit and test:
- [ ] Homepage loads
- [ ] User can sign up/log in
- [ ] Study modules are accessible
- [ ] Practice questions work
- [ ] Exam simulator functions
- [ ] Progress tracking updates

---

## 📊 Current Deployment Status

**Vercel Project:**
- Project ID: `prj_TtAEVD4AfNfyNA4Ox4C5V8K5osRf`
- Project Name: `modern-tco`
- Team: `robert-neveus-projects`
- Logged in as: `robneveu-1549`

**Recent Deployments:**
- Latest: 2 days ago (Ready ✓)
- Build time: 2-18 minutes
- Status: All deployments successful

---

## 🔧 Troubleshooting

### Issue: Build Fails

**Check:**
1. Vercel build logs: `vercel logs --prod`
2. Environment variables: `vercel env ls`
3. Node version in Vercel dashboard (should be 18.x or higher)

**Fix:**
```bash
# Redeploy with force flag
vercel --prod --force
```

### Issue: Supabase Connection Errors

**Check:**
1. Environment variables are set correctly
2. Supabase project status: https://status.supabase.io
3. CSP headers allow Supabase domains

**Fix:**
```bash
# Verify env vars
vercel env ls | grep SUPABASE

# If missing, add them:
./deploy-to-vercel.sh
```

### Issue: App Shows "Database Disabled"

**This is expected if:**
- Supabase env vars are not set
- App gracefully falls back to localStorage
- No functionality is broken

**To enable database:**
1. Set SUPABASE_URL and SUPABASE_ANON_KEY
2. Redeploy: `vercel --prod`

---

## 🚨 Emergency Rollback

### Rollback to Previous Deployment

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>

# Or use Vercel dashboard
# Go to: Deployments > Select deployment > Promote to Production
```

### Rollback Database (if needed)

1. Go to Supabase Dashboard
2. Navigate to: Database > Backups
3. Use Point-in-Time Recovery
4. Restore to previous state

---

## 📈 Monitoring & Analytics

### Vercel Dashboard
- URL: https://vercel.com/robert-neveus-projects/modern-tco
- Monitor: Traffic, Errors, Build times

### Supabase Dashboard
- URL: https://app.supabase.com/project/qnwcwoutgarhqxlgsjzs
- Monitor: Database activity, API requests, Errors

### PostHog (if configured)
- Monitor: User events, Feature usage, Analytics

### Sentry (if configured)
- Monitor: Error tracking, Performance issues

---

## 📋 Deployment Checklist

### Before Deployment
- [x] Build succeeds locally: `npm run build`
- [x] Zero TypeScript errors: `npx tsc --noEmit`
- [x] Zero vulnerabilities: `npm audit --production`
- [x] Environment variables ready
- [x] Database migrations prepared

### During Deployment
- [ ] Run deployment script: `./deploy-to-vercel.sh`
- [ ] Or manual: `vercel --prod`
- [ ] Monitor build logs
- [ ] Check deployment status

### After Deployment
- [ ] Test health endpoint
- [ ] Verify Supabase connection
- [ ] Test critical user flows
- [ ] Check browser console for errors
- [ ] Monitor for 1-2 hours

---

## 🎯 Success Criteria

✅ **Deployment successful if:**

1. Build completes without errors
2. App is accessible at production URL
3. Database connectivity works
4. No console errors on homepage
5. Critical paths functional:
   - User authentication
   - Study modules
   - Practice questions
   - Exam simulator

---

## 📞 Support

**Issues during deployment?**

1. Check Vercel logs: `vercel logs --prod`
2. Review this guide
3. Check production readiness reports:
   - `PERFORMANCE_REPORT.md`
   - `SUPABASE_PRE_DEPLOYMENT_REPORT.md`
   - `PRODUCTION_READINESS_FINAL.md`

---

**Generated:** September 30, 2025
**Last Updated:** Pre-deployment preparation
**Next Update:** Post-deployment verification
