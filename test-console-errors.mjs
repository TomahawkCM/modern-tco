#!/usr/bin/env node

/**
 * Automated Console Error Test
 * Tests the production console fixes by loading the page and checking for errors
 */

import { chromium } from 'playwright';

const TEST_URL = 'http://localhost:3001';
const TIMEOUT = 60000;

console.log('🔍 Starting automated console error test...\n');

async function testConsoleErrors() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const networkErrors = [];
  const consoleLog = [];

  // Capture console messages
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLog.push({ type: msg.type(), text });

    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  // Capture network errors
  page.on('response', (response) => {
    if (response.status() >= 400) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
      });
    }
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    consoleErrors.push(`PageError: ${error.message}`);
  });

  console.log(`📄 Loading: ${TEST_URL}`);

  try {
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
    console.log('✅ Page loaded successfully\n');

    // Wait for React to hydrate and components to render
    await page.waitForTimeout(5000);

    // Test 1: Check for TypeError with .map()
    console.log('🧪 Test 1: Checking for TypeError with .map()');
    const hasMapError = consoleErrors.some(
      (err) => err.includes('Cannot read properties of undefined') && err.includes('map')
    );
    if (hasMapError) {
      console.log('❌ FAILED: TypeError with .map() detected');
      console.log(
        '   Error:',
        consoleErrors.find((e) => e.includes('map'))
      );
    } else {
      console.log('✅ PASSED: No TypeError with .map()');
    }

    // Test 2: Check for SVG 404 error
    console.log('\n🧪 Test 2: Checking for SVG 404 errors');
    const svgError = networkErrors.find((err) =>
      err.url.includes('module00-linear-chain-placeholder.svg')
    );
    if (svgError) {
      console.log(`❌ FAILED: SVG returned ${svgError.status}`);
      console.log(`   URL: ${svgError.url}`);
    } else {
      console.log('✅ PASSED: No SVG 404 errors');
    }

    // Test 3: Check for /demo 404 error
    console.log('\n🧪 Test 3: Checking for /demo 404 errors');
    const demoError = networkErrors.find((err) => err.url.includes('/demo'));
    if (demoError) {
      console.log(`❌ FAILED: /demo returned ${demoError.status}`);
      console.log(`   URL: ${demoError.url}`);
    } else {
      console.log('✅ PASSED: No /demo 404 errors');
    }

    // Test 4: Check for MainLayout re-render logs
    console.log('\n🧪 Test 4: Checking for excessive MainLayout logs');
    const mainLayoutLogs = consoleLog.filter((log) =>
      log.text.includes('[MainLayout] Rendering full layout')
    );
    if (mainLayoutLogs.length > 2) {
      console.log(`❌ FAILED: ${mainLayoutLogs.length} MainLayout render logs detected`);
      console.log('   Expected: 0-2 logs');
    } else if (mainLayoutLogs.length > 0) {
      console.log(`⚠️  WARNING: ${mainLayoutLogs.length} MainLayout render logs (acceptable)`);
    } else {
      console.log('✅ PASSED: No excessive MainLayout logs');
    }

    // Test 5: Check overall error count
    console.log('\n🧪 Test 5: Overall console error count');
    const relevantErrors = consoleErrors.filter(
      (err) =>
        !err.includes('message channel closed') && // Ignore browser extension errors
        !err.includes('Tanium') // Ignore Tanium extension errors
    );

    if (relevantErrors.length > 0) {
      console.log(`❌ FAILED: ${relevantErrors.length} console errors detected`);
      console.log('\nErrors:');
      relevantErrors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 100)}...`);
      });
    } else {
      console.log('✅ PASSED: No application errors in console');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total console messages: ${consoleLog.length}`);
    console.log(`Console errors: ${consoleErrors.length}`);
    console.log(`Network errors (4xx/5xx): ${networkErrors.length}`);
    console.log(`Relevant app errors: ${relevantErrors.length}`);

    // Show recent console logs
    console.log('\n📝 Recent console output:');
    consoleLog.slice(-10).forEach((log) => {
      const icon = log.type === 'error' ? '❌' : log.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`   ${icon} [${log.type}] ${log.text.substring(0, 80)}`);
    });

    // Network errors summary
    if (networkErrors.length > 0) {
      console.log('\n🌐 Network Errors:');
      networkErrors.forEach((err) => {
        console.log(`   ${err.status} - ${err.url}`);
      });
    }

    // Final result
    const allTestsPassed = !hasMapError && !svgError && !demoError && relevantErrors.length === 0;
    console.log('\n' + '='.repeat(60));
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED - Console errors have been fixed!');
    } else {
      console.log('⚠️  SOME TESTS FAILED - Review errors above');
    }
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testConsoleErrors()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
