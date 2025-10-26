#!/usr/bin/env node
/**
 * Sync Codex global MCP registry with project-local .mcp.codex.json
 * - Reads servers from .mcp.codex.json
 * - Adds any missing servers to Codex via `codex mcp add`
 * - Optionally persists environment variables globally (--with-env)
 * - Optionally replaces existing entries (--force)
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { stdio: 'pipe', encoding: 'utf8', ...opts });
}

function readDotenv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function resolveValue(str, envMap) {
  // Replace ${VAR} with envMap[VAR] if present
  return String(str).replace(/\$\{([^}]+)\}/g, (_, k) => envMap[k] ?? process.env[k] ?? '');
}

function main() {
  const root = process.cwd();
  const argv = process.argv.slice(2);
  const withEnv = argv.includes('--with-env') || argv.includes('-e');
  const force = argv.includes('--force') || argv.includes('-f') || argv.includes('--update');

  const configPath = path.join(root, '.mcp.codex.json');
  if (!fs.existsSync(configPath)) {
    console.error(`Missing .mcp.codex.json at ${configPath}`);
    process.exit(1);
  }

  // Load env maps from .env.local and .env.mcp (local wins)
  const envMcp = readDotenv(path.join(root, '.env.mcp'));
  const envLocal = readDotenv(path.join(root, '.env.local'));
  const envMap = { ...envMcp, ...envLocal, ...process.env };

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const servers = config.mcpServers || {};
  const names = Object.keys(servers);
  if (names.length === 0) {
    console.log('No servers found in .mcp.codex.json');
    return;
  }

  console.log(`Syncing ${names.length} MCP server(s) into Codex global registry${withEnv ? ' with env' : ''}${force ? ' (force)' : ''}...`);

  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (const name of names) {
    const entry = servers[name];
    if (!entry || !entry.command) {
      console.warn(`- ${name}: invalid entry (missing command), skipping`);
      skipped++;
      continue;
    }

    // Check existence
    const exists = run('codex', ['mcp', 'get', '--json', name]).status === 0;

    if (exists && !force && !withEnv) {
      console.log(`- ${name}: already present (skipped)`);
      skipped++;
      continue;
    }

    if (exists && (force || withEnv)) {
      const rem = run('codex', ['mcp', 'remove', name]);
      if (rem.status !== 0) {
        console.error(`- ${name}: failed to remove existing entry`);
        if (rem.stdout) process.stdout.write(rem.stdout);
        if (rem.stderr) process.stderr.write(rem.stderr);
        failed++;
        continue;
      }
    }

    const cmd = entry.command;
    const args = Array.isArray(entry.args) ? entry.args : [];

    // Prepare env opts
    const envOpts = [];
    if (withEnv && entry.env && typeof entry.env === 'object') {
      const resolved = {};
      for (const [k, v] of Object.entries(entry.env)) {
        let val = resolveValue(v, envMap);
        if (k === 'DATABASE_URL') {
          const fallback = envMap['SUPABASE_DB_URL'] || '';
          const looksPlaceholder = !val || /localhost|username:password/.test(String(val));
          if (!val && fallback) val = fallback;
          else if (looksPlaceholder && fallback) val = fallback;
        }
        if (val) {
          resolved[k] = val;
        }
      }
      for (const [k, v] of Object.entries(resolved)) {
        envOpts.push('--env', `${k}=${v}`);
      }
    }

    // Build args: codex mcp add [--env KEY=VALUE]... <name> -- <command> <args...>
    const addArgs = ['mcp', 'add', ...envOpts, name, '--', cmd, ...args];
    const res = run('codex', addArgs);
    if (res.status === 0) {
      console.log(`- ${name}: added` + (envOpts.length ? ' with env' : ''));
      added++;
    } else {
      console.error(`- ${name}: failed to add`);
      if (res.stdout) process.stdout.write(res.stdout);
      if (res.stderr) process.stderr.write(res.stderr);
      failed++;
    }
  }

  console.log(`Done. Added: ${added}, Skipped: ${skipped}, Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main();
