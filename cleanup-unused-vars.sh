#!/bin/bash
#
# Automated Unused Variable Cleanup Script for Modern Tanium TCO LMS
# This script systematically fixes the remaining ~450 unused variable warnings
#

echo "🔧 Starting automated unused variable cleanup..."
echo "📊 Initial count:"
npm run lint 2>&1 | grep "@typescript-eslint/no-unused-vars" | wc -l

# Step 1: Fix all catch blocks with unused error variables
echo ""
echo "Step 1: Fixing catch blocks..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i 's/} catch (error) {/} catch {/g' "$file"
  sed -i 's/} catch (e) {/} catch {/g' "$file"
  sed -i 's/} catch (err) {/} catch {/g' "$file"
done

# Step 2: Run ESLint auto-fix
echo ""
echo "Step 2: Running ESLint auto-fix..."
npm run lint -- --fix 2>&1 | tail -5

# Step 3: Check final count
echo ""
echo "📊 Final count:"
npm run lint 2>&1 | grep "@typescript-eslint/no-unused-vars" | wc -l

echo ""
echo "✅ Automated cleanup complete!"
echo "📋 To manually fix remaining issues:"
echo "   1. Review lint output: npm run lint > lint-report.txt"
echo "   2. For unused imports: Remove them from import statements"
echo "   3. For unused parameters: Prefix with underscore (_param)"
echo "   4. For unused variables: Either use them or prefix with underscore"

# Generate a detailed report
echo ""
echo "📄 Generating detailed report..."
npm run lint 2>&1 | grep "@typescript-eslint/no-unused-vars" > /tmp/unused-vars-report.txt

echo "Report saved to: /tmp/unused-vars-report.txt"
echo ""
echo "🎯 Common patterns to fix manually:"
echo "   - Unused React component imports (remove them)"
echo "   - Unused icon imports from lucide-react (remove unused icons)"
echo "   - Unused utility function imports (remove if truly unused)"
echo "   - Unused destructured hook returns (prefix with _ or remove)"
echo "   - Unused function parameters (prefix with _)"
echo ""
echo "Example fixes:"
echo '  Before: import { Clock, Badge } from "lucide-react"'
echo '  After:  import { Badge } from "lucide-react"  // if Clock unused'
echo ""
echo '  Before: const handleClick = (event, data) => { useData(); }'
echo '  After:  const handleClick = (_event, data) => { useData(); }'
echo ""
echo "Run this script again after manual fixes to track progress."

