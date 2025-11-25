---
name: debug-archon-integration
description: Archon integration guide for the debug-specialist agent
version: 1.0.0
---

# 🔗 Debug Specialist - Archon Integration Guide

**Agent**: debug-specialist
**Project ID**: `9c56f01c-759a-42b1-bad4-06b71f2c4db9`
**Version**: 1.0.0
**Last Updated**: Nov 8, 2025

---

## Overview

This document describes how the `debug-specialist` agent integrates with the Archon project management and knowledge base system. Archon MCP provides task tracking, documentation, and cross-session learning for debugging workflows.

---

## Archon MCP Tools Available

The debug-specialist has access to the following Archon tools:

### Task Management (6 tools)
- `find_tasks` - Query debugging tasks
- `manage_task` - Create, update, delete tasks
- `find_projects` - Get project information
- `manage_project` - Project operations
- `find_documents` - Search documentation
- `manage_document` - Document operations

### Knowledge Base (4 tools)
- `rag_get_available_sources` - List documentation sources
- `rag_search_knowledge_base` - Search for solutions
- `rag_search_code_examples` - Find code patterns
- `rag_read_full_page` - Read complete documentation

### Version Control (2 tools)
- `find_versions` - View version history
- `manage_version` - Create/restore versions

---

## Mandatory Task Workflow

Every debugging session follows this Archon-integrated workflow:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. VIBE-CHECK (Mandatory)                                   │
│    → Identify assumptions, prevent cascading errors         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. GET DEBUGGING TASK                                       │
│    find_tasks(project_id="9c56f01c...", query="bug...")     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. UPDATE STATUS: todo → doing                              │
│    manage_task("update",                                    │
│      task_id="...",                                         │
│      assignee="debug-specialist",                           │
│      status="doing")                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. SEARCH KNOWLEDGE BASE (Optional)                         │
│    rag_search_knowledge_base(query="similar error")         │
│    → Find similar bugs and solutions from past sessions     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. EXECUTE DEBUGGING WORKFLOW                               │
│    → Run appropriate domain-specific workflow               │
│    → Document findings in task notes                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. UPDATE STATUS: doing → review                            │
│    manage_task("update",                                    │
│      task_id="...",                                         │
│      status="review")                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. VALIDATE FIX                                             │
│    → Run tests, verify no regressions                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. UPDATE STATUS: review → done                             │
│    manage_task("update",                                    │
│      task_id="...",                                         │
│      status="done")                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. LEARN PATTERN (if applicable)                            │
│    vibe_learn(mistake="...", solution="...", category="...") │
└─────────────────────────────────────────────────────────────┘
```

---

## Task Management Integration

### Finding Debugging Tasks

**Get all debugging tasks:**
```javascript
find_tasks(
  project_id="9c56f01c-759a-42b1-bad4-06b71f2c4db9",
  query="bug error debug fix"
)
```

**Get tasks by status:**
```javascript
// Get pending debugging tasks
find_tasks(
  project_id="9c56f01c-759a-42b1-bad4-06b71f2c4db9",
  filter_by="status",
  filter_value="todo"
)

// Get currently active debugging
find_tasks(
  project_id="9c56f01c-759a-42b1-bad4-06b71f2c4db9",
  filter_by="status",
  filter_value="doing"
)
```

**Get specific task by ID:**
```javascript
find_tasks(
  project_id="9c56f01c-759a-42b1-bad4-06b71f2c4db9",
  task_id="550e8400-e29b-41d4-a716-446655440000"
)
```

### Creating Debugging Tasks

**Create new debugging task:**
```javascript
manage_task("create",
  project_id="9c56f01c-759a-42b1-bad4-06b71f2c4db9",
  title="Fix TypeError in login component",
  description="User reports 'Cannot read property name of undefined' when logging in without profile picture. Reproduction steps: 1. Create user without profile 2. Attempt login 3. Error occurs.",
  assignee="debug-specialist",
  status="todo",
  feature="authentication"
)
```

### Updating Task Status

**Claim task and start work:**
```javascript
manage_task("update",
  task_id="550e8400-e29b-41d4-a716-446655440000",
  assignee="debug-specialist",
  status="doing"
)
```

**Mark for review:**
```javascript
manage_task("update",
  task_id="550e8400-e29b-41d4-a716-446655440000",
  status="review",
  description="Fixed TypeError by adding optional chaining: user?.profile?.name ?? 'Guest'. Added unit tests for null profile scenario. All tests passing."
)
```

**Complete task:**
```javascript
manage_task("update",
  task_id="550e8400-e29b-41d4-a716-446655440000",
  status="done"
)
```

---

## Knowledge Base Integration

### Searching for Similar Bugs

**Before starting debugging, search for similar issues:**
```javascript
// Search for similar error patterns
rag_search_knowledge_base(
  query="TypeError undefined profile",
  match_count=5
)

