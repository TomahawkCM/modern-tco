/**
 * Browser Test for CSV Import
 * Uses Playwright to test the actual import flow
 */

import { chromium } from 'playwright';
import * as path from 'path';

async function testImport() {
  console.log('🚀 Starting browser test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to import page
  console.log('📍 Navigating to import page...');
  await page.goto('http://localhost:3000/budget-app/import');
  await page.waitForLoadState('networkidle');

  // Close welcome tour if it appears
  try {
    const skipButton = page.getByRole('link', { name: 'Skip tour' });
    if (await skipButton.isVisible({ timeout: 2000 })) {
      console.log('👋 Clicking Skip tour...');
      await skipButton.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    console.log('⚠️ Skip tour button not found, continuing...');
  }

  // Take initial screenshot
  await page.screenshot({ path: 'test-import-1-initial.png' });
  console.log('✅ Page loaded\n');

  // Set up console listener to capture logs
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (
      text.includes('[ImportPage]') ||
      text.includes('[SmartBankDetection]') ||
      text.includes('[CollectiveLearning]')
    ) {
      consoleLogs.push(text);
      console.log(`   📝 ${text}`);
    }
  });

  // Close welcome tour if it appears BEFORE upload
  try {
    const skipButton = page.getByRole('link', { name: 'Skip tour' });
    if (await skipButton.isVisible({ timeout: 2000 })) {
      console.log('👋 Clicking Skip tour (pre-upload)...');
      await skipButton.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    // Tour not visible yet, continue
  }

  // Upload CSV file
  console.log('📤 Uploading CSV file...');
  const csvPath = path.join(process.cwd(), 'Screenshots/home-trust-visa-statement.csv');

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(csvPath);
  console.log('✅ File uploaded\n');

  // Wait for file detection to complete
  console.log('⏳ Waiting for format detection...');
  await page.waitForTimeout(2000);

  // Close ANY modals by pressing Escape repeatedly
  console.log('🔍 Closing any blocking modals with Escape key...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  console.log('✅ Modals dismissed\n');

  // Look for the "Process File" button and click it
  console.log('🔍 Looking for Process File button...');

  // Wait for button to appear
  const processButton = page.getByRole('button', { name: 'Process File' });
  await processButton.waitFor({ state: 'visible', timeout: 5000 });

  // Take screenshot showing button is visible
  await page.screenshot({ path: 'test-import-button-visible.png' });
  console.log('📸 Button visible, clicking now...');

  // Regular click (modals already dismissed with Escape)
  await processButton.click({ timeout: 10000 });
  console.log('✅ Button clicked successfully\n');

  // Wait for processing
  console.log('⏳ Processing file...\n');
  await page.waitForTimeout(8000); // Wait 8 seconds for processing

  // Take screenshot after processing
  await page.screenshot({ path: 'test-import-2-processed.png' });

  // Check for errors
  const errorElement = page.locator('[role="alert"]').first();
  const hasError = await errorElement.isVisible().catch(() => false);

  if (hasError) {
    const errorText = await errorElement.textContent();
    console.log('❌ Error detected:', errorText);
  }

  // Check for success (look for transaction count or success message)
  const pageText = await page.textContent('body');

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 Test Results');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`Console logs captured: ${consoleLogs.length}`);
  console.log(`Error detected: ${hasError ? 'YES' : 'NO'}`);

  // Check if transactions were imported
  const hasTransactions = pageText?.includes('transaction') || pageText?.includes('imported');
  console.log(`Transactions found in page: ${hasTransactions ? 'YES' : 'NO'}`);

  console.log('\n📝 Relevant Console Logs:\n');
  consoleLogs.forEach(log => console.log(`   ${log}`));

  console.log('\n📸 Screenshots saved:');
  console.log('   - test-import-1-initial.png');
  console.log('   - test-import-2-processed.png\n');

  // Keep browser open for inspection
  console.log('🔍 Browser kept open for inspection. Press Ctrl+C to close.\n');
  await page.waitForTimeout(60000); // Wait 1 minute before closing

  await browser.close();
}

testImport().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
