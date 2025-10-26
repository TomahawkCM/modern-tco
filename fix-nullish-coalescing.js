#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript/TSX files with nullish coalescing errors
const lintOutput = execSync('npm run lint 2>&1 || true', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

// Parse lint output for nullish coalescing errors
const nullishErrors = [];
const lines = lintOutput.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('prefer-nullish-coalescing')) {
    // Get file and line from previous line
    const match = lines[i].match(/^\s*(\d+):(\d+)\s+error/);
    if (match && i > 0) {
      // Find file path
      let j = i - 1;
      while (j >= 0 && !lines[j].startsWith('/')) {
        j--;
      }
      if (j >= 0) {
        const filePath = lines[j].trim();
        const lineNum = parseInt(match[1]);
        nullishErrors.push({ file: filePath, line: lineNum });
      }
    }
  }
}

// Group errors by file
const errorsByFile = {};
nullishErrors.forEach(err => {
  if (!errorsByFile[err.file]) {
    errorsByFile[err.file] = [];
  }
  errorsByFile[err.file].push(err.line);
});

console.log(`Found ${Object.keys(errorsByFile).length} files with nullish coalescing issues`);

// Fix patterns for nullish coalescing
const fixPatterns = [
  // Simple || to ??
  {
    pattern: /(\w+(?:\.\w+)*)\s*\|\|\s*('|")([^'"]*)\2/g,
    replacement: '$1 ?? $2$3$2'
  },
  {
    pattern: /(\w+(?:\.\w+)*)\s*\|\|\s*(\d+)/g,
    replacement: '$1 ?? $2'
  },
  {
    pattern: /(\w+(?:\.\w+)*)\s*\|\|\s*(true|false|null|undefined)/g,
    replacement: '$1 ?? $2'
  },
  {
    pattern: /(\w+(?:\.\w+)*)\s*\|\|\s*(\w+(?:\.\w+)*)/g,
    replacement: '$1 ?? $2'
  },
  {
    pattern: /(\w+(?:\.\w+)*)\s*\|\|\s*(\[)/g,
    replacement: '$1 ?? $2'
  },
  {
    pattern: /(\w+(?:\.\w+)*)\s*\|\|\s*(\{)/g,
    replacement: '$1 ?? $2'
  }
];

let totalFixed = 0;

Object.keys(errorsByFile).forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fixes = 0;

    // Apply fix patterns
    fixPatterns.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fixes += matches.length;
      }
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${fixes} issues in ${path.basename(filePath)}`);
      totalFixed += fixes;
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
});

console.log(`\nTotal fixes applied: ${totalFixed}`);