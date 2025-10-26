#!/usr/bin/env bash
set -euo pipefail

# Backwards-compatible shim that delegates to the cross-platform Node launcher.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_LAUNCHER="$SCRIPT_DIR/mcp-devtools-launch.js"

exec node "$NODE_LAUNCHER" "$@"
