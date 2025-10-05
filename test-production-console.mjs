import { chromium } from 'playwright';

const modules = [
  'asking-questions',
  'refining-questions-targeting',
  'taking-action-packages-actions',
  'navigation-basic-modules',
  'reporting-data-export',
  'tanium-platform-foundation'
];

const baseUrl = 'https://modern-tco.vercel.app/study/';

async function testModule(page, moduleName) {
  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();

    if (type === 'error') {
      errors.push(text);
    } else if (type === 'warning') {
      warnings.push(text);
    }
  });

  page.on('pageerror', error => {
    errors.push(`PageError: ${error.message}`);
  });

  try {
    console.log(`\n=== Testing: ${moduleName} ===`);
    await page.goto(`${baseUrl}${moduleName}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for MDX content to render
    await page.waitForTimeout(3000);

    if (errors.length > 0) {
      console.log(`❌ ERRORS FOUND (${errors.length}):`);
      errors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log(`✅ No console errors`);
    }

    if (warnings.length > 0) {
      console.log(`⚠️  WARNINGS (${warnings.length}):`);
      warnings.slice(0, 3).forEach(warn => console.log(`  - ${warn}`));
      if (warnings.length > 3) {
        console.log(`  ... and ${warnings.length - 3} more warnings`);
      }
    }

    // Check for specific error patterns
    const hasReferenceError = errors.some(e => e.includes('ReferenceError'));
    const hasTypeError = errors.some(e => e.includes('TypeError'));
    const has404 = errors.some(e => e.includes('404'));

    if (hasReferenceError) console.log(`  🔴 Contains ReferenceError`);
    if (hasTypeError) console.log(`  🔴 Contains TypeError`);
    if (has404) console.log(`  🔴 Contains 404 errors`);

    return { moduleName, errorCount: errors.length, warningCount: warnings.length, errors, warnings };
  } catch (error) {
    console.log(`❌ Failed to load: ${error.message}`);
    return { moduleName, errorCount: -1, errors: [error.message] };
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = [];

  for (const module of modules) {
    const result = await testModule(page, module);
    results.push(result);
  }

  await browser.close();

  console.log('\n\n=== SUMMARY ===');
  const failedModules = results.filter(r => r.errorCount > 0);
  const passedModules = results.filter(r => r.errorCount === 0);

  console.log(`✅ Passed: ${passedModules.length}/${modules.length}`);
  console.log(`❌ Failed: ${failedModules.length}/${modules.length}`);

  if (failedModules.length > 0) {
    console.log('\nFailed modules:');
    failedModules.forEach(m => {
      console.log(`  - ${m.moduleName}: ${m.errorCount} errors`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 All modules passed!');
    process.exit(0);
  }
})();
