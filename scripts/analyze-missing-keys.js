#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const en = JSON.parse(fs.readFileSync('./src/i18n/messages/en.json', 'utf8'));
const enUS = JSON.parse(fs.readFileSync('./src/i18n/messages/en-US.json', 'utf8'));

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? prefix + '.' + key : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = getAllKeys(en);
const enUSKeys = getAllKeys(enUS);

const missing = enKeys.filter(k => !enUSKeys.includes(k));
const topLevelMissing = {};
missing.forEach(k => {
  const top = k.split('.')[0];
  topLevelMissing[top] = (topLevelMissing[top] || 0) + 1;
});

console.log('en.json total keys:', enKeys.length);
console.log('en-US.json total keys:', enUSKeys.length);
console.log('Missing keys:', missing.length);
console.log('\nMissing by namespace:');
Object.entries(topLevelMissing).sort((a,b) => b[1] - a[1]).forEach(([ns, count]) => {
  console.log('  ' + ns + ': ' + count + ' keys');
});

// Also show what's IN en-US (translated already)
const translatedNamespaces = {};
enUSKeys.forEach(k => {
  const top = k.split('.')[0];
  translatedNamespaces[top] = (translatedNamespaces[top] || 0) + 1;
});

console.log('\nAlready translated namespaces:');
Object.entries(translatedNamespaces).sort((a,b) => b[1] - a[1]).forEach(([ns, count]) => {
  console.log('  ' + ns + ': ' + count + ' keys');
});
