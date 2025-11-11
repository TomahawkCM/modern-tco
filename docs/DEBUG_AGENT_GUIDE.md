# 🐛 Debug Specialist Agent - User Guide

**Version**: 1.0.0
**Last Updated**: Nov 8, 2025
**Agent Type**: Standalone Specialist

---

## What is the Debug Specialist?

The **debug-specialist** is a comprehensive debugging agent designed to handle multi-domain debugging scenarios across the Modern Tanium TCO Learning Management System. It specializes in:

- ✅ **Error Analysis & Root Cause Detection** - Stack traces, runtime errors, exceptions
- ✅ **TypeScript/Type Debugging** - Type errors, compilation issues, generic types
- ✅ **Performance Debugging** - Slow components, memory leaks, optimization
- ✅ **Integration/E2E Debugging** - Test failures, browser automation, flaky tests

---

## How to Invoke the Debug Specialist

The debug-specialist is automatically spawned when you use debugging-related keywords. You don't need to explicitly request it!

### Automatic Triggers

The agent activates when your message contains keywords like:

**Error Analysis**:
- "error", "exception", "crash", "failure", "broken", "stack trace"

**TypeScript**:
- "type error", "typescript", "tsc", "type mismatch", "compilation error"

**Performance**:
- "slow", "memory leak", "bottleneck", "performance", "optimization"

**Testing**:
- "test failed", "e2e", "playwright", "integration", "flaky test"

### Examples

```
❌ Manual: "Can you spawn the debug-specialist to fix this error?"
✅ Auto: "I'm getting a type error in auth.ts"

❌ Manual: "Use the debugging agent to check why tests fail"
✅ Auto: "Playwright tests are failing on the login flow"

❌ Manual: "Activate debug-specialist for performance issue"
✅ Auto: "The dashboard is loading slowly"
```

---

## Usage Examples

### Example 1: Type Error

**Your Message:**
```
I'm getting a TypeScript error: "Type 'Promise<User>' is not assignable to type 'User'"
```

**What Happens:**
1. ✅ debug-specialist auto-spawns
2. ✅ Runs vibe-check to identify assumptions
3. ✅ Uses TypeScript diagnostics to get error details
4. ✅ Reads the affected files
5. ✅ Identifies missing `await` keyword
6. ✅ Fixes the code
7. ✅ Verifies compilation succeeds
8. ✅ Records the pattern for future prevention

**You Get:**
- Fixed code with explanation
- Updated Archon task status
- Pattern learned for next time

---

### Example 2: Test Failure

**Your Message:**
```
E2E test failing: "Expect button to be visible" - but sometimes it passes?
```

**What Happens:**
1. ✅ debug-specialist auto-spawns
2. ✅ Runs vibe-check → "Flaky = timing issue"
3. ✅ Uses Playwright to reproduce failure
4. ✅ Takes screenshots at failure point
5. ✅ Identifies missing wait condition
6. ✅ Adds proper `waitFor` logic
7. ✅ Runs test 20 times to verify stability
8. ✅ Records flakiness pattern

**You Get:**
- Stable test with proper waits
- Documentation of the fix
- Flakiness pattern learned

---

### Example 3: Performance Issue

**Your Message:**
```
The transactions page is really slow to load
```

**What Happens:**
1. ✅ debug-specialist auto-spawns
2. ✅ Runs vibe-check → "Check for unnecessary re-renders"
3. ✅ Uses Playwright to profile page load
4. ✅ Identifies component rendering all 10,000 transactions
5. ✅ Implements pagination + React.memo
6. ✅ Benchmarks improvement (5.2s → 1.1s)
7. ✅ Records optimization technique

**You Get:**
- 78% faster page load
- Detailed performance metrics
- Optimization pattern documented

---

## How the Agent Works

### Step 1: Vibe-Check (Always First) 🧠

The agent starts with a "vibe-check" to prevent common pitfalls:

```javascript
vibe_check({
  goal: "Fix TypeError in login component",
  plan: "Reproduce → analyze stack trace → fix type issue",
  uncertainties: ["Is this frontend or backend?", "Are there cascading errors?"]
})
```

**Why?** Catches assumptions before they become problems. Example:
- ❌ Assumption: "It's just a simple type fix"
- ✅ Reality: "This type error cascades to 5 other files"

### Step 2: Diagnose 🔍

Uses the right tools for the job:

| Issue Type | Tools Used | Token Cost |
|------------|-----------|------------|
| Type Error | TypeScript IDE + filesystem | ~14K |
| Runtime Error | filesystem + bash | ~11K |
| Test Failure | Playwright + filesystem | ~25K |
| Performance | Playwright + filesystem | ~25K |

