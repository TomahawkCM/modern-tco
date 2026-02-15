# ESLint & Code Quality Workflow - PowerShell Optimized

## 🚀 Quick Commands (PowerShell)

### Essential Lint Commands

```powershell
# Quick lint check (development)
npm run lint:quick

# Full project lint with caching
npm run lint

# Fix all auto-fixable issues
npm run lint:fix

# Fix lint + format code
npm run lint:fix-all

# Quiet lint check (CI/CD)
npm run lint:check

# Performance profiling
npm run lint:perf
```

### Code Quality Pipeline

```powershell
# Complete quality check
npm run check-all

# Fix everything possible
npm run fix-all

# Type checking only
npm run check-types

# Format code only
npm run format
```

## 📋 Modern Configuration

### ESLint v9 Flat Config

- **File**: `eslint.config.cjs`
- **Features**: TypeScript integration, React Hooks, Next.js rules
- **Caching**: Enabled for performance
- **Ignores**: Build folders, dependencies, generated files

### Dependencies Updated

- ✅ `@next/eslint-plugin-next` - Next.js specific rules
- ✅ `eslint-plugin-react-hooks` - React Hooks validation
- ✅ `lint-staged` - Pre-commit automation
- ✅ Modern TypeScript ESLint v8.42.0

## 🛠️ VS Code Integration

### Auto-configured in `.vscode/settings.json`

- ESLint flat config support
- Auto-fix on save
- Prettier integration
- TypeScript optimizations
- Performance exclusions

### Recommended Extensions

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript Importer (`pmneo.tsimporter`)

## 🔄 Pre-commit Setup (Optional)

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

## 🎯 Rule Highlights

### TypeScript Rules (2025 Enhanced)

- `@typescript-eslint/consistent-type-imports` - Enforce type imports
- `@typescript-eslint/no-unnecessary-type-parameters` - Clean generics
- `@typescript-eslint/prefer-promise-reject-errors` - Error handling
- `@typescript-eslint/only-throw-error` - Consistent error types

### Next.js Rules

- `@next/next/no-unwanted-polyfillio` - Security
- `@next/next/no-before-interactive-script-outside-document` - Performance
- `@next/next/no-sync-scripts` - Loading optimization

### React Rules

- `react-hooks/rules-of-hooks` - Hook usage validation
- `react-hooks/exhaustive-deps` - Dependency tracking

## 🚨 Troubleshooting

### PowerShell Issues

If npm commands fail, ensure Node.js is in PATH:

```powershell
# Check Node.js installation
node --version
npm --version

# If not found, restart PowerShell or add to PATH
```

### Cache Issues

```powershell
# Clear ESLint cache
npm run lint -- --cache-location .eslintcache

# Or delete cache file
Remove-Item .eslintcache -ErrorAction SilentlyContinue
```

### VS Code Issues

1. Reload window: `Ctrl+Shift+P` → "Developer: Reload Window"
2. Check ESLint output panel
3. Verify extensions are enabled

## 🪟 **PowerShell-Specific Configuration & Troubleshooting**

### **PowerShell Execution Policy Setup**

```powershell
# Check current execution policy
Get-ExecutionPolicy

# Set execution policy for current user (if restricted)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verify change
Get-ExecutionPolicy -List
```

### **Enhanced PowerShell Linting Commands**

```powershell
# Comprehensive lint check with PowerShell error handling
npm run lint
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Linting completed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Linting failed with errors" -ForegroundColor Red
    Write-Host "Run 'npm run lint:fix' to auto-fix issues" -ForegroundColor Yellow
}

# Enhanced fix command with validation
npm run lint:fix
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Auto-fix completed successfully" -ForegroundColor Green
    Write-Host "Running validation check..." -ForegroundColor Cyan
    npm run lint:check
} else {
    Write-Host "❌ Auto-fix encountered errors" -ForegroundColor Red
}

# Complete quality pipeline with PowerShell feedback
Write-Host "🔍 Running complete code quality pipeline..." -ForegroundColor Cyan
$hasErrors = $false

Write-Host "📝 TypeScript validation..." -ForegroundColor Blue
npm run check-types
if ($LASTEXITCODE -ne 0) { $hasErrors = $true }

Write-Host "🔧 ESLint validation..." -ForegroundColor Blue
npm run lint
if ($LASTEXITCODE -ne 0) { $hasErrors = $true }

Write-Host "🎨 Code formatting..." -ForegroundColor Blue
npm run format
if ($LASTEXITCODE -ne 0) { $hasErrors = $true }

if (-not $hasErrors) {
    Write-Host "✅ All quality checks passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Quality pipeline completed with errors" -ForegroundColor Red
    Write-Host "Review output above and fix issues before committing" -ForegroundColor Yellow
}
```

