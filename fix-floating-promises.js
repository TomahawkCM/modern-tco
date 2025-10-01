#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript/TSX files with floating promise errors
const lintOutput = execSync('npm run lint 2>&1 || true', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

// Common promise-returning functions that need void
const promisePatterns = [
  // Router methods
  { pattern: /^(\s+)(router\.(push|replace|prefetch|refresh|back|forward)\([^)]+\));?$/gm, replacement: '$1void $2;' },
  // SignOut/SignIn/Auth methods
  { pattern: /^(\s+)(signOut\(\))/gm, replacement: '$1void $2' },
  { pattern: /^(\s+)(signIn\([^)]+\))/gm, replacement: '$1void $2' },
  // Analytics capture
  { pattern: /^(\s+)(analytics\.(capture|pageview|identify)\([^)]+\));?$/gm, replacement: '$1void $2;' },
  // Async function calls without await
  { pattern: /^(\s+)([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\))\s*;?\s*\/\/\s*@floating$/gm, replacement: '$1void $2;' },
  // Promise method chains
  { pattern: /^(\s+)([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*\([^)]*\)\.(?:then|catch|finally)\([^)]*\));?$/gm, replacement: '$1void $2;' },
];

// Parse errors from lint output
const floatingErrors = [];
const lines = lintOutput.split('\n');
let currentFile = '';

lines.forEach((line, i) => {
  if (line.startsWith('/')) {
    currentFile = line.trim();
  } else if (line.includes('no-floating-promises')) {
    const match = line.match(/^\s*(\d+):(\d+)\s+error/);
    if (match && currentFile) {
      floatingErrors.push({
        file: currentFile,
        line: parseInt(match[1]),
        col: parseInt(match[2])
      });
    }
  }
});

// Group by file
const errorsByFile = {};
floatingErrors.forEach(err => {
  if (!errorsByFile[err.file]) {
    errorsByFile[err.file] = [];
  }
  errorsByFile[err.file].push(err.line);
});

console.log(`Found ${Object.keys(errorsByFile).length} files with floating promise issues`);

let totalFixed = 0;

// Fix each file
Object.keys(errorsByFile).forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const errorLines = errorsByFile[filePath];
    let fixes = 0;

    // Process each error line
    errorLines.forEach(lineNum => {
      const lineIndex = lineNum - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];

        // Check common patterns
        if (line.includes('router.') && !line.includes('void ') && !line.includes('await ')) {
          lines[lineIndex] = line.replace(/(^\s*)(router\.[a-zA-Z]+\([^)]+\))/g, '$1void $2');
          fixes++;
        } else if (line.includes('signOut()') && !line.includes('void ') && !line.includes('await ')) {
          lines[lineIndex] = line.replace(/(^\s*)(signOut\(\))/g, '$1void $2');
          fixes++;
        } else if (line.includes('analytics.') && !line.includes('void ') && !line.includes('await ')) {
          lines[lineIndex] = line.replace(/(^\s*)(analytics\.[a-zA-Z]+\([^)]+\))/g, '$1void $2');
          fixes++;
        } else if (line.match(/^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\);?\s*$/) && !line.includes('void ') && !line.includes('await ')) {
          // Generic async function call
          lines[lineIndex] = line.replace(/(^\s*)([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\))/g, '$1void $2');
          fixes++;
        }
      }
    });

    if (fixes > 0) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log(`Fixed ${fixes} issues in ${path.basename(filePath)}`);
      totalFixed += fixes;
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
});

console.log(`\nTotal fixes applied: ${totalFixed}`);