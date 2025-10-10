# TANIUM TCO LMS CONSTITUTIONAL RULES v1.0

**Vibe Check MCP Server - Metacognitive Guardrails**

Generated: 2025-10-08
Project: Modern Tanium TCO Learning Management System
Purpose: Prevent over-engineering, maintain production focus, ensure quality

---

## 🎯 PROJECT PHASE: PRODUCTION PREPARATION

**Status**: Learning science implementation COMPLETE (32/32 hours)
**Priority**: Content population, integration testing, deployment
**Production Ready**: NO - additional work required
**Rule**: NO new learning science features without explicit approval

---

## 🚫 PREVENT OVER-ENGINEERING

1. **STOP** before creating new architectural patterns - 11+ contexts already exist
2. **QUESTION** any new state management - use existing contexts first
3. **CHALLENGE** new dependencies - 209KB TypeScript already delivered
4. **VERIFY** feature necessity against production readiness checklist
5. **ASK**: "Does this move us closer to production deployment?"

**Metacognitive Trigger**: Before adding ANY new React context or major architectural component

---

## 🔒 ENTERPRISE SECURITY (NON-NEGOTIABLE)

1. ALL database operations MUST use Supabase RLS policies
2. ALL user data MUST respect Row Level Security
3. NO direct SQL queries bypassing RLS
4. ALL API routes MUST validate authentication
5. VERIFY security audit compliance before deployment

**Metacognitive Trigger**: Before ANY database schema change or API modification

---

## ♿ ACCESSIBILITY MANDATE (WCAG 2.1 AA)

1. ALL new components MUST include ARIA labels
2. ALL interactive elements MUST be keyboard navigable
3. ALL color choices MUST meet contrast ratios (4.5:1 text, 3:1 UI)
4. ALL forms MUST have semantic HTML and error messages
5. TEST with screen reader before considering complete

**Metacognitive Trigger**: Before marking ANY UI component as complete

---

## 📐 TYPESCRIPT STRICT MODE (ZERO TOLERANCE)

1. NO TypeScript errors allowed in production builds
2. NO 'any' types without explicit justification
3. ALL components MUST have proper type definitions
4. ALL props MUST be typed interfaces
5. BUILD must succeed with 0 errors before PR

**Metacognitive Trigger**: After ANY TypeScript error encountered

---

## 🎓 LEARNING SCIENCE INTEGRITY

1. DO NOT modify spaced repetition intervals (2357 method: [1, 2, 4, 9, 19] days)
2. MAINTAIN 80% pass threshold for assessment completion
3. PRESERVE microlearning structure (83 sections, ~10min each)
4. KEEP certification blueprint alignment (22%, 23%, 15%, 23%, 17%)
5. RESPECT research-backed engagement patterns

**Metacognitive Trigger**: Before modifying ANY assessment or spaced repetition logic

---

## 📊 CONTENT QUALITY STANDARDS

1. ALL assessment questions MUST align with Tanium TCO certification blueprint
2. ALL videos MUST have progress tracking and milestone analytics
3. ALL MDX content MUST render without errors
4. ALL interactive labs MUST have step validation logic
5. NO placeholder content ("coming soon", "TODO") in production

**Metacognitive Trigger**: Before deploying ANY content to production

---

## ⚡ PERFORMANCE REQUIREMENTS

1. Page load time MUST be <3 seconds (First Contentful Paint)
2. Database queries MUST be <100ms for complex assessment analytics
3. Real-time updates MUST have <200ms latency
4. Bundle size MUST be optimized (code splitting enforced)
5. Lighthouse score MUST be >90 (Performance, Accessibility, Best Practices, SEO)

**Metacognitive Trigger**: Before ANY production deployment

---

## 🧪 TESTING MANDATE

1. ALL new features MUST have unit tests (Vitest)
2. ALL critical user flows MUST have E2E tests (Playwright)
3. ALL database changes MUST have migration tests
4. ALL accessibility features MUST be audited with axe-core
5. NO deploys without passing CI/CD pipeline

**Metacognitive Trigger**: Before marking ANY feature as complete

---

## 🚀 PRODUCTION READINESS GATES

**HIGH Priority** (Must complete before production):
- Content population: Video curation (6 needed), question import, lab certificates
- Integration testing: E2E flows, cross-browser, performance benchmarks
- Security audit: RLS policy validation, data protection, GDPR compliance
- User acceptance: Beta testing, feedback collection, bug fixes

