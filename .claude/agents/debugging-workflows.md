---
name: debugging-workflows
description: Comprehensive debugging workflows for the debug-specialist agent
version: 1.0.0
---

# 🐛 Debug Specialist - Comprehensive Debugging Workflows

**Agent**: debug-specialist
**Version**: 1.0.0
**Last Updated**: Nov 8, 2025

---

## Overview

This document defines the comprehensive debugging workflows for the `debug-specialist` agent. All workflows follow the principle: **vibe-check → diagnose → fix → validate → learn**.

---

## Core Workflow Principles

### 1. Mandatory vibe-check First
- **Why**: Prevents tunnel vision, identifies hidden assumptions, breaks cascading error patterns
- **Cost**: 2K tokens (always worth it)
- **Never skip**: Even for "obvious" bugs

### 2. Minimal Viable Toolset
- Use only the tools necessary for the specific debugging scenario
- Token budget awareness: Aim for <32K per debugging session when possible

### 3. Archon Integration
- Always query for debugging tasks: `find_tasks(project_id="9c56f01c-759a-42b1-bad4-06b71f2c4db9", filter_by="status", filter_value="todo")`
- Update task status throughout: `todo → doing → review → done`
- Assign to debug-specialist: `manage_task("update", task_id="...", assignee="debug-specialist", status="doing")`

### 4. Pattern Learning
- Use `vibe_learn` to record recurring patterns and solutions
- Categories: "Complex Solution Bias", "Premature Implementation", "Misalignment", etc.

---

## Workflow 1: Error Analysis & Root Cause Detection

### Trigger Keywords
`error`, `exception`, `crash`, `failure`, `broken`, `stack trace`

### Tool Stack (Total: ~13K)
- vibe-check (2K)
- filesystem (9K)
- grep/bash (minimal)

### Workflow Steps

```
1. VIBE-CHECK (2K tokens)
   → Identify assumptions about the error
   → Check for tunnel vision on obvious symptoms
   → Consider cascading error scenarios

2. REPRODUCE & ANALYZE
   → Read error logs/stack traces (filesystem)
   → Identify error location in code
   → Trace execution path to root cause
   → Check for similar errors in history (vibe-check may reveal patterns)

3. DIAGNOSE ROOT CAUSE
   → Is this a symptom or the actual problem?
   → Are there hidden dependencies?
   → What changed recently? (git log if needed)

4. PROPOSE FIX
   → Minimal change principle
   → Consider edge cases
   → Ensure fix doesn't introduce new errors

5. IMPLEMENT & TEST
   → Make code changes (filesystem)
   → Run relevant tests (bash)
   → Verify error resolved

6. VALIDATE & LEARN
   → Confirm no cascading errors
   → Update task status: review → done
   → vibe_learn if pattern identified
```

### Example Scenario

**User**: "Getting undefined error when users log in"

```typescript
// Workflow execution:
1. vibe_check(
     goal="Fix login undefined error",
     plan="Reproduce → analyze stack trace → identify null/undefined source → fix"
   )
   // vibe-check might reveal: "Are you assuming user data is always present?"

2. filesystem: Read src/auth/login.ts
   // Find: const userName = user.profile.name (no optional chaining)

3. Root cause: user.profile can be null for new users

4. Fix: const userName = user?.profile?.name ?? "Guest"

5. Test: npm test auth.spec.ts

6. vibe_learn(
     type="mistake",
     category="Premature Implementation",
     mistake="Assumed user.profile always exists",
     solution="Added optional chaining and fallback"
   )
```

---

## Workflow 2: TypeScript/Type System Debugging

### Trigger Keywords
`type error`, `typescript`, `tsc`, `type mismatch`, `compilation error`

### Tool Stack (Total: ~14K)
- vibe-check (2K)
- ide (3K)
- filesystem (9K)

### Workflow Steps

```
1. VIBE-CHECK (2K tokens)
   → Check assumptions about type expectations
   → Identify potential type system misunderstandings
   → Consider generic/complex type implications

2. GET DIAGNOSTICS (3K tokens)
   → Run IDE diagnostics on affected files
   → Collect all type errors (not just first one)
   → Identify error patterns (same root cause?)

3. ANALYZE TYPE CONFLICTS
   → Read affected files (filesystem)
   → Trace type definitions to source
   → Check for:
     - Missing/incorrect type imports
     - Generic type mismatches
     - Incompatible interface extensions
     - Incorrect type assertions

4. FIX TYPE ERRORS
   → Update type definitions
   → Add missing generics
   → Fix type assertions
   → Consider strictness implications

5. VERIFY COMPILATION
   → Run tsc --noEmit (bash)
   → Ensure no cascading type errors
   → Check that fix maintains type safety

6. UPDATE & LEARN
   → Mark task complete
   → Record complex type patterns
```

### Example Scenario

**User**: "Type error in api-client.ts: Type 'Response<User>' is not assignable to 'User'"

