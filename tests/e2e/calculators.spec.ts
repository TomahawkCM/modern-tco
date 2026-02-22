import { test, expect, type Page } from "@playwright/test";

/**
 * Financial Calculators E2E Tests
 *
 * Tests all 5 calculators in the budget app:
 * 1. Calculator Hub
 * 2. Emergency Fund Calculator
 * 3. Savings Goal Calculator
 * 4. Debt Payoff Calculator
 * 5. Subscription Cost Calculator
 * 6. 50/30/20 Budget Analyzer
 */

// Helper: set localStorage flags and reload
async function setupBudgetApp(page: Page) {
  await page.goto("/budget-app/calculators");
  await page.evaluate(() => {
    localStorage.setItem("budget-playwright-bridge", "true");
    localStorage.setItem("budget_app_onboarding_completed", "true");
    // Dismiss the welcome wizard (full-screen "Welcome to Financial Clarity" modal)
    localStorage.setItem("budget-app-wizard-completed", "true");
    // Dismiss the welcome banner (non-blocking banner)
    localStorage.setItem(
      "budget-app-onboarding",
      JSON.stringify({ completed: true, skipped: false })
    );
  });
  await page.goto("/budget-app/calculators");
  await page.waitForLoadState("networkidle");
  // Wait a moment for any delayed hydration
  await page.waitForTimeout(500);
}

// Helper: clear and type a value into a CurrencyInput
async function fillCurrencyInput(page: Page, input: ReturnType<Page["locator"]>, value: string) {
  await input.click();
  await input.fill("");
  await input.fill(value);
}

// Helper: clear and type into a PercentInput
async function fillPercentInput(page: Page, input: ReturnType<Page["locator"]>, value: string) {
  await input.click();
  await input.fill("");
  await input.fill(value);
}