**MEDIUM Priority** (Complete within first month):
- Deployment prep: Environment config, DB migration, monitoring dashboards
- Analytics setup: PostHog events, error tracking, conversion funnels
- Documentation: Student onboarding, admin guides, API documentation

**Metacognitive Trigger**: Before claiming ANY production readiness

---

## 🤝 AGENT COORDINATION RULES

1. ALWAYS use specialized agents for complex tasks (3+ steps)
2. SPAWN agents based on task pattern recognition matrix (.claude/CLAUDE.md)
3. COORDINATE using hierarchical topology for enterprise LMS features
4. VALIDATE agent outputs against constitutional rules
5. PREVENT agent tunnel-vision with metacognitive vibe_check

**Available Agent Types** (240+ total):
- TCO Core: tco-content-specialist, tco-validation-expert, tco-ui-architect
- Enterprise Dev: react-specialist, typescript-pro, database-architect
- Quality: test-automator, accessibility-tester, security-engineer

**Metacognitive Trigger**: Before spawning ANY multi-agent team

---

## 📝 DOCUMENTATION STANDARDS

1. ALL new features MUST update relevant completion reports
2. ALL API changes MUST update TypeScript interfaces
3. ALL configuration changes MUST update .claude/CLAUDE.md
4. ALL deployment steps MUST be documented in deployment guides
5. KEEP documentation in sync with implementation

**Metacognitive Trigger**: Before closing ANY feature PR

---

## 🎯 VIBE_CHECK DECISION CHECKPOINTS

**ALWAYS use `vibe_check` before:**

- Adding new React contexts (11+ already exist - verify necessity)
- Creating new database tables or RLS policies (security impact)
- Modifying assessment scoring algorithms (learning science integrity)
- Changing spaced repetition logic (research-backed intervals)
- Adding new external dependencies (bundle size impact)
- Making architectural changes (over-engineering risk)
- Deploying to production (readiness verification)
- Modifying authentication/authorization (security critical)

**Example Usage**:
```javascript
vibe_check({
  context: "User wants to add new feature X",
  assumptions: ["Assumption 1", "Assumption 2"],
  decision: "Proposed implementation approach"
})
```

---

## 🔄 VIBE_LEARN PATTERN LEARNING

**ALWAYS use `vibe_learn` for:**

- TypeScript errors and their resolutions
- Common accessibility violations and fixes
- Performance bottlenecks and optimization solutions
- Security vulnerabilities and patches
- Testing failures and debugging strategies
- Deployment issues and rollback procedures

**Example Usage**:
```javascript
vibe_learn({
  error: "Description of the error encountered",
  solution: "How it was resolved",
  pattern: "General pattern to prevent recurrence",
  category: "typescript-strict-mode | accessibility | security | performance"
})
```

---

## ✅ SUCCESS CRITERIA (Before claiming "DONE")

**Checklist for every feature:**

- [ ] Feature works as specified (functional testing)
- [ ] TypeScript builds with 0 errors (strict mode)
- [ ] Unit tests pass (Vitest coverage >80%)
- [ ] E2E tests pass (critical user flows)
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] Security review complete (RLS policies validated)
- [ ] Documentation updated (user-facing + technical)
- [ ] Performance benchmarks met (Lighthouse >90)
- [ ] Code reviewed by specialist agent
- [ ] Production deployment plan exists
- [ ] Rollback strategy documented
- [ ] Monitoring alerts configured

**Metacognitive Trigger**: Before marking task as complete in any system

---

## 🎓 EXISTING ARCHITECTURE (DO NOT DUPLICATE)

**11+ React Contexts** (State Management):
- AuthContext, DatabaseContext, ExamContext, ProgressContext
- AssessmentContext, QuestionsContext, IncorrectAnswersContext
- PracticeContext, SearchContext, SettingsContext, GlobalNavContext

**Video System** (642 lines): `lib/videoAnalytics.ts` + VideoEmbed component
**Interactive Labs** (949 lines): `types/lab.ts` + InteractiveLabSystem
**Question Bank**: 200 questions (4,108+ in old app ready to migrate)
**Assessment Engine**: Weighted scoring, domain breakdown, adaptive remediation
**Spaced Repetition**: 2357 method implementation, DailyReview + ReviewSession
**Gamification**: 27 badges, 6 levels, points system with multipliers

