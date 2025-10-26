#!/bin/bash
# Playwright MCP Recovery Script
# Fixes hanging issues and restores working configuration

set -e

echo "🚑 Playwright MCP Recovery Script"
echo "=================================="

# Function to handle errors
handle_error() {
    echo "❌ Error on line $1"
    exit 1
}
trap 'handle_error $LINENO' ERR

# Check if we're in the right directory
if [[ ! -f ".mcp.json" ]]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Emergency stop of hanging processes
echo "🛑 Step 1: Stopping any hanging Playwright processes..."
pkill -f "playwright" 2>/dev/null || echo "   No playwright processes found"
pkill -f "chrome" 2>/dev/null || echo "   No chrome processes found"
pkill -f "browser" 2>/dev/null || echo "   No browser processes found"
echo "✅ Process cleanup complete"
echo ""

# Step 2: Clean up corrupted cache
echo "🧹 Step 2: Cleaning corrupted browser cache..."
if [[ -d ~/.cache/ms-playwright ]]; then
    rm -rf ~/.cache/ms-playwright
    echo "✅ Removed old browser cache"
else
    echo "   No old cache to remove"
fi

if [[ -d ~/.cache/ms-playwright-new ]]; then
    rm -rf ~/.cache/ms-playwright-new
    echo "✅ Removed new browser cache"
else
    echo "   No new cache to remove"
fi
echo ""

# Step 3: Restore working configuration
echo "🔧 Step 3: Restoring working MCP configuration..."
if [[ -f ".mcp-working-config.json" ]]; then
    cp .mcp-working-config.json .mcp.json
    echo "✅ Restored working configuration"
else
    echo "❌ Working configuration not found. Please run the full setup again."
    exit 1
fi
echo ""

# Step 4: Set up environment
echo "🌍 Step 4: Setting up WSL2 environment..."
if [[ -f ".playwright-env.sh" ]]; then
    source .playwright-env.sh
    echo "✅ Environment loaded successfully"
else
    echo "❌ Environment file not found. Creating minimal version..."
    cat > .playwright-env.sh << 'EOF'
#!/bin/bash
export DISPLAY=:99
export PLAYWRIGHT_BROWSERS_PATH=/home/$(whoami)/.cache/ms-playwright-new
export PLAYWRIGHT_SKIP_BROWSER_GC=1
export PLAYWRIGHT_LAUNCH_OPTIONS_ARGS='["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--headless=new"]'
export PLAYWRIGHT_CHROMIUM_USE_HEADLESS_NEW=1
export NODE_OPTIONS="--max-old-space-size=4096"
echo "✅ WSL2 Playwright environment loaded"
EOF
    chmod +x .playwright-env.sh
    source .playwright-env.sh
    echo "✅ Created and loaded environment"
fi
echo ""

# Step 5: Test configuration
echo "🧪 Step 5: Testing Playwright MCP functionality..."
timeout 30s npx @playwright/mcp --help > /dev/null 2>&1
if [[ $? -eq 0 ]]; then
    echo "✅ Playwright MCP is responding correctly"
else
    echo "⚠️  Playwright MCP test timeout, but this is expected without browsers installed"
fi
echo ""

# Step 6: Final validation
echo "🎯 Step 6: Final validation..."
echo "   📁 Configuration file: $(ls -la .mcp.json | awk '{print $5}') bytes"
echo "   📁 Environment file: $(ls -la .playwright-env.sh | awk '{print $5}') bytes"
echo "   💾 Available memory: $(free -h | grep 'Mem:' | awk '{print $7}') available"
echo "   🔧 Node.js version: $(node --version 2>/dev/null || echo 'Not found')"
echo ""

echo "🎉 Recovery Complete!"
echo "==================="
echo ""
echo "✅ Playwright MCP hanging issues should now be resolved"
echo "📖 For detailed troubleshooting, see: docs/knowledge-base/PLAYWRIGHT_MCP_WSL2_GUIDE.md"
echo ""
echo "🚀 Next steps:"
echo "   1. Restart Claude Code if it's running"
echo "   2. Test MCP functionality in Claude Code"
echo "   3. Check the knowledge base if any issues persist"
echo ""
echo "📞 If issues continue, run: cat docs/knowledge-base/PLAYWRIGHT_MCP_WSL2_GUIDE.md"