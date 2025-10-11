# Claude Code Configuration - Modern Tanium TCO Learning Management System

## 🎯 CURRENT MISSION

**Enterprise LMS for Tanium TCO Certification**

- **Status**: Learning science complete (32h), content needs population
- **Stack**: Next.js 15.5.2 + TypeScript + Supabase + shadcn/ui
- **Content**: 11.6h MDX modules (6 modules, 16,849 lines) + 200+ questions
- **Features**: Spaced repetition, gamification, video analytics, interactive labs, mock exams

**Key Assets**:
- ✅ 83 micro-sections with Learn→Test→Review flow
- ✅ 2357 spaced repetition system with adaptive difficulty
- ✅ 27 badges, 6 levels, points system
- ✅ Video milestone tracking, interactive labs
- ✅ Full mock exams (75 questions, 105min timer)

**Production Priorities**:
1. Content population (videos, questions, lab certificates)
2. Integration testing & performance optimization
3. Deployment & monitoring setup

See `FINAL_COMPLETION_SUMMARY.md` for complete implementation details.

---

## 🏗️ ENTERPRISE ARCHITECTURE

**Core Infrastructure**:
- **Next.js 15.5.2** with App Router
- **TypeScript 5.9.2** with strict type safety
- **Supabase PostgreSQL** with RLS & real-time
- **shadcn/ui + Radix UI** for accessible components
- **11+ React Contexts** for state management
- **PostHog Analytics** for user behavior tracking

**Anthropic AI Integration**:
- @anthropic-ai/sdk (v0.60.0) for Claude API
- Dynamic question generation from Tanium docs
- Personalized learning paths
- Performance prediction & content optimization

---

## 🤖 AGENT SYSTEM

**Available**: 240+ specialized agents (54 Core Claude Flow + 186 Enterprise LMS specialists)

**Key Agent Types**:
- React/TypeScript (12): react-specialist, typescript-pro, state-management-expert
- Enterprise LMS (15): tco-content-specialist, assessment-engine-specialist, video-system-architect
- Database (20): database-architect, supabase-specialist, rls-policy-designer
- Testing (25): test-automator, playwright-specialist, accessibility-tester
- Performance (18): performance-engineer, bundle-analyzer, lighthouse-optimizer

**Auto-Spawn Patterns**:
- UI work → react-specialist, typescript-pro, shadcn-specialist
- Database → database-architect, supabase-specialist, security-engineer
- Testing → test-automator, e2e-specialist, qa-engineer

See `.claude/agent-routing-config.json` for complete agent documentation.

---

## 🔧 MCP SERVER CONFIGURATION

**11 Servers (~118-147K tokens available)**:

1. **shadcn** (7 tools, ~5K) - Component management
2. **filesystem** (14 tools, ~9K) - File operations
3. **claude-flow** (90 tools, ~52K) - Multi-agent orchestration ⚠️
4. **sqlite-tanium** (8 tools, ~3K) - Local database
5. **github** (26 tools, ~18K) - Git/repository ops
6. **firecrawl** (6 tools, ~8K) - Web scraping
7. **playwright** (21 tools, ~14K) - Browser automation
8. **postgresql** (3 tools, ~8K) - Production database
9. **vibe-check** (5 tools, ~2K) - Error prevention
10. **context7** (2 tools, ~5K) - Library docs
11. **ide** (2 tools, ~3K) - TypeScript diagnostics

---

## 🧠 INTELLIGENT TOOL SELECTION PROTOCOL

**⚡ CRITICAL: Use minimum viable toolset for each task**

### **🔄 MANDATORY Workflow for Every Task**

```
1. START → vibe_check (~2K tokens)
   └─ Identify assumptions, prevent errors, break tunnel vision

2. EXECUTE → Task-specific tools
   └─ Use minimum viable toolset from matrix below

3. LEARN → vibe_learn (if errors)
   └─ Pattern recognition, learn from mistakes

TOTAL COST = 2K (vibe-check) + task tools
```

**Why vibe-check is mandatory:**
- Catches assumptions before they become problems
- Prevents cascading errors (fix one thing, break another)
- Builds cross-session learning database
- 2K investment saves 10-50K in rework

---

### **📋 Quick Task-to-Tool Reference**

**⚠️ ALL costs include mandatory vibe-check (+2K tokens)**

