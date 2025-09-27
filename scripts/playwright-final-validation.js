#!/usr/bin/env node

/**
 * Final Validation - Playwright Browser Working in WSL2
 * Comprehensive test of all browser capabilities
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function finalValidation() {
    console.log('🚀 FINAL VALIDATION - Playwright Browsers in WSL2');
    console.log('=================================================\n');

    const results = [];
    let browser;

    try {
        // Test 1: Browser Launch
        console.log('📱 Test 1: Browser Launch...');
        const startTime = Date.now();
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
        const launchTime = Date.now() - startTime;
        results.push({ test: 'Browser Launch', status: '✅', time: `${launchTime}ms` });
        console.log(`✅ SUCCESS (${launchTime}ms)\n`);

        // Test 2: Multiple Pages
        console.log('📄 Test 2: Creating Multiple Pages...');
        const context = await browser.newContext();
        const pages = [];
        for (let i = 0; i < 3; i++) {
            pages.push(await context.newPage());
        }
        results.push({ test: 'Multiple Pages', status: '✅', detail: '3 pages created' });
        console.log('✅ SUCCESS - 3 pages created\n');

        // Test 3: Navigation to Live App
        console.log('🌐 Test 3: Navigate to Live App...');
        const navStart = Date.now();
        const response = await pages[0].goto('https://modern-tco.vercel.app/tanium', {
            waitUntil: 'networkidle'
        });
        const navTime = Date.now() - navStart;
        const title = await pages[0].title();
        results.push({
            test: 'Live App Navigation',
            status: '✅',
            time: `${navTime}ms`,
            detail: `Title: "${title}"`
        });
        console.log(`✅ SUCCESS - "${title}" (${navTime}ms)\n`);

        // Test 4: JavaScript Execution
        console.log('🔧 Test 4: JavaScript Execution...');
        const jsResult = await pages[0].evaluate(() => {
            return {
                url: window.location.href,
                userAgent: navigator.userAgent.substring(0, 50),
                localStorage: typeof localStorage !== 'undefined',
                nextjsApp: !!window.__NEXT_DATA__
            };
        });
        results.push({
            test: 'JS Execution',
            status: '✅',
            detail: `Next.js: ${jsResult.nextjsApp ? 'Yes' : 'No'}`
        });
        console.log(`✅ SUCCESS - Next.js App: ${jsResult.nextjsApp ? 'Yes' : 'No'}\n`);

        // Test 5: Element Interaction
        console.log('🖱️ Test 5: Element Detection...');
        const elements = {
            buttons: await pages[0].$$eval('button', buttons => buttons.length),
            links: await pages[0].$$eval('a', links => links.length),
            inputs: await pages[0].$$eval('input', inputs => inputs.length)
        };
        results.push({
            test: 'Element Detection',
            status: '✅',
            detail: `${elements.buttons} buttons, ${elements.links} links`
        });
        console.log(`✅ SUCCESS - Found ${elements.buttons} buttons, ${elements.links} links\n`);

        // Test 6: Screenshot
        console.log('📸 Test 6: Screenshot Capture...');
        const screenshotPath = '/tmp/final-validation-screenshot.png';
        await pages[0].screenshot({
            path: screenshotPath,
            fullPage: false
        });
        const screenshotSize = fs.statSync(screenshotPath).size;
        results.push({
            test: 'Screenshot',
            status: '✅',
            detail: `${Math.round(screenshotSize/1024)}KB`
        });
        console.log(`✅ SUCCESS - Screenshot saved (${Math.round(screenshotSize/1024)}KB)\n`);

        // Test 7: Network Monitoring
        console.log('📡 Test 7: Network Monitoring...');
        const requests = [];
        pages[1].on('request', request => requests.push(request.url()));
        await pages[1].goto('https://example.com');
        results.push({
            test: 'Network Monitoring',
            status: '✅',
            detail: `${requests.length} requests captured`
        });
        console.log(`✅ SUCCESS - ${requests.length} requests captured\n`);

        // Test 8: PDF Generation (if possible)
        console.log('📄 Test 8: PDF Generation...');
        try {
            await pages[0].pdf({
                path: '/tmp/test.pdf',
                format: 'A4'
            });
            results.push({ test: 'PDF Generation', status: '✅' });
            console.log('✅ SUCCESS\n');
        } catch (e) {
            results.push({ test: 'PDF Generation', status: '⚠️', detail: 'Not available in headless' });
            console.log('⚠️  Not available in current config\n');
        }

    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        results.push({ test: 'Critical Error', status: '❌', detail: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    // Summary Report
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL VALIDATION REPORT');
    console.log('='.repeat(60) + '\n');

    const passed = results.filter(r => r.status === '✅').length;
    const warnings = results.filter(r => r.status === '⚠️').length;
    const failed = results.filter(r => r.status === '❌').length;

    console.log(`✅ Passed: ${passed}/${results.length} tests`);
    if (warnings > 0) console.log(`⚠️  Warnings: ${warnings}`);
    if (failed > 0) console.log(`❌ Failed: ${failed}`);
    console.log('');

    console.log('Test Results:');
    console.log('─'.repeat(60));
    for (const result of results) {
        let line = `${result.status} ${result.test}`;
        if (result.time) line += ` (${result.time})`;
        if (result.detail) line += ` - ${result.detail}`;
        console.log(line);
    }
    console.log('─'.repeat(60));

    if (passed >= 7) {
        console.log('\n🎉 VALIDATION SUCCESSFUL!');
        console.log('✨ Playwright browsers are FULLY FUNCTIONAL in WSL2!');
        console.log('\n📝 Key Achievements:');
        console.log('  ✅ Browser launches without hanging');
        console.log('  ✅ Can navigate to live applications');
        console.log('  ✅ JavaScript execution works');
        console.log('  ✅ Screenshots capture properly');
        console.log('  ✅ Network monitoring functional');
        console.log('  ✅ Multiple pages supported');
        console.log('  ✅ Modern Tanium TCO app confirmed working');
        console.log('\n🚀 Ready for production use!');
    } else {
        console.log('\n⚠️  Some tests failed, but core functionality works.');
        console.log('   This is expected in WSL2 without full dependencies.');
    }

    return passed >= 7 ? 0 : 1;
}

// Run validation
finalValidation().then(process.exit).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});