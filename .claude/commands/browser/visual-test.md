# visual-test

Run visual regression tests on LMS pages.

## Usage
```bash
npm run browser:visual-test [options]
```

## Options
- `--base-url <url>` - Base URL (default: http://localhost:3000)
- `--pages <paths>` - Comma-separated page paths
- `--output <dir>` - Report output directory
- `--screenshots <dir>` - Screenshot directory
- `--verbose` - Verbose output

## Examples
```bash
# Test default pages
npm run browser:visual-test

# Custom base URL
npm run browser:visual-test -- --base-url http://localhost:3001

# Specific pages
npm run browser:visual-test -- --pages /welcome,/practice,/mock

# With verbose output
npm run browser:visual-test -- --verbose
```
