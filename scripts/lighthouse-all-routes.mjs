#!/usr/bin/env node
// Comprehensive Lighthouse runner for all Tanium TCO LMS routes
// Configured for WSL2 environment with port 3001

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = 'http://localhost:3001';
const CHROME_PATH = process.env.CHROME_PATH || '/home/robne/.cache/ms-playwright/chromium-1193/chrome-linux/chrome';

// All key routes in the Tanium TCO LMS
const routes = [
  { path: '/', name: 'home' },
  { path: '/welcome', name: 'welcome' },
  { path: '/practice', name: 'practice' },
  { path: '/mock', name: 'mock_exam' },
  { path: '/review', name: 'review' },
  { path: '/assessment', name: 'assessment' },
  { path: '/progress', name: 'progress' },
  { path: '/settings', name: 'settings' },
  { path: '/profile', name: 'profile' }
];

const now = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
const outDir = `reports/lighthouse/${now}`;

function ensureReportsDirectory() {
  try {
    mkdirSync(outDir, { recursive: true });
    console.log(`📁 Created output directory: ${outDir}`);
    return true;
  } catch (e) {
    console.error(`❌ Failed to create output directory: ${e.message}`);
    return false;
  }
}

function checkChrome() {
  if (!existsSync(CHROME_PATH)) {
    console.error(`❌ Chrome not found at: ${CHROME_PATH}`);
    console.log('💡 Run: npx playwright install chromium');
    return false;
  }
  console.log(`✅ Chrome found at: ${CHROME_PATH}`);
  return true;
}

function runLighthouse(url, preset, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      'lighthouse',
      url,
      '--output=html',
      '--output=json',
      `--output-path=${outputPath}`,
      '--quiet',
      `--preset=${preset}`,
      '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage --disable-features=BlockInsecurePrivateNetworkRequests --disable-setuid-sandbox --allow-insecure-localhost --ignore-certificate-errors'
    ];

    const env = {
      ...process.env,
      CHROME_PATH
    };

    const child = spawn('npx', args, { 
      stdio: 'pipe',
      env 
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data;
    });

    child.stderr.on('data', (data) => {
      stderr += data;
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, stdout });
      } else {
        reject(new Error(`Lighthouse exited with code ${code}\n${stderr}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function parseScores(jsonPath) {
  try {
    const { readFileSync } = await import('fs');
    const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
    const scores = {};
    
    for (const [key, value] of Object.entries(data.categories)) {
      scores[key] = Math.round((value.score || 0) * 100);
    }
    
    return scores;
  } catch (e) {
    return null;
  }
}

async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    return response.ok;
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log('\n🚀 Tanium TCO LMS - Lighthouse Performance Audit');
  console.log('================================================\n');

  // Pre-flight checks
  if (!checkChrome()) process.exit(1);
  if (!ensureReportsDirectory()) process.exit(1);

  // Check if server is running
  console.log(`🔍 Checking server at ${BASE_URL}...`);
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('⚠️  Server not responding on port 3001');
    console.log('💡 Start the server with: npm run dev:3001');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');

  const results = [];
  const startTime = Date.now();

  // Run audits for all routes
  for (const route of routes) {
    const url = `${BASE_URL}${route.path}`;
    console.log(`\n📊 Auditing: ${route.name} (${route.path})`);
    console.log('─'.repeat(40));

    for (const preset of ['desktop', 'mobile']) {
      const outputPath = join(outDir, `${preset}_${route.name}`);
      
      try {
        process.stdout.write(`  ${preset === 'desktop' ? '🖥️ ' : '📱'} ${preset}: `);
        await runLighthouse(url, preset, outputPath);
        
        // Parse and display scores
        const scores = await parseScores(`${outputPath}.report.json`);
        if (scores) {
          const scoreStr = Object.entries(scores)
            .map(([k, v]) => {
              const emoji = v >= 90 ? '🟢' : v >= 50 ? '🟡' : '🔴';
              return `${emoji} ${k}: ${v}`;
            })
            .join(' | ');
          console.log(`✓ ${scoreStr}`);
          
          results.push({
            route: route.name,
            path: route.path,
            preset,
            scores
          });
        } else {
          console.log('✓ Complete');
        }
      } catch (err) {
        console.log(`✗ Failed: ${err.message}`);
      }
    }
  }

  // Generate summary report
  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log('\n' + '='.repeat(60));
  console.log('📈 SUMMARY REPORT');
  console.log('='.repeat(60));

  // Calculate averages
  const avgScores = { desktop: {}, mobile: {} };
  const categories = ['performance', 'accessibility', 'best-practices', 'seo'];

  for (const category of categories) {
    avgScores.desktop[category] = Math.round(
      results
        .filter(r => r.preset === 'desktop')
        .reduce((sum, r) => sum + (r.scores[category] || 0), 0) / 
      results.filter(r => r.preset === 'desktop').length
    );
    
    avgScores.mobile[category] = Math.round(
      results
        .filter(r => r.preset === 'mobile')
        .reduce((sum, r) => sum + (r.scores[category] || 0), 0) / 
      results.filter(r => r.preset === 'mobile').length
    );
  }

  console.log('\n📊 Average Scores:');
  console.log('─'.repeat(40));
  
  for (const preset of ['desktop', 'mobile']) {
    console.log(`\n${preset === 'desktop' ? '🖥️  Desktop' : '📱 Mobile'}:`);
    for (const [category, score] of Object.entries(avgScores[preset])) {
      const emoji = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
      console.log(`  ${emoji} ${category}: ${score}/100`);
    }
  }

  // Identify problem areas
  const issues = results.filter(r => 
    r.scores.performance < 50 || 
    r.scores.accessibility < 80
  );

  if (issues.length > 0) {
    console.log('\n⚠️  Routes Needing Attention:');
    console.log('─'.repeat(40));
    for (const issue of issues) {
      console.log(`  • ${issue.route} (${issue.preset}):`);
      if (issue.scores.performance < 50) {
        console.log(`    → Performance: ${issue.scores.performance}/100`);
      }
      if (issue.scores.accessibility < 80) {
        console.log(`    → Accessibility: ${issue.scores.accessibility}/100`);
      }
    }
  }

  // Save summary to JSON
  const summaryPath = join(outDir, 'summary.json');
  writeFileSync(summaryPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    duration: `${duration}s`,
    baseUrl: BASE_URL,
    routes: routes.map(r => r.path),
    averageScores: avgScores,
    detailedResults: results
  }, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Audit complete in ${duration}s`);
  console.log(`📁 Reports saved to: ${outDir}`);
  console.log(`📊 Summary: ${summaryPath}`);
  console.log('='.repeat(60) + '\n');
}

main().catch(e => {
  console.error('\n❌ Fatal error:', e.message);
  process.exit(1);
});