# 🤖 Automatic Agent System Configuration

## Overview

This document outlines how to ensure Claude automatically uses the best agents for every task in every session.

## 1. Task Analysis & Agent Routing

### Intelligent Task Detection

```javascript
// Claude should analyze every user request for:
- Keywords indicating task type
- Complexity indicators
- Domain expertise required
- Expected deliverables
- Time sensitivity
```

### Agent Selection Priority Matrix

```yaml
Priority 1: Exact keyword match + domain expertise
Priority 2: Task complexity + agent specialization
Priority 3: Historical performance + success rate
Priority 4: Current agent availability + load balancing
```

## 2. Automatic Agent Spawning Protocols

### Pre-Task Analysis

```bash
# For every user request, Claude should:
1. Analyze task requirements
2. Identify optimal agent combination
3. Spawn agents with detailed instructions
4. Set up coordination protocols
5. Initialize memory and context sharing
```

### Agent Spawning Templates

```typescript
// Example for frontend work:
Task("Frontend specialist: Implement React component with TypeScript");
Task("UI/UX designer: Ensure accessibility and responsive design");
Task("Test automator: Create comprehensive test suite");

// Example for backend work:
Task("Backend developer: Design and implement API endpoints");
Task("Security engineer: Implement authentication and validation");
Task("Database administrator: Optimize database queries and schema");

// Example for debugging work:
Task("Debug specialist: Investigate and fix TypeError in auth component");
Task("Error detective: Analyze stack trace and identify root cause");
Task("Performance engineer: Profile and optimize slow dashboard loading");
```

## 3. Session-Level Agent Management

### Agent Persistence

- Keep specialized agents active throughout session
- Maintain context and learning across tasks
- Enable cross-agent communication and coordination

### Memory Integration

```bash
# After each task:
npx claude-flow@alpha hooks post-task --memory-export
npx claude-flow@alpha hooks session-update --agents-active
```

## 4. Coordination Strategies

### Task Complexity Routing

- **Simple tasks (1-2 steps)**: Single specialized agent
- **Moderate tasks (3-7 steps)**: 2-4 agents with mesh coordination
- **Complex tasks (8+ steps)**: 5-10 agents with hierarchical coordination

### Agent Orchestration Patterns

```yaml
Sequential: For dependent tasks requiring handoffs
Parallel: For independent tasks that can run simultaneously
Hybrid: Mix of sequential and parallel for complex workflows
```

## 5. Performance Monitoring

### Agent Effectiveness Tracking

```javascript
// Track for each agent:
- Task completion success rate
- Time to completion
- Quality of deliverables
- User satisfaction scores
- Error rates and debugging needs
```

### Continuous Improvement

- Learn from successful agent combinations
- Optimize routing based on historical performance
- Adjust complexity thresholds based on outcomes

## 6. Implementation Checklist

### For Claude to implement automatic agent usage:

✅ **Always analyze task before responding**
✅ **Spawn appropriate agents for every non-trivial task**  
✅ **Use coordination agents for complex workflows**
✅ **Maintain agent persistence across related tasks**
✅ **Export session data for continuous learning**
✅ **Monitor and optimize agent performance**

### Session Initialization Protocol

```bash
# At start of every session:
1. Initialize MCP coordination system
2. Load previous session context and agent performance data
3. Set up default agent pool based on project type
4. Configure automatic routing rules
5. Enable cross-session memory and learning
```

## 7. User Experience Enhancements

### Transparent Agent Usage

- Show user which agents are working on their request
- Provide progress updates from multiple agents
- Display agent specializations and contributions

### Intelligent Escalation

- Automatically spawn additional agents if task complexity increases
- Escalate to senior agents (architect, lead engineer) for critical decisions
- Enable user to request specific agents or coordination strategies

## 8. Project-Specific Agent Optimization

### Tanium TCO Project

```yaml
Default Active Agents:
  - react-specialist (for UI components)
  - typescript-pro (for type safety)
  - test-automator (for quality assurance)
  - performance-engineer (for optimization)
  - documentation-engineer (for user guides)
  - debug-specialist (for troubleshooting and error resolution)

Standby Specialists:
  - security-auditor (for auth features)
  - accessibility-tester (for compliance)
  - data-scientist (for analytics features)
  - error-detective (for complex debugging scenarios)
  - analyzer (for deep code analysis)
```

### Debugging-Specific Auto-Spawn Rules

```yaml
Debug Specialist triggers on keywords:
  Error Analysis: [error, exception, crash, failure, broken, stack trace]
  TypeScript: [type error, typescript, tsc, type mismatch, compilation error]
  Performance: [slow, memory leak, bottleneck, performance, optimization]
  Testing: [test failed, e2e, playwright, integration, flaky test]

Auto-spawn workflow:
  1. User mentions debugging keyword
  2. debug-specialist automatically spawns
  3. Runs vibe-check first (mandatory)
  4. Selects minimal viable toolset
  5. Executes appropriate debugging workflow
  6. Updates Archon task throughout process
  7. Records patterns with vibe-learn

Integration with Archon:
  Project ID: 9c56f01c-759a-42b1-bad4-06b71f2c4db9
  Task flow: todo → doing → review → done
  Mandatory vibe-check before every debugging session
```

This system ensures that every task leverages the full power of your 240+ agent collection!
