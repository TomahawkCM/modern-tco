#!/usr/bin/env node
/**
 * Content Scraping Script using agent-browser
 *
 * Purpose: Scrape web content to populate LMS modules
 * - Navigate to documentation URLs
 * - Extract structured content via snapshots
 * - Output JSON for content pipeline
 *
 * Usage:
 *   npm run browser:scrape -- --url "https://docs.example.com" --output ./scraped.json
 *   npm run browser:scrape -- --urls urls.txt --output ./content/
 *   npm run browser:scrape -- --sitemap https://docs.example.com/sitemap.xml
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};

const url = getArg('--url');
const urlsFile = getArg('--urls');
const sitemap = getArg('--sitemap');
const outputPath = getArg('--output') || './scraped-content.json';
const selector = getArg('--selector'); // Optional CSS selector to focus on
const maxPages = parseInt(getArg('--max-pages') || '10', 10);
const delay = parseInt(getArg('--delay') || '1000', 10);

/**
 * Execute agent-browser command using execFileSync (safe from injection)
 */
function execBrowser(commandArgs) {
  try {
    const result = execFileSync('npx', ['agent-browser', ...commandArgs], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000,
    });
    return result.trim();
  } catch (error) {
    console.error(`Browser command failed: ${commandArgs.join(' ')}`);
    console.error(error.message);
    return null;
  }
}

/**
 * Parse snapshot output to extract structured content
 */
function parseSnapshot(snapshotOutput) {
  if (!snapshotOutput) return null;

  const lines = snapshotOutput.split('\n');
  const elements = [];

  for (const line of lines) {
    // Parse element refs like "@e1 [button] Submit"
    const match = line.match(/@e(\d+)\s+\[([^\]]+)\]\s*(.*)/);
    if (match) {
      elements.push({
        ref: `@e${match[1]}`,
        type: match[2],
        text: match[3].trim(),
      });
    }
  }

  return {
    raw: snapshotOutput,
    elements,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Scrape a single URL
 */
async function scrapeUrl(targetUrl) {
  console.log(`Scraping: ${targetUrl}`);

  // Open the URL
  execBrowser(['open', targetUrl]);

  // Wait for page to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Get page snapshot
  const snapshot = execBrowser(['snapshot', '-i']);
  const parsed = parseSnapshot(snapshot);

  // Get page title
  const title = execBrowser(['get', 'title']);

  // Get page URL (may have redirected)
  const currentUrl = execBrowser(['get', 'url']);

  // Extract main content if selector provided
  let mainContent = null;
  if (selector) {
    mainContent = execBrowser(['get', 'text', selector]);
  }

  return {
    url: targetUrl,
    currentUrl: currentUrl?.replace(/['"]/g, ''),
    title: title?.replace(/['"]/g, ''),
    snapshot: parsed,
    mainContent,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Main scraping workflow
 */
async function main() {
  console.log('Agent-Browser Content Scraper');
  console.log('=============================\n');

  const results = [];
  const urls = [];

  // Collect URLs to scrape
  if (url) {
    urls.push(url);
  }

  if (urlsFile && fs.existsSync(urlsFile)) {
    const fileUrls = fs.readFileSync(urlsFile, 'utf-8')
      .split('\n')
      .map(u => u.trim())
      .filter(u => u && !u.startsWith('#'));
    urls.push(...fileUrls);
  }

  if (sitemap) {
    console.log(`Fetching sitemap: ${sitemap}`);
    execBrowser(['open', sitemap]);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const sitemapContent = execBrowser(['get', 'html', 'body']);

    // Extract URLs from sitemap XML
    const urlMatches = sitemapContent?.match(/<loc>([^<]+)<\/loc>/g) || [];
    const sitemapUrls = urlMatches
      .map(m => m.replace(/<\/?loc>/g, ''))
      .slice(0, maxPages);
    urls.push(...sitemapUrls);
  }

  if (urls.length === 0) {
    console.log('Usage:');
    console.log('  npm run browser:scrape -- --url "https://example.com"');
    console.log('  npm run browser:scrape -- --urls urls.txt --output ./content/');
    console.log('  npm run browser:scrape -- --sitemap https://example.com/sitemap.xml');
    console.log('\nOptions:');
    console.log('  --url <url>        Single URL to scrape');
    console.log('  --urls <file>      File with URLs (one per line)');
    console.log('  --sitemap <url>    XML sitemap URL');
    console.log('  --output <path>    Output file or directory');
    console.log('  --selector <css>   CSS selector for main content');
    console.log('  --max-pages <n>    Max pages from sitemap (default: 10)');
    console.log('  --delay <ms>       Delay between pages (default: 1000)');
    process.exit(1);
  }

  // Limit to maxPages
  const urlsToScrape = urls.slice(0, maxPages);
  console.log(`Scraping ${urlsToScrape.length} URL(s)...\n`);

  // Scrape each URL
  for (let i = 0; i < urlsToScrape.length; i++) {
    const targetUrl = urlsToScrape[i];

    try {
      const result = await scrapeUrl(targetUrl);
      results.push(result);
      console.log(`  [${i + 1}/${urlsToScrape.length}] Done: ${result.title || targetUrl}`);
    } catch (error) {
      console.error(`  [${i + 1}/${urlsToScrape.length}] Failed: ${targetUrl}`);
      console.error(`    Error: ${error.message}`);
      results.push({
        url: targetUrl,
        error: error.message,
        scrapedAt: new Date().toISOString(),
      });
    }

    // Delay between requests
    if (i < urlsToScrape.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Close browser
  execBrowser(['close']);

  // Save results
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const output = {
    metadata: {
      totalUrls: urlsToScrape.length,
      successCount: results.filter(r => !r.error).length,
      failCount: results.filter(r => r.error).length,
      scrapedAt: new Date().toISOString(),
    },
    results,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);
  console.log(`Success: ${output.metadata.successCount}/${output.metadata.totalUrls}`);
}

main().catch(console.error);
