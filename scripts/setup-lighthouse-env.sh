#!/bin/bash
# Setup script for Lighthouse environment in WSL2
# This script configures the Chrome path and environment for Lighthouse

echo "🔧 Setting up Lighthouse environment for WSL2..."

# Detect Chrome/Chromium installation
CHROME_PATHS=(
    "/home/robne/.cache/ms-playwright/chromium-1193/chrome-linux/chrome"
    "/usr/bin/chromium-browser"
    "/usr/bin/chromium"
    "/usr/bin/google-chrome-stable"
    "/usr/bin/google-chrome"
)

CHROME_FOUND=""
for path in "${CHROME_PATHS[@]}"; do
    if [ -f "$path" ]; then
        CHROME_FOUND="$path"
        break
    fi
done

if [ -z "$CHROME_FOUND" ]; then
    echo "❌ No Chrome/Chromium installation found!"
    echo "💡 Installing Chromium via Playwright..."
    npx playwright install chromium
    
    # Check again for Playwright's Chromium
    if [ -f "/home/robne/.cache/ms-playwright/chromium-1193/chrome-linux/chrome" ]; then
        CHROME_FOUND="/home/robne/.cache/ms-playwright/chromium-1193/chrome-linux/chrome"
    else
        echo "❌ Failed to install Chromium. Please install manually."
        exit 1
    fi
fi

echo "✅ Chrome found at: $CHROME_FOUND"

# Export for current session
export CHROME_PATH="$CHROME_FOUND"
export LIGHTHOUSE_PORT=3001
export LIGHTHOUSE_BASE_URL="http://localhost:3001"

# Create or update .env.lighthouse
cat > .env.lighthouse << EOL
# Lighthouse Configuration for WSL2 Environment
# Auto-generated on $(date)

# Chrome executable path
CHROME_PATH=$CHROME_FOUND

# Port configuration for development server
LIGHTHOUSE_PORT=3001
LIGHTHOUSE_BASE_URL=http://localhost:3001

# Chrome flags optimized for WSL2
LIGHTHOUSE_CHROME_FLAGS="--headless --no-sandbox --disable-dev-shm-usage --disable-features=BlockInsecurePrivateNetworkRequests --disable-setuid-sandbox --allow-insecure-localhost --ignore-certificate-errors"

# Lighthouse CI settings
LHCI_BUILD_CONTEXT__CURRENT_BRANCH=main
LHCI_BUILD_CONTEXT__AUTHOR="Tanium TCO Dev"
LHCI_UPLOAD__TARGET=temporary-public-storage
EOL

echo "✅ Created .env.lighthouse configuration file"

# Add to .bashrc for persistence (optional)
if ! grep -q "CHROME_PATH=" ~/.bashrc 2>/dev/null; then
    echo "" >> ~/.bashrc
    echo "# Lighthouse Chrome configuration" >> ~/.bashrc
    echo "export CHROME_PATH=\"$CHROME_FOUND\"" >> ~/.bashrc
    echo "✅ Added CHROME_PATH to ~/.bashrc"
fi

# Create convenience script
cat > run-lighthouse.sh << 'EOL'
#!/bin/bash
# Quick Lighthouse runner for port 3001

source .env.lighthouse 2>/dev/null || true

if [ -z "$CHROME_PATH" ]; then
    export CHROME_PATH="/home/robne/.cache/ms-playwright/chromium-1193/chrome-linux/chrome"
fi

URL="${1:-http://localhost:3001}"
OUTPUT="${2:-lighthouse-report}"

echo "🚀 Running Lighthouse on $URL..."
npx lighthouse "$URL" \
    --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage --disable-features=BlockInsecurePrivateNetworkRequests" \
    --preset=desktop \
    --output=html \
    --output=json \
    --output-path="$OUTPUT" \
    --quiet

if [ $? -eq 0 ]; then
    echo "✅ Report saved to: ${OUTPUT}.report.html and ${OUTPUT}.report.json"
    
    # Extract and display scores
    if [ -f "${OUTPUT}.report.json" ]; then
        echo ""
        echo "📊 Scores:"
        python3 -c "
import json
with open('${OUTPUT}.report.json') as f:
    data = json.load(f)
    for k, v in data['categories'].items():
        score = int(v['score'] * 100)
        emoji = '🟢' if score >= 90 else '🟡' if score >= 50 else '🔴'
        print(f'  {emoji} {k}: {score}')
" 2>/dev/null || echo "  (Install Python 3 to see scores)"
    fi
else
    echo "❌ Lighthouse failed. Check your server is running on port 3001."
fi
EOL

chmod +x run-lighthouse.sh
echo "✅ Created run-lighthouse.sh convenience script"

echo ""
echo "🎉 Setup complete! You can now use:"
echo ""
echo "  npm run lighthouse:quick    # Quick single page audit"
echo "  npm run lighthouse:3001     # Audit all routes"
echo "  npm run lighthouse:all      # Comprehensive audit"
echo "  ./run-lighthouse.sh [URL]   # Direct Lighthouse run"
echo ""
echo "💡 Start the dev server on port 3001 with:"
echo "  npm run dev:3001"
echo ""