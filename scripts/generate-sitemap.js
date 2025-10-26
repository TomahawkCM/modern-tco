#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
const BASE_PATH = '/tanium';

const staticPages = [
  '',
  '/welcome',
  '/auth/signin',
  '/auth/signup',
  '/pricing',
  '/dashboard',
  '/practice',
  '/mock',
  '/review',
  '/exam',
  '/simulator',
  '/study',
  '/learn',
  '/modules',
  '/videos',
  '/kb',
  '/guides',
  '/progress',
  '/analytics',
  '/assessments',
  '/notes',
  '/profile',
  '/settings',
  '/team',
];

const modulePages = [
  '/learn/asking-questions',
  '/learn/refining-questions',
  '/learn/taking-action',
  '/learn/navigation-modules',
  '/learn/reporting-export',
  '/learn/query-builder',
];

const domainPages = [
  '/domains/tanium-console-navigation',
  '/domains/asking-questions',
  '/domains/refining-questions',
  '/domains/taking-action-and-remediating',
  '/domains/reporting-and-data-export',
];

const videoPages = [
  '/videos/asking-questions',
  '/videos/refining-questions',
  '/videos/taking-action',
  '/videos/navigation-modules',
  '/videos/reporting-export',
];

function generateSitemap() {
  const allPages = [
    ...staticPages,
    ...modulePages,
    ...domainPages,
    ...videoPages,
  ];

  const currentDate = new Date().toISOString().split('T')[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map((page) => {
    const fullPath = `${DOMAIN}${BASE_PATH}${page}`;
    const priority = getPriority(page);
    const changeFreq = getChangeFrequency(page);

    return `  <url>
    <loc>${fullPath}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return sitemap;
}

function getPriority(page) {
  if (page === '' || page === '/welcome') return '1.0';
  if (page === '/dashboard' || page === '/practice' || page === '/mock') return '0.9';
  if (page.startsWith('/learn/') || page.startsWith('/modules/')) return '0.8';
  if (page === '/pricing' || page === '/auth/signin') return '0.7';
  if (page.startsWith('/domains/') || page.startsWith('/videos/')) return '0.6';
  return '0.5';
}

function getChangeFrequency(page) {
  if (page === '' || page === '/welcome' || page === '/dashboard') return 'daily';
  if (page.startsWith('/learn/') || page.startsWith('/practice')) return 'weekly';
  if (page === '/pricing' || page.startsWith('/auth/')) return 'monthly';
  return 'weekly';
}

const sitemap = generateSitemap();
const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

fs.writeFileSync(outputPath, sitemap, 'utf8');

console.log(`✅ Sitemap generated successfully at ${outputPath}`);
console.log(`📊 Total URLs: ${[...staticPages, ...modulePages, ...domainPages, ...videoPages].length}`);