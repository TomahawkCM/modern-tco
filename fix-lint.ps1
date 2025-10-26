# fix-lint.ps1 - PowerShell Enhanced Version
# Runs bulk autofixes, organizes imports, then prints a clean lint & type report.

param(
  [string]$Dir = ".",
  [switch]$Verbose = $false,
  [switch]$FixOnly = $false
)

$ErrorActionPreference = "Continue"

Write-Host "=== PowerShell Linting Pipeline ===" -ForegroundColor Cyan
Write-Host "Directory: $((Resolve-Path $Dir).Path)" -ForegroundColor Yellow
Write-Host "Node Environment: $(node --version)" -ForegroundColor Green
Write-Host "PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Green

# Test for required tools
$tools = @("node", "npm", "npx")
foreach ($tool in $tools) {
    if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Error "Required tool '$tool' not found in PATH"
        exit 1
    }
}

try {
    Write-Host "`n=== ESLint Auto-Fix ===" -ForegroundColor Cyan
    
    # Use npm script for consistency
    if (Test-Path "$Dir/package.json") {
        Push-Location $Dir
        
        # Check if PowerShell-specific scripts are available
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts."lint:fix:pwsh") {
            Write-Host "Using PowerShell-optimized lint script..." -ForegroundColor Green
            npm run lint:fix:pwsh
        } else {
            Write-Host "Using standard lint script..." -ForegroundColor Yellow
            npm run lint:fix
        }
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "ESLint fix completed with warnings"
        }
        
        Write-Host "`n=== Prettier Format ===" -ForegroundColor Cyan
        if ($packageJson.scripts."format:pwsh") {
            Write-Host "Using PowerShell-optimized format script..." -ForegroundColor Green
            npm run format:pwsh
        } else {
            Write-Host "Using standard format script..." -ForegroundColor Yellow
            npm run format
        }
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Prettier formatting completed with warnings"
        }
        Pop-Location
    } else {
        Write-Error "No package.json found in $Dir"
        exit 1
    }
    
    if (!$FixOnly) {
        Write-Host "`n=== Final Validation ===" -ForegroundColor Cyan
        Push-Location $Dir
        
        # Use PowerShell-optimized check if available
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts."lint:check:pwsh") {
            npm run lint:check:pwsh
        } else {
            npm run lint:check
        }
        
        npm run typecheck
        Pop-Location
    }
    
    Write-Host "`n=== Success ===" -ForegroundColor Green
    Write-Host "Linting pipeline completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Error "Linting pipeline failed: $_"
    exit 1
}
