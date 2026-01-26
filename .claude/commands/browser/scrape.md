# scrape

Scrape web content for LMS population.

## Usage
```bash
npm run browser:scrape -- [options]
```

## Options
- `--url <url>` - Single URL to scrape
- `--urls <file>` - File with URLs (one per line)
- `--sitemap <url>` - XML sitemap URL
- `--output <path>` - Output file
- `--selector <css>` - CSS selector for main content
- `--max-pages <n>` - Max pages from sitemap (default: 10)
- `--delay <ms>` - Delay between pages (default: 1000)

## Examples
```bash
# Single URL
npm run browser:scrape -- --url "https://docs.example.com" --output ./scraped.json

# From sitemap
npm run browser:scrape -- --sitemap https://docs.example.com/sitemap.xml --max-pages 20

# With content selector
npm run browser:scrape -- --url "https://docs.example.com" --selector "article.content"
```