| Task Category | Primary Tools | Token Cost | When to Use |
|--------------|--------------|------------|-------------|
| **File Operations** | vibe-check + filesystem | ~11K | ALL local file tasks |
| **Git (Local)** | vibe-check + Bash | ~2K | git status/commit/push (pre-approved) |
| **GitHub (Remote)** | vibe-check + github | ~20K | PRs, issues, code search |
| **Local Database** | vibe-check + sqlite-tanium | ~5K | TCO questions, practice data |
| **Production DB** | vibe-check + postgresql | ~10K | Supabase, RLS, schema |
| **UI Components** | vibe-check + shadcn + filesystem | ~16K | Add components, get examples |
| **Styling/Colors** | vibe-check + filesystem ± playwright | ~11-25K | CSS/theme fixes, visual verify |
| **TypeScript Errors** | vibe-check + ide + filesystem | ~14K | Diagnostics + fixes |
| **E2E Testing** | vibe-check + playwright | ~16K | Browser automation, visual tests |
| **Library Docs** | vibe-check + context7 | ~7K | npm/framework documentation |
| **Web Scraping** | vibe-check + firecrawl | ~10K | Research, content extraction |
| **Multi-Agent** | vibe-check + claude-flow | ~54K | 🚨 ONLY for explicit orchestration |

---

### **🎯 Critical Selection Rules**

**Rule 1: MANDATORY vibe-check for ALL Tasks** (2K tokens)
- ✅ Use at START of every task (no exceptions)
- Workflow: vibe_check → execute → vibe_learn (if errors)

**Rule 2: Avoid claude-flow Unless Essential** (52K = 35-44% of budget!)
- ✅ Use ONLY when: "spawn 5 agents", "coordinate team", "parallel specialists"
- ❌ Never for: Simple fixes, single features, straightforward dev

**Rule 3: Know Your Database**
- Local/offline → sqlite-tanium (~3K)
- Production/Supabase/RLS → postgresql (~8K)

**Rule 4: Research Tool Selection**
- npm/framework docs → context7 (~5K, faster)
- General web → firecrawl (~8K, flexible)

**Rule 5: Visual Debugging is Valid**
- playwright for: color bugs, layout issues, visual verification
- Justified when code inspection insufficient

**Rule 6: Bash Commands First** (0K tokens, pre-approved)
- git: `git status/diff/commit/push`
- tests: `npm test/build/lint`

**Rule 7: shadcn = Components, Not All Styling**
- Adding components → shadcn + filesystem
- Fixing CSS/colors → filesystem (+ playwright if visual needed)

---

### **📊 Real-World Examples**

**"Fix color contrast bug"**
```
✅ vibe-check (identify assumptions) - 2K
✅ filesystem (search/edit CSS) - 9K
✅ playwright (visual verify) - 14K
Total: ~25K | ⚡⚡ Moderate
```

**"Add quiz component"**
```
✅ vibe-check (check requirements) - 2K
✅ shadcn (find components) - 5K
✅ filesystem (create files) - 9K
Total: ~16K | ⚡⚡⚡ Fast
```

**"Fix TypeScript errors"**
```
✅ vibe-check (identify root cause) - 2K
✅ ide (diagnostics) - 3K
✅ filesystem (fix code) - 9K
Total: ~14K | ⚡⚡⚡ Fast
```

**"Build system with 5 agents"**
```
✅ vibe-check (prevent tunnel vision) - 2K
✅ claude-flow (orchestration) - 52K
✅ playwright (testing) - 14K
✅ filesystem + github - 27K
Total: ~95K | ⚡ Slower (justified)
```

---

### **🔍 Tool Overlap Resolution**

- **Files**: Local = filesystem | GitHub = github.get_file_contents
- **Database**: Local = sqlite-tanium | Production = postgresql
- **Research**: Library docs = context7 | Web = firecrawl
- **Git**: Local = Bash (0K) | Remote = github MCP

---

### **🚨 Token Budget**

- **Reported**: 118K tokens
- **Calculated**: 147K tokens
- **Discrepancy**: 29K (under investigation)
- **Performance Target**: <32K for most tasks (vibe-check + filesystem + github + sqlite)

---

### **📚 Complete Documentation**

**For detailed information, see:**
- `.claude/COMPLETE_TOOL_MATRIX.md` - All 184 tools with task mappings
- `.claude/README.md` - Quick reference guide
- `.claude/agent-routing-config.json` - Agent selection patterns
- `FINAL_COMPLETION_SUMMARY.md` - Complete LMS implementation details

---

**🎯 ENTERPRISE LMS PROTOCOL**: Claude automatically recognizes this as a production-ready Learning Management System and uses intelligent tool selection with mandatory vibe-check for error prevention!