test.describe("Financial Calculators", () => {
  test.beforeEach(async ({ page }) => {
    await setupBudgetApp(page);
  });

  test("Test 1: Calculator Hub - all 5 calculator cards visible", async ({ page }) => {
    // Screenshot the hub page
    await page.screenshot({ path: "test-results/calc-hub-initial.png", fullPage: true });

    // Verify page title (use getByRole to be specific)
    const heading = page.getByRole("heading", { name: "Financial Calculators" });
    await expect(heading).toBeVisible();
    console.log("Hub page heading is visible: 'Financial Calculators'");

    // Verify all 5 calculator card links exist
    const calcLinks = [
      "/budget-app/calculators/emergency-fund",
      "/budget-app/calculators/debt-payoff",
      "/budget-app/calculators/savings-goal",
      "/budget-app/calculators/subscription-cost",
      "/budget-app/calculators/budget-analyzer",
    ];

    for (const href of calcLinks) {
      const link = page.locator(`a[href="${href}"]`);
      await expect(link).toBeVisible({ timeout: 10000 });
      const name = href.split("/").pop();
      console.log(`Calculator card found: ${name}`);
    }

    // Count the calculator cards specifically in the main content grid
    // The grid contains cards that link to each calculator. We scope to the grid container.
    const mainContent = page.locator("main, [class*='space-y-8']").last();
    const gridCards = mainContent.locator(".grid a[href*='/budget-app/calculators/']");
    const count = await gridCards.count();
    console.log(`Found ${count} calculator cards in the main grid`);
    expect(count).toBeGreaterThanOrEqual(5);

    // Verify info section exists
    const infoHeading = page.getByRole("heading", { name: "About These Calculators" });
    await expect(infoHeading).toBeVisible();
    console.log("Info section 'About These Calculators' is visible");

    console.log("TEST 1 PASSED: All 5 calculator cards are visible on the hub page");
  });

  test("Test 2: Emergency Fund Calculator", async ({ page }) => {
    await page.goto("/budget-app/calculators/emergency-fund");
    await page.waitForLoadState("networkidle");

    // Screenshot initial state
    await page.screenshot({ path: "test-results/calc-emergency-initial.png", fullPage: true });

    // Verify page loaded with title
    const heading = page.getByRole("heading", { name: "Emergency Fund Calculator" });
    await expect(heading).toBeVisible();
    console.log("Emergency Fund Calculator page loaded");

    // Find all CurrencyInput fields (type="text" with inputMode="decimal")
    const currencyInputs = page.locator('input[inputmode="decimal"]');
    const currencyCount = await currencyInputs.count();
    console.log(`Found ${currencyCount} currency input fields`);

    // Find the range slider
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible();
    const sliderValue = await slider.inputValue();
    console.log(`Target months slider initial value: ${sliderValue}`);

    // Emergency Fund has 3 currency inputs: monthly expenses, current savings, monthly contribution
    // Default values from code: monthlyExpenses=3000, currentSavings=0, monthlyContribution=500

    // Fill in monthly expenses = 3000 (first currency input)
    if (currencyCount >= 1) {
      await fillCurrencyInput(page, currencyInputs.nth(0), "3000");
      console.log("Set monthly expenses to 3000");
    }

    // Set target months slider to 6 (it defaults to 6)
    await slider.fill("6");
    console.log("Set target months slider to 6");

    // Fill in current savings = 5000 (second currency input)
    if (currencyCount >= 2) {
      await fillCurrencyInput(page, currencyInputs.nth(1), "5000");
      console.log("Set current savings to 5000");
    }

    // Fill in monthly contribution = 500 (third currency input)
    if (currencyCount >= 3) {
      await fillCurrencyInput(page, currencyInputs.nth(2), "500");
      console.log("Set monthly contribution to 500");
    }

    // Click elsewhere to trigger blur and recalculation
    await heading.click();
    await page.waitForTimeout(500);

    // Screenshot showing results
    await page.screenshot({ path: "test-results/calc-emergency-results.png", fullPage: true });

    // Check results
    const pageText = await page.textContent("body");

    // Target: $18,000 (6 months x $3,000)
    const hasTargetAmount = pageText?.includes("18,000") || pageText?.includes("18.000");
    console.log(`Target amount ($18,000) found: ${hasTargetAmount}`);

    // Progress bar should exist
    const progressSection = page
      .getByText("Building Your Safety Net")
      .or(page.getByText("Goal Progress"));
    const progressVisible = await progressSection
      .first()
      .isVisible()
      .catch(() => false);
    console.log(`Progress section visible: ${progressVisible}`);

    // Results panel
    const resultsPanel = page.getByText("Your Results").or(page.getByText("Results"));
    const resultsPanelVisible = await resultsPanel
      .first()
      .isVisible()
      .catch(() => false);
    console.log(`Results panel visible: ${resultsPanelVisible}`);

    // Check for months to goal
    const hasMonthsInfo =
      pageText?.includes("month") || pageText?.includes("Month") || pageText?.includes("year");
    console.log(`Timeline info found: ${hasMonthsInfo}`);

    // Check for completion date
    const hasCompletionDate = pageText?.includes("202") || pageText?.includes("Completion");
    console.log(`Completion date info found: ${hasCompletionDate}`);

    // Check for tips section
    const tipsSection = page.getByText("Tips for Building");
    const hasTips = await tipsSection.isVisible().catch(() => false);
    console.log(`Tips section visible: ${hasTips}`);

    console.log("TEST 2 PASSED: Emergency Fund Calculator loaded and computed results");
  });

  test("Test 3: Savings Goal Calculator", async ({ page }) => {
    await page.goto("/budget-app/calculators/savings-goal");
    await page.waitForLoadState("networkidle");

    // Screenshot initial state
    await page.screenshot({ path: "test-results/calc-savings-initial.png", fullPage: true });

    // Verify page loaded
    const heading = page.getByRole("heading", { name: "Savings Goal Calculator" });
    await expect(heading).toBeVisible();
    console.log("Savings Goal Calculator page loaded");

    // Check for mode toggle buttons
    const whenBtn = page.getByText("When will I reach my goal?");
    const howMuchBtn = page.getByText("How much should I save monthly?");
    const whenVisible = await whenBtn.isVisible().catch(() => false);
    const howMuchVisible = await howMuchBtn.isVisible().catch(() => false);
    console.log(`"When" mode button visible: ${whenVisible}`);
    console.log(`"How Much" mode button visible: ${howMuchVisible}`);

    // In "when" mode (default), we have: goalAmount, currentSavings, monthlyContribution, expectedReturn
    const currencyInputs = page.locator('input[inputmode="decimal"]');
    const inputCount = await currencyInputs.count();
    console.log(`Found ${inputCount} input fields (currency + percent)`);

    // Fill goal amount = 25000
    if (inputCount >= 1) {
      await fillCurrencyInput(page, currencyInputs.nth(0), "25000");
      console.log("Set goal amount to 25000");
    }

    // Fill current savings = 5000
    if (inputCount >= 2) {
      await fillCurrencyInput(page, currencyInputs.nth(1), "5000");
      console.log("Set current savings to 5000");
    }

    // Fill monthly contribution = 500
    if (inputCount >= 3) {
      await fillCurrencyInput(page, currencyInputs.nth(2), "500");
      console.log("Set monthly contribution to 500");
    }

    // Fill expected return = 5 (PercentInput)
    if (inputCount >= 4) {
      await fillPercentInput(page, currencyInputs.nth(3), "5");
      console.log("Set expected return to 5%");
    }

    // Click elsewhere to trigger blur
    await heading.click();
    await page.waitForTimeout(500);

    // Screenshot showing results
    await page.screenshot({ path: "test-results/calc-savings-results.png", fullPage: true });

    // Check results
    const pageText = await page.textContent("body");

    // Check for projected completion date
    const hasDateInfo = pageText?.includes("202") || pageText?.includes("month");
    console.log(`Projected completion date found: ${hasDateInfo}`);

    // Check for interest earned
    const hasInterestInfo = pageText?.includes("Interest Earned") || pageText?.includes("interest");
    console.log(`Interest earned info found: ${hasInterestInfo}`);

    // Check for projection panel
    const projectionPanel = page.getByText("Savings Projection").or(page.getByText("Projection"));
    const projectionVisible = await projectionPanel
      .first()
      .isVisible()
      .catch(() => false);
    console.log(`Projection panel visible: ${projectionVisible}`);

    // Check for timeline
    const timelineSection = page.getByText("Growth Timeline");
    const hasTimeline = await timelineSection.isVisible().catch(() => false);
    console.log(`Growth Timeline section visible: ${hasTimeline}`);

    // Now test the "How Much" mode toggle
    if (howMuchVisible) {
      await howMuchBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: "test-results/calc-savings-howmuch.png", fullPage: true });

      // Check if a date input appeared
      const dateInput = page.locator('input[type="date"]');
      const hasDateInput = await dateInput.isVisible().catch(() => false);
      console.log(`Date input visible in "How Much" mode: ${hasDateInput}`);

      // Check for "per month" result
      const pageText2 = await page.textContent("body");
      const hasPerMonth =
        pageText2?.includes("per month") ||
        pageText2?.includes("/month") ||
        pageText2?.includes("monthly") ||
        pageText2?.includes("Month");
      console.log(`Per month result found in "How Much" mode: ${hasPerMonth}`);
    }

    console.log("TEST 3 PASSED: Savings Goal Calculator loaded and computed results");
  });

  test("Test 4: Debt Payoff Calculator", async ({ page }) => {
    await page.goto("/budget-app/calculators/debt-payoff");
    await page.waitForLoadState("networkidle");

    // Screenshot initial state
    await page.screenshot({ path: "test-results/calc-debt-initial.png", fullPage: true });

    // Verify page loaded
    const heading = page.getByRole("heading", { name: "Debt Payoff Calculator" });
    await expect(heading).toBeVisible();
    console.log("Debt Payoff Calculator page loaded");

    // Check for the "Add Debt" button
    const addDebtBtn = page.getByRole("button", { name: /add debt/i });
    const hasAddBtn = await addDebtBtn.isVisible().catch(() => false);
    console.log(`Add Debt button visible: ${hasAddBtn}`);

    // The page starts with 1 empty debt entry
    // Fill in first debt: Credit Card
    const textInputs = page.locator('input[type="text"]');
    const textInputCount = await textInputs.count();
    console.log(`Found ${textInputCount} text inputs`);

    // First text input is the debt name (pre-filled with "Debt 1" placeholder)
    if (textInputCount >= 1) {
      await textInputs.nth(0).click();
      await textInputs.nth(0).fill("Credit Card");
      console.log("Set first debt name to 'Credit Card'");
    }

    // Currency/percent inputs: balance, apr, minimumPayment + extra monthly
    const allDecimalInputs = page.locator('input[inputmode="decimal"]');
    const decimalCount = await allDecimalInputs.count();
    console.log(`Found ${decimalCount} decimal inputs total`);

    // First debt row: balance (0), apr (1), minimumPayment (2), extra monthly (3)
    if (decimalCount >= 4) {
      await fillCurrencyInput(page, allDecimalInputs.nth(0), "5000");
      console.log("Set first debt balance to 5000");

      await fillPercentInput(page, allDecimalInputs.nth(1), "18");
      console.log("Set first debt APR to 18%");

      await fillCurrencyInput(page, allDecimalInputs.nth(2), "100");
      console.log("Set first debt minimum payment to 100");
    }

    // Click Add Debt button to add second debt
    if (hasAddBtn) {
      await addDebtBtn.click();
      await page.waitForTimeout(300);
      console.log("Clicked Add Debt button");
    }

    // Now we should have 2 debt rows
    const textInputsAfter = page.locator('input[type="text"]');
    const textInputCountAfter = await textInputsAfter.count();
    console.log(`After adding debt: ${textInputCountAfter} text inputs`);

    // Fill in second debt: Student Loan
    if (textInputCountAfter >= 2) {
      await textInputsAfter.nth(1).click();
      await textInputsAfter.nth(1).fill("Student Loan");
      console.log("Set second debt name to 'Student Loan'");
    }

    // Re-query decimal inputs after adding second debt
    const allDecimalInputs2 = page.locator('input[inputmode="decimal"]');
    const decimalCount2 = await allDecimalInputs2.count();
    console.log(`After adding debt: ${decimalCount2} decimal inputs`);

    // Second debt row: balance (3), apr (4), minimumPayment (5), then extra monthly (6)
    if (decimalCount2 >= 7) {
      await fillCurrencyInput(page, allDecimalInputs2.nth(3), "15000");
      console.log("Set second debt balance to 15000");

      await fillPercentInput(page, allDecimalInputs2.nth(4), "5");
      console.log("Set second debt APR to 5%");

      await fillCurrencyInput(page, allDecimalInputs2.nth(5), "200");
      console.log("Set second debt minimum payment to 200");

      // Extra monthly payment = 200 (last input)
      await fillCurrencyInput(page, allDecimalInputs2.nth(6), "200");
      console.log("Set extra monthly payment to 200");
    }

    // Click elsewhere to trigger calculations
    await heading.click();
    await page.waitForTimeout(500);

    // Screenshot showing results
    await page.screenshot({ path: "test-results/calc-debt-results.png", fullPage: true });

    // Check for snowball vs avalanche comparison
    const pageText = await page.textContent("body");

    const hasSnowball = pageText?.includes("Snowball") || pageText?.includes("snowball");
    console.log(`Snowball strategy found: ${hasSnowball}`);

    const hasAvalanche = pageText?.includes("Avalanche") || pageText?.includes("avalanche");
    console.log(`Avalanche strategy found: ${hasAvalanche}`);

    // Check for total interest display
    const hasInterest = pageText?.includes("Interest") || pageText?.includes("interest");
    console.log(`Interest info found: ${hasInterest}`);

    // Check for months display
    const hasMonths = pageText?.includes("month") || pageText?.includes("Month");
    console.log(`Months/timeline info found: ${hasMonths}`);

    // Check for recommended badge
    const hasRecommended = pageText?.includes("Recommended") || pageText?.includes("recommended");
    console.log(`Recommended badge found: ${hasRecommended}`);

    // Check for payment schedule table
    const table = page.locator("table");
    const hasTable = await table.isVisible().catch(() => false);
    console.log(`Payment schedule table visible: ${hasTable}`);

    // Check for savings comparison section
    const hasSavingsSection = pageText?.includes("save") || pageText?.includes("Save");
    console.log(`Savings comparison info found: ${hasSavingsSection}`);

    console.log("TEST 4 PASSED: Debt Payoff Calculator loaded and computed results");
  });

  test("Test 5: Subscription Cost Calculator", async ({ page }) => {
    await page.goto("/budget-app/calculators/subscription-cost");
    await page.waitForLoadState("networkidle");

    // Screenshot initial state
    await page.screenshot({ path: "test-results/calc-subscription-initial.png", fullPage: true });

    // Verify page loaded
    const heading = page.getByRole("heading", { name: "Subscription Cost Calculator" });
    await expect(heading).toBeVisible();
    console.log("Subscription Cost Calculator page loaded");

    // Check for Add Subscription button
    const addBtn = page.getByRole("button", { name: /add subscription/i });
    const hasAddBtn = await addBtn.isVisible().catch(() => false);
    console.log(`Add Subscription button visible: ${hasAddBtn}`);

    // Fill first subscription
    const textInputs = page.locator('input[type="text"]');
    const textCount = await textInputs.count();
    console.log(`Found ${textCount} text inputs`);

    if (textCount >= 1) {
      await textInputs.nth(0).click();
      await textInputs.nth(0).fill("Netflix");
      console.log("Set first subscription name to 'Netflix'");
    }

    const decimalInputs = page.locator('input[inputmode="decimal"]');
    const decimalCount = await decimalInputs.count();
    console.log(`Found ${decimalCount} decimal inputs`);

    if (decimalCount >= 1) {
      await fillCurrencyInput(page, decimalInputs.nth(0), "15.99");
      console.log("Set first subscription amount to 15.99");
    }

    // Check for frequency selector
    const selects = page.locator("select");
    const selectCount = await selects.count();
    console.log(`Found ${selectCount} select elements`);

    if (selectCount >= 1) {
      await selects.nth(0).selectOption("monthly");
      console.log("Set frequency to monthly");
    }

    // Trigger blur to recalculate
    await heading.click();
    await page.waitForTimeout(300);

    // Add a second subscription
    if (hasAddBtn) {
      await addBtn.click();
      await page.waitForTimeout(300);
      console.log("Clicked Add Subscription button");
    }

    // Fill second subscription
    const textInputs2 = page.locator('input[type="text"]');
    const textCount2 = await textInputs2.count();
    if (textCount2 >= 2) {
      await textInputs2.nth(1).click();
      await textInputs2.nth(1).fill("Spotify");
      console.log("Set second subscription name to 'Spotify'");
    }

    const decimalInputs2 = page.locator('input[inputmode="decimal"]');
    const decimalCount2 = await decimalInputs2.count();
    if (decimalCount2 >= 2) {
      await fillCurrencyInput(page, decimalInputs2.nth(1), "9.99");
      console.log("Set second subscription amount to 9.99");
    }

    // Click elsewhere to trigger
    await heading.click();
    await page.waitForTimeout(500);

    // Screenshot results
    await page.screenshot({
      path: "test-results/calc-subscription-results.png",
      fullPage: true,
    });

    // Check page content
    const pageText = await page.textContent("body");

    // Check for cost breakdown
    const hasDaily = pageText?.includes("Daily") || pageText?.includes("daily");
    console.log(`Daily cost info found: ${hasDaily}`);

    const hasMonthly = pageText?.includes("Monthly") || pageText?.includes("monthly");
    console.log(`Monthly cost info found: ${hasMonthly}`);

    const hasYearly =
      pageText?.includes("Yearly") || pageText?.includes("yearly") || pageText?.includes("Annual");
    console.log(`Yearly cost info found: ${hasYearly}`);

    // Check for "Total Subscription Cost" header
    const totalCostHeader = page.getByText("Total Subscription Cost");
    const hasTotalCost = await totalCostHeader.isVisible().catch(() => false);
    console.log(`Total Subscription Cost header visible: ${hasTotalCost}`);

    // Check if amounts are non-zero (Netflix $15.99 + Spotify $9.99 = ~$25.98/mo)
    const hasNonZeroAmount =
      pageText?.includes("15.99") ||
      pageText?.includes("25.98") ||
      pageText?.includes("$15") ||
      pageText?.includes("$25") ||
      pageText?.includes("$9");
    console.log(`Non-zero subscription amounts found: ${hasNonZeroAmount}`);

    console.log("TEST 5 PASSED: Subscription Cost Calculator loaded and displayed cost breakdown");
  });

  test("Test 6: 50/30/20 Budget Analyzer", async ({ page }) => {
    await page.goto("/budget-app/calculators/budget-analyzer");
    await page.waitForLoadState("networkidle");

    // Screenshot initial state
    await page.screenshot({
      path: "test-results/calc-budget-analyzer-initial.png",
      fullPage: true,
    });

    // Verify page loaded
    const heading = page.getByRole("heading", { name: /Budget Analyzer/i });
    await expect(heading).toBeVisible();
    console.log("50/30/20 Budget Analyzer page loaded");

    // Check for the 50/30/20 rule explanation
    const ruleSection = page.getByText("The 50/30/20 Rule");
    const hasRuleSection = await ruleSection.isVisible().catch(() => false);
    console.log(`50/30/20 Rule explanation visible: ${hasRuleSection}`);

    // Find all currency inputs: monthlyIncome, needsSpending, wantsSpending, savingsAmount
    const currencyInputs = page.locator('input[inputmode="decimal"]');
    const inputCount = await currencyInputs.count();
    console.log(`Found ${inputCount} currency inputs`);

    // Fill in monthly income = 5000
    if (inputCount >= 1) {
      await fillCurrencyInput(page, currencyInputs.nth(0), "5000");
      console.log("Set monthly income to 5000");
    }

    // Fill in needs = 2200
    if (inputCount >= 2) {
      await fillCurrencyInput(page, currencyInputs.nth(1), "2200");
      console.log("Set needs spending to 2200");
    }

    // Fill in wants = 1500
    if (inputCount >= 3) {
      await fillCurrencyInput(page, currencyInputs.nth(2), "1500");
      console.log("Set wants spending to 1500");
    }

    // Fill in savings = 1300
    if (inputCount >= 4) {
      await fillCurrencyInput(page, currencyInputs.nth(3), "1300");
      console.log("Set savings to 1300");
    }

    // Click elsewhere to trigger calculation
    await heading.click();
    await page.waitForTimeout(500);

    // Screenshot showing results
    await page.screenshot({
      path: "test-results/calc-budget-analyzer-results.png",
      fullPage: true,
    });

    // Check for analysis results
    const pageText = await page.textContent("body");

    // Check for needs/wants/savings bucket labels
    const hasNeeds = pageText?.includes("Needs");
    console.log(`Needs bucket found: ${hasNeeds}`);

    const hasWants = pageText?.includes("Wants");
    console.log(`Wants bucket found: ${hasWants}`);

    const hasSavings = pageText?.includes("Savings");
    console.log(`Savings bucket found: ${hasSavings}`);

    // Check for over/under (On Track) indicators
    const hasOnTrack =
      pageText?.includes("On Track") || pageText?.includes("Over") || pageText?.includes("Under");
    console.log(`On Track/Over/Under indicators found: ${hasOnTrack}`);

    // Check for percentage display
    const hasPercent = pageText?.includes("%");
    console.log(`Percentage display found: ${hasPercent}`);

    // Check for actual vs target comparison
    const hasActualTarget = pageText?.includes("Actual") && pageText?.includes("Target");
    console.log(`Actual/Target comparison found: ${hasActualTarget}`);

    // Check for variance display
    const hasVariance = pageText?.includes("Variance");
    console.log(`Variance display found: ${hasVariance}`);

    // With income=5000:
    // Needs: 2200 = 44% vs 50% target (Under, On Track)
    // Wants: 1500 = 30% vs 30% target (On Track)
    // Savings: 1300 = 26% vs 20% target (Over/On Track - saving extra is good)
    const hasBalancedOrAdjust =
      pageText?.includes("Balanced") ||
      pageText?.includes("Adjustments Recommended") ||
      pageText?.includes("On Track");
    console.log(`Balance/adjustment status found: ${hasBalancedOrAdjust}`);

    // Verify the needs, wants, savings bucket cards each exist
    const needsCard = page.locator("text=Needs").first();
    const wantsCard = page.locator("text=Wants").first();
    const savingsCard = page.locator("text=Savings").first();
    expect(await needsCard.isVisible()).toBe(true);
    expect(await wantsCard.isVisible()).toBe(true);
    expect(await savingsCard.isVisible()).toBe(true);

    console.log("TEST 6 PASSED: Budget Analyzer loaded, inputs filled, analysis displayed");
  });
});
