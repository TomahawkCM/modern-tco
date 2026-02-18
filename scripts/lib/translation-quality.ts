/**
 * Translation Quality Validation System
 *
 * Performs 7 quality checks on translations:
 * 1. Variable placeholders - Ensure {variable} match source
 * 2. Punctuation - Check ending punctuation consistency
 * 3. Capitalization - Validate title case for UI elements
 * 4. HTML tags - Preserve <strong>, <em>, etc.
 * 5. Number/Date format - Detect hardcoded formats
 * 6. Terminology - Check against glossary
 * 7. Cultural appropriateness - Flag region-specific references
 *
 * Returns quality score 0-100 per locale
 */

import * as fs from "fs";
import * as path from "path";
import type { SupportedLocale } from "../../src/i18n/config";

export interface QualityCheck {
  name: string;
  passed: boolean;
  score: number;
  issues: string[];
  warnings: string[];
}

export interface QualityReport {
  locale: string;
  overallScore: number;
  checks: QualityCheck[];
  summary: {
    totalIssues: number;
    totalWarnings: number;
    criticalIssues: number;
  };
}

interface FlatTranslations {
  [key: string]: string | number | boolean;
}

/**
 * Flatten nested translation object to dot notation
 */
function flattenTranslations(obj: any, prefix: string = ""): FlatTranslations {
  const result: FlatTranslations = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenTranslations(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }

  return result;
}

/**
 * 1. Variable Placeholders Check
 * Ensure {variable} and {count, plural, ...} match between source and translation
 */
function checkVariablePlaceholders(
  sourceFlat: FlatTranslations,
  translationFlat: FlatTranslations
): QualityCheck {
  const issues: string[] = [];
  const warnings: string[] = [];
  let passedCount = 0;
  let totalChecked = 0;

  // Regex for {variable} and {count, plural, ...}
  const variableRegex = /\{[^}]+\}/g;

  for (const [key, sourceValue] of Object.entries(sourceFlat)) {
    if (typeof sourceValue !== "string") continue;
    if (!(key in translationFlat)) continue;

    const translationValue = translationFlat[key];
    if (typeof translationValue !== "string") continue;

    const sourceVars = sourceValue.match(variableRegex) || [];
    const translationVars = translationValue.match(variableRegex) || [];

    totalChecked++;

    // Check if all source variables exist in translation
    const missingVars = sourceVars.filter((v) => !translationVars.includes(v));
    const extraVars = translationVars.filter((v) => !sourceVars.includes(v));

    if (missingVars.length > 0) {
      issues.push(`${key}: Missing variables: ${missingVars.join(", ")}`);
    } else if (extraVars.length > 0) {
      warnings.push(`${key}: Extra variables: ${extraVars.join(", ")}`);
      passedCount++; // Warning, not critical
    } else {
      passedCount++;
    }
  }

  const score = totalChecked > 0 ? Math.round((passedCount / totalChecked) * 100) : 100;

  return {
    name: "Variable Placeholders",
    passed: issues.length === 0,
    score,
    issues,
    warnings,
  };
}

/**
 * 2. Punctuation Check
 * Ensure ending punctuation matches source intent
 */
function checkPunctuation(
  sourceFlat: FlatTranslations,
  translationFlat: FlatTranslations
): QualityCheck {
  const issues: string[] = [];
  const warnings: string[] = [];
  let passedCount = 0;
  let totalChecked = 0;

  for (const [key, sourceValue] of Object.entries(sourceFlat)) {
    if (typeof sourceValue !== "string") continue;
    if (!(key in translationFlat)) continue;

    const translationValue = translationFlat[key];
    if (typeof translationValue !== "string") continue;

    // Skip very short strings
    if (sourceValue.length < 3) continue;

    totalChecked++;

    const sourcePunc = sourceValue.slice(-1);
    const translationPunc = translationValue.slice(-1);

    // Check if source ends with punctuation
    const punctuationMarks = [".", "!", "?", ":", ";", ","];
    const sourceHasPunc = punctuationMarks.includes(sourcePunc);
    const translationHasPunc = punctuationMarks.includes(translationPunc);

    if (sourceHasPunc && !translationHasPunc) {
      warnings.push(`${key}: Missing ending punctuation '${sourcePunc}'`);
      // Warning only, some languages have different conventions
    } else if (!sourceHasPunc && translationHasPunc) {
      warnings.push(`${key}: Unexpected punctuation '${translationPunc}'`);
    }

    passedCount++; // Punctuation is language-specific, so don't fail
  }

  const score = totalChecked > 0 ? Math.round((passedCount / totalChecked) * 100) : 100;

  return {
    name: "Punctuation",
    passed: true, // Warnings only
    score,
    issues,
    warnings,
  };
}

