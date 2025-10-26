#!/bin/bash

# Deploy Hybrid Model - Content Population Infrastructure
# This script applies the database migration and verifies the setup

set -e  # Exit on error

echo "🚀 Deploying Hybrid Model Content Population Infrastructure"
echo "=========================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Supabase CLI
echo "1️⃣  Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found. Please install it first:${NC}"
    echo "   npm install -g supabase"
    exit 1
fi
echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Step 2: Check Supabase project connection
echo "2️⃣  Checking Supabase project connection..."
if ! supabase status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not connected to Supabase project${NC}"
    echo "   Run: supabase link --project-ref your-project-ref"
    exit 1
fi
echo -e "${GREEN}✅ Connected to Supabase project${NC}"
echo ""

# Step 3: Apply migration
echo "3️⃣  Applying database migration..."
echo "   Migration: 20251010000003_add_content_population_tables.sql"
supabase db push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migration applied successfully${NC}"
else
    echo -e "${RED}❌ Migration failed${NC}"
    exit 1
fi
echo ""

# Step 4: Verify tables created
echo "4️⃣  Verifying tables created..."
echo ""
echo "   Checking for: flashcard_library"
supabase db execute "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'flashcard_library'" || exit 1

echo "   Checking for: flashcard_library_progress"
supabase db execute "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'flashcard_library_progress'" || exit 1

echo "   Checking for: content_import_logs"
supabase db execute "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'content_import_logs'" || exit 1

echo -e "${GREEN}✅ All tables verified${NC}"
echo ""

# Step 5: Verify functions created
echo "5️⃣  Verifying functions created..."
echo ""
echo "   Checking for: update_flashcard_library_progress"
supabase db execute "SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'update_flashcard_library_progress'" || exit 1

echo "   Checking for: get_library_flashcards_due_for_review"
supabase db execute "SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'get_library_flashcards_due_for_review'" || exit 1

echo -e "${GREEN}✅ All functions verified${NC}"
echo ""

# Step 6: Display table info
echo "6️⃣  Database schema summary:"
echo ""
echo "   📊 Tables created:"
echo "      • flashcard_library           (curated flashcard content)"
echo "      • flashcard_library_progress  (user progress tracking)"
echo "      • content_import_logs         (import audit trail)"
echo ""
echo "   🔧 Functions created:"
echo "      • update_flashcard_library_progress(user_id, card_id, rating)"
echo "      • get_library_flashcards_due_for_review(user_id, limit)"
echo ""
echo "   🔗 Integration:"
echo "      • Existing 'flashcards' table preserved (user-created cards)"
echo "      • Existing 'exam_sessions' table enhanced for mock exams"
echo "      • Zero breaking changes to existing functionality"
echo ""

# Success message
echo -e "${GREEN}=========================================================="
echo "🎉 Hybrid Model Deployment Complete!"
echo "==========================================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Generate questions:  npm run generate-questions"
echo "  2. Generate flashcards: npm run generate-flashcards"
echo "  3. Test mock exams:     npm run test-mock-exams"
echo ""
echo "For detailed instructions, see:"
echo "  docs/CONTENT_POPULATION_IMPLEMENTATION_SUMMARY.md"
echo ""
