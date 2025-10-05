# spawn-deployment-team

Auto-spawn production deployment and DevOps team for enterprise-grade Vercel deployments with zero-downtime, monitoring, and rollback capabilities.

## Agent Team Composition

### Deployment (3 agents)
- **tco-deployment-manager** - Vercel production deployment orchestration
- **devops-engineer** - CI/CD pipeline configuration and automation
- **vercel-specialist** - Vercel-specific optimization and configuration

### Security & Compliance (2 agents)
- **security-engineer** - RLS audit, API security, data protection
- **compliance-auditor** - Enterprise compliance and regulatory requirements

### Monitoring (2 agents)
- **monitoring-specialist** - Sentry, PostHog, and real-time alerts
- **performance-engineer** - Production performance optimization

### Coordination (1 agent)
- **hierarchical-coordinator** - Deployment orchestration and rollback management

## Automatic Initialization

```javascript
// 1. Initialize swarm with hierarchical topology for production deployment
mcp__claude-flow__swarm_init({
  topology: "hierarchical",
  maxAgents: 8,
  strategy: "adaptive"
})

// 2. Spawn deployment team
Task("tco-deployment-manager: Orchestrate Vercel production deployment, configure environment variables, manage build process, ensure zero-downtime deployment")
Task("devops-engineer: Set up GitHub Actions CI/CD pipeline, automate testing and deployment, configure branch protection and PR validation")
Task("vercel-specialist: Optimize Vercel configuration (next.config.js), configure custom domains, set up preview deployments, manage deployment triggers")

// 3. Spawn security & compliance team
Task("security-engineer: Audit Supabase RLS policies, validate API security, configure CSP headers, enable security monitoring with Sentry")
Task("compliance-auditor: Verify enterprise compliance requirements, data protection regulations, accessibility standards, audit logging configuration")

// 4. Spawn monitoring team
Task("monitoring-specialist: Configure Sentry error tracking, PostHog analytics, real-time alerts, set up monitoring dashboards for production health")
Task("performance-engineer: Optimize production bundle size, enable caching strategies, configure CDN, ensure <3s page load times at scale")

// 5. Spawn coordination
Task("hierarchical-coordinator: Coordinate deployment pipeline, manage pre-flight checks, validate deployment success, enable instant rollback if issues detected")
```

## Use Cases

### Initial Production Deployment
```
User: "Deploy the Tanium TCO LMS to production for the first time"
Claude: *Auto-spawns full deployment team with all 8 agents*
```

### Hotfix Deployment
```
User: "Deploy critical bug fix to production immediately"
Claude: *Fast-track deployment with emphasis on security and rollback*
```

### Performance Optimization
```
User: "Optimize production performance and enable caching"
Claude: *Emphasizes performance-engineer and vercel-specialist*
```

### Security Audit
```
User: "Run full security audit before deployment"
Claude: *Focuses on security-engineer and compliance-auditor*
```

### Rollback
```
User: "Rollback to previous deployment due to production issue"
Claude: *Coordinator manages instant rollback with verification*
```

## Expected Outcomes

- **8 specialized deployment agents** with hierarchical coordination
- **Zero-downtime deployments** with health checks
- **Automated CI/CD pipeline** with GitHub Actions
- **Comprehensive security audit** pre-deployment
- **Production monitoring** with Sentry + PostHog
- **Instant rollback capability** if issues detected
- **Performance optimization** for scalability

## Deployment Workflow

**Hierarchical Coordination (Queen-led)**:
1. **Pre-Flight Checks** (Coordinator)
   - Run full test suite (unit + E2E)
   - Security audit (RLS, API, CSP)
   - Performance benchmarks
   - Accessibility validation
   - Build verification

2. **Deployment Preparation** (Deployment Team)
   - Configure environment variables
   - Optimize build configuration
   - Set up preview deployment
   - Validate DNS and domains

3. **Security & Compliance** (Security Team)
   - Audit RLS policies
   - Validate CSP headers
   - Configure Sentry monitoring
   - Enable security alerts

4. **Monitoring Setup** (Monitoring Team)
   - Configure error tracking
   - Set up analytics
   - Create alert rules
   - Prepare rollback plan

5. **Production Deployment** (Coordinator)
   - Deploy to Vercel production
   - Validate deployment health
   - Monitor initial traffic
   - Verify all services operational

6. **Post-Deployment** (All Teams)
   - Run smoke tests
   - Monitor error rates
   - Validate performance
   - Document deployment

## Deployment Checklist

### Pre-Deployment Validation
- ✅ All tests passing (unit + integration + E2E)
- ✅ TypeScript: 0 errors in strict mode
- ✅ Lighthouse score: 90+ across all categories
- ✅ Security audit: No critical issues
- ✅ WCAG 2.1 AA compliance verified
- ✅ Database migrations tested
- ✅ Environment variables configured
- ✅ Build succeeds without warnings

