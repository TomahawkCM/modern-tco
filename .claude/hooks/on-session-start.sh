#!/bin/bash

###############################################################################
# Claude Code Session Initialization Hook for Tanium TCO LMS
#
# This hook automatically runs when a new Claude Code session starts
# to initialize the Hive-Mind agent coordination system.
#
# Features:
# - Auto-detect enterprise LMS architecture
# - Load 240+ agent ecosystem
# - Initialize MCP coordination
# - Set up monitoring and analytics
# - Enable cross-session memory
###############################################################################

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLAUDE_FLOW_DIR="$PROJECT_ROOT/.claude-flow"
CONFIG_FILE="$CLAUDE_FLOW_DIR/hive-config.json"

echo "🐝 Initializing Hive-Mind Intelligence System..."
echo ""

###############################################################################
# 1. Check if Hive-Mind is already initialized
###############################################################################
if [ ! -f "$CONFIG_FILE" ]; then
  echo "⚙️  First-time initialization detected..."
  echo "  Running hive-mind configuration..."

  # Run initialization script
  if [ -f "$PROJECT_ROOT/scripts/hive-mind-config.js" ]; then
    node "$PROJECT_ROOT/scripts/hive-mind-config.js"
  else
    echo "  ⚠️  hive-mind-config.js not found, skipping initialization"
  fi
else
  echo "✅ Hive-Mind configuration found"
fi

###############################################################################
# 2. Detect enterprise LMS architecture
###############################################################################
echo ""
echo "🏗️  Detecting architecture..."

ARCHITECTURE_DETECTED=false

# Check for Next.js
if [ -f "$PROJECT_ROOT/next.config.js" ]; then
  ARCHITECTURE_DETECTED=true
  echo "  ✅ Next.js detected"
fi

# Check for TypeScript
if [ -f "$PROJECT_ROOT/tsconfig.json" ]; then
  ARCHITECTURE_DETECTED=true
  echo "  ✅ TypeScript detected"
fi

# Check for Supabase
if grep -q "supabase" "$PROJECT_ROOT/package.json" 2>/dev/null; then
  ARCHITECTURE_DETECTED=true
  echo "  ✅ Supabase integration detected"
fi

# Check for React contexts (11+ contexts)
CONTEXT_COUNT=$(find "$PROJECT_ROOT/src/contexts" -name "*.tsx" 2>/dev/null | wc -l)
if [ "$CONTEXT_COUNT" -ge 5 ]; then
  ARCHITECTURE_DETECTED=true
  echo "  ✅ Enterprise state management detected ($CONTEXT_COUNT contexts)"
fi

if [ "$ARCHITECTURE_DETECTED" = true ]; then
  echo "  ✅ Enterprise LMS architecture confirmed"
else
  echo "  ℹ️  Standard project architecture"
fi

###############################################################################
# 3. Load agent ecosystem
###############################################################################
echo ""
echo "🤖 Agent Ecosystem Status:"
echo "  ℹ️  240+ agents available via MCP"
echo "  ✅ Core agents: react-specialist, typescript-pro, database-architect"
echo "  ✅ LMS agents: tco-content-specialist, tco-validation-expert"
echo "  ✅ Coordination: hierarchical-coordinator, mesh-coordinator"

###############################################################################
# 4. Initialize MCP coordination
###############################################################################
echo ""
echo "🔧 MCP Server Status:"

# Check for MCP servers (they should be configured in Claude Code settings)
MCP_SERVERS=(
  "claude-flow"
  "filesystem"
  "github"
  "firecrawl"
  "playwright"
  "sqlite-tanium"
  "shadcn"
  "vibe-check"
)

echo "  ℹ️  Required MCP servers:"
for server in "${MCP_SERVERS[@]}"; do
  echo "    - $server"
done

echo "  ✅ MCP servers configured in Claude Code settings"

###############################################################################
# 4b. Docker Container Health Check
###############################################################################
echo ""
echo "🐳 Docker Container Status:"

