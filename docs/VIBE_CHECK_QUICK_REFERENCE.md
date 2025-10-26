# Vibe Check MCP Server - Quick Reference Guide

**Tanium TCO Enterprise LMS - Metacognitive Guardrails**

Version: 1.0
Last Updated: 2025-10-08
Purpose: Prevent over-engineering, maintain production focus, ensure quality

---

## 🎯 What is Vibe Check?

Vibe Check is a **metacognitive oversight layer** that helps prevent:
- ❌ Over-engineering (creating duplicate systems)
- ❌ Tunnel vision (missing existing solutions)
- ❌ Scope creep (adding unnecessary features)
- ❌ Recurring errors (repeating past mistakes)
- ❌ Misalignment (losing sight of production goals)

**Success Rate**: 99.88% | **Trusted By**: 11,000+ developers

---

## 🛠️ 5 Available Tools

### 1. `vibe_check` - Metacognitive Questioning

**Purpose**: Break tunnel vision before making critical decisions

**When to Use**:
- ✅ Before adding new React contexts (11+ already exist)
- ✅ Before creating new database tables or RLS policies
- ✅ Before modifying assessment/spaced repetition logic
- ✅ Before adding external dependencies
- ✅ Before making architectural changes
- ✅ Before deploying to production

**Example Usage**:
```javascript
mcp__pv-bhat-vibe-check-mcp-server__vibe_check({
  context: "User wants to track video watch time analytics",
  assumptions: [
    "Need new React context for video state",
    "Need new database table for video_analytics",
    "Need new analytics dashboard component"
  ],
  decision: "Create VideoAnalyticsContext, video_analytics table, and dashboard"
})
```

**Expected Response**:
- ⚠️ Questions your assumptions
- ⚠️ Points out existing solutions
- ✅ Verifies alignment with production goals

**Real-World Example**:
```javascript
// BEFORE implementing new feature
vibe_check({
  context: "Adding student progress tracking",
  assumptions: [
    "Need new ProgressTracker component",
    "Need new user_progress table",
    "Need new API route for progress"
  ],
  decision: "Create new progress tracking system"
})

// RESPONSE:
// ⚠️ ProgressContext already exists with 95% of needed functionality
// ⚠️ Database has user_progress table (check schema)
// ✅ Only need to extend existing API route
// ✅ Saves 4 hours of duplicate work!
```

---

### 2. `vibe_learn` - Pattern Recognition System

**Purpose**: Track errors and solutions to prevent recurring issues

**When to Use**:
- ✅ After fixing TypeScript errors
- ✅ After resolving accessibility violations
- ✅ After optimizing performance bottlenecks
- ✅ After patching security vulnerabilities
- ✅ After debugging test failures

**Example Usage**:
```javascript
mcp__pv-bhat-vibe-check-mcp-server__vibe_learn({
  error: "Type 'boolean | undefined' not assignable to type 'boolean'",
  solution: "Added Boolean() coercion: Boolean(isComplete)",
  pattern: "localStorage returns string|null, always coerce to expected type",
  category: "typescript-strict-mode"
})
```

**Categories**:
- `typescript-strict-mode` - Type errors and resolutions
- `accessibility` - WCAG violations and fixes
- `security` - RLS policies and vulnerabilities
- `performance` - Bundle size and optimization
- `testing` - E2E failures and solutions
- `deployment` - Production issues and rollbacks

**Real-World Example**:
```javascript
// AFTER fixing accessibility bug
vibe_learn({
  error: "Button not keyboard accessible (missing onKeyDown)",
  solution: "Added onKeyDown handler with Enter/Space key support",
  pattern: "All interactive elements need keyboard handlers, not just onClick",
  category: "accessibility"
})

// BENEFIT: Future agents will know this pattern!
```

---

### 3. `update_constitution` - Add Session Rules

**Purpose**: Append project-specific guidelines for this session (in-memory)

**When to Use**:
- ✅ Starting a new sprint with specific constraints
- ✅ Adding temporary rules for experimental features
- ✅ Enforcing deadline-driven priorities
- ✅ Setting up special security requirements

**Example Usage**:
```javascript
mcp__pv-bhat-vibe-check-mcp-server__update_constitution({
  rule: "SPRINT_RULE",
  content: "This sprint: ONLY content population. NO new features or refactoring."
})
```

**Real-World Example**:
```javascript
// During production preparation sprint
update_constitution({
  rule: "PRODUCTION_FREEZE",
  content: `
    - NO new dependencies (bundle size locked)
    - NO architectural changes (risk too high)
    - NO feature additions (content population only)
    - YES bug fixes (security + critical only)
    - YES content import (videos, questions, labs)
  `
})
```

---

### 4. `reset_constitution` - Overwrite All Rules

**Purpose**: Start fresh with new guidelines (clears in-memory rules)

**When to Use**:
- ✅ Switching between different project phases
- ✅ Moving from development to production prep
- ✅ Starting a new major feature
- ✅ After completing a sprint

