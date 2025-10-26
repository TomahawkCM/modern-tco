# ✅ Archon MCP Server Configuration - COMPLETE

**Date**: 2025-10-12  
**Status**: Configured and Working

---

## 🎯 What Was Done

Created a **wrapper module** inside the Archon MCP Docker container to make Claude Code's existing `.mcp.json` configuration work without modifications.

### Problem
- Claude Code `.mcp.json` calls: `python -m mcp_server`
- Archon's actual module path: `src.mcp_server.mcp_server`
- Without a wrapper, the module couldn't be found

### Solution
Created `/app/mcp_server/` wrapper module that redirects to the actual implementation:

```
/app/mcp_server/
├── __init__.py       # Imports from src.mcp_server
└── __main__.py       # Entry point that calls main()
```

---

## 📂 Files Created in Docker Container

### 1. `/app/mcp_server/__init__.py`
```python
"""MCP Server wrapper module for backward compatibility."""
from src.mcp_server import *
```

### 2. `/app/mcp_server/__main__.py`
```python
"""Main entry point for MCP server when called as python -m mcp_server."""
from src.mcp_server.mcp_server import main

if __name__ == "__main__":
    main()
```

---

## ✅ Verification

**Test Command:**
```bash
docker exec archon-mcp python -m mcp_server
```

**Expected Output:**
```
🏗️ MCP SERVER INITIALIZATION:
   Server Name: archon-mcp-server
   Description: MCP server using HTTP calls
✓ FastMCP server instance created successfully
🔧 Registering MCP tool modules...
✓ RAG tools registered (HTTP-based version)
✓ Project tools registered
✓ Task tools registered
✓ Document tools registered
✓ Version tools registered
✓ Feature tools registered
📦 Total modules registered: 6
🚀 Starting Archon MCP Server
```

---

## 🔄 Making Changes Permanent

**IMPORTANT**: The current changes are only in the running container. To persist across restarts, choose one option:

### Option 1: Startup Script (Recommended)

Create a startup script that runs when the container starts:

1. **Create init script:**
   ```bash
   # In your Archon directory
   mkdir -p scripts
   cat > scripts/init-mcp-wrapper.sh << 'EOF'
   #!/bin/bash
   # Create MCP server wrapper module for Claude Code compatibility
   
   mkdir -p /app/mcp_server
   
   cat > /app/mcp_server/__init__.py << 'PYEOF'
   """MCP Server wrapper module for backward compatibility."""
   from src.mcp_server import *
   PYEOF
   
   cat > /app/mcp_server/__main__.py << 'PYEOF'
   """Main entry point for MCP server when called as python -m mcp_server."""
   from src.mcp_server.mcp_server import main
   
   if __name__ == "__main__":
       main()
   PYEOF
   
   echo "✓ MCP wrapper module created successfully"
   EOF
   
   chmod +x scripts/init-mcp-wrapper.sh
   ```

2. **Modify docker-compose.yml:**
   ```yaml
   archon-mcp:
     volumes:
       - ./scripts:/scripts:ro
     command:
       - /bin/sh
       - -c
       - |
         /scripts/init-mcp-wrapper.sh
         python -m src.mcp_server.mcp_server
   ```

### Option 2: Volume Mount (Simplest)

Mount the wrapper module directly:

1. **Create wrapper locally:**
   ```bash
   # In your Archon directory
   mkdir -p mcp_server_wrapper
   
   cat > mcp_server_wrapper/__init__.py << 'EOF'
   """MCP Server wrapper module for backward compatibility."""
   from src.mcp_server import *
   EOF
   
   cat > mcp_server_wrapper/__main__.py << 'EOF'
   """Main entry point for MCP server when called as python -m mcp_server."""
   from src.mcp_server.mcp_server import main
   
   if __name__ == "__main__":
       main()
   EOF
   ```

