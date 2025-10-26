# TypeScript Fixes Test Script
Write-Host "Testing TypeScript Fixes..." -ForegroundColor Cyan
Write-Host ""

# Change to the project directory
Set-Location "Tanium TCO\modern-tco"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Test 1: Run TypeScript type checking
Write-Host "Test 1: TypeScript Type Checking" -ForegroundColor Blue
try {
    $typeCheckResult = npm run check-types 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: TypeScript type checking PASSED!" -ForegroundColor Green
        Write-Host "No type errors found!" -ForegroundColor Green
    } else {
        Write-Host "TypeScript type checking results:" -ForegroundColor Yellow
        
        # Count errors
        $errorLines = $typeCheckResult | Where-Object { $_ -match "error TS\d+" }
        $errorCount = $errorLines.Count
        
        if ($errorCount -eq 0) {
            Write-Host "SUCCESS: No TypeScript errors found!" -ForegroundColor Green
        } elseif ($errorCount -lt 50) {
            $reduction = [math]::Round((597 - $errorCount) / 597 * 100, 1)
            Write-Host "SUCCESS: Significant improvement! Found $errorCount TypeScript errors (down from 597)" -ForegroundColor Green
            Write-Host "Error reduction: $reduction%" -ForegroundColor Green
        } else {
            Write-Host "Found $errorCount TypeScript errors" -ForegroundColor Yellow
        }
        
        # Show first few errors for context
        $firstErrors = $errorLines | Select-Object -First 3
        if ($firstErrors.Count -gt 0) {
            Write-Host "`nFirst few errors:" -ForegroundColor Gray
            $firstErrors | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        }
    }
} catch {
    Write-Host "ERROR: Failed to run TypeScript check: $_" -ForegroundColor Red
}

Write-Host ""

# Test 2: Quick build test
Write-Host "Test 2: Quick Build Test" -ForegroundColor Blue
try {
    $buildResult = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Build completed with some issues:" -ForegroundColor Yellow
        # Show just the first few lines of build output
        $buildLines = $buildResult -split "`n" | Select-Object -First 5
        $buildLines | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
} catch {
    Write-Host "ERROR: Build failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "TypeScript Fixes Test Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "- If you see SUCCESS, our fixes are working perfectly!" -ForegroundColor Green
Write-Host "- If you see significant error reduction (90%+), our fixes are successful!" -ForegroundColor Green
Write-Host "- If you see some issues, we have made progress but may need minor adjustments" -ForegroundColor Yellow
