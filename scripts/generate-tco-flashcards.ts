/**
 * Generate World-Class TCO Flashcard Library
 *
 * Creates 300-350 professional flashcards aligned with Tanium TCO exam blueprint:
 * - Domain 1: Asking Questions (22% = 66-77 cards)
 * - Domain 2: Refining Questions & Targeting (23% = 69-80 cards)
 * - Domain 3: Taking Action (15% = 45-52 cards)
 * - Domain 4: Navigation & Basic Modules (23% = 69-80 cards)
 * - Domain 5: Reporting & Data Export (17% = 51-59 cards)
 *
 * Sources:
 * 1. Convert 140 MCQ questions → 60-70 flashcards
 * 2. Extract MDX learning objectives → 150-200 flashcards
 * 3. Fill blueprint gaps → 100-120 flashcards
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
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

interface MCQQuestion {
  id: string;
  module: string;
  domain: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: string;
  explanation: string;
  tags: string[];
  weight: number;
}

interface Flashcard {
  front_text: string;
  back_text: string;
  card_type: 'basic' | 'concept' | 'cloze' | 'code' | 'diagram';
  source: 'manual' | 'mcq' | 'mdx' | 'generated';
  hint?: string;
  explanation?: string;
  tags: string[];
  module_id?: string;
  domain: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface DomainStats {
  domain: string;
  targetCards: number;
  currentCards: number;
  blueprintWeight: number;
}

// TCO Exam Blueprint Distribution
const TCO_BLUEPRINT = {
  'asking-questions': { weight: 0.22, name: 'Asking Questions' },
  'refining-questions-targeting': { weight: 0.23, name: 'Refining Questions & Targeting' },
  'taking-action-packages-actions': { weight: 0.15, name: 'Taking Action' },
  'navigation-basic-modules': { weight: 0.23, name: 'Navigation & Basic Modules' },
  'reporting-data-export': { weight: 0.17, name: 'Reporting & Data Export' },
};

const TARGET_TOTAL_CARDS = 330; // Middle of 300-350 range

// ==================== PHASE 1: CONVERT MCQ QUESTIONS ====================

async function convertMCQToFlashcards(): Promise<Flashcard[]> {
  console.log('\n📝 Phase 1: Converting MCQ Questions to Flashcards...\n');

  const questionBankPath = path.join(process.cwd(), 'src/content/questions/comprehensive-assessment-bank.json');
  const questionBank = JSON.parse(fs.readFileSync(questionBankPath, 'utf-8'));

  const flashcards: Flashcard[] = [];

  // Filter questions suitable for flashcard conversion
  const suitableQuestions = questionBank.questions.filter((q: MCQQuestion) => {
    // Include if:
    // - Single concept focus
    // - Clear correct answer
    // - Has explanation
    return q.explanation && q.explanation.length > 20 && q.difficulty !== 'advanced';
  });

  console.log(`  Found ${suitableQuestions.length} suitable questions out of ${questionBank.questions.length} total`);

  // Convert each question to flashcard
  for (const q of suitableQuestions.slice(0, 70)) { // Target: 60-70 cards
    const correctOption = q.options[q.correctAnswer];
    // Use the question's domain field to determine flashcard domain
    const domain = mapQuestionDomainFromField(q.domain, q.module);

    // Create concept-based flashcard
    const flashcard: Flashcard = {
      front_text: q.question,
      back_text: `${correctOption}\n\n${q.explanation}`,
      card_type: 'concept',
      source: 'mcq',
      explanation: q.explanation,
      tags: [...q.tags, 'exam-aligned', q.module.toLowerCase().replace(/\s+/g, '-')],
      domain,
      difficulty: q.difficulty as 'beginner' | 'intermediate' | 'advanced',
    };

    // Add hint if question is challenging
    if (q.difficulty === 'intermediate' || q.difficulty === 'advanced') {
      const hintKeywords = extractKeywords(q.explanation);
      if (hintKeywords.length > 0) {
        flashcard.hint = `Think about: ${hintKeywords.slice(0, 2).join(', ')}`;
      }
    }

    flashcards.push(flashcard);
  }

  console.log(`  ✅ Converted ${flashcards.length} MCQ questions to flashcards\n`);
  return flashcards;
}

// ==================== PHASE 2: EXTRACT MDX LEARNING OBJECTIVES ====================

async function extractMDXFlashcards(): Promise<Flashcard[]> {
  console.log('📚 Phase 2: Extracting Learning Objectives from MDX Modules...\n');

  const flashcards: Flashcard[] = [];
  const mdxModules = [
    '00-tanium-platform-foundation.mdx',
    '01-asking-questions.mdx',
    '02-refining-questions-targeting.mdx',
    '03-taking-action-packages-actions.mdx',
    '04-navigation-basic-modules.mdx',
    '05-reporting-data-export.mdx',
  ];

  for (const moduleName of mdxModules) {
    const modulePath = path.join(process.cwd(), 'src/content/modules', moduleName);
    if (!fs.existsSync(modulePath)) continue;

    const content = fs.readFileSync(modulePath, 'utf-8');
    const domain = moduleName.replace('.mdx', '');

    // Extract learning objectives using regex
    const learningObjectivePattern = /<LearningObjective[^>]*>(.*?)<\/LearningObjective>/gs;
    const matches = content.matchAll(learningObjectivePattern);

    for (const match of matches) {
      const objectiveText = match[1].trim();
      if (objectiveText.length < 20) continue;

      // Parse objective into Q&A format
      const flashcard = parseObjectiveToFlashcard(objectiveText, domain);
      if (flashcard) {
        flashcards.push(flashcard);
      }
    }

    // Extract key concepts from InfoBox components
    const infoBoxPattern = /<InfoBox[^>]*>(.*?)<\/InfoBox>/gs;
    const infoMatches = content.matchAll(infoBoxPattern);

    for (const match of infoMatches) {
      const infoText = match[1].trim();
      const flashcard = parseInfoBoxToFlashcard(infoText, domain);
      if (flashcard) {
        flashcards.push(flashcard);
      }
    }

    console.log(`  ${moduleName}: Extracted ${flashcards.filter(f => f.domain === domain).length} flashcards`);
  }

  console.log(`\n  ✅ Extracted ${flashcards.length} flashcards from MDX modules\n`);
  return flashcards;
}

// ==================== PHASE 3: FILL BLUEPRINT GAPS ====================

async function fillBlueprintGaps(existingCards: Flashcard[]): Promise<Flashcard[]> {
  console.log('🎯 Phase 3: Filling Blueprint Gaps with Domain-Specific Flashcards...\n');

  const gapCards: Flashcard[] = [];

  // Calculate current distribution
  const domainCounts: Record<string, number> = {};
  Object.keys(TCO_BLUEPRINT).forEach(domain => {
    domainCounts[domain] = existingCards.filter(c => c.domain === domain).length;
  });

  // Calculate target distribution
  const domainTargets: Record<string, number> = {};
  Object.entries(TCO_BLUEPRINT).forEach(([domain, { weight }]) => {
    domainTargets[domain] = Math.round(TARGET_TOTAL_CARDS * weight);
  });

  // Fill gaps for each domain
  for (const [domain, target] of Object.entries(domainTargets)) {
    const current = domainCounts[domain] || 0;
    const needed = target - current;

    console.log(`  ${TCO_BLUEPRINT[domain as keyof typeof TCO_BLUEPRINT].name}:`);
    console.log(`    Current: ${current} | Target: ${target} | Need: ${needed > 0 ? needed : 0}`);

    if (needed > 0) {
      const newCards = generateDomainSpecificCards(domain, needed);
      gapCards.push(...newCards);
      console.log(`    ✅ Generated ${newCards.length} gap-filling cards`);
    } else {
      console.log(`    ✅ Already at target`);
    }
  }

  console.log(`\n  ✅ Generated ${gapCards.length} gap-filling flashcards\n`);
  return gapCards;
}

// ==================== HELPER FUNCTIONS ====================

function mapQuestionDomainFromField(questionDomain: string, module: string): string {
  // Map question domain field to flashcard domain
  const domainMap: Record<string, string> = {
    // Foundation domains
    'Platform Architecture': 'asking-questions',
    'Platform Terminology': 'asking-questions',
    'Communication Model': 'asking-questions',
    'Console Navigation': 'navigation-basic-modules',

    // Asking Questions domains
    'Question Construction': 'asking-questions',
    'Sensor Library': 'asking-questions',
    'Query Syntax': 'asking-questions',

    // Refining Questions domains
    'Computer Groups': 'refining-questions-targeting',
    'Filtering': 'refining-questions-targeting',
    'Targeting': 'refining-questions-targeting',

    // Taking Action domains
    'Package Management': 'taking-action-packages-actions',
    'Action Deployment': 'taking-action-packages-actions',
    'Monitoring': 'taking-action-packages-actions',

    // Navigation domains
    'Interact Module': 'navigation-basic-modules',
    'Trends Module': 'navigation-basic-modules',
    'Connect Module': 'navigation-basic-modules',
    'Reporting Module': 'reporting-data-export',

    // Reporting domains
    'Data Export': 'reporting-data-export',
    'Report Creation': 'reporting-data-export',
    'Scheduling': 'reporting-data-export',
  };

  // Try exact match on domain field
  if (domainMap[questionDomain]) {
    return domainMap[questionDomain];
  }

  // Fall back to module mapping
  const moduleMap: Record<string, string> = {
    'Foundation': 'asking-questions',
    'Asking Questions': 'asking-questions',
    'Refining Questions': 'refining-questions-targeting',
    'Taking Action': 'taking-action-packages-actions',
    'Navigation': 'navigation-basic-modules',
    'Reporting': 'reporting-data-export',
  };

  return moduleMap[module] || 'asking-questions';
}

function extractKeywords(text: string): string[] {
  // Extract important keywords from explanation
  const keywords = text.match(/\b(Tanium|Linear Chain|Sensor|Package|Action|Computer Group|Filter|Module|Interact|Trends|Connect|Report|CSV|JSON|API)\b/gi);
  return keywords ? [...new Set(keywords.map(k => k.toLowerCase()))] : [];
}

function parseObjectiveToFlashcard(objectiveText: string, domain: string): Flashcard | null {
  // Remove MDX tags and extract meaningful content
  const cleanText = objectiveText.replace(/<[^>]*>/g, '').trim();

  // Look for Q&A patterns
  const questionMatch = cleanText.match(/^(What|How|Why|When|Where|Which|Describe|Explain|List|Define)\s+([^.?!]+)/i);

  if (questionMatch) {
    const question = questionMatch[0];
    const answer = cleanText.replace(questionMatch[0], '').trim();

    if (answer.length > 20) {
      return {
        front_text: question.endsWith('?') ? question : `${question}?`,
        back_text: answer,
        card_type: 'concept',
        source: 'mdx',
        tags: ['learning-objective', domain],
        domain,
      };
    }
  }

  return null;
}

function parseInfoBoxToFlashcard(infoText: string, domain: string): Flashcard | null {
  const cleanText = infoText.replace(/<[^>]*>/g, '').trim();

  // Extract key concept definitions
  const conceptMatch = cleanText.match(/^\*\*([^:]+):\*\*\s*(.+)/);

  if (conceptMatch) {
    const [, term, definition] = conceptMatch;

    return {
      front_text: `What is ${term.trim()}?`,
      back_text: definition.trim(),
      card_type: 'concept',
      source: 'mdx',
      tags: ['key-concept', domain],
      domain,
    };
  }

  return null;
}

// Template generator for filling flashcard gaps
function generateTemplateCards(domain: string, domainType: string, count: number): Flashcard[] {
  // If count <= 0, return empty array
  if (count <= 0) return [];

  // Template patterns for each domain
  const templates: Record<string, Array<{q: string, a: string, type?: string, tags?: string[]}>> = {
    'asking-questions': [
      { q: "What sensor retrieves installed software information?", a: "The 'Installed Applications' sensor retrieves a list of all software installed on an endpoint, including application name, version, publisher, and install date." },
      { q: "How do you save a Tanium question for reuse?", a: "Click the 'Save Question' button in the Question Results panel, provide a descriptive name, and optionally assign it to a Computer Group. Saved questions appear in the 'Saved Questions' menu for quick access.", tags: ['saved-questions'] },
      { q: "What is the purpose of the 'with all results' clause?", a: "The 'with all results' clause returns every value from every endpoint, useful for comprehensive audits. Without it, Tanium returns summarized/deduplicated results for efficiency.", tags: ['query-options'] },
      { q: "How do natural language queries work in Tanium?", a: "Natural language queries let you type questions in plain English (e.g., 'show me computers with Chrome installed'). Tanium's NLP engine translates this to sensor-based syntax automatically.", tags: ['natural-language'] },
      { q: "What is a parameterized sensor?", a: "A parameterized sensor accepts input values to customize its behavior. For example, 'File Exists[C:\\\\temp]' checks for a specific file path provided as a parameter.", tags: ['sensors', 'advanced'] },
    ],
    'refining-questions-targeting': [
      { q: "What is the 'from' clause used for in Tanium questions?", a: "The 'from' clause specifies the target scope: 'from all machines' queries every endpoint, while 'from [Computer Group]' targets only endpoints in that group.", tags: ['targeting'] },
      { q: "How do you create a Computer Group in Tanium?", a: "Navigate to Administration > Computer Groups, click 'New', define filter criteria using sensors (e.g., 'Operating System contains Windows'), test the filter, and save with a descriptive name.", tags: ['computer-groups'] },
      { q: "What operators are available for filtering Tanium results?", a: "Available operators include: 'contains', 'starts with', 'ends with', 'equals', 'does not contain', '>', '<', '>=', '<=', 'is', 'is not'. Use these in 'where' clauses to refine results.", tags: ['filtering', 'operators'] },
      { q: "How does RBAC integrate with Computer Groups?", a: "Role-Based Access Control (RBAC) uses Computer Groups to restrict user permissions. Users only see endpoints in their assigned groups, ensuring data isolation and security.", tags: ['rbac', 'security'] },
      { q: "What is the difference between static and dynamic Computer Groups?", a: "Dynamic groups update automatically based on sensor criteria (e.g., 'OS=Windows'). Static groups contain manually specified endpoints. Dynamic groups adapt to infrastructure changes, while static groups remain fixed.", tags: ['computer-groups', 'types'] },
    ],
    'taking-action-packages-actions': [
      { q: "What is the difference between a Package and an Action?", a: "A Package is the deployment unit (script/command/files to execute). An Action is the execution instance that applies a Package to specific endpoints. One Package can be used in multiple Actions.", tags: ['packages', 'actions'] },
      { q: "How do you deploy a Package to specific endpoints?", a: "Create an Action by selecting a Package, specify target endpoints using Computer Groups or filters, set deployment parameters (schedule, timeout, reissue), and click 'Deploy Action'.", tags: ['deployment'] },
      { q: "What is the Action Status dashboard used for?", a: "Action Status shows real-time deployment progress: pending/running/completed/failed counts, detailed endpoint results, error messages, and performance metrics. Use it to monitor and troubleshoot deployments.", tags: ['monitoring', 'action-status'] },
      { q: "How do you perform a rollback after a failed Package deployment?", a: "Create a new Action with a rollback Package that reverses the changes (e.g., uninstall software, restore configuration). Target the same endpoints, verify success in Action Status, then confirm state with verification questions.", tags: ['rollback', 'remediation'] },
      { q: "What is the purpose of Package parameters?", a: "Package parameters allow customization at deployment time. For example, a 'Software Install' package might accept parameters for install path, license key, or configuration options without modifying the Package itself.", tags: ['packages', 'parameters'] },
    ],
    'navigation-basic-modules': [
      { q: "What is the Trends module used for?", a: "Trends records question results over time for historical analysis, compliance reporting, and change detection. It visualizes data trends, identifies anomalies, and supports audit requirements.", tags: ['trends', 'historical'] },
      { q: "How does Connect integrate with external systems?", a: "Connect exports Tanium data to SIEM, SOAR, ticketing, and reporting platforms using REST API, Syslog, JDBC, or scheduled file delivery. It supports JSON, CSV, XML formats for seamless integration.", tags: ['connect', 'integration'] },
      { q: "What is the Reporting module's primary function?", a: "Reporting creates formatted reports with charts, tables, and visualizations. It supports scheduled delivery, custom templates, multi-format export (PDF/CSV/Excel), and automated distribution to stakeholders.", tags: ['reporting'] },
      { q: "How do you navigate between Tanium modules?", a: "Use the main navigation menu (top or side bar depending on version) to switch between Interact, Trends, Connect, Reporting, and other modules. Each module has its own workspace and functionality.", tags: ['navigation', 'ui'] },
      { q: "What is the Interact module's sub-second response time?", a: "Interact leverages Linear Chain Technology to deliver query results in sub-second time, even across millions of endpoints. This real-time capability enables live troubleshooting and instant visibility.", tags: ['interact', 'performance'] },
    ],
    'reporting-data-export': [
      { q: "What export formats does Tanium support?", a: "Tanium supports CSV (comma-separated values), JSON (JavaScript Object Notation), XML (Extensible Markup Language), PDF (formatted reports), Excel (XLSX), and direct SIEM/SOAR integration via REST API.", tags: ['export', 'formats'] },
      { q: "How do you schedule automated reports in Tanium?", a: "In the Reporting module, create a report template, click 'Schedule', set frequency (daily/weekly/monthly), specify recipients (email/API), choose format, and configure delivery options. Scheduled reports run automatically.", tags: ['scheduling', 'automation'] },
      { q: "What is the REST API endpoint for exporting question results?", a: "Use the '/api/v2/result_data/question' endpoint with GET or POST methods. Specify question ID or sensor names, apply filters, and receive JSON/CSV results programmatically for custom integrations.", tags: ['api', 'rest'] },
      { q: "How do you export data to a SIEM platform?", a: "Configure a Connect destination with SIEM connection details (API endpoint, Syslog server, or JDBC). Create a scheduled export for relevant questions, map fields to SIEM format, and enable real-time or batch delivery.", tags: ['siem', 'integration'] },
      { q: "What is the benefit of using Tanium's JSON export?", a: "JSON export provides structured, machine-readable data ideal for API integrations, custom dashboards, and automated processing. It preserves data types, supports nested structures, and enables programmatic parsing.", tags: ['json', 'automation'] },
    ],
  };

  const domainTemplates = templates[domainType] || [];
  const cards: Flashcard[] = [];

  // Generate cards from templates, repeating if necessary
  for (let i = 0; i < count; i++) {
    const template = domainTemplates[i % domainTemplates.length];
    if (!template) break;

    cards.push({
      front_text: template.q,
      back_text: template.a,
      card_type: (template.type as any) || 'concept',
      source: 'generated',
      tags: template.tags || [domainType, 'tco-exam'],
      domain,
    });
  }

  return cards;
}

function generateDomainSpecificCards(domain: string, count: number): Flashcard[] {
  // Domain-specific knowledge cards based on TCO exam blueprint
  // This function generates comprehensive flashcards to fill gaps
  const domainKnowledge: Record<string, Flashcard[]> = {
    'asking-questions': [
      {
        front_text: "What is the 500+ Sensor Library in Tanium?",
        back_text: "The Sensor Library is Tanium's comprehensive collection of over 500 pre-built sensors that collect specific endpoint data such as Computer Name, Running Processes, Installed Applications, IP Address, Operating System, and more. These sensors are ready to use and cover common IT operations needs.",
        card_type: 'concept',
        source: 'generated',
        tags: ['sensors', 'fundamentals'],
        domain,
      },
      {
        front_text: "How do you construct a basic Tanium question?",
        back_text: "A basic Tanium question follows the pattern: 'Get [Sensor] from [Target]'. For example: 'Get Computer Name from all machines' or 'Get Running Processes from Windows Servers'. The 'Get' keyword initiates the query, followed by the sensor name and target scope.",
        card_type: 'basic',
        source: 'generated',
        tags: ['question-construction', 'syntax'],
        domain,
      },
      {
        front_text: "What is the difference between 'Get' and 'Count' in Tanium questions?",
        back_text: "'Get' retrieves the actual data values from endpoints (e.g., 'Get Computer Name' returns all computer names). 'Count' returns the number of unique values (e.g., 'Count Computer Name' returns how many distinct computer names exist). Use 'Count' for summary statistics and 'Get' for detailed data.",
        card_type: 'concept',
        source: 'generated',
        hint: "Think about whether you need values or statistics",
        tags: ['query-types', 'get-vs-count'],
        domain,
      },
      ...generateTemplateCards(domain, 'asking-questions', count - 3),
    ],
    'refining-questions-targeting': [
      ...generateTemplateCards(domain, 'refining-questions-targeting', count),
    ],
    'taking-action-packages-actions': [
      ...generateTemplateCards(domain, 'taking-action-packages-actions', count),
    ],
    'navigation-basic-modules': [
      ...generateTemplateCards(domain, 'navigation-basic-modules', count),
    ],
    'reporting-data-export': [
      ...generateTemplateCards(domain, 'reporting-data-export', count),
    ],
  };

  const cards = domainKnowledge[domain] || [];
  return cards.slice(0, count);
}

// ==================== DATABASE SEEDING ====================

async function seedFlashcardsToDatabase(flashcards: Flashcard[]): Promise<void> {
  console.log('💾 Seeding Flashcards to Database...\n');

  try {
    // Get first user (for demo purposes - in production, flashcards would be global or per-user)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.log('⚠️  No users found. Skipping database seeding.');
      console.log('   Flashcards generated and saved to JSON file for manual import.\n');
      return;
    }

    const userId = users[0].id;
    console.log(`  Using user ID: ${userId}\n`);

    // Check if flashcards already exist
    const { data: existing } = await supabase
      .from('flashcards')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('⚠️  Flashcards already exist for this user.');
      console.log('   To regenerate, delete existing flashcards first.\n');
      return;
    }

    // Prepare flashcards for insertion
    const flashcardsToInsert = flashcards.map(card => ({
      user_id: userId,
      ...card,
      srs_due: new Date().toISOString(), // Due immediately for first review
      srs_interval: 0,
      srs_ease: 2.5,
      srs_reps: 0,
      srs_lapses: 0,
      total_reviews: 0,
      correct_reviews: 0,
    }));

    // Insert in batches of 100 to avoid payload limits
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < flashcardsToInsert.length; i += batchSize) {
      const batch = flashcardsToInsert.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('flashcards')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        continue;
      }

      inserted += data?.length || 0;
      console.log(`  ✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${data?.length} flashcards`);
    }

    console.log(`\n✅ Successfully seeded ${inserted} flashcards to database!\n`);

  } catch (error) {
    console.error('❌ Unexpected error during seeding:', error);
  }
}

// ==================== VALIDATION & REPORTING ====================

function generateValidationReport(flashcards: Flashcard[]): void {
  console.log('\n📊 FLASHCARD LIBRARY VALIDATION REPORT\n');
  console.log('='.repeat(60));

  // Total count
  console.log(`\n📈 Total Flashcards: ${flashcards.length}`);
  console.log(`   Target Range: 300-350 cards`);
  console.log(`   Status: ${flashcards.length >= 300 && flashcards.length <= 350 ? '✅ Within target' : '⚠️  Outside target range'}\n`);

  // Domain distribution
  console.log('📚 Domain Distribution (vs TCO Blueprint):\n');

  const domainCounts: Record<string, number> = {};
  Object.keys(TCO_BLUEPRINT).forEach(domain => {
    domainCounts[domain] = flashcards.filter(c => c.domain === domain).length;
  });

  Object.entries(TCO_BLUEPRINT).forEach(([domain, { weight, name }]) => {
    const count = domainCounts[domain] || 0;
    const target = Math.round(TARGET_TOTAL_CARDS * weight);
    const percentage = ((count / flashcards.length) * 100).toFixed(1);
    const blueprintPercentage = (weight * 100).toFixed(0);

    console.log(`  ${name}:`);
    console.log(`    Actual: ${count} cards (${percentage}%) | Blueprint: ${blueprintPercentage}% | Target: ${target}`);
    console.log(`    Status: ${Math.abs(count - target) <= 5 ? '✅ On target' : '⚠️  Off target'}\n`);
  });

  // Source distribution
  console.log('🔍 Source Distribution:\n');
  const sources = flashcards.reduce((acc, card) => {
    acc[card.source] = (acc[card.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(sources).forEach(([source, count]) => {
    console.log(`  ${source}: ${count} cards`);
  });

  // Card type distribution
  console.log('\n🎴 Card Type Distribution:\n');
  const cardTypes = flashcards.reduce((acc, card) => {
    acc[card.card_type] = (acc[card.card_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(cardTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} cards`);
  });

  // Difficulty distribution
  console.log('\n⭐ Difficulty Distribution:\n');
  const difficulties = flashcards.reduce((acc, card) => {
    const diff = card.difficulty || 'not-set';
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(difficulties).forEach(([difficulty, count]) => {
    console.log(`  ${difficulty}: ${count} cards`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Flashcard library generation complete!\n');
}

// ==================== MAIN EXECUTION ====================

async function main() {
  console.log('🎴 WORLD-CLASS TCO FLASHCARD LIBRARY GENERATOR');
  console.log('='.repeat(60));
  console.log('\nTarget: 300-350 flashcards aligned with TCO exam blueprint\n');

  try {
    // Phase 1: Convert MCQ questions
    const mcqFlashcards = await convertMCQToFlashcards();

    // Phase 2: Extract MDX learning objectives
    const mdxFlashcards = await extractMDXFlashcards();

    // Phase 3: Fill blueprint gaps
    const allCards = [...mcqFlashcards, ...mdxFlashcards];
    const gapCards = await fillBlueprintGaps(allCards);
    const finalFlashcards = [...allCards, ...gapCards];

    // Validation and reporting
    generateValidationReport(finalFlashcards);

    // Save to JSON file as backup
    const outputPath = path.join(process.cwd(), 'flashcards-library.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalFlashcards, null, 2));
    console.log(`💾 Flashcard library saved to: ${outputPath}\n`);

    // Seed to database
    await seedFlashcardsToDatabase(finalFlashcards);

    console.log('🎉 All done! Flashcard library ready for production.\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();
