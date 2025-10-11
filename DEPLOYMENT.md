# Deployment Guide

## Modern Tanium TCO Learning Management System

**Target Platform:** Vercel
**Last Updated:** October 11, 2025
**Status:** Production-Ready

---

## 📋 Quick Start

```bash
# 1. Build locally
npm run build
npm run start

# 2. Deploy to Vercel
vercel --prod

# 3. Verify deployment
curl https://your-domain.vercel.app/api/health
```

---

## ✅ Pre-Deployment Checklist

### Code Quality

- [ ] Tests passing: `npm run test`
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Linting clean: `npm run lint`
- [ ] Production build succeeds: `npm run build`
- [ ] No console errors in build

### Database

- [ ] Supabase project created
- [ ] Migrations applied (see [Migration Guide](#database-migrations))
- [ ] RLS policies active
- [ ] Backups enabled

### Security

- [ ] Environment variables configured
- [ ] No secrets in codebase
- [ ] Admin emails configured
- [ ] Dependency audit clean: `npm audit`

### Content

- [ ] 140+ questions reviewed
- [ ] 6 modules validated
- [ ] Videos functional
- [ ] Content populated

---

## 🚀 Vercel Deployment

### Method 1: Git Integration (Recommended)

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import Git repository
   - Select `modern-tco` directory

2. **Configure Build**

   ```
   Framework: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Node Version: 18.x
   ```

3. **Deploy**
   - Push to main branch → auto-deploys
   - Or manual deploy via Vercel dashboard

### Method 2: Vercel CLI

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

---

## 🔧 Environment Variables

### Required Variables

**Supabase (Database)**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://qnwcwoutgarhqxlgsjzs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # Server-only
```

_Get from_: Supabase Dashboard → Settings → API

**Admin Access**

```bash
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

**Analytics (PostHog)**

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_ANALYTICS_DEBUG=false
```

**Error Tracking (Sentry)**

```bash
NEXT_PUBLIC_SENTRY_DSN=https://key@o0.ingest.sentry.io/0
SENTRY_AUTH_TOKEN=your_token  # For sourcemaps
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### Optional Variables

**Payments (Stripe)**

```bash
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_TEAM=price_xxx
```

**Configuration:**

- Set in Vercel Dashboard → Settings → Environment Variables
- Apply to: Production, Preview (recommended)

---

## 📊 Database Migrations

### Production Schema Deployment

**⚠️ IMPORTANT:** See `docs/MIGRATION_INVENTORY.md` and `docs/MIGRATION_LINEAGE.md` for complete migration documentation.

**Key Migrations:**

- **001-002**: Core schema (deployed Sept 5, 2025)
- **005**: Study content tables ✅ **Use this version**
  - ❌ **Do NOT use 003-004** (deprecated, see migration lineage)
- **20251010-\*\*\***: AI, analytics, content system (Oct 10, 2025)

### Deployment Options

**Option 1: Supabase Dashboard (Recommended)**

1. Go to https://supabase.com/dashboard/project/qnwcwoutgarhqxlgsjzs/sql
2. Copy SQL from `supabase/migrations/` (in order)
3. Execute in SQL Editor
4. Verify: `SELECT * FROM supabase_migrations.schema_migrations;`

**Option 2: Supabase CLI**

```bash
# Login
npx supabase login

# Link to project
npx supabase link --project-ref qnwcwoutgarhqxlgsjzs

# Push migrations
npx supabase db push
```

**Option 3: Migration Scripts**

```bash
# Seed questions (after schema deployed)
npm run content:seed

# Verify
npm run content:stats
```

### Verify Schema

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

-- Check migrations applied
SELECT version, name FROM supabase_migrations.schema_migrations
ORDER BY version;
```

---

## 🔍 Post-Deployment Verification

### Smoke Tests

```bash
# Health check
curl https://your-domain.vercel.app/api/health
# Expected: {"ok":true,"status":"healthy"}

# Key routes
curl -I https://your-domain.vercel.app/
curl -I https://your-domain.vercel.app/welcome
curl -I https://your-domain.vercel.app/modules
# Expected: HTTP 200
```

### Manual Testing

- [ ] Sign up new user
- [ ] Sign in successfully
- [ ] Browse modules → content renders
- [ ] Watch video → progress tracked
- [ ] Start practice → questions load
- [ ] Submit answers → results shown
- [ ] Access admin (with admin email)
- [ ] Verify non-admin blocked from admin
- [ ] Toggle settings (Large Text, High Contrast)

### Performance Check

```bash
# Run Lighthouse
npx lighthouse https://your-domain.vercel.app \
  --output=json \
  --output-path=./reports/production-lighthouse.json

# Target Scores:
# Performance: >90
# Accessibility: 100
# Best Practices: >95
# SEO: >95
```

---

## 📡 Monitoring & Alerts

### Error Monitoring (Sentry)

1. Verify errors tracked in Sentry dashboard
2. Configure alerts:
   - Error rate > 1% per minute
   - Notify: Email, Slack

### Uptime Monitoring

1. **UptimeRobot** (or similar):
   - URL: `https://your-domain.vercel.app/api/health`
   - Type: HTTPS
   - Interval: 5 minutes

2. **Vercel Analytics**:
   - Enable Speed Insights
   - Enable Web Analytics
   - Monitor Core Web Vitals

### Logs

- **Vercel Logs**: Dashboard → Deployments → Logs
- **Supabase Logs**: Dashboard → Logs → Database queries
- **Sentry**: Real-time error tracking

---

## 🔄 Rollback Procedures

### Quick Rollback (Instant)

**Via Vercel Dashboard:**

1. Go to Deployments
2. Find last known good deployment
3. Click "..." → "Promote to Production"
4. Rollback complete (<1 minute)

**Via Vercel CLI:**

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Code Rollback (Git)

```bash
# Revert last commit
git revert HEAD

# Or reset to previous commit
git reset --hard HEAD~1

# Force push (if necessary)
git push origin main --force
# Vercel auto-deploys the rollback
```

### Database Rollback (⚠️ Caution)

1. **Assess Impact**: What data affected? User data lost?
2. **Restore from Backup**:
   - Supabase Dashboard → Database → Backups
   - Select backup point (before issue)
   - Restore to new project (safer than overwriting)
3. **Test Restored Database**: Verify data integrity
4. **Switch Connection** (if safe):
   - Update `NEXT_PUBLIC_SUPABASE_URL` in Vercel
   - Redeploy

---

## 🌐 Custom Domain (Optional)

1. **Add Domain in Vercel**:
   - Dashboard → Settings → Domains
   - Add: `tanium-tco.example.com`

2. **Configure DNS**:

   ```
   Type: CNAME
   Name: tanium-tco (or @)
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**:
   - Auto-provisioned by Vercel (Let's Encrypt)
   - Usually 5-10 minutes

4. **Set as Production Domain**:
   - Mark as production in Vercel
   - All deployments use this domain

---

## 🆘 Troubleshooting

### Build Failures

```bash
# Common issues:
# 1. TypeScript errors
npm run typecheck  # Fix before deploying

# 2. Missing dependencies
npm install

# 3. Environment variables
# Check Vercel Dashboard → Settings → Environment Variables
```

### Runtime Errors

```bash
# Check logs
vercel logs [deployment-url]

# Check Sentry dashboard
# Review error patterns, stack traces
```

### Database Connection Issues

```bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
curl https://qnwcwoutgarhqxlgsjzs.supabase.co/rest/v1/
# Should return: {"message":"..."}
```

### Performance Issues

```bash
# Run Lighthouse audit
npx lighthouse https://your-domain.vercel.app

# Check bundle size
npm run build
# Review .next/analyze/ (if ANALYZE=true)

# Enable Vercel Speed Insights
# Dashboard → Analytics → Enable
```

---

## 📚 Additional Resources

- **Full Deployment Guide**: `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` (archived)
- **Migration Documentation**:
  - `docs/MIGRATION_INVENTORY.md` - All 24 migrations
  - `docs/MIGRATION_LINEAGE.md` - Migration evolution guide
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## 📋 Deployment Checklist

**Before Deploy:**

- [ ] Code quality checks passed
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Security audit complete
- [ ] Content validated

**During Deploy:**

- [ ] Build succeeds
- [ ] Deployment completes
- [ ] Health check passes

**After Deploy:**

- [ ] Smoke tests pass
- [ ] Manual testing complete
- [ ] Performance within targets
- [ ] Monitoring active
- [ ] Team notified

**Sign-Off:**

- Technical Lead: ******\_\_\_\_******
- DevOps Lead: ******\_\_\_\_******
- Production URL: ******\_\_\_\_******

---

**Document Version:** 2.0 (Consolidated)
**Last Updated:** October 11, 2025
**Previous Versions:** See `/archive/deployment/`
