# MCP Configuration Backups

This directory contains archived MCP configuration files that were moved here due to schema incompatibilities with Claude Code.

## Archived Files

### `.mcp.codex.json`
- **Archived**: 2025-10-11
- **Reason**: Uses invalid `"mcpServers"` key instead of `"servers"`
- **Servers**: 5 servers (supabase, shadcn, firecrawl, chrome-devtools, postgresql)

### `.mcp-working-config.json`
- **Archived**: 2025-10-11
- **Reason**: Uses invalid `"mcpServers"` key instead of `"servers"`
- **Servers**: 7 servers (shadcn, filesystem, claude-flow, sqlite-tanium, github, firecrawl, playwright)

### `.mcp-servers-master.json`
- **Archived**: 2025-10-11
- **Reason**:
  - Uses invalid `"mcpServers"` key instead of `"servers"`
  - Contains non-standard `"settings"` and `"metadata"` keys
  - Had 18 servers with tiered startup optimization config
- **Notable**: This was an optimized configuration from 2025-09-24 with parallel startup and resource limits

## Active Configuration Files

The project now uses only two valid MCP configuration files:

1. **`.mcp.json`** - Main Claude Code configuration (11 servers)
2. **`.vscode/mcp.json`** - VS Code configuration (12 servers)

## Claude Code Schema

The correct Claude Code schema is:

```json
{
  "servers": {
    "server-name": {
      "command": "npx",
      "args": ["package-name"],
      "env": {
        "VAR": "value"
      }
    }
  }
}
```

**Note**: Custom keys like `settings`, `metadata`, `capabilities`, and `description` are not supported by Claude Code and will cause schema validation errors.

## Restoration

If you need to restore any servers from these archives:
1. Copy the server configuration block
2. Update the key from `"mcpServers"` to `"servers"`
3. Remove any non-standard keys
4. Add to `.mcp.json` or `.vscode/mcp.json`
