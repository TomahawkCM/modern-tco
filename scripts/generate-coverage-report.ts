#!/usr/bin/env tsx
/**
 * Translation Coverage Reporting Dashboard
 *
 * Tracks and reports on translation system health:
 * 1. Component translation coverage (% using useTranslations)
 * 2. Missing keys per locale
 * 3. Validation errors/warnings
 * 4. Quality scores (using translation-quality.ts)
 * 5. RTL testing status
 *
 * Output: JSON report + HTML dashboard
 *
 * Usage:
 *   npm run coverage:report
 *   npm run coverage:report -- --verbose
 *   npm run coverage:report -- --output reports/
 */

import * as fs from 'fs';
import * as path from 'path';
import { SUPPORTED_LOCALES, LOCALE_METADATA, type SupportedLocale } from '../src/i18n/config';
import { validate } from './lib/translation-validator';
import { validateQuality, formatQualityReport } from './lib/translation-quality';

// Paths
const BUDGET_COMPONENTS_DIR = path.join(__dirname, '../src/components/budget');
const MESSAGES_DIR = path.join(__dirname, '../src/i18n/messages');
const SOURCE_FILE = path.join(MESSAGES_DIR, 'en-US.json');
const DEFAULT_OUTPUT_DIR = path.join(__dirname, '../reports');

// CLI Options
interface CLIOptions {
  verbose: boolean;
  output: string;
  format: 'json' | 'html' | 'both';
}

// Report interfaces
interface ComponentScanResult {
  total: number;
  usingTranslations: number;
  notUsingTranslations: number;
  coverage: number;
  components: {
    path: string;
    usesTranslations: boolean;
  }[];
}

interface LocaleValidationResult {
  locale: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingKeys: string[];
  qualityScore: number;
}

interface RTLStatus {
  locale: string;
  isRTL: boolean;
  tested: boolean;
  issues: string[];
}

interface CoverageReport {
  generatedAt: string;
  summary: {
    totalLocales: number;
    componentCoverage: number;
    averageQualityScore: number;
    totalIssues: number;
    totalWarnings: number;
    rtlLocalesCount: number;
  };
  components: ComponentScanResult;
  locales: LocaleValidationResult[];
  rtlStatus: RTLStatus[];
}

/**
 * Main entry point
 */
async function main() {
  console.log('📊 Translation Coverage Report Generator\\n');

  // Parse CLI arguments
  const options = parseArgs(process.argv.slice(2));

  // Ensure output directory exists
  if (!fs.existsSync(options.output)) {
    fs.mkdirSync(options.output, { recursive: true });
  }

  console.log('🔍 Scanning components...');
  const componentScan = scanComponents(BUDGET_COMPONENTS_DIR);
  console.log(`   Found: ${componentScan.total} components`);
  console.log(`   Using translations: ${componentScan.usingTranslations}`);
  console.log(`   Coverage: ${componentScan.coverage.toFixed(1)}%\\n`);

  console.log('🌍 Validating translations...');
  const sourceContent = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));
  const localeValidations: LocaleValidationResult[] = [];

  let completed = 0;
  const localesToValidate = SUPPORTED_LOCALES.filter(l => l !== 'en');

  for (const locale of localesToValidate) {
    process.stdout.write(`   ⏳ ${locale}... (${++completed}/${localesToValidate.length})\\r`);

    const result = validateLocale(locale, sourceContent, options);
    localeValidations.push(result);
  }

  console.log(`\\n   ✅ Validated ${localeValidations.length} locales\\n`);

  console.log('🔄 Checking RTL support...');
  const rtlStatus = checkRTLStatus();
  console.log(`   RTL locales: ${rtlStatus.length}\\n`);

  // Generate report
  const report = generateReport(componentScan, localeValidations, rtlStatus);

  // Output report
  if (options.format === 'json' || options.format === 'both') {
    const jsonPath = path.join(options.output, 'coverage-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`✅ JSON report: ${jsonPath}`);
  }

  if (options.format === 'html' || options.format === 'both') {
    const htmlPath = path.join(options.output, 'coverage-report.html');
    const html = generateHTML(report);
    fs.writeFileSync(htmlPath, html, 'utf-8');
    console.log(`✅ HTML dashboard: ${htmlPath}`);
  }

  // Print summary
  printSummary(report, options.verbose);
}

