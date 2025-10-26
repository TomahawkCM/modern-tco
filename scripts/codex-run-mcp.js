#!/usr/bin/env node
/**
 * Cross-platform Codex launcher that uses the Codex-only MCP config.
 * Usage: node scripts/codex-run-mcp.js <prompt-file>
 */
const { spawn } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node scripts/codex-run-mcp.js <prompt-file>');
  process.exit(1);
}

const prompt = args[0];
const root = process.cwd();
const mcpConfig = join(root, '.mcp.codex.json');

if (!existsSync(prompt)) {
  console.error(`Prompt not found: ${prompt}`);
  process.exit(1);
}
if (!existsSync(mcpConfig)) {
  console.error(`Missing MCP config: ${mcpConfig}`);
  process.exit(1);
}

const isWin = process.platform === 'win32';
const cmd = isWin
  ? 'powershell'
  : 'bash';
const cmdArgs = isWin
  ? ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/codex-run-mcp.ps1', '-Prompt', prompt]
  : ['scripts/codex-run-mcp.sh', prompt];

const child = spawn(cmd, cmdArgs, {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));

