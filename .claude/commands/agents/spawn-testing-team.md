# spawn-testing-team

Auto-spawn comprehensive testing and quality assurance team for enterprise-grade LMS validation with automated test generation and E2E coverage.

## Agent Team Composition

### Test Creation (3 agents)
- **test-automator** - Automated test suite generation (Vitest/Jest)
- **e2e-specialist** - End-to-end testing with Playwright
- **performance-tester** - Load testing and performance benchmarks

### Quality Assurance (3 agents)
- **tco-validation-expert** - Enterprise LMS compliance and certification alignment
- **accessibility-tester** - WCAG 2.1 AA automated and manual testing
- **security-tester** - Security audit, RLS validation, and penetration testing

### Analysis (2 agents)
- **qa-analyst** - Test coverage analysis and quality metrics
- **regression-tester** - Regression testing and change impact analysis

### Coordination (1 agent)
- **hierarchical-coordinator** - Test orchestration and result aggregation

## Automatic Initialization

```javascript
// 1. Initialize swarm with hierarchical topology for comprehensive testing
mcp__claude-flow__swarm_init({
  topology: "hierarchical",
  maxAgents: 9,
  strategy: "adaptive"
})

// 2. Spawn test creation team
Task("test-automator: Generate comprehensive Vitest unit tests for all 11+ React contexts, components, and hooks with 90%+ coverage")
Task("e2e-specialist: Create Playwright E2E tests for complete student journey: video viewing → practice → mock exam → analytics")
Task("performance-tester: Run Lighthouse audits, load testing with 40+ concurrent users, measure <3s page load times")

// 3. Spawn quality assurance team
Task("tco-validation-expert: Validate all features against enterprise LMS requirements, certification compliance, and Tanium TCO standards")
Task("accessibility-tester: Run automated WCAG 2.1 AA tests with axe-core, manual keyboard navigation, screen reader testing")
Task("security-tester: Audit Supabase RLS policies, test authentication flows, validate data encryption and API security")

// 4. Spawn analysis team
Task("qa-analyst: Analyze test coverage reports, identify gaps, generate quality metrics dashboard, track testing velocity")
Task("regression-tester: Run regression test suite on all previous features, detect breaking changes, validate backwards compatibility")

// 5. Spawn coordination
Task("hierarchical-coordinator: Orchestrate all testing agents, aggregate results, generate comprehensive test report, ensure 95%+ quality threshold")
```

## Use Cases

### Pre-Production Validation
```
User: "Run full testing suite before production deployment"
Claude: *Auto-spawns complete testing team with all 9 agents*
```

### Feature Testing
```
User: "Test the new adaptive quiz feature end-to-end"
Claude: *Emphasizes e2e-specialist and tco-validation-expert*
```

### Security Audit
```
User: "Perform security audit on Supabase RLS policies and authentication"
Claude: *Focuses on security-tester with qa-analyst support*
```

### Performance Benchmarking
```
User: "Benchmark app performance with 50 concurrent users"
Claude: *Emphasizes performance-tester with load testing scenarios*
```

### Accessibility Compliance
```
User: "Verify WCAG 2.1 AA compliance across all pages"
Claude: *Focuses on accessibility-tester with comprehensive audits*
```

## Expected Outcomes

- **9 specialized testing agents** with hierarchical coordination
- **90%+ test coverage** for unit and integration tests
- **Complete E2E test suite** covering student journey
- **100% WCAG 2.1 AA compliance** validation
- **Security audit report** with RLS and auth validation
- **Performance benchmarks** with load testing results
- **Comprehensive quality report** with metrics dashboard

## Testing Workflow

**Hierarchical Coordination (Queen-led)**:
1. Coordinator creates comprehensive test plan
2. test-automator generates unit/integration tests in parallel
3. e2e-specialist creates Playwright E2E test scenarios
4. performance-tester runs Lighthouse and load tests
5. QA team validates compliance, accessibility, and security
6. Analysis team reviews coverage and identifies gaps
7. Coordinator aggregates results and generates final report

## Test Coverage Requirements

### Unit Testing (Vitest/Jest)
- ✅ 90%+ code coverage for all components
- ✅ 100% coverage for critical paths (auth, assessment, scoring)
- ✅ All 11+ React contexts tested
- ✅ Custom hooks tested with react-testing-library
- ✅ Utility functions and algorithms validated
- ✅ Mocked Supabase and external dependencies

