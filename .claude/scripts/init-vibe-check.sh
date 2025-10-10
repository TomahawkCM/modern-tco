#!/bin/bash
# Vibe Check MCP Server - Auto-Initialization Script
# Purpose: Load constitutional rules on session start for Tanium TCO LMS
# Author: Claude Code
# Created: 2025-10-08

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CONSTITUTION_FILE="$PROJECT_ROOT/.claude/vibe-check-constitution.md"
CLAUDE_CONFIG="$HOME/.claude.json"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Vibe Check MCP Server - Constitutional Rules Loader${NC}"
echo -e "${BLUE}  Tanium TCO Enterprise LMS - Metacognitive Guardrails${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if Vibe Check server is configured
echo -e "${YELLOW}[1/4]${NC} Checking Vibe Check MCP server configuration..."
if grep -q "pv-bhat-vibe-check-mcp-server" "$CLAUDE_CONFIG" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Vibe Check MCP server found in Claude config"
else
    echo -e "${RED}✗${NC} Vibe Check MCP server not found in Claude config"
    echo -e "${YELLOW}ℹ${NC}  Run: claude mcp add --transport http pv-bhat-vibe-check-mcp-server \"https://server.smithery.ai/@PV-Bhat/vibe-check-mcp-server/mcp\""
    exit 1
fi

# Check if constitutional rules file exists
echo -e "${YELLOW}[2/4]${NC} Checking constitutional rules file..."
if [ -f "$CONSTITUTION_FILE" ]; then
    FILE_SIZE=$(wc -l < "$CONSTITUTION_FILE")
    echo -e "${GREEN}✓${NC} Constitution file found ($FILE_SIZE lines)"
    echo -e "   ${BLUE}→${NC} $CONSTITUTION_FILE"
else
    echo -e "${RED}✗${NC} Constitution file not found"
    echo -e "   ${BLUE}→${NC} Expected: $CONSTITUTION_FILE"
    exit 1
fi

# Display constitution summary
echo -e "${YELLOW}[3/4]${NC} Constitutional Rules Summary..."
echo ""
echo -e "${BLUE}   PROJECT PHASE:${NC} Production Preparation"
echo -e "${BLUE}   PRIORITY:${NC} Content population, testing, deployment"
echo -e "${BLUE}   STATUS:${NC} NOT production-ready"
echo ""
echo -e "${GREEN}   Key Guardrails Active:${NC}"
echo -e "   • Prevent Over-Engineering (11+ contexts exist)"
echo -e "   • Enterprise Security (RLS mandatory)"
echo -e "   • Accessibility Mandate (WCAG 2.1 AA)"
echo -e "   • TypeScript Strict Mode (zero tolerance)"
echo -e "   • Learning Science Integrity (2357 method)"
echo -e "   • Content Quality Standards (no placeholders)"
echo -e "   • Performance Requirements (<3s load, <100ms queries)"
echo -e "   • Testing Mandate (unit + E2E required)"
echo ""

# Display vibe_check triggers
echo -e "${YELLOW}[4/4]${NC} Metacognitive Trigger Points..."
echo ""
echo -e "${BLUE}   Use vibe_check BEFORE:${NC}"
echo -e "   • Adding new React contexts (11+ already exist)"
echo -e "   • Creating database tables/RLS policies"
echo -e "   • Modifying assessment/spaced repetition logic"
echo -e "   • Adding external dependencies"
echo -e "   • Making architectural changes"
echo -e "   • Deploying to production"
echo ""
echo -e "${BLUE}   Use vibe_learn AFTER:${NC}"
echo -e "   • TypeScript error resolutions"
echo -e "   • Accessibility violation fixes"
echo -e "   • Performance optimizations"
echo -e "   • Security patches"
echo -e "   • Test failures and solutions"
echo ""

# Instructions for manual loading
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Initialization Complete${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}ℹ${NC}  Constitutional rules are ready to load"
echo -e "${YELLOW}ℹ${NC}  The Vibe Check MCP server will be available in the next Claude session"
echo ""
echo -e "${BLUE}Quick Start Commands:${NC}"
echo ""
echo -e "  # Check current constitution"
echo -e "  ${GREEN}mcp__pv-bhat-vibe-check-mcp-server__check_constitution${NC}"
echo ""
echo -e "  # Load LMS constitution (copy from: $CONSTITUTION_FILE)"
echo -e "  ${GREEN}mcp__pv-bhat-vibe-check-mcp-server__update_constitution${NC}"
echo ""
echo -e "  # Use metacognitive checkpoint"
echo -e "  ${GREEN}mcp__pv-bhat-vibe-check-mcp-server__vibe_check${NC}"
echo ""
echo -e "  # Learn from patterns"
echo -e "  ${GREEN}mcp__pv-bhat-vibe-check-mcp-server__vibe_learn${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Success exit
exit 0
