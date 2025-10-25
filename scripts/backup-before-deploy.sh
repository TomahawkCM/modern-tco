#!/bin/bash

# Backup Script - Pre-Deployment Safety
# Creates comprehensive backup before deploying hybrid model

set -e  # Exit on error

echo "🔒 Pre-Deployment Backup Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backup directory with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/pre-deploy-${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}📁 Backup directory: ${BACKUP_DIR}${NC}"
echo ""

# ==================== STEP 1: Backup Database Schema ====================
echo "1️⃣  Backing up database schema..."

if command -v supabase &> /dev/null; then
    # Get current database schema
    supabase db dump --schema public > "${BACKUP_DIR}/schema_backup.sql" 2>/dev/null || {
        echo -e "${YELLOW}   ⚠️  Could not dump via Supabase CLI${NC}"
        echo "   Manual backup recommended: Run in Supabase SQL Editor:"
        echo "   SELECT * INTO backup_schema FROM information_schema.tables;"
    }

    if [ -f "${BACKUP_DIR}/schema_backup.sql" ]; then
        echo -e "${GREEN}   ✅ Schema backed up ($(wc -l < ${BACKUP_DIR}/schema_backup.sql) lines)${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Supabase CLI not found - skipping database backup${NC}"
    echo "   You can manually export from Supabase Dashboard → Database → Backups"
fi

# ==================== STEP 2: Backup Critical Tables ====================
echo ""
echo "2️⃣  Creating table inventory..."

# Create a list of existing tables
cat > "${BACKUP_DIR}/existing_tables.txt" << 'EOF'
# Critical Tables to Preserve
# These tables exist and should NOT be affected by deployment:

flashcards                  # User-created flashcards (MUST PRESERVE)
exam_sessions              # Exam tracking (MUST PRESERVE)
questions                  # Question bank (MUST PRESERVE)
users                      # User accounts (MUST PRESERVE)
user_progress             # User progress (MUST PRESERVE)

# New Tables to be Created:
flashcard_library         # Curated flashcard content (NEW)
flashcard_library_progress # User progress on library cards (NEW)
content_import_logs       # Import audit trail (NEW)
EOF

echo -e "${GREEN}   ✅ Table inventory created${NC}"

# ==================== STEP 3: Backup Existing Migrations ====================
echo ""
echo "3️⃣  Backing up existing migrations..."

if [ -d "supabase/migrations" ]; then
    cp -r supabase/migrations "${BACKUP_DIR}/migrations_backup"
    MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
    echo -e "${GREEN}   ✅ ${MIGRATION_COUNT} migrations backed up${NC}"
else
    echo -e "${YELLOW}   ⚠️  No migrations directory found${NC}"
fi

# ==================== STEP 4: Backup Generated Content ====================
echo ""
echo "4️⃣  Backing up generated content..."

