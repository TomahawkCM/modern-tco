#!/bin/bash

# Setup script for accessibility testing
# Run this to install required dependencies

echo "Installing accessibility testing dependencies..."

# Install @axe-core/playwright
npm install -D @axe-core/playwright

# Install pa11y-ci for WCAG compliance testing
npm install -D pa11y-ci

# Install lighthouse for PWA audits
npm install -D @lhci/cli

echo "✅ Accessibility testing dependencies installed!"
echo ""
echo "Run tests with:"
echo "  npx playwright test tests/accessibility.spec.ts"
echo "  npx pa11y-ci"
echo "  npx lhci autorun"

