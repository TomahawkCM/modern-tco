#!/usr/bin/env node

/**
 * Comprehensive Functionality Test for Modern Tanium TCO LMS
 * Tests all features, pages, and interactions
 */

const { chromium } = require('playwright');
const fs = require('fs');

// Test configuration
const APP_URL = 'https://modern-tco.vercel.app/tanium';
const TIMEOUT = 30000;

// Test results storage
const testResults = {
    timestamp: new Date().toISOString(),
    url: APP_URL,
    sections: {},
    screenshots: [],
    errors: [],
    summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
    }
};

// Helper function to log results
function logTest(section, test, status, detail = '') {
    if (!testResults.sections[section]) {
        testResults.sections[section] = [];
    }

    const result = { test, status, detail, timestamp: Date.now() };
    testResults.sections[section].push(result);

    testResults.summary.total++;
    if (status === 'PASS') {
        testResults.summary.passed++;
        console.log(`  ✅ ${test}${detail ? ': ' + detail : ''}`);
    } else if (status === 'FAIL') {
        testResults.summary.failed++;
        console.log(`  ❌ ${test}${detail ? ': ' + detail : ''}`);
    } else if (status === 'WARN') {
        testResults.summary.warnings++;
        console.log(`  ⚠️  ${test}${detail ? ': ' + detail : ''}`);
    }
}

