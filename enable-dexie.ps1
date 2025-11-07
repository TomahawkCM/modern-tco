# PowerShell script to enable Dexie.js in budget-db.ts
# Run this from the project root directory

$filePath = "src\lib\budget-db.ts"

Write-Host "Enabling Dexie.js in budget-db.ts..." -ForegroundColor Green

# Backup the original file
Copy-Item $filePath "$filePath.backup" -Force
Write-Host "Created backup: $filePath.backup" -ForegroundColor Yellow

# Read the file content
$content = Get-Content $filePath -Raw

# Replace the commented import with active import
$content = $content -replace '// import Dexie, { Table } from ''dexie'';', 'import Dexie, { Table } from ''dexie'';'

# Remove the "Note:" comment lines
$content = $content -replace '// Note: Install dependencies with: npm install dexie dexie-react-hooks\r?\n', ''
$content = $content -replace '// For now, we''ll create a placeholder structure\r?\n', ''

# Uncomment the BudgetDatabase class (remove /* and */)
$content = $content -replace '/\*\r?\n(export class BudgetDatabase[\s\S]*?export const db = new BudgetDatabase\(\);)\r?\n\*/', '$1'

# Remove the TemporaryDatabase section
$content = $content -replace '// Temporary in-memory storage[\s\S]*?export const db = new TemporaryDatabase\(\);', ''

# Clean up extra blank lines
$content = $content -replace '\r?\n{3,}', "`r`n`r`n"

# Write the modified content back
Set-Content $filePath $content -NoNewline

Write-Host "`nDexie.js has been enabled!" -ForegroundColor Green
Write-Host "Original file backed up to: $filePath.backup" -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm install dexie dexie-react-hooks papaparse react-dropzone @types/papaparse"
Write-Host "2. Run: npm run dev"
Write-Host "3. Open: http://localhost:3000/budget-app"
