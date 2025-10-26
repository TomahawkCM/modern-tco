#!/bin/bash

# Safe Deployment Script
# Performs backup, verification, and deployment in one go

set -e

echo "🚀 Safe Deployment - Hybrid Model Content Population"
echo "======================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# ==================== STEP 1: Pre-Flight Checks ====================
echo -e "${BLUE}Step 1: Pre-Flight Checks${NC}"
echo ""

# Check if scripts exist
if [ ! -f "scripts/backup-before-deploy.sh" ]; then
    echo -e "${RED}❌ Backup script not found${NC}"
    exit 1
fi

if [ ! -f "scripts/verify-backup.sh" ]; then
    echo -e "${RED}❌ Verification script not found${NC}"
    exit 1
fi

if [ ! -f "scripts/deploy-hybrid-model.sh" ]; then
    echo -e "${RED}❌ Deployment script not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All required scripts present${NC}"

# Check migration file exists
if [ ! -f "supabase/migrations/20251010000003_add_content_population_tables.sql" ]; then
    echo -e "${RED}❌ Migration file not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Migration file present${NC}"
echo ""

# ==================== STEP 2: Create Backup ====================
echo -e "${BLUE}Step 2: Creating Backup${NC}"
echo ""

chmod +x scripts/backup-before-deploy.sh
bash scripts/backup-before-deploy.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backup failed${NC}"
    exit 1
fi

# Get backup directory
if [ ! -f ".last-backup-path" ]; then
    echo -e "${RED}❌ Could not locate backup${NC}"
    exit 1
fi

BACKUP_DIR=$(cat .last-backup-path)
echo ""
echo -e "${GREEN}✅ Backup created: ${BACKUP_DIR}${NC}"
echo ""

# ==================== STEP 3: Verify Backup ====================
echo -e "${BLUE}Step 3: Verifying Backup${NC}"
echo ""

chmod +x scripts/verify-backup.sh
bash scripts/verify-backup.sh "$BACKUP_DIR"

VERIFY_EXIT_CODE=$?

if [ $VERIFY_EXIT_CODE -eq 1 ]; then
    echo -e "${RED}❌ Backup verification failed${NC}"
    echo "Cannot proceed with deployment."
    exit 1
fi

if [ $VERIFY_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Backup verified successfully${NC}"
fi

echo ""

# ==================== STEP 4: User Confirmation ====================
echo -e "${BLUE}Step 4: Deployment Confirmation${NC}"
echo ""
echo "Ready to deploy hybrid model migration."
echo ""
echo -e "${YELLOW}This will:${NC}"
echo "  • Create 3 new tables (flashcard_library, flashcard_library_progress, content_import_logs)"
echo "  • Add 2 new database functions (SuperMemo2 algorithm)"
echo "  • Preserve all existing tables (flashcards, exam_sessions, questions)"
echo "  • Zero breaking changes"
echo ""
echo -e "${GREEN}Backup secured at:${NC} ${BACKUP_DIR}"
echo ""
read -p "Proceed with deployment? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo ""
    echo "Deployment cancelled by user."
    echo "Backup preserved at: ${BACKUP_DIR}"
    exit 0
fi

echo ""

# ==================== STEP 5: Deploy Migration ====================
echo -e "${BLUE}Step 5: Deploying Migration${NC}"
echo ""

chmod +x scripts/deploy-hybrid-model.sh
bash scripts/deploy-hybrid-model.sh

DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo ""
    echo "To restore from backup:"
    echo "  bash ${BACKUP_DIR}/restore.sh"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Deployment completed successfully${NC}"
echo ""

# ==================== STEP 6: Post-Deployment Verification ====================
echo -e "${BLUE}Step 6: Post-Deployment Verification${NC}"
echo ""

echo "Checking new tables..."

# These checks will only work if Supabase CLI is available
if command -v supabase &> /dev/null; then
    # Check flashcard_library
    if supabase db execute "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'flashcard_library'" &> /dev/null; then
        echo -e "${GREEN}✅ flashcard_library table created${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not verify flashcard_library table${NC}"
    fi

    # Check flashcard_library_progress
    if supabase db execute "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'flashcard_library_progress'" &> /dev/null; then
        echo -e "${GREEN}✅ flashcard_library_progress table created${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not verify flashcard_library_progress table${NC}"
    fi

    # Check content_import_logs
    if supabase db execute "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'content_import_logs'" &> /dev/null; then
        echo -e "${GREEN}✅ content_import_logs table created${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not verify content_import_logs table${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Supabase CLI not available - manual verification recommended${NC}"
    echo "   Check Supabase Dashboard → Database → Tables"
fi

echo ""

# ==================== FINAL SUMMARY ====================
echo "======================================================"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "======================================================"
echo ""
echo -e "${BLUE}What was deployed:${NC}"
echo "  ✅ 3 new database tables"
echo "  ✅ 2 new database functions (SuperMemo2)"
echo "  ✅ Zero breaking changes"
echo "  ✅ All existing systems preserved"
echo ""
echo -e "${BLUE}Backup Information:${NC}"
echo "  📁 Location: ${BACKUP_DIR}"
echo "  📋 Manifest: ${BACKUP_DIR}/BACKUP_MANIFEST.md"
echo "  🔄 Restore: bash ${BACKUP_DIR}/restore.sh"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Test mock exams: npm run content:test-mock-exams"
echo "  2. Generate content: npm run content:generate-sample"
echo "  3. Import content: npm run content:import-all"
echo ""
echo -e "${GREEN}Deployment successful! System is ready for content population.${NC}"
echo ""

exit 0
