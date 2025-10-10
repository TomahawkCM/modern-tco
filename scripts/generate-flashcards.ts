#!/usr/bin/env node

/**
 * AI Flashcard Generator
 *
 * Generates high-quality TCO flashcards using OpenAI GPT-4 API
 *
 * Usage:
 *   npx tsx scripts/generate-flashcards.ts --domain asking_questions --difficulty medium --count 50
 *   npx tsx scripts/generate-flashcards.ts --domain all --difficulty all --count 500
 *
 * Features:
 * - Uses OpenAI GPT-4 for intelligent flashcard generation
 * - 3 difficulty levels (easy, medium, hard)
 * - 6 TCO domains with proper categorization
 * - Validates flashcard quality
 * - Outputs TypeScript files ready for import
 * - Provides detailed statistics
 */

import dotenv from 'dotenv';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// ==================== TYPES ====================

interface GeneratedFlashcard {
  front: string;
  back: string;
  hint?: string;
  domain: string;
  category: string;
  difficulty: string;
  tags: string[];
  study_guide_ref?: string;
  source: string;
}

interface GenerationConfig {
  domain: string;
  difficulty: string;
  count: number;
  outputDir: string;
}

interface DomainInfo {
  name: string;
  weight: number;
  topics: string[];
  description: string;
}

// ==================== DOMAIN DEFINITIONS ====================

const TCO_DOMAINS: Record<string, DomainInfo> = {
  asking_questions: {
    name: 'Asking Questions',
    weight: 22,
    topics: [
      'Interact module navigation',
      'Natural language query syntax',
      'Sensor library (500+ sensors)',
      'Question construction best practices',
      'Saved questions management',
      'Common sensors (Computer Name, IP Address, OS)',
      'Question result interpretation',
    ],
    description: 'Master asking effective questions using Tanium\'s natural language interface.',
  },
  refining_targeting: {
    name: 'Refining Questions & Targeting',
    weight: 23,
    topics: [
      'Computer groups (static and dynamic)',
      'Advanced filtering techniques',
      'Targeting specific endpoints',
      'RBAC (Role-Based Access Control)',
      'Content set scoping',
      'Boolean logic in filters',
      'Computer group hierarchy',
    ],
    description: 'Learn to refine questions using filters and target specific computer groups.',
  },
  taking_action: {
    name: 'Taking Action - Packages & Actions',
    weight: 15,
    topics: [
      'Package library overview',
      'Package deployment workflows',
      'Action execution monitoring',
      'Package parameters',
      'Action scheduling',
      'Rollback procedures',
      'Pre-approved actions',
    ],
    description: 'Deploy packages and execute actions across endpoints.',
  },
  navigation: {
    name: 'Navigation & Basic Module Functions',
    weight: 23,
    topics: [
      'Tanium console navigation',
      'Module overview (Interact, Deploy, Connect, Trends)',
      'Dashboard customization',
      'Trends module for historical data',
      'Connect module for data export',
      'Reporting module',
      'User interface elements',
    ],
    description: 'Navigate the Tanium console and understand core modules.',
  },
  reporting: {
    name: 'Reporting & Data Export',
    weight: 17,
    topics: [
      'Report creation from questions',
      'Scheduled report automation',
      'Data export formats (CSV, JSON, XML)',
      'Connect integration',
      'Report sharing',
      'Data visualization',
      'Report templates',
    ],
    description: 'Create reports, export data, and integrate with external systems.',
  },
};

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const CATEGORIES = ['terminology', 'syntax', 'best_practices', 'troubleshooting', 'exam_focused'];

// ==================== OPENAI API CLIENT ====================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==================== PROMPT TEMPLATES ====================

