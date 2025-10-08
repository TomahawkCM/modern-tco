import { expect, test } from '@playwright/test';

test.describe('Learn Experimental navigation', () => {
  test('module page loads and links into a lab', async ({ page }) => {
    const moduleResponse = await page.goto('/study/01-learn-experimental?path=learn-experimental');
    expect(moduleResponse?.status()).toBe(200);

    await expect(
      page.getByRole('heading', { name: /Asking Questions \(Learn Experimental Track\)/i })
    ).toBeVisible();

    const practiceLink = page.getByRole('link', { name: /Practice: Build a Sensor Shortlist/i });
    await expect(practiceLink).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/study\/labs\/01-l\/sensor-shortlist/i, { timeout: 15000 }),
      practiceLink.click(),
    ]);

    await expect(
      page.getByRole('heading', { name: /Practice Lab: Sensor Shortlist Sprint/i })
    ).toBeVisible();
  });

  test('deep-linked lab renders without error under the flag', async ({ page }) => {
    const labResponse = await page.goto('/study/labs/02-l/advanced-filtering?path=learn-experimental');
    expect(labResponse?.status()).toBe(200);

    await expect(
      page.getByRole('heading', { name: /Practice Lab: Advanced Filtering Chains/i })
    ).toBeVisible();
  });
});