// Expected response:
{
  "success": true,
  "results": [
    {
      "page_id": "...",
      "url": "...",
      "title": "Handling Optional User Properties",
      "preview": "Use optional chaining for user.profile access...",
      "chunk_matches": 3
    }
  ],
  "reranked": true
}
```

### Searching for Code Examples

**Find code patterns for the fix:**
```javascript
rag_search_code_examples(
  query="optional chaining React TypeScript",
  match_count=3
)

// Expected response:
{
  "success": true,
  "results": [
    {
      "content": "const userName = user?.profile?.name ?? 'Guest';",
      "summary": "Safe property access with fallback",
      "language": "typescript"
    }
  ]
}
```

### Reading Complete Documentation

**After finding relevant page, read full content:**
```javascript
rag_read_full_page(
  page_id="550e8400-e29b-41d4-a716-446655440000"
)

// Returns full page content with code examples
```

---

## Vibe-Check Integration

### Mandatory vibe-check Before Every Debugging Session

**Standard vibe-check call:**
```javascript
vibe_check({
  goal: "Fix TypeError in login component",
  plan: "1. Reproduce error 2. Analyze stack trace 3. Add optional chaining 4. Test fix",
  uncertainties: [
    "Is this the only place user.profile is accessed unsafely?",
    "Are there other components with similar pattern?"
  ],
  userPrompt: "User getting error when logging in"
})
```

**vibe-check prevents common pitfalls:**
- ✅ Identifies hidden assumptions ("profile always exists")
- ✅ Reveals cascading errors ("5 other files use same pattern")
- ✅ Breaks tunnel vision ("fix symptom vs root cause")
- ✅ Suggests comprehensive solutions

### Pattern Learning with vibe-learn

**Record debugging patterns for future prevention:**
```javascript
vibe_learn({
  type: "mistake",
  category: "Premature Implementation",
  mistake: "Assumed user.profile always exists without null checking",
  solution: "Added optional chaining user?.profile?.name with 'Guest' fallback"
})

