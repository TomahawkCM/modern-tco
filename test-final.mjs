import { chromium } from 'playwright';

const deploymentUrl = 'https://modern-23xussawj-robert-neveus-projects.vercel.app';
const modules = [
  'asking-questions',
  'refining-questions-targeting',
  'taking-action-packages-actions',
  'navigation-basic-modules',
  'reporting-data-export',
  'tanium-platform-foundation'
];

async function testAllModules() {
  const browser = await chromium.launch();
  const results = [];

  for (const moduleName of modules) {
    const page = await browser.newPage();
    const errors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${deploymentUrl}/study/${moduleName}`);
    await page.waitForTimeout(5000);

    const hasReferenceError = errors.some(e => e.includes('ReferenceError'));
    const result = {
      module: moduleName,
      passed: errors.length === 0,
      errorCount: errors.length,
      hasReferenceError
    };
    results.push(result);

    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${moduleName}: ${errors.length} errors${result.hasReferenceError ? ' (ReferenceError)' : ''}`);

    if (!result.passed && errors.length > 0) {
      console.log(`   First error: ${errors[0].substring(0, 100)}...`);
    }

    await page.close();
  }

  await browser.close();

  const passedCount = results.filter(r => r.passed).length;
  console.log(`\n=== FINAL RESULT ===`);
  console.log(`Passed: ${passedCount}/6 modules`);

  if (passedCount === 6) {
    console.log('🎉🎉🎉 ALL MODULES PASSING - 100% FUNCTIONAL APP ACHIEVED! 🎉🎉🎉');
  } else {
    console.log(`⚠️  ${6 - passedCount} module(s) still need fixing`);
    const failed = results.filter(r => !r.passed);
    failed.forEach(f => console.log(`   - ${f.module}`));
  }
}

testAllModules().catch(console.error);