function buildFlashcardGenerationPrompt(
  domainInfo: DomainInfo,
  difficulty: string,
  count: number
): string {
  return `You are an expert Tanium TCO (Certified Operator) flashcard creator with deep knowledge of spaced repetition learning. Generate ${count} high-quality flashcards for effective studying.

**Domain:** ${domainInfo.name}
**Exam Blueprint Weight:** ${domainInfo.weight}%
**Difficulty:** ${difficulty}
**Topics to Cover:** ${domainInfo.topics.join(', ')}

**Domain Description:** ${domainInfo.description}

**Flashcard Creation Guidelines:**

**Front Side (Question/Prompt):**
- Clear, specific question or concept prompt
- 1-2 sentences maximum
- Focuses on ONE specific concept (not multiple)
- Uses active recall principles

**Back Side (Answer):**
- Concise answer (2-4 sentences)
- Directly answers the front side
- Includes key details and context
- Avoids unnecessary elaboration

**Hints (Optional):**
- Only for difficult/hard flashcards
- Provides scaffolding without giving away the answer
- 1 sentence maximum

**Categories:**
- **terminology**: Key terms, definitions, acronyms
- **syntax**: Command syntax, query structure, exact formatting
- **best_practices**: Recommended approaches, guidelines, workflows
- **troubleshooting**: Problem-solving, error handling, debugging
- **exam_focused**: High-value exam concepts, common pitfalls

**Difficulty Levels:**
- **Easy**: Basic definitions, simple facts, common terms
- **Medium**: Application of concepts, multi-step processes, integration
- **Hard**: Complex scenarios, troubleshooting, edge cases, optimization

**Quality Standards:**
- One concept per flashcard (atomic principle)
- Clear and unambiguous
- Testable and verifiable
- Proper Tanium terminology
- Aligned with TCO certification

**Output Format:**
Return a valid JSON object with a "flashcards" array using this exact structure:

{
  "flashcards": [
    {
      "front": "What is the primary module used to ask real-time questions of Tanium endpoints?",
      "back": "Interact is the console module specifically designed for asking questions of endpoints in real time using natural language syntax. It provides access to the sensor library and question builder.",
      "hint": "Think about which module is used for querying...",
      "domain": "${domainInfo.name.toLowerCase().replace(/ /g, '_').replace(/&/g, '').replace(/_-_/g, '_')}",
      "category": "terminology",
      "difficulty": "${difficulty}",
      "tags": ["interact-module", "real-time-queries", "basic-concepts"],
      "study_guide_ref": "Module 1: Asking Questions",
      "source": "ai_generated"
    }
  ]
}

**Important:**
- Generate diverse flashcards covering different topics
- Mix categories (terminology, syntax, best_practices, etc.)
- Include 3-5 relevant tags per flashcard
- Only add hints for medium/hard difficulty cards
- Ensure proper JSON formatting

Generate ${count} flashcards now. Return ONLY the JSON object, no other text:`;
}

// ==================== FLASHCARD GENERATION ====================

async function generateFlashcards(config: GenerationConfig): Promise<GeneratedFlashcard[]> {
  const domainKey = config.domain === 'all' ? Object.keys(TCO_DOMAINS)[0] : config.domain;
  const domainInfo = TCO_DOMAINS[domainKey];

  if (!domainInfo) {
    throw new Error(`Invalid domain: ${config.domain}`);
  }

  console.log(`\n🤖 Generating ${config.count} ${config.difficulty} flashcards for ${domainInfo.name}...`);
  console.log(`📊 Exam Weight: ${domainInfo.weight}%\n`);

  const prompt = buildFlashcardGenerationPrompt(domainInfo, config.difficulty, config.count);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: 4000,
      temperature: 0.8, // Higher creativity for diverse flashcards
      messages: [
        {
          role: 'system',
          content: 'You are an expert Tanium TCO (Certified Operator) flashcard creator. You always respond with valid JSON objects containing flashcards.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content || '';

    // Extract JSON from response
    let flashcards: GeneratedFlashcard[];
    try {
      // First, try to parse as direct JSON
      const parsed = JSON.parse(responseText);
      // OpenAI might wrap in an object, so check for array
      flashcards = Array.isArray(parsed) ? parsed : parsed.flashcards || [];
    } catch {
      // Fallback: extract JSON array from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in OpenAI response');
      }
      flashcards = JSON.parse(jsonMatch[0]);
    }

    console.log(`✅ Generated ${flashcards.length} flashcards successfully!\n`);

    return flashcards;
  } catch (error) {
    console.error('❌ Error generating flashcards:', error);
    throw error;
  }
}

// ==================== FLASHCARD VALIDATION ====================

function validateFlashcards(flashcards: GeneratedFlashcard[]): {
  valid: GeneratedFlashcard[];
  invalid: Array<{ flashcard: any; errors: string[] }>;
} {
  const valid: GeneratedFlashcard[] = [];
  const invalid: Array<{ flashcard: any; errors: string[] }> = [];

  for (const f of flashcards) {
    const errors: string[] = [];

    // Required fields
    if (!f.front || f.front.trim().length < 10) {
      errors.push('Front text is missing or too short');
    }
    if (!f.back || f.back.trim().length < 10) {
      errors.push('Back text is missing or too short');
    }
    if (!f.domain) {
      errors.push('Domain is required');
    }
    if (!f.category || !CATEGORIES.includes(f.category)) {
      errors.push('Invalid or missing category');
    }
    if (!f.difficulty || !DIFFICULTIES.includes(f.difficulty)) {
      errors.push('Invalid or missing difficulty');
    }
    if (!f.tags || f.tags.length < 2) {
      errors.push('Must have at least 2 tags');
    }

    // Atomic principle check (one concept)
    if (f.front.includes(' and ') && f.front.includes('?')) {
      errors.push('Flashcard may contain multiple concepts (violates atomic principle)');
    }

    if (errors.length > 0) {
      invalid.push({ flashcard: f, errors });
    } else {
      valid.push(f);
    }
  }

  return { valid, invalid };
}

// ==================== FILE OUTPUT ====================

