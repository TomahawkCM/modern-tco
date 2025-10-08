#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: scripts/codex-run-mcp.sh <prompt-file>" >&2
  exit 1
fi

PROMPT_FILE=$1
if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Prompt not found: $PROMPT_FILE" >&2
  exit 1
fi

MCP_CONFIG=".mcp.codex.json"
if [[ ! -f "$MCP_CONFIG" ]]; then
  echo "Missing MCP config: $MCP_CONFIG" >&2
  exit 1
fi

# Populate env vars from existing environment or fallback to .env.local
read_env() {
  local key=$1
  local val=""
  if [[ -f .env.local ]]; then
    val=$(grep -E "^${key}=" .env.local | head -n1 | sed -E "s/^${key}=//") || true
  fi
  echo "$val"
}

SUPABASE_URL_VAL=${SUPABASE_URL:-$(read_env SUPABASE_URL)}
SUPABASE_ANON_KEY_VAL=${SUPABASE_ANON_KEY:-$(read_env SUPABASE_ANON_KEY)}
SUPABASE_SERVICE_KEY_VAL=${SUPABASE_SERVICE_KEY:-$(read_env SUPABASE_SERVICE_KEY)}
SUPABASE_SERVICE_ROLE_KEY_VAL=${SUPABASE_SERVICE_ROLE_KEY:-$(read_env SUPABASE_SERVICE_ROLE_KEY)}
DATABASE_URL_VAL=${DATABASE_URL:-$(read_env SUPABASE_DB_URL)}
FIRECRAWL_API_KEY_VAL=${FIRECRAWL_API_KEY:-$(read_env FIRECRAWL_API_KEY)}
MCP_API_KEY_VAL=${MCP_API_KEY:-$(read_env MCP_API_KEY)}

echo "Running Codex with MCP config: $MCP_CONFIG"

# Try to detect --mcp-config support
MCP_FLAG=()
if codex --help 2>/dev/null | grep -q "mcp-config"; then
  MCP_FLAG=(--mcp-config "$MCP_CONFIG")
fi

MCP_CONFIG_PATH="$MCP_CONFIG" \
ANTHROPIC_MCP_CONFIG="$MCP_CONFIG" \
CLAUDE_MCP_CONFIG="$MCP_CONFIG" \
SUPABASE_URL="$SUPABASE_URL_VAL" \
SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY_VAL" \
SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY_VAL" \
SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY_VAL" \
DATABASE_URL="$DATABASE_URL_VAL" \
FIRECRAWL_API_KEY="$FIRECRAWL_API_KEY_VAL" \
MCP_API_KEY="$MCP_API_KEY_VAL" \
codex -a never exec \
  --skip-git-repo-check \
  --sandbox danger-full-access \
  --config model="gpt-5" \
  --config model_reasoning_effort="high" \
  "$(cat "$PROMPT_FILE")"
