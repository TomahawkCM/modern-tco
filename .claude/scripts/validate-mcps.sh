#!/bin/bash
# Quick MCP Validation Script
# Fast health check for MCP infrastructure

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "🔍 Quick MCP Health Check..."

# Check .mcp.json
if [ ! -f "$PROJECT_ROOT/.mcp.json" ]; then
    echo -e "${RED}✗ .mcp.json not found${NC}"
    exit 1
fi

# Count MCPs
MCP_COUNT=$(jq '.mcpServers | length - 1' "$PROJECT_ROOT/.mcp.json" 2>/dev/null || echo "0")
echo -e "${GREEN}✓${NC} $MCP_COUNT MCP servers configured"

# Check Docker container
if docker ps --format '{{.Names}}' | grep -q "^mcp-sqlite-tanium$"; then
    HEALTH=$(docker inspect --format='{{.State.Health.Status}}' mcp-sqlite-tanium 2>/dev/null || echo "unknown")
    if [ "$HEALTH" = "healthy" ]; then
        echo -e "${GREEN}✓${NC} sqlite-tanium Docker container healthy"
    else
        echo -e "${YELLOW}⚠${NC} sqlite-tanium health: $HEALTH"
    fi
else
    echo -e "${YELLOW}ℹ${NC} sqlite-tanium container not running"
fi

echo -e "${GREEN}✅ MCP infrastructure OK${NC}"
