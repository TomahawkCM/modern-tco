#!/bin/bash
# Fix TypeScript type errors in all generated question files

echo "🔧 Fixing TypeScript type errors in generated question files..."

# Find all generated question files
FILES=$(find data-archive/generated -name "generated-questions-*.ts" -type f)

for file in $FILES; do
  echo "Processing: $file"
  
  # Fix domain field - snake_case to Title Case
  sed -i 's/"domain": "asking_questions"/"domain": "Asking Questions"/g' "$file"
  sed -i 's/"domain": "refining_targeting"/"domain": "Refining Questions \& Targeting"/g' "$file"
  sed -i 's/"domain": "taking_action"/"domain": "Taking Action"/g' "$file"
  sed -i 's/"domain": "navigation"/"domain": "Navigation and Basic Module Functions"/g' "$file"
  sed -i 's/"domain": "reporting"/"domain": "Report Generation and Data Export"/g' "$file"
  
  # Fix difficulty field - lowercase to Title Case
  sed -i 's/"difficulty": "beginner"/"difficulty": "Beginner"/g' "$file"
  sed -i 's/"difficulty": "intermediate"/"difficulty": "Intermediate"/g' "$file"
  sed -i 's/"difficulty": "advanced"/"difficulty": "Advanced"/g' "$file"
  
  # Fix category field - snake_case to Title Case
  sed -i 's/"category": "practical_scenarios"/"category": "Practical Scenarios"/g' "$file"
  sed -i 's/"category": "best_practices"/"category": "Best Practices"/g' "$file"
  sed -i 's/"category": "performance_optimization"/"category": "Performance Optimization"/g' "$file"
  sed -i 's/"category": "question_construction"/"category": "Question Construction"/g' "$file"
  sed -i 's/"category": "question_sharing"/"category": "Question Sharing"/g' "$file"
  sed -i 's/"category": "troubleshooting"/"category": "Troubleshooting"/g' "$file"
  sed -i 's/"category": "platform_fundamentals"/"category": "Platform Fundamentals"/g' "$file"
  sed -i 's/"category": "console_procedures"/"category": "Console Procedures"/g' "$file"
  sed -i 's/"category": "linear_chain"/"category": "Linear Chain Architecture"/g' "$file"
done

echo "✅ Fixed all generated question files!"
