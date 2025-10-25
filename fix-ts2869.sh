#!/bin/bash
# Fix TS2869 errors by identifying and manually reviewing each case

echo "=== TypeScript TS2869 Errors (Unnecessary Nullish Coalescing) ==="
echo ""
echo "These errors indicate where TypeScript knows a value is never nullish,"
echo "so the ?? fallback is unnecessary. We should remove the fallback."
echo ""

npx tsc --noEmit 2>&1 | grep "TS2869" | while read line; do
  file=$(echo "$line" | cut -d'(' -f1)
  location=$(echo "$line" | cut -d'(' -f2 | cut -d')' -f1)
  echo "📍 $file:$location"
done

echo ""
echo "Total TS2869 errors:"
npx tsc --noEmit 2>&1 | grep -c "TS2869"
