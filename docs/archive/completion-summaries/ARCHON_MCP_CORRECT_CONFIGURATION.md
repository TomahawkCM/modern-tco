# ✅ Archon MCP Configuration - Correct Approach

**Date**: 2025-10-12  
**Status**: Tested and Verified

---

## 🔍 Testing Results

### What I Tested
1. ✅ Created wrapper module for `docker exec -i` approach
2. ✅ Verified module imports successfully
3. ✅ Confirmed 6 tool modules register
4. ❌ Discovered fundamental incompatibility with `docker exec -i`

### The Problem Discovered

**Archon MCP uses HTTP POST transport, NOT stdin/stdout.**

Evidence from logs:
```
INFO:     172.18.0.1:47624 - "POST /mcp HTTP/1.1" 200 OK
Processing request of type ListToolsRequest
```

When using `docker exec -i`, Archon tries to start a new HTTP server on port 8051, which is already in use by the main container process, causing:
```
ERROR: [Errno 98] address already in use
```

**Conclusion**: The wrapper approach was incorrect. Archon is already working via HTTP.

---

## ✅ Correct Configuration for Claude Code

Archon MCP should be configured to use HTTP transport, not docker exec:

### Option 1: HTTP with SSE (Recommended)

```json
{
  "mcpServers": {
    "archon": {
      "url": "http://localhost:8051/mcp",
      "transport": "sse",
      "disabled": false
    }
  }
}
```

### Option 2: HTTP with stdio wrapper (If SSE doesn't work)

```json
{
  "mcpServers": {
    "archon": {
      "command": "node",
      "args": [
        "-e",
        "const http = require('http'); const readline = require('readline'); const rl = readline.createInterface({input: process.stdin}); rl.on('line', (line) => {const req = http.request({hostname: 'localhost', port: 8051, path: '/mcp', method: 'POST', headers: {'Content-Type': 'application/json'}}, (res) => {let data = ''; res.on('data', chunk => data += chunk); res.on('end', () => console.log(data));}); req.write(line); req.end();});"
      ],
      "disabled": false
    }
  }
}
```

---

## 🧪 How to Verify Archon is Working

### 1. Check Container Status
```bash
docker ps | grep archon-mcp
# Should show: Up X hours (healthy)
```

### 2. Check MCP Endpoint
```bash
curl -X POST http://localhost:8051/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Expected response: JSON with list of tools

### 3. Check Container Logs
```bash
docker logs archon-mcp --tail 50 | grep -E "(tools registered|Starting)"
```

Should show:
```
✓ RAG tools registered
✓ Project tools registered  
✓ Task tools registered
✓ Document tools registered
✓ Version tools registered
✓ Feature tools registered
📦 Total modules registered: 6
```

---

## 📊 Archon MCP Architecture

```
Claude Code
    ↓ (HTTP POST)
http://localhost:8051/mcp
    ↓
archon-mcp container (port 8051)
    ↓ (HTTP calls)
archon-server container (port 8181)
    ↓
Supabase Database
```

**Key Points:**
- Archon MCP is an HTTP-based MCP server
- It uses FastMCP library with "Streamable HTTP" mode
- Primary endpoint: `http://localhost:8051/mcp`
- Transport: HTTP POST (not stdio)

---

## 🛠️ Available Tools (6 modules)

Once configured correctly, these tools are available:

### RAG (Knowledge Base)
- `rag_search_knowledge_base(query, source_id?, match_count?)`
- `rag_search_code_examples(query, source_id?, match_count?)`
- `rag_get_available_sources()`
- `rag_list_pages_for_source(source_id, section?)`
- `rag_read_full_page(page_id?, url?)`

### Projects
- `find_projects(query?, project_id?, page?, per_page?)`
- `manage_project(action, project_id?, title?, description?, github_repo?)`

### Tasks
- `find_tasks(query?, task_id?, filter_by?, filter_value?, project_id?, page?, per_page?)`
- `manage_task(action, task_id?, project_id?, title?, description?, status?, assignee?, task_order?, feature?)`

### Documents
- `find_documents(project_id, document_id?, query?, document_type?, page?, per_page?)`
- `manage_document(action, project_id, document_id?, title?, document_type?, content?, tags?, author?)`

### Versions
- `find_versions(project_id, field_name?, version_number?, page?, per_page?)`
- `manage_version(action, project_id, field_name, version_number?, content?, change_summary?, document_id?, created_by?)`

### Features
- `get_project_features(project_id)`

---

## ⚠️ Important Notes

1. **Don't use `docker exec -i`** - Archon doesn't support stdio transport
2. **Port 8051 must be accessible** - Ensure no firewall blocks it
3. **Archon must be running** - `docker compose up -d` in Archon directory
4. **HTTP is the correct transport** - Not SSE, not stdio, just HTTP POST

---

## 🔧 Troubleshooting

### Claude Code Can't Connect

1. **Verify Archon is running:**
   ```bash
   curl http://localhost:8051/mcp
   ```

2. **Check .mcp.json syntax:**
   - Must use `"url": "http://localhost:8051/mcp"`
   - Must use `"transport": "sse"` or omit transport

3. **Restart Claude Code MCP servers:**
   - Command Palette → "MCP: Restart Servers"

4. **Check Archon logs:**
   ```bash
   docker logs archon-mcp --follow
   ```

### "Address Already in Use" Error

This means you're trying to start a second MCP server. Solution:
- Don't use `docker exec -i python -m ...`
- Use HTTP configuration instead

---

## 📚 Changes Reverted

I've removed the wrapper module that was created:
- ❌ Removed `/app/mcp_server/` directory
- ✅ Archon container is back to clean state
- ✅ No modifications to original Archon code

---

## ✅ Next Steps

1. **Update your `.mcp.json`** with HTTP configuration (see above)
2. **Restart Claude Code MCP servers**
3. **Test calling an Archon tool** (e.g., `rag_get_available_sources`)

---

**The correct solution is HTTP transport, not a wrapper module!** 🎯
