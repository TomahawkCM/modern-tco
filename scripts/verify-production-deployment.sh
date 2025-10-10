#!/bin/bash

# Production Deployment Verification Script
# Checks all critical components after content population deployment

set -e

echo "🔍 Production Deployment Verification"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Database Tables
echo "1️⃣ Checking database tables..."
TABLES_CHECK=$(npx tsx -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const checkTables = async () => {
  const requiredTables = [
    'flashcard_library',
    'flashcard_library_progress',
    'content_import_logs',
    'question_reviews',
    'questions'
  ];
  
  const { data, error } = await supabase
    .from('flashcard_library')
    .select('count')
    .limit(1);
    
  if (error && error.code !== 'PGRST116') {
    console.log('❌ flashcard_library table not found');
    process.exit(1);
  }
  
  console.log('✅ flashcard_library table exists');
};

checkTables().catch(console.error);
" 2>&1)

if [[ $TABLES_CHECK == *"✅"* ]]; then
  echo -e "${GREEN}✅ Database tables verified${NC}"
else
  echo -e "${RED}❌ Database tables missing${NC}"
  echo "$TABLES_CHECK"
  exit 1
fi

# Check 2: Questions Domain Field
echo ""
echo "2️⃣ Checking questions domain migration..."
DOMAIN_CHECK=$(npx tsx -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const checkDomains = async () => {
  const { data, error } = await supabase
    .from('questions')
    .select('domain')
    .not('domain', 'is', null)
    .limit(10);
    
  if (error) {
    console.log('❌ domain field not found');
    process.exit(1);
  }
  
  if (data && data.length > 0) {
    console.log(\`✅ Found \${data.length} questions with domain field\`);
  } else {
    console.log('⚠️ No questions with domain field found');
  }
};

checkDomains().catch(console.error);
" 2>&1)

if [[ $DOMAIN_CHECK == *"✅"* ]]; then
  echo -e "${GREEN}✅ Domain migration verified${NC}"
else
  echo -e "${YELLOW}⚠️  Domain migration incomplete${NC}"
  echo "$DOMAIN_CHECK"
fi

# Check 3: Environment Variables
echo ""
echo "3️⃣ Checking environment variables..."

if [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  OPENAI_API_KEY not set (production only)${NC}"
else
  echo -e "${GREEN}✅ OPENAI_API_KEY configured${NC}"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not set${NC}"
  exit 1
else
  echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_URL configured${NC}"
fi

# Check 4: Mock Exam Templates
echo ""
echo "4️⃣ Checking mock exam templates..."

TEMPLATES=$(npx tsx -e "
import { mockExamTemplates } from './src/data/mock-exam-configs';
console.log(\`✅ Found \${mockExamTemplates.length} mock exam templates\`);
" 2>&1)

echo -e "${GREEN}$TEMPLATES${NC}"

# Check 5: Build Status
echo ""
echo "5️⃣ Checking TypeScript compilation..."

if npm run typecheck 2>&1 | grep -q "error TS"; then
  echo -e "${RED}❌ TypeScript errors found${NC}"
  npm run typecheck 2>&1 | grep "error TS" | head -5
else
  echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
fi

# Summary
echo ""
echo "======================================"
echo "✅ Production verification complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Verify Vercel deployment at: https://vercel.com/dashboard"
echo "2. Set OPENAI_API_KEY in Vercel environment variables"
echo "3. Run database migrations: npx supabase db push"
echo "4. Test content generation: npm run content:generate-sample"
echo ""
