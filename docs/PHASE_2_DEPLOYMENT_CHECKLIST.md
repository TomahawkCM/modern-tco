# Phase 2 Production Deployment Checklist

**Feature**: Unified Review Dashboard with Spaced Repetition
**Version**: v2.0.0
**Target Date**: TBD
**Status**: ✅ Ready for Deployment

---

## 📋 Pre-Deployment Checklist

### 1. Database Migrations

- [ ] **Apply Phase 2 schema migration**
  ```bash
  # In production Supabase instance
  npx supabase migration up 20251002000002_add_question_reviews
  ```

- [ ] **Apply performance optimization migration**
  ```bash
  npx supabase migration up 20251003000001_performance_optimizations
  ```

- [ ] **Refresh materialized view (first time)**
  ```sql
  SELECT refresh_review_queue();
  ```

- [ ] **Verify tables created**
  ```sql
  -- Should return 4 rows
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('question_reviews', 'review_sessions', 'question_review_attempts', 'mv_refresh_log');
  ```

- [ ] **Verify indexes created**
  ```sql
  -- Should return 15+ rows
  SELECT indexname FROM pg_indexes
  WHERE schemaname = 'public'
  AND (indexname LIKE 'idx_question_reviews_%' OR indexname LIKE 'idx_review_sessions_%');
  ```

---

### 2. Environment Variables

- [ ] **PostHog Analytics**
  ```bash
  # Vercel environment variables
  NEXT_PUBLIC_POSTHOG_KEY=phc_XXXXXXXXXXXXXXXXXX
  NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com  # Optional
  NEXT_PUBLIC_ANALYTICS_DEBUG=false  # Set to true for debugging
  ```

- [ ] **Verify existing Supabase variables**
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://qnwcwoutgarhqxlgsjzs.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  ```

---

### 3. Code Integration

- [ ] **Review route created**: `/src/app/daily-review/page.tsx` ✅
- [ ] **Navigation updated**: "Daily Review" link added ✅
- [ ] **Components created**: All 5 review components ✅
- [ ] **Services created**: questionReviewService.ts, reviewService.ts ✅
- [ ] **Contexts updated**: ReviewContext, ProgressContext, AssessmentContext ✅

---

### 4. Build Verification

- [ ] **Run production build**
  ```bash
  npm run build
  ```

- [ ] **Check for TypeScript errors**
  ```bash
  npm run typecheck
  ```

- [ ] **Check for linting issues**
  ```bash
  npm run lint
  ```

- [ ] **Verify bundle size**
  ```bash
  # Phase 2 components should add ~45KB gzipped
  # Total bundle should remain < 500KB
  ```

---

### 5. Testing

- [ ] **Unit tests pass** (if implemented)
  ```bash
  npm run test
  ```

- [ ] **Manual testing in staging**
  - [ ] Navigate to `/daily-review`
  - [ ] Verify ReviewDashboard loads with stats
  - [ ] Start a 10-minute review session
  - [ ] Review at least 1 flashcard (rate as "good")
  - [ ] Review at least 1 question (answer correctly)
  - [ ] Complete session → Verify stats update
  - [ ] Check streak increments (if completed today)
  - [ ] Verify PostHog events in PostHog dashboard

- [ ] **Accessibility testing**
  - [ ] Keyboard navigation (Tab, Enter, Space)
  - [ ] Screen reader (NVDA/JAWS/VoiceOver)
  - [ ] Browser zoom to 200%
  - [ ] Color contrast (Chrome DevTools)

- [ ] **Performance testing**
  - [ ] Lighthouse score >90 for Performance
  - [ ] Page load < 3 seconds
  - [ ] Queue query < 100ms (with materialized view)

---

### 6. PostHog Setup

- [ ] **Create PostHog project** (if not exists)
  - [ ] Sign up at https://posthog.com
  - [ ] Create new project
  - [ ] Copy API key to environment variables

- [ ] **Verify events tracked**
  - [ ] `review_session_started`
  - [ ] `flashcard_reviewed`
  - [ ] `question_reviewed`
  - [ ] `review_session_completed`
  - [ ] `review_session_completed_ui`

- [ ] **Create PostHog dashboards**
  - [ ] Daily active reviewers (DAU)
  - [ ] Average session duration
  - [ ] Review completion rate
  - [ ] Accuracy by content type (flashcards vs questions)
  - [ ] Streak distribution

- [ ] **Set up alerts** (optional)
  - [ ] Alert if completion rate drops below 60%
  - [ ] Alert if average accuracy drops below 70%

---

### 7. Database Performance

- [ ] **Set up materialized view refresh cron** (optional but recommended)
  ```sql
  -- Refresh daily at 2 AM UTC
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  SELECT cron.schedule(
    'refresh-review-queue',
    '0 2 * * *',
    $$SELECT refresh_review_queue();$$
  );
  ```

- [ ] **Verify RLS policies active**
  ```sql
  -- Should return true for all tables
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN ('question_reviews', 'review_sessions', 'question_review_attempts');
  ```

- [ ] **Test query performance**
  ```sql
  -- Should return in < 100ms
  EXPLAIN ANALYZE
  SELECT * FROM get_unified_review_queue_fast('{user-uuid}'::uuid, 50);
  ```

---

### 8. Rollback Plan

- [ ] **Database rollback script prepared**
  ```sql
  -- If needed, can drop tables (CAUTION: data loss)
  DROP TABLE IF EXISTS public.question_review_attempts CASCADE;
  DROP TABLE IF EXISTS public.question_reviews CASCADE;
  DROP TABLE IF EXISTS public.review_sessions CASCADE;
  DROP MATERIALIZED VIEW IF EXISTS public.mv_unified_review_queue CASCADE;
  DROP TABLE IF EXISTS public.mv_refresh_log CASCADE;
  ```