**Metacognitive Trigger**: Before creating ANY new system - CHECK HERE FIRST

---

## 🚨 RED FLAGS (Immediate vibe_check required)

- Creating new React context without checking existing 11+
- Adding state management library (Redux, Zustand, Jotai)
- Creating duplicate video/lab/assessment logic
- Bypassing RLS with direct SQL queries
- Using 'any' type in TypeScript
- Skipping accessibility attributes
- Deploying without testing
- Adding placeholder/TODO content
- Modifying core learning science algorithms
- Creating new database tables without RLS policies

---

## 📊 METRICS TO TRACK (vibe_learn categories)

**Development Quality**:
- TypeScript errors per session → Learn patterns
- Accessibility violations → Learn fixes
- Security audit findings → Learn preventions
- Performance bottlenecks → Learn optimizations

**Production Health**:
- Build success rate → Learn failure patterns
- Test coverage gaps → Learn testing strategies
- Deployment issues → Learn rollback procedures
- User-reported bugs → Learn QA improvements

---

## 🐳 MCP DEPLOYMENT STRATEGY (PHASED APPROACH)

**Current Phase:** PHASE 1 - Hybrid Architecture (as of 2025-10-08)
**Future Phase:** PHASE 2 - Full Docker Containerization (post-production launch)

### PHASE 1: Hybrid Architecture (CURRENT)

**Status**: Production Preparation
**Strategy**: Minimize complexity during launch, containerize only critical infrastructure

**MCP Transport Methods:**

| MCP Server | Transport | Rationale |
|------------|-----------|-----------|
| sqlite-tanium | **Docker** | Database isolation, backup automation, resource limits |
| shadcn | npx | Dev tool, well-maintained, low risk |
| filesystem | npx | Local file access, minimal overhead |
| claude-flow | npx | Agent coordination, performance critical |
| github | npx | Official MCP, well-maintained |
| firecrawl | npx | Web scraping, official MCP |
| playwright | npx | Browser automation, official MCP |
| postgresql | Docker | Production Supabase (already containerized) |
| vibe-check | HTTP (remote) | Smithery-hosted, no local install |

**Why Hybrid Now?**
1. ✅ Production preparation phase - minimize risk
2. ✅ Just optimized to 61% context reduction - don't add complexity
3. ✅ Official npx MCPs are well-maintained and performant
4. ✅ Database isolation where it matters most (sqlite-tanium, postgresql)
5. ✅ Focus on content population, testing, deployment

**Performance Impact:** <5ms latency for Docker MCPs, 0ms for npx

### PHASE 2: Full Docker Containerization (POST-LAUNCH)

**Timeline**: 1-2 months after production launch
**Scope**: Containerize all 8 MCP servers
**Rationale**: Long-term enterprise infrastructure alignment

**Why Full Docker Later?**
1. ✅ **Industry Standard** - Docker MCP Catalog is official distribution (July 2025)
2. ✅ **MCP Registry** - 2026 roadmap includes centralized discovery (Docker Hub integration)
3. ✅ **Enterprise LMS** - Containerization expected for enterprise-grade systems
4. ✅ **Security Compliance** - Audit requirements (signatures, SBOMs, attestations)
5. ✅ **Scaling** - Resource limits, isolation needed beyond pilot users
6. ✅ **Reference Implementations** - Docker is the MCP standard deployment

**Expected Benefits:**
- Security: Fine-grained resource limits, network isolation
- Reliability: Health checks, auto-restart, rollback capabilities
- Scalability: Kubernetes-ready, horizontal scaling
- Compliance: SBOM generation, vulnerability scanning (Grype/Syft)

### MCP DECISION CHECKPOINTS

**ALWAYS use `vibe_check` BEFORE:**
- Changing MCP transport methods (npx ↔ Docker)
- Adding new MCP servers
- Modifying docker-compose.yml for MCP services
- Production MCP deployment
- Updating MCP server versions
- Changing MCP configuration (env vars, args)

