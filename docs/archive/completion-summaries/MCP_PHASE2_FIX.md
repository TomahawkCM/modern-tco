# MCP Configuration Phase 2 Fix

## Phase 1 Completed ✅

- Removed duplicate `.mcp.json` (backed up to `config-backups/`)
- Kept `.vscode/mcp.json` with 11 correctly configured servers
- All project configs now use correct `"servers"` schema

## Phase 2: Global Config Fix (Optional)

### Issue

The global config at `/home/robne/.claude.json` (831KB) contains project-specific overrides using the OLD `"mcpServers"` schema, causing a validation warning:

```
[Failed to parse] Project config (shared via .mcp.json)
 └ [Error] mcpServers: Does not adhere to MCP server configuration schema
```

### Current State

Only 4 of 11 servers connecting:

- ✔ `claude-flow` (from `.vscode/mcp.json`)
- ✔ `context7` (from global config, HTTP)
- ✔ `postgresql` (from `.vscode/mcp.json`)
- ✔ `pv-bhat-vibe-check-mcp-server` (from global config, HTTP)

### Fix Required

**Location:** `/home/robne/.claude.json` around line 1164

**Change:**

```json
"/home/robne/projects/active/tanium-tco/modern-tco": {
  "mcpServers": {  ← OLD SCHEMA
    "context7": { ... },
    "pv-bhat-vibe-check-mcp-server": { ... }
  }
}
```

**To:**

```json
"/home/robne/projects/active/tanium-tco/modern-tco": {
  "servers": {  ← NEW SCHEMA
    "context7": { ... },
    "pv-bhat-vibe-check-mcp-server": { ... }
  }
}
```

### Manual Fix Steps

1. **Backup global config:**

   ```bash
   cp /home/robne/.claude.json /home/robne/.claude.json.backup-$(date +%Y%m%d)
   ```

2. **Edit with sed:**

   ```bash
   # Find the project section and change mcpServers to servers
   # (Around line 1164 in the 831KB file)
   sed -i 's/"mcpServers": {/"servers": {/g' /home/robne/.claude.json
   ```

   **⚠️ WARNING:** This will change ALL `mcpServers` → `servers` in the file,
   affecting other projects too. Test carefully!

3. **Or manually edit:**
   - Open `/home/robne/.claude.json` in editor
   - Search for: `"/home/robne/projects/active/tanium-tco/modern-tco"`
   - Find the `"mcpServers": {` line
   - Change to: `"servers": {`
   - Save and restart Claude Code

### Expected Result After Phase 2

All 11 servers should connect:

1. shadcn
2. filesystem
3. claude-flow
4. sqlite-tanium
5. github
6. firecrawl
7. playwright
8. postgresql
9. pv-bhat-vibe-check-mcp-server
10. docker
11. serena

Plus the 2 HTTP servers from global config:

- context7
- pv-bhat-vibe-check-mcp-server (HTTP version)

### Alternative: Accept Current State

If you're satisfied with 4 servers connecting and can live with the validation warning, Phase 2 is **optional**. The `.vscode/mcp.json` with 11 servers is correctly configured and ready for future use.

---

**Created:** 2025-10-11
**Status:** Phase 1 Complete, Phase 2 Pending User Decision
