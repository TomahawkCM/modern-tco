#!/bin/bash
# Quick project health check on session start
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Check node_modules
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  echo "Warning: node_modules missing. Run: npm install"
fi

# Check env file
if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
  echo "Warning: .env.local missing (needed for Supabase, API keys)"
fi

# Git context
BRANCH=$(git -C "$PROJECT_ROOT" branch --show-current 2>/dev/null || echo "unknown")
CHANGED=$(git -C "$PROJECT_ROOT" status --short 2>/dev/null | wc -l | tr -d ' ')
echo "Branch: $BRANCH | Changed files: $CHANGED"

exit 0
