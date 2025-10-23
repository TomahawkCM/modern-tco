#!/usr/bin/env node

import { chromium } from 'playwright';

const MODULE_URL = 'https://modern-tco.vercel.app/modules/tanium-platform-foundation-v2';

console.log('🔍 Testing Module Page for Errors...\n');
console.log(`📍 URL: ${MODULE_URL}\n`);

async function testModulePage() {
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
    consoleErrors.push(`PageError: ${error.message}\nStack: ${error.stack}`);
  });

  try {
    console.log('📡 Loading module page...\n');
    
    await page.goto(MODULE_URL, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);

    console.log('='.repeat(70));
    console.log('MODULE PAGE ERROR ANALYSIS');
    console.log('='.repeat(70));

    const hasMapError = consoleErrors.some(err => 
      err.includes('Cannot read properties of undefined') && err.includes('map')
    );

    if (hasMapError) {
      console.log('\n❌ FOUND THE ERROR ON MODULE PAGE!\n');
      
      const mapError = consoleErrors.find(e => e.includes('map') && e.includes('undefined'));
      console.log('Error:');
      console.log(mapError);
      
      console.log('\n📊 All Console Errors:');
      consoleErrors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err.substring(0, 200)}`);
      });
    } else {
      console.log('\n✅ NO ERRORS - Module page loads correctly');
    }

    console.log('\n📝 Recent Console Output:');
    consoleLog.slice(-10).forEach(log => {
      const icon = log.type === 'error' ? '❌' : log.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`   ${icon} [${log.type}] ${log.text.substring(0, 80)}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log(`Total Errors: ${consoleErrors.length}`);
    console.log(`Has .map() Error: ${hasMapError ? 'YES ❌' : 'NO ✅'}`);
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testModulePage()
  .then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

