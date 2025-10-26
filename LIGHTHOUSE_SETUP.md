# Lighthouse Configuration for WSL2 (Port 3001)

## ✅ Setup Complete

Lighthouse has been successfully configured to work on **port 3001** in your WSL2 environment.

## 🚀 Quick Start

```bash
# Start dev server on port 3001
npm run dev:3001

# Run quick Lighthouse audit
npm run lighthouse:quick

# Audit all routes
npm run lighthouse:all

# Run specific route
./run-lighthouse.sh http://localhost:3001/practice
```

## 📁 Files Created

### Configuration Files
- `.lighthouserc.json` - Lighthouse CI configuration
- `.env.lighthouse` - Environment variables for Chrome path

### Scripts
- `scripts/lighthouse-port3001.mjs` - Port 3001 specific runner
- `scripts/lighthouse-all-routes.mjs` - Comprehensive route auditing
- `scripts/setup-lighthouse-env.sh` - Environment setup script
- `run-lighthouse.sh` - Quick run convenience script

### NPM Scripts Added
```json
"lighthouse": "Run Lighthouse with Chrome path",
"lighthouse:3001": "Run on port 3001 routes",
"lighthouse:quick": "Quick single page audit",
"lighthouse:all": "Comprehensive all routes audit",
"lighthouse:ci": "Run Lighthouse CI",
"dev:3001": "Start dev server on port 3001"
```

## 🎯 Current Performance Baseline

Latest audit results (Port 3001):
- **Performance**: 30% 🔴
- **Accessibility**: 88% 🟡
- **Best Practices**: 100% 🟢
- **SEO**: 100% 🟢

## 🔧 Chrome Configuration

Using Playwright's Chromium at:
```
/home/robne/.cache/ms-playwright/chromium-1193/chrome-linux/chrome
```

### WSL2-Optimized Chrome Flags
```
--headless
--no-sandbox
--disable-dev-shm-usage
--disable-features=BlockInsecurePrivateNetworkRequests
--disable-setuid-sandbox
--allow-insecure-localhost
--ignore-certificate-errors
```

## 📊 Reports Location

All reports are saved to:
```
reports/lighthouse/[timestamp]/
```

Format options:
- HTML reports for visual review
- JSON reports for programmatic analysis

## 🐛 Troubleshooting

### Port 3001 not responding
```bash
# Ensure dev server is running
npm run dev:3001

# Check if port is in use
lsof -i :3001
```

### Chrome not found
```bash
# Install Chromium via Playwright
npx playwright install chromium

# Re-run setup
bash scripts/setup-lighthouse-env.sh
```

### Permission errors
```bash
# Make scripts executable
chmod +x scripts/*.mjs scripts/*.sh
chmod +x run-lighthouse.sh
```

## 💡 Tips

1. **Performance Optimization**: The current 30% performance score indicates opportunities for optimization
2. **Batch Auditing**: Use `npm run lighthouse:all` for comprehensive route analysis
3. **CI Integration**: The `.lighthouserc.json` is ready for CI/CD pipeline integration
4. **Custom Routes**: Edit `scripts/lighthouse-all-routes.mjs` to add/remove routes

## 🔄 Environment Variables

The Chrome path is now persistent in:
1. `.env.lighthouse` (project-specific)
2. `~/.bashrc` (user-wide)
3. NPM scripts (hardcoded fallback)

This ensures Lighthouse works consistently across different terminal sessions.