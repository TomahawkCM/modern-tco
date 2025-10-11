#!/bin/bash
# Color Migration Script - Archon.png Blue Palette
# Migrates all remaining files from electric cyan to standard blue palette

echo "🎨 Starting color migration to archon.png palette..."
echo "📊 Finding files with hard-coded colors..."

# Count files before migration
TOTAL_FILES=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" | wc -l)
echo "📁 Found $TOTAL_FILES TypeScript/React files"

# Create backup
echo "💾 Creating backup..."
git stash push -m "Pre-color-migration backup $(date +%Y%m%d_%H%M%S)"

echo "🔄 Running automated color replacements..."

# Run perl replacements on all TypeScript/React files
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -exec perl -pi -e '
  # Cyan → Blue (Primary) - Most common replacement
  s/text-cyan-300\b/text-primary/g;
  s/text-cyan-400\b/text-primary/g;
  s/text-cyan-500\b/text-primary/g;
  s/bg-cyan-500\/10\b/bg-primary\/10/g;
  s/bg-cyan-500\/20\b/bg-primary\/20/g;
  s/bg-cyan-600\b/bg-primary/g;
  s/bg-cyan-900\/20\b/bg-primary\/20/g;
  s/border-cyan-500\/10\b/border-primary\/10/g;
  s/border-cyan-500\/20\b/border-primary\/20/g;
  s/border-cyan-500\/30\b/border-primary\/30/g;
  s/border-cyan-500\/50\b/border-primary\/50/g;
  s/from-cyan-300\b/from-primary/g;
  s/from-cyan-400\b/from-primary/g;
  s/from-cyan-500\b/from-primary/g;
  s/to-cyan-500\b/to-primary/g;
  s/via-cyan-100\b/via-primary/g;

  # Yellow → Orange (Warning/Stats)
  s/text-yellow-200\b/text-[#f97316]/g;
  s/text-yellow-300\b/text-[#f97316]/g;
  s/text-yellow-400\b/text-[#f97316]/g;
  s/text-yellow-500\b/text-[#f97316]/g;
  s/bg-yellow-500\/10\b/bg-[#f97316]\/10/g;
  s/bg-yellow-500\/20\b/bg-[#f97316]\/20/g;
  s/bg-yellow-900\/30\b/bg-[#f97316]\/10/g;
  s/border-yellow-500\/20\b/border-[#f97316]\/20/g;
  s/border-yellow-500\/30\b/border-[#f97316]\/30/g;
  s/border-yellow-500\/40\b/border-[#f97316]\/40/g;
  s/from-yellow-200\b/from-[#f97316]/g;
  s/from-yellow-300\b/from-[#f97316]/g;
  s/from-yellow-400\b/from-[#f97316]/g;

  # Green → Success
  s/text-green-300\b/text-[#22c55e]/g;
  s/text-green-400\b/text-[#22c55e]/g;
  s/text-green-500\b/text-[#22c55e]/g;
  s/text-green-600\b/text-[#22c55e]/g;
  s/bg-green-500\b/bg-[#22c55e]/g;
  s/bg-green-600\b/bg-[#22c55e]/g;
  s/bg-green-500\/5\b/bg-[#22c55e]\/5/g;
  s/bg-green-500\/10\b/bg-[#22c55e]\/10/g;
  s/border-green-500\/20\b/border-[#22c55e]\/20/g;
  s/border-green-500\/30\b/border-[#22c55e]\/30/g;

  # Slate → Semantic Tokens
  s/text-slate-200\b/text-muted-foreground/g;
  s/text-slate-300\b/text-muted-foreground/g;
  s/text-slate-400\b/text-muted-foreground/g;
  s/text-slate-500\b/text-muted-foreground/g;
  s/bg-slate-800\b/bg-card/g;
  s/bg-slate-800\/30\b/bg-card\/80/g;
  s/bg-slate-800\/50\b/bg-card/g;
  s/bg-slate-900\b/bg-card/g;
  s/bg-slate-900\/20\b/bg-card\/80/g;
  s/bg-slate-900\/50\b/bg-card\/80/g;
  s/border-slate-600\b/border-border/g;
  s/border-slate-700\b/border-border/g;
  s/border-slate-700\/50\b/border-border\/50/g;
  s/border-slate-800\b/border-border/g;

  # Gray → Semantic Tokens
  s/text-gray-200\b/text-muted-foreground/g;
  s/text-gray-300\b/text-muted-foreground/g;
  s/text-gray-400\b/text-muted-foreground/g;
  s/text-gray-500\b/text-muted-foreground/g;
  s/bg-gray-600\b/bg-muted/g;
  s/bg-gray-800\b/bg-card/g;

  # White → Foreground (careful not to match whitespace)
  s/text-white\b/text-foreground/g;

  # Blue (non-cyan) → Primary
  s/text-blue-200\b/text-muted-foreground/g;
  s/text-blue-300\b/text-primary/g;
  s/text-blue-400\b/text-primary/g;
  s/text-blue-500\b/text-primary/g;
  s/bg-blue-500\b/bg-primary/g;
  s/bg-blue-500\/5\b/bg-primary\/5/g;
  s/bg-blue-500\/10\b/bg-primary\/10/g;
  s/border-blue-500\/20\b/border-primary\/20/g;
  s/border-blue-500\/30\b/border-primary\/30/g;

  # Purple → Accent (mostly unchanged, just semantic)
  s/text-purple-300\b/text-accent-foreground/g;
  s/text-purple-400\b/text-accent-foreground/g;
  s/bg-purple-500\b/bg-accent/g;
  s/bg-purple-600\b/bg-accent/g;
  s/bg-purple-500\/5\b/bg-accent\/5/g;
  s/bg-purple-500\/10\b/bg-accent\/10/g;
  s/bg-purple-900\/20\b/bg-accent\/20/g;
  s/border-purple-500\/20\b/border-accent\/20/g;
  s/border-purple-500\/30\b/border-accent\/30/g;
' {} \;

echo "✅ Automated replacements complete!"
echo ""
echo "📊 Generating change summary..."

# Count changed files
CHANGED_FILES=$(git diff --name-only | wc -l)
CHANGED_LINES=$(git diff --shortstat | grep -oE "[0-9]+ insertion" | grep -oE "[0-9]+" || echo "0")

echo "📝 Modified $CHANGED_FILES files"
echo "📝 Changed approximately $CHANGED_LINES lines"
echo ""
echo "🔍 Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Check specific files: git diff src/path/to/file.tsx"
echo "  3. Test key pages visually"
echo "  4. Commit: git add . && git commit -m 'refactor(colors): Bulk migrate remaining files to archon.png palette'"
echo ""
echo "🎨 Migration complete! Review carefully before committing."
