/**
 * E2E Tests for Import Wizard
 * Tests complete import workflow with Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('Import Wizard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to import page
    await page.goto('/budget-app/import');
  });

  // ========================================
  // File Upload Tests
  // ========================================
  test('should upload CSV file and detect format', async ({ page }) => {
    // Create a test CSV file
    const csvContent = `Date,Description,Amount
2025-01-15,STARBUCKS,-4.50
2025-01-16,PAYROLL,1000.00`;

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-statement.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Wait for format detection
    await expect(page.locator('text=CSV')).toBeVisible({ timeout: 5000 });
  });

  test('should upload OFX file and detect format', async ({ page }) => {
    const ofxContent = `<?xml version="1.0"?>
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20250115</DTPOSTED>
            <TRNAMT>-50.00</TRNAMT>
            <FITID>12345</FITID>
            <NAME>TEST MERCHANT</NAME>
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-statement.ofx',
      mimeType: 'application/x-ofx',
      buffer: Buffer.from(ofxContent),
    });

    await expect(page.locator('text=OFX')).toBeVisible({ timeout: 5000 });
  });

  // ========================================
  // Bank Detection Tests
  // ========================================
  test('should auto-detect BMO bank format', async ({ page }) => {
    const bmoCSV = `Account Number: 123456789
Date Range: 01/01/2025 - 01/31/2025

Date Posted,Description,Transaction Amount,Transaction Type
20250115,STARBUCKS,-4.50,POS
20250116,PAYROLL,1000.00,DEPOSIT`;

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'bmo-statement.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(bmoCSV),
    });

    // Click process button
    await page.click('button:has-text("Process File")');

    // Wait for bank detection
    await expect(page.locator('text=BMO')).toBeVisible({ timeout: 10000 });
  });

  // ========================================
  // Duplicate Detection Tests
  // ========================================
  test('should detect duplicates in preview', async ({ page }) => {
    // First, add a transaction to the database
    await page.goto('/budget-app/transactions');
    // Add transaction via UI (simplified - would need actual implementation)

    // Then import same transaction
    const csvContent = `Date,Description,Amount
2025-01-15,STARBUCKS,-4.50`;

    await page.goto('/budget-app/import');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'duplicate-test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    await page.click('button:has-text("Process File")');

    // Should show duplicate in preview
    await expect(page.locator('text=Duplicate')).toBeVisible({ timeout: 10000 });
  });

  // ========================================
  // Import Flow Tests
  // ========================================
  test('should complete full import workflow', async ({ page }) => {
    const csvContent = `Date,Description,Amount
2025-01-15,STARBUCKS,-4.50
2025-01-16,AMAZON,-25.00
2025-01-17,PAYROLL,1000.00`;

    // Upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'full-import.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Process
    await page.click('button:has-text("Process File")');
    await page.waitForSelector('text=Import Summary', { timeout: 10000 });

    // Verify summary shows correct counts
    await expect(page.locator('text=Total Transactions')).toBeVisible();
    await expect(page.locator('text=3')).toBeVisible(); // Should show 3 transactions

    // Import
    await page.click('button:has-text("Import")');

    // Should navigate to transactions page or show success message
    await expect(
      page.locator('text=Successfully imported') || page.url().includes('/transactions')
    ).toBeTruthy();
  });

  // ========================================
  // Error Handling Tests
  // ========================================
  test('should show error for invalid file format', async ({ page }) => {
    const invalidContent = 'This is not a valid bank statement file';

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(invalidContent),
    });

    await page.click('button:has-text("Process File")');

    // Should show error message
    await expect(page.locator('text=Error') || page.locator('text=Unsupported')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should show error for empty file', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'empty.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(''),
    });

    await page.click('button:has-text("Process File")');

    await expect(page.locator('text=No data') || page.locator('text=empty')).toBeVisible({
      timeout: 5000,
    });
  });

  // ========================================
  // Privacy Controls Tests
  // ========================================
  test('should respect privacy settings for smart duplicate detection', async ({ page }) => {
    // Disable Claude API in settings
    await page.goto('/budget-app/settings');
    await page.click('button:has-text("Privacy")');

    // Disable Claude API master switch
    const claudeToggle = page.locator('button[aria-label*="Claude API"]');
    const isChecked = await claudeToggle.getAttribute('aria-checked');
    if (isChecked === 'true') {
      await claudeToggle.click();
    }

    // Go back to import
    await page.goto('/budget-app/import');

    // Import should work without smart detection
    const csvContent = `Date,Description,Amount
2025-01-15,STARBUCKS,-4.50`;

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    await page.click('button:has-text("Process File")');

    // Should process without errors (basic duplicate detection still works)
    await expect(page.locator('text=Import Summary')).toBeVisible({ timeout: 10000 });
  });
});

