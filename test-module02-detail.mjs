import { chromium } from 'playwright';

const deploymentUrl = 'https://modern-kx7b3cnko-robert-neveus-projects.vercel.app';

async function testModule02() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ ERROR:', msg.text());
      errors.push(msg.text());
    }
  });

  console.log('Testing module 02 on latest deployment...\n');
  await page.goto(`${deploymentUrl}/study/refining-questions-targeting`);
  await page.waitForTimeout(5000);

  console.log(`\nTotal errors: ${errors.length}`);
  await browser.close();
}

testModule02().catch(console.error);
