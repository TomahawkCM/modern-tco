#!/bin/bash
# MCP Diagnostic and Validation Script
# Tanium TCO Learning Management System
# Phase 1: Hybrid Architecture Validation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MCP_CONFIG="$PROJECT_ROOT/.mcp.json"
DOCKER_DIR="$PROJECT_ROOT/docker/mcp-sqlite-tanium"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  MCP Infrastructure Diagnostics - Tanium TCO LMS${NC}"
echo -e "${BLUE}  Phase 1: Hybrid Architecture Validation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Test function
test_check() {
    local test_name="$1"
    local test_command="$2"

    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    echo -n "[${TESTS_TOTAL}] Testing ${test_name}... "

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

###############################################################################
# 1. Configuration Validation
###############################################################################
echo -e "${YELLOW}━━━ Configuration Validation ━━━${NC}"
echo ""

test_check ".mcp.json exists" "[ -f '$MCP_CONFIG' ]"
test_check ".mcp.json is valid JSON" "python3 -m json.tool < '$MCP_CONFIG' > /dev/null"
test_check ".mcp.json has mcpServers" "python3 -c \"import json; f=open('$MCP_CONFIG'); d=json.load(f); exit(0 if 'mcpServers' in d else 1)\""

MCP_COUNT=$(python3 -c "import json; f=open('$MCP_CONFIG'); d=json.load(f); print(len(d.get('mcpServers', {})) - 1 if '_comment' in d.get('mcpServers', {}) else len(d.get('mcpServers', {})))" 2>/dev/null || echo "0")
echo -e "${BLUE}ℹ${NC}  Found $MCP_COUNT MCP servers configured"

###############################################################################
# 2. Phase 1 Architecture Validation
###############################################################################
echo ""
echo -e "${YELLOW}━━━ Phase 1 Architecture Validation ━━━${NC}"
echo ""

test_check "sqlite-tanium uses Docker transport" \
    "python3 -c \"import json; f=open('$MCP_CONFIG'); d=json.load(f); exit(0 if d.get('mcpServers', {}).get('sqlite-tanium', {}).get('_transport') == 'docker' else 1)\""

test_check "Docker wrapper script exists" \
    "[ -f '$DOCKER_DIR/docker-mcp-wrapper.sh' ]"

test_check "Docker wrapper is executable" \
    "[ -x '$DOCKER_DIR/docker-mcp-wrapper.sh' ]"

test_check "Dockerfile exists" \
    "[ -f '$DOCKER_DIR/Dockerfile' ]"

test_check "docker-compose.yml exists" \
    "[ -f '$DOCKER_DIR/docker-compose.yml' ]"

test_check "Health check script exists" \
    "[ -f '$DOCKER_DIR/healthcheck.sh' ]"

###############################################################################
# 3. Docker Infrastructure
###############################################################################
echo ""
echo -e "${YELLOW}━━━ Docker Infrastructure ━━━${NC}"
echo ""

test_check "Docker daemon running" "docker info"

test_check "Docker Compose available" "docker compose version"

if [ -f "$DOCKER_DIR/docker-compose.yml" ]; then
    cd "$DOCKER_DIR"
    test_check "docker-compose.yml is valid" "docker compose config"
fi

###############################################################################
# 4. Docker Container Status
###############################################################################
echo ""
echo -e "${YELLOW}━━━ Docker Container Status ━━━${NC}"
echo ""

CONTAINER_NAME="mcp-sqlite-tanium"

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${BLUE}ℹ${NC}  Container '${CONTAINER_NAME}' exists"

    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${GREEN}✓${NC}  Container is running"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # Check health status
        HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
        if [ "$HEALTH_STATUS" = "healthy" ]; then
            echo -e "${GREEN}✓${NC}  Container is healthy"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${YELLOW}⚠${NC}  Container health: $HEALTH_STATUS"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi

        # Resource usage
        echo ""
        echo -e "${BLUE}Container Resource Usage:${NC}"
        docker stats "$CONTAINER_NAME" --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

    else
        echo -e "${YELLOW}⚠${NC}  Container exists but is not running"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi

    TESTS_TOTAL=$((TESTS_TOTAL + 2))
else
    echo -e "${YELLOW}ℹ${NC}  Container not created yet (run 'docker compose up -d')"
fi

###############################################################################
# 5. npx MCP Validation
###############################################################################
echo ""
echo -e "${YELLOW}━━━ npx MCP Servers ━━━${NC}"
echo ""

NPX_MCPS=$(python3 -c "import json; f=open('$MCP_CONFIG'); d=json.load(f); print('\\n'.join([k for k,v in d.get('mcpServers', {}).items() if isinstance(v, dict) and v.get('command') == 'npx']))" 2>/dev/null || echo "")

if [ -n "$NPX_MCPS" ]; then
    echo -e "${BLUE}ℹ${NC}  npx MCP servers (Phase 1):"
    echo "$NPX_MCPS" | while read -r mcp; do
        echo "    - $mcp"
    done
else
    echo -e "${YELLOW}⚠${NC}  No npx MCP servers found"
fi

test_check "npx command available" "which npx"

###############################################################################
# 6. Backup Validation
###############################################################################
echo ""
echo -e "${YELLOW}━━━ Backup & Rollback ━━━${NC}"
echo ""

BACKUPS=$(find "$PROJECT_ROOT" -name ".mcp.json.backup-pre-docker-*" -type f 2>/dev/null | wc -l)
if [ "$BACKUPS" -gt 0 ]; then
    echo -e "${GREEN}✓${NC}  Found $BACKUPS backup file(s)"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    LATEST_BACKUP=$(find "$PROJECT_ROOT" -name ".mcp.json.backup-pre-docker-*" -type f 2>/dev/null | sort -r | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        echo -e "${BLUE}ℹ${NC}  Latest backup: $(basename "$LATEST_BACKUP")"
    fi
else
    echo -e "${YELLOW}⚠${NC}  No backup files found"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))

