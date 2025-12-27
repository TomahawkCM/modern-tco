# MCP Tools & Selection Protocol

> Part of the Claude Code configuration. See also: [CLAUDE.md](./CLAUDE.md) | [AGENTS.md](./AGENTS.md) | [WORKFLOWS.md](./WORKFLOWS.md)

---

## MCP Server Configuration

**12 Active Servers (~128K tokens available)** - Updated 2025-12-03

| # | Server | Package | Version | Tools | Tokens |
|---|--------|---------|---------|-------|--------|
| 1 | **shadcn** | `shadcn@latest` | 3.5.1 | 7 | ~5K |
| 2 | **filesystem** | `@modelcontextprotocol/server-filesystem` | 2025.11.25 | 14 | ~9K |
| 3 | **sqlite-tanium** | Local Docker | Custom | 8 | ~3K |
| 4 | **github** | `@modelcontextprotocol/server-github` | 2025.4.8 | 26 | ~18K |
| 5 | **firecrawl** | `firecrawl-mcp` | 3.6.2 | 6 | ~8K |
| 6 | **playwright** | `@playwright/mcp` | 0.0.49 | 21 | ~14K |
| 7 | **supabase** | `@supabase/mcp-server-postgrest` | 0.1.0 | 3 | ~8K |
| 8 | **vibe-check** | `@pv-bhat/vibe-check-mcp` | 2.7.6 | 5 | ~2K |
| 9 | **context7** | `@upstash/context7-mcp` | 1.0.31 | 2 | ~5K |
| 10 | **docker** | `docker-mcp` (uvx) | 0.2.0 | 4 | ~3K |
| 11 | **archon** | HTTP localhost:8051 | Local | 16 | ~10K |
| 12 | **postgresql** | PostgreSQL MCP | Local | 3 | ~8K |

**Note**: `serena` MCP server is installed but currently not connected.

---

## Intelligent Tool Selection Protocol

**CRITICAL: Use minimum viable toolset for each task**

### Mandatory Workflow

```
1. START → vibe_check (~2K tokens)
   └─ Identify assumptions, prevent errors, break tunnel vision

2. EXECUTE → Task-specific tools
   └─ Use minimum viable toolset from matrix below

3. LEARN → vibe_learn (if errors)
   └─ Pattern recognition, learn from mistakes
```

**Why vibe-check is mandatory:**
- Catches assumptions before they become problems
- Prevents cascading errors (fix one thing, break another)
- Builds cross-session learning database
- 2K investment saves 10-50K in rework

---

## Task-to-Tool Reference

**All costs include mandatory vibe-check (+2K tokens)**

| Task Category | Primary Tools | Token Cost | When to Use |
|--------------|--------------|------------|-------------|
| **File Operations** | vibe-check + filesystem | ~11K | ALL local file tasks |
| **Git (Local)** | vibe-check + Bash | ~2K | git status/commit/push (pre-approved) |
| **GitHub (Remote)** | vibe-check + github | ~20K | PRs, issues, code search |
| **Local Database** | vibe-check + sqlite-tanium | ~5K | TCO questions, practice data |
| **Production DB** | vibe-check + postgresql | ~10K | Supabase, RLS, schema |
| **UI Components** | vibe-check + shadcn + filesystem | ~16K | Add components, get examples |
| **Styling/Colors** | vibe-check + filesystem ± playwright | ~11-25K | CSS/theme fixes, visual verify |
| **Accessibility** | vibe-check + playwright | ~16K | WCAG compliance, ARIA |
| **Animations** | vibe-check + filesystem + playwright | ~25K | Framer Motion, transitions |
| **TypeScript Errors** | vibe-check + filesystem | ~11K | Diagnostics + fixes |
| **E2E Testing** | vibe-check + playwright | ~16K | Browser automation, visual tests |
| **Library Docs** | vibe-check + context7 | ~7K | npm/framework documentation |
| **Web Scraping** | vibe-check + firecrawl | ~10K | Research, content extraction |
| **Project/Task Mgmt** | vibe-check + archon | ~12K | Tasks, docs, RAG search |
| **Container Mgmt** | vibe-check + docker | ~5K | Deploy containers, compose stacks |

---

## Critical Selection Rules

### Rule 1: Mandatory vibe-check (2K tokens)
- Use at START of every task (no exceptions)
- Workflow: vibe_check → execute → vibe_learn (if errors)

### Rule 2: Know Your Database
- Local/offline → sqlite-tanium (~3K)
- Production/Supabase/RLS → postgresql (~8K)

### Rule 3: Research Tool Selection
- npm/framework docs → context7 (~5K, faster)
- General web → firecrawl (~8K, flexible)

### Rule 4: Context7 Auto-Triggers
Automatically use context7 when user mentions:
- "docs for [library]", "how to use [package]", "[framework] documentation"
- Library names: React, Next.js, TypeScript, Tailwind, Supabase, Prisma, Zod
- "API reference", "installation guide", "get started with"

**Two-step workflow:**
```
1. resolve-library-id("[package]") → get Context7-compatible ID
2. get-library-docs("[id]", topic="...", mode="code|info")
```

### Rule 5: Visual Debugging is Valid
- playwright for: color bugs, layout issues, visual verification
- Justified when code inspection insufficient

### Rule 6: Bash Commands First (0K tokens)
Pre-approved commands:
- git: `git status/diff/commit/push`
- tests: `npm test/build/lint`

### Rule 7: shadcn = Components, Not All Styling
- Adding components → shadcn + filesystem
- Fixing CSS/colors → filesystem only (+ playwright if visual needed)

### Rule 8: Project Management with Archon
- Task tracking, docs, RAG search → archon (~10K)
- ALWAYS use archon for task management (not local TodoWrite alone)

### Rule 9: Container Operations
- Docker containers/compose → docker MCP (~3K)
- Quick ops → Bash docker commands (0K)

---

## Tool Overlap Resolution

| Domain | Local | Remote/Cloud |
|--------|-------|--------------|
| **Files** | filesystem | github.get_file_contents |
| **Database** | sqlite-tanium | postgresql |
| **Research** | context7 (library docs) | firecrawl (general web) |
| **Git** | Bash (0K) | github MCP |
| **Tasks** | TodoWrite | archon |
| **Containers** | Bash docker | docker MCP |
| **Screenshots** | playwright | playwright |

---

## Real-World Examples

**"Fix color contrast bug"**
```
vibe-check (identify assumptions) - 2K
filesystem (search/edit CSS) - 9K
playwright (visual verify) - 14K
Total: ~25K
```

**"Add quiz component"**
```
vibe-check (check requirements) - 2K
shadcn (find components) - 5K
filesystem (create files) - 9K
Total: ~16K
```

**"Fix TypeScript errors"**
```
vibe-check (identify root cause) - 2K
filesystem (fix code) - 9K
Total: ~11K
```

---

## Token Budget

- **Total Available**: ~128K tokens (12 servers)
- **Performance Target**: <32K for most tasks
- **Optimization**: Use Bash for pre-approved git/npm commands (0K)

---

## Complete Tool Documentation

- `.claude/COMPLETE_TOOL_MATRIX.md` - All tools with task mappings
- `.claude/README.md` - Quick reference guide
