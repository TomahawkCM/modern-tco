/**
 * Check Question Domains
 * Diagnose what domain values exist in the questions table
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDomains() {
  console.log('🔍 Checking question domains...\n');

  // Get all unique domain values
  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, category, domain')
    .order('category');

  if (error) {
    console.error('❌ Error fetching questions:', error);
    process.exit(1);
  }

  if (!questions || questions.length === 0) {
    console.log('No questions found in database');
    return;
  }

  console.log(`Total questions: ${questions.length}\n`);

  // Group by domain
  const domainCounts: Record<string, number> = {};
  const domainCategories: Record<string, Set<string>> = {};
  const invalidDomains: Array<{ id: string; category: string; domain: string | null }> = [];

  const validDomains = ['asking_questions', 'refining_targeting', 'taking_action', 'navigation', 'reporting', 'troubleshooting'];

  questions.forEach((q) => {
    const domain = q.domain || 'NULL';
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;

    if (!domainCategories[domain]) {
      domainCategories[domain] = new Set();
    }
    domainCategories[domain].add(q.category);

    // Check if domain is invalid
    if (!q.domain || !validDomains.includes(q.domain)) {
      invalidDomains.push({
        id: q.id,
        category: q.category,
        domain: q.domain,
      });
    }
  });

  console.log('📊 Domain distribution:\n');
  Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([domain, count]) => {
      const isValid = validDomains.includes(domain);
      const icon = isValid ? '✅' : '❌';
      console.log(`  ${icon} ${domain}: ${count} questions`);

      // Show categories for this domain
      const categories = Array.from(domainCategories[domain]);
      categories.forEach((cat) => {
        console.log(`       - Category: "${cat}"`);
      });
      console.log('');
    });

  if (invalidDomains.length > 0) {
    console.log(`\n❌ Found ${invalidDomains.length} questions with invalid domains:\n`);
    invalidDomains.slice(0, 10).forEach((q) => {
      console.log(`  ID: ${q.id}`);
      console.log(`  Category: "${q.category}"`);
      console.log(`  Domain: ${q.domain || 'NULL'}`);
      console.log('');
    });

    if (invalidDomains.length > 10) {
      console.log(`  ... and ${invalidDomains.length - 10} more\n`);
    }
  } else {
    console.log('\n✅ All questions have valid domain values!\n');
  }

  // Show suggested fixes
  if (invalidDomains.length > 0) {
    console.log('💡 Suggested fixes:\n');

    const categoryCounts: Record<string, number> = {};
    invalidDomains.forEach((q) => {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    });

    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  Category: "${category}" (${count} questions)`);

      // Suggest mapping
      if (category.toLowerCase().includes('asking') || category.toLowerCase().includes('question')) {
        console.log(`    → Suggest: domain = 'asking_questions'`);
      } else if (category.toLowerCase().includes('refin') || category.toLowerCase().includes('target')) {
        console.log(`    → Suggest: domain = 'refining_targeting'`);
      } else if (category.toLowerCase().includes('action') || category.toLowerCase().includes('package')) {
        console.log(`    → Suggest: domain = 'taking_action'`);
      } else if (category.toLowerCase().includes('navig') || category.toLowerCase().includes('module')) {
        console.log(`    → Suggest: domain = 'navigation'`);
      } else if (category.toLowerCase().includes('report') || category.toLowerCase().includes('export')) {
        console.log(`    → Suggest: domain = 'reporting'`);
      } else {
        console.log(`    → Suggest: domain = 'asking_questions' (default)`);
      }
      console.log('');
    });
  }
}

checkDomains().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
