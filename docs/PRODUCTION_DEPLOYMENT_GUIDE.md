# Production Deployment Guide - Tanium TCO LMS

**Project**: Modern Tanium TCO Learning Management System
**Target Platform**: Vercel (recommended)
**Last Updated**: October 1, 2025

---

## 🎯 Deployment Overview

This guide covers deploying the Tanium TCO LMS to production using Vercel, including environment setup, database configuration, monitoring, and rollback procedures.

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm run test`, `npm run test:vitest`)
- [ ] TypeScript compilation successful (`npm run typecheck`)
- [ ] ESLint passes with no errors (`npm run lint`)
- [ ] Production build succeeds locally:
  ```bash
  npm run build
  npm run start
  ```
- [ ] No console errors in production build

### Security
- [ ] All HIGH priority security items completed
- [ ] Sentry configured for error tracking
- [ ] Security headers verified (`next.config.js`)
- [ ] No secrets in codebase (check `.env.local` not committed)
- [ ] Dependency audit clean (`npm audit`)

### Content
- [ ] All 140+ questions reviewed by SME
- [ ] All 6 modules content validated
- [ ] Videos uploaded and functional
- [ ] Content validation checklist completed

### Database
- [ ] Supabase production project created
- [ ] Database schema deployed
- [ ] RLS policies active and tested
- [ ] Backups enabled (automatic daily)

---

## 🚀 Step 1: Vercel Project Setup

### Create Vercel Account & Project

1. **Sign up at Vercel**: https://vercel.com/signup
   - Use GitHub/GitLab/Bitbucket for easy integration

2. **Import Git Repository**:
   ```bash
   # Via Vercel Dashboard:
   # 1. Click "Add New Project"
   # 2. Import your Git repository
   # 3. Select "modern-tco" directory (if monorepo)
   ```

3. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or `modern-tco/` if in subdirectory)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
   - **Node Version**: 18.x (recommended)

---

## 🔧 Step 2: Environment Variables

### Required Environment Variables

Configure these in **Vercel Dashboard → Settings → Environment Variables**:

#### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Server-only, secret
```

**Get these from**: Supabase Dashboard → Settings → API

#### Admin Configuration
```bash
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

**Purpose**: Comma-separated list of emails with admin access to `/admin/questions`

#### Analytics (PostHog)
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_ANALYTICS_DEBUG=false # Set to true only for testing
```

**Get from**: PostHog Dashboard → Project Settings → API Keys

#### Error Tracking (Sentry)
```bash
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_AUTH_TOKEN=your_auth_token_here # For sourcemaps (optional)
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

**Get from**: Sentry Dashboard → Settings → Projects → Client Keys (DSN)

#### Optional: Stripe (if payment integration enabled)
```bash
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_TEAM=price_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
```

**Get from**: Stripe Dashboard → Developers → API Keys

#### Optional: Team Seat Limit
```bash
NEXT_PUBLIC_TEAM_SEAT_LIMIT=50
```

### Environment Variable Scopes

For each variable, set the appropriate scope:

- **Production**: Live production environment
- **Preview**: PR preview deployments
- **Development**: Local development (optional, use `.env.local` instead)

**Recommendation**: Set all variables for Production and Preview environments.

---

## 📊 Step 3: Database Setup (Supabase)

### Production Supabase Project

1. **Create Production Project**:
   - Go to https://supabase.com/dashboard
   - Create new project
   - Choose region closest to users
   - Set database password (save securely!)

2. **Deploy Database Schema**:

   **Option A: Via Supabase SQL Editor** (Recommended)
   ```sql
   -- Copy SQL from supabase/migrations/ directory
   -- Execute in SQL Editor
   -- Verify tables created
   ```

   **Option B: Via Migration Scripts**
   ```bash
   # Configure Supabase CLI locally
   npx supabase login

   # Link to production project
   npx supabase link --project-ref your-project-ref

   # Push migrations
   npx supabase db push
   ```

3. **Verify RLS Policies**:
   - Go to Supabase Dashboard → Authentication → Policies
   - Verify policies are active for all tables:
     - `questions`: Public read, admin write
     - `team_seats`: RLS by user/team
     - `practice_questions`: User-specific
     - `study_modules`: Public read

4. **Seed Production Data**:
   ```bash
   # Seed questions (140+ items)
   npm run content:seed

   # Verify seeding
   npm run content:stats
   ```

5. **Enable Backups**:
   - Go to Supabase Dashboard → Database → Backups
   - Enable automatic daily backups
   - Set retention period (7 days minimum recommended)
   - Test backup restoration process

6. **Configure Connection Pooling** (for high traffic):
   - Go to Settings → Database → Connection Pooling
   - Enable Supabase Pooler
   - Use pooler connection string for serverless functions

---

## 🌐 Step 4: Deploy to Production

### Deploy via Git Push

1. **Push to main branch** (Vercel auto-deploys if connected):
   ```bash
   git add .
   git commit -m "chore: Production deployment ready"
   git push origin main
   ```

2. **Monitor Deployment**:
   - Go to Vercel Dashboard → Deployments
   - Watch build logs in real-time
   - Wait for "Ready" status (usually 2-5 minutes)

### Deploy via Vercel CLI

**Alternative**: Deploy manually using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Follow prompts to link project
```