vibe_learn({
  type: "success",
  category: "Performance",
  mistake: "Dashboard rendered all 10,000 transactions without pagination",
  solution: "Added pagination (50/page) + React.memo + useMemo - 78% faster"
})
```

**Categories:**
- `Complex Solution Bias` - Over-engineering when simple fix would work
- `Feature Creep` - Adding unnecessary features while debugging
- `Premature Implementation` - Implementing without full diagnosis
- `Misalignment` - Fix doesn't address actual root cause
- `Overtooling` - Using too many tools/dependencies
- `Preference` - User preference or style choice
- `Success` - Successful optimization or fix worth repeating
- `Other` - Other patterns

---

## Document Management

### Creating Debugging Documentation

**Document complex debugging sessions:**
```javascript
manage_document("create",
  project_id="9c56f01c-759a-42b1-bad4-06b71f2c4db9",
  title="Authentication TypeError Resolution Guide",
  document_type="guide",
  content: {
    "issue": "TypeError when accessing user.profile without null check",
    "solution": "Use optional chaining and fallback values",
    "codeExample": "const name = user?.profile?.name ?? 'Guest';",
    "testCase": "it('handles missing profile', () => { ... })"
  },
  tags: ["authentication", "typescript", "debugging", "null-safety"],
  author: "debug-specialist"
)
```

### Searching Debugging Documentation

**Find existing debugging guides:**
```javascript
find_documents(
  project_id="9c56f01c-759a-42b1-bad4-06b71f2c4db9",
  query="authentication error",
  document_type="guide"
)
```

---

## Cross-Session Learning

### How Archon Enables Learning Across Sessions

**Session 1: Bug discovered and fixed**
```javascript
1. vibe_check → "Check for null/undefined assumptions"
2. Fix bug with optional chaining
3. vibe_learn → Record pattern
4. Archon stores in knowledge base
```

**Session 2: Similar bug appears**
```javascript
1. vibe_check → Recalls previous pattern!
2. rag_search_knowledge_base → Finds Session 1 solution
3. Apply proven fix immediately
4. Faster resolution (5 min vs 30 min)
```

**Session 3: Proactive prevention**
```javascript
1. New component being created
2. vibe_check → "Remember to use optional chaining for user.profile"
3. Bug prevented before it occurs!
```

---

## Complete Example: Full Debugging Session

### Scenario: Flaky E2E Test

**Step 1: vibe-check**
```javascript
vibe_check({
  goal: "Fix flaky login E2E test",
  plan: "Reproduce failure → analyze timing → add proper waits → verify stability",
  uncertainties: ["Is this a timing issue or actual bug?", "Are other tests affected?"]
})
// Response: "Flakiness typically indicates race conditions. Check for missing wait conditions."
```

**Step 2: Get task from Archon**
```javascript
find_tasks(
  project_id="9c56f01c-759a-42b1-bad4-06b71f2c4db9",
  query="flaky test login"
)
// Returns: task_id="abc-123", title="Fix flaky login test", status="todo"
```

**Step 3: Claim task**
```javascript
manage_task("update",
  task_id="abc-123",
  assignee="debug-specialist",
  status="doing"
)
```

**Step 4: Search knowledge base**
```javascript
rag_search_knowledge_base(
  query="flaky test playwright wait",
  match_count=3
)
// Finds: Previous solution used waitForLoadState('networkidle')
```

**Step 5: Search code examples**
```javascript
rag_search_code_examples(
  query="playwright waitForLoadState",
  match_count=2
)
// Returns: await page.waitForLoadState('networkidle')
```

**Step 6: Execute debugging workflow**
```
[Uses playwright to reproduce issue 10 times: 4 failures]
[Takes screenshots at failure point]
[Analyzes test code: Missing wait after click]
[Implements fix: Adds waitForLoadState]
[Validates: Runs 20 times, all pass]
```

**Step 7: Mark for review**
```javascript
manage_task("update",
  task_id="abc-123",
  status="review",
  description="Fixed flaky test by adding await page.waitForLoadState('networkidle') after login button click. Validated with 20 consecutive successful runs."
)
```

**Step 8: Validate fix**
```
[Runs full test suite: All pass]
[No regressions introduced]
```

**Step 9: Mark done**
```javascript
manage_task("update",
  task_id="abc-123",
  status="done"
)
```

**Step 10: Learn pattern**
```javascript
vibe_learn({
  type: "mistake",
  category: "Flaky Test",
  mistake: "Login test missing waitForLoadState after click, causing race condition",
  solution: "Added await page.waitForLoadState('networkidle') before assertions"
})
```

---

## Best Practices

### ✅ Always Do

1. **Start with vibe-check** - No exceptions
2. **Query tasks before starting** - Know what needs debugging
3. **Update status throughout** - Keep Archon in sync
4. **Search knowledge base** - Learn from past solutions
5. **Document complex fixes** - Help future sessions
6. **Use vibe-learn** - Record patterns
7. **Mark tasks complete** - Don't leave tasks hanging

### ❌ Never Do

1. **Skip vibe-check** - Even for "obvious" bugs
2. **Start debugging without task** - Always get or create task
3. **Leave status as 'doing'** - Update to review/done
4. **Ignore knowledge base** - May have solved this before
5. **Skip vibe-learn** - Patterns help prevent future bugs
6. **Work on multiple tasks** - One debugging task at a time

---

## Metrics & Tracking

### What Archon Tracks Automatically

- Debugging session duration
- Tools used per session
- Success rate (first fix vs iterations)
- Pattern recurrence (same bugs)
- Agent effectiveness
- Cross-session learning improvements

### Performance Goals

| Metric | Target |
|--------|--------|
| Time to diagnosis | < 30% of total session |
| First-fix success rate | > 80% |
| Knowledge base usage | Every session |
| Pattern learning rate | > 50% of sessions |
| Task status accuracy | 100% |

---

## Troubleshooting Archon Integration

### Common Issues

**Issue: "Task not found"**
```javascript
// Solution: Verify project ID is correct
const PROJECT_ID = "9c56f01c-759a-42b1-bad4-06b71f2c4db9"; // Always use this
```

**Issue: "Cannot update task status"**
```javascript
// Solution: Ensure task_id exists and is valid UUID
find_tasks(task_id="your-task-id") // Verify task exists first
```

**Issue: "No results from knowledge base"**
```javascript
// Solution: Use 2-5 focused keywords, not long sentences
❌ rag_search_knowledge_base(query="how to fix TypeError when user profile is undefined")
✅ rag_search_knowledge_base(query="TypeError profile undefined")
```

**Issue: "vibe-check not providing useful insights"**
```javascript
// Solution: Provide more context in uncertainties
vibe_check({
  goal: "...",
  plan: "...",
  uncertainties: [
    "Specific technical uncertainty",
    "What I'm unsure about",
    "Potential cascading effects"
  ]
})
```

---

## Related Documentation

- [Debug Specialist Profile](./.claude/agents/debug-specialist-profile.json)
- [Debugging Workflows](./.claude/agents/debugging-workflows.md)
- [Tool Access Matrix](./.claude/agents/debug-specialist-tools.json)
- [User Guide](../docs/DEBUG_AGENT_GUIDE.md)

---

**End of Archon Integration Guide**

For Archon MCP documentation, see: `CLAUDE.md` (Archon Task Management Protocol section)
