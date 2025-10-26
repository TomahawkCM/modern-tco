#!/bin/bash

# Backup Verification Script
# Verifies integrity of backup before deployment

set -e

echo "🔍 Backup Verification Script"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get backup directory
if [ -z "$1" ]; then
    # Try to get last backup path
    if [ -f ".last-backup-path" ]; then
        BACKUP_DIR=$(cat .last-backup-path)
        echo -e "${BLUE}Using last backup: ${BACKUP_DIR}${NC}"
    else
        echo -e "${RED}❌ Error: No backup directory specified${NC}"
        echo ""
        echo "Usage: bash scripts/verify-backup.sh <backup-directory>"
        echo "Example: bash scripts/verify-backup.sh backups/pre-deploy-20251010_123456"
        exit 1
    fi
else
    BACKUP_DIR="$1"
fi

if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ Error: Backup directory not found: ${BACKUP_DIR}${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Verifying backup: ${BACKUP_DIR}${NC}"
echo ""

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# ==================== TEST 1: Essential Files ====================
echo "1️⃣  Checking essential files..."

ESSENTIAL_FILES=(
    "BACKUP_MANIFEST.md"
    "VERIFICATION_CHECKLIST.md"
    "restore.sh"
    "existing_tables.txt"
)

for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "${BACKUP_DIR}/${file}" ]; then
        echo -e "   ${GREEN}✅ ${file}${NC}"
        ((PASSED++))
    else
        echo -e "   ${RED}❌ ${file} - MISSING${NC}"
        ((FAILED++))
    fi
done

# ==================== TEST 2: Schema Backup ====================
echo ""
echo "2️⃣  Checking schema backup..."

if [ -f "${BACKUP_DIR}/schema_backup.sql" ]; then
    LINE_COUNT=$(wc -l < "${BACKUP_DIR}/schema_backup.sql")
    if [ "$LINE_COUNT" -gt 10 ]; then
        echo -e "   ${GREEN}✅ Schema backup exists (${LINE_COUNT} lines)${NC}"
        ((PASSED++))
    else
        echo -e "   ${YELLOW}⚠️  Schema backup exists but seems small (${LINE_COUNT} lines)${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "   ${YELLOW}⚠️  Schema backup not found (may require manual backup)${NC}"
    ((WARNINGS++))
fi

# ==================== TEST 3: Migrations Backup ====================
echo ""
echo "3️⃣  Checking migrations backup..."

