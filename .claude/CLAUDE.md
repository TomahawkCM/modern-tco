# Claude Code Configuration - Modern Tanium TCO Learning Management System

## 🎯 CURRENT MISSION

**Enterprise LMS for Tanium TCO Certification**

- **Status**: Learning science complete (32h), content needs population
- **Stack**: Next.js 16.0.0 + React 19.2.0 + TypeScript + Supabase + shadcn/ui
- **Content**: 11.6h MDX modules (6 modules, 16,849 lines) + 200+ questions
- **Features**: Spaced repetition, gamification, video analytics, interactive labs, mock exams

**Key Assets**:
- ✅ 83 micro-sections with Learn→Test→Review flow
- ✅ 2357 spaced repetition system with adaptive difficulty
- ✅ 27 badges, 6 levels, points system
- ✅ Video milestone tracking, interactive labs
- ✅ Full mock exams (105 questions, 105min timer)

**Production Priorities**:
1. Content population (videos, questions, lab certificates)
2. Integration testing & performance optimization
3. Deployment & monitoring setup

See `FINAL_COMPLETION_SUMMARY.md` for complete implementation details.

---

## 🏗️ ENTERPRISE ARCHITECTURE

**Core Infrastructure**:
- **Next.js 16.0.0** (stable release Oct 21, 2025) with App Router
- **React 19.2.0** (latest stable) with automatic runtime
- **TypeScript 5.9.3** with strict type safety
- **Bundler**: Webpack (temporary - switching to Turbopack after content-parser.ts refactoring)
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
- Debugging (3): debug-specialist, error-detective, analyzer

**Auto-Spawn Patterns**:
- UI work → react-specialist, typescript-pro, shadcn-specialist
- Database → database-architect, supabase-specialist, security-engineer
- Testing → test-automator, e2e-specialist, qa-engineer
- Debugging → debug-specialist, error-detective, performance-engineer

See `.claude/agent-routing-config.json` for complete agent documentation.

---

## 🎯 ARCHON TASK MANAGEMENT PROTOCOL

**Default Project Configuration**:
- **Project ID**: `9c56f01c-759a-42b1-bad4-06b71f2c4db9` (ALWAYS use this ID)
- **Integration**: Archon MCP for project-level tasks + TodoWrite for local tracking

### **Mandatory Task Workflow**

```
1. VIBE-CHECK → Identify assumptions, prevent errors
2. GET TASKS → find_tasks(project_id="9c56f01c-759a-42b1-bad4-06b71f2c4db9")
3. ASSIGN AGENT → Use agent assignment matrix below
4. UPDATE STATUS → manage_task("update", task_id="...", status="doing", assignee="AgentName")
5. EXECUTE → Complete the task
6. MARK REVIEW → manage_task("update", task_id="...", status="review")
7. VERIFY → Test and validate
8. MARK DONE → manage_task("update", task_id="...", status="done")
```

### **Agent Assignment Strategy**

**"Best Agent" Selection Criteria**:
1. **Task Domain Match**: Agent specialization aligns with task requirements
2. **Tool Access**: Agent has required MCP tools/permissions
3. **Complexity Level**: Agent experience matches task complexity
4. **Historical Success**: Proven track record on similar tasks

**Agent Assignment Matrix**:

| Task Type | Best Agent(s) | Rationale |
|-----------|--------------|----------|
| **React/UI Components** | react-specialist, typescript-pro, shadcn-specialist | Frontend expertise + component libraries |
| **Database/Schema** | database-architect, supabase-specialist, rls-policy-designer | PostgreSQL + Supabase + security |
| **Testing/QA** | test-automator, playwright-specialist, qa-engineer | Automated testing + E2E coverage |
| **Content/MDX** | tco-content-specialist, markdown-expert | MDX modules + learning content |
| **Assessment/Quiz** | assessment-engine-specialist, question-generator | Question generation + evaluation |
| **Video Integration** | video-system-architect, analytics-specialist | Video tracking + milestone system |
| **Performance** | performance-engineer, bundle-analyzer, lighthouse-optimizer | Optimization + metrics |
| **API/Backend** | api-specialist, backend-architect, security-engineer | REST/GraphQL + security |
| **DevOps/Deploy** | devops-engineer, docker-specialist, deployment-specialist | CI/CD + containerization |
| **Debug/Troubleshoot** | debug-specialist, error-detective, analyzer | Error triage + root cause + TypeScript/performance/E2E debugging |
| **General/Mixed** | full-stack-specialist, system-architect | Multi-domain tasks |

