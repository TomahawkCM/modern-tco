#!/bin/bash

# Restore Script - Use with caution!
# This will restore the system to pre-deployment state

echo "⚠️  WARNING: This will restore the system to pre-deployment state"
echo ""
read -p "Are you sure you want to restore? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

BACKUP_DIR=$(dirname "$0")

echo ""
echo "🔄 Restoring from backup..."

# Restore migrations
if [ -d "${BACKUP_DIR}/migrations_backup" ]; then
    echo "1️⃣  Restoring migrations..."
    cp -r ${BACKUP_DIR}/migrations_backup/* supabase/migrations/
    echo "   ✅ Migrations restored"
fi

# Restore configuration
if [ -d "${BACKUP_DIR}/config_backup" ]; then
    echo "2️⃣  Restoring configuration..."
    [ -f "${BACKUP_DIR}/config_backup/.env.local" ] && cp ${BACKUP_DIR}/config_backup/.env.local .env.local
    [ -f "${BACKUP_DIR}/config_backup/package.json" ] && cp ${BACKUP_DIR}/config_backup/package.json package.json
    echo "   ✅ Configuration restored"
fi

# Restore generated content
if [ -d "${BACKUP_DIR}/generated_content_backup" ]; then
    echo "3️⃣  Restoring generated content..."
    mkdir -p src/data/generated
    cp -r ${BACKUP_DIR}/generated_content_backup/* src/data/generated/
    echo "   ✅ Generated content restored"
fi

echo ""
echo "✅ Restore complete!"
echo "⚠️  Note: You may need to reset the database manually via Supabase"
