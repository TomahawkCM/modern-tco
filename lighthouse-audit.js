const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
  });

  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse('http://localhost:3002', options);

  // Print summary to console
  const categories = runnerResult.lhr.categories;
  console.log('\n=== Lighthouse Audit Results ===\n');
  console.log(`Performance Score: ${Math.round(categories.performance.score * 100)}`);
  console.log(`Accessibility Score: ${Math.round(categories.accessibility.score * 100)}`);
  console.log(`Best Practices Score: ${Math.round(categories['best-practices'].score * 100)}`);
  console.log(`SEO Score: ${Math.round(categories.seo.score * 100)}`);

  // Get performance metrics
  const metrics = runnerResult.lhr.audits.metrics.details.items[0];
  console.log('\n=== Performance Metrics ===\n');
  console.log(`First Contentful Paint: ${metrics.firstContentfulPaint}ms`);
  console.log(`Speed Index: ${metrics.speedIndex}ms`);
  console.log(`Largest Contentful Paint: ${metrics.largestContentfulPaint}ms`);
  console.log(`Time to Interactive: ${metrics.interactive}ms`);
  console.log(`Total Blocking Time: ${metrics.totalBlockingTime}ms`);
  console.log(`Cumulative Layout Shift: ${metrics.cumulativeLayoutShift}`);

  // Get top opportunities for improvement
  console.log('\n=== Top Opportunities ===\n');
  const opportunities = Object.values(runnerResult.lhr.audits)
    .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.score < 1)
    .sort((a, b) => b.details.overallSavingsMs - a.details.overallSavingsMs)
    .slice(0, 5);

  opportunities.forEach(opp => {
    console.log(`- ${opp.title}: Potential savings of ${opp.details.overallSavingsMs}ms`);
  });

  // Get accessibility issues
  const accessibilityIssues = Object.values(runnerResult.lhr.audits)
    .filter(audit =>
      audit.details &&
      runnerResult.lhr.categories.accessibility.auditRefs.some(ref => ref.id === audit.id) &&
      audit.score < 1
    )
    .slice(0, 5);

  if (accessibilityIssues.length > 0) {
    console.log('\n=== Accessibility Issues ===\n');
    accessibilityIssues.forEach(issue => {
      console.log(`- ${issue.title}: ${issue.description}`);
    });
  }

  // Save full report
  fs.writeFileSync('./lighthouse-report.json', JSON.stringify(runnerResult.lhr, null, 2));
  console.log('\n✓ Full report saved to lighthouse-report.json\n');

  await chrome.kill();
}

runLighthouse().catch(console.error);