if [ -d "${BACKUP_DIR}/migrations_backup" ]; then
    MIGRATION_COUNT=$(ls -1 "${BACKUP_DIR}/migrations_backup"/*.sql 2>/dev/null | wc -l)
    if [ "$MIGRATION_COUNT" -gt 0 ]; then
        echo -e "   ${GREEN}✅ Migrations backed up (${MIGRATION_COUNT} files)${NC}"
        ((PASSED++))

        # List migrations
        echo "   Migration files:"
        ls -1 "${BACKUP_DIR}/migrations_backup"/*.sql 2>/dev/null | head -5 | while read file; do
            echo "     - $(basename $file)"
        done
        if [ "$MIGRATION_COUNT" -gt 5 ]; then
            echo "     ... and $((MIGRATION_COUNT - 5)) more"
        fi
    else
        echo -e "   ${YELLOW}⚠️  No migration files found${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "   ${YELLOW}⚠️  Migrations directory not found${NC}"
    ((WARNINGS++))
fi

# ==================== TEST 4: Configuration Backup ====================
echo ""
echo "4️⃣  Checking configuration backup..."

if [ -d "${BACKUP_DIR}/config_backup" ]; then
    CONFIG_COUNT=$(ls -1 "${BACKUP_DIR}/config_backup" 2>/dev/null | wc -l)
    echo -e "   ${GREEN}✅ Configuration backed up (${CONFIG_COUNT} files)${NC}"
    ((PASSED++))

    # Check critical config files
    CRITICAL_CONFIGS=("package.json" "tsconfig.json")
    for config in "${CRITICAL_CONFIGS[@]}"; do
        if [ -f "${BACKUP_DIR}/config_backup/${config}" ]; then
            echo -e "     ${GREEN}✅ ${config}${NC}"
        else
            echo -e "     ${YELLOW}⚠️  ${config} not backed up${NC}"
        fi
    done
else
    echo -e "   ${RED}❌ Configuration directory not found${NC}"
    ((FAILED++))
fi

# ==================== TEST 5: Generated Content ====================
echo ""
echo "5️⃣  Checking generated content backup..."

if [ -d "${BACKUP_DIR}/generated_content_backup" ]; then
    GENERATED_COUNT=$(ls -1 "${BACKUP_DIR}/generated_content_backup"/*.ts 2>/dev/null | wc -l)
    if [ "$GENERATED_COUNT" -gt 0 ]; then
        echo -e "   ${GREEN}✅ Generated content backed up (${GENERATED_COUNT} files)${NC}"
        ((PASSED++))
    else
        echo -e "   ${BLUE}📝 No generated content yet (this is normal for first deployment)${NC}"
        ((PASSED++))
    fi
else
    echo -e "   ${RED}❌ Generated content directory not found${NC}"
    ((FAILED++))
fi

# ==================== TEST 6: Restore Script ====================
echo ""
echo "6️⃣  Checking restore script..."

if [ -f "${BACKUP_DIR}/restore.sh" ]; then
    if [ -x "${BACKUP_DIR}/restore.sh" ]; then
        echo -e "   ${GREEN}✅ Restore script exists and is executable${NC}"
        ((PASSED++))
    else
        echo -e "   ${YELLOW}⚠️  Restore script exists but not executable${NC}"
        echo "      Fix: chmod +x ${BACKUP_DIR}/restore.sh"
        ((WARNINGS++))
    fi
else
    echo -e "   ${RED}❌ Restore script not found${NC}"
    ((FAILED++))
fi

# ==================== TEST 7: Backup Size ====================
echo ""
echo "7️⃣  Checking backup size..."

BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "unknown")
BACKUP_SIZE_BYTES=$(du -sb "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")

if [ "$BACKUP_SIZE_BYTES" -gt 1024 ]; then
    echo -e "   ${GREEN}✅ Backup size: ${BACKUP_SIZE}${NC}"
    ((PASSED++))
else
    echo -e "   ${YELLOW}⚠️  Backup seems very small: ${BACKUP_SIZE}${NC}"
    ((WARNINGS++))
fi

# ==================== TEST 8: File Integrity ====================
echo ""
echo "8️⃣  Checking file integrity..."

# Check for empty files
EMPTY_COUNT=0
while IFS= read -r -d '' file; do
    if [ ! -s "$file" ]; then
        if [ $EMPTY_COUNT -eq 0 ]; then
            echo "   Empty files found:"
        fi
        echo -e "     ${YELLOW}⚠️  $(basename $file)${NC}"
        ((EMPTY_COUNT++))
    fi
done < <(find "$BACKUP_DIR" -type f -print0 2>/dev/null)

if [ $EMPTY_COUNT -eq 0 ]; then
    echo -e "   ${GREEN}✅ No empty files found${NC}"
    ((PASSED++))
else
    echo -e "   ${YELLOW}⚠️  Found ${EMPTY_COUNT} empty file(s)${NC}"
    ((WARNINGS++))
fi

# ==================== TEST 9: Critical Tables List ====================
echo ""
echo "9️⃣  Checking critical tables inventory..."

if [ -f "${BACKUP_DIR}/existing_tables.txt" ]; then
    if grep -q "flashcards" "${BACKUP_DIR}/existing_tables.txt" && \
       grep -q "exam_sessions" "${BACKUP_DIR}/existing_tables.txt" && \
       grep -q "questions" "${BACKUP_DIR}/existing_tables.txt"; then
        echo -e "   ${GREEN}✅ Critical tables documented${NC}"
        ((PASSED++))
    else
        echo -e "   ${YELLOW}⚠️  Some critical tables may not be documented${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "   ${RED}❌ Tables inventory not found${NC}"
    ((FAILED++))
fi

# ==================== SUMMARY ====================
echo ""
echo "=================================="
echo "📊 Verification Summary"
echo "=================================="
echo ""
echo -e "${GREEN}Passed:   ${PASSED}${NC}"
echo -e "${YELLOW}Warnings: ${WARNINGS}${NC}"
echo -e "${RED}Failed:   ${FAILED}${NC}"
echo ""

TOTAL_TESTS=$((PASSED + WARNINGS + FAILED))
SCORE=$((PASSED * 100 / TOTAL_TESTS))

echo "Overall Score: ${SCORE}%"
echo ""

# ==================== RECOMMENDATIONS ====================
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ VERIFICATION FAILED${NC}"
    echo ""
    echo "Critical issues found. Recommendations:"
    echo "  1. Re-run backup: bash scripts/backup-before-deploy.sh"
    echo "  2. Check Supabase connection"
    echo "  3. Ensure all files are accessible"
    echo ""
    echo "DO NOT PROCEED with deployment until issues are resolved."
    exit 1
elif [ $WARNINGS -gt 3 ]; then
    echo -e "${YELLOW}⚠️  VERIFICATION PASSED WITH WARNINGS${NC}"
    echo ""
    echo "Backup is functional but has some warnings."
    echo "Review warnings above before proceeding."
    echo ""
    echo "Proceed with deployment? (Recommended: Fix warnings first)"
    exit 0
else
    echo -e "${GREEN}✅ VERIFICATION PASSED${NC}"
    echo ""
    echo "Backup is verified and ready!"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Review backup manifest: cat ${BACKUP_DIR}/BACKUP_MANIFEST.md"
    echo "  2. Deploy hybrid model: npm run content:deploy"
    echo "  3. Keep backup safe until deployment verified"
    echo ""
    echo -e "${GREEN}You are safe to proceed with deployment!${NC}"
    exit 0
fi