### Step 3: Fix ✅

Implements minimal, targeted fixes:
- Single responsibility fixes (one issue at a time)
- Maintains type safety and code quality
- Adds tests if missing
- No over-engineering

### Step 4: Validate ✔️

Ensures the fix actually works:
- Runs relevant tests
- Checks for cascading errors
- Verifies no regressions introduced
- Benchmarks performance improvements

### Step 5: Learn 📚

Records patterns to prevent future occurrences:

```javascript
vibe_learn({
  type: "mistake",
  category: "Premature Implementation",
  mistake: "Assumed user.profile always exists",
  solution: "Added optional chaining user?.profile?.name"
})
```

---

## Integration with Archon Tasks

The debug-specialist integrates seamlessly with your project's task management:

### Automatic Task Workflow

```
1. You report a bug → Archon task created (status: "todo")
2. debug-specialist spawns → Updates task to "doing"
3. Agent investigates → Adds findings to task notes
4. Fix implemented → Updates task to "review"
5. Fix validated → Updates task to "done"
```

### Check Task Status

You can ask:
```
"What's the status of the login bug fix?"
"Show me all debugging tasks"
"What debugging tasks are in progress?"
```

The agent queries:
```javascript
find_tasks(
  project_id="9c56f01c-759a-42b1-bad4-06b71f2c4db9",
  filter_by="status",
  filter_value="doing"
)
```

---

## Best Practices for Working with the Agent

### ✅ Do This

**1. Provide clear error information:**
```
✅ "TypeError in auth.ts line 45: Cannot read property 'name' of undefined"
❌ "Login doesn't work"
```

**2. Include reproduction steps:**
```
✅ "Error occurs when user logs in without profile picture"
❌ "Sometimes there's an error"
```

**3. Mention what you've tried:**
```
✅ "I added optional chaining but still getting the error"
❌ "I tried stuff but nothing worked"
```

**4. Share relevant context:**
```
✅ "This started after upgrading to Next.js 16"
❌ "It broke"
```

### ❌ Avoid This

**1. Vague descriptions:**
```
❌ "Things are broken"
✅ "Dashboard throws 'Cannot read properties of undefined' when loading"
```

**2. Multiple unrelated bugs:**
```
❌ "Fix the type error, slow dashboard, and failed test"
✅ "Fix the type error in auth.ts" (one at a time)
```

**3. Requesting specific tools:**
```
❌ "Use playwright to debug this type error"
✅ "Type error in Button component" (let agent choose tools)
```

---

## Real-World Debugging Scenarios

### Scenario 1: "Why does my test fail randomly?"

**Your Message:**
```
My Playwright test for budget creation fails about 30% of the time
```

**Agent Response:**
```
I'll debug this flaky test issue. Let me start with a vibe-check...

[Runs vibe-check: "Flakiness usually indicates timing/race conditions"]

[Uses Playwright to run test 10 times]
Result: 3 failures out of 10 runs

[Takes screenshot at failure point]
Finding: Page is still loading when assertion runs

[Analyzes test code]
Issue: Missing wait condition after form submission

[Implements fix]
Added: await page.waitForLoadState('networkidle')

[Validates fix]
Ran test 20 times: 20/20 passes ✓

Test is now stable!
```

---

### Scenario 2: "Type error after upgrading packages"

**Your Message:**
```
After upgrading to React 19, getting type errors in useEffect dependencies
```

**Agent Response:**
```
I'll investigate the React 19 type compatibility issue...

[Runs vibe-check: "Check for breaking changes in React 19 types"]

[Uses TypeScript diagnostics]
Found 12 type errors in 6 files

[Analyzes pattern]
Common issue: React 19 strictened useEffect dependency types

[Researches solution]
[Searches knowledge base for React 19 migration patterns]

[Implements fix]
Added proper dependency types using React 19 conventions

[Verifies compilation]
✓ All type errors resolved

Would you like me to check the other 11 instances?
```

---

### Scenario 3: "Dashboard loading too slow"

**Your Message:**
```
Dashboard takes 8+ seconds to load with 500 transactions
```

**Agent Response:**
```
I'll profile and optimize the dashboard performance...

[Runs vibe-check: "Check for unnecessary re-renders and data fetching"]

[Uses Playwright to profile]
Baseline: 8.3s load time
Main bottleneck: TransactionList component (7.9s)

[Analyzes component code]
Issues found:
1. No pagination (rendering all 500 items)
2. Missing React.memo
3. Inline filter/sort functions causing re-renders

[Implements optimizations]
1. Added pagination (50 items per page)
2. Wrapped with React.memo()
3. Memoized filter/sort with useMemo

[Benchmarks improvement]
New load time: 1.4s (83% faster!)

Performance optimized ✓
```

