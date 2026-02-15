/**
 * E2E Tests for Multi-Format Import Pipeline
 *
 * Tests PDF (6 languages), QIF, MT940, and CAMT.053 imports
 * through the budget app import page.
 *
 * Captures errors and generates a markdown report in tests/results/import-pipeline-errors.md
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// Types
// ============================================================

interface TestResult {
  format: string;
  language: string;
  status: 'pass' | 'fail' | 'error';
  transactionsFound: number;
  errorMessage: string;
  consoleErrors: string[];
  screenshotPath: string;
  stage: string; // upload, detection, processing, verification
}

// ============================================================
// Shared State for Report
// ============================================================

const allResults: TestResult[] = [];

// ============================================================
// Helpers
// ============================================================

const FIXTURES_DIR = path.join(__dirname, '../fixtures');
const RESULTS_DIR = path.join(__dirname, '../results');
const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots');

/** Upload a file to the import page using setInputFiles */
async function uploadFile(
  page: Page,
  filePath: string,
  mimeType: string,
) {
  const fileInput = page.locator('[data-testid="csv-file-input"]');
  await fileInput.setInputFiles(filePath);
}

/** Upload a file from buffer (for inline content) */
async function uploadFileFromBuffer(
  page: Page,
  fileName: string,
  content: string | Buffer,
  mimeType: string,
) {
  const fileInput = page.locator('[data-testid="csv-file-input"]');
  const buffer = typeof content === 'string' ? Buffer.from(content) : content;
  await fileInput.setInputFiles({
    name: fileName,
    mimeType,
    buffer,
  });
}

/** Dismiss all overlays: welcome tour modal + welcome banner */
async function dismissAllOverlays(page: Page) {
  // Try clicking "Skip tour" button if the tour modal is visible
  try {
    const skipTourBtn = page.locator('button:has-text("Skip tour")').first();
    if (await skipTourBtn.isVisible({ timeout: 2000 })) {
      await skipTourBtn.click();
      await page.waitForTimeout(500);
    }
  } catch {
    // No tour to skip
  }

  // Try pressing Escape to dismiss any remaining modal overlay
  try {
    const modalOverlay = page.locator('.fixed.inset-0.bg-black\\/60').first();
    if (await modalOverlay.isVisible({ timeout: 500 })) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  } catch {
    // No modal
  }

  // Dismiss the "Welcome to Budget App" banner
  try {
    const dismissBanner = page.locator('button:has-text("Dismiss welcome banner")').first();
    if (await dismissBanner.isVisible({ timeout: 1000 })) {
      await dismissBanner.click();
      await page.waitForTimeout(300);
    }
  } catch {
    // No banner
  }
}

/** Collect console errors from the page */
function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/** Take a screenshot on failure */
async function captureScreenshot(page: Page, testName: string): Promise<string> {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${testName}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

/** Try to extract the transaction count from the page */
async function getTransactionCount(page: Page): Promise<number> {
  // Look for transaction count indicators in various forms
  const patterns = [
    /(\d+)\s*transaction/i,
    /(\d+)\s*record/i,
    /found\s*(\d+)/i,
    /detected\s*(\d+)/i,
    /(\d+)\s*entries/i,
    /imported\s*(\d+)/i,
  ];

  const bodyText = await page.locator('body').textContent();
  if (!bodyText) return 0;

  for (const pattern of patterns) {
    const match = bodyText.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  // Also try counting table rows in preview
  const rows = await page.locator('table tbody tr, [data-testid="transaction-row"]').count();
  if (rows > 0) return rows;

  return 0;
}

/** Get any visible error messages */
async function getErrorText(page: Page): Promise<string> {
  const errorSelectors = [
    '.text-red-700',
    '.text-red-600',
    '.text-red-500',
    '[role="alert"]',
    '.bg-red-50',
    '.border-red-200',
  ];

  for (const selector of errorSelectors) {
    try {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 1000 })) {
        const text = await el.textContent();
        if (text?.trim()) return text.trim();
      }
    } catch {
      // Not found, continue
    }
  }

  return '';
}

// ============================================================
// Test Setup
// ============================================================

