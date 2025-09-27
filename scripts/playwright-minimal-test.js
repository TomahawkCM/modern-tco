#!/usr/bin/env node

/**
 * Minimal Playwright Test for WSL2
 * Uses minimal configuration to work without full system dependencies
 */

const { chromium } = require('playwright');

async function minimalTest() {
    console.log('🧪 Minimal Playwright Test for WSL2\n');

    try {
        console.log('📱 Attempting browser launch with minimal config...');

        // Use chromium.executablePath() to get the installed browser path
        const execPath = chromium.executablePath();
        console.log(`📍 Browser path: ${execPath}\n`);

        // Launch with minimal, WSL2-friendly options
        const browser = await chromium.launch({
            headless: true,
            executablePath: execPath,
            args: [
                '--headless=new',     // Use new headless mode
                '--no-sandbox',       // Required for WSL2
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-zygote',        // Single process mode
                '--no-first-run',
                '--disable-features=TranslateUI,BlinkGenPropertyTrees,IsolateOrigins,site-per-process',
                '--disable-web-security',
                '--disable-blink-features=AutomationControlled'
            ],
            ignoreDefaultArgs: ['--enable-automation']
        });

        console.log('✅ Browser launched!');

        // Quick version check
        const version = await browser.version();
        console.log(`📊 Browser version: ${version}\n`);

        await browser.close();
        console.log('✅ Browser closed successfully!\n');

        console.log('🎉 SUCCESS! Minimal browser test passed!');
        console.log('');
        console.log('ℹ️  Note: Full page functionality may require system dependencies.');
        console.log('    For full functionality, you may need to:');
        console.log('    1. Install system dependencies manually');
        console.log('    2. Use Docker or a full Linux environment');
        console.log('    3. Use Playwright with remote browser connection');

        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);

        if (error.message.includes('cannot open shared object')) {
            console.log('\n🔧 Missing system libraries detected.');
            console.log('   The browser binary is installed but system libraries are missing.');
            console.log('\n   Options:');
            console.log('   1. Run tests using npx playwright test (may work better)');
            console.log('   2. Use Playwright Docker image');
            console.log('   3. Connect to remote browser');
        }

        return false;
    }
}

// Alternative: Test using remote connection approach
async function testRemoteApproach() {
    console.log('\n📡 Alternative: Testing remote browser approach...\n');

    try {
        // This approach would connect to a browser running elsewhere
        console.log('ℹ️  Remote browser connection allows Playwright to control');
        console.log('    a browser running on a different machine or container.\n');

        console.log('   Setup options:');
        console.log('   1. Use Playwright server: npx playwright run-server');
        console.log('   2. Connect via WebSocket: browserType.connect(wsEndpoint)');
        console.log('   3. Use BrowserStack or similar service');
        console.log('   4. Run browser in Docker container');

        return true;
    } catch (error) {
        console.error('❌ Remote test error:', error.message);
        return false;
    }
}

// Main execution
(async () => {
    const minimalSuccess = await minimalTest();

    if (!minimalSuccess) {
        await testRemoteApproach();
    }

    console.log('\n📋 Final Recommendations:');
    console.log('==========================');
    console.log('');
    console.log('For WSL2 without sudo access, consider:');
    console.log('');
    console.log('1. **Use npx for tests** (most compatible):');
    console.log('   npx playwright test --browser=chromium --headed=false');
    console.log('');
    console.log('2. **Use Playwright MCP in headless mode**:');
    console.log('   Already configured in .mcp.json with headless flags');
    console.log('');
    console.log('3. **For the live app testing**, create HTTP-based tests:');
    console.log('   node scripts/test-live-app-http.js');
    console.log('');
    console.log('4. **Use Docker for full browser support**:');
    console.log('   docker run -it mcr.microsoft.com/playwright:latest');

    process.exit(minimalSuccess ? 0 : 1);
})();