/**
 * 3. Capitalization Check
 * Validate title case for buttons, labels, headings
 */
function checkCapitalization(
  sourceFlat: FlatTranslations,
  translationFlat: FlatTranslations
): QualityCheck {
  const issues: string[] = [];
  const warnings: string[] = [];
  let passedCount = 0;
  let totalChecked = 0;

  // Keys that should have title case (buttons, actions, navigation)
  const titleCaseKeys = /\b(actions?|nav|buttons?|labels?|headings?|tabs?)\b/i;

  for (const [key, sourceValue] of Object.entries(sourceFlat)) {
    if (typeof sourceValue !== "string") continue;
    if (!titleCaseKeys.test(key)) continue;
    if (!(key in translationFlat)) continue;

    const translationValue = translationFlat[key];
    if (typeof translationValue !== "string") continue;

    totalChecked++;

    // Check if source is title case
    const sourceIsTitle = /^[A-Z]/.test(sourceValue.trim());

    // If source is title case, translation should preserve intent
    // (though exact capitalization rules vary by language)
    if (sourceIsTitle) {
      const translationIsTitle = /^[A-Z\u00C0-\u017F]/.test(translationValue.trim());

      if (!translationIsTitle) {
        warnings.push(`${key}: Should start with capital letter (source is title case)`);
      }
    }

    passedCount++; // Language-specific, warnings only
  }

  const score = totalChecked > 0 ? Math.round((passedCount / totalChecked) * 100) : 100;

  return {
    name: "Capitalization",
    passed: true, // Warnings only
    score,
    issues,
    warnings,
  };
}

/**
 * 4. HTML Tags Check
 * Ensure HTML tags like <strong>, <em> are preserved
 */
function checkHTMLTags(
  sourceFlat: FlatTranslations,
  translationFlat: FlatTranslations
): QualityCheck {
  const issues: string[] = [];
  const warnings: string[] = [];
  let passedCount = 0;
  let totalChecked = 0;

  const htmlTagRegex = /<\/?[a-z][^>]*>/gi;

  for (const [key, sourceValue] of Object.entries(sourceFlat)) {
    if (typeof sourceValue !== "string") continue;
    if (!(key in translationFlat)) continue;

    const translationValue = translationFlat[key];
    if (typeof translationValue !== "string") continue;

    const sourceTags = (sourceValue.match(htmlTagRegex) || []).sort();
    const translationTags = (translationValue.match(htmlTagRegex) || []).sort();

    if (sourceTags.length === 0) continue;

    totalChecked++;

    // Check if tags match exactly
    if (JSON.stringify(sourceTags) !== JSON.stringify(translationTags)) {
      issues.push(
        `${key}: HTML tags mismatch. Source: [${sourceTags.join(", ")}], Translation: [${translationTags.join(", ")}]`
      );
    } else {
      passedCount++;
    }
  }

  const score = totalChecked > 0 ? Math.round((passedCount / totalChecked) * 100) : 100;

  return {
    name: "HTML Tags",
    passed: issues.length === 0,
    score,
    issues,
    warnings,
  };
}

/**
 * 5. Number/Date Format Check
 * Detect hardcoded USD, US date formats that should be localized
 */