---

## Token Budget & Performance

The debug-specialist is designed to be efficient:

### Typical Token Usage

| Debugging Type | Token Cost | Time Estimate |
|----------------|-----------|---------------|
| Simple error fix | ~11K | < 15 min |
| Type error | ~14K | 15-30 min |
| Test failure | ~25K | 30-60 min |
| Performance issue | ~25-33K | 1-2 hours |
| Complex multi-domain | ~67K | 2-4 hours |

### Why vibe-check is Always Used (2K tokens)

While it costs 2K tokens, vibe-check typically **saves** 10-50K tokens by:
- Preventing wrong assumptions that lead to rework
- Identifying root causes instead of symptoms
- Breaking tunnel vision early
- Catching cascading error potential

**Example:**
- ❌ Without vibe-check: Fix symptom (5K) → Creates new error (8K) → Fix again (7K) → **Total: 20K**
- ✅ With vibe-check: Identify root cause (2K) → Fix correctly (5K) → **Total: 7K**

---

## Collaboration with Other Agents

The debug-specialist works alongside other agents when needed:

### When Multiple Agents Collaborate

**React-specific bugs:**
```
debug-specialist + react-specialist
```

**Security vulnerabilities:**
```
debug-specialist + security-engineer
```

**Database performance:**
```
debug-specialist + database-architect + performance-engineer
```

**Test strategy:**
```
debug-specialist + test-automator + qa-engineer
```

### Escalation to Senior Agents

For complex issues, the debug-specialist escalates to:
- **system-architect** - System-wide architectural changes
- **senior-developer** - Critical production bugs
- **hierarchical-coordinator** - Multi-system failures

---

## Frequently Asked Questions

### Q: Do I need to request the debug-specialist explicitly?
**A:** No! It auto-spawns when you mention debugging keywords. Just describe your problem naturally.

### Q: Can I use the debug-specialist for multiple bugs at once?
**A:** Best to focus on one bug at a time for faster, more accurate fixes. Report multiple bugs separately.

### Q: What if the agent doesn't fix the bug?
**A:** The agent will:
1. Document findings in the Archon task
2. Escalate to senior agents if needed
3. Request more information from you if context is missing

### Q: How do I check what the agent is doing?
**A:** The agent provides status updates throughout:
- "Running vibe-check to identify assumptions..."
- "Profiling page performance with Playwright..."
- "Analyzing type errors..."
- "Implementing fix and validating..."

### Q: Can I override the agent's tool selection?
**A:** The agent uses optimal tools automatically. If you have concerns, mention them:
```
"Can you check database performance too?"
"This might be a browser-specific issue"
```

### Q: What happens to learned patterns?
**A:** Patterns are stored and used to:
- Prevent similar errors in future sessions
- Suggest proactive fixes
- Improve debugging speed over time

---

## Quick Reference

### Common Debugging Phrases

| Your Message | What Happens |
|--------------|--------------|
| "Type error in..." | TypeScript debugging workflow |
| "Test failing..." | E2E/integration debugging |
| "Slow loading..." | Performance profiling & optimization |
| "Error when..." | Error analysis & root cause detection |
| "Why doesn't... work?" | Full diagnostic investigation |

### Expected Response Time

| Complexity | Diagnosis | Fix | Total |
|------------|-----------|-----|-------|
| Simple | 2-5 min | 5-10 min | ~15 min |
| Moderate | 10-20 min | 20-40 min | ~1 hour |
| Complex | 30-60 min | 1-3 hours | ~4 hours |

### Success Indicators

You'll know debugging succeeded when:
- ✅ Error is resolved and explained
- ✅ Tests pass consistently
- ✅ No new errors introduced
- ✅ Performance metrics improved (if applicable)
- ✅ Archon task marked "done"
- ✅ Pattern learned for future prevention

---

## Getting Help

If you need assistance with the debug-specialist:

1. **Check Archon tasks:** `find_tasks(filter_by="status", filter_value="doing")`
2. **Ask for status:** "What debugging tasks are in progress?"
3. **Request escalation:** "This seems complex, can you escalate to senior developer?"
4. **Report issues:** File an issue in the project repository with "debug-specialist" tag

---

## Related Documentation

- [Agent Integration Guide](../docs/AGENT_INTEGRATION_GUIDE.md)
- [Debugging Workflows](./.claude/agents/debugging-workflows.md)
- [Tool Access Matrix](./.claude/agents/debug-specialist-tools.json)
- [Agent Routing Config](./.claude/agent-routing-config.json)

---

**End of Debug Specialist User Guide**

For technical implementation details, see the agent profile at:
`.claude/agents/debug-specialist-profile.json`