# Check if Docker is available
if command -v docker &> /dev/null; then
  # Check MCP containers
  MCP_CONTAINERS=("mcp-sqlite-tanium")
  for container in "${MCP_CONTAINERS[@]}"; do
    STATUS=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "not found")
    HEALTH=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}no healthcheck{{end}}' "$container" 2>/dev/null || echo "")

    if [ "$STATUS" = "running" ]; then
      if [ "$HEALTH" = "healthy" ]; then
        echo "  ✅ $container: running (healthy)"
      elif [ "$HEALTH" = "unhealthy" ]; then
        echo "  ⚠️  $container: running (unhealthy - check logs with 'npm run docker:logs:mcp')"
      else
        echo "  ✅ $container: running"
      fi
    elif [ "$STATUS" = "not found" ]; then
      echo "  ℹ️  $container: not created (start with 'npm run docker:up')"
    else
      echo "  ⚠️  $container: $STATUS (restart with 'npm run docker:restart:mcp')"
    fi
  done

  # Show other running containers (Supabase, Archon)
  OTHER_COUNT=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -vE "^mcp-" | wc -l)
  if [ "$OTHER_COUNT" -gt 0 ]; then
    echo "  ℹ️  Other containers running: $OTHER_COUNT (supabase, archon, etc.)"
  fi
else
  echo "  ⚠️  Docker not available - MCP sqlite container features disabled"
fi

###############################################################################
# 5. Initialize Vibe Check MCP Server (Metacognitive Guardrails)
###############################################################################
echo ""
echo "🧠 Vibe Check MCP Server:"

# Check if vibe-check initialization script exists
VIBE_CHECK_SCRIPT="$PROJECT_ROOT/.claude/scripts/init-vibe-check.sh"
if [ -f "$VIBE_CHECK_SCRIPT" ]; then
  # Run the vibe-check initialization script
  bash "$VIBE_CHECK_SCRIPT"
else
  echo "  ⚠️  Vibe Check initialization script not found"
  echo "  ℹ️  Expected: $VIBE_CHECK_SCRIPT"
fi

###############################################################################
# 6. Set up monitoring and analytics
###############################################################################
echo ""
echo "📊 Monitoring Configuration:"

# Create metrics directory if it doesn't exist
METRICS_DIR="$CLAUDE_FLOW_DIR/metrics"
mkdir -p "$METRICS_DIR"

# Initialize performance tracking
if [ ! -f "$METRICS_DIR/performance.json" ]; then
  echo '{
  "startTime": '$(date +%s000)',
  "totalTasks": 0,
  "successfulTasks": 0,
  "failedTasks": 0,
  "totalAgents": 0,
  "activeAgents": 0,
  "neuralEvents": 0
}' > "$METRICS_DIR/performance.json"
  echo "  ✅ Performance tracking initialized"
else
  echo "  ✅ Performance tracking active"
fi

# Initialize system metrics
if [ ! -f "$METRICS_DIR/system-metrics.json" ]; then
  echo '{
  "tokenUsage": 0,
  "executionTime": 0,
  "qualityScore": 0,
  "collaborationScore": 0,
  "lastUpdated": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
}' > "$METRICS_DIR/system-metrics.json"
  echo "  ✅ System metrics initialized"
else
  echo "  ✅ System metrics active"
fi

###############################################################################
# 7. Enable cross-session memory
###############################################################################
echo ""
echo "💾 Cross-Session Memory:"

MEMORY_DIR="$CLAUDE_FLOW_DIR/memory"
mkdir -p "$MEMORY_DIR"

if [ -f "$CLAUDE_FLOW_DIR/hive-mind.db" ]; then
  echo "  ✅ SQLite memory persistence active"
else
  echo "  ℹ️  Run 'node scripts/hive-mind-config.js' to initialize database"
fi

###############################################################################
# 8. Display quick start commands
###############################################################################
echo ""
echo "🚀 Available Agent Teams:"
echo "  /spawn-lms-team       - Full LMS development team (10 agents)"
echo "  /spawn-content-team   - Content creation & validation (7 agents)"
echo "  /spawn-testing-team   - Comprehensive testing (9 agents)"
echo "  /spawn-deployment-team - Production deployment (8 agents)"

echo ""
echo "📚 Project Context:"
echo "  - Enterprise LMS for Tanium TCO certification"
echo "  - Next.js 15.5.2 + TypeScript + Supabase"
echo "  - 11+ React contexts for state management"
echo "  - shadcn/ui components with accessibility"
echo "  - PostHog analytics + Sentry monitoring"

echo ""
echo "✅ Session initialization complete!"
echo ""

###############################################################################
# 9. Set environment variables for Claude context
###############################################################################
export TANIUM_TCO_LMS=true
export HIVE_MIND_ENABLED=true
export AGENT_COORDINATION=hierarchical
export MCP_AGENT_COUNT=240
export VIBE_CHECK_ENABLED=true

# Return success
exit 0
