#!/usr/bin/env tsx

/**
 * TCO Question Import Validation Script
 *
 * Validates the imported questions against TCO exam blueprint requirements
 * and performs comprehensive quality checks
 */

import fs from "fs";
import path from "path";
import {
  Question,
  TCODomain,
  QuestionCategory,
  Difficulty,
  TCO_DOMAIN_WEIGHTS,
} from "../src/types/exam";

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  statistics: {
    totalQuestions: number;
    domainDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
    difficultyDistribution: Record<string, number>;
    blueprintCompliance: Record<string, { actual: number; target: number; variance: number }>;
  };
}

function validateQuestionBank(): ValidationResult {
  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: [],
    statistics: {
      totalQuestions: 0,
      domainDistribution: {},
      categoryDistribution: {},
      difficultyDistribution: {},
      blueprintCompliance: {},
    },
  };

  try {
    // Import the question bank
    const dataPath = path.join(process.cwd(), "src/data/imported-questions-master.ts");

    if (!fs.existsSync(dataPath)) {
      result.errors.push("Imported questions file not found. Run import-questions.ts first.");
      result.passed = false;
      return result;
    }

    // Read and parse the generated file (simplified validation)
    const fileContent = fs.readFileSync(dataPath, "utf8");

    // Extract question count from metadata
    const totalMatch = fileContent.match(/totalQuestions: (\d+)/);
    const totalQuestions = totalMatch ? parseInt(totalMatch[1]) : 0;

    result.statistics.totalQuestions = totalQuestions;

    // Extract domain distribution
    const domainMatches = fileContent.matchAll(/'(.*?)': (\d+)/g);
    for (const match of domainMatches) {
      const domain = match[1];
      const count = parseInt(match[2]);
      result.statistics.domainDistribution[domain] = count;
    }

    // Validate against blueprint requirements
    const targetTotal = 4108;
    Object.entries(TCO_DOMAIN_WEIGHTS).forEach(([domain, percentage]) => {
      const targetCount = Math.floor((targetTotal * percentage) / 100);
      const actualCount = result.statistics.domainDistribution[domain] || 0;
      const variance = Math.abs(actualCount - targetCount);

      result.statistics.blueprintCompliance[domain] = {
        actual: actualCount,
        target: targetCount,
        variance,
      };

      if (actualCount === 0) {
        result.errors.push(`No questions found for domain: ${domain}`);
        result.passed = false;
      } else if (variance > targetCount * 0.1) {
        // Allow 10% variance
        result.warnings.push(
          `Domain ${domain} has ${actualCount} questions, target is ${targetCount} (${variance} variance)`
        );
      }
    });

    // Basic validation checks
    if (totalQuestions === 0) {
      result.errors.push("No questions were imported");
      result.passed = false;
    } else if (totalQuestions < 200) {
      result.errors.push(`Only ${totalQuestions} questions imported, expected 200+`);
      result.passed = false;
    } else {
      console.log(`✅ Successfully imported ${totalQuestions} questions`);
    }

    // Check for required files
    const requiredFiles = ["src/data/imported-questions-master.ts", "src/data/sample-questions.ts"];

    requiredFiles.forEach((file) => {
      const filePath = path.join(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        result.errors.push(`Required file missing: ${file}`);
        result.passed = false;
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result.errors.push(`Validation error: ${message}`);
    result.passed = false;
  }

  return result;
}

function generateValidationReport(result: ValidationResult): void {
  console.log("\n📋 TCO Question Import Validation Report");
  console.log("=".repeat(50));

  if (result.passed) {
    console.log("✅ Validation PASSED");
  } else {
    console.log("❌ Validation FAILED");
  }

  console.log(`📊 Total Questions: ${result.statistics.totalQuestions}`);

  if (Object.keys(result.statistics.domainDistribution).length > 0) {
    console.log("\n📈 Domain Distribution:");
    Object.entries(result.statistics.domainDistribution).forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count} questions`);
    });
  }

  if (Object.keys(result.statistics.blueprintCompliance).length > 0) {
    console.log("\n🎯 Blueprint Compliance:");
    Object.entries(result.statistics.blueprintCompliance).forEach(([domain, data]) => {
      const percentage = ((data.actual / result.statistics.totalQuestions) * 100).toFixed(1);
      const targetPercentage = TCO_DOMAIN_WEIGHTS[domain as TCODomain];
      const status = data.variance <= data.target * 0.1 ? "✅" : "⚠️";
      console.log(
        `  ${status} ${domain}: ${data.actual} (${percentage}%) vs target ${data.target} (${targetPercentage}%)`
      );
    });
  }

  if (result.errors.length > 0) {
    console.log("\n❌ Errors:");
    result.errors.forEach((error) => console.log(`  • ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log("\n⚠️ Warnings:");
    result.warnings.forEach((warning) => console.log(`  • ${warning}`));
  }

  console.log("\n" + "=".repeat(50));
}

// Run validation if this file is executed directly
if (require.main === module) {
  const result = validateQuestionBank();
  generateValidationReport(result);

  if (!result.passed) {
    process.exit(1);
  }
}

export { validateQuestionBank, generateValidationReport };
