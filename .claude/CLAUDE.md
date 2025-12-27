# Claude Code Configuration - Modern Tanium TCO Learning Management System

## Quick Navigation

| Document | Purpose |
|----------|---------|
| **[AGENTS.md](./AGENTS.md)** | Agent system, Modern UI Agent, assignment matrix |
| **[TOOLS.md](./TOOLS.md)** | MCP servers, tool selection protocol, token budgets |
| **[WORKFLOWS.md](./WORKFLOWS.md)** | Archon task management, Docker workflows |

---

## Current Mission

**Enterprise LMS for Tanium TCO Certification**

- **Status**: Learning science complete (32h), content needs population
- **Stack**: Next.js 16.0.0 + React 19.2.0 + TypeScript + Supabase + shadcn/ui
- **Content**: 11.6h MDX modules (6 modules, 16,849 lines) + 200+ questions
- **Features**: Spaced repetition, gamification, video analytics, interactive labs, mock exams

**Key Assets**:
- 83 micro-sections with Learn→Test→Review flow
- Spaced repetition system with adaptive difficulty
- 27 badges, 6 levels, points system
- Video milestone tracking, interactive labs
- Full mock exams (105 questions, 105min timer)

**Production Priorities**:
1. Content population (videos, questions, lab certificates)
2. Integration testing & performance optimization
3. Deployment & monitoring setup

See `FINAL_COMPLETION_SUMMARY.md` for complete implementation details.

---

## Enterprise Architecture

**Core Infrastructure**:
- **Next.js 16.0.0** with App Router
- **React 19.2.0** with automatic runtime
- **TypeScript 5.9.3** with strict type safety
- **Bundler**: Webpack (switching to Turbopack after content-parser.ts refactoring)
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

## Critical Rules (Summary)

### 1. Always Start with vibe-check
Every task begins with `vibe_check` to prevent errors and identify assumptions.

### 2. Use Archon for Task Management
- **Project ID**: `9c56f01c-759a-42b1-bad4-06b71f2c4db9`
- Always update task status: todo → doing → review → done

### 3. Minimum Viable Toolset
- Use pre-approved Bash commands when possible (0K tokens)
- Check [TOOLS.md](./TOOLS.md) for tool selection guidance

### 4. Agent Selection
- UI work → modern-ui-agent
- Database → database-architect
- Testing → test-automator
- See [AGENTS.md](./AGENTS.md) for full matrix

---

## MCP Servers (12 Active)

| Server | Purpose |
|--------|---------|
| shadcn | UI components |
| filesystem | File operations |
| sqlite-tanium | Local database |
| github | Remote Git |
| firecrawl | Web scraping |
| playwright | Browser automation |
| supabase | PostgREST API |
| vibe-check | Error prevention |
| context7 | Library docs |
| docker | Container management |
| archon | Task management |
| postgresql | Production database |

**Full details**: [TOOLS.md](./TOOLS.md)

---

## Complete Documentation

| File | Contents |
|------|----------|
| `.claude/AGENTS.md` | Agent documentation, Modern UI Agent, assignment matrix |
| `.claude/TOOLS.md` | MCP servers, tool selection, token budgets |
| `.claude/WORKFLOWS.md` | Archon protocol, Docker workflows |
| `.claude/agent-routing-config.json` | Agent routing configuration |
| `.claude/COMPLETE_TOOL_MATRIX.md` | All 247 tools with task mappings |
| `FINAL_COMPLETION_SUMMARY.md` | Complete LMS implementation details |
