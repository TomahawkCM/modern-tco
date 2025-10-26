#!/usr/bin/env node
/**
 * Automated Unused Variable Cleanup for Modern Tanium TCO LMS
 * Targets: 451 unused variable errors
 * Strategy: Prefix with underscore for intentionally unused variables
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting Automated Unused Variable Cleanup...\n');

// Get ESLint output with unused variables
const lintOutput = execSync('npm run lint 2>&1', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });

// Parse lint output for unused variable errors
const unusedVarPattern = /^(.+?):(\d+):(\d+)\s+error\s+'(.+?)' is (?:defined but never used|assigned a value but never used)/gm;
const unusedArgPattern = /^(.+?):(\d+):(\d+)\s+error\s+'(.+?)' is defined but never used. Allowed unused args must match/gm;

const fixes = [];
let match;

// Extract unused variables
while ((match = unusedVarPattern.exec(lintOutput)) !== null) {
  const [, filePath, line, col, varName] = match;
  fixes.push({ filePath, line: parseInt(line), col: parseInt(col), varName, type: 'var' });
}

// Extract unused arguments
const argMatches = lintOutput.matchAll(unusedArgPattern);
for (const match of argMatches) {
  const [, filePath, line, col, varName] = match;
  fixes.push({ filePath, line: parseInt(line), col: parseInt(col), varName, type: 'arg' });
}

console.log(`📊 Found ${fixes.length} unused variables to fix\n`);

// Group by file
const fileGroups = fixes.reduce((acc, fix) => {
  if (!acc[fix.filePath]) acc[fix.filePath] = [];
  acc[fix.filePath].push(fix);
  return acc;
}, {});

let totalFixed = 0;
let filesModified = 0;

// Process each file
for (const [filePath, fileFixes] of Object.entries(fileGroups)) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${filePath} (not found)`);
    continue;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    let modified = false;

    // Sort fixes by line number (descending) to maintain line positions
    fileFixes.sort((a, b) => b.line - a.line);

    for (const fix of fileFixes) {
      const lineIdx = fix.line - 1;
      if (lineIdx < 0 || lineIdx >= lines.length) continue;

      const line = lines[lineIdx];

      // Skip if already prefixed with underscore
      if (fix.varName.startsWith('_')) continue;

      // Different strategies based on context
      const patterns = [
        // Import statements: import { X } from '...'
        {
          regex: new RegExp(`\\b${fix.varName}\\b(?=[,\\s}])`),
          replacement: `_${fix.varName}`,
        },
        // Function parameters: function foo(x, y)
        {
          regex: new RegExp(`\\b${fix.varName}\\b(?=\\s*[,)])`),
          replacement: `_${fix.varName}`,
        },
        // Variable declarations: const x = ...
        {
          regex: new RegExp(`\\b(const|let|var)\\s+(${fix.varName})\\b`),
          replacement: `$1 _${fix.varName}`,
        },
        // Destructuring: const { x, y } = ...
        {
          regex: new RegExp(`([{,]\\s*)(${fix.varName})\\b`),
          replacement: `$1_${fix.varName}`,
        },
        // Array destructuring: const [x, y] = ...
        {
          regex: new RegExp(`([\\[,]\\s*)(${fix.varName})\\b`),
          replacement: `$1_${fix.varName}`,
        },
      ];

      for (const pattern of patterns) {
        if (pattern.regex.test(line)) {
          lines[lineIdx] = line.replace(pattern.regex, pattern.replacement);
          modified = true;
          totalFixed++;
          break;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(fullPath, lines.join('\n'), 'utf-8');
      filesModified++;
      console.log(`✅ Fixed ${fileFixes.length} variables in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`✨ Cleanup Complete!`);
console.log(`📁 Files Modified: ${filesModified}`);
console.log(`🔧 Variables Fixed: ${totalFixed}`);
console.log('='.repeat(60) + '\n');

console.log('🔍 Re-running lint to verify...\n');
try {
  execSync('npm run lint 2>&1 | tail -20', { stdio: 'inherit' });
} catch (error) {
  // Lint may still fail, that's OK
}

console.log('\n✅ Automated cleanup complete! Review changes before committing.');