#!/bin/bash

# Fix TS2869: Unnecessary nullish coalescing
# These are false positives where TypeScript thinks the left operand is never nullish
# We can safely remove the ?? part

files=(
  "src/components/CyberpunkNavigation.tsx"
  "src/components/confidence/ConfidenceBuilder.tsx"
  "src/components/exam/question-card.tsx"
  "src/components/labs/CheckpointValidator.tsx"
  "src/components/learning/LearningProgressTracker.tsx"
  "src/components/practice/Module3PracticeSession.tsx"
  "src/components/practice/PracticeSessionContainer.tsx"
  "src/components/query-builder/FilterBuilder.tsx"
  "src/components/query-builder/QueryPreview.tsx"
  "src/components/query-builder/ResultsViewer.tsx"
  "src/components/query-builder/components/VirtualScrollTable.tsx"
  "src/components/query-builder/utils/security.ts"
  "src/contexts/ExamContext.tsx"
  "src/contexts/ModuleContext.tsx"
  "src/contexts/PracticeContext.tsx"
  "src/contexts/QuestionsContext.tsx"
  "src/lib/analytics.ts"
  "src/lib/error-tracking/api-handler.ts"
  "src/lib/examLogic.ts"
  "src/lib/knowledge-check.ts"
  "src/lib/module3-practice-integration.ts"
  "src/lib/questionService.ts"
  "src/lib/supabase-flow-persistence.ts"
  "src/lib/tanium-query-engine/cache.ts"
  "src/lib/tanium-query-engine/executor.ts"
  "src/lib/tanium-query-engine/index.ts"
  "src/lib/validation/realTimeValidationService.ts"
  "src/services/QuestionGeneratorService.ts"
  "src/services/notesService.ts"
  "src/services/questionsService.ts"
  "src/services/studyModuleService.ts"
)

echo "🔧 Fixing TypeScript errors..."
echo ""

# Fix TS5076: Mixed || and ?? without parentheses
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Add parentheses around || when mixed with ??
    sed -i 's/\([a-zA-Z0-9_\.]\+\) || \([a-zA-Z0-9_\.]\+\) ?? /(\1 || \2) ?? /g' "$file"
    # Add parentheses around ?? when mixed with ||
    sed -i 's/\([a-zA-Z0-9_\.]\+\) ?? \([a-zA-Z0-9_\.]\+\) || /(\1 ?? \2) || /g' "$file"
  fi
done

echo "✅ Fixed mixed operator errors"
echo ""
echo "Running TypeScript check..."
npx tsc --noEmit 2>&1 | grep -c "error TS"