/**
 * Parse command-line arguments
 */
function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    verbose: false,
    output: DEFAULT_OUTPUT_DIR,
    format: 'both',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--output':
      case '-o':
        if (i + 1 < args.length) {
          options.output = args[++i];
        }
        break;
      case '--format':
      case '-f':
        if (i + 1 < args.length) {
          const format = args[++i];
          if (format === 'json' || format === 'html' || format === 'both') {
            options.format = format;
          }
        }
        break;
    }
  }

  return options;
}

/**
 * Scan budget components for translation usage
 */
function scanComponents(dir: string): ComponentScanResult {
  const components: { path: string; usesTranslations: boolean }[] = [];

  function scanDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        // Skip test files and types
        if (entry.name.endsWith('.test.tsx') || entry.name.endsWith('.d.ts')) {
          continue;
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        const usesTranslations = content.includes('useTranslations(');

        components.push({
          path: path.relative(path.join(__dirname, '..'), fullPath),
          usesTranslations,
        });
      }
    }
  }

  scanDir(dir);

  const usingTranslations = components.filter(c => c.usesTranslations).length;
  const total = components.length;
  const coverage = total > 0 ? (usingTranslations / total) * 100 : 0;

  return {
    total,
    usingTranslations,
    notUsingTranslations: total - usingTranslations,
    coverage,
    components,
  };
}

/**
 * Validate a single locale
 */
function validateLocale(
  locale: SupportedLocale,
  sourceContent: object,
  options: CLIOptions
): LocaleValidationResult {
  const localeFile = path.join(MESSAGES_DIR, `${locale}.json`);

  if (!fs.existsSync(localeFile)) {
    return {
      locale,
      valid: false,
      errors: ['Translation file does not exist'],
      warnings: [],
      missingKeys: [],
      qualityScore: 0,
    };
  }

  try {
    const translationContent = JSON.parse(fs.readFileSync(localeFile, 'utf-8'));

    // Run structure validation
    const validation = validate(translationContent, sourceContent, locale);

    // Run quality validation
    const glossaryPath = path.join(__dirname, `../src/i18n/glossaries/${locale}.json`);
    const qualityReport = validateQuality(sourceContent, translationContent, locale, {
      glossaryPath: fs.existsSync(glossaryPath) ? glossaryPath : undefined,
    });

    // Extract missing keys (keys in source but not in translation)
    const missingKeys = extractMissingKeys(sourceContent, translationContent);

    return {
      locale,
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      missingKeys,
      qualityScore: qualityReport.overallScore,
    };
  } catch (error: any) {
    return {
      locale,
      valid: false,
      errors: [`Failed to parse translation file: ${error.message}`],
      warnings: [],
      missingKeys: [],
      qualityScore: 0,
    };
  }
}

/**
 * Extract missing keys between source and translation
 */
function extractMissingKeys(source: any, translation: any, prefix: string = ''): string[] {
  const missing: string[] = [];

  for (const [key, value] of Object.entries(source)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (!(key in translation)) {
      missing.push(fullKey);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      missing.push(...extractMissingKeys(value, translation[key] || {}, fullKey));
    }
  }

  return missing;
}

/**
 * Check RTL locale support status
 */
function checkRTLStatus(): RTLStatus[] {
  const rtlLocales = SUPPORTED_LOCALES.filter(
    locale => LOCALE_METADATA[locale]?.dir === 'rtl'
  );

  return rtlLocales.map(locale => {
    // Check if locale file exists and has content
    const localeFile = path.join(MESSAGES_DIR, `${locale}.json`);
    const exists = fs.existsSync(localeFile);

    const issues: string[] = [];

    if (!exists) {
      issues.push('Translation file missing');
    }

    // TODO: Add actual RTL testing checks (e.g., visual regression tests)
    const tested = false; // Placeholder

    return {
      locale,
      isRTL: true,
      tested,
      issues,
    };
  });
}

