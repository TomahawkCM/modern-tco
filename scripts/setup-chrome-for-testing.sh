#!/usr/bin/env bash
set -euo pipefail

# Project-local install path
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHROME_DIR="$ROOT_DIR/.chrome"

echo "[setup-chrome] Ensuring Chrome for Testing is installed under $CHROME_DIR"

mkdir -p "$CHROME_DIR"

# Install or update Chrome for Testing (stable) to ./.chrome
npx -y @puppeteer/browsers install chrome@stable --path "$CHROME_DIR"

echo "[setup-chrome] Done."