---

## ✅ Step 5: Post-Deployment Verification

### Smoke Tests

Run these tests immediately after deployment:

```bash
# 1. Health Check
curl https://your-domain.vercel.app/api/health
# Expected: {"ok":true,"data":{"status":"healthy",...}}

# 2. Homepage Load
curl -I https://your-domain.vercel.app
# Expected: HTTP 200

# 3. Key Routes
curl -I https://your-domain.vercel.app/welcome
curl -I https://your-domain.vercel.app/modules
curl -I https://your-domain.vercel.app/practice
# Expected: All HTTP 200
```

### Manual Testing Checklist

- [ ] **Authentication**:
  - Sign up new user
  - Verify email flow (if enabled)
  - Sign in successfully
  - Sign out
- [ ] **Learning Flow**:
  - Browse modules
  - Open module → content renders
  - Watch video → progress tracked
- [ ] **Assessment**:
  - Start practice mode
  - Answer questions
  - Submit and view results
- [ ] **Team Management** (if applicable):
  - Invite team member
  - Verify email sent
  - Activate seat
- [ ] **Admin Tools**:
  - Access `/admin/questions` with admin email
  - Verify non-admin cannot access
- [ ] **Settings**:
  - Toggle Large Text mode
  - Toggle High Contrast mode
  - Verify persistence across pages

### Performance Verification

```bash
# Run Lighthouse against production
npx lighthouse https://your-domain.vercel.app \
  --output=json \
  --output-path=./reports/production-lighthouse.json

# Target Scores:
# Performance: > 90
# Accessibility: 100
# Best Practices: > 95
# SEO: > 95
```

### Error Monitoring

- [ ] **Sentry Dashboard**: Verify no errors appearing
- [ ] **Vercel Logs**: Check for any warnings
- [ ] **Supabase Logs**: Verify database queries successful

---

## 📡 Step 6: Monitoring & Alerting

### Sentry Setup

1. **Verify Errors Tracked**:
   - Go to Sentry Dashboard
   - Test error tracking (trigger intentional error)
   - Verify error appears in dashboard

2. **Configure Alerts**:
   - Settings → Alerts → Create Alert Rule
   - Alert on: Error rate > 1% per minute
   - Notify: Email, Slack (optional)

### Uptime Monitoring (UptimeRobot)

1. **Create Monitor**:
   - URL: https://your-domain.vercel.app/api/health
   - Type: HTTPS
   - Interval: 5 minutes

2. **Set Up Alerts**:
   - Email notifications
   - SMS (optional, for critical alerts)
   - Slack webhook (optional)

3. **Create Status Page**:
   - Public status page (optional)
   - Show uptime statistics

### Vercel Analytics

- **Enable Speed Insights**:
  - Vercel Dashboard → Analytics
  - Enable for production
  - Monitor Core Web Vitals

- **Enable Web Analytics**:
  - Track pageviews
  - Track user sessions
  - Privacy-friendly (no cookies)

---

## 🔄 Step 7: Custom Domain (Optional)

### Configure Custom Domain

1. **Add Domain in Vercel**:
   - Vercel Dashboard → Settings → Domains
   - Add custom domain (e.g., `tanium-tco.example.com`)

2. **Configure DNS**:
   ```
   Type: CNAME
   Name: tanium-tco (or @)
   Value: cname.vercel-dns.com
   ```