### **PowerShell Environment Validation**

```powershell
# Comprehensive environment check
Write-Host "🔍 Environment Validation Report" -ForegroundColor Cyan

# Node.js and npm versions
Write-Host "Node.js: $(node --version)" -ForegroundColor Yellow
Write-Host "npm: $(npm --version)" -ForegroundColor Yellow

# Project dependencies check
if (Test-Path "package.json") {
    Write-Host "✅ package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ package.json missing" -ForegroundColor Red
}

if (Test-Path "node_modules") {
    Write-Host "✅ node_modules installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules missing - run 'npm install'" -ForegroundColor Yellow
}

# ESLint configuration check
if (Test-Path "eslint.config.cjs") {
    Write-Host "✅ ESLint config found (eslint.config.cjs)" -ForegroundColor Green
} elseif (Test-Path ".eslintrc.js") {
    Write-Host "⚠️  Legacy ESLint config found (.eslintrc.js)" -ForegroundColor Yellow
} else {
    Write-Host "❌ ESLint config missing" -ForegroundColor Red
}

# TypeScript configuration
if (Test-Path "tsconfig.json") {
    Write-Host "✅ TypeScript config found" -ForegroundColor Green
} else {
    Write-Host "❌ TypeScript config missing" -ForegroundColor Red
}
```

### **PowerShell Performance Optimization**

```powershell
# Performance-optimized linting for large projects
Write-Host "⚡ Running performance-optimized lint check..." -ForegroundColor Cyan

# Set performance environment variables
$env:NODE_OPTIONS = "--max-old-space-size=8192"
$env:ESLint_USE_FLAT_CONFIG = "true"

# Quick lint for development
npm run lint:quick
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Quick lint passed - safe to continue development" -ForegroundColor Green
} else {
    Write-Host "⚠️  Quick lint found issues - consider running full check" -ForegroundColor Yellow
}

# Clear environment variables
Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue
Remove-Item Env:ESLint_USE_FLAT_CONFIG -ErrorAction SilentlyContinue
```

### **PowerShell CI/CD Integration**

```powershell
# CI/CD quality gate for PowerShell automation
Write-Host "🚀 CI/CD Quality Gate Validation" -ForegroundColor Magenta

$qualityGate = @{
    TypeScript = $false
    Linting = $false
    Formatting = $false
    BuildTest = $false
}

# TypeScript check
Write-Host "📝 TypeScript validation..." -ForegroundColor Blue
npm run check-types --silent
$qualityGate.TypeScript = ($LASTEXITCODE -eq 0)

# Linting check
Write-Host "🔧 Linting validation..." -ForegroundColor Blue
npm run lint:check --silent
$qualityGate.Linting = ($LASTEXITCODE -eq 0)

# Format check
Write-Host "🎨 Format validation..." -ForegroundColor Blue
npm run format:check --silent
$qualityGate.Formatting = ($LASTEXITCODE -eq 0)

# Build test
Write-Host "🏗️ Build validation..." -ForegroundColor Blue
npm run build --silent
$qualityGate.BuildTest = ($LASTEXITCODE -eq 0)

# Results summary
Write-Host "`n📊 Quality Gate Results:" -ForegroundColor Cyan
foreach ($check in $qualityGate.GetEnumerator()) {
    $status = if ($check.Value) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($check.Value) { "Green" } else { "Red" }
    Write-Host "$($check.Key): $status" -ForegroundColor $color
}

$allPassed = ($qualityGate.Values -notcontains $false)
if ($allPassed) {
    Write-Host "`n🎉 All quality gates passed! Ready for deployment." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n🚨 Quality gate failures detected. Fix issues before proceeding." -ForegroundColor Red
    exit 1
}
```

## 📊 Performance Tips

### Fast Development

```powershell
# Only check src/ directory
npm run lint:quick

# Skip type checking during active development
npm run lint -- --no-type-check
```

### CI/CD Optimization

```powershell
# Quiet mode with exit codes
npm run lint:check

# Parallel execution
npm run check-all
```

## 🔗 Integration with Build Process

The `build` script automatically includes linting:

```powershell
npm run build  # Includes lint check
```

For build without linting:

```powershell
cross-env NODE_OPTIONS=--max-old-space-size=8192 next build --no-lint
```

---

**Updated**: January 2025 for Next.js 15.5.2 + ESLint v9 + PowerShell optimization