**Example `vibe_check` Usage:**
```javascript
mcp__pv-bhat-vibe-check-mcp-server__vibe_check({
  context: "User wants to containerize firecrawl MCP before production launch",
  assumptions: [
    "Containerization improves security",
    "All MCPs should be Docker",
    "This won't delay production launch"
  ],
  decision: "Create Dockerfile for firecrawl and update .mcp.json"
})

// EXPECTED RESPONSE:
// ⚠️ Question: Is this aligned with PHASE 1 hybrid strategy?
// ⚠️ Challenge: Will this delay production content population work?
// ⚠️ Verify: Check constitutional rules - PHASE 2 is post-launch
// ✅ Recommendation: Keep firecrawl as npx for now, containerize in PHASE 2
```

### PATTERN LEARNING

**ALWAYS use `vibe_learn` AFTER:**
- MCP performance issues (Docker vs npx)
- Docker container debugging
- Transport method failures
- MCP connectivity problems
- Docker image build errors

**Example `vibe_learn` Usage:**
```javascript
mcp__pv-bhat-vibe-check-mcp-server__vibe_learn({
  error: "sqlite-tanium Docker container failed health check",
  solution: "Added DATABASE_PATH env variable and volume mount",
  pattern: "MCP Docker containers need explicit env vars and volume persistence",
  category: "mcp-docker-deployment"
})
```

### ARCHITECTURE ALIGNMENT

**Current Infrastructure:**
- 8 MCP servers: 1 Docker (sqlite-tanium), 7 npx, 1 HTTP remote
- Docker installed: v28.3.3
- Supabase PostgreSQL: Already containerized
- WSL2 environment: Ubuntu on Windows

**Future Infrastructure (Post-Launch):**
- All MCPs containerized in unified docker-compose.yml
- Docker MCP Catalog submission (if custom MCPs developed)
- SBOM generation and vulnerability scanning
- Kubernetes deployment option for scaling

### ROLLBACK PROCEDURE

**If Docker MCP Fails:**
1. Stop Docker container: `docker compose down mcp-sqlite-tanium`
2. Revert .mcp.json to npx transport
3. Clear Docker volumes if database corrupted
4. Restart Claude Code session
5. Verify npx MCP works: Check `.mcp.json` loads correctly

**Rollback File Backup:**
```bash
# Before Docker migration
cp .mcp.json .mcp.json.backup-pre-docker-$(date +%Y%m%d)
```

### MIGRATION TIMELINE

**Immediate (Phase 1):**
- ✅ sqlite-tanium Docker container
- ✅ Docker infrastructure setup
- ✅ Documentation and rollback procedures

**Post-Launch (Phase 2):**
- 🔄 shadcn Docker container
- 🔄 filesystem Docker container
- 🔄 claude-flow Docker container
- 🔄 github Docker container
- 🔄 firecrawl Docker container
- 🔄 playwright Docker container
- 🔄 Unified docker-compose.yml
- 🔄 Security scanning automation

### RED FLAGS (Immediate vibe_check required)

- ❌ Containerizing all MCPs before production launch
- ❌ Removing npx MCPs without Docker replacement tested
- ❌ Modifying production Supabase Docker configuration
- ❌ Adding new MCPs without documented rationale
- ❌ Skipping health checks for Docker MCPs
- ❌ Deploying Docker MCPs without rollback procedure

**Metacognitive Trigger**: Before ANY MCP architectural change

---

## 🔗 RELATED DOCUMENTATION

- **Project Overview**: `.claude/CLAUDE.md`
- **Learning Science**: `FINAL_COMPLETION_SUMMARY.md`
- **Content Quality**: `MODULE_DEVELOPMENT_SUMMARY.md`
- **Week Reports**: `WEEK_*_COMPLETION_REPORT.md`
- **Architecture**: All 15+ completion reports in project root

---

## 🎯 CONSTITUTION UPDATE PROTOCOL

**When to update this constitution:**

1. New production priority identified
2. Critical security pattern discovered
3. Recurring error pattern needs codification
4. Architecture decision requires enforcement
5. Quality gate needs strengthening

**How to update:**
```bash
# Edit this file
nano .claude/vibe-check-constitution.md

# Reload in next session, or use:
mcp__pv-bhat-vibe-check-mcp-server__reset_constitution()
mcp__pv-bhat-vibe-check-mcp-server__update_constitution({
  rule: "Updated rule content"
})
```

---

**End of Constitution v1.0**

Last Updated: 2025-10-08
Next Review: On major architectural change or deployment milestone
