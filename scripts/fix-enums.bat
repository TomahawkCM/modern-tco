@echo off
echo Fixing enum literals in imported-questions-master.ts...

cd /d "C:\Users\robne\Documents\mapmydeals-gpt5\Tanium TCO\modern-tco\src\data"

REM Create a backup first
copy "imported-questions-master.ts" "imported-questions-master.ts.backup"

REM Use PowerShell for text replacement
powershell -Command "(Get-Content 'imported-questions-master.ts') -replace '\"difficulty\": \"Beginner\",', '\"difficulty\": Difficulty.BEGINNER,' | Set-Content 'imported-questions-master.ts'"
powershell -Command "(Get-Content 'imported-questions-master.ts') -replace '\"difficulty\": \"Intermediate\",', '\"difficulty\": Difficulty.INTERMEDIATE,' | Set-Content 'imported-questions-master.ts'"
powershell -Command "(Get-Content 'imported-questions-master.ts') -replace '\"difficulty\": \"Advanced\",', '\"difficulty\": Difficulty.ADVANCED,' | Set-Content 'imported-questions-master.ts'"

powershell -Command "(Get-Content 'imported-questions-master.ts') -replace '\"category\": \"Platform Fundamentals\",', '\"category\": QuestionCategory.PLATFORM_FUNDAMENTALS,' | Set-Content 'imported-questions-master.ts'"
powershell -Command "(Get-Content 'imported-questions-master.ts') -replace '\"category\": \"Console Procedures\",', '\"category\": QuestionCategory.CONSOLE_PROCEDURES,' | Set-Content 'imported-questions-master.ts'"
powershell -Command "(Get-Content 'imported-questions-master.ts') -replace '\"category\": \"Troubleshooting\",', '\"category\": QuestionCategory.TROUBLESHOOTING,' | Set-Content 'imported-questions-master.ts'"
powershell -Command "(Get-Content 'imported-questions-master.ts') -replace '\"category\": \"Practical Scenarios\",', '\"category\": QuestionCategory.PRACTICAL_SCENARIOS,' | Set-Content 'imported-questions-master.ts'"
powershell -Command "(Get-Content 'imported-questions-master.ts') -replace '\"category\": \"Linear Chain Architecture\",', '\"category\": QuestionCategory.LINEAR_CHAIN,' | Set-Content 'imported-questions-master.ts'"

echo Enum literal fixes completed!
echo Backup saved as imported-questions-master.ts.backup
pause