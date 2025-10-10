#!/bin/bash
# Docker MCP Wrapper Script for sqlite-tanium
# Bridges Claude Code .mcp.json stdio transport to Docker container
# Phase 1: Hybrid Architecture

set -e

# Container name
CONTAINER_NAME="mcp-sqlite-tanium"
COMPOSE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ensure container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "🐳 Starting ${CONTAINER_NAME} container..." >&2
    cd "$COMPOSE_DIR"
    docker compose up -d

    # Wait for health check
    echo "⏳ Waiting for container to be healthy..." >&2
    timeout=30
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null | grep -q "healthy"; then
            echo "✅ Container is healthy and ready" >&2
            break
        fi
        sleep 1
        elapsed=$((elapsed + 1))
    done

    if [ $elapsed -ge $timeout ]; then
        echo "❌ Container failed to become healthy within ${timeout}s" >&2
        docker compose logs --tail=50 "$CONTAINER_NAME" >&2
        exit 1
    fi
fi

# Forward stdio to Docker container
# This script acts as a bridge between Claude Code and the Docker container
# Use pre-installed mcp-sqlite-server (no npx needed)
docker exec -i "$CONTAINER_NAME" mcp-sqlite-server "$@"
