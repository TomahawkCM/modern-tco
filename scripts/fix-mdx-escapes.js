#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Files to process
const moduleFiles = [
  'src/content/modules/00-tanium-platform-foundation.mdx',
  'src/content/modules/01-asking-questions.mdx',
  'src/content/modules/02-refining-questions-targeting.mdx',
  'src/content/modules/03-taking-action-packages-actions.mdx',
  'src/content/modules/04-navigation-basic-modules.mdx',
  'src/content/modules/05-reporting-data-export.mdx'
];

function escapeComparisons(content) {
  // Patterns to escape: <number, >number, <letter (but not JSX tags)
  // Don't escape if it's part of a JSX tag like <InfoBox, <PracticeButton, etc.

  // First, protect JSX tags by temporarily replacing them
  const jsxTags = [];
  let protectedContent = content.replace(/<\/?[A-Z][a-zA-Z0-9]*[^>]*>/g, (match) => {
    jsxTags.push(match);
    return `__JSX_TAG_${jsxTags.length - 1}__`;
  });

  // Now escape comparison operators
  // Replace < followed by digit or space-digit
  protectedContent = protectedContent.replace(/<(\d)/g, '&lt;$1');
  protectedContent = protectedContent.replace(/< (\d)/g, '&lt; $1');

  // Replace > followed by digit or space-digit
  protectedContent = protectedContent.replace(/>(\d)/g, '&gt;$1');
  protectedContent = protectedContent.replace(/> (\d)/g, '&gt; $1');

  // Also fix cases in markdown tables where we have |<number or |>number
  protectedContent = protectedContent.replace(/\|<(\d)/g, '|&lt;$1');
  protectedContent = protectedContent.replace(/\|>(\d)/g, '|&gt;$1');
  protectedContent = protectedContent.replace(/\| <(\d)/g, '| &lt;$1');
  protectedContent = protectedContent.replace(/\| >(\d)/g, '| &gt;$1');

  // Fix cases where we have space before < or > in lists or text
  protectedContent = protectedContent.replace(/ <(\d)/g, ' &lt;$1');
  protectedContent = protectedContent.replace(/ >(\d)/g, ' &gt;$1');

  // Restore JSX tags
  jsxTags.forEach((tag, index) => {
    protectedContent = protectedContent.replace(`__JSX_TAG_${index}__`, tag);
  });

  return protectedContent;
}

function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }

  console.log(`Processing ${filePath}...`);

  const content = fs.readFileSync(fullPath, 'utf8');
  const fixed = escapeComparisons(content);

  if (content !== fixed) {
    fs.writeFileSync(fullPath, fixed, 'utf8');
    console.log(`✓ Fixed MDX escapes in ${filePath}`);
  } else {
    console.log(`  No changes needed in ${filePath}`);
  }
}

console.log('Fixing MDX escape sequences...\n');

moduleFiles.forEach(processFile);

console.log('\nDone! All MDX files have been processed.');