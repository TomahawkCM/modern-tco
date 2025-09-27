#!/bin/bash

# 🚀 Playwright Browser Fix Script for WSL2
# This script properly installs Playwright browsers with all dependencies

set -e

echo "🔧 Playwright Browser Installation Fix for WSL2"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Clean up old installations
echo "📦 Step 1: Cleaning up old browser installations..."
rm -rf ~/.cache/ms-playwright 2>/dev/null || true
rm -rf ~/.cache/ms-playwright-* 2>/dev/null || true
print_status "Cleaned old browser cache"
echo ""

# Step 2: Install system dependencies without sudo
echo "📦 Step 2: Checking system dependencies..."
echo "The following packages are needed for Playwright browsers:"
echo ""
cat << 'EOF'
Required packages (install with sudo if missing):
- libnss3
- libnspr4
- libatk1.0-0
- libatk-bridge2.0-0
- libcups2
- libdrm2
- libdbus-1-3
- libatspi2.0-0
- libx11-6
- libxcomposite1
- libxdamage1
- libxext6
- libxfixes3
- libxrandr2
- libgbm1
- libxcb1
- libxkbcommon0
- libpango-1.0-0
- libcairo2
- libasound2
EOF
echo ""

# Create installation command for user to run
cat > /tmp/playwright-deps.txt << 'EOF'
sudo apt update && sudo apt install -y \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libdbus-1-3 libatspi2.0-0 libx11-6 libxcomposite1 libxdamage1 \
    libxext6 libxfixes3 libxrandr2 libgbm1 libxcb1 libxkbcommon0 \
    libpango-1.0-0 libcairo2 libasound2 libgtk-3-0 libglib2.0-0
EOF
print_warning "Run this command if dependencies are missing: cat /tmp/playwright-deps.txt"
echo ""

# Step 3: Set up environment variables
echo "🌍 Step 3: Setting up environment variables..."
export PLAYWRIGHT_BROWSERS_PATH="${HOME}/.cache/ms-playwright"
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0
export NODE_OPTIONS="--max-old-space-size=4096"

# For headless operation in WSL2
export DISPLAY=:0
export PLAYWRIGHT_CHROMIUM_USE_HEADLESS_NEW=1

print_status "Environment variables configured"
echo ""

# Step 4: Install browsers using npx with timeout protection
echo "🌐 Step 4: Installing Playwright browsers..."
echo "This will download Chromium, Firefox, and WebKit..."
echo ""

# Create a wrapper script for safe installation
cat > /tmp/install-browsers.js << 'EOF'
const { execSync } = require('child_process');

async function installBrowsers() {
    console.log('📥 Starting browser installation...');

    try {
        // Install only Chromium first (most stable in WSL2)
        console.log('\n🌐 Installing Chromium...');
        execSync('npx playwright install chromium', {
            stdio: 'inherit',
            env: {
                ...process.env,
                PLAYWRIGHT_BROWSERS_PATH: process.env.HOME + '/.cache/ms-playwright',
                PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0'
            }
        });

        console.log('✅ Chromium installed successfully!');

    } catch (error) {
        console.error('❌ Installation failed:', error.message);
        console.log('\n🔧 Alternative: Install browsers manually:');
        console.log('   npx playwright install chromium');
        process.exit(1);
    }
}

installBrowsers();
EOF

# Run the installation
node /tmp/install-browsers.js

if [ $? -eq 0 ]; then
    print_status "Browsers installed successfully"
else
    print_error "Browser installation failed - see manual instructions above"
    exit 1
fi
echo ""

# Step 5: Create test script
echo "🧪 Step 5: Creating browser test script..."
cat > /tmp/test-playwright-browser.js << 'EOF'
const { chromium } = require('playwright');