3. **Verify SSL**:
   - Vercel automatically provisions SSL (Let's Encrypt)
   - Usually takes 5-10 minutes
   - Verify HTTPS works

4. **Set as Production Domain**:
   - Mark as production domain in Vercel
   - All deployments will use this domain

---

## 🔙 Step 8: Rollback Procedure

### Quick Rollback (Instant)

If deployment has critical issues:

1. **Via Vercel Dashboard**:
   - Go to Deployments
   - Find last known good deployment
   - Click "..." menu → "Promote to Production"
   - Instant rollback (< 1 minute)

2. **Via Vercel CLI**:
   ```bash
   # List deployments
   vercel ls

   # Rollback to specific deployment
   vercel rollback [deployment-url]
   ```

### Code Rollback (Git)

For code-level rollback:

```bash
# Revert last commit
git revert HEAD

# Or reset to previous commit
git reset --hard HEAD~1

# Force push (if necessary)
git push origin main --force

# Vercel will auto-deploy the rollback
```

### Database Rollback

**CAUTION**: Database rollback is complex. Follow these steps:

1. **Assess Impact**:
   - What data was affected?
   - Can we rollback safely?
   - Will user data be lost?

2. **Restore from Backup**:
   - Go to Supabase Dashboard → Database → Backups
   - Select backup point (before issue)
   - Restore to new project (safer than overwriting)

3. **Test Restored Database**:
   - Verify data integrity
   - Test critical features
   - Compare with production

4. **Switch Connection** (if safe):
   - Update `NEXT_PUBLIC_SUPABASE_URL` in Vercel
   - Redeploy
   - Monitor carefully

---

## 📋 Step 9: Post-Launch Monitoring

### Week 1 (Intensive Monitoring)

**Daily Tasks**:
- [ ] Review Sentry errors (2x per day)
- [ ] Check uptime monitoring (morning/evening)
- [ ] Monitor user sign-ups
- [ ] Track performance metrics (Vercel Analytics)
- [ ] Review user feedback/support tickets

**Target Metrics**:
- Uptime: > 99.5%
- Error Rate: < 0.5%
- Average Response Time: < 2s
- Lighthouse Performance: > 90

### Month 1 (Active Monitoring)

**Weekly Tasks**:
- [ ] Review analytics trends
- [ ] Check for security vulnerabilities (`npm audit`)
- [ ] Update dependencies if needed
- [ ] Plan hot-fixes for reported issues

**Success Metrics**:
- User Retention (30-day): > 50%
- Module Completion Rate: > 40%
- Mock Exam Attempts: Track growth
- User Satisfaction: Survey NPS > 50

---

## 🆘 Incident Response

### Critical Incident (Site Down)

1. **Assess Severity**:
   - Is site completely down?
   - Affecting all users or subset?
   - Database accessible?

2. **Immediate Actions**:
   - Check Vercel status (https://www.vercel-status.com/)
   - Check Supabase status (https://status.supabase.com/)
   - Review Sentry errors
   - Check recent deployments

3. **Rollback** (if deployment-related):
   - Promote last known good deployment
   - Verify site restored
   - Post incident review

4. **Communicate**:
   - Update status page (if available)
   - Notify users (email/social media)
   - Provide ETA for resolution

### Non-Critical Incident (Feature Broken)

1. **Document Issue**:
   - Create GitHub issue
   - Tag as bug/urgent
   - Assign to developer

2. **Prioritize Fix**:
   - Critical: Fix within 24 hours
   - High: Fix within 3 days
   - Medium: Fix in next sprint
   - Low: Backlog

3. **Deploy Fix**:
   - Test locally
   - Deploy to preview environment
   - Smoke test
   - Promote to production

---

## ✅ Deployment Complete Checklist

**Final Verification**:
- [ ] Production URL accessible
- [ ] All environment variables configured
- [ ] Database connected and seeded
- [ ] Sentry receiving errors (test error sent)
- [ ] Uptime monitoring active
- [ ] Performance metrics within targets
- [ ] All smoke tests passing
- [ ] Team notified of deployment
- [ ] Rollback procedure documented and tested

**Sign-Off**:

**Technical Lead**: ____________________ (Name, Date)

**DevOps Lead**: ____________________ (Name, Date)

**Deployment Successful**: [ ] YES / [ ] NO

**Production URL**: ______________________________________

---

## 📚 Additional Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Sentry Setup**: https://docs.sentry.io/platforms/javascript/guides/nextjs/

---

**Document Version**: 1.0
**Last Updated**: October 1, 2025
**Next Review**: After first production deployment