2. **Add volume to docker-compose.yml:**
   ```yaml
   archon-mcp:
     volumes:
       - ./mcp_server_wrapper:/app/mcp_server:ro
   ```

### Option 3: Modify Dockerfile (Most Permanent)

Add to `python/Dockerfile.mcp`:

```dockerfile
# After the COPY commands, add:
RUN mkdir -p /app/mcp_server && \
    echo 'from src.mcp_server import *' > /app/mcp_server/__init__.py && \
    echo 'from src.mcp_server.mcp_server import main\nif __name__ == "__main__": main()' > /app/mcp_server/__main__.py
```

Then rebuild: `docker compose up -d --build`

---

## 🧪 Testing After Restart

After implementing persistence, test:

1. **Restart container:**
   ```bash
   docker compose restart archon-mcp
   ```

2. **Verify wrapper exists:**
   ```bash
   docker exec archon-mcp ls -la /app/mcp_server/
   ```

3. **Test module loads:**
   ```bash
   docker exec archon-mcp timeout 3 python -m mcp_server 2>&1 | grep "Starting Archon MCP Server"
   ```

4. **Restart Claude Code MCP:**
   - In Claude Code, use command palette: "MCP: Restart Servers"

---

## 📋 Current Configuration

**Docker Container:** `archon-mcp` (Up 5 hours, healthy)  
**Port:** 8051  
**Module Path:** `/app/mcp_server/` (wrapper) → `/app/src/mcp_server/mcp_server.py` (actual)

**Claude Code `.mcp.json`:**
```json
{
  "archon": {
    "command": "docker",
    "args": [
      "exec", "-i",
      "archon-mcp",
      "python", "-m", "mcp_server"
    ]
  }
}
```

**Status:** ✅ Working (6 tools registered)

---

## 🛠️ Available Tools

Once configured, these tools are available:

### Knowledge Base (RAG)
- `rag_search_knowledge_base` - Semantic search (use 2-5 keywords)
- `rag_search_code_examples` - Find code snippets
- `rag_get_available_sources` - List documentation sources
- `rag_list_pages_for_source` - Browse doc structure
- `rag_read_full_page` - Get full page content

### Project Management
- `find_projects` - List/search/get projects
- `manage_project` - Create/update/delete (action parameter)

### Task Management
- `find_tasks` - List/search/get tasks with filters
- `manage_task` - Create/update/delete tasks

### Documents
- `find_documents` - List/search/get documents
- `manage_document` - Create/update/delete documents

### Version Control
- `find_versions` - View version history
- `manage_version` - Create/restore versions

---

## 🔧 Troubleshooting

### Container Restart Lost Wrapper
- **Cause**: Changes weren't persisted (still in container memory)
- **Fix**: Implement one of the persistence options above

### Module Not Found Error
```bash
# Check if wrapper exists:
docker exec archon-mcp ls -la /app/mcp_server/

# If missing, recreate:
docker exec archon-mcp mkdir -p /app/mcp_server
docker exec archon-mcp sh -c 'cat > /app/mcp_server/__init__.py << "EOF"
from src.mcp_server import *
EOF'
docker exec archon-mcp sh -c 'cat > /app/mcp_server/__main__.py << "EOF"
from src.mcp_server.mcp_server import main
if __name__ == "__main__":
    main()
EOF'
```

### Claude Code Can't Connect
1. Check container is running: `docker ps | grep archon-mcp`
2. Check health: `curl http://localhost:8051/health`
3. View logs: `docker compose logs archon-mcp`
4. Restart MCP servers in Claude Code

---

## 📚 References

- **Archon Repository**: https://github.com/coleam00/Archon
- **Docker Container**: archon-mcp (healthy, port 8051)
- **Wrapper Location**: `/app/mcp_server/` inside container
- **Actual Module**: `/app/src/mcp_server/mcp_server.py`

---

**✅ Configuration Complete - Claude Code can now use Archon MCP tools!**
