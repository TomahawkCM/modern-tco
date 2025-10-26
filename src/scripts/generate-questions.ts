#!/usr/bin/env node

/**
 * TCO Question Generation Script
 *
 * Generates 800+ new questions to expand the TCO question bank from 200 to 1,000+ questions
 * while maintaining official TAN-1000 certification blueprint distribution.
 *
 * Usage: npm run generate-questions
 */

import fs from "fs/promises";
import path from "path";
import { QuestionGeneratorService } from "../services/QuestionGeneratorService";
import { Difficulty, QuestionCategory, TCODomain, TCO_DOMAIN_WEIGHTS } from "../types/exam";
import { defaultDifficultyRecord } from '../lib/difficulty';

interface GenerationPlan {
  domain: TCODomain;
  targetTotal: number;
  currentCount: number;
  toGenerate: number;
  distributions: {
    difficulty: Record<Difficulty, number>;
    category: Record<QuestionCategory, number>;
  };
}

class QuestionBankExpansion {
  private generator: QuestionGeneratorService;
  private outputDir: string;

  constructor() {
    this.generator = new QuestionGeneratorService();
    this.outputDir = path.join(process.cwd(), "src", "data", "generated");
  }

  async expandQuestionBank(): Promise<void> {
    console.log("🚀 Starting TCO Question Bank Expansion");
    console.log("📊 Target: Expand from 200 to 1,000+ questions (800 new questions)");
    console.log("🎯 Maintaining official TAN-1000 blueprint distribution\n");

    // Create output directory
    await this.ensureOutputDirectory();

    // Calculate generation plan
    const generationPlan = this.calculateGenerationPlan();

    // Display plan
    this.displayGenerationPlan(generationPlan);

    // Generate questions for each domain
    for (const plan of generationPlan) {
      await this.generateDomainQuestions(plan);
    }

    console.log("\n✅ Question bank expansion completed successfully!");
    console.log("📁 Generated files saved to: src/data/generated/");
    console.log("🔧 Next steps: Review, validate, and integrate questions");
  }

  /**
   * Calculate how many questions to generate for each domain
   */
  private calculateGenerationPlan(): GenerationPlan[] {
    const TARGET_TOTAL = 1000;
    const CURRENT_TOTAL = 200;
    const TO_GENERATE = TARGET_TOTAL - CURRENT_TOTAL;

    // Current distribution (from validation report)
    const currentCounts: Record<TCODomain, number> = {
      [TCODomain.ASKING_QUESTIONS]: 43,
      [TCODomain.REFINING_QUESTIONS]: 45,
      [TCODomain.TAKING_ACTION]: 34,
      [TCODomain.NAVIGATION_MODULES]: 45,
      [TCODomain.REPORTING_EXPORT]: 33,
      [TCODomain.SECURITY]: 0, // Add missing domain
      [TCODomain.FUNDAMENTALS]: 0, // Add missing domain
      [TCODomain.TROUBLESHOOTING]: 0, // Add missing domain
      [TCODomain.REFINING_TARGETING]: 0, // Add missing TCODomain member
    };

    const plans: GenerationPlan[] = [];

    for (const [domain, weight] of Object.entries(TCO_DOMAIN_WEIGHTS)) {
      const targetTotal = Math.round((TARGET_TOTAL * weight) / 100);
      const currentCount = currentCounts[domain as TCODomain];
      const toGenerate = Math.max(0, targetTotal - currentCount);

      plans.push({
        domain: domain as TCODomain,
        targetTotal,
        currentCount,
        toGenerate,
        distributions: this.calculateDistributions(toGenerate),
      });
    }

    return plans;
  }

  /**
   * Calculate difficulty and category distributions for a domain
   */
  private calculateDistributions(totalQuestions: number) {
    // Difficulty distribution (based on typical certification exam patterns)
    const difficultyDistribution: Record<Difficulty, number> = defaultDifficultyRecord((d) => {
      switch (d) {
        case Difficulty.BEGINNER:
          return Math.round(totalQuestions * 0.4);
        case Difficulty.INTERMEDIATE:
          return Math.round(totalQuestions * 0.45);
        case Difficulty.ADVANCED:
          return Math.round(totalQuestions * 0.15);
        case Difficulty.EXPERT:
          return 0;
      }
    });

    // Category distribution (balanced across categories)
    const categoryCount = Object.keys(QuestionCategory).length;
    const basePerCategory = Math.floor(totalQuestions / categoryCount);
    const remainder = totalQuestions % categoryCount;

    const categoryDistribution: Record<QuestionCategory, number> = Object.fromEntries(
      Object.values(QuestionCategory).map((category) => [category, 0])
    ) as Record<QuestionCategory, number>;
    Object.values(QuestionCategory).forEach((category, index) => {
      categoryDistribution[category] = basePerCategory + (index < remainder ? 1 : 0);
    });

    return {
      difficulty: difficultyDistribution,
      category: categoryDistribution,
    };
  }

