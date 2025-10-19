import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

const TARGET_URL = process.env.AXE_TARGET_URL ?? 'http://127.0.0.1:3001/modules/00-tanium-platform-foundation-v2';
const OUTPUT_PATH = process.env.AXE_OUTPUT ?? path.resolve('reports/accessibility/module-00-v2/axe-playwright.json');

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

    const results = await new AxeBuilder({ page, context })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));

    const violationCount = results.violations.length;
    if (violationCount > 0) {
      console.error(`Accessibility violations detected: ${violationCount}`);
      results.violations.forEach((violation) => {
        console.error(`- ${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`);
      });
      process.exitCode = 1;
    } else {
      console.log('No accessibility violations detected by axe-playwright.');
    }
    await context.close();
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error('Axe Playwright run failed:', error);
  process.exitCode = 1;
});
