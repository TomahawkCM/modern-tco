import { chromium } from 'playwright';

const LOCAL_URL = 'http://localhost:3003/modules/tanium-platform-foundation-v2';

async function testLocal() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  try {
    await page.goto(LOCAL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    const hasMapError = errors.some(e => e.includes('map') && e.includes('undefined'));
    const has500 = errors.some(e => e.includes('500'));
    const hasJsxDev = errors.some(e => e.includes('jsxDEV'));

    console.log('LOCAL TEST RESULTS:');
    console.log('==================');
    console.log('TypeError (.map()):', hasMapError ? '❌ PRESENT' : '✅ FIXED');
    console.log('500 Error:', has500 ? '❌ PRESENT' : '✅ FIXED');
    console.log('jsxDEV Error:', hasJsxDev ? '❌ PRESENT' : '✅ FIXED');
    console.log('Total Errors:', errors.length);
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.slice(0, 3).forEach(e => console.log(' -', e.substring(0, 80)));
    }
  } catch (error) {
    console.error('Connection failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLocal();
