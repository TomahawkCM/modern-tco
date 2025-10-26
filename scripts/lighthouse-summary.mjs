#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function pct(cat) { return Math.round(((cat && cat.score) || 0) * 100); }

function findLatest(dir) {
  const base = join(process.cwd(), dir);
  const entries = readdirSync(base)
    .map((name) => ({ name, path: join(base, name), mtime: statSync(join(base, name)).mtimeMs }))
    .filter((e) => statSync(e.path).isDirectory())
    .sort((a, b) => b.mtime - a.mtime);
  return entries[0]?.path || null;
}

function main() {
  const latest = findLatest('reports/lighthouse');
  if (!latest) {
    console.error('No Lighthouse reports found under reports/lighthouse');
    process.exit(1);
  }
  const files = readdirSync(latest).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    console.error('No JSON reports found in', latest);
    process.exit(1);
  }
  console.log('Summary for:', latest);
  for (const f of files) {
    try {
      const j = JSON.parse(readFileSync(join(latest, f), 'utf8'));
      const cats = j.categories || {};
      console.log(
        `${j.requestedUrl} => Perf ${pct(cats.performance)} | A11Y ${pct(cats.accessibility)} | BP ${pct(cats['best-practices'])} | SEO ${pct(cats.seo)}`
      );
    } catch {}
  }
}

main();