/**
 * Generate coverage report
 */
function generateReport(
  componentScan: ComponentScanResult,
  localeValidations: LocaleValidationResult[],
  rtlStatus: RTLStatus[]
): CoverageReport {
  const validLocales = localeValidations.filter(l => l.valid);
  const averageQualityScore =
    validLocales.length > 0
      ? validLocales.reduce((sum, l) => sum + l.qualityScore, 0) / validLocales.length
      : 0;

  const totalIssues = localeValidations.reduce((sum, l) => sum + l.errors.length, 0);
  const totalWarnings = localeValidations.reduce((sum, l) => sum + l.warnings.length, 0);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalLocales: SUPPORTED_LOCALES.length,
      componentCoverage: componentScan.coverage,
      averageQualityScore: Math.round(averageQualityScore),
      totalIssues,
      totalWarnings,
      rtlLocalesCount: rtlStatus.length,
    },
    components: componentScan,
    locales: localeValidations,
    rtlStatus,
  };
}

/**
 * Generate HTML dashboard
 */
function generateHTML(report: CoverageReport): string {
  const { summary, components, locales, rtlStatus } = report;

  // Sort locales by quality score (descending)
  const sortedLocales = [...locales].sort((a, b) => b.qualityScore - a.qualityScore);

  // Top 10 and bottom 10 locales
  const top10 = sortedLocales.slice(0, 10);
  const bottom10 = sortedLocales.slice(-10).reverse();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Translation Coverage Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 2rem;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; margin-bottom: 1rem; }
    .timestamp { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card h3 { color: #666; font-size: 0.875rem; margin-bottom: 0.5rem; }
    .card .value { font-size: 2rem; font-weight: bold; color: #333; }
    .card .unit { font-size: 1rem; color: #999; margin-left: 0.5rem; }
    .section { margin-bottom: 2rem; }
    .section h2 { color: #333; margin-bottom: 1rem; }
    table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    th, td { padding: 0.75rem; text-align: left; }
    th { background: #f8f8f8; font-weight: 600; color: #666; }
    tr:nth-child(even) { background: #fafafa; }
    .score { font-weight: bold; }
    .score.high { color: #22c55e; }
    .score.medium { color: #eab308; }
    .score.low { color: #ef4444; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge.success { background: #dcfce7; color: #166534; }
    .badge.warning { background: #fef3c7; color: #92400e; }
    .badge.error { background: #fee2e2; color: #991b1b; }
    .progress-bar {
      background: #e5e7eb;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    .progress-fill {
      background: #3b82f6;
      height: 100%;
      transition: width 0.3s;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌍 Translation Coverage Report</h1>
    <div class="timestamp">Generated: ${new Date(report.generatedAt).toLocaleString()}</div>

    <div class="summary">
      <div class="card">
        <h3>Component Coverage</h3>
        <div class="value">${summary.componentCoverage.toFixed(1)}<span class="unit">%</span></div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${summary.componentCoverage}%"></div>
        </div>
      </div>
      <div class="card">
        <h3>Average Quality Score</h3>
        <div class="value">${summary.averageQualityScore}<span class="unit">/100</span></div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${summary.averageQualityScore}%; background: #22c55e"></div>
        </div>
      </div>
      <div class="card">
        <h3>Total Locales</h3>
        <div class="value">${summary.totalLocales}</div>
      </div>
      <div class="card">
        <h3>RTL Locales</h3>
        <div class="value">${summary.rtlLocalesCount}</div>
      </div>
      <div class="card">
        <h3>Total Issues</h3>
        <div class="value">${summary.totalIssues}</div>
      </div>
      <div class="card">
        <h3>Total Warnings</h3>
        <div class="value">${summary.totalWarnings}</div>
      </div>
    </div>

    <div class="section">
      <h2>📈 Top 10 Locales (by Quality Score)</h2>
      <table>
        <thead>
          <tr>
            <th>Locale</th>
            <th>Quality Score</th>
            <th>Status</th>
            <th>Issues</th>
            <th>Warnings</th>
          </tr>
        </thead>
        <tbody>
          ${top10
            .map(
              locale => `
            <tr>
              <td>${locale.locale}</td>
              <td><span class="score ${getScoreClass(locale.qualityScore)}">${locale.qualityScore}/100</span></td>
              <td><span class="badge ${locale.valid ? 'success' : 'error'}">${locale.valid ? 'Valid' : 'Invalid'}</span></td>
              <td>${locale.errors.length}</td>
              <td>${locale.warnings.length}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>📉 Bottom 10 Locales (Need Attention)</h2>
      <table>
        <thead>
          <tr>
            <th>Locale</th>
            <th>Quality Score</th>
            <th>Status</th>
            <th>Issues</th>
            <th>Warnings</th>
          </tr>
        </thead>
        <tbody>
          ${bottom10
            .map(
              locale => `
            <tr>
              <td>${locale.locale}</td>
              <td><span class="score ${getScoreClass(locale.qualityScore)}">${locale.qualityScore}/100</span></td>
              <td><span class="badge ${locale.valid ? 'success' : 'error'}">${locale.valid ? 'Valid' : 'Invalid'}</span></td>
              <td>${locale.errors.length}</td>
              <td>${locale.warnings.length}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>🔄 RTL Locale Status</h2>
      <table>
        <thead>
          <tr>
            <th>Locale</th>
            <th>Tested</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          ${rtlStatus
            .map(
              rtl => `
            <tr>
              <td>${rtl.locale}</td>
              <td><span class="badge ${rtl.tested ? 'success' : 'warning'}">${rtl.tested ? 'Tested' : 'Not Tested'}</span></td>
              <td>${rtl.issues.length > 0 ? rtl.issues.join(', ') : '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>📦 Component Analysis</h2>
      <div class="card">
        <p><strong>Total Components:</strong> ${components.total}</p>
        <p><strong>Using Translations:</strong> ${components.usingTranslations}</p>
        <p><strong>Not Using Translations:</strong> ${components.notUsingTranslations}</p>
        <p><strong>Coverage:</strong> ${components.coverage.toFixed(1)}%</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  function getScoreClass(score: number): string {
    if (score >= 90) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
  }
}

/**
 * Print summary to console
 */
function printSummary(report: CoverageReport, verbose: boolean) {
  console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Coverage Report Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');

  console.log('Overall Metrics:');
  console.log(`   Component Coverage: ${report.summary.componentCoverage.toFixed(1)}%`);
  console.log(`   Average Quality Score: ${report.summary.averageQualityScore}/100`);
  console.log(`   Total Locales: ${report.summary.totalLocales}`);
  console.log(`   Total Issues: ${report.summary.totalIssues}`);
  console.log(`   Total Warnings: ${report.summary.totalWarnings}`);
  console.log(`   RTL Locales: ${report.summary.rtlLocalesCount}\\n`);

  // Components not using translations
  if (verbose) {
    const notUsing = report.components.components.filter(c => !c.usesTranslations);
    if (notUsing.length > 0) {
      console.log('Components not using translations:');
      notUsing.slice(0, 10).forEach(c => console.log(`   - ${c.path}`));
      if (notUsing.length > 10) {
        console.log(`   ... and ${notUsing.length - 10} more`);
      }
      console.log();
    }
  }

  // Locales with issues
  const localesWithIssues = report.locales.filter(l => l.errors.length > 0);
  if (localesWithIssues.length > 0) {
    console.log(`⚠️  ${localesWithIssues.length} locales have issues:`);
    localesWithIssues.slice(0, 5).forEach(l => {
      console.log(`   - ${l.locale}: ${l.errors.length} errors`);
      if (verbose) {
        l.errors.slice(0, 3).forEach(e => console.log(`      • ${e}`));
      }
    });
    if (localesWithIssues.length > 5) {
      console.log(`   ... and ${localesWithIssues.length - 5} more`);
    }
    console.log();
  }

  console.log('✅ Report generation complete!\\n');
}

// Run main function
main().catch(error => {
  console.error('\\n❌ Fatal error:', error);
  process.exit(1);
});
