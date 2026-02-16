# MCP Tools & Selection

> See also: [CLAUDE.md](./CLAUDE.md) | [AGENTS.md](./AGENTS.md) | [WORKFLOWS.md](./WORKFLOWS.md)

## MCP Server Configuration

| # | Server | Package | Tools | Purpose |
|---|--------|---------|-------|---------|
| 1 | **shadcn** | `shadcn@latest` | 7 | UI component registry |
| 2 | **filesystem** | `@modelcontextprotocol/server-filesystem` | 14 | File operations |
| 3 | **sqlite-tanium** | Local Docker | 8 | Local SQLite database |
| 4 | **github** | `@modelcontextprotocol/server-github` | 26 | GitHub API |
| 5 | **firecrawl** | `firecrawl-mcp` | 6 | Web scraping |
| 6 | **playwright** | `@playwright/mcp` | 21 | Browser automation |
| 7 | **supabase** | `@supabase/mcp-server-postgrest` | 3 | PostgREST API |
| 8 | **vibe-check** | `@pv-bhat/vibe-check-mcp` | 5 | Error prevention |
| 9 | **context7** | `@upstash/context7-mcp` | 2 | Library docs |
| 10 | **docker** | `docker-mcp` (uvx) | 4 | Container management |
| 11 | **archon** | HTTP localhost:8051 | 16 | Project/task management |
| 12 | **openclaw** | `openclaw-mcp` (npx) | 8 | Agent Q&A, messaging, tasks |

## CLI Browser Automation (agent-browser)

**Package**: `agent-browser` (vercel-labs) v0.7.6

```bash
npm run browser:open        # Open browser (add URL as arg)
npm run browser:snapshot    # Get interactive page snapshot
npm run browser:screenshot  # Capture screenshot
npm run browser:close       # Close browser session
npm run browser:scrape      # Content scraping script
npm run browser:visual-test # Visual regression testing
```

## Task-to-Tool Reference

| Task Category | Primary Tools | When to Use |
|--------------|--------------|-------------|
| **File Operations** | filesystem | ALL local file tasks |
| **Git (Local)** | Bash | git status/commit/push |
| **GitHub (Remote)** | github | PRs, issues, code search |
| **Local Database** | sqlite-tanium | TCO questions, practice data |
| **Production DB** | supabase | Supabase, RLS, schema |
| **UI Components** | shadcn + filesystem | Add components, get examples |
| **Library Docs** | context7 | npm/framework documentation |
| **Web Scraping** | firecrawl | Research, content extraction |
| **Project Mgmt** | archon | Tasks, docs, RAG search |
| **Container Mgmt** | docker | Deploy containers, compose stacks |
| **E2E Testing** | playwright | Browser automation, visual tests |
| **Agent Q&A** | openclaw (`openclaw_agent_ask`) | Ask OpenClaw questions, deliver answers to Telegram |
| **Messaging** | openclaw (`openclaw_message_send`) | Send direct messages to Telegram/WhatsApp/etc. |

## Tool Overlap Resolution

| Domain | Local | Remote/Cloud |
|--------|-------|--------------|
| **Files** | filesystem | github.get_file_contents |
| **Database** | sqlite-tanium | supabase |
| **Research** | context7 (library docs) | firecrawl (general web) |
| **Git** | Bash (0K) | github MCP |
| **Tasks** | TaskCreate/TaskUpdate | archon |
| **Containers** | Bash docker | docker MCP |

## Context7 Usage

Two-step workflow for library documentation:
```
1. resolve-library-id("[package]") → get Context7-compatible ID
2. get-library-docs("[id]", topic="...", mode="code|info")
```

Auto-trigger when user mentions: "docs for [library]", "how to use [package]", library names (React, Next.js, TypeScript, Tailwind, Supabase, Zod).

## OpenClaw Usage

Two key tools for interacting with OpenClaw:

### `openclaw_agent_ask` — Ask the agent a question
```json
{
  "message": "What are you working on for the budget app?",
  "deliver": true,
  "thinking": "medium"
}
```
- `message` (required): The question for the agent
- `session_id` (optional): Session UUID (default: `c671aea3-bb66-4420-96cf-86077d2a7726`)
- `deliver` (optional): Send response to Telegram (default: false)
- `thinking` (optional): off | minimal | low | medium | high

### `openclaw_message_send` — Send a direct message
```json
{
  "channel": "telegram",
  "target": "8546681904",
  "message": "Build completed successfully!"
}
```

### CLI fallback
```bash
openclaw agent --session-id c671aea3-bb66-4420-96cf-86077d2a7726 --message "test" --deliver --channel telegram --reply-to 8546681904 --json
```
