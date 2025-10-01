#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const PROJECT_ROOT = __dirname;
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// Fix patterns
const FIXES = {
  // Fix floating promises
  floatingPromises: {
    pattern: /(\s+)(router\.(push|replace|prefetch|refresh|back|forward)\([^)]+\))(;|\s|$)/g,
    replacement: '$1void $2$3'
  },

  // Fix unescaped apostrophes
  unescapedApostrophe: {
    pattern: /([>])([^<]*)'([^<]*[<])/g,
    replacement: (match, p1, p2, p3) => {
      // Don't replace in code blocks or attributes
      if (match.includes('className') || match.includes('href')) return match;
      return `${p1}${p2}{'${p3}`;
    }
  },

  // Fix unescaped quotes
  unescapedQuote: {
    pattern: /([>])([^<]*)"([^<]*[<])/g,
    replacement: (match, p1, p2, p3) => {
      // Don't replace in code blocks or attributes
      if (match.includes('className') || match.includes('href')) return match;
      return `${p1}${p2}{'"'}${p3}`;
    }
  },

  // Fix console.log statements (keep error and warn)
  consoleLogs: {
    pattern: /console\.log\([^)]*\);?/g,
    replacement: (match) => {
      // Comment out instead of removing to preserve debugging info
      return `// ${match}`;
    }
  },

  // Fix module variable assignments
  moduleVariable: {
    pattern: /\b(const|let|var)\s+module\s*=/g,
    replacement: '$1 studyModule ='
  },

  // Fix onClick with async functions
  asyncOnClick: {
    pattern: /onClick=\{async\s+(\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>\s*\{/g,
    replacement: 'onClick={$1 => void (async () => {'
  },

  // Fix onChange with async functions
  asyncOnChange: {
    pattern: /onChange=\{async\s+(\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>\s*\{/g,
    replacement: 'onChange={$1 => void (async () => {'
  },

  // Fix onSubmit with async functions
  asyncOnSubmit: {
    pattern: /onSubmit=\{async\s+(\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>\s*\{/g,
    replacement: 'onSubmit={$1 => void (async () => {'
  },

  // Fix setTimeout with promises
  setTimeoutPromise: {
    pattern: /setTimeout\(\(\)\s*=>\s*{\s*([^}]+\(\))\s*}/g,
    replacement: (match, p1) => {
      if (!p1.includes('void') && (p1.includes('router.') || p1.includes('navigate'))) {
        return match.replace(p1, `void ${p1}`);
      }
      return match;
    }
  },

  // Fix unnecessary async without await
  unnecessaryAsync: {
    pattern: /async\s+(\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>\s*{([^}]*)}(?!.*await)/g,
    replacement: (match, p1, p2) => {
      // Only remove async if body doesn't contain await
      if (!p2.includes('await')) {
        return `${p1} => {${p2}}`;
      }
      return match;
    }
  }
};

// File processor
function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
    return { filePath, changes: 0 };
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changes = 0;

  // Apply fixes
  Object.entries(FIXES).forEach(([fixName, fix]) => {
    const before = content;
    content = content.replace(fix.pattern, fix.replacement);
    if (before !== content) {
      changes++;
      console.log(`  ✓ Applied ${fixName} to ${path.relative(PROJECT_ROOT, filePath)}`);
    }
  });

  // Write back if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return { filePath, changes };
}

// Main execution
async function main() {
  console.log('🔧 Starting automated lint error fixes...\n');

  const patterns = [
    'src/**/*.tsx',
    'src/**/*.ts'
  ];

  let totalFiles = 0;
  let filesChanged = 0;
  let totalChanges = 0;

  for (const pattern of patterns) {
    const files = glob.sync(pattern, { cwd: PROJECT_ROOT });

    for (const file of files) {
      const fullPath = path.join(PROJECT_ROOT, file);
      const result = processFile(fullPath);
      totalFiles++;

      if (result.changes > 0) {
        filesChanged++;
        totalChanges += result.changes;
      }
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  Files processed: ${totalFiles}`);
  console.log(`  Files changed: ${filesChanged}`);
  console.log(`  Total fixes applied: ${totalChanges}`);
  console.log('\n✅ Automated fixes complete!');
  console.log('\nNext steps:');
  console.log('1. Run "npm run lint" to see remaining issues');
  console.log('2. Run "npm run typecheck" to verify TypeScript compilation');
  console.log('3. Test the application to ensure fixes didn\'t break functionality');
}

// Run
main().catch(console.error);