function checkNumberDateFormat(translationFlat: FlatTranslations, locale: string): QualityCheck {
  const issues: string[] = [];
  const warnings: string[] = [];
  let passedCount = 0;
  let totalChecked = 0;

  // Patterns that indicate hardcoded formats
  const hardcodedPatterns = [
    { pattern: /\$\d+/, name: "USD dollar sign" },
    { pattern: /\d{1,2}\/\d{1,2}\/\d{2,4}/, name: "MM/DD/YYYY date format" },
    { pattern: /USD/, name: "USD currency code" },
  ];

  for (const [key, value] of Object.entries(translationFlat)) {
    if (typeof value !== "string") continue;

    for (const { pattern, name } of hardcodedPatterns) {
      if (pattern.test(value)) {
        totalChecked++;
        warnings.push(`${key}: Contains hardcoded ${name} - should use locale-aware formatting`);
      }
    }
  }

  // All checked items pass (warnings only)
  passedCount = totalChecked;
  const score = 100; // Format warnings don't affect score heavily

  return {
    name: "Number/Date Format",
    passed: true,
    score,
    issues,
    warnings,
  };
}

/**
 * 6. Terminology Check
 * Validate against glossary if available
 */
function checkTerminology(
  translationFlat: FlatTranslations,
  locale: string,
  glossaryPath?: string
): QualityCheck {
  const issues: string[] = [];
  const warnings: string[] = [];
  let passedCount = 0;
  let totalChecked = 0;

  // Load glossary if available
  let glossary: Record<string, string[]> = {};

  // Auto-detect glossary path if not provided
  if (!glossaryPath) {
    const autoGlossaryPath = path.resolve(__dirname, `../../src/i18n/glossaries/${locale}.json`);
    if (fs.existsSync(autoGlossaryPath)) {
      glossaryPath = autoGlossaryPath;
    }
  }

  if (glossaryPath && fs.existsSync(glossaryPath)) {
    try {
      glossary = JSON.parse(fs.readFileSync(glossaryPath, "utf-8"));
    } catch (error) {
      warnings.push(`Failed to load glossary: ${glossaryPath}`);
    }
  }

  if (Object.keys(glossary).length === 0) {
    // No glossary available, skip check
    return {
      name: "Terminology",
      passed: true,
      score: 100,
      issues,
      warnings: ["No glossary available for validation"],
    };
  }

  // Check if terminology matches glossary
  for (const [key, value] of Object.entries(translationFlat)) {
    if (typeof value !== "string") continue;

    const lowerValue = value.toLowerCase();

    for (const [term, acceptedTranslations] of Object.entries(glossary)) {
      if (key.toLowerCase().includes(term.toLowerCase())) {
        totalChecked++;

        const hasAcceptedTranslation = acceptedTranslations.some((translation) =>
          lowerValue.includes(translation.toLowerCase())
        );

        if (hasAcceptedTranslation) {
          passedCount++;
        } else {
          warnings.push(
            `${key}: Term '${term}' should use one of: ${acceptedTranslations.join(", ")}`
          );
        }
      }
    }
  }

  const score = totalChecked > 0 ? Math.round((passedCount / totalChecked) * 100) : 100;

  return {
    name: "Terminology",
    passed: true, // Warnings only
    score,
    issues,
    warnings,
  };
}

/**
 * 7. Cultural Appropriateness Check
 * Flag US-specific references that may not translate well
 */