```typescript
// Workflow execution:
1. vibe_check(
     goal="Fix type mismatch in API client",
     plan="Get diagnostics → analyze types → fix generic mismatch"
   )
   // vibe-check reveals: "Are you unwrapping the Response type correctly?"

2. ide.diagnostics("src/api/api-client.ts")
   // Output: Multiple generic type mismatches in fetch wrappers

3. filesystem: Read api-client.ts + types.ts
   // Find: async function getUser(): Promise<Response<User>>
   // Used as: const user: User = await getUser()

4. Root cause: Missing .data property unwrap

5. Fix: const user: User = (await getUser()).data

6. bash: npx tsc --noEmit
   // Verify: ✓ Compilation successful

7. vibe_learn(
     type="mistake",
     category="Complex Solution Bias",
     mistake="Forgot to unwrap generic Response<T> wrapper",
     solution="Added .data property access"
   )
```

---

## Workflow 3: Performance Debugging

### Trigger Keywords
`slow`, `memory leak`, `bottleneck`, `performance`, `optimization`

### Tool Stack (Total: ~25K)
- vibe-check (2K)
- playwright (14K)
- filesystem (9K)
- postgresql (optional, +8K)

### Workflow Steps

```
1. VIBE-CHECK (2K tokens)
   → What are assumptions about the bottleneck?
   → Are you optimizing the right thing?
   → Will this fix introduce other issues?

2. PROFILE & MEASURE
   → Use playwright to profile page/component
   → Record baseline metrics
   → Identify specific slow operations

3. ANALYZE BOTTLENECKS
   → React: Unnecessary re-renders? (React DevTools profiler)
   → Network: Too many requests? Slow queries?
   → Memory: Leaks? Large data structures?
   → Bundle: Unnecessary imports?

4. READ RELEVANT CODE
   → Focus on identified bottleneck areas
   → Check for common anti-patterns:
     - Missing useMemo/useCallback
     - Large inline objects/arrays
     - N+1 database queries
     - Unoptimized images/assets

5. IMPLEMENT OPTIMIZATIONS
   → Apply targeted fixes
   → One optimization at a time
   → Measure improvement for each

6. BENCHMARK & VERIFY
   → Re-run profiling
   → Compare before/after metrics
   → Ensure no regressions

7. DOCUMENT & LEARN
   → Note optimization techniques
   → Record improvement metrics
   → Update task with results
```

### Example Scenario

**User**: "Dashboard loading slowly (5+ seconds)"

```typescript
// Workflow execution:
1. vibe_check(
     goal="Optimize dashboard load time",
     plan="Profile → identify bottleneck → optimize → benchmark"
   )
   // vibe-check suggests: "Check if you're re-fetching data unnecessarily"

2. playwright: Profile /dashboard page load
   // Metrics: 5.2s total, 4.8s in TransactionList component

3. filesystem: Read src/components/TransactionList.tsx
   // Find: useEffect(() => { fetchTransactions() }, []) - runs on every render!
   // Missing React.memo wrapper

4. Root causes:
   - Missing dependency array in useEffect
   - No memoization on expensive list component
   - Fetching all transactions instead of paginated

5. Optimizations:
   a) Add React.memo(TransactionList)
   b) Fix useEffect dependencies
   c) Implement pagination (limit 50 items)
   d) Add useMemo for filtered/sorted data

6. playwright: Re-profile page load
   // New metrics: 1.1s total (78% improvement!)

7. vibe_learn(
     type="success",
     category="Performance",
     mistake="Dashboard rendered all transactions without pagination or memoization",
     solution="Added React.memo, pagination, and useMemo - reduced load time by 78%"
   )
```

---

## Workflow 4: Integration/E2E Test Debugging

### Trigger Keywords
`test failed`, `e2e`, `playwright`, `integration`, `flaky test`

### Tool Stack (Total: ~16K)
- vibe-check (2K)
- playwright (14K)
- filesystem (optional, +9K if code fixes needed)

### Workflow Steps

```
1. VIBE-CHECK (2K tokens)
   → What assumptions about test reliability?
   → Is this flakiness or a real bug?
   → Could timing/race conditions be involved?

2. REPRODUCE FAILURE
   → Run test multiple times
   → Identify failure pattern (always/intermittent)
   → Capture screenshots/videos at failure point

3. ANALYZE TEST CODE & LOGS
   → Read test file
   → Check for:
     - Hard-coded waits (bad)
     - Missing waitFor conditions
     - Incorrect selectors
     - Timing assumptions
     - Environment dependencies

4. DIAGNOSE ROOT CAUSE
   → Test code issue? (selector, assertion, timing)
   → Application code issue? (real bug)
   → Environment issue? (data, config)

5. FIX THE ISSUE
   For test code:
   - Add proper waitFor conditions
   - Use data-testid selectors
   - Remove hard-coded timeouts

   For app code:
   - Fix the actual bug (follow error workflow)
   - Ensure deterministic behavior

6. VERIFY FIX
   → Run test 10+ times
   → Should pass consistently
   → Check for other affected tests

7. LEARN PATTERNS
   → Record flakiness causes
   → Document best practices
```

