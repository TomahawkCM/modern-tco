# PowerShell Environment Validation Script
# Validates Windows development environment for Tanium TCO project

param(
    [switch]$Detailed = $false,
    [switch]$Fix = $false
)

$ErrorActionPreference = "Continue"
Write-Host "=== PowerShell Environment Validation ===" -ForegroundColor Cyan

$validationResults = @()

function Test-Command {
    param([string]$CommandName)
    try {
        if (Get-Command $CommandName -ErrorAction SilentlyContinue) {
            return $true
        }
    }
    catch {
        return $false
    }
    return $false
}

function Add-ValidationResult {
    param(
        [string]$Component,
        [bool]$IsValid,
        [string]$Message,
        [string]$FixCommand = ""
    )
    
    $status = if ($IsValid) { "[PASS]" } else { "[FAIL]" }
    $color = if ($IsValid) { "Green" } else { "Red" }
    
    Write-Host "$status $Component`: $Message" -ForegroundColor $color
    
    $validationResults += @{
        Component = $Component
        IsValid = $IsValid
        Message = $Message
        FixCommand = $FixCommand
    }
    
    if (-not $IsValid -and $FixCommand -and $Fix) {
        Write-Host "    Attempting fix: $FixCommand" -ForegroundColor Yellow
        try {
            Invoke-Expression $FixCommand
            Write-Host "    Fix applied successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "    Fix failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Check PowerShell version
$psVersion = $PSVersionTable.PSVersion
$psVersionValid = $psVersion.Major -ge 5
Add-ValidationResult "PowerShell Version" $psVersionValid "Version $psVersion $(if ($psVersionValid) { '(Compatible)' } else { '(Requires 5.0+)' })"

# Check Node.js
$nodeValid = Test-Command "node"
$nodeVersion = if ($nodeValid) { (node --version) } else { "Not installed" }
Add-ValidationResult "Node.js" $nodeValid "Version $nodeVersion" "Install Node.js from https://nodejs.org/"

# Check npm
$npmValid = Test-Command "npm"
$npmVersion = if ($npmValid) { (npm --version) } else { "Not installed" }
Add-ValidationResult "npm" $npmValid "Version $npmVersion"

# Check Git
$gitValid = Test-Command "git"
$gitVersion = if ($gitValid) { (git --version) } else { "Not installed" }
Add-ValidationResult "Git" $gitValid $gitVersion "Install Git from https://git-scm.com/"

# Check project dependencies
$packageJsonPath = Join-Path $PSScriptRoot ".." "package.json"
$packageJsonExists = Test-Path $packageJsonPath
Add-ValidationResult "package.json" $packageJsonExists "Project configuration file"

if ($packageJsonExists) {
    $nodeModulesPath = Join-Path $PSScriptRoot ".." "node_modules"
    $nodeModulesExists = Test-Path $nodeModulesPath
    Add-ValidationResult "node_modules" $nodeModulesExists "Dependencies installed" "npm install"
}

# Check cross-env (critical for PowerShell compatibility)
if ($nodeModulesExists) {
    $crossEnvPath = Join-Path $PSScriptRoot ".." "node_modules" ".bin" "cross-env.cmd"
    $crossEnvExists = Test-Path $crossEnvPath
    Add-ValidationResult "cross-env" $crossEnvExists "Cross-platform environment variables" "npm install --save-dev cross-env"
}

# Check PowerShell execution policy
$executionPolicy = Get-ExecutionPolicy
$policyValid = $executionPolicy -in @("RemoteSigned", "Unrestricted", "Bypass")
Add-ValidationResult "Execution Policy" $policyValid "Policy: $executionPolicy" "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"

# Check Windows version
$winVersion = [System.Environment]::OSVersion.Version
$winVersionValid = $winVersion.Major -ge 10
Add-ValidationResult "Windows Version" $winVersionValid "Windows $($winVersion.Major).$($winVersion.Minor)"

# Test npm scripts with PowerShell
if ($npmValid -and $packageJsonExists) {
    Write-Host "`n=== Testing npm Scripts ===" -ForegroundColor Cyan
    
    try {
        $testResult = npm run --silent 2>&1
        $scriptsAvailable = $LASTEXITCODE -eq 0
        Add-ValidationResult "npm scripts" $scriptsAvailable "Scripts accessible"
        
        if ($Detailed -and $scriptsAvailable) {
            Write-Host "Available scripts:" -ForegroundColor Yellow
            npm run --silent | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        }
    }
    catch {
        Add-ValidationResult "npm scripts" $false "Error testing scripts: $($_.Exception.Message)"
    }
}

# Test environment variables
$envValid = $true
$requiredEnvVars = @("PATH", "NODE_OPTIONS")
foreach ($envVar in $requiredEnvVars) {
    $envValue = [System.Environment]::GetEnvironmentVariable($envVar)
    if (-not $envValue) {
        $envValid = $false
        break
    }
}
Add-ValidationResult "Environment Variables" $envValid "Required variables available"

# Summary
Write-Host "`n=== Validation Summary ===" -ForegroundColor Cyan
$totalTests = $validationResults.Count
$passedTests = ($validationResults | Where-Object { $_.IsValid }).Count
$failedTests = $totalTests - $passedTests

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red

if ($failedTests -eq 0) {
    Write-Host "`nEnvironment validation completed successfully!" -ForegroundColor Green
    Write-Host "Your PowerShell environment is ready for Tanium TCO development." -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`nEnvironment validation failed." -ForegroundColor Red
    Write-Host "Please fix the failed items above before continuing." -ForegroundColor Yellow
    
    if (-not $Fix) {
        Write-Host "Run with -Fix parameter to attempt automatic fixes." -ForegroundColor Yellow
    }
    exit 1
}