  /**
   * Display the generation plan
   */
  private displayGenerationPlan(plans: GenerationPlan[]): void {
    console.log("📋 GENERATION PLAN\n");
    console.log(`${"Domain".padEnd(35) + "Current".padEnd(10) + "Target".padEnd(10)}Generate`);
    console.log("-".repeat(70));

    let totalToGenerate = 0;
    for (const plan of plans) {
      const domainName = plan.domain.substring(0, 32);
      console.log(
        domainName.padEnd(35) +
          plan.currentCount.toString().padEnd(10) +
          plan.targetTotal.toString().padEnd(10) +
          plan.toGenerate.toString()
      );
      totalToGenerate += plan.toGenerate;
    }

    console.log("-".repeat(70));
    console.log(`TOTAL TO GENERATE: ${totalToGenerate} questions\n`);
  }

  /**
   * Generate questions for a specific domain
   */
  private async generateDomainQuestions(plan: GenerationPlan): Promise<void> {
    if (plan.toGenerate === 0) {
      console.log(`⏭️ Skipping ${plan.domain} - already at target count`);
      return;
    }

    console.log(`\n🎯 Generating questions for: ${plan.domain}`);
    console.log(`📊 Target: ${plan.toGenerate} questions`);

    const allQuestions = [];

    // Generate by difficulty level
    for (const [difficulty, count] of Object.entries(plan.distributions.difficulty)) {
      if (count === 0) continue;

      console.log(`\n  🔹 ${difficulty}: ${count} questions`);

      // Distribute across categories
      const categoryCounts = this.distributeBetweenCategories(count, plan.distributions.category);

      for (const [category, categoryCount] of Object.entries(categoryCounts)) {
        if (categoryCount === 0) continue;

        console.log(`    📂 ${category}: ${categoryCount} questions`);

        try {
          const questions = await this.generator.generateQuestions({
            domain: plan.domain,
            difficulty: difficulty as Difficulty,
            category: category as QuestionCategory,
            count: categoryCount,
            batchSize: 3, // Small batches for better control
          });

          // Validate questions
          const { valid, invalid } = this.generator.validateQuestions(questions);

          if (invalid.length > 0) {
            console.warn(`    ⚠️ ${invalid.length} questions failed validation`);
            invalid.forEach((item) => {
              console.warn(`      - ${item.issues.join(", ")}`);
            });
          }

          allQuestions.push(...valid);
          console.log(`    ✅ Generated ${valid.length} valid questions`);
        } catch (error) {
          console.error(`    ❌ Failed to generate questions:`, error);
        }

        // Rate limiting between categories
        await this.delay(500);
      }
    }

    // Save domain questions to file
    await this.saveDomainQuestions(plan.domain, allQuestions);

    console.log(`✅ ${plan.domain}: Generated ${allQuestions.length}/${plan.toGenerate} questions`);
  }

  /**
   * Distribute questions between categories proportionally
   */
  private distributeBetweenCategories(
    totalCount: number,
    categoryDistribution: Record<QuestionCategory, number>
  ): Record<QuestionCategory, number> {
    const totalDistribution = Object.values(categoryDistribution).reduce(
      (sum, count) => sum + count,
      0
    );
    const result: Record<QuestionCategory, number> = Object.fromEntries(
      Object.values(QuestionCategory).map((category) => [category, 0])
    ) as Record<QuestionCategory, number>;

    Object.entries(categoryDistribution).forEach(([category, distributionCount]) => {
      const proportion = distributionCount / totalDistribution;
      result[category as QuestionCategory] = Math.round(totalCount * proportion);
    });

    return result;
  }

  /**
   * Save generated questions for a domain to a TypeScript file
   */
  private async saveDomainQuestions(domain: TCODomain, questions: any[]): Promise<void> {
    const domainCodes: Record<TCODomain, string> = {
      [TCODomain.ASKING_QUESTIONS]: "asking",
      [TCODomain.REFINING_QUESTIONS]: "refining",
      [TCODomain.TAKING_ACTION]: "taking",
      [TCODomain.NAVIGATION_MODULES]: "navigation",
      [TCODomain.REPORTING_EXPORT]: "reporting",
      [TCODomain.SECURITY]: "security", // Add missing domain
      [TCODomain.FUNDAMENTALS]: "fundamentals", // Add missing domain
      [TCODomain.TROUBLESHOOTING]: "troubleshooting", // Add missing domain
      [TCODomain.REFINING_TARGETING]: "refiningTargeting", // Add missing TCODomain member
    };

    const filename = `generated-questions-${domainCodes[domain]}.ts`;
    const filepath = path.join(this.outputDir, filename);

    const content = `import { Question, TCODomain, Difficulty, QuestionCategory } from '@/types/exam'

/**
 * Generated Questions - ${domain}
 * Generated: ${new Date().toISOString()}
 * Count: ${questions.length} questions
 */

export const generated${domainCodes[domain].charAt(0).toUpperCase()}${domainCodes[domain].slice(1)}Questions: Question[] = ${JSON.stringify(questions, null, 2)}
`;

    await fs.writeFile(filepath, content, "utf-8");
    console.log(`💾 Saved to: ${filename}`);
  }

  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log("📁 Created output directory: src/data/generated/");
    }
  }

  /**
   * Add delay for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  try {
    const expansion = new QuestionBankExpansion();
    await expansion.expandQuestionBank();
  } catch (error) {
    console.error("💥 Fatal error during question generation:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  void main();
}
