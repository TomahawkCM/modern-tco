# PowerShell script to fix npm install issues on WSL
# Run this from the project root directory

Write-Host "Fixing npm install issue..." -ForegroundColor Green

# Clean npm cache
Write-Host "`n1. Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Remove node_modules and package-lock.json
Write-Host "`n2. Removing node_modules and package-lock.json..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Write-Host "   Removed node_modules" -ForegroundColor Gray
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    Write-Host "   Removed package-lock.json" -ForegroundColor Gray
}

# Fresh install
Write-Host "`n3. Installing all dependencies (this may take a few minutes)..." -ForegroundColor Yellow
npm install

# Install budget app dependencies
Write-Host "`n4. Installing budget app dependencies..." -ForegroundColor Yellow
npm install dexie dexie-react-hooks papaparse react-dropzone @types/papaparse

Write-Host "`n✅ Installation complete!" -ForegroundColor Green
Write-Host "`nNext step: Run .\enable-dexie.ps1" -ForegroundColor Cyan
