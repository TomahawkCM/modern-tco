#!/usr/bin/env node
/**
 * Bulk TypeScript Error Fixer
 * Systematically fixes common TypeScript strict mode errors
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  // Fix: Unnecessary nullish coalescing (TS2869)
  {
    pattern: /\|\|/g,
    replacement: '??',
    test: (line) => line.includes('||') && !line.includes('//') && !line.includes('console'),
    description: 'Replace || with ?? for nullish coalescing'
  },
  // Fix: Mixed ?? and || without parentheses (TS5076)
  {
    pattern: /(\w+)\s+\?\?\s+(\w+)\s+\|\|/g,
    replacement: '($1 ?? $2) ||',
    description: 'Add parentheses for mixed ?? and || operators'
  },
  {
    pattern: /(\w+)\s+\|\|\s+(\w+)\s+\?\?/g,
    replacement: '($1 || $2) ??',
    description: 'Add parentheses for mixed || and ?? operators'
  }
];

const filesToFix = [
  'src/components/CyberpunkNavigation.tsx',
  'src/components/confidence/ConfidenceBuilder.tsx',
  'src/components/exam/question-card.tsx',
  'src/components/labs/CheckpointValidator.tsx',
  'src/components/labs/ConsoleSimulator.tsx',
  'src/components/learning/LearningProgressTracker.tsx',
  'src/components/modules/ModuleProgressTracker.tsx',
  'src/components/modules/ModuleRenderer.tsx',
  'src/components/modules/ModulesGrid.tsx',
  'src/components/practice/Module3PracticeSession.tsx',
  'src/components/practice/PracticeSessionContainer.tsx',
  'src/components/query-builder/FilterBuilder.tsx',
  'src/components/query-builder/QueryPreview.tsx',
  'src/components/query-builder/QuestionBuilder.tsx',
  'src/components/query-builder/ResultsViewer.tsx'
];

let totalFixes = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skip: ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let fileFixCount = 0;

  fixes.forEach(fix => {
    const lines = content.split('\n');
    const newLines = lines.map(line => {
      if (fix.test && !fix.test(line)) return line;
      const newLine = line.replace(fix.pattern, fix.replacement);
      if (newLine !== line) fileFixCount++;
      return newLine;
    });
    content = newLines.join('\n');
  });

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath} (${fileFixCount} changes)`);
    totalFixes += fileFixCount;
  } else {
    console.log(`✓  No changes: ${filePath}`);
  }
});

console.log(`\n🎯 Total fixes applied: ${totalFixes}`);