### Example Scenario

**User**: "Playwright test failing intermittently on login flow"

```typescript
// Workflow execution:
1. vibe_check(
     goal="Fix flaky login test",
     plan="Reproduce → analyze timing → fix race condition"
   )
   // vibe-check reveals: "Flaky = timing issue. Check for race conditions"

2. playwright: Run test 10 times
   // Result: 6 passes, 4 failures (60% success rate)
   // Failure point: "Expect 'Welcome' to be visible"

3. playwright: Take screenshot at failure
   // Screenshot shows: Page still loading, spinner visible

4. filesystem: Read tests/auth.spec.ts
   // Find:
   await page.click('[data-testid="login-button"]')
   await expect(page.getByText('Welcome')).toBeVisible() // ❌ No wait!

5. Root cause: Test expects immediate navigation, but app has loading state

6. Fix: Add proper wait condition
   await page.click('[data-testid="login-button"]')
   await page.waitForLoadState('networkidle') // ✓ Wait for loading
   await expect(page.getByText('Welcome')).toBeVisible()

7. playwright: Run test 20 times
   // Result: 20/20 passes ✓

8. vibe_learn(
     type="mistake",
     category="Flaky Test",
     mistake="Missing wait condition after login click",
     solution="Added waitForLoadState('networkidle') before assertion"
   )
```

---

## Cross-Domain Debugging Scenarios

### Scenario: "Login works but throws console error"
**Domains**: Error Analysis + TypeScript + E2E

```
1. vibe-check → Check if error is ignorable or critical
2. playwright: Capture console errors during login
3. filesystem: Read component throwing error
4. ide: Check for type issues if TypeScript related
5. Fix error at source
6. playwright: Verify no console errors
7. vibe-learn: Record error pattern
```

### Scenario: "API endpoint slow AND returning type errors"
**Domains**: Performance + TypeScript + Error Analysis

```
1. vibe-check → Prioritize: fix error first or performance?
2. ide: Get type errors on API response
3. filesystem: Check API types and implementation
4. postgresql: Profile database query performance
5. Fix type mismatch in API contract
6. Optimize slow query (add index/limit)
7. Benchmark improvement
8. vibe-learn: Record both fixes
```

---

## Best Practices Summary

### Always Do ✅
1. Start with vibe-check (no exceptions)
2. Reproduce the issue before fixing
3. Use minimal viable toolset
4. Update Archon task status throughout
5. Validate fixes with tests
6. Use vibe_learn for patterns
7. Document complex solutions

### Never Do ❌
1. Skip vibe-check to "save time"
2. Guess at fixes without diagnosis
3. Use all tools "just in case" (token waste)
4. Fix without reproducing first
5. Assume fix works without testing
6. Leave tasks in "doing" status
7. Ignore cascading error potential

### Tool Selection Quick Reference

| Debugging Type | Tools | Token Cost |
|----------------|-------|------------|
| Error messages | vibe-check + filesystem | ~11K |
| Type errors | vibe-check + ide + filesystem | ~14K |
| Performance | vibe-check + playwright + filesystem | ~25K |
| Test failures | vibe-check + playwright | ~16K |
| Database slow | vibe-check + postgresql + filesystem | ~19K |
| Full debugging | All tools | ~67K |

---

## Integration with Other Agents

### Escalation Paths

**When to collaborate:**
- Complex React issues → `react-specialist`
- Security concerns → `security-engineer`
- Database schema → `database-architect`
- Performance optimization → `performance-engineer`
- Test strategy → `test-automator`

**When to escalate:**
- System architecture changes needed → `system-architect`
- Critical production bugs → `senior-developer`
- Multi-system failures → `hierarchical-coordinator`

### Handoff Protocol

```
1. Document findings in Archon task notes
2. Tag appropriate specialist in task
3. Provide context: reproduction steps, analysis, attempted fixes
4. Update task assignee
5. Remain available for questions
```

---

## Metrics & Continuous Improvement

### Track for Each Debugging Session
- Time to diagnosis
- Time to fix
- Number of tools used
- Token consumption
- Fix success rate (did it work first time?)
- Cascading errors introduced (should be 0)

### Success Criteria
- **Fast**: Simple bugs < 15min, Complex < 4hrs
- **Accurate**: Root cause identified, not just symptoms
- **Complete**: Tests pass, no regressions
- **Learned**: Pattern recorded if applicable

---

**End of Debugging Workflows Documentation**

For implementation details, see:
- `.claude/agents/debug-specialist-profile.json` - Agent definition
- `.claude/agent-routing-config.json` - Auto-spawn triggers
- `docs/DEBUG_AGENT_GUIDE.md` - User-facing guide
