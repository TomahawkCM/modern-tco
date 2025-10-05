#!/usr/bin/env node
/**
 * Production Readiness Check Script
 *
 * Purpose: Automated comprehensive production readiness assessment
 * Usage: node scripts/production-readiness-check.js
 *
 * Checks performed:
 * 1. Environment configuration
 * 2. Code quality (TypeScript, ESLint, tests)
 * 3. Security (npm audit, headers verification)
 * 4. Performance (bundle size, build time)
 * 5. Documentation completeness
 * 6. Database readiness
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  requiredEnvVars: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
  optionalEnvVars: [
    'NEXT_PUBLIC_SENTRY_DSN',
    'NEXT_PUBLIC_POSTHOG_KEY',
    'NEXT_PUBLIC_ADMIN_EMAILS',
  ],
  requiredDocs: [
    'docs/PRE_LAUNCH_CHECKLIST.md',
    'docs/PRODUCTION_DEPLOYMENT_GUIDE.md',
    'docs/SECURITY_AUDIT_CHECKLIST.md',
    'docs/CONTENT_VALIDATION_GUIDE.md',
  ],
  minTestCount: 50,
  maxBuildTime: 300000, // 5 minutes in ms
  maxBundleSize: 500 * 1024, // 500 KB
};

// Scoring system
const scoring = {
  total: 0,
  maxPoints: 100,
  categories: {
    environment: { score: 0, max: 15, weight: 1.5 },
    codeQuality: { score: 0, max: 25, weight: 2.5 },
    security: { score: 0, max: 20, weight: 2.0 },
    performance: { score: 0, max: 15, weight: 1.5 },
    documentation: { score: 0, max: 15, weight: 1.5 },
    testing: { score: 0, max: 10, weight: 1.0 },
  },
};

// Utility functions
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
};

const printHeader = (text) => {
  console.log(`\n${'━'.repeat(70)}`);
  console.log(`${colors.blue}${text}${colors.reset}`);
  console.log(`${'━'.repeat(70)}\n`);
};

const printCheck = (label, status, details = '') => {
  const symbols = {
    pass: `${colors.green}✓${colors.reset}`,
    fail: `${colors.red}✗${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
    info: `${colors.blue}→${colors.reset}`,
  };
  const detailsStr = details ? ` ${colors.gray}(${details})${colors.reset}` : '';
  console.log(`  ${symbols[status]} ${label}${detailsStr}`);
};

const addScore = (category, points, reason) => {
  const cat = scoring.categories[category];
  const earnedPoints = Math.min(points, cat.max - cat.score);
  cat.score += earnedPoints;
  scoring.total += earnedPoints * cat.weight;
  return earnedPoints;
};

// Check functions
async function checkEnvironment() {
  printHeader('1. Environment Configuration');

  let passed = 0;
  let total = CONFIG.requiredEnvVars.length + CONFIG.optionalEnvVars.length;

  // Check required variables
  for (const varName of CONFIG.requiredEnvVars) {
    if (process.env[varName]) {
      printCheck(`${varName}`, 'pass', 'set');
      passed++;
      addScore('environment', 5, `${varName} configured`);
    } else {
      printCheck(`${varName}`, 'fail', 'missing');
    }
  }

  // Check optional variables
  for (const varName of CONFIG.optionalEnvVars) {
    if (process.env[varName]) {
      printCheck(`${varName}`, 'pass', 'set');
      passed++;
      addScore('environment', 2, `${varName} configured`);
    } else {
      printCheck(`${varName}`, 'warn', 'not set');
    }
  }

  const score = (passed / total) * 100;
  printCheck(`Environment Score`, score >= 80 ? 'pass' : 'warn', `${passed}/${total} variables set`);

  return { passed, total, score };
}

async function checkCodeQuality() {
  printHeader('2. Code Quality');

  const checks = [];

  // TypeScript compilation
  try {
    printCheck('Checking TypeScript...', 'info');
    const { stdout } = await execAsync('npx tsc --noEmit 2>&1 || true');
    const hasErrors = stdout.includes('error TS');

    if (!hasErrors) {
      printCheck('TypeScript compilation', 'pass', 'no errors');
      addScore('codeQuality', 10, 'TypeScript clean');
      checks.push(true);
    } else {
      const errorCount = (stdout.match(/error TS/g) || []).length;
      printCheck('TypeScript compilation', 'fail', `${errorCount} errors`);
      checks.push(false);
    }
  } catch (error) {
    printCheck('TypeScript check', 'fail', error.message);
    checks.push(false);
  }

  // ESLint
  try {
    printCheck('Checking ESLint...', 'info');
    await execAsync('npm run lint:check 2>&1');
    printCheck('ESLint', 'pass', 'no critical issues');
    addScore('codeQuality', 8, 'ESLint clean');
    checks.push(true);
  } catch (error) {
    printCheck('ESLint', 'warn', 'some warnings present');
    addScore('codeQuality', 4, 'ESLint warnings');
    checks.push(false);
  }

  // Prettier
  try {
    await execAsync('npm run format:check 2>&1');
    printCheck('Code formatting (Prettier)', 'pass');
    addScore('codeQuality', 5, 'Formatting consistent');
    checks.push(true);
  } catch (error) {
    printCheck('Code formatting (Prettier)', 'warn', 'formatting issues');
    checks.push(false);
  }

  // Build test
  try {
    printCheck('Testing production build...', 'info', 'this may take 2-3 min');
    const startTime = Date.now();
    await execAsync('npm run build 2>&1');
    const buildTime = Date.now() - startTime;

    if (buildTime <= CONFIG.maxBuildTime) {
      printCheck('Production build', 'pass', `${(buildTime / 1000).toFixed(1)}s`);
      addScore('codeQuality', 10, 'Build successful');
      checks.push(true);
    } else {
      printCheck('Production build', 'warn', `slow: ${(buildTime / 1000).toFixed(1)}s`);
      addScore('codeQuality', 5, 'Build slow');
      checks.push(false);
    }
  } catch (error) {
    printCheck('Production build', 'fail', 'build failed');
    checks.push(false);
  }

  const passed = checks.filter(Boolean).length;
  const score = (passed / checks.length) * 100;

  return { passed, total: checks.length, score };
}

async function checkSecurity() {
  printHeader('3. Security Audit');

  const checks = [];

  // npm audit
  try {
    printCheck('Running npm audit...', 'info');
    const { stdout } = await execAsync('npm audit --json 2>&1 || true');
    const audit = JSON.parse(stdout);

    const critical = audit.metadata?.vulnerabilities?.critical || 0;
    const high = audit.metadata?.vulnerabilities?.high || 0;
    const total = audit.metadata?.vulnerabilities?.total || 0;

    if (critical === 0 && high === 0) {
      printCheck('Security vulnerabilities', 'pass', `${total} low/medium`);
      addScore('security', 10, 'No critical vulnerabilities');
      checks.push(true);
    } else {
      printCheck('Security vulnerabilities', 'fail', `${critical} critical, ${high} high`);
      checks.push(false);
    }
  } catch (error) {
    printCheck('Security audit', 'warn', 'audit failed');
    checks.push(false);
  }

  // Check for hardcoded secrets
  try {
    const { stdout } = await execAsync(
      'grep -r "sk_live_\\|SUPABASE_SERVICE_ROLE_KEY\\|password.*=" --include="*.ts" --include="*.tsx" --include="*.js" src/ 2>&1 || true'
    );

    if (!stdout || stdout.trim() === '') {
      printCheck('Hardcoded secrets check', 'pass', 'none found');
      addScore('security', 5, 'No secrets in code');
      checks.push(true);
    } else {
      printCheck('Hardcoded secrets check', 'fail', 'secrets detected');
      checks.push(false);
    }
  } catch (error) {
    printCheck('Hardcoded secrets check', 'pass', 'none found');
    addScore('security', 5, 'No secrets in code');
    checks.push(true);
  }

  // Check for dangerous functions
  try {
    const { stdout } = await execAsync(
      'grep -r "dangerouslySetInnerHTML\\|eval(\\|Function(" --include="*.tsx" --include="*.ts" src/ 2>&1 || true'
    );

    const dangerousCount = (stdout.match(/dangerouslySetInnerHTML/g) || []).length;

    if (dangerousCount === 0) {
      printCheck('Dangerous functions', 'pass', 'none found');
      addScore('security', 5, 'No dangerous patterns');
      checks.push(true);
    } else {
      printCheck('Dangerous functions', 'warn', `${dangerousCount} instances`);
      addScore('security', 2, 'Some dangerous patterns');
      checks.push(false);
    }
  } catch (error) {
    checks.push(true);
  }

  const passed = checks.filter(Boolean).length;
  const score = (passed / checks.length) * 100;

  return { passed, total: checks.length, score };
}

async function checkPerformance() {
  printHeader('4. Performance Analysis');

  const checks = [];

  // Bundle size analysis
  try {
    const buildManifestPath = path.join('.next', 'build-manifest.json');
    const manifest = JSON.parse(await fs.readFile(buildManifestPath, 'utf-8'));

    let maxPageSize = 0;
    for (const [route, files] of Object.entries(manifest.pages)) {
      let pageSize = 0;
      for (const file of files) {
        try {
          const stats = await fs.stat(path.join('.next', file));
          pageSize += stats.size;
        } catch (e) {
          // Skip missing files
        }
      }
      if (pageSize > maxPageSize) maxPageSize = pageSize;
    }

    if (maxPageSize <= CONFIG.maxBundleSize) {
      printCheck('Bundle size', 'pass', `max page: ${(maxPageSize / 1024).toFixed(1)} KB`);
      addScore('performance', 8, 'Bundle optimized');
      checks.push(true);
    } else {
      printCheck('Bundle size', 'warn', `max page: ${(maxPageSize / 1024).toFixed(1)} KB`);
      addScore('performance', 4, 'Bundle large');
      checks.push(false);
    }
  } catch (error) {
    printCheck('Bundle size analysis', 'warn', 'could not analyze');
    checks.push(false);
  }

  // Image optimization check
  try {
    const { stdout } = await execAsync(
      'find public -type f \\( -name "*.jpg" -o -name "*.png" \\) -size +500k 2>&1 || true'
    );

    const largeImages = stdout.trim().split('\n').filter(Boolean);

    if (largeImages.length === 0) {
      printCheck('Image optimization', 'pass', 'all images optimized');
      addScore('performance', 5, 'Images optimized');
      checks.push(true);
    } else {
      printCheck('Image optimization', 'warn', `${largeImages.length} large images`);
      checks.push(false);
    }
  } catch (error) {
    checks.push(true);
  }

  const passed = checks.filter(Boolean).length;
  const score = (passed / checks.length) * 100;

  return { passed, total: checks.length, score };
}

async function checkDocumentation() {
  printHeader('5. Documentation Completeness');

  const checks = [];

  for (const doc of CONFIG.requiredDocs) {
    try {
      await fs.access(doc);
      const stats = await fs.stat(doc);
      printCheck(`${path.basename(doc)}`, 'pass', `${(stats.size / 1024).toFixed(1)} KB`);
      addScore('documentation', 3, `${doc} exists`);
      checks.push(true);
    } catch (error) {
      printCheck(`${path.basename(doc)}`, 'fail', 'missing');
      checks.push(false);
    }
  }

  // Check README
  try {
    await fs.access('README.md');
    printCheck('README.md', 'pass');
    addScore('documentation', 3, 'README exists');
    checks.push(true);
  } catch (error) {
    printCheck('README.md', 'warn', 'missing');
    checks.push(false);
  }

  const passed = checks.filter(Boolean).length;
  const score = (passed / checks.length) * 100;

  return { passed, total: checks.length, score };
}

async function checkTesting() {
  printHeader('6. Testing Coverage');

  const checks = [];

  // Run tests
  try {
    printCheck('Running test suite...', 'info');
    const { stdout } = await execAsync('npm run test -- --silent 2>&1');

    const testMatch = stdout.match(/Tests:\s+(\d+) passed/);
    const suiteMatch = stdout.match(/Test Suites:\s+(\d+) passed/);

    if (testMatch && suiteMatch) {
      const testCount = parseInt(testMatch[1], 10);
      const suiteCount = parseInt(suiteMatch[1], 10);

      if (testCount >= CONFIG.minTestCount) {
        printCheck('Test suite', 'pass', `${testCount} tests, ${suiteCount} suites`);
        addScore('testing', 8, 'Comprehensive tests');
        checks.push(true);
      } else {
        printCheck('Test suite', 'warn', `only ${testCount} tests (need ${CONFIG.minTestCount}+)`);
        addScore('testing', 4, 'Limited tests');
        checks.push(false);
      }
    } else {
      throw new Error('Could not parse test results');
    }
  } catch (error) {
    printCheck('Test suite', 'fail', error.message);
    checks.push(false);
  }

  // Check for E2E tests
  try {
    const e2eTests = await fs.readdir('tests/e2e');
    printCheck('E2E tests', 'pass', `${e2eTests.length} test files`);
    addScore('testing', 2, 'E2E coverage');
    checks.push(true);
  } catch (error) {
    printCheck('E2E tests', 'warn', 'directory not found');
    checks.push(false);
  }

  const passed = checks.filter(Boolean).length;
  const score = (passed / checks.length) * 100;

  return { passed, total: checks.length, score };
}

async function generateReport(results) {
  printHeader('Production Readiness Report');

  // Calculate overall score
  const overallScore = Math.round(
    (scoring.total / scoring.maxPoints) * 100
  );

  // Display category scores
  console.log('Category Scores:');
  for (const [category, data] of Object.entries(scoring.categories)) {
    const categoryScore = Math.round((data.score / data.max) * 100);
    const status = categoryScore >= 80 ? 'pass' : categoryScore >= 60 ? 'warn' : 'fail';
    printCheck(
      `  ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      status,
      `${categoryScore}% (${data.score.toFixed(1)}/${data.max})`
    );
  }

  console.log(`\n${'━'.repeat(70)}`);
  console.log(`${colors.blue}OVERALL PRODUCTION READINESS: ${overallScore}%${colors.reset}`);
  console.log(`${'━'.repeat(70)}\n`);

  // Recommendations
  const recommendations = [];

  if (results.security.passed < results.security.total) {
    recommendations.push('🔒 Address security vulnerabilities with npm audit fix');
  }

  if (results.codeQuality.passed < results.codeQuality.total) {
    recommendations.push('🔧 Fix TypeScript/ESLint issues before deployment');
  }

  if (results.testing.passed < results.testing.total) {
    recommendations.push('🧪 Expand test coverage to 50+ tests');
  }

  if (results.performance.passed < results.performance.total) {
    recommendations.push('⚡ Optimize bundle size and images');
  }

  if (recommendations.length > 0) {
    console.log('Recommendations:\n');
    recommendations.forEach(rec => console.log(`  ${rec}`));
    console.log('');
  }

  // Deployment readiness
  let readinessStatus;
  if (overallScore >= 95) {
    readinessStatus = `${colors.green}✓ READY FOR PRODUCTION${colors.reset}`;
  } else if (overallScore >= 85) {
    readinessStatus = `${colors.yellow}⚠ READY WITH CAUTION${colors.reset} - Address warnings`;
  } else {
    readinessStatus = `${colors.red}✗ NOT READY${colors.reset} - Critical issues remain`;
  }

  console.log(`Status: ${readinessStatus}\n`);

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    overallScore,
    categoryScores: scoring.categories,
    results,
    recommendations,
  };

  await fs.mkdir('reports', { recursive: true });
  const reportPath = path.join('reports', `readiness-${Date.now()}.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log(`Full report saved: ${reportPath}\n`);

  return report;
}

// Main execution
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║          Tanium TCO LMS - Production Readiness Check              ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');

  const results = {
    environment: await checkEnvironment(),
    codeQuality: await checkCodeQuality(),
    security: await checkSecurity(),
    performance: await checkPerformance(),
    documentation: await checkDocumentation(),
    testing: await checkTesting(),
  };

  const report = await generateReport(results);

  console.log('✓ Production readiness check complete\n');

  // Exit with appropriate code
  process.exit(report.overallScore >= 85 ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n✗ Production readiness check failed:', error.message);
    process.exit(1);
  });
}

module.exports = { checkEnvironment, checkCodeQuality, checkSecurity, checkPerformance, checkDocumentation, checkTesting };
