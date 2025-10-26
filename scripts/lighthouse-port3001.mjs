#!/usr/bin/env node
// Lighthouse runner configured specifically for port 3001 in WSL environment
// Usage:
//   node scripts/lighthouse-port3001.mjs [paths...]
//   npm run lighthouse:3001

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Fixed port 3001 configuration
const BASE_URL = 'http://localhost:3001';
const paths = process.argv.slice(2);
const targets = paths.length ? paths : ['/welcome', '/practice', '/mock', '/review'];

console.log(`[lighthouse-3001] Using base: ${BASE_URL}`);

function resolveChromePath() {
  // Check common WSL Chrome/Chromium locations
  const possiblePaths = [
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome'
  ];
  
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  
  // Try to find an existing Chrome installation
  const fs = require('fs');
  for (const path of possiblePaths) {
    try {
      if (fs.existsSync(path)) {
        console.log(`[lighthouse-3001] Found Chrome at: ${path}`);
        return path;
      }
    } catch {}
  }
  
  // Fallback to playwright if available
  try {
    const { chromium } = require('playwright');
    const p = chromium.executablePath();
    if (p) {
      console.log(`[lighthouse-3001] Using Playwright Chrome: ${p}`);
      return p;
    }
  } catch {}
  
  return '';
}

function resolveLighthouseCli() {
  try { return require.resolve('lighthouse/lighthouse-cli/index.js'); } catch {}
  try { return require.resolve('lighthouse/cli/index.js'); } catch {}
  return null;
}

function run(url, preset, outBase) {
  return new Promise((resolve, reject) => {
    const args = [
      url, 
      '--output=html', 
      '--output=json', 
      `--output-path=${outBase}`, 
      '--quiet'
    ];
    
    if (preset === 'desktop') args.push('--preset=desktop');
    if (preset === 'mobile') args.push('--emulated-form-factor=mobile');
    
    // WSL-optimized Chrome flags
    const flags = [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--allow-insecure-localhost',
      '--ignore-certificate-errors',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-web-security',
      '--allow-running-insecure-content',
      '--disable-features=BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights',
      '--remote-debugging-port=9222'  // Explicit debugging port for WSL
    ];
    
    args.push(`--chrome-flags=${flags.join(' ')}`);
    
    const env = { ...process.env };
    const chromePath = resolveChromePath();
    if (chromePath) {
      env.CHROME_PATH = chromePath;
      console.log(`[lighthouse-3001] Using Chrome: ${chromePath}`);
    }
    
    const cli = resolveLighthouseCli();
    const child = cli
      ? spawn(process.execPath, [cli, ...args], { stdio: 'inherit', env })
      : spawn('npx', ['--yes', 'lighthouse', ...args], { stdio: 'inherit', env });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Lighthouse exited with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

const now = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = `reports/lighthouse/${now}`;

// Ensure output directory exists
try { 
  mkdirSync(outDir, { recursive: true }); 
  console.log(`[lighthouse-3001] Output directory: ${outDir}`);
} catch (e) {
  console.error(`[lighthouse-3001] Failed to create output directory: ${e.message}`);
}

async function main() {
  console.log(`[lighthouse-3001] Running audits for: ${targets.join(', ')}`);
  
  for (const p of targets) {
    const url = p.startsWith('http') ? p : `${BASE_URL}${p}`;
    const slug = p.replace(/[\/:?&=]/g, '_') || 'root';
    
    console.log(`\n[lighthouse-3001] Auditing: ${url}`);
    
    try {
      await run(url, 'desktop', `${outDir}/desktop_${slug}`);
      console.log(`  ✓ Desktop audit complete`);
      
      await run(url, 'mobile', `${outDir}/mobile_${slug}`);
      console.log(`  ✓ Mobile audit complete`);
    } catch (err) {
      console.error(`  ✗ Failed to audit ${url}: ${err.message}`);
    }
  }
  
  console.log(`\n[lighthouse-3001] Reports saved to: ${outDir}`);
}

main().catch((e) => { 
  console.error('[lighthouse-3001] Error:', e); 
  process.exit(1); 
});