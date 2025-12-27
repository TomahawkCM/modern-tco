# Operational Workflows

> Part of the Claude Code configuration. See also: [CLAUDE.md](./CLAUDE.md) | [AGENTS.md](./AGENTS.md) | [TOOLS.md](./TOOLS.md)

---

## Archon Task Management Protocol

**Default Project Configuration**:
- **Project ID**: `9c56f01c-759a-42b1-bad4-06b71f2c4db9` (ALWAYS use this ID)
- **Integration**: Archon MCP for project-level tasks + TodoWrite for local tracking

### Mandatory Task Workflow

```
1. VIBE-CHECK → Identify assumptions, prevent errors
2. GET TASKS → find_tasks(project_id="9c56f01c-759a-42b1-bad4-06b71f2c4db9")
3. ASSIGN AGENT → Use agent assignment matrix (see AGENTS.md)
4. UPDATE STATUS → manage_task("update", task_id="...", status="doing", assignee="AgentName")
5. EXECUTE → Complete the task
6. MARK REVIEW → manage_task("update", task_id="...", status="review")
7. VERIFY → Test and validate
8. MARK DONE → manage_task("update", task_id="...", status="done")
```

### Task Status Flow

| Status | Description |
|--------|-------------|
| **todo** | Task created, awaiting assignment |
| **doing** | Agent actively working (ONE per agent at a time) |
| **review** | Work complete, needs validation |
| **done** | Verified and complete |

### Assignment Command

```
manage_task("update",
  task_id="<task-id>",
  assignee="<agent-name>",
  status="doing")
```

### Critical Rules

- ALWAYS vibe-check before getting tasks
- ALWAYS assign appropriate agent when updating to "doing"
- ALWAYS update status after completing work
- NEVER skip status updates
- Use project ID `9c56f01c-759a-42b1-bad4-06b71f2c4db9` for ALL archon operations

---

## Docker MCP Usage Guide

**Docker MCP Server**: `uvx docker-mcp` v0.2.0 (~3K tokens)

### Available Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `list-containers` | List all Docker containers | Health checks, status monitoring |
| `get-logs` | Retrieve container logs | Debugging, error diagnosis |
| `create-container` | Create standalone container | Complex container setup |
| `deploy-compose` | Deploy Compose stack | Multi-service deployment |

### Docker MCP vs Bash Commands

| Operation | Use | Rationale |
|-----------|-----|-----------|
| `docker ps` | **Bash** (0K) | Pre-approved, quick status |
| `docker logs` | **Bash** (0K) | Pre-approved, quick access |
| `docker restart` | **Bash** (0K) | Pre-approved, simple |
| Complex container creation | **Docker MCP** | Structured parameters |
| Compose deployments | **Docker MCP** | YAML handling, orchestration |
| Log analysis with parsing | **Docker MCP** | Structured output |
| Health monitoring workflow | **Docker MCP** | Integrated diagnosis |

### npm Scripts for Docker

```bash
npm run docker:status          # Show MCP/Supabase/Archon containers
npm run docker:logs:mcp        # View last 50 lines of MCP container logs
npm run docker:logs:mcp:follow # Follow MCP container logs
npm run docker:restart:mcp     # Restart MCP sqlite container
npm run docker:health          # Check MCP container health status
npm run docker:up              # Start MCP sqlite container
npm run docker:down            # Stop MCP sqlite container
```

### Container Recovery Workflow

```
1. Session start hook detects unhealthy container
2. Agent uses docker.list-containers to verify state
3. Agent uses docker.get-logs for diagnosis
4. Agent suggests recovery action → User approves
5. Agent restarts container OR escalates to user
```

### Containerization Guidelines

| MCP Server | Containerize? | Rationale |
|------------|---------------|-----------|
| sqlite-tanium | Yes (done) | Database isolation |
| playwright | Future | Browser isolation, consistent env |
| firecrawl | Future | Network isolation, security |
| filesystem | No | Volume mounts defeat purpose |
| shadcn | No | Dev tool, npx is correct |
| github | No | Official MCP, well-maintained |

---

## Pre-Approved Commands

These Bash commands require no additional approval:

### Git Operations
```bash
git status
git diff
git log
git add
git commit
git push
git branch
git checkout
git stash
```

### npm Operations
```bash
npm run lint
npm run test
npm run build
npm run dev
npm install
```

### Docker Operations
```bash
docker ps
docker logs
docker restart
```

---

## Workflow Quick Reference

| Scenario | Workflow |
|----------|----------|
| **New task** | vibe-check → archon.find_tasks → assign → execute → update status |
| **Container issue** | docker.list-containers → docker.get-logs → diagnose → fix |
| **Code change** | vibe-check → edit → test → commit |
| **PR creation** | git status → git add → git commit → git push → gh pr create |
