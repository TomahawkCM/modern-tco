/**
 * Generate Sample Flashcards for Tanium TCO Domains
 *
 * Creates example flashcards across all 6 TCO domains to demonstrate
 * the flashcard system functionality.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SampleFlashcard {
  front_text: string;
  back_text: string;
  card_type: 'basic' | 'concept' | 'code';
  source: 'manual';
  hint?: string;
  explanation?: string;
  tags: string[];
  module_id?: string;
  domain?: string;
}

const sampleFlashcards: SampleFlashcard[] = [
  // Asking Questions Domain
  {
    front_text: "What is a Tanium Sensor?",
    back_text: "A Tanium Sensor is a predefined or custom data collector that retrieves specific information from endpoints, such as system properties, installed software, or running processes.",
    card_type: "concept",
    source: "manual",
    explanation: "Sensors are the foundation of Tanium questions - they define WHAT data to retrieve from endpoints.",
    tags: ["asking-questions", "sensors", "fundamentals"],
    domain: "asking-questions"
  },
  {
    front_text: "How do you save a Tanium question for reuse?",
    back_text: "Use the 'Save Question' button in the Question Results panel, give it a descriptive name, and optionally assign it to a group. Saved questions can be accessed from the 'Saved Questions' menu.",
    card_type: "basic",
    source: "manual",
    hint: "Look for the save button in the results area",
    tags: ["asking-questions", "saved-questions", "workflow"],
    domain: "asking-questions"
  },
  {
    front_text: "What does the 'Get' prefix do in a Tanium question?",
    back_text: "'Get' initiates a question to retrieve data from endpoints. It's followed by the sensor name, e.g., 'Get Computer Name' or 'Get Installed Applications'.",
    card_type: "concept",
    source: "manual",
    tags: ["asking-questions", "syntax", "query-construction"],
    domain: "asking-questions"
  },

  // Refining Questions & Targeting
  {
    front_text: "What is a Computer Group in Tanium?",
    back_text: "A Computer Group is a saved filter that defines a collection of endpoints based on specific criteria (e.g., Operating System, IP Range, or custom sensors). It allows targeted question deployment.",
    card_type: "concept",
    source: "manual",
    explanation: "Computer Groups are essential for RBAC and efficient targeting of specific endpoint subsets.",
    tags: ["refining-questions", "computer-groups", "targeting"],
    domain: "refining-questions-targeting"
  },
  {
    front_text: "How do you filter question results by operating system?",
    back_text: "Add a filter using 'where Operating System contains <value>' or select the OS filter from the filter dropdown in the Question Builder.",
    card_type: "basic",
    source: "manual",
    hint: "Use the 'where' clause with Operating System sensor",
    tags: ["refining-questions", "filtering", "operating-system"],
    domain: "refining-questions-targeting"
  },
  {
    front_text: "What is the difference between 'from all machines' and 'from <computer group>'?",
    back_text: "'From all machines' targets every endpoint the Tanium server knows about. 'From <computer group>' targets only endpoints matching the group's filter criteria, reducing scope and improving performance.",
    card_type: "concept",
    source: "manual",
    tags: ["refining-questions", "targeting", "scope"],
    domain: "refining-questions-targeting"
  },

  // Taking Action
  {
    front_text: "What is a Tanium Package?",
    back_text: "A Package is a deployable unit containing commands, scripts, or files that execute actions on endpoints (e.g., install software, apply patches, or run diagnostics).",
    card_type: "concept",
    source: "manual",
    explanation: "Packages are the 'action' component of Tanium - they define WHAT to do on endpoints.",
    tags: ["taking-action", "packages", "deployment"],
    domain: "taking-action-packages-actions"
  },
  {
    front_text: "How do you verify that a package deployment succeeded?",
    back_text: "Check the Action Status dashboard to view deployment progress, success/failure counts, and detailed results per endpoint. You can also ask a question to verify the expected state change.",
    card_type: "basic",
    source: "manual",
    hint: "Use the Action Status dashboard",
    tags: ["taking-action", "monitoring", "verification"],
    domain: "taking-action-packages-actions"
  },

  // Navigation & Basic Modules
  {
    front_text: "What is the Tanium Interact module used for?",
    back_text: "Interact is the primary interface for asking real-time questions and viewing endpoint data. It allows live interrogation of the infrastructure with sub-second response times.",
    card_type: "concept",
    source: "manual",
    tags: ["navigation", "interact", "modules"],
    domain: "navigation-basic-modules"
  },
  {
    front_text: "Where do you find historical question data in Tanium?",
    back_text: "Historical data is stored in the Trends module, which records question results over time for trending analysis and compliance reporting.",
    card_type: "basic",
    source: "manual",
    hint: "Think 'Trends' for time-series data",
    tags: ["navigation", "trends", "historical-data"],
    domain: "navigation-basic-modules"
  },

  // Reporting & Data Export
  {
    front_text: "What formats can Tanium export data to?",
    back_text: "Tanium supports multiple export formats including CSV, JSON, XML, and can integrate with SIEM/SOAR platforms via REST API. Reports can also be scheduled for automated delivery.",
    card_type: "basic",
    source: "manual",
    tags: ["reporting", "export", "formats"],
    domain: "reporting-data-export"
  },
  {
    front_text: "How do you create a scheduled report in Tanium?",
    back_text: "In the Reporting module, save a report configuration, then set up a schedule with desired frequency (daily, weekly, etc.), recipients, and delivery method (email or API endpoint).",
    card_type: "basic",
    source: "manual",
    hint: "Use the Reporting module with scheduling options",
    tags: ["reporting", "scheduling", "automation"],
    domain: "reporting-data-export"
  },
];

async function generateSampleFlashcards() {
  console.log('🎴 Generating sample flashcards for Tanium TCO domains...\n');

  try {
    // Get all users to assign flashcards (in production, this would be user-specific)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.log('⚠️  No users found. Flashcards will need to be generated per-user.');
      console.log('   These are template flashcards that can be copied to user accounts.\n');
      return;
    }

    const userId = users[0].id;
    console.log(`✅ Using user ID: ${userId}\n`);

    // Check if sample flashcards already exist
    const { data: existing } = await supabase
      .from('flashcards')
      .select('id')
      .eq('user_id', userId)
      .eq('source', 'manual')
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('⚠️  Sample flashcards already exist. Skipping generation.');
      console.log('   To regenerate, delete existing flashcards first.\n');
      return;
    }

    // Insert sample flashcards
    const flashcardsToInsert = sampleFlashcards.map(card => ({
      user_id: userId,
      ...card,
      srs_due: new Date().toISOString(), // Due immediately for demo
      srs_interval: 0,
      srs_ease: 2.5,
      srs_reps: 0,
      srs_lapses: 0,
      total_reviews: 0,
      correct_reviews: 0,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting flashcards:', insertError);
      return;
    }

    console.log(`✅ Successfully created ${inserted?.length || 0} sample flashcards!\n`);

    // Summary by domain
    const domainCounts: Record<string, number> = {};
    sampleFlashcards.forEach(card => {
      const domain = card.domain || 'other';
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });

    console.log('📊 Flashcards by domain:');
    Object.entries(domainCounts).forEach(([domain, count]) => {
      console.log(`   ${domain}: ${count} cards`);
    });

    console.log('\n🎯 Next steps:');
    console.log('   1. Navigate to /flashcards to view the sample cards');
    console.log('   2. Start a review session to test the SRS algorithm');
    console.log('   3. Create custom flashcards from study modules');
    console.log('   4. Auto-generate cards from quiz mistakes\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
generateSampleFlashcards()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
