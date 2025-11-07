#!/bin/bash

# Budget App Test Script
# Run this after installing dependencies

echo "🧪 Testing Budget App Setup..."
echo ""

# Check if dependencies are installed
echo "1️⃣  Checking dependencies..."
DEPS_MISSING=0

if [ ! -d "node_modules/dexie" ]; then
    echo "   ❌ dexie not found"
    DEPS_MISSING=1
else
    echo "   ✅ dexie installed"
fi

if [ ! -d "node_modules/papaparse" ]; then
    echo "   ❌ papaparse not found"
    DEPS_MISSING=1
else
    echo "   ✅ papaparse installed"
fi

if [ ! -d "node_modules/react-dropzone" ]; then
    echo "   ❌ react-dropzone not found"
    DEPS_MISSING=1
else
    echo "   ✅ react-dropzone installed"
fi

if [ $DEPS_MISSING -eq 1 ]; then
    echo ""
    echo "⚠️  Missing dependencies! Run:"
    echo "   npm install dexie dexie-react-hooks papaparse react-dropzone @types/papaparse"
    exit 1
fi

echo ""
echo "2️⃣  Checking Budget App files..."

# Check if budget app files exist
FILES=(
    "src/app/budget-app/page.tsx"
    "src/app/budget-app/layout.tsx"
    "src/app/budget-app/transactions/page.tsx"
    "src/app/budget-app/budgets/page.tsx"
    "src/app/budget-app/import/page.tsx"
    "src/app/budget-app/export/page.tsx"
    "src/app/budget-app/settings/page.tsx"
    "src/app/budget-app/reports/page.tsx"
    "src/app/budget-app/planning/future/page.tsx"
    "src/app/budget-app/planning/retirement/page.tsx"
    "src/lib/budget-db.ts"
    "src/lib/parsers/csv-parser.ts"
    "src/lib/categorization/rules.ts"
    "src/types/budget.ts"
    "src/components/budget/TransactionModal.tsx"
)

FILES_MISSING=0
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - MISSING!"
        FILES_MISSING=1
    fi
done

if [ $FILES_MISSING -eq 1 ]; then
    echo ""
    echo "⚠️  Some files are missing!"
    exit 1
fi

echo ""
echo "3️⃣  Checking database configuration..."

# Check if Dexie is enabled
if grep -q "import Dexie, { Table } from 'dexie'" src/lib/budget-db.ts; then
    echo "   ✅ Dexie.js enabled"
else
    echo "   ❌ Dexie.js not enabled"
    echo "      Run: ./enable-dexie.ps1 (in PowerShell)"
    echo "      Or manually edit src/lib/budget-db.ts"
fi

echo ""
echo "4️⃣  Checking TypeScript compilation..."
if command -v npm &> /dev/null; then
    npm run typecheck 2>&1 | grep -i "budget" || echo "   ✅ No TypeScript errors in budget app"
else
    echo "   ⚠️  npm not found, skipping typecheck"
fi

echo ""
echo "✅ Budget App setup verification complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Make sure Dexie is enabled (see step 3 above)"
echo "   2. Run: npm run dev"
echo "   3. Open: http://localhost:3000/budget-app"
echo ""