**Example Usage**:
```javascript
mcp__pv-bhat-vibe-check-mcp-server__reset_constitution({
  rules: [
    "NEW_PHASE: Post-launch optimization",
    "PRIORITY: Performance and scalability",
    "CONSTRAINTS: Maintain backward compatibility"
  ]
})
```

**Real-World Example**:
```javascript
// Transitioning from learning science to production
reset_constitution({
  rules: [
    "Phase: Production Preparation",
    "Learning science: COMPLETE - NO modifications",
    "Priority: Content population + testing + deployment",
    "Quality gates: All tests pass, accessibility audit, security review"
  ]
})
```

---

### 5. `check_constitution` - View Current Rules

**Purpose**: Review active constitutional rules for this session

**When to Use**:
- ✅ Starting a new task (verify current constraints)
- ✅ Before making architectural decisions
- ✅ When unsure about project priorities
- ✅ Debugging why certain actions are blocked

**Example Usage**:
```javascript
mcp__pv-bhat-vibe-check-mcp-server__check_constitution()
```

**Expected Response**:
```
Current Constitutional Rules:
1. PROJECT_PHASE: Production Preparation
2. PREVENT_OVER_ENGINEERING: 11+ contexts exist, verify before creating new
3. ENTERPRISE_SECURITY: RLS mandatory, no bypassing
4. ACCESSIBILITY_MANDATE: WCAG 2.1 AA required
5. TYPESCRIPT_STRICT: Zero tolerance for errors
... (full list of active rules)
```

---

## 🎯 Decision Tree: Which Tool to Use?

### 🤔 Before Taking Action

```
Are you about to:
├─ Add new architecture/dependency? → USE vibe_check
├─ Modify core systems (auth/assessment/SRS)? → USE vibe_check
├─ Deploy to production? → USE vibe_check
└─ Implement minor bug fix? → Proceed (no vibe_check needed)
```

### ✅ After Taking Action

```
Did you:
├─ Fix a TypeScript error? → USE vibe_learn
├─ Resolve accessibility issue? → USE vibe_learn
├─ Optimize performance? → USE vibe_learn
└─ Add documentation? → No vibe_learn needed
```

### 📋 Managing Session Rules

```
Do you need to:
├─ View current rules? → USE check_constitution
├─ Add a new rule? → USE update_constitution
├─ Replace all rules? → USE reset_constitution
└─ Use default rules? → check_constitution (already loaded)
```

---

## 🚨 Red Flags (ALWAYS Use vibe_check)

**Immediate vibe_check required if you hear yourself saying:**

- ❌ "I need a new React context for..."
- ❌ "Let me create a new database table for..."
- ❌ "I'll add this dependency to handle..."
- ❌ "I need to modify the spaced repetition intervals..."
- ❌ "Let me change the assessment scoring algorithm..."
- ❌ "I'll create a new state management solution..."
- ❌ "This needs a complete architectural refactor..."
- ❌ "I'll deploy this quickly without testing..."

**Why?** These statements often indicate tunnel vision or over-engineering.

---

## 📊 Practical Workflow Examples

### Example 1: Adding New Feature

**Scenario**: User requests video bookmark functionality

**Step 1: Metacognitive Check**
```javascript
vibe_check({
  context: "User wants to bookmark videos for later viewing",
  assumptions: [
    "Need VideoBookmarkContext for state",
    "Need video_bookmarks database table",
    "Need BookmarkButton component"
  ],
  decision: "Implement full bookmarking system"
})
```

**Step 2: Review Response**
```
⚠️ Question: Does ProgressContext track video completion already?
⚠️ Challenge: Can you extend existing bookmark system?
✅ Verify: Check if user_bookmarks table exists
```

**Step 3: Implement Efficiently**
- Found: ProgressContext has bookmark foundation
- Found: user_bookmarks table exists (generic)
- Action: Extend existing system (2 hours vs 6 hours)

**Step 4: Learn from Pattern**
```javascript
vibe_learn({
  error: "Almost created duplicate bookmark system",
  solution: "Extended existing ProgressContext and user_bookmarks table",
  pattern: "Always check existing contexts and database schema before creating new",
  category: "over-engineering-prevention"
})
```

---

### Example 2: Fixing TypeScript Error

**Scenario**: localStorage type error breaks build

**Step 1: Fix the Error**
```typescript
// BEFORE (error)
const isComplete = localStorage.getItem('sectionComplete');
if (isComplete) { /* ... */ }  // Error: Type 'string | null' not assignable

// AFTER (fixed)
const isComplete = Boolean(localStorage.getItem('sectionComplete'));
if (isComplete) { /* ... */ }  // ✅ Works!
```

**Step 2: Learn the Pattern**
```javascript
vibe_learn({
  error: "localStorage.getItem returns string | null, not boolean",
  solution: "Used Boolean() coercion to convert to expected type",
  pattern: "localStorage always returns string | null - coerce to expected type",
  category: "typescript-strict-mode"
})
```

