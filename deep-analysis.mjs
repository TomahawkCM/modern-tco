#!/usr/bin/env node

/**
 * Deep Analysis of Production Error
 * Traces the exact source of the TypeError
 */

import { chromium } from 'playwright';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://modern-tco.vercel.app';

console.log('🔍 DEEP ANALYSIS - Production Error Investigation\n');
console.log(`📍 URL: ${PRODUCTION_URL}\n`);

async function deepAnalysis() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allErrors = [];
  const allLogs = [];
  const networkRequests = [];

  // Capture EVERYTHING
  page.on('console', (msg) => {
    const log = { type: msg.type(), text: msg.text(), location: msg.location() };
    allLogs.push(log);
    if (msg.type() === 'error') {
      allErrors.push(log);
    }
  });

  page.on('pageerror', (error) => {
    allErrors.push({
      type: 'pageerror',
      text: error.message,
      stack: error.stack,
    });
  });

  page.on('request', (request) => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
    });
  });

  try {
    console.log('📡 Loading page with full monitoring...\n');

    await page.goto(PRODUCTION_URL, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    // Wait for React
    await page.waitForTimeout(8000);

    console.log('═'.repeat(70));
    console.log('ERROR ANALYSIS');
    console.log('═'.repeat(70));

    // Find the .map() error
    const mapError = allErrors.find(
      (e) => e.text && e.text.includes('map') && e.text.includes('undefined')
    );

    if (mapError) {
      console.log('\n❌ FOUND THE ERROR:\n');
      console.log(mapError.text);

      if (mapError.stack) {
        console.log('\n📚 Stack Trace:');
        console.log(mapError.stack);
      }
    }

    // Check JavaScript bundles
    console.log('\n📦 JAVASCRIPT BUNDLES LOADED:');
    const jsRequests = networkRequests.filter(
      (r) => r.resourceType === 'script' && r.url.includes('.js')
    );

    jsRequests.slice(0, 10).forEach((r) => {
      const filename = r.url.split('/').pop();
      console.log(`   - ${filename}`);
    });

    // Check for ModuleViewer in loaded scripts
    console.log('\n🔍 CHECKING FOR MODULE VIEWER FIX:');
    const moduleViewerCheck = await page.evaluate(() => {
      // Try to find any component with ModuleViewer in its name
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.length;
    });
    console.log(`   Found ${moduleViewerCheck} script tags`);

    // Get all React component errors
    console.log('\n🎯 REACT COMPONENT ERRORS:');
    allErrors.forEach((err, i) => {
      if (i < 5) {
        // Limit to first 5
        console.log(`\n   Error ${i + 1}:`);
        console.log(`   Type: ${err.type}`);
        console.log(`   Message: ${err.text.substring(0, 150)}...`);
      }
    });

    // Check Error Boundary messages
    console.log('\n🛡️  ERROR BOUNDARY MESSAGES:');
    const boundaryErrors = allLogs.filter((l) => l.text && l.text.includes('Error boundary'));
    boundaryErrors.forEach((e) => {
      console.log(`   - ${e.text.substring(0, 100)}`);
    });

    // Analysis summary
    console.log('\n' + '═'.repeat(70));
    console.log('ANALYSIS SUMMARY');
    console.log('═'.repeat(70));
    console.log(`Total Errors: ${allErrors.length}`);
    console.log(`Total Console Messages: ${allLogs.length}`);
    console.log(`JavaScript Files Loaded: ${jsRequests.length}`);

    const hasMapError = allErrors.some(
      (e) => e.text && e.text.includes('map') && e.text.includes('undefined')
    );

    if (hasMapError) {
      console.log('\n❌ CONCLUSION: TypeError with .map() IS PRESENT');
      console.log('   The fix has NOT been deployed or there is ANOTHER component');
      console.log('   with the same issue.');
    } else {
      console.log('\n✅ CONCLUSION: No .map() errors detected');
      console.log('   The fix appears to be working.');
    }

    console.log('\n💡 RECOMMENDED NEXT STEPS:');
    if (hasMapError) {
      console.log('   1. Check Vercel deployment logs for build errors');
      console.log('   2. Verify the deployment used commit 9588f52d');
      console.log('   3. Search for OTHER components using .map() without guards');
      console.log('   4. Check if build is failing silently');
    }
  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run analysis
deepAnalysis()
  .then(() => {
    console.log('\n✅ Deep analysis complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  });
