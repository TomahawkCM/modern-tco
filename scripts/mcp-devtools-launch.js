#!/usr/bin/env node
/**
 * Cross-platform launcher for the Chrome DevTools MCP server.
 *
 * Responsibilities:
 *  - Ensure Chrome for Testing (CfT) is installed under the project-local .chrome directory
 *  - Resolve the correct chrome executable for the current platform
 *  - Spawn chrome-devtools-mcp@latest using that executable in headless mode
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, spawnSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const chromeDir = path.join(projectRoot, '.chrome');
const logFile = path.join(chromeDir, 'devtools-mcp.log');

function resolveCommand(baseCommand, platform = os.platform()) {
  return platform === 'win32' ? `${baseCommand}.cmd` : baseCommand;
}

function listSubdirectories(dir) {
  try {
    return fs
      .readdirSync(dir)
      .map((name) => path.join(dir, name))
      .filter((fullPath) => {
        try {
          return fs.statSync(fullPath).isDirectory();
        } catch (error) {
          return false;
        }
      });
  } catch (error) {
    return [];
  }
}

function resolveChromeBinary(baseDir, platform = os.platform()) {
  const chromeRoot = path.join(baseDir, 'chrome');
  const candidates = listSubdirectories(chromeRoot);
  if (candidates.length === 0) return null;

  candidates.sort((a, b) =>
    path.basename(b).localeCompare(path.basename(a), undefined, { numeric: true, sensitivity: 'base' })
  );

  const tryPathsForPlatform = (platformId, dir) => {
    switch (platformId) {
      case 'darwin':
        return [
          path.join(dir, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
          path.join(dir, 'chrome-mac-arm64', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
        ];
      case 'win32':
        return [
          path.join(dir, 'chrome-win64', 'chrome.exe'),
          path.join(dir, 'chrome-win32', 'chrome.exe'),
        ];
      case 'linux':
      default:
        return [
          path.join(dir, 'chrome-linux64', 'chrome'),
          path.join(dir, 'chrome-linux', 'chrome'),
        ];
    }
  };

  for (const dir of candidates) {
    const maybeBins = tryPathsForPlatform(platform, dir);
    for (const candidate of maybeBins) {
      if (candidate && fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function ensureChromeBinary(baseDir, platform = os.platform()) {
  let chromeBin = resolveChromeBinary(baseDir, platform);
  if (chromeBin) {
    return chromeBin;
  }

  console.log(`[mcp-devtools] Chrome for Testing not found. Installing to ${baseDir} ...`);
  fs.mkdirSync(baseDir, { recursive: true });

  const installResult = spawnSync(resolveCommand('npx', platform), [
    '-y',
    '@puppeteer/browsers',
    'install',
    'chrome@stable',
    '--path',
    baseDir,
  ], {
    stdio: 'inherit',
    cwd: projectRoot,
    env: process.env,
  });

  if (installResult.status !== 0) {
    throw new Error(`Failed to install Chrome for Testing (exit code ${installResult.status})`);
  }

  chromeBin = resolveChromeBinary(baseDir, platform);
  if (!chromeBin) {
    throw new Error(`Chrome for Testing installation succeeded but executable not found under ${baseDir}`);
  }

  return chromeBin;
}

function forwardSignal(child, signal) {
  process.on(signal, () => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

function launchChromeDevtoolsMcp() {
  const platform = os.platform();
  const chromeBin = ensureChromeBinary(chromeDir, platform);

  console.log(`[mcp-devtools] Using Chrome: ${chromeBin}`);

  const args = [
    '-y',
    'chrome-devtools-mcp@latest',
    '--executablePath',
    chromeBin,
    '--headless',
    '--isolated=false',
    '--logFile',
    logFile,
  ];

  const child = spawn(resolveCommand('npx', platform), args, {
    stdio: 'inherit',
    cwd: projectRoot,
    env: process.env,
  });

  child.on('error', (error) => {
    console.error(`[mcp-devtools] Failed to launch chrome-devtools-mcp: ${error.message}`);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });

  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => forwardSignal(child, signal));
}

if (require.main === module) {
  try {
    launchChromeDevtoolsMcp();
  } catch (error) {
    console.error(`[mcp-devtools] ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  resolveChromeBinary,
};