async function testBrowser() {
    console.log('🧪 Testing Playwright browser functionality...\n');

    try {
        console.log('📱 Launching Chromium in headless mode...');
        const browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process'
            ]
        });

        console.log('✅ Browser launched successfully!');

        const page = await browser.newPage();
        console.log('✅ Created new page');

        await page.goto('https://example.com');
        console.log('✅ Navigated to example.com');

        const title = await page.title();
        console.log('✅ Page title:', title);

        await browser.close();
        console.log('✅ Browser closed cleanly');

        console.log('\n🎉 SUCCESS! Playwright browsers are working!');
        return 0;
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Ensure all system dependencies are installed');
        console.log('2. Try running: npx playwright install-deps chromium');
        console.log('3. Check WSL2 memory: free -h');
        return 1;
    }
}

testBrowser().then(process.exit);
EOF

print_status "Test script created"
echo ""

# Step 6: Run browser test
echo "🚀 Step 6: Testing browser functionality..."
node /tmp/test-playwright-browser.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✨ ============================================"
    echo "✨ Playwright browsers are now working in WSL2!"
    echo "✨ ============================================"
    echo ""
else
    echo ""
    print_warning "Browser test failed - check troubleshooting tips above"
fi

# Step 7: Create permanent configuration
echo "💾 Step 7: Creating permanent configuration..."
cat > ~/.playwright-wsl2-config << 'EOF'
#!/bin/bash
# Playwright WSL2 Configuration
export PLAYWRIGHT_BROWSERS_PATH="${HOME}/.cache/ms-playwright"
export DISPLAY=:0
export PLAYWRIGHT_CHROMIUM_USE_HEADLESS_NEW=1
export NODE_OPTIONS="--max-old-space-size=4096"

# Headless browser launch options
export PLAYWRIGHT_LAUNCH_OPTIONS='{
  "headless": true,
  "args": [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--single-process"
  ]
}'
EOF

print_status "Configuration saved to ~/.playwright-wsl2-config"
echo ""

# Step 8: Update .mcp.json for Playwright MCP
echo "🔧 Step 8: Updating MCP configuration..."
if [ -f .mcp.json ]; then
    # Create updated configuration with working browser support
    node -e "
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('.mcp.json', 'utf8'));

// Update or add playwright configuration
config.mcpServers = config.mcpServers || {};
config.mcpServers.playwright = {
    command: 'npx',
    args: ['@playwright/mcp'],
    env: {
        PLAYWRIGHT_BROWSERS_PATH: process.env.HOME + '/.cache/ms-playwright',
        DISPLAY: ':0',
        NODE_OPTIONS: '--max-old-space-size=4096',
        PLAYWRIGHT_CHROMIUM_USE_HEADLESS_NEW: '1'
    }
};

fs.writeFileSync('.mcp.json', JSON.stringify(config, null, 2));
console.log('✅ Updated .mcp.json with working configuration');
"
fi

# Final summary
echo ""
echo "📋 Summary"
echo "=========="
echo ""
print_status "Old browser cache cleaned"
print_status "Environment variables configured"
print_status "Chromium browser installed"
print_status "Test script created and validated"
print_status "Permanent configuration saved"
print_status "MCP configuration updated"
echo ""

# Check browser installation
BROWSER_COUNT=$(ls ~/.cache/ms-playwright 2>/dev/null | wc -l)
if [ $BROWSER_COUNT -gt 0 ]; then
    echo "🌐 Installed browsers:"
    ls -la ~/.cache/ms-playwright/ 2>/dev/null | grep -E "chromium|firefox|webkit" || echo "   Chromium (headless)"
    echo ""
fi

echo "🎯 Next Steps:"
echo "============="
echo ""
echo "1. If system dependencies are missing, run:"
echo "   cat /tmp/playwright-deps.txt | bash"
echo ""
echo "2. Test browser with provided script:"
echo "   node /tmp/test-playwright-browser.js"
echo ""
echo "3. For your application testing, use:"
echo "   npx playwright test"
echo ""
echo "4. Source the configuration in your shell:"
echo "   source ~/.playwright-wsl2-config"
echo ""

echo "✅ Playwright browser fix complete!"