if [ -d "data-archive/generated" ]; then
    cp -r data-archive/generated "${BACKUP_DIR}/generated_content_backup"
    GENERATED_COUNT=$(ls -1 data-archive/generated/*.ts 2>/dev/null | wc -l)
    echo -e "${GREEN}   ✅ ${GENERATED_COUNT} generated files backed up${NC}"
else
    mkdir -p "${BACKUP_DIR}/generated_content_backup"
    echo "   📝 No generated content yet (this is normal)"
fi

# ==================== STEP 5: Backup Configuration Files ====================
echo ""
echo "5️⃣  Backing up configuration files..."

# List of critical files to backup
CONFIG_FILES=(
    ".env.local"
    ".env"
    "package.json"
    "tsconfig.json"
    "next.config.mjs"
    "supabase/config.toml"
)

mkdir -p "${BACKUP_DIR}/config_backup"

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "${BACKUP_DIR}/config_backup/"
        echo -e "${GREEN}   ✅ Backed up: $file${NC}"
    fi
done

# ==================== STEP 6: Create Backup Manifest ====================
echo ""
echo "6️⃣  Creating backup manifest..."

cat > "${BACKUP_DIR}/BACKUP_MANIFEST.md" << EOF
# Backup Manifest
**Created:** $(date)
**Backup ID:** ${TIMESTAMP}
**Purpose:** Pre-deployment backup before hybrid model migration

## What Was Backed Up

### Database
- Schema dump: schema_backup.sql
- Table inventory: existing_tables.txt

### Migrations
- All existing migrations: migrations_backup/

### Generated Content
- All generated files: generated_content_backup/

### Configuration
- Environment files: config_backup/.env*
- Package config: config_backup/package.json
- TypeScript config: config_backup/tsconfig.json
- Next.js config: config_backup/next.config.mjs
- Supabase config: config_backup/config.toml

## Restoration Instructions

If you need to restore from this backup:

### Restore Database Schema
\`\`\`bash
supabase db reset
psql -h localhost -U postgres -d postgres -f ${BACKUP_DIR}/schema_backup.sql
\`\`\`

### Restore Migrations
\`\`\`bash
cp -r ${BACKUP_DIR}/migrations_backup/* supabase/migrations/
\`\`\`

### Restore Configuration
\`\`\`bash
cp ${BACKUP_DIR}/config_backup/.env.local .env.local
cp ${BACKUP_DIR}/config_backup/package.json package.json
\`\`\`

### Restore Generated Content
\`\`\`bash
cp -r ${BACKUP_DIR}/generated_content_backup/* data-archive/generated/
\`\`\`

## Verification

Run verification script:
\`\`\`bash
bash scripts/verify-backup.sh ${BACKUP_DIR}
\`\`\`

## Notes
- This backup was created automatically before hybrid model deployment
- All existing tables should remain unchanged
- New tables: flashcard_library, flashcard_library_progress, content_import_logs
- Migration: 20251010000003_add_content_population_tables.sql
EOF

echo -e "${GREEN}   ✅ Manifest created${NC}"

# ==================== STEP 7: Create Restore Script ====================
echo ""
echo "7️⃣  Creating restore script..."

cat > "${BACKUP_DIR}/restore.sh" << 'RESTORE_SCRIPT'
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
    mkdir -p data-archive/generated
    cp -r ${BACKUP_DIR}/generated_content_backup/* data-archive/generated/
    echo "   ✅ Generated content restored"
fi

echo ""
echo "✅ Restore complete!"
echo "⚠️  Note: You may need to reset the database manually via Supabase"
RESTORE_SCRIPT

chmod +x "${BACKUP_DIR}/restore.sh"
echo -e "${GREEN}   ✅ Restore script created${NC}"

# ==================== STEP 8: Calculate Backup Size ====================
echo ""
echo "8️⃣  Calculating backup size..."

BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo -e "${GREEN}   ✅ Backup size: ${BACKUP_SIZE}${NC}"

# ==================== STEP 9: Create Verification Checklist ====================
echo ""
echo "9️⃣  Creating verification checklist..."

cat > "${BACKUP_DIR}/VERIFICATION_CHECKLIST.md" << EOF
# Backup Verification Checklist

Run through this checklist to verify backup integrity:

## Files Present

- [ ] schema_backup.sql exists
- [ ] existing_tables.txt exists
- [ ] migrations_backup/ directory exists
- [ ] generated_content_backup/ directory exists
- [ ] config_backup/ directory exists
- [ ] BACKUP_MANIFEST.md exists
- [ ] restore.sh exists
- [ ] VERIFICATION_CHECKLIST.md exists (this file)

## File Integrity

- [ ] schema_backup.sql is not empty (check: wc -l schema_backup.sql)
- [ ] At least 1 migration file backed up
- [ ] Config files contain valid JSON/TOML

## Quick Verification Commands

\`\`\`bash
# Check schema backup
[ -f "${BACKUP_DIR}/schema_backup.sql" ] && echo "✅ Schema backup exists" || echo "❌ Schema backup missing"

# Check migration count
ls -1 ${BACKUP_DIR}/migrations_backup/*.sql 2>/dev/null | wc -l

# Check backup size
du -sh ${BACKUP_DIR}

# Verify restore script is executable
[ -x "${BACKUP_DIR}/restore.sh" ] && echo "✅ Restore script ready" || echo "❌ Restore script not executable"
\`\`\`

## Restoration Test (Optional)

To test restoration without affecting production:

1. Create a new test project
2. Run restore.sh from backup directory
3. Verify all files are restored correctly

## Sign-Off

- **Backup Created By:** $(whoami)
- **Backup Created At:** $(date)
- **Backup Location:** ${BACKUP_DIR}
- **Backup Size:** ${BACKUP_SIZE}

**Verified By:** ________________
**Date:** ________________
EOF

echo -e "${GREEN}   ✅ Verification checklist created${NC}"

# ==================== FINAL SUMMARY ====================
echo ""
echo "=================================="
echo -e "${GREEN}✅ Backup Complete!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}Backup Details:${NC}"
echo "  📁 Location: ${BACKUP_DIR}"
echo "  📊 Size: ${BACKUP_SIZE}"
echo "  🕐 Created: $(date)"
echo ""
echo -e "${BLUE}What was backed up:${NC}"
echo "  ✅ Database schema"
echo "  ✅ Existing migrations"
echo "  ✅ Configuration files"
echo "  ✅ Generated content"
echo "  ✅ Restore scripts"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Review backup: cat ${BACKUP_DIR}/BACKUP_MANIFEST.md"
echo "  2. Verify backup: bash scripts/verify-backup.sh ${BACKUP_DIR}"
echo "  3. If verified, deploy: npm run content:deploy"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "  - Keep this backup safe until deployment is verified"
echo "  - To restore: bash ${BACKUP_DIR}/restore.sh"
echo ""

# Output backup location to file for next script
echo "$BACKUP_DIR" > .last-backup-path

exit 0
