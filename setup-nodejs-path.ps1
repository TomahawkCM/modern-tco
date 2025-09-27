# PowerShell script to add Node.js to PATH for current session
# This fixes the npm/node availability issue in PowerShell

Write-Host "🔧 Setting up Node.js PATH for PowerShell environment..." -ForegroundColor Cyan

# Node.js installation paths
$nodeJsPath = "C:\Program Files\nodejs"
$npmGlobalPath = "$env:APPDATA\npm"

# Check if Node.js exists
if (Test-Path $nodeJsPath) {
    Write-Host "✅ Node.js found at: $nodeJsPath" -ForegroundColor Green

    # Add to current session PATH
    $env:PATH = "$nodeJsPath;$npmGlobalPath;$env:PATH"

    # Verify installation
    try {
        $nodeVersion = & node --version
        $npmVersion = & npm --version
        Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
        Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green

        # Test npm command
        Write-Host "🧪 Testing npm commands..." -ForegroundColor Yellow
        npm --help | Select-Object -First 3

        Write-Host "🎉 Node.js and npm are now available in PowerShell!" -ForegroundColor Green
        Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Cyan

    } catch {
        Write-Host "❌ Error testing Node.js/npm: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Node.js not found at $nodeJsPath" -ForegroundColor Red
    Write-Host "🔍 Searching for Node.js installation..." -ForegroundColor Yellow

    # Try to find Node.js
    $possiblePaths = @(
        "C:\Program Files\nodejs",
        "C:\Program Files (x86)\nodejs",
        "$env:LOCALAPPDATA\Programs\nodejs",
        "$env:ProgramFiles\nodejs"
    )

    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            Write-Host "✅ Found Node.js at: $path" -ForegroundColor Green
            $env:PATH = "$path;$npmGlobalPath;$env:PATH"
            break
        }
    }
}

Write-Host "📋 Updated PATH includes:" -ForegroundColor Cyan
$env:PATH.Split(';') | Where-Object { $_ -match 'node' -or $_ -match 'npm' }