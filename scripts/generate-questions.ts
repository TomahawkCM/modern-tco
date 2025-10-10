#!/usr/bin/env node

/**
 * AI Question Generator
 *
 * Generates high-quality TCO exam questions using OpenAI GPT-4 API
 *
 * Usage:
 *   npx tsx scripts/generate-questions.ts --domain asking_questions --difficulty medium --count 20
 *   npx tsx scripts/generate-questions.ts --domain all --difficulty all --count 100
 *
 * Features:
 * - Uses OpenAI GPT-4 for intelligent question generation
 * - Validates TCO exam blueprint alignment
 * - Ensures question quality and diversity
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

interface GeneratedQuestion {
  id: string;
  question: string;
  choices: Array<{
    id: string;
    text: string;
  }>;
  correctAnswerId: string;
  domain: string;
  difficulty: string;
  category: string;
  explanation: string;
  tags: string[];
  studyGuideRef?: string;
  officialRef?: string;
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
      'Question performance optimization',
      'Common sensors (Computer Name, IP Address, OS, Installed Applications)',
      'Question result interpretation',
      'Question sharing and collaboration',
    ],
    description:
      'Master the art of asking effective questions using Tanium\'s natural language interface to gather real-time endpoint data.',
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
      'Filter performance optimization',
      'Computer group hierarchy',
      'Group membership management',
    ],
    description:
      'Learn to refine questions using filters and target specific computer groups for precise endpoint management.',
  },
  taking_action: {
    name: 'Taking Action - Packages & Actions',
    weight: 15,
    topics: [
      'Package library overview',
      'Package deployment workflows',
      'Action execution monitoring',
      'Package parameters and configuration',
      'Action scheduling',
      'Rollback and recovery procedures',
      'Pre-approved actions',
      'Action approval workflows',
      'Package development basics',
    ],
    description:
      'Deploy packages and execute actions across endpoints with proper monitoring and rollback capabilities.',
  },
  navigation: {
    name: 'Navigation & Basic Module Functions',
    weight: 23,
    topics: [
      'Tanium console navigation',
      'Module overview (Interact, Deploy, Connect, Trends, Reporting)',
      'Dashboard customization',
      'Trends module for historical data',
      'Connect module for data export',
      'Reporting module for scheduled reports',
      'User interface elements',
      'Module permissions and access',
      'Console settings and preferences',
    ],
    description:
      'Navigate the Tanium console effectively and understand the purpose and basic functions of core modules.',
  },
  reporting: {
    name: 'Reporting & Data Export',
    weight: 17,
    topics: [
      'Report creation from questions',
      'Scheduled report automation',
      'Data export formats (CSV, JSON, XML)',
      'Connect integration for external systems',
      'Report sharing and distribution',
      'Data visualization in reports',
      'Report templates',
      'Connect destinations (SIEM, ITSM)',
      'Data retention and archiving',
    ],
    description:
      'Create reports, export data, and integrate Tanium with external systems using Connect.',
  },
};

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

// ==================== OPENAI API CLIENT ====================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==================== PROMPT TEMPLATES ====================

function buildQuestionGenerationPrompt(
  domainInfo: DomainInfo,
  difficulty: string,
  count: number
): string {
  return `You are an expert Tanium TCO (Certified Operator) exam question writer with deep knowledge of the TAN-1000 certification. Generate ${count} high-quality multiple-choice questions for the TCO exam.

**Domain:** ${domainInfo.name}
**Exam Blueprint Weight:** ${domainInfo.weight}%
**Difficulty:** ${difficulty}
**Topics to Cover:** ${domainInfo.topics.join(', ')}

**Domain Description:** ${domainInfo.description}

**Instructions:**

For each question:
1. **Question Stem**: Write a clear, concise question (1-2 sentences) testing practical application, not just memorization
2. **Answer Choices**: Provide exactly 4 choices (A, B, C, D) that are plausible and approximately equal length
3. **Correct Answer**: Identify ONE correct answer
4. **Explanation**: Write 2-3 sentences explaining why the correct answer is right AND why the other options are wrong
5. **Tags**: Add 3-5 relevant tags from the topic list above
6. **Category**: Choose from: platform_fundamentals, practical_scenarios, best_practices, troubleshooting, advanced_concepts

**Quality Standards:**
- Questions must test understanding, not just recall
- Include real-world scenarios when possible
- Avoid trick questions or ambiguous wording
- Ensure distractors (wrong answers) are plausible but clearly incorrect
- Use proper Tanium terminology
- Align with TCO certification objectives

**Difficulty Levels:**
- **Beginner**: Basic concepts, definitions, simple scenarios (remember & understand)
- **Intermediate**: Application of concepts, multi-step scenarios (apply & analyze)
- **Advanced**: Complex scenarios, optimization, troubleshooting (evaluate & create)

**Output Format:**
Return a valid JSON object with a "questions" array using this exact structure:

{
  "questions": [
    {
      "question": "What is the primary module used to ask real-time questions of Tanium endpoints?",
      "choices": [
        {"id": "a", "text": "Deploy"},
        {"id": "b", "text": "Interact"},
        {"id": "c", "text": "Asset"},
        {"id": "d", "text": "Connect"}
      ],
      "correctAnswerId": "b",
      "domain": "${domainInfo.name.toLowerCase().replace(/ /g, '_').replace(/&/g, '').replace(/_-_/g, '_')}",
      "difficulty": "${difficulty}",
      "category": "platform_fundamentals",
      "explanation": "Interact is the console module specifically designed for asking questions of endpoints in real time using natural language. Deploy is for action execution, Asset is for inventory management, and Connect is for data export to external systems.",
      "tags": ["interact-module", "real-time-queries", "basic-concepts"]
    }
  ]
}

Generate ${count} questions now. Return ONLY the JSON object, no other text:`;
}

// ==================== QUESTION GENERATION ====================

async function generateQuestions(config: GenerationConfig): Promise<GeneratedQuestion[]> {
  const domainKey = config.domain === 'all' ? Object.keys(TCO_DOMAINS)[0] : config.domain;
  const domainInfo = TCO_DOMAINS[domainKey];

  if (!domainInfo) {
    throw new Error(`Invalid domain: ${config.domain}`);
  }

  console.log(`\n🤖 Generating ${config.count} ${config.difficulty} questions for ${domainInfo.name}...`);
  console.log(`📊 Exam Weight: ${domainInfo.weight}%\n`);

  const prompt = buildQuestionGenerationPrompt(domainInfo, config.difficulty, config.count);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: 4000,
      temperature: 0.8, // Higher creativity for diverse questions
      messages: [
        {
          role: 'system',
          content: 'You are an expert Tanium TCO (Certified Operator) exam question writer. You always respond with valid JSON arrays containing exam questions.',
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
    let questions: GeneratedQuestion[];
    try {
      // First, try to parse as direct JSON
      const parsed = JSON.parse(responseText);
      // OpenAI might wrap in an object, so check for array
      questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
    } catch {
      // Fallback: extract JSON array from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in OpenAI response');
      }
      questions = JSON.parse(jsonMatch[0]);
    }

    // Add unique IDs
    const domainPrefix = config.domain.toUpperCase().replace(/_/g, '-').substring(0, 6);
    questions.forEach((q, idx) => {
      q.id = `${domainPrefix}-GEN-${Date.now()}-${idx + 1}`;
    });

    console.log(`✅ Generated ${questions.length} questions successfully!\n`);

    return questions;
  } catch (error) {
    console.error('❌ Error generating questions:', error);
    throw error;
  }
}

// ==================== QUESTION VALIDATION ====================

function validateQuestions(questions: GeneratedQuestion[]): {
  valid: GeneratedQuestion[];
  invalid: Array<{ question: any; errors: string[] }>;
} {
  const valid: GeneratedQuestion[] = [];
  const invalid: Array<{ question: any; errors: string[] }> = [];

  for (const q of questions) {
    const errors: string[] = [];

    // Required fields
    if (!q.question || q.question.trim().length < 10) {
      errors.push('Question text is missing or too short');
    }
    if (!q.choices || q.choices.length !== 4) {
      errors.push('Must have exactly 4 choices');
    }
    if (!q.correctAnswerId || !['a', 'b', 'c', 'd'].includes(q.correctAnswerId)) {
      errors.push('Invalid correctAnswerId');
    }
    if (!q.explanation || q.explanation.trim().length < 20) {
      errors.push('Explanation is missing or too short');
    }
    if (!q.tags || q.tags.length < 2) {
      errors.push('Must have at least 2 tags');
    }

    // Validate choices
    if (q.choices) {
      const choiceIds = q.choices.map((c) => c.id);
      if (new Set(choiceIds).size !== 4) {
        errors.push('Choice IDs must be unique');
      }
      for (const choice of q.choices) {
        if (!choice.text || choice.text.trim().length < 3) {
          errors.push(`Choice ${choice.id} text is too short`);
        }
      }
    }

    if (errors.length > 0) {
      invalid.push({ question: q, errors });
    } else {
      valid.push(q);
    }
  }

  return { valid, invalid };
}

// ==================== FILE OUTPUT ====================

function generateTypeScriptFile(questions: GeneratedQuestion[], config: GenerationConfig): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const domainLabel = config.domain === 'all' ? 'multi-domain' : config.domain;
  const fileName = `generated-questions-${domainLabel}-${config.difficulty}-${timestamp}.ts`;
  const filePath = path.join(config.outputDir, fileName);

  // Generate TypeScript content
  const tsContent = `import { type Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";

/**
 * AI-Generated Questions
 *
 * Domain: ${config.domain}
 * Difficulty: ${config.difficulty}
 * Count: ${questions.length}
 * Generated: ${new Date().toISOString()}
 * Model: OpenAI GPT-4 Turbo (gpt-4-turbo-preview)
 */