function generateTypeScriptFile(flashcards: GeneratedFlashcard[], config: GenerationConfig): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const domainLabel = config.domain === 'all' ? 'multi-domain' : config.domain;
  const fileName = `generated-flashcards-${domainLabel}-${config.difficulty}-${timestamp}.ts`;
  const filePath = path.join(config.outputDir, fileName);

  // Generate TypeScript content
  const tsContent = `import { CreateFlashcardLibraryCard } from "@/types/flashcard-library";

/**
 * AI-Generated Flashcards
 *
 * Domain: ${config.domain}
 * Difficulty: ${config.difficulty}
 * Count: ${flashcards.length}
 * Generated: ${new Date().toISOString()}
 * Model: OpenAI GPT-4 Turbo (gpt-4-turbo-preview)
 */

export const generatedFlashcards: CreateFlashcardLibraryCard[] = ${JSON.stringify(flashcards, null, 2)};

export default generatedFlashcards;
`;

  fs.writeFileSync(filePath, tsContent);
  console.log(`📝 Saved to: ${filePath}`);

  return filePath;
}

// ==================== STATISTICS ====================

function printStatistics(flashcards: GeneratedFlashcard[]): void {
  console.log('\n📊 Generation Statistics:\n');

  // Count by category
  const byCategory = flashcards.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Category Distribution:');
  for (const [category, count] of Object.entries(byCategory)) {
    const percentage = ((count / flashcards.length) * 100).toFixed(1);
    console.log(`  ${category}: ${count} (${percentage}%)`);
  }

  // Flashcards with hints
  const withHints = flashcards.filter((f) => f.hint).length;
  console.log(`\nFlashcards with hints: ${withHints} (${((withHints / flashcards.length) * 100).toFixed(1)}%)`);

  // Average lengths
  const avgFrontLength =
    flashcards.reduce((sum, f) => sum + f.front.length, 0) / flashcards.length;
  const avgBackLength =
    flashcards.reduce((sum, f) => sum + f.back.length, 0) / flashcards.length;
  console.log(`\nAverage Front Length: ${avgFrontLength.toFixed(0)} characters`);
  console.log(`Average Back Length: ${avgBackLength.toFixed(0)} characters`);

  // Tag diversity
  const allTags = flashcards.flatMap((f) => f.tags);
  const uniqueTags = new Set(allTags);
  console.log(`Total Unique Tags: ${uniqueTags.size}`);

  console.log('\nMost Common Tags:');
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  sortedTags.forEach(([tag, count]) => {
    console.log(`  ${tag}: ${count}`);
  });
}

// ==================== MAIN FUNCTION ====================

async function main() {
  const args = process.argv.slice(2);
  const config: GenerationConfig = {
    domain: 'asking_questions',
    difficulty: 'medium',
    count: 20,
    outputDir: path.join(__dirname, '..', 'src', 'data', 'generated'),
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--domain' && args[i + 1]) {
      config.domain = args[i + 1];
      i++;
    } else if (args[i] === '--difficulty' && args[i + 1]) {
      config.difficulty = args[i + 1];
      i++;
    } else if (args[i] === '--count' && args[i + 1]) {
      config.count = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      config.outputDir = args[i + 1];
      i++;
    }
  }

  // Validate config
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable not set');
    console.error('Set it with: export OPENAI_API_KEY=your-api-key');
    process.exit(1);
  }

  if (config.domain !== 'all' && !TCO_DOMAINS[config.domain]) {
    console.error(`❌ Error: Invalid domain "${config.domain}"`);
    console.error(`Valid domains: ${Object.keys(TCO_DOMAINS).join(', ')}, all`);
    process.exit(1);
  }

  if (!DIFFICULTIES.includes(config.difficulty) && config.difficulty !== 'all') {
    console.error(`❌ Error: Invalid difficulty "${config.difficulty}"`);
    console.error(`Valid difficulties: ${DIFFICULTIES.join(', ')}, all`);
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  console.log('🚀 AI Flashcard Generator');
  console.log('========================\n');
  console.log(`Domain: ${config.domain}`);
  console.log(`Difficulty: ${config.difficulty}`);
  console.log(`Count: ${config.count}`);
  console.log(`Output: ${config.outputDir}`);

  try {
    // Generate flashcards
    const flashcards = await generateFlashcards(config);

    // Validate flashcards
    const { valid, invalid } = validateFlashcards(flashcards);

    if (invalid.length > 0) {
      console.warn(`\n⚠️  ${invalid.length} flashcards failed validation:\n`);
      invalid.forEach(({ flashcard, errors }, idx) => {
        console.warn(`Flashcard ${idx + 1}:`);
        errors.forEach((error) => console.warn(`  - ${error}`));
      });
    }

    if (valid.length === 0) {
      console.error('\n❌ No valid flashcards generated. Please try again.');
      process.exit(1);
    }

    // Save to file
    const filePath = generateTypeScriptFile(valid, config);

    // Print statistics
    printStatistics(valid);

    console.log(`\n✅ Success! Generated ${valid.length} valid flashcards.`);
    console.log(`📁 Output file: ${filePath}\n`);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { generateFlashcards, validateFlashcards, TCO_DOMAINS };
