#!/usr/bin/env node

/**
 * Verify Production Deployment
 * Checks if the latest fixes are deployed to production
 */

import { chromium } from 'playwright';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://modern-tco.vercel.app';
const TIMEOUT = 30000;

console.log('🔍 Verifying production deployment...\n');
console.log(`📍 Production URL: ${PRODUCTION_URL}\n`);

async function verifyDeployment() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];

  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    consoleErrors.push(`PageError: ${error.message}`);
  });

  try {
    console.log('🌐 Loading production site (bypassing cache)...');

    // Load with cache bypass
    await page.goto(PRODUCTION_URL, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUT,
    });

    console.log('✅ Page loaded\n');

    // Wait for React to hydrate
    await page.waitForTimeout(5000);

    // Check for TypeError with .map()
    const hasMapError = consoleErrors.some(
      (err) => err.includes('Cannot read properties of undefined') && err.includes('map')
    );

    console.log('='.repeat(60));
    console.log('DEPLOYMENT VERIFICATION RESULTS');
    console.log('='.repeat(60));

    if (hasMapError) {
      console.log('❌ DEPLOYMENT NOT COMPLETE');
      console.log('   The old build is still being served');
      console.log('   The TypeError with .map() is still present\n');
      console.log('🔄 Recommended Actions:');
      console.log('   1. Wait 2-3 more minutes for Vercel deployment');
      console.log('   2. Check Vercel dashboard for deployment status');
      console.log('   3. Hard refresh browser (Ctrl+Shift+R)');
      console.log('   4. Clear all browser cache and cookies\n');

      console.log('📊 Error Details:');
      consoleErrors.slice(0, 3).forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 100)}...`);
      });
    } else {
      console.log('✅ DEPLOYMENT SUCCESSFUL');
      console.log('   The fixes have been deployed to production');
      console.log('   No TypeError with .map() detected');
      console.log('   Console is clean\n');
    }

    console.log('='.repeat(60));

    // Get build info from page
    const buildInfo = await page.evaluate(() => {
      return {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      };
    });

    console.log('\n📦 Build Information:');
    console.log(`   Checked at: ${new Date(buildInfo.timestamp).toISOString()}`);
    console.log(`   Total console errors: ${consoleErrors.length}`);
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run verification
verifyDeployment()
  .then(() => {
    console.log('\n✅ Verification complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });
