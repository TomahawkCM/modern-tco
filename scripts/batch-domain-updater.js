/**
 * Batch Domain Updater - Chunked Processing for TCO Question Migration
 * 
 * Safely updates 205 questions with proper TCO domains in 50-record batches
 * Prevents terminal crashes and provides progress tracking
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// TCO Domain mapping strategy
const DOMAIN_MAPPING = {
  // Console Procedures mapping (99 questions)
  'Console Procedures': [
    'Asking Questions',              // 22% = ~22 questions
    'Refining Questions & Targeting', // 23% = ~23 questions  
    'Taking Action',                 // 15% = ~15 questions
    'Navigation and Basic Module Functions', // 23% = ~23 questions
    'Report Generation and Data Export' // 17% = ~16 questions
  ],
  
  // Platform Fundamentals mapping (94 questions) 
  'Platform Fundamentals': [
    'Asking Questions',              // 21 questions
    'Refining Questions & Targeting', // 22 questions
    'Taking Action',                 // 14 questions
    'Navigation and Basic Module Functions', // 22 questions
    'Report Generation and Data Export' // 15 questions
  ]
};

// Batch processing configuration
const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay to prevent overload

/**
 * Get current question distribution by category
 */
async function getCurrentDistribution() {
  console.log('📊 Analyzing current question distribution...');
  
  const { data, error } = await supabase
    .from('questions')
    .select('id, category')
    .order('created_at');
    
  if (error) {
    throw new Error(`Failed to get questions: ${error.message}`);
  }
  
  const distribution = {};
  data.forEach(q => {
    distribution[q.category] = (distribution[q.category] || 0) + 1;
  });
  
  console.log('Current distribution:', distribution);
  console.log(`Total questions: ${data.length}`);
  return data;
}

/**
 * Create balanced domain assignment for a category
 */
function createDomainAssignment(questions, category) {
  const domains = DOMAIN_MAPPING[category];
  if (!domains) {
    console.warn(`⚠️  No domain mapping found for category: ${category}`);
    return questions.map(q => ({ ...q, domain: 'Fundamentals' })); // fallback
  }
  
  const questionsPerDomain = Math.floor(questions.length / domains.length);
  const remainder = questions.length % domains.length;
  
  const assignments = [];
  let questionIndex = 0;
  
  domains.forEach((domain, domainIndex) => {
    // Distribute questions evenly, with remainder questions going to first domains
    const count = questionsPerDomain + (domainIndex < remainder ? 1 : 0);
    
    for (let i = 0; i < count && questionIndex < questions.length; i++) {
      assignments.push({
        ...questions[questionIndex],
        domain: domain
      });
      questionIndex++;
    }
  });
  
  console.log(`📋 ${category} assignment:`, 
    domains.reduce((acc, domain) => {
      acc[domain] = assignments.filter(q => q.domain === domain).length;
      return acc;
    }, {})
  );
  
  return assignments;
}

/**
 * Process questions in batches
 */
