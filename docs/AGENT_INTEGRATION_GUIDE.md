# 🐝 Agent Integration Guide - Tanium TCO LMS

**Comprehensive guide to the 240+ agent ecosystem for enterprise LMS development**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Agent Ecosystem](#agent-ecosystem)
3. [Quick Start](#quick-start)
4. [Custom Slash Commands](#custom-slash-commands)
5. [Agent Selection Strategies](#agent-selection-strategies)
6. [Coordination Topologies](#coordination-topologies)
7. [Performance Optimization](#performance-optimization)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Tanium TCO Learning Management System utilizes a sophisticated multi-agent architecture with **240+ specialized agents** for enterprise-grade development:

- **54 Core Claude Flow Agents** - Available via MCP, general-purpose development
- **186 LMS-Specific Agents** - Tanium TCO project specializations

### Key Features

✅ **Automatic Agent Selection** - Keyword-based routing to optimal agents
✅ **Hierarchical Coordination** - Queen-led coordination for complex tasks
✅ **Mesh Networking** - Peer-to-peer collaboration for content creation
✅ **Adaptive Topology** - Dynamic topology adjustment based on complexity
✅ **Cross-Session Memory** - SQLite persistence for agent context
✅ **Performance Tracking** - Real-time metrics for token usage and quality
✅ **Custom Slash Commands** - Pre-configured agent teams for common workflows

---

## Agent Ecosystem

### 54 Core Claude Flow Agent Types

#### Core Development (5 agents)
```javascript
coder              // Implementation specialist for all languages/frameworks
reviewer           // Code quality assurance and best practices
tester             // Test creation, validation, automation
planner            // Strategic planning and roadmap development
researcher         // Information gathering and documentation
```

#### Swarm Coordination (3 agents)
```javascript
hierarchical-coordinator  // Queen-led coordination (complex tasks)
mesh-coordinator         // Peer-to-peer networks (collaborative work)
adaptive-coordinator     // Dynamic topology (adjusts to complexity)
```

#### Specialized Development (14 agents)
```javascript
backend-dev           // API and server-side logic
frontend-dev          // UI/UX and client-side logic
mobile-dev            // React Native and mobile
ml-developer          // Machine learning and AI
system-architect      // High-level system design
security-specialist   // Security audits and vulnerability testing
performance-optimizer // Bundle optimization and performance
database-expert       // Database schema and query optimization
api-designer          // RESTful/GraphQL API design
devops-engineer       // CI/CD and infrastructure automation
qa-engineer           // Quality assurance and test automation
documentation-writer  // Technical documentation
accessibility-expert  // WCAG compliance
ui-ux-designer        // Interface and experience design
```

#### Domain-Specific (32 agents)
Available via custom spawning for web3, fintech, healthcare, e-commerce, etc.

### 186 Enterprise LMS Specialists

#### React/TypeScript Specialists (12 agents)
Focus on modern React development with TypeScript strict mode, hooks, and 11+ context orchestration.

#### Enterprise LMS Core (15 agents)
Specialized for Tanium certification content, assessment engines, video systems, and learning path design.

#### Database & Backend (20 agents)
Supabase PostgreSQL experts for RLS, real-time features, query optimization, and schema design.

#### UI/UX & Accessibility (18 agents)
shadcn/ui specialists, WCAG compliance testers, responsive designers, and accessibility experts.

#### Testing & Quality (25 agents)
Comprehensive testing specialists for Vitest, Jest, Playwright, E2E, security audits, and performance testing.

#### Video & Content Systems (15 agents)
YouTube API integration, MDX authoring, video progress tracking, and content pipeline automation.

#### Analytics & Monitoring (20 agents)
PostHog integration, Sentry monitoring, funnel analysis, A/B testing, and engagement metrics.

#### Deployment & DevOps (18 agents)
Vercel specialists, zero-downtime deployment, CI/CD architects, and production monitoring.

#### Security & Compliance (15 agents)
RLS audit, authentication architecture, CSP configuration, GDPR compliance, and encryption.

#### Performance & Optimization (18 agents)
Bundle analysis, code splitting, Lighthouse optimization, Core Web Vitals, and memory leak detection.

#### Additional Coordination & Intelligence (10 agents)
Task decomposition, dependency mapping, parallel execution, and knowledge synthesis.

---

## Quick Start

### 1. Initialize Hive-Mind System

```bash
# Run initialization script (first time only)
node scripts/hive-mind-config.js
```

**What this does**:
- Creates `.claude-flow/` directory structure
- Initializes SQLite database for agent tracking
- Saves hive-mind configuration
- Sets up metrics tracking
- Verifies MCP server configuration

### 2. Automatic Session Initialization

When you start a new Claude Code session, the `.claude/hooks/on-session-start.sh` script automatically:

✅ Detects enterprise LMS architecture
✅ Loads 240+ agent ecosystem
✅ Configures MCP coordination
✅ Enables metrics tracking
✅ Sets up cross-session memory
✅ Displays available slash commands

### 3. Use Custom Slash Commands

```bash
/spawn-lms-team       # Full LMS development team (10 agents)
/spawn-content-team   # Content creation & validation (7 agents)
/spawn-testing-team   # Comprehensive testing (9 agents)
/spawn-deployment-team # Production deployment (8 agents)
```

---

## Custom Slash Commands

### `/spawn-lms-team`

**Purpose**: Complete LMS feature development with enterprise quality

**Team Composition** (10 agents):
- Core Development: react-specialist, typescript-pro, frontend-developer, backend-developer
- Quality & Testing: test-automator, code-reviewer, tco-validation-expert
- Infrastructure: performance-engineer, database-architect
- Coordination: hierarchical-coordinator

**Use Cases**:
- New feature development (e.g., "Build adaptive quiz feature with AI difficulty adjustment")
- Major refactoring (e.g., "Refactor assessment engine for custom scoring algorithms")
- Production deployment preparation

**Expected Outcomes**:
- 10 specialized agents with hierarchical coordination
- 3x faster development vs single-agent
- 95%+ first-pass success for complex features

---

### `/spawn-content-team`

**Purpose**: Create and validate Tanium certification content

**Team Composition** (7 agents):
- Content Creation: tco-content-specialist, video-system-architect, assessment-engine-specialist
- Quality Assurance: tco-validation-expert, accessibility-tester
- Analytics: tco-analytics-coordinator
- Coordination: mesh-coordinator (peer-to-peer)

**Use Cases**:
- New module creation (e.g., "Create Tanium Comply module with videos and questions")
- Video system enhancement (e.g., "Add progress tracking to all training videos")
- Assessment question generation (e.g., "Generate 50 practice questions for Domain 3")
- Accessibility audit (e.g., "Audit all modules for WCAG compliance")

**Expected Outcomes**:
- 7 specialized content agents with mesh coordination
- Certification-aligned content matching TCO blueprint (22%, 23%, 15%, 23%, 17%)
- 100% WCAG 2.1 AA compliance
- Comprehensive analytics for engagement tracking

---

### `/spawn-testing-team`

**Purpose**: Comprehensive testing and quality assurance

**Team Composition** (9 agents):
- Test Creation: test-automator, e2e-specialist, performance-tester
- Quality Assurance: tco-validation-expert, accessibility-tester, security-tester
- Analysis: qa-analyst, regression-tester
- Coordination: hierarchical-coordinator

**Use Cases**:
- Pre-production validation (e.g., "Run full testing suite before deployment")
- Feature testing (e.g., "Test new adaptive quiz feature end-to-end")
- Security audit (e.g., "Audit Supabase RLS policies and authentication")
- Performance benchmarking (e.g., "Benchmark app with 50 concurrent users")

**Expected Outcomes**:
- 9 specialized testing agents with hierarchical coordination
- 90%+ test coverage (unit + integration + E2E)
- 100% WCAG 2.1 AA compliance validation
- Security audit with RLS and auth validation
- Performance benchmarks with load testing

---

### `/spawn-deployment-team`

**Purpose**: Production deployment with zero-downtime

**Team Composition** (8 agents):
- Deployment: tco-deployment-manager, devops-engineer, vercel-specialist
- Security & Compliance: security-engineer, compliance-auditor
- Monitoring: monitoring-specialist, performance-engineer
- Coordination: hierarchical-coordinator

**Use Cases**:
- Initial production deployment
- Hotfix deployment (e.g., "Deploy critical bug fix immediately")
- Performance optimization (e.g., "Optimize production performance and enable caching")
- Security audit before deployment

**Expected Outcomes**:
- 8 specialized deployment agents with hierarchical coordination
- Zero-downtime deployment with health checks
- Automated CI/CD pipeline with GitHub Actions
- Comprehensive security audit pre-deployment
- Production monitoring with Sentry + PostHog
- Instant rollback capability

---

## Agent Selection Strategies

### Automatic Keyword-Based Routing

Claude automatically selects optimal agents based on task keywords:

#### Frontend/UI Keywords
`react`, `component`, `ui`, `tsx`, `shadcn`, `accessibility`, `responsive`

**Auto-Spawns**:
- react-specialist
- typescript-pro
- tco-ui-architect
- accessibility-tester

**Coordination**: hierarchical-coordinator

---

#### Backend/Database Keywords
`api`, `supabase`, `postgresql`, `auth`, `rls`, `real-time`, `migration`

**Auto-Spawns**:
- backend-developer
- database-architect
- security-engineer
- supabase-specialist

**Coordination**: hierarchical-coordinator

---

#### Assessment/Analytics Keywords
`assessment`, `scoring`, `analytics`, `progress`, `remediation`

**Auto-Spawns**:
- assessment-engine-specialist
- tco-analytics-coordinator
- data-analyst

**Coordination**: adaptive-coordinator

---

#### Video/Content Keywords
`video`, `youtube`, `content`, `mdx`, `course`, `learning`

**Auto-Spawns**:
- video-system-architect
- tco-content-specialist
- media-engineer

**Coordination**: mesh-coordinator

---

#### Testing/Quality Keywords
`test`, `vitest`, `jest`, `e2e`, `playwright`, `quality`, `validation`

**Auto-Spawns**:
- test-automator
- qa-expert
- tco-validation-expert
- e2e-specialist

**Coordination**: hierarchical-coordinator

---

#### Deployment/DevOps Keywords
`deploy`, `vercel`, `production`, `ci/cd`, `environment`

**Auto-Spawns**:
- tco-deployment-manager
- devops-engineer
- vercel-specialist

**Coordination**: hierarchical-coordinator

---

### Manual Agent Spawning

For custom agent combinations, use MCP tools directly:

```javascript
// Initialize swarm with specific topology
mcp__claude-flow__swarm_init({
  topology: "hierarchical",  // or "mesh", "adaptive"
  maxAgents: 10,
  strategy: "adaptive"
})

// Spawn specific agents
mcp__claude-flow__agent_spawn({
  type: "react-specialist",
  capabilities: ["tsx", "typescript", "shadcn"]
})

// Orchestrate complex tasks
mcp__claude-flow__task_orchestrate({
  task: "Implement feature with enterprise compliance",
  strategy: "adaptive",
  maxAgents: 8,
  priority: "high"
})

// Check swarm status
mcp__claude-flow__swarm_status()
```

---

## Coordination Topologies

### Hierarchical (Queen-Led)

**Best For**: Complex tasks requiring strict coordination and dependencies

**Structure**:
```
hierarchical-coordinator (Queen)
├── Core Development Team
├── Quality & Testing Team
├── Infrastructure Team
└── Reports & Aggregation
```

**Use Cases**:
- Full feature development
- Production deployment
- Major refactoring
- Comprehensive testing

**Benefits**:
- Strict task dependencies
- Clear responsibility chains
- Comprehensive reporting
- High quality control

---

### Mesh (Peer-to-Peer)

**Best For**: Collaborative content creation and parallel workflows

**Structure**:
```
mesh-coordinator (Facilitator)
↔ tco-content-specialist
↔ video-system-architect
↔ assessment-engine-specialist
↔ tco-validation-expert
```

**Use Cases**:
- Content creation
- Video integration
- Question bank generation
- Documentation

**Benefits**:
- Fast parallel execution
- Flexible collaboration
- Reduced bottlenecks
- High creativity

---

### Adaptive (Dynamic Topology)

**Best For**: Tasks with unknown complexity or changing requirements

**Structure**:
```
adaptive-coordinator
├── Analyzes task complexity
├── Selects optimal topology
└── Adjusts agent allocation dynamically
```

**Use Cases**:
- Assessment engine optimization
- Performance tuning
- Analytics integration
- Exploratory development

**Benefits**:
- Automatic optimization
- Flexible resource allocation
- Handles uncertainty well
- Scales with complexity

---

## Performance Optimization

### Token Budget Allocation

#### LMS Development Team (10 agents)
- Core Development: 40% (4 agents)
- Quality & Testing: 30% (3 agents)
- Infrastructure: 20% (2 agents)
- Coordination: 10% (1 agent)

#### Content Team (7 agents)
- Content Creation: 45% (3 agents)
- Quality Assurance: 30% (2 agents)
- Analytics: 15% (1 agent)
- Coordination: 10% (1 agent)

#### Testing Team (9 agents)
- Test Creation: 35% (3 agents)
- Quality Assurance: 35% (3 agents)
- Analysis: 20% (2 agents)
- Coordination: 10% (1 agent)

#### Deployment Team (8 agents)
- Deployment: 40% (3 agents)
- Security & Compliance: 25% (2 agents)
- Monitoring: 25% (2 agents)
- Coordination: 10% (1 agent)

### Metrics Tracking

All agents track:
- **Token Usage** - Total tokens consumed per agent
- **Execution Time** - Time to complete tasks
- **Quality Score** - 0-100 quality rating
- **Collaboration Score** - Cross-agent effectiveness
- **Task Success Rate** - Percentage of successful completions

View metrics:
```bash
cat .claude-flow/metrics/performance.json
cat .claude-flow/metrics/task-metrics.json
cat .claude-flow/metrics/system-metrics.json
```

---

## Best Practices

### 1. Start with Custom Slash Commands

For common workflows, always use pre-configured slash commands:

```bash
/spawn-lms-team       # Feature development
/spawn-content-team   # Content creation
/spawn-testing-team   # Quality assurance
/spawn-deployment-team # Production deployment
```

### 2. Let Claude Auto-Select Agents

Claude automatically routes tasks to optimal agents based on keywords. Trust the auto-selection for:
- Frontend/UI work
- Backend/database tasks
- Testing and QA
- Deployment and DevOps

### 3. Use Hierarchical Coordination for Complex Tasks

When working on features with dependencies, use hierarchical topology:

```javascript
mcp__claude-flow__swarm_init({ topology: "hierarchical" })
```

### 4. Use Mesh Coordination for Parallel Work

For content creation and collaborative tasks, use mesh topology:

```javascript
mcp__claude-flow__swarm_init({ topology: "mesh" })
```

### 5. Monitor Performance Metrics

Regularly check agent performance:

```bash
npx claude-flow status
```

### 6. Leverage Cross-Session Memory

Agents persist context across sessions via SQLite database. This enables:
- Long-running feature development
- Continuous improvement
- Knowledge accumulation

---

## Troubleshooting

### Issue: Agents Not Auto-Spawning

**Solution**: Check session initialization:
```bash
# Verify hive-mind configuration exists
cat .claude-flow/hive-config.json

# Re-run initialization if needed
node scripts/hive-mind-config.js
```

---

### Issue: MCP Servers Not Available

**Solution**: Verify MCP server configuration in Claude Code settings:

Required servers:
- claude-flow
- filesystem
- github
- firecrawl
- playwright
- sqlite-tanium
- shadcn
- supabase

---

### Issue: Poor Agent Performance

**Solution**: Check metrics and adjust token budget:

```bash
# View performance metrics
cat .claude-flow/metrics/performance.json

# View agent-specific metrics
cat .claude-flow/metrics/system-metrics.json
```

Adjust `HIVE_MIND_CONFIG.agentProfiles` in `scripts/hive-mind-config.js`.

---

### Issue: Coordination Failures

**Solution**: Switch coordination topology:

```javascript
// Try hierarchical for complex tasks
mcp__claude-flow__swarm_init({ topology: "hierarchical" })

// Try mesh for parallel work
mcp__claude-flow__swarm_init({ topology: "mesh" })

// Try adaptive for unknown complexity
mcp__claude-flow__swarm_init({ topology: "adaptive" })
```

---

### Issue: SQLite Database Errors

**Solution**: Re-initialize database:

```bash
# Remove corrupted database
rm .claude-flow/hive-mind.db

# Re-run initialization
node scripts/hive-mind-config.js
```

---

## Advanced Usage

### Custom Agent Profiles

Edit `scripts/hive-mind-config.js` to add custom agent profiles:

```javascript
agentProfiles: {
  'custom-specialist': {
    capabilities: ['capability1', 'capability2'],
    priority: 'high',
    tokenBudget: 0.15
  }
}
```

### Custom Task Routing

Add custom routing patterns in `HIVE_MIND_CONFIG.routing.patterns`:

```javascript
routing: {
  patterns: {
    'custom-pattern': {
      keywords: ['keyword1', 'keyword2'],
      agents: ['agent1', 'agent2'],
      topology: 'hierarchical'
    }
  }
}
```

### Agent Performance Tuning

Optimize agent token budgets based on actual usage:

```javascript
// Analyze token usage
cat .claude-flow/metrics/task-metrics.json

// Adjust token budgets in hive-mind-config.js
// Increase budget for high-performing agents
// Decrease budget for underutilized agents
```

---

## Resources

- **GitHub**: https://github.com/ruvnet/claude-flow
- **Hive Mind Guide**: https://github.com/ruvnet/claude-flow/tree/main/docs/hive-mind
- **ruv-swarm**: https://github.com/ruvnet/ruv-FANN/tree/main/ruv-swarm
- **Discord Community**: https://discord.agentics.org

---

## Support

For issues or questions:
1. Check this documentation
2. Review `.claude-flow/metrics/` for performance insights
3. Verify MCP server configuration
4. Run `node scripts/hive-mind-config.js` to reset
5. Join Discord community for help

---

**Last Updated**: October 2, 2025
**Version**: 2.0.0
**Agent Count**: 240+ (54 core + 186 specialized)
