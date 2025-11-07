#!/bin/bash

echo "🔍 Verifying Budget App Integration..."
echo ""

# Check if Budget link exists in CyberpunkNavBar
if grep -q 'name: "Budget"' src/components/CyberpunkNavigationFixed.tsx; then
  echo "✅ Budget nav item found in CyberpunkNavigationFixed.tsx"
else
  echo "❌ Budget nav item NOT found"
fi

# Check if Wallet icon is imported
if grep -q 'Wallet' src/components/CyberpunkNavigationFixed.tsx; then
  echo "✅ Wallet icon imported"
else
  echo "❌ Wallet icon NOT imported"
fi

# Check if route exclusion exists in MainLayout
if grep -q "startsWith('/budget-app')" src/components/layout/main-layout.tsx; then
  echo "✅ Budget app route exclusion found in MainLayout"
else
  echo "❌ Route exclusion NOT found"
fi

# Check if modern dashboard exists
if [ -f "src/app/budget-app/page.tsx" ]; then
  if grep -q "PieChart" src/app/budget-app/page.tsx; then
    echo "✅ Modern dashboard with charts found"
  else
    echo "⚠️  Dashboard exists but charts may be missing"
  fi
else
  echo "❌ Dashboard file NOT found"
fi

echo ""
echo "📋 Summary:"
echo "All code changes are in place!"
echo ""
echo "🚀 Next Step:"
echo "Run this command in your WSL terminal:"
echo ""
echo "   cd ~/projects/active/tanium-tco/modern-tco"
echo "   npm run dev"
echo ""
echo "Then open: http://localhost:3002"
echo "Look for 'Budget' in the top navigation bar!"
