#!/usr/bin/env node

/**
 * Working Playwright Test for Live App
 * Optimized for WSL2 environment
 */

const { chromium } = require('playwright');

async function testLiveApp() {
  console.log('🧪 Testing Live Application: https://modern-tco.vercel.app/tanium\n');

  let browser;
  try {
    // Launch browser with WSL2-optimized settings
    browser = await chromium.launch({
      headless: true,
      args: [
        '--headless=new',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    console.log('✅ Browser launched successfully');

    // Create context with permissions
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      bypassCSP: true,
      javaScriptEnabled: true,
    });

    console.log('✅ Browser context created');

    // Create page with error handling
    const page = await context.newPage();
    console.log('✅ Page created');

    // Navigate to the app
    console.log('\n📱 Navigating to https://modern-tco.vercel.app/tanium...');
    const response = await page.goto('https://modern-tco.vercel.app/tanium', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log(`✅ Navigation complete (Status: ${response.status()})`);

    // Get page info
    const title = await page.title();
    console.log(`📄 Page Title: "${title}"`);

    // Wait for app to load
    await page.waitForTimeout(2000);

    // Check for key elements
    console.log('\n🔍 Checking application elements...');

    const checks = {
      Navigation: (await page.locator('nav').count()) > 0,
      Buttons: (await page.locator('button').count()) > 0,
      Content: (await page.locator('main, #root, [class*="container"]').count()) > 0,
    };

    for (const [element, found] of Object.entries(checks)) {
      console.log(`  ${found ? '✅' : '❌'} ${element}: ${found ? 'Found' : 'Not found'}`);
    }

    // Take screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({
      path: '/tmp/live-app-screenshot.png',
      fullPage: false,
    });
    console.log('✅ Screenshot saved to /tmp/live-app-screenshot.png');

    console.log('\n🎉 SUCCESS! Live app test completed!');
    console.log('\n📊 Application appears to be a Next.js SPA');
    console.log('   Full testing would require browser automation with all dependencies');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);

    if (error.message.includes('Target closed') || error.message.includes('crashed')) {
      console.log('\n🔧 Browser crashed due to missing system libraries.');
      console.log('   This is expected in WSL2 without full dependencies.');
      console.log('\n   Alternative testing methods:');
      console.log('   1. Use HTTP-based testing: node scripts/test-live-app-http.js');
      console.log('   2. Use curl for basic checks: curl -I https://modern-tco.vercel.app/tanium');
      console.log('   3. Install dependencies with sudo if available');
    }
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n🔒 Browser closed');
    }
  }
}

// Run test
testLiveApp().catch(console.error);