function checkCulturalAppropriateness(translationFlat: FlatTranslations): QualityCheck {
  const issues: string[] = [];
  const warnings: string[] = [];
  let passedCount = 0;
  let totalChecked = 0;

  // US-specific references to flag
  const usSpecificPatterns = [
    { pattern: /\bSSN\b/i, name: "Social Security Number (US-specific)" },
    { pattern: /\b401[kK]\b/, name: "401k retirement plan (US-specific)" },
    { pattern: /\bIRS\b/, name: "IRS (US tax authority)" },
    { pattern: /\bzipcode\b/i, name: "Zipcode (US-specific, use postal code)" },
    { pattern: /\bThanksgiving\b/i, name: "Thanksgiving (US holiday)" },
    { pattern: /\bSuper Bowl\b/i, name: "Super Bowl (US-specific)" },
  ];

  for (const [key, value] of Object.entries(translationFlat)) {
    if (typeof value !== "string") continue;

    for (const { pattern, name } of usSpecificPatterns) {
      if (pattern.test(value)) {
        totalChecked++;
        warnings.push(`${key}: Contains ${name} - may need cultural adaptation`);
      }
    }
  }

  passedCount = totalChecked; // Warnings only
  const score = 100;

  return {
    name: "Cultural Appropriateness",
    passed: true,
    score,
    issues,
    warnings,
  };
}

/**
 * Validate translation quality
 */
export function validateQuality(
  sourceContent: object,
  translationContent: object,
  locale: SupportedLocale,
  options?: {
    glossaryPath?: string;
  }
): QualityReport {
  const sourceFlat = flattenTranslations(sourceContent);
  const translationFlat = flattenTranslations(translationContent);

  // Run all 7 checks
  const checks: QualityCheck[] = [
    checkVariablePlaceholders(sourceFlat, translationFlat),
    checkPunctuation(sourceFlat, translationFlat),
    checkCapitalization(sourceFlat, translationFlat),
    checkHTMLTags(sourceFlat, translationFlat),
    checkNumberDateFormat(translationFlat, locale),
    checkTerminology(translationFlat, locale, options?.glossaryPath),
    checkCulturalAppropriateness(translationFlat),
  ];

  // Calculate overall score (weighted average)
  const weights = {
    "Variable Placeholders": 0.25, // Critical
    "HTML Tags": 0.2, // Critical
    Punctuation: 0.1,
    Capitalization: 0.1,
    "Number/Date Format": 0.15,
    Terminology: 0.15,
    "Cultural Appropriateness": 0.05,
  };

  let weightedScore = 0;
  for (const check of checks) {
    const weight = weights[check.name as keyof typeof weights] || 0;
    weightedScore += check.score * weight;
  }

  const overallScore = Math.round(weightedScore);

  // Count issues
  const totalIssues = checks.reduce((sum, check) => sum + check.issues.length, 0);
  const totalWarnings = checks.reduce((sum, check) => sum + check.warnings.length, 0);
  const criticalIssues = checks
    .filter((c) => ["Variable Placeholders", "HTML Tags"].includes(c.name))
    .reduce((sum, check) => sum + check.issues.length, 0);

  return {
    locale,
    overallScore,
    checks,
    summary: {
      totalIssues,
      totalWarnings,
      criticalIssues,
    },
  };
}

/**
 * Format quality report for console output
 */
export function formatQualityReport(report: QualityReport, verbose: boolean = false): string {
  const lines: string[] = [];

  lines.push(`\n${"=".repeat(60)}`);
  lines.push(`Quality Report: ${report.locale}`);
  lines.push(`Overall Score: ${report.overallScore}/100`);
  lines.push(`${"=".repeat(60)}\n`);

  for (const check of report.checks) {
    const icon = check.passed ? "✅" : "❌";
    lines.push(`${icon} ${check.name}: ${check.score}/100`);

    if (verbose || check.issues.length > 0) {
      for (const issue of check.issues) {
        lines.push(`   ❌ ${issue}`);
      }
    }

    if (verbose && check.warnings.length > 0) {
      for (const warning of check.warnings.slice(0, 5)) {
        lines.push(`   ⚠️  ${warning}`);
      }
      if (check.warnings.length > 5) {
        lines.push(`   ... and ${check.warnings.length - 5} more warnings`);
      }
    }
  }

  lines.push(`\n📊 Summary:`);
  lines.push(`   Total Issues: ${report.summary.totalIssues}`);
  lines.push(`   Total Warnings: ${report.summary.totalWarnings}`);
  lines.push(`   Critical Issues: ${report.summary.criticalIssues}`);

  return lines.join("\n");
}
