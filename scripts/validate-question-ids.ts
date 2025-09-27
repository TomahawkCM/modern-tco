#!/usr/bin/env tsx

/**
 * TCO Question ID Uniqueness and Format Validation Script
 *
 * Validates that all imported questions have unique IDs and follow
 * the proper TCO-{DOMAIN}-{NUMBER} format
 */

import fs from "fs";
import path from "path";

interface ValidationReport {
  totalQuestions: number;
  uniqueIds: number;
  duplicateIds: string[];
  invalidFormatIds: string[];
  domainCounts: Record<string, number>;
  formatCompliance: number;
  passed: boolean;
}

function validateQuestionIds(): ValidationReport {
  const report: ValidationReport = {
    totalQuestions: 0,
    uniqueIds: 0,
    duplicateIds: [],
    invalidFormatIds: [],
    domainCounts: {},
    formatCompliance: 0,
    passed: true,
  };

  try {
    // Read the master imported questions file
    const dataPath = path.join(process.cwd(), "src/data/imported-questions-master.ts");

    if (!fs.existsSync(dataPath)) {
      throw new Error("Imported questions master file not found");
    }

    const fileContent = fs.readFileSync(dataPath, "utf8");

    // Extract all question IDs using regex
    const idMatches = fileContent.matchAll(/"id":\s*"([^"]+)"/g);
    const allIds: string[] = [];
    const idCounts: Record<string, number> = {};

    for (const match of idMatches) {
      const id = match[1];
      allIds.push(id);
      idCounts[id] = (idCounts[id] || 0) + 1;
    }

    report.totalQuestions = allIds.length;
    report.uniqueIds = Object.keys(idCounts).length;

    // Find duplicates
    report.duplicateIds = Object.entries(idCounts)
      .filter(([_, count]) => count > 1)
      .map(([id, _]) => id);

    // Validate format: TCO-{DOMAIN}-{NUMBER}
    const validFormat = /^TCO-[A-Z]{2}-\d{4}$/;

    for (const id of allIds) {
      if (!validFormat.test(id)) {
        report.invalidFormatIds.push(id);
      } else {
        // Extract domain from valid IDs
        const domain = id.split("-")[1];
        report.domainCounts[domain] = (report.domainCounts[domain] || 0) + 1;
      }
    }

    report.formatCompliance =
      ((allIds.length - report.invalidFormatIds.length) / allIds.length) * 100;

    // Validation passes if no duplicates and format compliance > 95%
    report.passed = report.duplicateIds.length === 0 && report.formatCompliance >= 95;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error validating question IDs:", message);
    report.passed = false;
  }

  return report;
}

function generateIdValidationReport(report: ValidationReport): void {
  console.log("\n🔍 TCO Question ID Validation Report");
  console.log("=".repeat(50));

  if (report.passed) {
    console.log("✅ ID Validation PASSED");
  } else {
    console.log("❌ ID Validation FAILED");
  }

  console.log(`📊 Total Questions: ${report.totalQuestions}`);
  console.log(`🆔 Unique IDs: ${report.uniqueIds}`);
  console.log(`📏 Format Compliance: ${report.formatCompliance.toFixed(1)}%`);

  if (Object.keys(report.domainCounts).length > 0) {
    console.log("\n📈 Questions by Domain Code:");
    Object.entries(report.domainCounts).forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count} questions`);
    });
  }

  if (report.duplicateIds.length > 0) {
    console.log("\n❌ Duplicate IDs found:");
    report.duplicateIds.forEach((id) => console.log(`  • ${id}`));
  }

  if (report.invalidFormatIds.length > 0) {
    console.log("\n⚠️ Invalid Format IDs:");
    report.invalidFormatIds.slice(0, 10).forEach((id) => console.log(`  • ${id}`));
    if (report.invalidFormatIds.length > 10) {
      console.log(`  ... and ${report.invalidFormatIds.length - 10} more`);
    }
  }

  console.log("\n" + "=".repeat(50));
}

// Run validation if this file is executed directly
if (require.main === module) {
  const report = validateQuestionIds();
  generateIdValidationReport(report);

  if (!report.passed) {
    process.exit(1);
  }
}

export { validateQuestionIds, generateIdValidationReport };
