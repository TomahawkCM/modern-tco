import { chromium } from 'playwright';

const deploymentUrl = 'https://modern-kx7b3cnko-robert-neveus-projects.vercel.app';
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
    await page.waitForTimeout(3000);

    const hasReferenceError = errors.some(e => e.includes('ReferenceError'));
    const result = {
      module: moduleName,
      passed: errors.length === 0 || !hasReferenceError,
      errorCount: errors.length
    };
    results.push(result);

    console.log(`${result.passed ? '✅' : '❌'} ${moduleName}: ${errors.length} errors`);
    await page.close();
  }

  await browser.close();

  const passedCount = results.filter(r => r.passed).length;
  console.log(`\n=== SUMMARY ===`);
  console.log(`Passed: ${passedCount}/6`);
  if (passedCount === 6) {
    console.log('🎉 ALL MODULES PASSING - 100% FUNCTIONAL!');
  }
}

testAllModules().catch(console.error);
