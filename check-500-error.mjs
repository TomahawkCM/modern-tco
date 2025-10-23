#!/usr/bin/env node

import { chromium } from 'playwright';

const MODULE_URL = 'https://modern-tco.vercel.app/modules/tanium-platform-foundation-v2';

async function check500Error() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const failed500Requests = [];

  page.on('response', async (response) => {
    if (response.status() === 500) {
      failed500Requests.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
      });
    }
  });

  try {
    await page.goto(MODULE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('🔍 500 ERROR ANALYSIS\n');
    console.log('='.repeat(70));
    
    if (failed500Requests.length > 0) {
      console.log(`\n❌ Found ${failed500Requests.length} requests with 500 errors:\n`);
      failed500Requests.forEach((req, i) => {
        console.log(`${i + 1}. ${req.url}`);
        console.log(`   Status: ${req.status} - ${req.statusText}`);
        console.log('');
      });
    } else {
      console.log('\n✅ No 500 errors found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

check500Error();

