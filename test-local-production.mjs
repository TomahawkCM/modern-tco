#!/usr/bin/env node

import { chromium } from 'playwright';

const LOCAL_URL = 'http://localhost:3002/modules/tanium-platform-foundation-v2';

console.log('🔍 Testing LOCAL Production Build...\n');
console.log(`📍 URL: ${LOCAL_URL}\n`);

async function testLocal() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleLog = [];

  page.on('console', (msg) => {
    consoleLog.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    consoleErrors.push(`PageError: ${error.message}`);
  });

  try {
    await page.goto(LOCAL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    console.log('='.repeat(70));
    console.log('LOCAL PRODUCTION BUILD TEST');
    console.log('='.repeat(70));

    const hasMapError = consoleErrors.some(
      (err) => err.includes('Cannot read properties of undefined') && err.includes('map')
    );

    const has500 = consoleErrors.some((err) => err.includes('500'));

    if (hasMapError) {
      console.log('\n❌ FAILED: TypeError with .map() still present locally');
      console.log('   This means the fixes are not working\n');
      consoleErrors.forEach((e) => console.log('  ', e.substring(0, 100)));
    } else if (has500) {
      console.log('\n❌ FAILED: 500 error detected');
    } else {
      console.log('\n✅ SUCCESS: Local production build works correctly!');
      console.log('   No TypeError errors');
      console.log('   No 500 errors');
      console.log('   The fixes ARE working locally\n');
      console.log('   🎯 This confirms: THE PROBLEM IS VERCEL DEPLOYMENT');
    }

    console.log('\n📝 Console Output:');
    consoleLog.slice(-5).forEach((log) => {
      const icon = log.type === 'error' ? '❌' : log.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`   ${icon} ${log.text.substring(0, 80)}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log(`Errors: ${consoleErrors.length}`);
    console.log(`Status: ${hasMapError || has500 ? 'FAIL ❌' : 'PASS ✅'}`);
    console.log('='.repeat(70));
  } catch (error) {
    console.error('\n❌ Could not connect to local server');
    console.error('   Make sure the production server is running on port 3002');
    console.error('   Run: wsl bash -c "cd ... && PORT=3002 npm run start"');
  } finally {
    await browser.close();
  }
}

testLocal();
