# Pre-Launch Checklist - Tanium TCO LMS

**Project**: Modern Tanium TCO Learning Management System
**Target Launch Date**: TBD
**Last Updated**: October 1, 2025

---

## 🚨 HIGH PRIORITY ITEMS (CRITICAL - MUST COMPLETE)

### 1. Error Tracking & Monitoring ✅ IN PROGRESS

#### Sentry Configuration
- [x] Install Sentry packages (`@sentry/nextjs`, `@sentry/cli`)
- [x] Create `sentry.client.config.ts`
- [x] Create `sentry.server.config.ts`
- [x] Create `sentry.edge.config.ts`
- [ ] **Create Sentry account** at https://sentry.io
- [ ] **Get Sentry DSN** from project settings
- [ ] **Add to environment variables**:
  ```bash
  NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-project-id
  ```
- [ ] **Configure in Vercel** (Settings → Environment Variables)
- [ ] **Test error tracking** with intentional error
- [ ] **Verify error appears** in Sentry dashboard
- [ ] **Configure alerting** for critical errors
- [ ] **Set up email notifications** for production errors

#### Uptime Monitoring
- [ ] **Sign up for UptimeRobot** (free tier: https://uptimerobot.com)
- [ ] **Add monitor for production URL**
- [ ] **Set check interval**: 5 minutes
- [ ] **Configure alert contacts**:
  - Email: [team email]
  - SMS: [optional, for critical alerts]
- [ ] **Set up status page** (public or private)
- [ ] **Test alert system** (simulate downtime)
- [ ] **Verify all team members receive alerts**

#### Alternative: Vercel Monitoring
- [ ] **Enable Vercel Speed Insights** (built-in)
- [ ] **Enable Vercel Web Analytics** (built-in)
- [ ] **Configure Vercel Integrations**:
  - Sentry integration (connects automatically)
  - PostHog integration (if available)

---

### 2. Security Hardening ✅ PARTIALLY COMPLETE

#### Security Headers
- [x] **CSP (Content Security Policy)** configured in `next.config.js`
- [x] **HSTS (HTTP Strict Transport Security)** added (production only)
- [x] **X-Frame-Options** set to SAMEORIGIN
- [x] **X-Content-Type-Options** set to nosniff
- [x] **Referrer-Policy** configured
- [x] **Permissions-Policy** restricts geolocation, mic, camera

#### Security Audit Tasks
- [ ] **Review all API endpoints** for authentication
- [ ] **Audit admin routes** (verify NEXT_PUBLIC_ADMIN_EMAILS works)
- [ ] **Test RLS policies** in Supabase (Row Level Security)
- [ ] **Verify service role key** never exposed to client
- [ ] **Check for exposed secrets** in git history
- [ ] **Scan dependencies** for vulnerabilities:
  ```bash
  npm audit
  npm audit fix
  ```
- [ ] **Test authentication flows**:
  - Sign up with invalid data
  - Sign in with wrong credentials
  - Session expiration handling
  - Password reset (if implemented)
- [ ] **Test authorization**:
  - Access admin routes without permission
  - Access team data from different user
  - Attempt SQL injection in search/filters

#### Penetration Testing
- [ ] **Run OWASP ZAP** scan (free tool)
- [ ] **Test with Burp Suite Community** (free tier)
- [ ] **Manual security testing**:
  - XSS attempts in forms
  - CSRF protection verification
  - Session fixation tests
  - Clickjacking attempts
- [ ] **Third-party security audit** (if budget allows)

---

### 3. Testing Coverage 🟡 NEEDS EXPANSION

#### Current Status
- ✅ 11 test suites passing (30 tests)
- ✅ Jest configured for unit tests
- ✅ Vitest configured for component tests
- ✅ Playwright configured for E2E tests
- ⚠️ Coverage estimated at 40-50% (needs expansion)

#### Unit Tests (Target: 80%+ coverage)
- [ ] **Test all React contexts**:
  - [ ] AuthContext (sign in, sign out, session persistence)
  - [ ] ExamContext (score calculation, timer logic)
  - [ ] ProgressContext (progress updates, domain tracking)
  - [ ] QuestionsContext (question filtering, random selection)
  - [ ] IncorrectAnswersContext (mistake tracking, review queue)
- [ ] **Test utility functions**:
  - [ ] Question weighting algorithm
  - [ ] Score calculation (weighted domains)
  - [ ] Spaced repetition algorithm
  - [ ] Date/time utilities
- [ ] **Test API routes**:
  - [ ] /api/health (should return 200)
  - [ ] /api/sim-meta (metadata format)
  - [ ] /api/study/content (parameter validation)
- [ ] **Run coverage report**:
  ```bash
  npm run test:coverage
  ```
- [ ] **Verify coverage > 80%**

#### E2E Tests (Critical User Flows)
- [ ] **Authentication flow**:
  - [ ] Sign up → verify email → sign in
  - [ ] Sign in → dashboard → sign out
  - [ ] Invalid credentials → error message
- [ ] **Learning flow**:
  - [ ] Browse modules → select module → read content
  - [ ] Watch video → track progress → return to module
  - [ ] Complete learning section → progress updates
- [ ] **Assessment flow**:
  - [ ] Start practice → answer questions → submit
  - [ ] View results → domain breakdown → review
  - [ ] Start mock exam → 105min timer → submit
  - [ ] Score calculation → recommendations displayed
- [ ] **Review flow**:
  - [ ] Make mistakes → review page populates
  - [ ] Filter by domain → questions filtered
  - [ ] Retry questions → track improvement
- [ ] **Team management**:
  - [ ] Invite team member → verify email sent
  - [ ] Activate seat → user can access
  - [ ] Revoke seat → user loses access
- [ ] **Settings**:
  - [ ] Toggle Large Text → UI updates
  - [ ] Toggle High Contrast → theme changes
  - [ ] Change theme → persists across sessions

#### Load Testing
- [ ] **Set up k6 or Artillery** (load testing tool)
- [ ] **Test scenarios**:
  - 10 concurrent users browsing
  - 50 concurrent users taking practice exams
  - 100 concurrent users watching videos
- [ ] **Target metrics**:
  - Average response time < 500ms
  - P95 response time < 2s
  - Error rate < 0.1%
- [ ] **Database connection pooling** verified
- [ ] **Identify bottlenecks** and optimize

---

### 4. Content Validation 📝 NEEDS EXPERT REVIEW

#### Question Bank Audit (140+ questions)
- [ ] **Assign Tanium expert reviewer** (name: _____________)
- [ ] **Review criteria for each question**:
  - Factual accuracy (matches official Tanium docs)
  - Certification blueprint alignment
  - Appropriate difficulty level
  - No ambiguous wording
  - Correct answer verified
  - Explanations are helpful
- [ ] **Review by domain**:
  - [ ] Foundation Module (30 questions)
  - [ ] Domain 1: Asking Questions (25 questions)
  - [ ] Domain 2: Refining Questions (25 questions)
  - [ ] Domain 3: Taking Action (20 questions)
  - [ ] Domain 4: Navigation (25 questions)
  - [ ] Domain 5: Reporting (15 questions)
- [ ] **Document review process**: `docs/QUESTION_REVIEW_LOG.md`
- [ ] **Track corrections** made
- [ ] **Final approval** by Tanium SME (Subject Matter Expert)

#### Learning Modules Content Review (11.6 hours)
- [ ] **Module 00: Tanium Platform Foundation**
  - [ ] Technical accuracy verified
  - [ ] Screenshots/images current
  - [ ] Links functional
  - [ ] Duration estimate accurate
- [ ] **Module 01: Asking Questions**
  - [ ] Sensor examples correct
  - [ ] Natural language syntax accurate
  - [ ] Best practices current
- [ ] **Module 02: Refining Questions & Targeting**
  - [ ] Computer groups syntax correct
  - [ ] Filter examples work
  - [ ] RBAC information accurate
- [ ] **Module 03: Taking Action**
  - [ ] Package examples appropriate
  - [ ] Exit codes correct
  - [ ] Security warnings appropriate
- [ ] **Module 04: Navigation & Basic Module Functions**
  - [ ] Console navigation accurate
  - [ ] Module descriptions current
  - [ ] Integration points correct
- [ ] **Module 05: Report Generation & Data Export**
  - [ ] Export formats correct
  - [ ] Scheduling options accurate
  - [ ] API examples work

#### Video Content
- [ ] **Upload all videos** to hosting platform
- [ ] **Verify YouTube integration** working
- [ ] **Test video playback** on all devices
- [ ] **Verify progress tracking** (25%, 50%, 75%, 100%)
- [ ] **Add captions/subtitles** for accessibility
- [ ] **Optimize video quality** vs. bandwidth

---

## 🔶 MEDIUM PRIORITY ITEMS (IMPORTANT - COMPLETE BEFORE LAUNCH)

### 5. Production Environment Setup

#### Vercel Configuration
- [ ] **Create Vercel project** (or connect existing)
- [ ] **Configure environment variables**:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com
  NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
  NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/project
  STRIPE_SECRET_KEY=sk_live_your_key (if using Stripe)
  STRIPE_PRICE_PRO=price_xxx
  STRIPE_PRICE_TEAM=price_xxx
  ```
- [ ] **Configure custom domain** (if applicable)
- [ ] **Set up SSL certificate** (Vercel automatic)
- [ ] **Configure caching strategy**
- [ ] **Enable Edge Functions** (if needed)
- [ ] **Test production build locally**:
  ```bash
  npm run build
  npm run start
  ```

#### Supabase Production Setup
- [ ] **Review database schema** in production
- [ ] **Verify RLS policies** active
- [ ] **Set up database backups**:
  - Automatic daily backups enabled
  - Backup retention period configured
- [ ] **Configure connection pooling** (Supabase Pooler)
- [ ] **Set up database indexes** for performance
- [ ] **Test database migrations** process
- [ ] **Document rollback procedure**

#### DNS & Domain
- [ ] **Purchase/configure domain** (if not using Vercel subdomain)
- [ ] **Set up DNS records** (A/CNAME)
- [ ] **Configure redirects** (www → non-www or vice versa)
- [ ] **Enable DNSSEC** (if supported)

---

### 6. Analytics & Tracking

#### PostHog Configuration
- [ ] **Verify PostHog key** in environment
- [ ] **Test event tracking**:
  - Pageview events
  - Practice session start/end
  - Mock exam completion
  - Video play/pause/progress
  - Note creation/review
- [ ] **Create custom dashboards**:
  - User engagement metrics
  - Learning progress analytics
  - Assessment performance trends
- [ ] **Set up funnels**:
  - Sign up → first module → first practice
  - Practice → review → improved score
- [ ] **Configure session recordings** (optional, privacy considerations)
- [ ] **Set up retention analysis**

---

### 7. Performance Optimization

#### Lighthouse Audit
- [ ] **Run Lighthouse on all major routes**:
  ```bash
  npm run lighthouse:all
  ```
- [ ] **Target scores**:
  - Performance: > 90
  - Accessibility: 100
  - Best Practices: > 95
  - SEO: > 95
- [ ] **Address issues** found in audit
- [ ] **Re-run and verify improvements**

#### Performance Targets
- [ ] **First Contentful Paint** < 1.8s
- [ ] **Largest Contentful Paint** < 2.5s
- [ ] **Cumulative Layout Shift** < 0.1
- [ ] **Time to Interactive** < 3.8s
- [ ] **Total Blocking Time** < 300ms

#### Optimizations
- [ ] **Image optimization** with next/image
- [ ] **Font loading** strategy optimized
- [ ] **Code splitting** verified
- [ ] **Lazy loading** for heavy components
- [ ] **Service Worker** (optional, for offline support)
- [ ] **CDN configuration** (Vercel Edge Network)

---

### 8. Documentation & Operations

#### Production Runbook
- [ ] **Create** `docs/OPS/RUNBOOK.md` (already exists - review)
- [ ] **Document common issues** and solutions
- [ ] **Database connection troubleshooting**
- [ ] **Deployment rollback procedure**
- [ ] **Emergency contact list**
- [ ] **Incident response plan**

#### Disaster Recovery
- [ ] **Database backup verification** (test restore)
- [ ] **Code repository backup** (GitHub should be source of truth)
- [ ] **Environment variable backup** (secure location)
- [ ] **Document recovery time objective** (RTO: target restoration time)
- [ ] **Document recovery point objective** (RPO: acceptable data loss)
- [ ] **Test disaster recovery** scenario

#### User Documentation
- [ ] **Create user guide** (getting started)
- [ ] **FAQ page** with common questions
- [ ] **Video tutorials** (optional but helpful)
- [ ] **Accessibility guide** (how to use Large Text, High Contrast)
- [ ] **Contact/support** information

---

## 🟢 NICE TO HAVE (OPTIONAL - CAN BE POST-LAUNCH)

### 9. Advanced Features

- [ ] **Mobile app** (React Native)
- [ ] **Push notifications** for study reminders
- [ ] **Email notifications** for team invites, progress milestones
- [ ] **Social features** (study groups, forums)
- [ ] **Leaderboards** (optional, for gamification)
- [ ] **Certificate generation** on exam pass
- [ ] **Integration with Tanium Community** (if available)

### 10. Marketing & Launch

- [ ] **Create landing page** (marketing site)
- [ ] **Press release** (if applicable)
- [ ] **Social media** announcements
- [ ] **Email campaign** to potential users
- [ ] **Beta testing program** (soft launch)
- [ ] **Collect testimonials** from beta users
- [ ] **SEO optimization** (keywords, meta tags)
- [ ] **Analytics tracking** for marketing campaigns

---

## 📊 Success Metrics (Post-Launch)

### Week 1 Metrics
- [ ] **Monitor error rate** (target: < 0.1%)
- [ ] **Track uptime** (target: 99.9%)
- [ ] **User sign-ups** (track count)
- [ ] **Module completions** (engagement metric)
- [ ] **Mock exam attempts** (usage metric)
- [ ] **Average session duration** (engagement metric)

### Month 1 Metrics
- [ ] **User retention** (30-day: target > 50%)
- [ ] **Exam pass rate** (target: > 85%)
- [ ] **User satisfaction** (survey: target NPS > 50)
- [ ] **Support tickets** (track volume and resolution time)
- [ ] **Performance metrics** (maintain targets)

---

## ✅ FINAL GO/NO-GO CHECKLIST

### Critical Path (Must All Be YES)
- [ ] **Sentry configured** and tested
- [ ] **Uptime monitoring** active
- [ ] **Security audit** completed (no critical issues)
- [ ] **Test coverage** > 80%
- [ ] **E2E tests** passing for critical flows
- [ ] **Content reviewed** by Tanium expert
- [ ] **Production environment** configured and tested
- [ ] **Backups** verified (database, code, env vars)
- [ ] **Performance targets** met (Lighthouse > 90)
- [ ] **Team trained** on monitoring and incident response

### Final Approval
- [ ] **Technical lead approval**: __________________ (Name, Date)
- [ ] **Content expert approval**: __________________ (Name, Date)
- [ ] **Security review approval**: __________________ (Name, Date)
- [ ] **Stakeholder sign-off**: __________________ (Name, Date)

---

## 🚀 LAUNCH SEQUENCE

### T-7 Days (1 Week Before Launch)
1. Complete all HIGH priority items
2. Run full test suite (unit + E2E + load)
3. Deploy to staging environment
4. Perform final security audit
5. Content freeze (no more changes)

### T-3 Days (3 Days Before Launch)
1. Final production deployment (staging → production)
2. Smoke test all critical features
3. Verify monitoring and alerting working
4. Brief team on launch plan and incident response

### T-1 Day (Day Before Launch)
1. Final go/no-go decision
2. Notify all stakeholders
3. Prepare rollback plan (just in case)
4. Ensure team availability for launch day

### T-0 (Launch Day)
1. **Early morning**: Deploy to production
2. **Morning**: Monitor errors, uptime, performance
3. **Afternoon**: Address any immediate issues
4. **Evening**: Review metrics, collect feedback
5. **Announce publicly** (after confirming stability)

### T+1 (Day After Launch)
1. Review overnight metrics
2. Address any overnight issues
3. Collect user feedback
4. Plan hot-fixes if needed

---

## 📞 Emergency Contacts

**Technical Lead**: [Name, Email, Phone]
**DevOps**: [Name, Email, Phone]
**Database Admin**: [Name, Email, Phone]
**Content Expert**: [Name, Email, Phone]
**Escalation Path**: [Manager Name, Contact]

---

**Last Updated**: October 1, 2025
**Next Review**: [Set date for pre-launch review]
**Status**: 🟡 IN PROGRESS - HIGH PRIORITY ITEMS UNDERWAY