### Deployment Configuration
- ✅ **Vercel Project Settings**
  - Framework: Next.js 15.5.2
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`
  - Node Version: 18.x

- ✅ **Environment Variables** (Production)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `NEXT_PUBLIC_POSTHOG_KEY`
  - `NEXT_PUBLIC_POSTHOG_HOST`
  - All video manifest IDs

- ✅ **Domain Configuration**
  - Custom domain: modern-tco.vercel.app
  - SSL certificate: Auto-managed
  - DNS records validated

- ✅ **Build Optimization**
  - Bundle analysis enabled
  - Tree shaking configured
  - Image optimization enabled
  - Font optimization configured
  - Static generation for content pages

### Security Configuration
- ✅ **Content Security Policy**
  - `'unsafe-eval'` for Sentry
  - YouTube embed allowed
  - PostHog domains whitelisted
  - No inline script violations

- ✅ **Supabase Security**
  - RLS policies enabled on all tables
  - Service role key secured
  - Anonymous access restricted
  - Real-time subscriptions secured

- ✅ **Authentication**
  - JWT secret rotation enabled
  - Session timeout configured
  - Password requirements enforced
  - OAuth providers configured

### Monitoring Configuration
- ✅ **Sentry**
  - Error tracking enabled
  - Source maps uploaded
  - Release tracking configured
  - Performance monitoring active
  - Alert rules configured

- ✅ **PostHog**
  - Analytics tracking enabled
  - Feature flags configured
  - Session recording enabled
  - Funnel analysis set up
  - Dashboard created

- ✅ **Uptime Monitoring**
  - Health check endpoint: `/api/health`
  - Uptime monitor configured
  - Alert thresholds set
  - Incident response plan

### Post-Deployment Validation
- ✅ Smoke tests pass on production
- ✅ All pages load successfully
- ✅ Videos play correctly
- ✅ Authentication flows work
- ✅ Database connections active
- ✅ Analytics tracking events
- ✅ Error monitoring operational
- ✅ Performance meets targets

## CI/CD Pipeline Configuration

### GitHub Actions Workflow

```yaml
name: Production Deployment

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run type checking
        run: npm run type-check
      - name: Run linting
        run: npm run lint
      - name: Run unit tests
        run: npm run test
      - name: Run E2E tests
        run: npm run test:e2e

  security-audit:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Run security audit
        run: npm audit
      - name: Check dependencies
        run: npx depcheck

  build:
    runs-on: ubuntu-latest
    needs: [test, security-audit]
    steps:
      - name: Build application
        run: npm run build
      - name: Analyze bundle
        run: npm run analyze

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Run smoke tests
        run: npm run test:smoke
```

### Branch Protection Rules
- ✅ Require pull request reviews (1 approver minimum)
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators in restrictions
- ✅ Require linear history
- ✅ Block force pushes

## Rollback Plan

### Instant Rollback (< 2 minutes)
```bash
# 1. Identify previous deployment
vercel ls --limit 10

# 2. Promote previous deployment
vercel promote <previous-deployment-url> --scope=<team-name>

# 3. Verify rollback
curl -I https://modern-tco.vercel.app | grep "x-vercel-id"

# 4. Monitor error rates
# Check Sentry dashboard for error rate decrease
```

### Rollback Triggers (Automatic)
- Error rate > 5% (vs baseline)
- Performance degradation > 50%
- Failed health checks > 3 consecutive
- Critical security vulnerability detected
- Database connection failures
- Authentication failures > 10%

## Performance Targets

### Production Benchmarks
- **Page Load**: <3s (95th percentile)
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3.0s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **Bundle Size**: <300KB gzipped
- **API Response**: <100ms (database queries)
- **Real-time Latency**: <200ms (Supabase subscriptions)

### Scalability
- **Concurrent Users**: 100+ sustained
- **Peak Load**: 500+ users
- **Database Connections**: Pooling configured
- **CDN**: Vercel Edge Network enabled
- **Caching**: Aggressive caching strategy

## Monitoring Dashboards

### Production Health Dashboard
- **System Status**: Uptime, response times, error rates
- **User Metrics**: Active users, session duration, conversion
- **Performance**: Core Web Vitals, API latency, database queries
- **Security**: Failed auth attempts, suspicious activity
- **Business Metrics**: Course completions, exam scores, engagement

### Alert Configuration
```yaml
Critical Alerts (PagerDuty):
  - Error rate > 5%
  - API response time > 500ms
  - Database connection failures
  - Authentication system down
  - Deployment failure

Warning Alerts (Slack):
  - Error rate > 2%
  - Performance degradation > 25%
  - High memory usage > 80%
  - Unusual traffic patterns
  - Test failures in production
```

## Token Budget Allocation

- Deployment: 40% (3 agents)
- Security & Compliance: 25% (2 agents)
- Monitoring: 25% (2 agents)
- Coordination: 10% (1 agent)

Total: 8 agents optimized for production deployment

## Performance Metrics

Each agent tracks:
- Deployment success rate
- Deployment duration
- Zero-downtime achievement
- Security audit score
- Performance improvement
- Error rate reduction
- Rollback response time

## Success Criteria

### Deployment Success
- ✅ Zero-downtime achieved
- ✅ All health checks passing
- ✅ Error rate < 0.1%
- ✅ Performance targets met
- ✅ Security audit passed
- ✅ Monitoring active
- ✅ Rollback plan validated

### Production Stability
- ✅ 99.9% uptime (monthly)
- ✅ <1% error rate
- ✅ <3s average page load
- ✅ Zero security incidents
- ✅ Zero data loss events
- ✅ 100% WCAG 2.1 AA compliance
