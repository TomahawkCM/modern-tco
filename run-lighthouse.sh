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
