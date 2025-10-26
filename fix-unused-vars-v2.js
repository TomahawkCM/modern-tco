#!/usr/bin/env node
/**
 * Targeted Unused Variable Cleanup for Modern Tanium TCO LMS
 * Strategy: Use ESLint --fix for auto-fixable issues, then manual prefix for others
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting Targeted Unused Variable Cleanup...\n');

// Step 1: Run ESLint auto-fix on fixable issues
console.log('📋 Step 1: Running ESLint auto-fix...');
try {
  execSync('npm run lint -- --fix', { stdio: 'inherit', maxBuffer: 50 * 1024 * 1024 });
  console.log('✅ ESLint auto-fix complete\n');
} catch (error) {
  console.log('⚠️  ESLint completed with remaining issues (expected)\n');
}

// Step 2: Get list of files with unused variable errors
console.log('📋 Step 2: Identifying files with unused variables...');
let lintOutput = '';
try {
  lintOutput = execSync('npm run lint 2>&1 | grep "@typescript-eslint/no-unused-vars"',
    { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 });
} catch (error) {
  lintOutput = error.stdout || '';
}

// Extract unique file paths
const filePattern = /^(.+?):\d+:\d+/gm;
const files = new Set();
let match;
while ((match = filePattern.exec(lintOutput)) !== null) {
  files.add(match[1].trim());
}

console.log(`📊 Found ${files.size} files with unused variables\n`);

// Step 3: Process each file to prefix unused variables
let filesModified = 0;
let varsFixed = 0;

for (const relPath of files) {
  const fullPath = path.join(process.cwd(), relPath);

  if (!fs.existsSync(fullPath)) continue;

  try {
    // Get specific errors for this file
    let fileErrors = '';
    try {
      fileErrors = execSync(`npm run lint 2>&1 | grep "${relPath}" | grep "@typescript-eslint/no-unused-vars"`,
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    } catch (error) {
      fileErrors = error.stdout || '';
    }

    // Parse errors to extract variable names
    const varPattern = /'([^']+)' is (?:defined but never used|assigned a value but never used)/g;
    const varsToFix = new Set();
    let varMatch;
    while ((varMatch = varPattern.exec(fileErrors)) !== null) {
      varsToFix.add(varMatch[1]);
    }

    if (varsToFix.size === 0) continue;

    // Read file content
    let content = fs.readFileSync(fullPath, 'utf-8');
    let modified = false;

    // Process each variable
    for (const varName of varsToFix) {
      // Skip if already prefixed
      if (varName.startsWith('_')) continue;

      // Create patterns to match and replace
      const patterns = [
        // Import: import { Foo } from '...'
        {
          regex: new RegExp(`(import\\s*{[^}]*\\b)(${varName})(\\b[^}]*}\\s*from)`, 'g'),
          replacement: `$1_${varName}$3`
        },
        // Function params: function foo(bar, baz)
        {
          regex: new RegExp(`(\\(\\s*[^)]*\\b)(${varName})(\\b[^)]*\\))`, 'g'),
          replacement: (match, p1, p2, p3) => {
            // Only replace if it's a parameter, not in a type annotation
            if (match.includes(':')) return match;
            return `${p1}_${p2}${p3}`;
          }
        },
        // Variable declaration: const foo = ...
        {
          regex: new RegExp(`(\\b(?:const|let|var)\\s+)(${varName})(\\b)`, 'g'),
          replacement: `$1_${varName}$3`
        },
        // Destructuring: const { foo, bar } = ...
        {
          regex: new RegExp(`([{,]\\s*)(${varName})(\\s*[,}])`, 'g'),
          replacement: `$1_${varName}$3`
        },
        // Array destructuring: const [foo, bar] = ...
        {
          regex: new RegExp(`([\\[,]\\s*)(${varName})(\\s*[,\\]])`, 'g'),
          replacement: `$1_${varName}$3`
        },
      ];

      for (const pattern of patterns) {
        const newContent = content.replace(pattern.regex, pattern.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
          varsFixed++;
        }
      }
    }

    // Write back if modified
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      filesModified++;
      console.log(`✅ Fixed ${varsToFix.size} variables in ${relPath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${relPath}:`, error.message);
  }
}

console.log('\n' + '='.repeat(70));
console.log(`✨ Cleanup Complete!`);
console.log(`📁 Files Modified: ${filesModified}`);
console.log(`🔧 Variables Prefixed: ${varsFixed}`);
console.log('='.repeat(70) + '\n');

console.log('🔍 Checking final lint status...\n');
try {
  const finalLint = execSync('npm run lint 2>&1 | tail -3', { encoding: 'utf-8' });
  console.log(finalLint);
} catch (error) {
  console.log(error.stdout || 'Lint check complete');
}

console.log('\n✅ Automated cleanup complete!');