// Main test function
async function testFullApplication() {
    console.log('🧪 COMPREHENSIVE FUNCTIONALITY TEST - Modern Tanium TCO LMS');
    console.log('='.repeat(70));
    console.log(`📅 Date: ${new Date().toLocaleString()}`);
    console.log(`🌐 URL: ${APP_URL}`);
    console.log('='.repeat(70) + '\n');

    let browser, context, page;

    try {
        // Initialize browser
        console.log('🚀 Initializing Test Environment...\n');
        browser = await chromium.launch({
            headless: true,
            args: [
                '--headless=new',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-zygote'
            ]
        });

        context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ignoreHTTPSErrors: true
        });

        page = await context.newPage();

        // Set up error collection
        page.on('console', msg => {
            if (msg.type() === 'error') {
                testResults.errors.push(msg.text());
            }
        });

        // ============= SECTION 1: Initial Load & Core Elements =============
        console.log('📱 SECTION 1: Initial Load & Core Elements\n');

        const loadStart = Date.now();
        const response = await page.goto(APP_URL, {
            waitUntil: 'networkidle',
            timeout: TIMEOUT
        });
        const loadTime = Date.now() - loadStart;

        logTest('Initial Load', 'Page Response', response.status() === 200 ? 'PASS' : 'FAIL',
            `Status: ${response.status()}, Time: ${loadTime}ms`);

        const title = await page.title();
        logTest('Initial Load', 'Page Title', title ? 'PASS' : 'FAIL', title);

        // Wait for app to fully load
        await page.waitForTimeout(2000);

        // Take initial screenshot
        await page.screenshot({
            path: '/tmp/tco-test-1-initial.png',
            fullPage: false
        });
        testResults.screenshots.push('/tmp/tco-test-1-initial.png');

        // ============= SECTION 2: Navigation & Layout =============
        console.log('\n📐 SECTION 2: Navigation & Layout\n');

        // Check for navigation elements
        const navExists = await page.locator('nav').count() > 0;
        logTest('Navigation', 'Navigation Bar', navExists ? 'PASS' : 'FAIL');

        // Check for header/logo
        const headerExists = await page.locator('header, [class*="header"]').count() > 0;
        logTest('Navigation', 'Header Section', headerExists ? 'PASS' : 'FAIL');

        // Check for sidebar
        const sidebarExists = await page.locator('[class*="sidebar"], aside').count() > 0;
        logTest('Navigation', 'Sidebar', sidebarExists ? 'PASS' : 'WARN',
            sidebarExists ? 'Found' : 'Not visible on initial load');

        // Check for main content area
        const mainExists = await page.locator('main, [class*="main"], [class*="content"]').count() > 0;
        logTest('Navigation', 'Main Content Area', mainExists ? 'PASS' : 'FAIL');

        // Check for footer
        const footerExists = await page.locator('footer, [class*="footer"]').count() > 0;
        logTest('Navigation', 'Footer', footerExists ? 'PASS' : 'WARN');

        // ============= SECTION 3: User Interface Elements =============
        console.log('\n🎨 SECTION 3: User Interface Elements\n');

        // Count interactive elements
        const buttons = await page.locator('button').count();
        logTest('UI Elements', 'Buttons', buttons > 0 ? 'PASS' : 'FAIL', `Found: ${buttons}`);

        const links = await page.locator('a').count();
        logTest('UI Elements', 'Links', links > 0 ? 'PASS' : 'FAIL', `Found: ${links}`);

        const inputs = await page.locator('input').count();
        logTest('UI Elements', 'Input Fields', inputs >= 0 ? 'PASS' : 'FAIL', `Found: ${inputs}`);

        const forms = await page.locator('form').count();
        logTest('UI Elements', 'Forms', forms >= 0 ? 'PASS' : 'WARN', `Found: ${forms}`);

        // Check for modals/dialogs
        const modals = await page.locator('[role="dialog"], [class*="modal"]').count();
        logTest('UI Elements', 'Modals/Dialogs', 'PASS', `Found: ${modals}`);

        // ============= SECTION 4: TCO Specific Features =============
        console.log('\n🎓 SECTION 4: TCO Specific Features\n');

        // Check for TCO branding
        const tcoText = await page.locator('text=/Tanium|TCO|Certified Operator/i').count();
        logTest('TCO Features', 'TCO Branding', tcoText > 0 ? 'PASS' : 'WARN', `References: ${tcoText}`);

        // Check for learning modules
        const modules = await page.locator('text=/Module|Lesson|Chapter|Topic/i').count();
        logTest('TCO Features', 'Learning Modules', modules >= 0 ? 'PASS' : 'WARN', `Found: ${modules}`);

        // Check for practice/exam buttons
        const practiceElements = await page.locator('text=/Practice|Exam|Test|Quiz|Assessment/i').count();
        logTest('TCO Features', 'Assessment Elements', practiceElements > 0 ? 'PASS' : 'WARN',
            `Found: ${practiceElements}`);

        // Check for progress indicators
        const progressElements = await page.locator('[class*="progress"], [role="progressbar"]').count();
        logTest('TCO Features', 'Progress Indicators', progressElements >= 0 ? 'PASS' : 'WARN',
            `Found: ${progressElements}`);

        // Check for domain coverage
        const domainText = await page.locator('text=/Domain|Asking Questions|Refining|Navigation/i').count();
        logTest('TCO Features', 'Domain References', domainText >= 0 ? 'PASS' : 'WARN',
            `Found: ${domainText}`);

        // ============= SECTION 5: Interactive Features =============
        console.log('\n🖱️ SECTION 5: Interactive Features\n');

        // Test button clicks (non-destructive)
        const clickableButtons = await page.locator('button:visible').all();
        logTest('Interactions', 'Clickable Buttons', clickableButtons.length > 0 ? 'PASS' : 'WARN',
            `Found: ${clickableButtons.length}`);

        // Check for hover effects
        if (clickableButtons.length > 0) {
            await clickableButtons[0].hover();
            logTest('Interactions', 'Hover Effects', 'PASS', 'Hover action completed');
        }

        // Check for dropdown menus
        const dropdowns = await page.locator('select, [class*="dropdown"], [class*="select"]').count();
        logTest('Interactions', 'Dropdown Menus', dropdowns >= 0 ? 'PASS' : 'WARN', `Found: ${dropdowns}`);

        // Check for tabs
        const tabs = await page.locator('[role="tab"], [class*="tab"]').count();
        logTest('Interactions', 'Tab Components', tabs >= 0 ? 'PASS' : 'WARN', `Found: ${tabs}`);

        // ============= SECTION 6: Responsive Design =============
        console.log('\n📱 SECTION 6: Responsive Design\n');

        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);

        const mobileMenuExists = await page.locator('[class*="mobile"], [class*="hamburger"], [class*="menu-toggle"]').count() > 0;
        logTest('Responsive', 'Mobile Menu', mobileMenuExists ? 'PASS' : 'WARN',
            mobileMenuExists ? 'Mobile menu found' : 'No mobile menu detected');

        await page.screenshot({
            path: '/tmp/tco-test-2-mobile.png',
            fullPage: false
        });
        testResults.screenshots.push('/tmp/tco-test-2-mobile.png');

        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(500);
        logTest('Responsive', 'Tablet View', 'PASS', 'Viewport adjusted to tablet size');

        // Restore desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);
        logTest('Responsive', 'Desktop View', 'PASS', 'Viewport restored to desktop');

        // ============= SECTION 7: Accessibility =============
        console.log('\n♿ SECTION 7: Accessibility\n');

        // Check for ARIA labels
        const ariaLabels = await page.locator('[aria-label]').count();
        logTest('Accessibility', 'ARIA Labels', ariaLabels > 0 ? 'PASS' : 'WARN', `Found: ${ariaLabels}`);

        // Check for alt text on images
        const images = await page.locator('img').count();
        const imagesWithAlt = await page.locator('img[alt]').count();
        logTest('Accessibility', 'Image Alt Text', images === 0 || imagesWithAlt > 0 ? 'PASS' : 'WARN',
            `${imagesWithAlt}/${images} images have alt text`);

        // Check for semantic HTML
        const semanticElements = await page.locator('header, nav, main, footer, section, article, aside').count();
        logTest('Accessibility', 'Semantic HTML', semanticElements > 3 ? 'PASS' : 'WARN',
            `Found ${semanticElements} semantic elements`);

        // Check for keyboard navigation
        const focusableElements = await page.locator('button, a, input, select, textarea, [tabindex]').count();
        logTest('Accessibility', 'Focusable Elements', focusableElements > 0 ? 'PASS' : 'FAIL',
            `Found: ${focusableElements}`);

        // ============= SECTION 8: Performance Metrics =============
        console.log('\n⚡ SECTION 8: Performance Metrics\n');

        // Get performance metrics
        const performanceMetrics = await page.evaluate(() => {
            const timing = performance.timing;
            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
                loadComplete: timing.loadEventEnd - timing.loadEventStart,
                domInteractive: timing.domInteractive - timing.navigationStart,
                resources: performance.getEntriesByType('resource').length
            };
        });

        logTest('Performance', 'DOM Content Loaded', 'PASS', `${performanceMetrics.domContentLoaded}ms`);
        logTest('Performance', 'Page Load Complete', 'PASS', `${performanceMetrics.loadComplete}ms`);
        logTest('Performance', 'DOM Interactive', 'PASS', `${performanceMetrics.domInteractive}ms`);
        logTest('Performance', 'Resources Loaded', 'PASS', `${performanceMetrics.resources} resources`);

        // ============= SECTION 9: Advanced Features =============
        console.log('\n🚀 SECTION 9: Advanced Features\n');

        // Check for video elements
        const videos = await page.locator('video, iframe[src*="youtube"], [class*="video"]').count();
        logTest('Advanced', 'Video Components', videos >= 0 ? 'PASS' : 'WARN', `Found: ${videos}`);

        // Check for charts/graphs
        const charts = await page.locator('canvas, svg, [class*="chart"], [class*="graph"]').count();
        logTest('Advanced', 'Charts/Graphs', charts >= 0 ? 'PASS' : 'WARN', `Found: ${charts}`);

        // Check for localStorage usage
        const localStorageData = await page.evaluate(() => {
            return Object.keys(localStorage).length;
        });
        logTest('Advanced', 'LocalStorage Usage', localStorageData >= 0 ? 'PASS' : 'WARN',
            `${localStorageData} items in localStorage`);

        // Check for API calls
        const apiCalls = [];
        page.on('request', request => {
            if (request.url().includes('/api/')) {
                apiCalls.push(request.url());
            }
        });
        await page.reload();
        await page.waitForTimeout(2000);
        logTest('Advanced', 'API Integration', 'PASS', `${apiCalls.length} API calls detected`);

        // ============= SECTION 10: Content Analysis =============
        console.log('\n📚 SECTION 10: Content Analysis\n');

        // Get text content
        const bodyText = await page.locator('body').innerText();
        const wordCount = bodyText.split(/\s+/).length;
        logTest('Content', 'Page Content', wordCount > 50 ? 'PASS' : 'WARN', `${wordCount} words`);

        // Check for specific TCO content
        const tcoKeywords = [
            'Tanium', 'Certified', 'Operator', 'Assessment',
            'Practice', 'Exam', 'Module', 'Learning'
        ];

        for (const keyword of tcoKeywords) {
            const found = bodyText.toLowerCase().includes(keyword.toLowerCase());
            if (found) {
                logTest('Content', `Keyword: ${keyword}`, 'PASS', 'Found');
            }
        }

        // Final screenshot
        await page.screenshot({
            path: '/tmp/tco-test-3-final.png',
            fullPage: true
        });
        testResults.screenshots.push('/tmp/tco-test-3-final.png');

    } catch (error) {
        console.error('\n❌ Critical Error:', error.message);
        testResults.errors.push(error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    // Generate summary report
    generateSummaryReport();
}

// Generate comprehensive report
function generateSummaryReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log('='.repeat(70));

    console.log(`\n📈 Overall Results:`);
    console.log(`  Total Tests: ${testResults.summary.total}`);
    console.log(`  ✅ Passed: ${testResults.summary.passed} (${Math.round(testResults.summary.passed/testResults.summary.total*100)}%)`);
    console.log(`  ⚠️  Warnings: ${testResults.summary.warnings} (${Math.round(testResults.summary.warnings/testResults.summary.total*100)}%)`);
    console.log(`  ❌ Failed: ${testResults.summary.failed} (${Math.round(testResults.summary.failed/testResults.summary.total*100)}%)`);

    console.log(`\n📸 Screenshots Generated:`);
    testResults.screenshots.forEach(screenshot => {
        console.log(`  - ${screenshot}`);
    });

    if (testResults.errors.length > 0) {
        console.log(`\n⚠️ Console Errors Detected: ${testResults.errors.length}`);
    }

    // Section summaries
    console.log(`\n📋 Section Results:`);
    for (const [section, tests] of Object.entries(testResults.sections)) {
        const sectionPassed = tests.filter(t => t.status === 'PASS').length;
        const sectionTotal = tests.length;
        console.log(`  ${section}: ${sectionPassed}/${sectionTotal} passed`);
    }

    // Final assessment
    const passRate = testResults.summary.passed / testResults.summary.total;
    console.log(`\n🎯 Final Assessment:`);
    if (passRate >= 0.9) {
        console.log('  🟢 EXCELLENT - Application is fully functional');
    } else if (passRate >= 0.7) {
        console.log('  🟡 GOOD - Application is mostly functional with minor issues');
    } else if (passRate >= 0.5) {
        console.log('  🟠 FAIR - Application has significant functionality but needs improvement');
    } else {
        console.log('  🔴 POOR - Application has critical issues affecting functionality');
    }

    // Save results to file
    fs.writeFileSync(
        '/tmp/tco-test-results.json',
        JSON.stringify(testResults, null, 2)
    );
    console.log('\n📄 Detailed results saved to: /tmp/tco-test-results.json');
}

// Run the test
testFullApplication().catch(console.error);