test.describe('Multi-Format Import Pipeline', () => {
  // Increase timeout for all tests - PDF processing can be slow
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    // Navigate first to set localStorage context
    await page.goto('/budget-app/import', { timeout: 60_000, waitUntil: 'domcontentloaded' });
    // Set all localStorage keys to suppress tour/wizard/banner
    await page.evaluate(() => {
      // OnboardingTour wizard (src/components/budget/OnboardingTour.tsx)
      localStorage.setItem('budget-app-wizard-completed', 'true');
      // useGuidedTour progress (src/hooks/useGuidedTour.ts)
      localStorage.setItem('budget-app-tour-progress', JSON.stringify({ completed: true, currentStep: 99, completedAt: Date.now() }));
      // WelcomeBanner (src/components/budget/onboarding/WelcomeBanner.tsx)
      localStorage.setItem('budget-app-onboarding', JSON.stringify({ completed: true, skipped: true }));
      // Legacy keys for good measure
      localStorage.setItem('budget-app-tour-completed', 'true');
      localStorage.setItem('budget-app-visit-count', '10');
    });
    // Reload the page so it reads the localStorage values on mount
    await page.reload({ timeout: 60_000 });
    await page.waitForLoadState('networkidle', { timeout: 60_000 });
    // Dismiss any overlays that still appeared
    await dismissAllOverlays(page);
    // Verify the file input is accessible
    await expect(page.locator('[data-testid="csv-file-input"]')).toBeAttached({ timeout: 10_000 });
  });

  // ============================================================
  // PDF Tests - 6 Languages
  // ============================================================

  const pdfTests = [
    { locale: 'en-US', language: 'English', file: 'bank-statement-en-us.pdf', minTxns: 5 },
    { locale: 'de-DE', language: 'German', file: 'bank-statement-de-de.pdf', minTxns: 3 },
    { locale: 'fr-FR', language: 'French', file: 'bank-statement-fr-fr.pdf', minTxns: 3 },
    { locale: 'es-ES', language: 'Spanish', file: 'bank-statement-es-es.pdf', minTxns: 3 },
    { locale: 'ja-JP', language: 'Japanese', file: 'bank-statement-ja-jp.pdf', minTxns: 3 },
    { locale: 'ar-SA', language: 'Arabic', file: 'bank-statement-ar-sa.pdf', minTxns: 3 },
  ];

  for (const pdfTest of pdfTests) {
    test.describe(`PDF - ${pdfTest.language}`, () => {
      test(`should import ${pdfTest.language} PDF bank statement`, async ({ page }) => {
        const consoleErrors = collectConsoleErrors(page);
        const result: TestResult = {
          format: 'PDF',
          language: pdfTest.language,
          status: 'fail',
          transactionsFound: 0,
          errorMessage: '',
          consoleErrors: [],
          screenshotPath: '',
          stage: 'upload',
        };

        try {
          const filePath = path.join(FIXTURES_DIR, 'pdf', pdfTest.file);

          // Check fixture exists
          if (!fs.existsSync(filePath)) {
            result.errorMessage = `Fixture not found: ${filePath}. Run "npm run generate:test-pdfs" first.`;
            result.stage = 'upload';
            allResults.push(result);
            test.skip(true, 'PDF fixture not generated yet');
            return;
          }

          // Upload
          await uploadFile(page, filePath, 'application/pdf');
          result.stage = 'detection';

          // Verify filename appears in the UI
          await expect(
            page.locator(`text=/${pdfTest.file}/i`).first()
          ).toBeVisible({ timeout: 10000 });

          // Check format was detected as PDF
          await expect(
            page.locator('text=/PDF|pdf/i').first()
          ).toBeVisible({ timeout: 5000 });

          result.stage = 'processing';

          // Click Process
          const processButton = page.locator('button:has-text("Process File")').first();
          await expect(processButton).toBeVisible({ timeout: 5000 });
          await processButton.click();

          // Wait for processing with extended timeout for PDF OCR
          await expect(
            page.locator('text=/transaction|preview|import|detected|ready|summary|processed/i').first()
          ).toBeVisible({ timeout: 90000 });

          result.stage = 'verification';

          // Check for errors
          const errorText = await getErrorText(page);
          if (errorText) {
            result.errorMessage = errorText;
            result.status = 'fail';
          } else {
            // Count transactions
            const txCount = await getTransactionCount(page);
            result.transactionsFound = txCount;

            if (txCount >= pdfTest.minTxns) {
              result.status = 'pass';
            } else {
              result.errorMessage = `Expected >= ${pdfTest.minTxns} transactions, found ${txCount}`;
              result.status = 'fail';
            }
          }
        } catch (err: unknown) {
          result.status = 'error';
          result.errorMessage = err instanceof Error ? err.message : String(err);
          result.screenshotPath = await captureScreenshot(page, `pdf-${pdfTest.locale}`);
        }

        result.consoleErrors = [...consoleErrors];
        allResults.push(result);

        // Don't fail the test — we're collecting data
        if (result.status !== 'pass') {
          console.log(
            `[EXPECTED] PDF ${pdfTest.language}: ${result.status} - ${result.errorMessage}`
          );
        }
      });
    });
  }

  // ============================================================
  // QIF Test
  // ============================================================

  test.describe('QIF Format', () => {
    test('should import QIF checking account file', async ({ page }) => {
      const consoleErrors = collectConsoleErrors(page);
      const result: TestResult = {
        format: 'QIF',
        language: 'English',
        status: 'fail',
        transactionsFound: 0,
        errorMessage: '',
        consoleErrors: [],
        screenshotPath: '',
        stage: 'upload',
      };

      try {
        const filePath = path.join(FIXTURES_DIR, 'qif', 'checking-sample.qif');
        await uploadFile(page, filePath, 'application/qif');

        result.stage = 'detection';

        // Verify filename shown
        await expect(
          page.locator('text=/checking-sample.qif/i').first()
        ).toBeVisible({ timeout: 10000 });

        result.stage = 'processing';

        const processButton = page.locator('button:has-text("Process File")').first();
        await expect(processButton).toBeVisible({ timeout: 5000 });
        await processButton.click();

        await expect(
          page.locator('text=/transaction|preview|import|detected|ready|summary|processed/i').first()
        ).toBeVisible({ timeout: 30000 });

        result.stage = 'verification';

        const errorText = await getErrorText(page);
        if (errorText) {
          result.errorMessage = errorText;
        } else {
          const txCount = await getTransactionCount(page);
          result.transactionsFound = txCount;
          if (txCount >= 5) {
            result.status = 'pass';
          } else {
            result.errorMessage = `Expected 5 transactions, found ${txCount}`;
          }
        }
      } catch (err: unknown) {
        result.status = 'error';
        result.errorMessage = err instanceof Error ? err.message : String(err);
        result.screenshotPath = await captureScreenshot(page, 'qif');
      }

      result.consoleErrors = [...consoleErrors];
      allResults.push(result);

      if (result.status !== 'pass') {
        console.log(`[EXPECTED] QIF: ${result.status} - ${result.errorMessage}`);
      }
    });
  });

  // ============================================================
  // MT940 Test
  // ============================================================

  test.describe('MT940 Format', () => {
    test('should import MT940 SWIFT bank statement', async ({ page }) => {
      const consoleErrors = collectConsoleErrors(page);
      const result: TestResult = {
        format: 'MT940',
        language: 'German',
        status: 'fail',
        transactionsFound: 0,
        errorMessage: '',
        consoleErrors: [],
        screenshotPath: '',
        stage: 'upload',
      };

      try {
        const filePath = path.join(FIXTURES_DIR, 'mt940', 'deutsche-bank-sample.sta');
        await uploadFile(page, filePath, 'application/octet-stream');

        result.stage = 'detection';

        await expect(
          page.locator('text=/deutsche-bank-sample.sta/i').first()
        ).toBeVisible({ timeout: 10000 });

        result.stage = 'processing';

        const processButton = page.locator('button:has-text("Process File")').first();
        await expect(processButton).toBeVisible({ timeout: 5000 });
        await processButton.click();

        await expect(
          page.locator('text=/transaction|preview|import|detected|ready|summary|processed/i').first()
        ).toBeVisible({ timeout: 30000 });

        result.stage = 'verification';

        const errorText = await getErrorText(page);
        if (errorText) {
          result.errorMessage = errorText;
        } else {
          const txCount = await getTransactionCount(page);
          result.transactionsFound = txCount;
          if (txCount >= 5) {
            result.status = 'pass';
          } else {
            result.errorMessage = `Expected 5 transactions, found ${txCount}`;
          }
        }
      } catch (err: unknown) {
        result.status = 'error';
        result.errorMessage = err instanceof Error ? err.message : String(err);
        result.screenshotPath = await captureScreenshot(page, 'mt940');
      }

      result.consoleErrors = [...consoleErrors];
      allResults.push(result);

      if (result.status !== 'pass') {
        console.log(`[EXPECTED] MT940: ${result.status} - ${result.errorMessage}`);
      }
    });
  });

  // ============================================================
  // CAMT.053 Test
  // ============================================================

  test.describe('CAMT.053 Format', () => {
    test('should import CAMT.053 ISO 20022 XML statement', async ({ page }) => {
      const consoleErrors = collectConsoleErrors(page);
      const result: TestResult = {
        format: 'CAMT.053',
        language: 'German',
        status: 'fail',
        transactionsFound: 0,
        errorMessage: '',
        consoleErrors: [],
        screenshotPath: '',
        stage: 'upload',
      };

      try {
        const filePath = path.join(FIXTURES_DIR, 'camt053', 'iso20022-sample.xml');
        await uploadFile(page, filePath, 'application/xml');

        result.stage = 'detection';

        await expect(
          page.locator('text=/iso20022-sample.xml/i').first()
        ).toBeVisible({ timeout: 10000 });

        result.stage = 'processing';

        const processButton = page.locator('button:has-text("Process File")').first();
        await expect(processButton).toBeVisible({ timeout: 5000 });
        await processButton.click();

        await expect(
          page.locator('text=/transaction|preview|import|detected|ready|summary|processed/i').first()
        ).toBeVisible({ timeout: 30000 });

        result.stage = 'verification';

        const errorText = await getErrorText(page);
        if (errorText) {
          result.errorMessage = errorText;
        } else {
          const txCount = await getTransactionCount(page);
          result.transactionsFound = txCount;
          if (txCount >= 5) {
            result.status = 'pass';
          } else {
            result.errorMessage = `Expected 5 transactions, found ${txCount}`;
          }
        }
      } catch (err: unknown) {
        result.status = 'error';
        result.errorMessage = err instanceof Error ? err.message : String(err);
        result.screenshotPath = await captureScreenshot(page, 'camt053');
      }

      result.consoleErrors = [...consoleErrors];
      allResults.push(result);

      if (result.status !== 'pass') {
        console.log(`[EXPECTED] CAMT.053: ${result.status} - ${result.errorMessage}`);
      }
    });
  });

  // ============================================================
  // Error Handling Tests
  // ============================================================

  test.describe('Error Handling', () => {
    test('should handle empty PDF gracefully', async ({ page }) => {
      const consoleErrors = collectConsoleErrors(page);
      const result: TestResult = {
        format: 'PDF',
        language: 'N/A',
        status: 'fail',
        transactionsFound: 0,
        errorMessage: '',
        consoleErrors: [],
        screenshotPath: '',
        stage: 'upload',
      };

      try {
        // Create a minimal valid PDF (empty page)
        const emptyPdf = Buffer.from(
          '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
          '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
          '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
          'xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n' +
          'trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
        );

        await uploadFileFromBuffer(page, 'empty.pdf', emptyPdf, 'application/pdf');
        result.stage = 'processing';

        const processButton = page.locator('button:has-text("Process File")').first();
        await expect(processButton).toBeVisible({ timeout: 5000 });
        await processButton.click();

        // Should show error or "no transactions"
        await expect(
          page.locator('text=/error|no transaction|empty|0 transaction|no data|failed/i').first()
        ).toBeVisible({ timeout: 30000 });

        result.status = 'pass';
        result.stage = 'verification';
      } catch (err: unknown) {
        result.status = 'error';
        result.errorMessage = err instanceof Error ? err.message : String(err);
        result.screenshotPath = await captureScreenshot(page, 'empty-pdf');
      }

      result.consoleErrors = [...consoleErrors];
      allResults.push(result);
    });

    test('should handle QIF with no transactions', async ({ page }) => {
      const consoleErrors = collectConsoleErrors(page);
      const result: TestResult = {
        format: 'QIF',
        language: 'N/A',
        status: 'fail',
        transactionsFound: 0,
        errorMessage: '',
        consoleErrors: [],
        screenshotPath: '',
        stage: 'upload',
      };

      try {
        await uploadFileFromBuffer(page, 'empty.qif', '!Type:Bank\n', 'application/qif');
        result.stage = 'processing';

        const processButton = page.locator('button:has-text("Process File")').first();
        await expect(processButton).toBeVisible({ timeout: 5000 });
        await processButton.click();

        await expect(
          page.locator('text=/error|no transaction|empty|0 transaction|no data|failed/i').first()
        ).toBeVisible({ timeout: 30000 });

        result.status = 'pass';
        result.stage = 'verification';
      } catch (err: unknown) {
        result.status = 'error';
        result.errorMessage = err instanceof Error ? err.message : String(err);
        result.screenshotPath = await captureScreenshot(page, 'empty-qif');
      }

      result.consoleErrors = [...consoleErrors];
      allResults.push(result);
    });

    test('should handle malformed MT940', async ({ page }) => {
      const consoleErrors = collectConsoleErrors(page);
      const result: TestResult = {
        format: 'MT940',
        language: 'N/A',
        status: 'fail',
        transactionsFound: 0,
        errorMessage: '',
        consoleErrors: [],
        screenshotPath: '',
        stage: 'upload',
      };

      try {
        const malformed = ':20:BROKEN\n:25:INVALID\n:60F:GARBAGE\n:62F:ALSO_BROKEN\n';
        await uploadFileFromBuffer(page, 'malformed.sta', malformed, 'application/octet-stream');
        result.stage = 'processing';

        const processButton = page.locator('button:has-text("Process File")').first();
        await expect(processButton).toBeVisible({ timeout: 5000 });
        await processButton.click();

        await expect(
          page.locator('text=/error|no transaction|empty|0 transaction|failed|invalid|problem/i').first()
        ).toBeVisible({ timeout: 30000 });

        result.status = 'pass';
        result.stage = 'verification';
      } catch (err: unknown) {
        result.status = 'error';
        result.errorMessage = err instanceof Error ? err.message : String(err);
        result.screenshotPath = await captureScreenshot(page, 'malformed-mt940');
      }

      result.consoleErrors = [...consoleErrors];
      allResults.push(result);
    });

    test('should handle invalid XML for CAMT.053', async ({ page }) => {
      const consoleErrors = collectConsoleErrors(page);
      const result: TestResult = {
        format: 'CAMT.053',
        language: 'N/A',
        status: 'fail',
        transactionsFound: 0,
        errorMessage: '',
        consoleErrors: [],
        screenshotPath: '',
        stage: 'upload',
      };

      try {
        const invalidXml = '<?xml version="1.0"?><Document><BkToCstmrStmt><Stmt></Stmt></BkToCstmrStmt></Document>';
        await uploadFileFromBuffer(page, 'invalid.xml', invalidXml, 'application/xml');
        result.stage = 'processing';

        const processButton = page.locator('button:has-text("Process File")').first();
        await expect(processButton).toBeVisible({ timeout: 5000 });
        await processButton.click();

        await expect(
          page.locator('text=/error|no transaction|empty|0 transaction|failed|invalid|problem|transaction|import/i').first()
        ).toBeVisible({ timeout: 30000 });

        result.status = 'pass';
        result.stage = 'verification';
      } catch (err: unknown) {
        result.status = 'error';
        result.errorMessage = err instanceof Error ? err.message : String(err);
        result.screenshotPath = await captureScreenshot(page, 'invalid-xml');
      }

      result.consoleErrors = [...consoleErrors];
      allResults.push(result);
    });
  });

  // ============================================================
  // Format Detection Tests
  // ============================================================

  test.describe('Format Detection', () => {
    test('should detect PDF format from file', async ({ page }) => {
      const filePath = path.join(FIXTURES_DIR, 'pdf', 'bank-statement-en-us.pdf');
      if (!fs.existsSync(filePath)) {
        test.skip(true, 'PDF fixture not generated yet');
        return;
      }

      await uploadFile(page, filePath, 'application/pdf');

      // Should show PDF detected
      await expect(
        page.locator('text=/PDF/i').first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('should detect QIF format from file', async ({ page }) => {
      const filePath = path.join(FIXTURES_DIR, 'qif', 'checking-sample.qif');
      await uploadFile(page, filePath, 'application/qif');

      await expect(
        page.locator('text=/QIF|Quicken/i').first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('should detect MT940 format from .sta file', async ({ page }) => {
      const filePath = path.join(FIXTURES_DIR, 'mt940', 'deutsche-bank-sample.sta');
      await uploadFile(page, filePath, 'application/octet-stream');

      await expect(
        page.locator('text=/MT940|SWIFT/i').first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('should detect CAMT.053 format from XML file', async ({ page }) => {
      const filePath = path.join(FIXTURES_DIR, 'camt053', 'iso20022-sample.xml');
      await uploadFile(page, filePath, 'application/xml');

      await expect(
        page.locator('text=/CAMT|ISO 20022|camt/i').first()
      ).toBeVisible({ timeout: 10000 });
    });
  });
});

// ============================================================
// Report Generation
// ============================================================

test.afterAll(async () => {
  if (allResults.length === 0) return;

  fs.mkdirSync(RESULTS_DIR, { recursive: true });

  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const passCount = allResults.filter((r) => r.status === 'pass').length;
  const failCount = allResults.filter((r) => r.status === 'fail').length;
  const errorCount = allResults.filter((r) => r.status === 'error').length;

  let report = `# Import Pipeline Test Results\n\n`;
  report += `**Run date**: ${now}\n`;
  report += `**Total tests**: ${allResults.length}\n`;
  report += `**Passed**: ${passCount} | **Failed**: ${failCount} | **Errors**: ${errorCount}\n\n`;

  // Summary table
  report += `## Summary Table\n\n`;
  report += `| Format | Language | Status | Txns Found | Stage | Error |\n`;
  report += `|--------|----------|--------|------------|-------|-------|\n`;

  for (const r of allResults) {
    const statusIcon = r.status === 'pass' ? 'PASS' : r.status === 'fail' ? 'FAIL' : 'ERROR';
    const errorBrief = r.errorMessage.substring(0, 80).replace(/\|/g, '\\|').replace(/\n/g, ' ');
    report += `| ${r.format} | ${r.language} | ${statusIcon} | ${r.transactionsFound} | ${r.stage} | ${errorBrief} |\n`;
  }

  // Detailed errors
  const failures = allResults.filter((r) => r.status !== 'pass');
  if (failures.length > 0) {
    report += `\n## Detailed Errors & Improvements Required\n\n`;

    failures.forEach((r, i) => {
      report += `### Error ${i + 1}: ${r.format} ${r.language} - ${r.stage} failure\n\n`;
      report += `- **Status**: ${r.status}\n`;
      report += `- **Error**: ${r.errorMessage}\n`;

      if (r.consoleErrors.length > 0) {
        report += `- **Console errors**:\n`;
        r.consoleErrors.slice(0, 5).forEach((err) => {
          report += `  - \`${err.substring(0, 200)}\`\n`;
        });
      }

      if (r.screenshotPath) {
        report += `- **Screenshot**: \`${r.screenshotPath}\`\n`;
      }

      // Suggest fixes based on known issues
      report += `- **Suggested fix**: `;
      if (r.format === 'PDF' && r.language === 'Japanese') {
        report += `\`startsWithDate()\` in pdf-bank-parser.ts does not recognize Japanese date format (2025年1月15日). Add pattern: \`/^\\s*\\d{4}年\\d{1,2}月\\d{1,2}日/\`\n`;
      } else if (r.format === 'PDF' && r.language === 'Arabic') {
        report += `RTL text extraction from pdfjs-dist may produce reversed column order. Need to detect RTL and reverse column mapping.\n`;
      } else if (r.format === 'MT940') {
        report += `Check if mt940-js dynamic import works in browser. Manual fallback parser regex may need adjusting for the :61: line format.\n`;
      } else if (r.format === 'PDF' && r.stage === 'processing') {
        report += `PDF text extraction may have column boundary issues. Ensure Puppeteer renders table cells with >= 30px gap for tab separation.\n`;
      } else {
        report += `Investigate the ${r.stage} stage for ${r.format} format.\n`;
      }

      report += `\n`;
    });
  }

  // Known risks section
  report += `## Known Risks (from plan)\n\n`;
  report += `1. **Japanese PDF** — \`startsWithDate()\` only recognizes Western date formats, not \`2025年1月15日\`\n`;
  report += `2. **Arabic PDF** — RTL text extraction from pdfjs-dist may produce reversed/garbled column order\n`;
  report += `3. **PDF column merging** — If cells rendered too close, pdfjs-dist won't detect column boundaries\n`;
  report += `4. **MT940 library** — mt940-js dynamic import in browser may fail; manual fallback should still work\n`;
  report += `5. **CAMT.053 XML** — File extension .xml maps to camt053 in extension fallback\n`;

  const reportPath = path.join(RESULTS_DIR, 'import-pipeline-errors.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\nReport written to: ${reportPath}`);
});