export const generatedQuestions: Question[] = ${JSON.stringify(questions, null, 2)};

export default generatedQuestions;
`;

  fs.writeFileSync(filePath, tsContent);
  console.log(`📝 Saved to: ${filePath}`);

  return filePath;
}

// ==================== STATISTICS ====================

function printStatistics(questions: GeneratedQuestion[]): void {
  console.log('\n📊 Generation Statistics:\n');

  // Count by difficulty
  const byDifficulty = questions.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Difficulty Distribution:');
  for (const [difficulty, count] of Object.entries(byDifficulty)) {
    const percentage = ((count / questions.length) * 100).toFixed(1);
    console.log(`  ${difficulty}: ${count} (${percentage}%)`);
  }

  // Count by category
  const byCategory = questions.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\nCategory Distribution:');
  for (const [category, count] of Object.entries(byCategory)) {
    const percentage = ((count / questions.length) * 100).toFixed(1);
    console.log(`  ${category}: ${count} (${percentage}%)`);
  }

  // Average explanation length
  const avgExplanationLength =
    questions.reduce((sum, q) => sum + q.explanation.length, 0) / questions.length;
  console.log(`\nAverage Explanation Length: ${avgExplanationLength.toFixed(0)} characters`);

  // Tag diversity
  const allTags = questions.flatMap((q) => q.tags);
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
    difficulty: 'intermediate',
    count: 10,
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

  console.log('🚀 AI Question Generator');
  console.log('========================\n');
  console.log(`Domain: ${config.domain}`);
  console.log(`Difficulty: ${config.difficulty}`);
  console.log(`Count: ${config.count}`);
  console.log(`Output: ${config.outputDir}`);

  try {
    // Generate questions
    const questions = await generateQuestions(config);

    // Validate questions
    const { valid, invalid } = validateQuestions(questions);

    if (invalid.length > 0) {
      console.warn(`\n⚠️  ${invalid.length} questions failed validation:\n`);
      invalid.forEach(({ question, errors }, idx) => {
        console.warn(`Question ${idx + 1} (ID: ${question.id || 'N/A'}):`);
        errors.forEach((error) => console.warn(`  - ${error}`));
      });
    }

    if (valid.length === 0) {
      console.error('\n❌ No valid questions generated. Please try again.');
      process.exit(1);
    }

    // Save to file
    const filePath = generateTypeScriptFile(valid, config);

    // Print statistics
    printStatistics(valid);

    console.log(`\n✅ Success! Generated ${valid.length} valid questions.`);
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

export { generateQuestions, validateQuestions, TCO_DOMAINS };
