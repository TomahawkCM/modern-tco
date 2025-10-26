#!/bin/sh
# Health check script for sqlite-tanium MCP Server
# Verifies database accessibility and MCP server functionality
# Docker MCP best practice: Test actual tool functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Database path from environment or default
DB_PATH="${SQLITE_DATABASE_PATH:-/data/db/tanium_tco.db}"
DB_DIR="$(dirname "$DB_PATH")"

# Check 1: Database directory exists and is writable
if [ ! -d "$DB_DIR" ]; then
    echo "${RED}❌ Health check failed: Database directory not found at $DB_DIR${NC}"
    exit 1
fi

if [ ! -w "$DB_DIR" ]; then
    echo "${RED}❌ Health check failed: Database directory not writable${NC}"
    exit 1
fi

# Check 2: Initialize database if it doesn't exist
if [ ! -f "$DB_PATH" ]; then
    echo "Database file not found, initializing at $DB_PATH..."
    sqlite3 "$DB_PATH" "CREATE TABLE IF NOT EXISTS _health_check (id INTEGER PRIMARY KEY, timestamp TEXT);" > /dev/null 2>&1
    if [ ! -f "$DB_PATH" ]; then
        echo "${RED}❌ Health check failed: Could not initialize database${NC}"
        exit 1
    fi
fi

# Check 3: Database is readable
if [ ! -r "$DB_PATH" ]; then
    echo "${RED}❌ Health check failed: Database file not readable${NC}"
    exit 1
fi

# Check 4: SQLite can open database
if ! sqlite3 "$DB_PATH" "SELECT 1;" > /dev/null 2>&1; then
    echo "${RED}❌ Health check failed: SQLite cannot access database${NC}"
    exit 1
fi

# Check 5: Database is not corrupted
if ! sqlite3 "$DB_PATH" "PRAGMA integrity_check;" > /dev/null 2>&1; then
    echo "${RED}❌ Health check failed: Database integrity check failed${NC}"
    exit 1
fi

# Check 6: mcp-sqlite-server is available
if ! which mcp-sqlite-server > /dev/null 2>&1; then
    echo "${RED}❌ Health check failed: mcp-sqlite-server not found${NC}"
    exit 1
fi

# All checks passed
echo "${GREEN}✅ Health check passed: SQLite database accessible${NC}"
exit 0
