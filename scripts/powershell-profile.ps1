# Tanium TCO Development Profile
# Generated: 2025-01-10

# Import enhanced modules
Import-Module Terminal-Icons -ErrorAction SilentlyContinue
Import-Module powershell-yaml -ErrorAction SilentlyContinue

# Tanium TCO Development Aliases
Set-Alias -Name tco-dev -Value "npm run dev:port" -Description "Start TCO dev server on port 3007"
Set-Alias -Name tco-build -Value "npm run build" -Description "Build TCO application"
Set-Alias -Name tco-quality -Value "npm run quality:pwsh" -Description "Run PowerShell-optimized quality checks"
Set-Alias -Name tco-fix -Value "npm run fix:pwsh" -Description "Auto-fix formatting and linting"
Set-Alias -Name tco-lint -Value "npm run lint:pwsh" -Description "PowerShell-optimized linting"
Set-Alias -Name tco-format -Value "npm run format:pwsh" -Description "PowerShell-optimized formatting"

# Quick navigation functions
function Go-TCO { 
    Set-Location "C:\Users\robne\Documents\mapmydeals-gpt5\Tanium TCO\modern-tco"
    Write-Host "📁 Navigated to TCO project" -ForegroundColor Green
}
Set-Alias -Name cd-tco -Value Go-TCO -Description "Navigate to TCO project"

function Go-TCORoot { 
    Set-Location "C:\Users\robne\Documents\mapmydeals-gpt5\Tanium TCO"
    Write-Host "📁 Navigated to TCO root" -ForegroundColor Green
}
Set-Alias -Name cd-tco-root -Value Go-TCORoot -Description "Navigate to TCO root"

# Serena dashboard shortcut
function Open-SerenaDashboard { 
    Start-Process "http://127.0.0.1:24285/dashboard/index.html" 
    Write-Host "🚀 Opening Serena MCP Dashboard..." -ForegroundColor Green
}
Set-Alias -Name serena-dash -Value Open-SerenaDashboard -Description "Open Serena MCP Dashboard"

# Development utilities
function Show-TCOStatus {
    Write-Host "📊 Tanium TCO Development Status" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "📁 Current Location: $(Get-Location)" -ForegroundColor White
    Write-Host "🔧 Node.js Version: $(node --version)" -ForegroundColor White
    Write-Host "📦 NPM Version: $(npm --version)" -ForegroundColor White
    Write-Host "⚡ PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor White
    
    if (Test-Path "package.json") {
        $package = Get-Content "package.json" | ConvertFrom-Json
        Write-Host "🎯 Project: $($package.name) v$($package.version)" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Available Commands:" -ForegroundColor Yellow
    Write-Host "  tco-dev     - Start development server" -ForegroundColor White
    Write-Host "  tco-build   - Build application" -ForegroundColor White
    Write-Host "  tco-quality - Run quality checks" -ForegroundColor White
    Write-Host "  tco-fix     - Auto-fix code issues" -ForegroundColor White
    Write-Host "  cd-tco      - Navigate to TCO project" -ForegroundColor White
    Write-Host "  serena-dash - Open Serena dashboard" -ForegroundColor White
}
Set-Alias -Name tco-status -Value Show-TCOStatus -Description "Show TCO development status"

# Quality gate function
function Invoke-TCOQualityGate {
    Write-Host "🔍 Running TCO Quality Gate..." -ForegroundColor Cyan
    
    Write-Host "Checking TypeScript..." -ForegroundColor Yellow
    npm run typecheck
    
    Write-Host "Running ESLint..." -ForegroundColor Yellow
    npm run lint:pwsh
    
    Write-Host "Checking Prettier formatting..." -ForegroundColor Yellow
    npm run format:check:pwsh
    
    Write-Host "✅ Quality gate completed!" -ForegroundColor Green
}
Set-Alias -Name tco-gate -Value Invoke-TCOQualityGate -Description "Run comprehensive quality gate"

# Welcome message
Write-Host "🚀 Tanium TCO PowerShell Development Environment Loaded!" -ForegroundColor Green
Write-Host "💡 Type 'tco-status' for available commands" -ForegroundColor Cyan

