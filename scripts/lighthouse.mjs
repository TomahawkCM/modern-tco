#!/usr/bin/env node
// Simple helper to run Lighthouse against local dev URLs.
// Usage:
//   node scripts/lighthouse.mjs http://localhost:3000 /welcome /practice /mock /review

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const [baseArg = 'http://localhost:3000', ...paths] = process.argv.slice(2);
const targets = paths.length ? paths : ['/welcome', '/practice', '/mock', '/review'];

function normalizeLocalhostToIPv4(base) {
  try {
    const u = new URL(base);
    if (u.hostname === 'localhost') {
      u.hostname = '127.0.0.1';
      return u.toString().replace(/\/$/, '');
    }
  } catch {}
  return base;
}

const base = normalizeLocalhostToIPv4(baseArg);
console.log(`[lighthouse-runner] Using base: ${base}`);

function resolveChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  try {
    const { chromium } = require('playwright');
    const p = chromium.executablePath();
    if (p) return p;
  } catch {}
  return '';
}

// We will rely on Lighthouse to launch Chrome but pass safe flags.

function resolveLighthouseCli() {
  try { return require.resolve('lighthouse/lighthouse-cli/index.js'); } catch {}
  try { return require.resolve('lighthouse/cli/index.js'); } catch {}
  return null;
}

function run(url, preset, outBase) {
  return new Promise((resolve) => {
    // Use a base path without extension so multiple outputs are written as .html and .json
    const args = [url, '--output=html', '--output=json', `--output-path=${outBase}`, '--quiet'];
    // Desktop preset is supported; for mobile use default mobile emulation
    if (preset === 'desktop') args.push('--preset=desktop');
    if (preset === 'mobile') args.push('--emulated-form-factor=mobile');
    // Ensure Chrome starts with flags friendly to local dev/containers
    const flags = [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--allow-insecure-localhost',
      '--ignore-certificate-errors',
      '--no-first-run',
      '--no-default-browser-check',
    ];
    try {
      const u = new URL(base);
      const host = u.hostname;
      const isLocal = host === 'localhost' || host === '127.0.0.1';
      if (isLocal) {
        // Dev-only bypasses for local quirks (not for CI/prod measurements)
        flags.push(
          '--disable-web-security',
          '--allow-running-insecure-content',
          // Avoid private network interstitials in some headless environments
          '--disable-features=BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights,InsecurePrivateNetworkAccessChecks'
        );
      }
    } catch {}
    args.push(`--chrome-flags=${flags.join(' ')}`);
    const env = { ...process.env };
    const chromePath = resolveChromePath();
    if (chromePath) env.CHROME_PATH = chromePath;
    const cli = resolveLighthouseCli();
    const child = cli
      ? spawn(process.execPath, [cli, ...args], { stdio: 'inherit', env })
      : spawn('npx', ['--yes', 'lighthouse', ...args], { stdio: 'inherit', env });
    child.on('close', () => resolve());
  });
}

const now = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = `reports/lighthouse/${now}`;
// Ensure output directory exists so Lighthouse can write files
try { mkdirSync(outDir, { recursive: true }); } catch {}

async function main() {
  for (const p of targets) {
    const url = p.startsWith('http') ? p : `${base}${p}`;
    const slug = p.replace(/[\/:?&=]/g, '_') || 'root';
    await run(url, 'desktop', `${outDir}/desktop_${slug}`);
    await run(url, 'mobile', `${outDir}/mobile_${slug}`);
  }
  console.log(`\nLighthouse reports saved to: ${outDir}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