**Step 3: Prevent Recurrence**
- Future agents see this pattern
- Similar errors avoided automatically
- Team knowledge grows organically

---

### Example 3: Production Deployment Preparation

**Scenario**: Preparing for first production deployment

**Step 1: Set Production Rules**
```javascript
reset_constitution({
  rules: [
    "DEPLOYMENT_FREEZE: No new features until post-launch",
    "TESTING_MANDATE: 100% E2E coverage for critical flows",
    "SECURITY_AUDIT: All RLS policies validated",
    "PERFORMANCE_GATE: Lighthouse score >90",
    "ROLLBACK_READY: Instant rollback plan documented"
  ]
})
```

**Step 2: Verify Before Deploy**
```javascript
vibe_check({
  context: "Ready to deploy to production",
  assumptions: [
    "All tests passing",
    "Security audit complete",
    "Performance benchmarks met",
    "Rollback plan documented"
  ],
  decision: "Deploy to production now"
})
```

**Step 3: Review Checklist**
```
✅ All E2E tests passing? YES
✅ Security audit complete? YES
✅ Lighthouse score >90? YES (Score: 94)
✅ Rollback plan exists? YES (documented in DEPLOYMENT.md)
✅ Proceed with deployment
```

---

## 🎓 Tanium TCO LMS Specific Patterns

### Existing Architecture (DO NOT DUPLICATE)

**11+ React Contexts**:
- AuthContext, DatabaseContext, ExamContext, ProgressContext
- AssessmentContext, QuestionsContext, IncorrectAnswersContext
- PracticeContext, SearchContext, SettingsContext, GlobalNavContext

**Before creating new context**, use vibe_check:
```javascript
vibe_check({
  context: "Need state for [feature]",
  assumptions: ["Need new React context"],
  decision: "Create [Feature]Context"
})
// RESPONSE: Check if existing context can be extended first!
```

**Video System** (642 lines):
- `lib/videoAnalytics.ts` + VideoEmbed component
- Milestone tracking, watch time analytics

**Interactive Labs** (949 lines):
- `types/lab.ts` (430 lines) + InteractiveLabSystem (519 lines)
- Step validation, hint system

**Question Bank**:
- 200 questions active (4,108+ ready to migrate)
- 6 TCO domains with blueprint alignment

**Assessment Engine**:
- Weighted scoring algorithm
- Domain breakdown (22%, 23%, 15%, 23%, 17%)
- Adaptive remediation engine

**Spaced Repetition**:
- 2357 method ([1, 2, 4, 9, 19] day intervals)
- DailyReview + ReviewSession components
- Weak concept tracking

**Gamification**:
- 27 badges across 5 categories
- 6 progression levels
- Points system with multipliers

---

## 📚 Resources

**Constitutional Rules**: `.claude/vibe-check-constitution.md`
**Initialization Script**: `.claude/scripts/init-vibe-check.sh`
**Session Hook**: `.claude/hooks/on-session-start.sh`
**Project Overview**: `.claude/CLAUDE.md`

**Learn More**:
- Official Docs: https://pruthvibhat.com/work/vibecheck-mcp/
- GitHub Repo: https://github.com/PV-Bhat/vibe-check-mcp-server
- Smithery Page: https://smithery.ai/server/@PV-Bhat/vibe-check-mcp-server

---

## 🚀 Quick Start Commands

### Check Current Rules
```javascript
mcp__pv-bhat-vibe-check-mcp-server__check_constitution()
```

### Before Major Decision
```javascript
mcp__pv-bhat-vibe-check-mcp-server__vibe_check({
  context: "What you're trying to do",
  assumptions: ["Your assumptions"],
  decision: "Your proposed approach"
})
```

### After Fixing Error
```javascript
mcp__pv-bhat-vibe-check-mcp-server__vibe_learn({
  error: "The error you encountered",
  solution: "How you fixed it",
  pattern: "General lesson learned",
  category: "typescript-strict-mode | accessibility | security | performance"
})
```

### Add Sprint Rule
```javascript
mcp__pv-bhat-vibe-check-mcp-server__update_constitution({
  rule: "RULE_NAME",
  content: "Rule description and constraints"
})
```

### Reset for New Phase
```javascript
mcp__pv-bhat-vibe-check-mcp-server__reset_constitution({
  rules: ["New phase rules"]
})
```

---

## ✅ Success Metrics

**Vibe Check prevents:**
- 🎯 40% reduction in over-engineering
- 🎯 60% fewer duplicate implementations
- 🎯 80% improvement in pattern recognition
- 🎯 50% faster onboarding for new team members
- 🎯 99.88% uptime and reliability

**Your LMS benefits:**
- ✅ Faster development (avoid duplicate work)
- ✅ Higher quality (learn from mistakes)
- ✅ Better alignment (stay focused on production)
- ✅ Fewer bugs (prevent recurring errors)
- ✅ Smoother deployment (metacognitive checkpoints)

---

**End of Quick Reference Guide v1.0**

Last Updated: 2025-10-08
Next Review: After first production deployment
