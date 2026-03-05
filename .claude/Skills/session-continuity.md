---
name: session-continuity
description: Use at the START of every implementation session to read SESSION_TRACKER.md, print current sprint/session status, and list next tasks. Also use at the END of a session to update the tracker.
---

# Session Continuity

## Overview

Cross-session state management for the Online Budget App implementation roadmap. Each session starts by reading the tracker to know where to continue, and ends by updating it with results.

## When to Use

- **Session start**: Read tracker, generate "where we left off" brief
- **Session end**: Update tracker with completed tasks, files modified, decisions made
- **Mid-session**: If pivoting or hitting blockers, update tracker immediately

## Session Start Workflow

1. Read `Online Budget app/docs/SESSION_TRACKER.md`
2. Print current sprint and session number
3. List completed sessions (summary)
4. List current session's remaining tasks
5. List any blockers or prerequisites from previous sessions
6. Read any files listed in "files to review before starting"

## Session End Workflow

1. Update `SESSION_TRACKER.md` with:
   - Tasks completed (with checkboxes)
   - Files created/modified (with paths)
   - Decisions made (rationale + alternatives rejected)
   - Blockers encountered (if any)
   - Next session prerequisites (env vars, migrations to run, etc.)
2. Run verification checks:
   - `npm run check-types` (in online app)
   - `npm run lint` (in online app)
   - `npm test` (in online app)
3. Note any failed checks in the tracker

## Tracker File Format

The tracker at `Online Budget app/docs/SESSION_TRACKER.md` uses this structure:

```markdown
# Session Tracker

## Current State
- **Current Sprint**: Sprint N — Name
- **Current Session**: SN — Name
- **Last Updated**: YYYY-MM-DD

## Completed Sessions
### Session N — Name (YYYY-MM-DD)
- [x] Task 1
- [x] Task 2
- **Files**: list of files
- **Decisions**: key decisions
- **Blockers resolved**: if any

## Current Session Tasks
- [ ] Task 1
- [ ] Task 2

## Blockers
- None / description

## Next Session Prerequisites
- What needs to happen before next session starts
```

## Key Rules

- **Never skip reading the tracker** — even if you think you know where you are
- **Update tracker before ending session** — don't rely on memory
- **Record decisions with rationale** — future sessions need to understand WHY
- **List ALL modified files** — helps with code review and rollback
- **Note failed verification checks** — next session must fix them first
