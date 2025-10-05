# Production Deployment Runbook

**Modern Tanium TCO Learning Management System**

**Deployment Date**: January 2025
**Environment**: Production
**Deployer**: [Your Name]

---

## 📋 Pre-Deployment Checklist

### ✅ Code Quality
- [x] All features implemented (4-week plan 100% complete)
- [x] Build passes successfully (`npm run build`)
- [x] No TypeScript errors
- [x] No critical ESLint warnings
- [x] All tests passing (unit, integration, E2E)
- [x] Documentation complete (User Guide, Admin Guide, FAQ, Video Scripts)

### ✅ Environment Variables (Production)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Production Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Production service role key (server-side only)
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics key
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking DSN
- [ ] `SENTRY_AUTH_TOKEN` - Sentry auth token for source maps
- [ ] `NEXT_PUBLIC_APP_URL` - Production domain (e.g., https://tco.example.com)
- [ ] `NEXT_PUBLIC_VIDEOS_*` - YouTube video IDs for each module

### ✅ Database (Supabase Production)
- [ ] Production database created
- [ ] RLS policies deployed and tested
- [ ] Database migrations applied
- [ ] Seed data loaded (if applicable)
- [ ] Database backups configured (daily)
- [ ] Connection pooling enabled
- [ ] Performance indexes created

### ✅ Domain & SSL
- [ ] Domain purchased/configured (e.g., tco.example.com)
- [ ] DNS records pointing to Vercel
- [ ] SSL certificate provisioned (automatic via Vercel)
- [ ] Custom domain added to Vercel project
- [ ] WWW redirect configured (optional)

### ✅ Analytics & Monitoring
- [ ] PostHog project created
- [ ] PostHog API key added to environment variables
- [ ] Sentry project created
- [ ] Sentry DSN added to environment variables
- [ ] Sentry source maps upload configured
- [ ] Vercel Analytics enabled
- [ ] Uptime monitoring configured (e.g., UptimeRobot, Better Uptime)

### ✅ Security
- [ ] All secrets stored in Vercel environment variables (not in code)
- [ ] RLS policies tested and validated
- [ ] CORS configuration verified
- [ ] CSP headers configured
- [ ] Rate limiting implemented (if applicable)
- [ ] Dependency vulnerabilities resolved (`npm audit`)

### ✅ Content
- [ ] All modules reviewed and finalized
- [ ] All videos uploaded and accessible
- [ ] Question bank reviewed and validated
- [ ] Spelling/grammar checked
- [ ] Certification blueprint alignment verified

### ✅ Legal & Compliance
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Cookie Policy published (if using cookies)
- [ ] GDPR compliance verified
- [ ] Accessibility (WCAG 2.1 AA) validated

---

## 🚀 Deployment Steps

### Step 1: Prepare Production Environment

#### 1.1 Create Production Supabase Project (if not exists)

```bash
# Option A: Via Supabase Dashboard (Recommended)
# 1. Go to https://app.supabase.com
# 2. Click "New Project"
# 3. Name: "tanium-tco-prod"
# 4. Region: Choose closest to users
# 5. Database Password: Generate strong password (save securely)
# 6. Click "Create Project"
# 7. Wait 2-3 minutes for provisioning

# Option B: Via Supabase CLI
supabase projects create tanium-tco-prod --org-id YOUR_ORG_ID --region us-east-1
```

#### 1.2 Copy Database Schema to Production

```bash
# Export schema from development
supabase db dump -f schema.sql

# Apply to production
supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

#### 1.3 Create PostHog Project

```bash
# 1. Go to https://app.posthog.com
# 2. Click "Create Project"
# 3. Name: "Modern Tanium TCO Production"
# 4. Copy API key from Settings → Project
```

#### 1.4 Create Sentry Project

```bash
# 1. Go to https://sentry.io
# 2. Click "Create Project"
# 3. Platform: Next.js
# 4. Name: "modern-tanium-tco-prod"
# 5. Copy DSN from Settings
# 6. Generate auth token: Settings → Auth Tokens → Create Token
```

---

### Step 2: Configure Vercel Project

#### 2.1 Link Project to Vercel (if not already)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
cd /home/robne/projects/active/tanium-tco/modern-tco
vercel link
# Follow prompts:
# - Setup and deploy? Y
# - Scope: robert-neveus-projects
# - Link to existing project? Y
# - Project name: modern-tco
```

#### 2.2 Add Production Environment Variables

```bash
# Via Vercel CLI (Recommended for bulk)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://[YOUR_PROD_PROJECT].supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: [YOUR_PROD_ANON_KEY]

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste: [YOUR_PROD_SERVICE_ROLE_KEY]

vercel env add NEXT_PUBLIC_POSTHOG_KEY production
# Paste: [YOUR_POSTHOG_KEY]

vercel env add NEXT_PUBLIC_POSTHOG_HOST production
# Paste: https://app.posthog.com

vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Paste: [YOUR_SENTRY_DSN]

vercel env add SENTRY_AUTH_TOKEN production
# Paste: [YOUR_SENTRY_AUTH_TOKEN]

vercel env add NEXT_PUBLIC_APP_URL production
# Paste: https://tco.example.com

# Video environment variables (already configured, verify)
vercel env add NEXT_PUBLIC_VIDEOS_ASKING_QUESTIONS production
# Paste: aoLJYG3lV8o,A7g9Y_EKmHU

vercel env add NEXT_PUBLIC_VIDEOS_NAVIGATION_MODULES production
# Paste: n9rNuvAYSlM,wF36rD7dIT8

vercel env add NEXT_PUBLIC_VIDEOS_REFINING_QUESTIONS production
# Paste: 22H_oUgPgZI

vercel env add NEXT_PUBLIC_VIDEOS_REPORTING_EXPORT production
# Paste: wF36rD7dIT8

vercel env add NEXT_PUBLIC_VIDEOS_TAKING_ACTION production
# Paste: dP4dar1ftFg
```

**Alternative: Via Vercel Dashboard**
1. Go to https://vercel.com/robert-neveus-projects/modern-tco
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - Select "Production" environment
   - Enter key and value
   - Click "Save"

#### 2.3 Configure Custom Domain

```bash
# Via Vercel CLI
vercel domains add tco.example.com

# Via Vercel Dashboard (Recommended)
# 1. Go to Project Settings → Domains
# 2. Click "Add Domain"
# 3. Enter: tco.example.com
# 4. Vercel provides DNS records (A, CNAME)
# 5. Add DNS records at your domain registrar
# 6. Wait for DNS propagation (5-60 minutes)
# 7. SSL certificate auto-provisions
```

**DNS Configuration Example:**
```
Type: A
Name: tco (or @)
Value: 76.76.19.19 (Vercel's IP, check current)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

### Step 3: Run Pre-Deployment Checks

#### 3.1 Build Verification

```bash
# Clean build
rm -rf .next
npm run build

# Expected output:
# ✓ Compiled successfully in X seconds
# ✓ Generating static pages
# ✓ Finalizing page optimization
# No errors
```

#### 3.2 Environment Variable Validation

```bash
# Check production environment variables are set
vercel env ls

# Expected output should include all required variables
# Verify no secrets are committed to git
git log --all --full-history --pretty=format: -- .env.production | grep -i "key\|secret\|password"
# Should return nothing
```

#### 3.3 Database Connection Test

```bash
# Test connection to production database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" -c "SELECT 1;"

# Expected output:
#  ?column?
# ----------
#         1
# (1 row)
```

#### 3.4 RLS Policy Validation

```sql
-- Connect to production database
-- Run policy validation queries

-- Check all RLS policies are enabled
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should return policies for:
-- - user_profiles
-- - student_progress
-- - student_assessments
-- - practice_questions
-- - video_progress
-- - study_sessions

-- Test RLS with sample user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'sample-user-uuid';
SELECT * FROM user_profiles WHERE user_id = 'sample-user-uuid';
-- Should return 1 row (or error if no test user)
```

---

### Step 4: Deploy to Production

#### 4.1 Deploy via Vercel CLI

```bash
# Deploy to production
vercel --prod

# Expected output:
# 🔍  Inspect: https://vercel.com/robert-neveus-projects/modern-tco/[DEPLOYMENT_ID]
# ✅  Production: https://modern-tco.vercel.app [XX秒]
```

#### 4.2 Monitor Deployment

```bash
# Watch deployment logs
vercel logs https://modern-tco.vercel.app --follow

# Check deployment status
vercel inspect [DEPLOYMENT_URL]
```

**Via Vercel Dashboard:**
1. Go to https://vercel.com/robert-neveus-projects/modern-tco
2. Click "Deployments" tab
3. Watch latest deployment in real-time
4. Check for build errors or warnings

#### 4.3 Deployment Rollback (if needed)

```bash
# If deployment fails, rollback to previous version
vercel rollback

# Or via dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"
```

---

### Step 5: Post-Deployment Verification

#### 5.1 Smoke Tests

**Homepage Test:**
```bash
# Test homepage loads
curl -I https://tco.example.com

# Expected:
# HTTP/2 200
# content-type: text/html
```

**Dashboard Test:**
```bash
# Navigate to dashboard (requires login)
# Manual test: Open browser, sign in, check dashboard loads
```

**API Health Check:**
```bash
# Test API health endpoint
curl https://tco.example.com/api/health

# Expected:
# {"status":"ok","timestamp":"2025-01-XX..."}
```

**Database Connection:**
```bash
# Check if app can connect to production database
# Manual test: Sign in, load dashboard (should show user data)
```

**Video Playback:**
```bash
# Manual test: Navigate to any module, verify video embeds load
# Open browser → Go to /learn/asking-questions → Check video plays
```

#### 5.2 Performance Tests

**Lighthouse Audit:**
```bash
# Run Lighthouse on production
npx lighthouse https://tco.example.com --view

# Target scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 90+
```

**Load Time:**
```bash
# Check page load times
curl -w "@curl-format.txt" -o /dev/null -s https://tco.example.com

# Create curl-format.txt:
#     time_namelookup:  %{time_namelookup}\n
#        time_connect:  %{time_connect}\n
#     time_appconnect:  %{time_appconnect}\n
#    time_pretransfer:  %{time_pretransfer}\n
#       time_redirect:  %{time_redirect}\n
#  time_starttransfer:  %{time_starttransfer}\n
#                     ----------\n
#          time_total:  %{time_total}\n

# Target: time_total < 2 seconds
```

#### 5.3 Analytics Verification

**PostHog Events:**
```bash
# Manual test:
# 1. Navigate to https://tco.example.com
# 2. Perform actions (page view, sign in, watch video)
# 3. Check PostHog dashboard for events:
#    - $pageview
#    - video_play
#    - sign_in

# Go to: https://app.posthog.com → Project → Activity
# Should see real-time events
```

**Sentry Errors:**
```bash
# Trigger test error (if test endpoint exists)
curl https://tco.example.com/api/sentry-test

# Check Sentry dashboard:
# Go to: https://sentry.io → Project → Issues
# Should see test error appear within 30 seconds
```

#### 5.4 Security Validation

**SSL Certificate:**
```bash
# Check SSL is properly configured
curl -vI https://tco.example.com 2>&1 | grep -i "ssl\|tls"

# Expected:
# SSL certificate verify ok
# TLSv1.3 (or TLSv1.2 minimum)
```

**Security Headers:**
```bash
# Check security headers
curl -I https://tco.example.com | grep -i "x-frame-options\|x-content-type-options\|strict-transport-security"

# Expected headers:
# x-frame-options: DENY (or SAMEORIGIN)
# x-content-type-options: nosniff
# strict-transport-security: max-age=31536000
```

**RLS Protection:**
```bash
# Manual test:
# 1. Sign in as User A
# 2. Try to access /api/user/[USER_B_ID]/progress
# 3. Should return 403 Forbidden or no data

# Automated test (if API endpoints exist):
curl -H "Authorization: Bearer [USER_A_TOKEN]" \
     https://tco.example.com/api/user/[USER_B_ID]/progress

# Expected: 403 Forbidden or {"error": "Access denied"}
```

---

### Step 6: Enable Monitoring & Alerts

#### 6.1 Configure Uptime Monitoring

**UptimeRobot (Free tier available):**
```bash
# 1. Go to https://uptimerobot.com
# 2. Add New Monitor
#    - Type: HTTPS
#    - Name: Modern Tanium TCO Production
#    - URL: https://tco.example.com
#    - Interval: 5 minutes
# 3. Set up alerts:
#    - Email: devops@your-domain.com
#    - SMS: +1-XXX-XXX-XXXX (optional)
```

**Better Uptime (Alternative):**
```bash
# 1. Go to https://betteruptime.com
# 2. Create monitor for https://tco.example.com
# 3. Set up incident management workflow
```

#### 6.2 Configure Error Alerts (Sentry)

```bash
# In Sentry dashboard:
# 1. Go to Settings → Alerts
# 2. Create Alert Rule:
#    - Name: "High Error Rate"
#    - Conditions: Error count > 10 in 5 minutes
#    - Actions: Email team@your-domain.com
# 3. Create Alert Rule:
#    - Name: "New Issue"
#    - Conditions: First seen in project
#    - Actions: Slack #alerts channel (optional)
```

#### 6.3 Configure Performance Alerts (Vercel)

```bash
# In Vercel Dashboard:
# 1. Go to Settings → Notifications
# 2. Enable:
#    - Deployment failed
#    - Deployment ready
#    - Domain configuration errors
# 3. Add notification channels:
#    - Email: team@your-domain.com
#    - Slack: #deployments (optional)
```

---

## 📊 Post-Deployment Monitoring

### Week 1: Intensive Monitoring

**Daily Checks:**
- [ ] Check Vercel deployments for errors
- [ ] Review Sentry for new errors (target: < 5 per day)
- [ ] Review PostHog for user activity
- [ ] Check uptime monitoring (target: 99.9%)
- [ ] Review database performance (query times < 100ms)
- [ ] Monitor Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

**Metrics to Watch:**
- **User Signups**: Track daily new users
- **Active Users**: Daily active users (DAU)
- **Error Rate**: Errors per 1000 requests (target: < 0.1%)
- **Page Load Time**: 95th percentile < 3 seconds
- **Database Connections**: Monitor connection pool usage
- **API Response Times**: 95th percentile < 200ms

### Month 1: Optimization Phase

**Weekly Reviews:**
- [ ] Analyze PostHog user funnels (identify drop-offs)
- [ ] Review Sentry performance issues
- [ ] Check Vercel Analytics (page views, popular pages)
- [ ] Database query optimization (identify slow queries)
- [ ] Content adjustments based on user feedback
- [ ] Update documentation based on support tickets

**Optimization Opportunities:**
- Identify most-accessed pages → optimize further
- Identify least-accessed features → improve discoverability
- Analyze user paths → improve onboarding
- Review error patterns → fix common issues

---

## 🔄 Rollback Procedures

### When to Rollback

**Immediate rollback if:**
- Site is completely down (500 errors on all pages)
- Critical security vulnerability discovered
- Database corruption or data loss
- Authentication completely broken (no users can log in)

**Consider rollback if:**
- Error rate > 1% of requests
- Performance degradation > 50% (page load time doubles)
- Critical feature broken (e.g., assessments don't save scores)
- Multiple user reports of issues within first hour

### Rollback Steps

#### Option 1: Vercel Instant Rollback (Recommended)

```bash
# Via CLI
vercel rollback

# Via Dashboard (Faster):
# 1. Go to https://vercel.com/robert-neveus-projects/modern-tco
# 2. Click "Deployments"
# 3. Find last working deployment (green checkmark)
# 4. Click "..." → "Promote to Production"
# 5. Confirm rollback
# Time to complete: 30-60 seconds
```

#### Option 2: Deploy Previous Git Commit

```bash
# Revert to previous commit
git log --oneline -10  # Find last working commit
git revert HEAD  # Or git revert [COMMIT_SHA]
git push origin main

# Vercel auto-deploys from main branch
# Time to complete: 2-3 minutes
```

#### Option 3: Database Rollback (if needed)

```bash
# Restore from latest backup (Supabase)
# 1. Go to Supabase Dashboard → Database → Backups
# 2. Select most recent backup before deployment
# 3. Click "Restore"
# 4. Confirm restoration
# Time to complete: 5-15 minutes
# WARNING: This loses any data created since backup
```

### Post-Rollback Actions

- [ ] Investigate root cause of issue
- [ ] Fix issue in development environment
- [ ] Test fix thoroughly
- [ ] Create incident report
- [ ] Communicate status to users (if downtime > 5 minutes)
- [ ] Schedule new deployment with fix

---

## 📞 Emergency Contacts

**Production Issues:**
- **On-Call Engineer**: emergency@your-domain.com / +1-800-XXX-XXXX
- **DevOps Lead**: devops@your-domain.com / +1-800-XXX-XXXX
- **Technical Lead**: tech-lead@your-domain.com / +1-800-XXX-XXXX

**Vendor Support:**
- **Vercel Support**: support@vercel.com / https://vercel.com/support
- **Supabase Support**: support@supabase.io / https://supabase.com/support
- **PostHog Support**: hey@posthog.com / https://posthog.com/docs
- **Sentry Support**: support@sentry.io / https://sentry.io/support

---

## ✅ Deployment Sign-Off

**Deployment Completed By**: __________________
**Date**: __________________
**Time**: __________________

**Verification Checklist:**
- [ ] All pre-deployment checks completed
- [ ] Production environment configured
- [ ] Database migrated and tested
- [ ] Domain and SSL active
- [ ] Analytics and monitoring operational
- [ ] Smoke tests passed
- [ ] Performance tests passed (Lighthouse 90+)
- [ ] Security validation completed
- [ ] Monitoring and alerts configured
- [ ] Team notified of deployment
- [ ] Documentation updated with production URLs

**Notes:**
________________________________________________________________
________________________________________________________________
________________________________________________________________

**Approved By**: __________________
**Date**: __________________

---

**Production URL**: https://tco.example.com (update with actual domain)
**Vercel Dashboard**: https://vercel.com/robert-neveus-projects/modern-tco
**Supabase Dashboard**: https://app.supabase.com/project/[YOUR_PROJECT_REF]
**PostHog Dashboard**: https://app.posthog.com
**Sentry Dashboard**: https://sentry.io/organizations/[YOUR_ORG]/projects/modern-tanium-tco-prod/

---

**Last Updated**: January 2025
**Runbook Version**: 1.0
**Maintained By**: Modern Tanium TCO Platform Team