**Assignment Command**:
```
manage_task("update", 
  task_id="<task-id>", 
  assignee="<agent-name>",  # From matrix above
  status="doing")
```

### **Task Status Flow**

- **todo** → Task created, awaiting assignment
- **doing** → Agent actively working (ONLY ONE per agent at a time)
- **review** → Work complete, needs validation
- **done** → Verified and complete

**Critical Rules**:
- ✅ ALWAYS vibe-check before getting tasks
- ✅ ALWAYS assign appropriate agent when updating to "doing"
- ✅ ALWAYS update status after completing work
- ✅ NEVER skip status updates
- ✅ Use project ID `9c56f01c-759a-42b1-bad4-06b71f2c4db9` for ALL archon operations

---

## 🔧 MCP SERVER CONFIGURATION

**14 Servers (13 active, ~151-180K tokens available)**:

1. **shadcn** (7 tools, ~5K) - Component management
2. **filesystem** (14 tools, ~9K) - File operations
3. **claude-flow** (90 tools, ~52K) - Multi-agent orchestration ⚠️
4. **sqlite-tanium** (8 tools, ~3K) - Local database
5. **github** (26 tools, ~18K) - Git/repository ops
6. **firecrawl** (6 tools, ~8K) - Web scraping
7. **playwright** (21 tools, ~14K) - Browser automation
8. **postgresql** (3 tools, ~8K) - Production database
9. **vibe-check** (5 tools, ~2K) - Error prevention & learning
10. **context7** (2 tools, ~5K) - Library docs
11. **ide** (2 tools, ~3K) - TypeScript diagnostics
12. **docker** (4 tools, ~3K) - Container management
13. **archon** (16 tools, ~10K) - Project/task management & RAG
14. **figma** (43 tools, ~20K) - Design automation

**Note**: serena MCP server is installed but currently not connected.

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
| **Project/Task Mgmt** | vibe-check + archon | ~12K | Tasks, docs, RAG search |
| **Container Mgmt** | vibe-check + docker | ~5K | Deploy containers, compose stacks |
| **Design Automation** | vibe-check + figma | ~22K | Figma node operations, exports |
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

**Rule 8: Project Management with Archon**
- Task tracking, docs, RAG search → archon (~10K)
- ALWAYS use archon for task management (not local TodoWrite alone)
- Combines project management + knowledge base search

**Rule 9: Container Operations**
- Docker containers/compose → docker (~3K)
- Lightweight alternative to bash docker commands

**Rule 10: Design Integration**
- Figma operations → figma (~20K)
- Only use when working with Figma files directly

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
- **Task Management**: Local todos = TodoWrite | Project tasks = archon
- **Containers**: Quick ops = Bash docker | Complex = docker MCP
- **Design**: Figma files = figma | Screenshots = playwright

---

### **🚨 Token Budget**

- **Previous Total**: ~147K tokens (11 servers)
- **New Total**: ~180K tokens (14 servers)
- **New Additions**: docker (3K) + archon (10K) + figma (20K) = +33K
- **Performance Target**: <32K for most tasks (vibe-check + filesystem + github + sqlite)
- **Note**: archon preferred over local TodoWrite for project-level task management

---

### **📚 Complete Documentation**

**For detailed information, see:**
- `.claude/COMPLETE_TOOL_MATRIX.md` - All 247 tools with task mappings
- `.claude/README.md` - Quick reference guide
- `.claude/agent-routing-config.json` - Agent selection patterns
- `FINAL_COMPLETION_SUMMARY.md` - Complete LMS implementation details

---

**🎯 ENTERPRISE LMS PROTOCOL**: Claude automatically recognizes this as a production-ready Learning Management System and uses intelligent tool selection with mandatory vibe-check for error prevention!
