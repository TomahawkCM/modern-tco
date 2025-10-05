import { chromium } from 'playwright';

const deploymentUrl = 'https://modern-ph2jc29ln-robert-neveus-projects.vercel.app';

async function testModule() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  console.log(`Testing: refining-questions-targeting on new deployment`);
  await page.goto(`${deploymentUrl}/study/refining-questions-targeting`);
  await page.waitForTimeout(5000);
  
  if (errors.length === 0) {
    console.log('✅ No console errors - MODULE FIXED!');
  } else {
    console.log(`❌ Errors found (${errors.length}):`);
    errors.forEach(err => console.log(`  - ${err}`));
  }
  
  await browser.close();
}

testModule().catch(console.error);