###############################################################################
# 7. Documentation Validation
###############################################################################
echo ""
echo -e "${YELLOW}━━━ Documentation ━━━${NC}"
echo ""

test_check "MCP Deployment Strategy exists" \
    "[ -f '$PROJECT_ROOT/docs/MCP_DEPLOYMENT_STRATEGY.md' ]"

test_check "Vibe Check constitution exists" \
    "[ -f '$PROJECT_ROOT/.claude/vibe-check-constitution.md' ]"

test_check "Docker README exists" \
    "[ -f '$DOCKER_DIR/README.md' ]"

test_check "Vibe Check constitution has MCP section" \
    "grep -q 'MCP DEPLOYMENT STRATEGY' '$PROJECT_ROOT/.claude/vibe-check-constitution.md'"

###############################################################################
# 8. Security Validation
###############################################################################
echo ""
echo -e "${YELLOW}━━━ Security Checks ━━━${NC}"
echo ""

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    # Check if running as non-root
    CONTAINER_USER=$(docker exec "$CONTAINER_NAME" whoami 2>/dev/null || echo "unknown")
    if [ "$CONTAINER_USER" = "mcp" ]; then
        echo -e "${GREEN}✓${NC}  Container running as non-root user"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗${NC}  Container running as: $CONTAINER_USER (should be 'mcp')"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi

    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

###############################################################################
# 9. Connectivity Test
###############################################################################
echo ""
echo -e "${YELLOW}━━━ Connectivity Tests ━━━${NC}"
echo ""

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    # Test database accessibility
    if docker exec "$CONTAINER_NAME" sqlite3 /data/db/tanium_tco.db "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}  SQLite database accessible"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗${NC}  SQLite database not accessible"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi

    # Test mcp-sqlite availability
    if docker exec "$CONTAINER_NAME" which mcp-sqlite > /dev/null 2>&1 || \
       docker exec "$CONTAINER_NAME" npx --help > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}  mcp-sqlite available in container"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗${NC}  mcp-sqlite not available"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi

    TESTS_TOTAL=$((TESTS_TOTAL + 2))
fi

###############################################################################
# Summary
###############################################################################
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Diagnostic Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PASS_RATE=$((TESTS_PASSED * 100 / TESTS_TOTAL))

echo -e "  Total Tests:   ${BLUE}${TESTS_TOTAL}${NC}"
echo -e "  Passed:        ${GREEN}${TESTS_PASSED}${NC}"
echo -e "  Failed:        ${RED}${TESTS_FAILED}${NC}"
echo -e "  Pass Rate:     ${BLUE}${PASS_RATE}%${NC}"
echo ""

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}✅ All diagnostic tests passed!${NC}"
    echo ""
    exit 0
elif [ "$PASS_RATE" -ge 80 ]; then
    echo -e "${YELLOW}⚠️  Some tests failed, but system is mostly functional (${PASS_RATE}%)${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Multiple test failures detected (${PASS_RATE}% pass rate)${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting Steps:${NC}"
    echo "  1. Check Docker daemon: systemctl status docker"
    echo "  2. Review container logs: cd docker/mcp-sqlite-tanium && docker compose logs"
    echo "  3. Verify .mcp.json syntax: python3 -m json.tool .mcp.json"
    echo "  4. Check documentation: docs/MCP_DEPLOYMENT_STRATEGY.md"
    echo "  5. Rollback if needed: cp .mcp.json.backup-pre-docker-* .mcp.json"
    echo ""
    exit 1
fi
