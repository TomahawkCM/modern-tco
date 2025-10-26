#!/usr/bin/env node

/**
 * Playwright Browser Functionality Test
 * Tests that browsers are properly installed and working in WSL2
 */

const { chromium } = require('playwright');

async function testBrowser() {
    console.log('🧪 Testing Playwright Browser Functionality in WSL2\n');
    console.log('================================================\n');

    const results = {
        browserLaunch: false,
        pageCreation: false,
        navigation: false,
        screenshot: false,
        evaluation: false
    };

    let browser;
    try {
        // Test 1: Launch browser
        console.log('📱 Test 1: Launching Chromium browser...');
        browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-breakpad',
                '--disable-client-side-phishing-detection',
                '--disable-component-extensions-with-background-pages',
                '--disable-default-apps',
                '--disable-features=TranslateUI',
                '--disable-hang-monitor',
                '--disable-ipc-flooding-protection',
                '--disable-popup-blocking',
                '--disable-prompt-on-repost',
                '--disable-renderer-backgrounding',
                '--disable-sync',
                '--metrics-recording-only',
                '--no-default-browser-check',
                '--safebrowsing-disable-auto-update',
                '--password-store=basic',
                '--use-mock-keychain'
            ]
        });
        results.browserLaunch = true;
        console.log('✅ Browser launched successfully!\n');

        // Test 2: Create page
        console.log('📄 Test 2: Creating new page...');
        const page = await browser.newPage();
        results.pageCreation = true;
        console.log('✅ Page created successfully!\n');

        // Test 3: Navigation
        console.log('🌐 Test 3: Navigating to test site...');
        await page.goto('https://example.com', { waitUntil: 'networkidle' });
        const title = await page.title();
        results.navigation = true;
        console.log(`✅ Navigation successful! Page title: "${title}"\n`);

        // Test 4: Screenshot capability
        console.log('📸 Test 4: Taking screenshot...');
        await page.screenshot({ path: '/tmp/playwright-test-screenshot.png', fullPage: true });
        results.screenshot = true;
        console.log('✅ Screenshot saved to /tmp/playwright-test-screenshot.png\n');

        // Test 5: JavaScript evaluation
        console.log('🔧 Test 5: Evaluating JavaScript in page context...');
        const userAgent = await page.evaluate(() => navigator.userAgent);
        const dimensions = await page.evaluate(() => ({
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
        }));
        results.evaluation = true;
        console.log('✅ JavaScript evaluation successful!');
        console.log(`   User Agent: ${userAgent.substring(0, 60)}...`);
        console.log(`   Viewport: ${dimensions.width}x${dimensions.height} @ ${dimensions.devicePixelRatio}x\n`);

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\n🔧 Error details:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔒 Browser closed cleanly\n');
        }
    }

    // Summary
    console.log('📊 Test Results Summary');
    console.log('=======================');
    const passedTests = Object.values(results).filter(r => r).length;
    const totalTests = Object.keys(results).length;

    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log('');
    console.log('Test Details:');
    console.log(`  ${results.browserLaunch ? '✅' : '❌'} Browser Launch`);
    console.log(`  ${results.pageCreation ? '✅' : '❌'} Page Creation`);
    console.log(`  ${results.navigation ? '✅' : '❌'} Navigation`);
    console.log(`  ${results.screenshot ? '✅' : '❌'} Screenshot`);
    console.log(`  ${results.evaluation ? '✅' : '❌'} JavaScript Evaluation`);
    console.log('');

    if (passedTests === totalTests) {
        console.log('🎉 SUCCESS! All Playwright browser tests passed!');
        console.log('✨ Playwright is fully functional in WSL2!');
        console.log('');
        console.log('🚀 You can now:');
        console.log('  1. Run browser automation tests');
        console.log('  2. Test the live application at https://modern-tco.vercel.app/tanium');
        console.log('  3. Use Playwright MCP for browser control');
        return 0;
    } else {
        console.log(`⚠️  Some tests failed (${totalTests - passedTests} failures)`);
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('  1. Check system dependencies: cat /tmp/playwright-deps.txt');
        console.log('  2. Verify browser installation: ls -la ~/.cache/ms-playwright/');
        console.log('  3. Check memory: free -h');
        console.log('  4. Review WSL2 configuration: wsl --status');
        return 1;
    }
}

// Run the test
testBrowser().then(process.exit).catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});