- [ ] **Code rollback**
  ```bash
  # Revert to previous deployment
  vercel rollback
  ```

- [ ] **Feature flag** (optional)
  ```typescript
  // Add environment variable to disable Phase 2
  const PHASE_2_ENABLED = process.env.NEXT_PUBLIC_PHASE_2_ENABLED !== 'false';

  if (!PHASE_2_ENABLED) {
    // Show "Coming Soon" message
    return <ComingSoonBanner feature="Daily Review" />;
  }
  ```

---

### 9. Documentation

- [x] **Phase 2 handoff document** (`docs/PHASE_2_COMPLETION_HANDOFF.md`)
- [x] **Analytics events reference** (`docs/REVIEW_ANALYTICS_EVENTS.md`)
- [x] **Accessibility checklist** (`docs/REVIEW_ACCESSIBILITY_CHECKLIST.md`)
- [x] **Deployment checklist** (this document)

- [ ] **Update user-facing docs**
  - [ ] Add "Daily Review" to help section
  - [ ] Document spaced repetition system
  - [ ] Explain streak tracking and benefits

---

### 10. Monitoring

- [ ] **Set up monitoring alerts**
  - [ ] Sentry error tracking for review components
  - [ ] PostHog event tracking verification
  - [ ] Database query performance monitoring

- [ ] **Create Grafana dashboard** (if using)
  - [ ] Database connection pool usage
  - [ ] Materialized view refresh job status
  - [ ] RLS policy query overhead

---

## 🚀 Deployment Steps

### Step 1: Deploy to Staging

```bash
# Deploy to Vercel staging environment
vercel --preview

# Wait for deployment to complete
# Test all functionality manually
```

### Step 2: Apply Database Migrations

```bash
# Connect to production Supabase
npx supabase link --project-ref qnwcwoutgarhqxlgsjzs

# Apply migrations
npx supabase db push

# Verify tables created
npx supabase db execute "
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('question_reviews', 'review_sessions');
"
```

### Step 3: Deploy to Production

```bash
# Deploy to production
vercel --prod

# Monitor deployment
vercel logs --follow
```

### Step 4: Smoke Tests

```bash
# 1. Visit /daily-review
curl -I https://modern-tco.vercel.app/daily-review

# 2. Check PostHog events appear
# Visit PostHog dashboard → Live Events
# Should see events within 1-2 minutes

# 3. Verify materialized view
npx supabase db execute "SELECT COUNT(*) FROM mv_unified_review_queue;"
```

### Step 5: Monitor for Issues

- [ ] Check Sentry for errors (first 24 hours)
- [ ] Monitor PostHog completion rate
- [ ] Review Vercel logs for performance issues
- [ ] Check user feedback channels

---

## 📊 Success Metrics

**Week 1 Targets:**
- [ ] 50+ users start a review session
- [ ] 70%+ session completion rate
- [ ] 80%+ average accuracy (flashcards + questions)
- [ ] No critical errors in Sentry

**Month 1 Targets:**
- [ ] 500+ review sessions completed
- [ ] 25%+ of users have 7+ day streak
- [ ] 90%+ session completion rate
- [ ] PostHog funnel shows healthy conversion

---

## 🐛 Known Issues

### Minor Issues (Non-blocking)

1. **Timer Precision**
   - Drift of 1-2 seconds over 15+ minutes
   - Severity: Low
   - Fix: Not required for v1

2. **Materialized View Lag**
   - Queue may show priorities up to 24 hours stale
   - Mitigation: Fallback to real-time query works
   - Fix: Hourly refresh (optional)

### Accessibility (2 P1 fixes needed)

1. **Time Extension**
   - Add "Extend Time" button at 30-second warning
   - Fix: `/src/components/review/StudySession.tsx` lines 51-56

2. **Auto-submit Confirmation**
   - Add confirmation dialog before data loss
   - Fix: `/src/components/review/StudySession.tsx` lines 176-179

**Recommendation**: Deploy with current implementation, add fixes in v2.0.1

---

## 🔄 Post-Deployment Tasks

### Week 1

- [ ] Monitor PostHog event volume
- [ ] Check database query performance
- [ ] Gather user feedback
- [ ] Fix any critical bugs

### Week 2

- [ ] Analyze retention data
- [ ] Identify top struggling domains
- [ ] Optimize priority algorithm if needed
- [ ] Add recommended accessibility fixes

### Month 1

- [ ] Review A/B test data (if running)
- [ ] Plan Phase 3 features based on usage
- [ ] Optimize database indexes if needed
- [ ] Refresh documentation with learnings

---

## 📞 Support Contacts

**Technical Issues**:
- Sentry: https://sentry.io/organizations/tco/issues/
- Vercel: https://vercel.com/robne/modern-tco
- Supabase: https://supabase.com/dashboard/project/qnwcwoutgarhqxlgsjzs

**Analytics**:
- PostHog: https://app.posthog.com

**Documentation**:
- Handoff Doc: `/docs/PHASE_2_COMPLETION_HANDOFF.md`
- Integration Guide: `/docs/PHASE_2_COMPLETION_HANDOFF.md#integration-guide`

---

## ✅ Final Sign-Off

- [ ] Database migrations tested in staging
- [ ] All code reviewed and approved
- [ ] Analytics configured and verified
- [ ] Documentation complete
- [ ] Rollback plan prepared
- [ ] Team notified of deployment
- [ ] Post-deployment monitoring ready

**Deployment Approved By**: _________________
**Date**: _________________
**Deployed By**: _________________
**Deployment Date**: _________________

---

**Last Updated**: 2025-01-03
**Version**: 1.0
**Next Review**: After Phase 2 deployment