### Integration Testing
- ✅ API route testing with Next.js test environment
- ✅ Supabase database operations validated
- ✅ Context provider integration tests
- ✅ State management workflows tested
- ✅ Real-time subscription testing

### E2E Testing (Playwright)
**Complete Student Journey**:
1. ✅ User registration and authentication
2. ✅ Video module navigation and playback
3. ✅ Practice session configuration and execution
4. ✅ Mock exam with 105 questions and timer
5. ✅ Review center with incorrect answers
6. ✅ Analytics dashboard with metrics
7. ✅ Progress tracking and persistence
8. ✅ Multi-device testing (desktop, tablet, mobile)

### Performance Testing
- ✅ Lighthouse score: 90+ Performance, 100 Accessibility, 100 Best Practices, 100 SEO
- ✅ First Contentful Paint: <1.5s
- ✅ Largest Contentful Paint: <2.5s
- ✅ Time to Interactive: <3.0s
- ✅ Cumulative Layout Shift: <0.1
- ✅ Load testing: 40+ concurrent users sustained
- ✅ Bundle size: <300KB gzipped

### Accessibility Testing
- ✅ WCAG 2.1 AA automated tests (axe-core)
- ✅ Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- ✅ Screen reader testing (NVDA, JAWS, VoiceOver)
- ✅ Color contrast ratios (4.5:1 minimum)
- ✅ Focus management and visible focus indicators
- ✅ Semantic HTML and ARIA labels
- ✅ Form validation and error messages
- ✅ Skip links and landmark regions

### Security Testing
- ✅ Supabase RLS policies validated for all tables
- ✅ Authentication flows tested (signup, login, logout, password reset)
- ✅ Authorization tested (role-based access control)
- ✅ SQL injection prevention validated
- ✅ XSS protection verified
- ✅ CSRF token validation
- ✅ API endpoint security audit
- ✅ Environment variable security
- ✅ Data encryption at rest and in transit

## Quality Metrics Dashboard

### Code Quality
- Test coverage percentage
- Critical path coverage
- Code complexity metrics
- Type safety compliance (0 TypeScript errors)

### Performance
- Lighthouse scores (4 categories)
- Core Web Vitals (3 metrics)
- Bundle size and optimization
- Load testing results

### Accessibility
- WCAG 2.1 compliance rate
- Automated test pass rate
- Manual audit findings
- Device/browser compatibility

### Security
- RLS policy coverage
- Authentication test pass rate
- Vulnerability scan results
- Security audit score

## Test Automation

### CI/CD Integration
```yaml
# Automated testing pipeline
pre-commit:
  - Unit tests (fast subset)
  - TypeScript type checking
  - Linting and formatting

pre-push:
  - Full unit test suite
  - Integration tests
  - Build verification

PR validation:
  - Unit + integration tests
  - E2E critical path tests
  - Accessibility automated tests
  - Security scan

Pre-production:
  - Full E2E test suite
  - Performance benchmarks
  - Security audit
  - Manual accessibility review
```

## Token Budget Allocation

- Test Creation: 35% (3 agents)
- Quality Assurance: 35% (3 agents)
- Analysis: 20% (2 agents)
- Coordination: 10% (1 agent)

Total: 9 agents optimized for comprehensive testing

## Performance Metrics

Each agent tracks:
- Test execution time
- Test pass/fail rates
- Coverage improvements
- Bug detection rate
- False positive rate
- Testing velocity (tests written per hour)

## Integration with LMS

All testing agents integrate with:
- **Vitest** for unit/integration tests
- **Playwright** for E2E browser automation
- **Lighthouse** for performance audits
- **axe-core** for accessibility testing
- **Supabase** for database testing
- **PostHog** for analytics validation

## Test Report Format

```markdown
# Comprehensive Test Report
Generated: [timestamp]

## Executive Summary
- ✅ Total Tests: [number] (Pass: X, Fail: Y)
- ✅ Coverage: [percentage]%
- ✅ Performance Score: [score]/100
- ✅ Accessibility: WCAG 2.1 AA [compliant/non-compliant]
- ✅ Security: [critical/high/medium/low issues found]

## Unit Tests
[Coverage report with component-level breakdown]

## Integration Tests
[API and context integration results]

## E2E Tests
[Student journey test scenarios and results]

## Performance
[Lighthouse scores and Core Web Vitals]

## Accessibility
[WCAG compliance report with findings]

## Security
[RLS audit and vulnerability scan results]

## Recommendations
[Prioritized list of issues and improvements]
```
