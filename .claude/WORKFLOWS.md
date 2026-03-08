# Operational Workflows

> See also: [CLAUDE.md](./CLAUDE.md) | [AGENTS.md](./AGENTS.md) | [TOOLS.md](./TOOLS.md)

## Archon Task Management

- **Project ID**: `9c56f01c-759a-42b1-bad4-06b71f2c4db9`
- Use archon MCP for project-level task tracking
- Status flow: `todo` → `doing` → `review` → `done`

## Docker MCP Usage

| Tool | Purpose |
|------|---------|
| `list-containers` | Health checks, status monitoring |
| `get-logs` | Debugging, error diagnosis |
| `create-container` | Complex container setup |
| `deploy-compose` | Multi-service deployment |

**Docker MCP vs Bash**: Use Bash for quick ops (`docker ps`, `docker logs`, `docker restart`). Use Docker MCP for complex container creation, compose deployments, and structured log analysis.

### Docker npm Scripts

```bash
npm run docker:status          # Show container status
npm run docker:logs:mcp        # View last 50 lines of MCP container logs
npm run docker:restart:mcp     # Restart MCP sqlite container
npm run docker:health          # Check MCP container health
npm run docker:up              # Start MCP sqlite container
npm run docker:down            # Stop MCP sqlite container
```

## Pre-Approved Commands

### Git
```bash
git status, git diff, git log, git add, git commit, git push, git branch, git checkout, git stash
```

### npm
```bash
npm run lint, npm run test, npm run build, npm run dev, npm install
```

### Docker
```bash
docker ps, docker logs, docker restart
```

## Workflow Quick Reference

| Scenario | Workflow |
|----------|----------|
| **New task** | archon.find_tasks → assign → execute → update status |
| **Container issue** | docker.list-containers → docker.get-logs → diagnose → fix |
| **Code change** | edit → test → commit |
| **PR creation** | git add → git commit → git push → gh pr create |
| **i18n string** | Add key to en.json → use `t()` in component → `/budget:translate-locales` → validate |

## i18n Workflow

1. Add keys to `src/i18n/messages/en.json` under the appropriate namespace
2. Use `useTranslations("namespace")` in the component
3. Replace hardcoded strings with `t("keyName")` calls
4. Run `/budget:translate-locales` to sync translations to other locales
5. Validate with `node scripts/validate-translations.js`
