#!/usr/bin/env node
/**
 * Performance Monitoring Script for Tanium TCO LMS
 *
 * Purpose: Monitor and report on production performance metrics
 * Usage: node scripts/performance-monitor.js [url]
 *
 * Metrics tracked:
 * - Bundle size analysis
 * - Lighthouse scores
 * - Build time
 * - Memory usage
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  targetUrl: process.argv[2] || 'http://localhost:3000',
  buildDir: '.next',
  reportsDir: 'reports',
  thresholds: {
    performance: 90,
    accessibility: 100,
    bestPractices: 95,
    seo: 95,
    maxBundleSize: 500 * 1024, // 500 KB
  },
};

// Utility functions
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatTime = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const printSection = (title) => {
  console.log('\n' + '━'.repeat(60));
  console.log(title);
  console.log('━'.repeat(60) + '\n');
};

const printStatus = (label, value, status = 'info') => {
  const symbols = {
    pass: '✓',
    fail: '✗',
    warn: '⚠',
    info: '→',
  };
  const colors = {
    pass: '\x1b[32m',
    fail: '\x1b[31m',
    warn: '\x1b[33m',
    info: '\x1b[36m',
  };
  const reset = '\x1b[0m';

  console.log(`${colors[status]}${symbols[status]}${reset} ${label}: ${value}`);
};

// Analysis functions
async function analyzeBundleSize() {
  printSection('Bundle Size Analysis');

  try {
    const buildManifestPath = path.join(CONFIG.buildDir, 'build-manifest.json');
    const buildManifest = JSON.parse(await fs.readFile(buildManifestPath, 'utf-8'));

    let totalSize = 0;
    const pages = {};

    // Analyze pages
    for (const [route, files] of Object.entries(buildManifest.pages)) {
      let pageSize = 0;
      for (const file of files) {
        const filePath = path.join(CONFIG.buildDir, file);
        try {
          const stats = await fs.stat(filePath);
          pageSize += stats.size;
        } catch (e) {
          // File might not exist, skip
        }
      }
      pages[route] = pageSize;
      totalSize += pageSize;
    }

    // Sort pages by size
    const sortedPages = Object.entries(pages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    printStatus('Total bundle size', formatBytes(totalSize), 'info');
    printStatus('Average page size', formatBytes(totalSize / Object.keys(pages).length), 'info');

    console.log('\nTop 10 largest pages:');
    sortedPages.forEach(([route, size]) => {
      const status = size > CONFIG.thresholds.maxBundleSize ? 'warn' : 'pass';
      printStatus(`  ${route}`, formatBytes(size), status);
    });

    return { totalSize, pages, sortedPages };
  } catch (error) {
    printStatus('Bundle analysis failed', error.message, 'fail');
    return null;
  }
}

async function runLighthouse() {
  printSection('Lighthouse Performance Audit');

  try {
    // Check if lighthouse is installed
    try {
      await execAsync('lighthouse --version');
    } catch (e) {
      printStatus('Lighthouse not installed', 'Installing...', 'warn');
      await execAsync('npm install -g lighthouse');
    }

    // Ensure reports directory exists
    await fs.mkdir(CONFIG.reportsDir, { recursive: true });

    const reportPath = path.join(CONFIG.reportsDir, `lighthouse-${Date.now()}.json`);
    const htmlReportPath = reportPath.replace('.json', '.html');

    printStatus('Running Lighthouse audit', `Target: ${CONFIG.targetUrl}`, 'info');
    printStatus('This may take 1-2 minutes...', '', 'info');

    const cmd = `lighthouse ${CONFIG.targetUrl} \
      --output=json \
      --output=html \
      --output-path="${reportPath.replace('.json', '')}" \
      --chrome-flags="--headless --no-sandbox" \
      --quiet`;

    await execAsync(cmd);

    // Parse results
    const report = JSON.parse(await fs.readFile(reportPath, 'utf-8'));
    const scores = {
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      bestPractices: Math.round(report.categories['best-practices'].score * 100),
      seo: Math.round(report.categories.seo.score * 100),
    };

    // Display scores
    console.log('\nLighthouse Scores:');
    Object.entries(scores).forEach(([category, score]) => {
      const threshold = CONFIG.thresholds[category] || 90;
      const status = score >= threshold ? 'pass' : (score >= threshold - 10 ? 'warn' : 'fail');
      const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
      printStatus(`  ${categoryLabel}`, `${score}/100`, status);
    });

    // Key metrics
    const metrics = report.audits['metrics'].details.items[0];
    console.log('\nCore Web Vitals:');
    printStatus('  First Contentful Paint', formatTime(metrics.firstContentfulPaint), 'info');
    printStatus('  Largest Contentful Paint', formatTime(metrics.largestContentfulPaint),
      metrics.largestContentfulPaint <= 2500 ? 'pass' : 'warn');
    printStatus('  Total Blocking Time', formatTime(metrics.totalBlockingTime),
      metrics.totalBlockingTime <= 300 ? 'pass' : 'warn');
    printStatus('  Cumulative Layout Shift', metrics.cumulativeLayoutShift.toFixed(3),
      metrics.cumulativeLayoutShift <= 0.1 ? 'pass' : 'warn');

    printStatus('\nFull report saved', htmlReportPath, 'pass');

    return { scores, metrics, reportPath: htmlReportPath };
  } catch (error) {
    printStatus('Lighthouse audit failed', error.message, 'fail');
    return null;
  }
}

async function measureBuildTime() {
  printSection('Build Performance');

  try {
    printStatus('Running production build...', 'This may take 2-3 minutes', 'info');

    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    await execAsync('npm run build');

    const endTime = Date.now();
    const buildTime = endTime - startTime;
    const endMemory = process.memoryUsage();

    printStatus('Build completed', formatTime(buildTime), 'pass');
    printStatus('Memory used', formatBytes(endMemory.heapUsed - startMemory.heapUsed), 'info');

    return { buildTime, memoryDelta: endMemory.heapUsed - startMemory.heapUsed };
  } catch (error) {
    printStatus('Build failed', error.message, 'fail');
    return null;
  }
}

async function checkDependencies() {
  printSection('Dependency Analysis');

  try {
    // Check for outdated packages
    const { stdout: outdatedOutput } = await execAsync('npm outdated --json || true');
    const outdated = outdatedOutput ? JSON.parse(outdatedOutput) : {};

    const outdatedCount = Object.keys(outdated).length;
    printStatus('Outdated packages', outdatedCount, outdatedCount > 0 ? 'warn' : 'pass');

    if (outdatedCount > 0 && outdatedCount <= 5) {
      console.log('\nOutdated packages:');
      Object.entries(outdated).forEach(([name, info]) => {
        console.log(`  ${name}: ${info.current} → ${info.latest}`);
      });
    }

    // Check for security vulnerabilities
    const { stdout: auditOutput } = await execAsync('npm audit --json || true');
    const audit = JSON.parse(auditOutput);

    const vulnCount = audit.metadata?.vulnerabilities?.total || 0;
    const critical = audit.metadata?.vulnerabilities?.critical || 0;
    const high = audit.metadata?.vulnerabilities?.high || 0;

    printStatus('Security vulnerabilities', vulnCount, vulnCount === 0 ? 'pass' :
      (critical > 0 || high > 0 ? 'fail' : 'warn'));

    if (vulnCount > 0) {
      console.log('  Critical:', critical);
      console.log('  High:', high);
      console.log('  Medium:', audit.metadata?.vulnerabilities?.medium || 0);
      console.log('  Low:', audit.metadata?.vulnerabilities?.low || 0);
    }

    return { outdatedCount, vulnerabilities: audit.metadata?.vulnerabilities };
  } catch (error) {
    printStatus('Dependency check failed', error.message, 'warn');
    return null;
  }
}

async function generateReport(results) {
  printSection('Performance Report Summary');

  const timestamp = new Date().toISOString();

  const report = {
    timestamp,
    url: CONFIG.targetUrl,
    results,
    recommendations: [],
  };

  // Generate recommendations
  if (results.lighthouse?.scores.performance < CONFIG.thresholds.performance) {
    report.recommendations.push('⚠ Performance score below threshold - optimize bundle size and code splitting');
  }

  if (results.bundle?.sortedPages[0][1] > CONFIG.thresholds.maxBundleSize) {
    report.recommendations.push(`⚠ Largest page (${results.bundle.sortedPages[0][0]}) exceeds size threshold`);
  }

  if (results.dependencies?.vulnerabilities?.critical > 0) {
    report.recommendations.push('🚨 Critical security vulnerabilities detected - run npm audit fix immediately');
  }

  if (results.build?.buildTime > 180000) { // 3 minutes
    report.recommendations.push('⚠ Build time exceeds 3 minutes - consider optimizing build process');
  }

  // Display summary
  console.log('Performance Status:');
  if (report.recommendations.length === 0) {
    printStatus('Overall status', 'All checks passed', 'pass');
  } else {
    console.log('\nRecommendations:');
    report.recommendations.forEach(rec => console.log(`  ${rec}`));
  }

  // Save report
  const reportPath = path.join(CONFIG.reportsDir, `performance-${Date.now()}.json`);
  await fs.mkdir(CONFIG.reportsDir, { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  printStatus('\nFull report saved', reportPath, 'pass');

  return report;
}

// Main execution
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   Tanium TCO LMS - Performance Monitoring                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results = {};

  // Run all analyses
  results.bundle = await analyzeBundleSize();
  results.dependencies = await checkDependencies();

  // Optional: Only run Lighthouse if URL is provided
  if (process.argv[2]) {
    results.lighthouse = await runLighthouse();
  } else {
    printSection('Lighthouse Audit');
    console.log('Skipped (provide URL as argument to run)');
    console.log('Usage: node scripts/performance-monitor.js http://localhost:3000');
  }

  // Generate final report
  await generateReport(results);

  console.log('\n✓ Performance monitoring complete\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n✗ Performance monitoring failed:', error.message);
    process.exit(1);
  });
}

module.exports = { analyzeBundleSize, runLighthouse, measureBuildTime, checkDependencies };
