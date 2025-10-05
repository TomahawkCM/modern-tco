# spawn-lms-team

Auto-spawn a complete LMS development team with hierarchical coordination for enterprise-grade feature implementation.

## Agent Team Composition

### Core Development (4 agents)
- **react-specialist** - React/TSX component architecture with hooks
- **typescript-pro** - Type safety enforcement and optimization
- **frontend-developer** - UI/UX implementation with shadcn/ui
- **backend-developer** - API routes and server-side logic

### Quality & Testing (3 agents)
- **test-automator** - Automated test suite creation
- **code-reviewer** - Best practices and code quality
- **tco-validation-expert** - Enterprise LMS compliance validation

### Infrastructure (2 agents)
- **performance-engineer** - Bundle optimization and performance
- **database-architect** - Supabase schema design and RLS

### Coordination (1 agent)
- **hierarchical-coordinator** - Queen-led multi-agent orchestration

## Automatic Initialization

```javascript
// 1. Initialize swarm with hierarchical topology
mcp__claude-flow__swarm_init({
  topology: "hierarchical",
  maxAgents: 10,
  strategy: "adaptive"
})

// 2. Spawn core development team
Task("react-specialist: Implement React components with TypeScript strict mode, shadcn/ui integration, and 11+ context awareness")
Task("typescript-pro: Enforce type safety, resolve type errors, optimize TypeScript configuration for enterprise LMS")
Task("frontend-developer: Build accessible UI with WCAG 2.1 AA compliance, responsive design, and professional styling")
Task("backend-developer: Create API routes, server actions, and Supabase integration with RLS security")

// 3. Spawn quality & testing team
Task("test-automator: Generate comprehensive test suites for Vitest, Jest, and Playwright E2E testing")
Task("code-reviewer: Review code quality, enforce best practices, ensure maintainability and scalability")
Task("tco-validation-expert: Validate enterprise LMS features against certification requirements and quality standards")

// 4. Spawn infrastructure team
Task("performance-engineer: Optimize bundle size, implement caching strategies, ensure <3s page load times")
Task("database-architect: Design optimal Supabase schemas, configure RLS policies, implement real-time features")

// 5. Spawn coordination
Task("hierarchical-coordinator: Coordinate all agents, manage task dependencies, ensure seamless collaboration and quality delivery")
```

## Use Cases

### New Feature Development
```
User: "Build a new adaptive quiz feature with AI-powered difficulty adjustment"
Claude: *Auto-spawns full LMS team with hierarchical coordination*
```

### Major Refactoring
```
User: "Refactor the assessment engine to support custom scoring algorithms"
Claude: *Spawns LMS team with emphasis on backend-developer and database-architect*
```

### Production Deployment
```
User: "Prepare production deployment with full testing and performance optimization"
Claude: *Spawns full team with emphasis on testing and infrastructure agents*
```

## Expected Outcomes

- **10 specialized agents** working in coordinated hierarchy
- **Hierarchical coordination** for complex task management
- **Enterprise-grade quality** with multi-agent review
- **3x faster development** compared to single-agent approach
- **95%+ first-pass success** for complex LMS features

## Agent Performance Metrics

Each agent tracks:
- Task completion time
- Quality score (0-100)
- Token efficiency
- Collaboration effectiveness
- Cross-agent dependencies

## Coordination Strategy

**Hierarchical (Queen-led)**:
1. Coordinator analyzes task and creates execution plan
2. Core development agents implement features in parallel
3. Quality agents review and validate implementations
4. Infrastructure agents optimize and prepare for deployment
5. Coordinator ensures all steps complete successfully

## Token Budget Allocation

- Core Development: 40% (4 agents)
- Quality & Testing: 30% (3 agents)
- Infrastructure: 20% (2 agents)
- Coordination: 10% (1 agent)

Total: 10 agents with optimized token distribution
