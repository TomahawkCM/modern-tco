#!/bin/sh
# Entrypoint script for mcp-sqlite-tanium container
# Fixes volume permissions and starts mcp-sqlite-server

set -e

# Database directory from environment or default
DB_DIR="${SQLITE_DATABASE_DIR:-/data/db}"
DB_PATH="${SQLITE_DATABASE_PATH:-/data/db/tanium_tco.db}"

echo "🐳 Starting mcp-sqlite-tanium container..."

# Check if running as root to fix permissions
if [ "$(id -u)" = "0" ]; then
    echo "⚠️  Running as root, fixing permissions..."

    # Ensure database directory exists with correct permissions
    mkdir -p "$DB_DIR"
    chown -R mcp:mcp /data
    chmod -R 755 /data

    echo "✅ Permissions fixed, switching to mcp user..."

    # Switch to mcp user and exec the command
    exec su-exec mcp "$@"
else
    echo "✅ Running as mcp user (UID $(id -u))"

    # Ensure database directory exists
    if [ ! -d "$DB_DIR" ]; then
        echo "❌ Database directory $DB_DIR does not exist and cannot create (no permissions)"
        exit 1
    fi

    # Execute the command as current user
    exec "$@"
fi