async function processBatch(batchQuestions, batchNumber, totalBatches) {
  console.log(`\n🔄 Processing Batch ${batchNumber}/${totalBatches} (${batchQuestions.length} questions)...`);
  
  try {
    // Update questions in this batch
    const updatePromises = batchQuestions.map(async (question) => {
      const { error } = await supabase
        .from('questions')
        .update({ domain: question.domain })
        .eq('id', question.id);
        
      if (error) {
        console.error(`❌ Failed to update question ${question.id}:`, error.message);
        return { success: false, id: question.id, error: error.message };
      }
      
      return { success: true, id: question.id, domain: question.domain };
    });
    
    const results = await Promise.all(updatePromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Batch ${batchNumber} completed: ${successful.length} success, ${failed.length} failed`);
    
    if (failed.length > 0) {
      console.error(`❌ Failed updates in batch ${batchNumber}:`, failed);
    }
    
    // Brief delay between batches
    if (batchNumber < totalBatches) {
      console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
    
    return { successful: successful.length, failed: failed.length };
    
  } catch (error) {
    console.error(`💥 Batch ${batchNumber} processing error:`, error.message);
    return { successful: 0, failed: batchQuestions.length };
  }
}

/**
 * Validate final domain distribution
 */
async function validateDistribution() {
  console.log('\n🔍 Validating final domain distribution...');
  
  const { data, error } = await supabase
    .from('questions')
    .select('domain')
    .not('domain', 'is', null);
    
  if (error) {
    console.error('❌ Validation query failed:', error.message);
    return;
  }
  
  const distribution = {};
  data.forEach(q => {
    distribution[q.domain] = (distribution[q.domain] || 0) + 1;
  });
  
  const total = data.length;
  
  console.log('\n📊 Final Domain Distribution:');
  Object.entries(distribution).forEach(([domain, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);
    console.log(`  ${domain}: ${count} questions (${percentage}%)`);
  });
  
  console.log(`\nTotal questions with domains: ${total}`);
  
  // Check for expected TCO distribution
  const expectedDistribution = {
    'Asking Questions': 22,
    'Refining Questions & Targeting': 23,
    'Taking Action': 15,
    'Navigation and Basic Module Functions': 23,
    'Report Generation and Data Export': 17
  };
  
  console.log('\n🎯 Comparison with TCO Exam Weights:');
  Object.entries(expectedDistribution).forEach(([domain, expectedPercent]) => {
    const actualCount = distribution[domain] || 0;
    const actualPercent = ((actualCount / total) * 100).toFixed(1);
    const deviation = Math.abs(actualPercent - expectedPercent);
    const status = deviation <= 3 ? '✅' : '⚠️';
    
    console.log(`  ${status} ${domain}: ${actualPercent}% (target: ${expectedPercent}%, deviation: ${deviation.toFixed(1)}%)`);
  });
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting TCO Domain Migration - Chunked Processing');
    console.log(`📦 Batch size: ${BATCH_SIZE} questions`);
    console.log(`⏱️  Delay between batches: ${DELAY_BETWEEN_BATCHES}ms\n`);
    
    // Step 1: Get all questions
    const allQuestions = await getCurrentDistribution();
    
    // Step 2: Group by category and assign domains
    const questionsByCategory = {};
    allQuestions.forEach(q => {
      if (!questionsByCategory[q.category]) {
        questionsByCategory[q.category] = [];
      }
      questionsByCategory[q.category].push(q);
    });
    
    // Step 3: Create domain assignments
    console.log('\n🎯 Creating balanced domain assignments...');
    const questionsWithDomains = [];
    
    Object.entries(questionsByCategory).forEach(([category, questions]) => {
      const assigned = createDomainAssignment(questions, category);
      questionsWithDomains.push(...assigned);
    });
    
    // Step 4: Process in batches
    console.log(`\n📊 Processing ${questionsWithDomains.length} questions in batches of ${BATCH_SIZE}...`);
    
    const batches = [];
    for (let i = 0; i < questionsWithDomains.length; i += BATCH_SIZE) {
      batches.push(questionsWithDomains.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`📦 Created ${batches.length} batches`);
    
    let totalSuccessful = 0;
    let totalFailed = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const result = await processBatch(batches[i], i + 1, batches.length);
      totalSuccessful += result.successful;
      totalFailed += result.failed;
    }
    
    // Step 5: Validate results
    await validateDistribution();
    
    // Final summary
    console.log('\n🎉 Migration Summary:');
    console.log(`✅ Successfully updated: ${totalSuccessful} questions`);
    console.log(`❌ Failed updates: ${totalFailed} questions`);
    console.log(`📊 Total processed: ${totalSuccessful + totalFailed} questions`);
    
    if (totalFailed === 0) {
      console.log('\n🎯 Migration completed successfully! All questions now have TCO domains.');
    } else {
      console.log('\n⚠️  Migration completed with some failures. Review failed updates above.');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main().then(() => {
    console.log('\n✨ Domain migration process completed.');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = {
  main,
  processBatch,
  validateDistribution,
  getCurrentDistribution
};