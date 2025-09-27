# PowerShell Quick Start Guide - Tanium TCO Enterprise LMS

## 🚀 Enterprise LMS Development Setup Guide

Complete PowerShell-focused setup guide for developing the **Enterprise-Grade Tanium TCO Learning Management System** on Windows. This platform now features sophisticated architecture comparable to Coursera and Udemy with production-ready capabilities.

## Prerequisites

### Required Software for Enterprise LMS Development

- **PowerShell 7+** (PowerShell Core) - Required for enterprise development workflows
- **Node.js 18+** with npm - Foundation for Next.js 15.5.2 + TypeScript stack
- **Git for Windows** - Version control for enterprise codebase management
- **Visual Studio Code** (recommended) - Optimal TypeScript development environment
- **Supabase CLI** (optional) - For advanced database management operations

### Verify Enterprise Development Environment

```powershell
# Verify PowerShell version (7+ required for enterprise workflows)
Write-Host "🔍 PowerShell Version Check:" -ForegroundColor Cyan
$PSVersionTable.PSVersion

# Verify Node.js and npm for Next.js 15.5.2 compatibility
Write-Host "🔍 Node.js Environment Check:" -ForegroundColor Cyan
node --version  # Should be 18+ for enterprise LMS features
npm --version   # Latest npm for TypeScript 5.9.2 support

# Verify Git for enterprise version control
Write-Host "🔍 Git Version Check:" -ForegroundColor Cyan
git --version

# Check for TypeScript support (optional)
Write-Host "🔍 TypeScript Global Check:" -ForegroundColor Cyan
try { npx tsc --version } catch { Write-Host "TypeScript: Will be installed locally" -ForegroundColor Yellow }
```

## 📁 Enterprise LMS Project Setup

### 1. Clone and Navigate to Enterprise LMS

```powershell
# Navigate to the enterprise LMS directory
Write-Host "🏗️ Setting up Enterprise Tanium TCO LMS..." -ForegroundColor Magenta
Set-Location "C:\Users\robne\Documents\mapmydeals-gpt5\Tanium TCO\modern-tco"

# Verify enterprise project structure
if (Test-Path "package.json") {
    Write-Host "✅ Enterprise LMS project found" -ForegroundColor Green
} else {
    Write-Host "❌ Project structure not found" -ForegroundColor Red
    exit 1
}
```

### 2. Enterprise Environment Configuration

```powershell
# Setup enterprise environment variables
Write-Host "⚙️ Configuring enterprise environment..." -ForegroundColor Blue

# Copy environment template if needed
if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Copy-Item .env.example .env.local
        Write-Host "✅ Environment template created" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Creating minimal .env.local..." -ForegroundColor Yellow
        @"
# Tanium TCO Enterprise LMS Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qnwcwoutgarhqxlgsjzs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key_here
NEXT_PUBLIC_ANALYTICS_DEBUG=true
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    }
}

# Edit environment file
Write-Host "📝 Opening environment configuration..." -ForegroundColor Yellow
code .env.local
```

### 3. Install Enterprise Dependencies

```powershell
# Install enterprise LMS dependencies
Write-Host "📦 Installing enterprise dependencies..." -ForegroundColor Blue

# Clean installation for enterprise environment
if (Test-Path "node_modules") {
    Write-Host "🗑️ Cleaning existing installation..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json"
}

# Install all enterprise packages
npm install

# Verify enterprise installation
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Enterprise dependencies installed successfully" -ForegroundColor Green

    # Show key enterprise packages
    Write-Host "🔍 Enterprise packages installed:" -ForegroundColor Cyan
    npm list next @supabase/supabase-js @anthropic-ai/sdk --depth=0
} else {
    Write-Host "❌ Installation failed" -ForegroundColor Red
    exit 1
}
```

## 🔧 PowerShell-Specific Commands

### Development Commands

```powershell
# Start development server
npm run dev

# Start with specific port
$env:PORT = "3007"; npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

### PowerShell-Optimized Commands

```powershell
# Linting (PowerShell optimized)
npm run lint:pwsh

# Format code (Windows line endings)
npm run format:pwsh

# Quality check (PowerShell compatible)
npm run quality:pwsh

# Fix all issues (PowerShell)
npm run fix:pwsh
```

### Database Operations

```powershell
# Verify PostgreSQL schema
npm run db:verify

# Run database migrations
npm run db:migrate

# Deploy schema
npm run db:deploy
```

### Supabase Setup (PowerShell)

```powershell
# Navigate to automation scripts
Set-Location scripts/supabase-automation

# Global Supabase setup
.\supabase-global-setup.ps1 -AccessToken "your_token_here"

# Validate setup
.\supabase-global-setup.ps1 -Validate

# Project setup
.\supabase-project-setup.ps1

# MCP integration setup
.\supabase-mcp-setup.ps1
```

## 📂 File Operations (PowerShell)

### Common File Tasks

```powershell
# List files and directories
Get-ChildItem
# OR
dir

# Create directories
New-Item -ItemType Directory -Path "new-folder"

# Copy files
Copy-Item source.txt destination.txt

# Move files
Move-Item old-location.txt new-location.txt

# Delete files
Remove-Item file.txt

# View file contents
Get-Content file.txt
```

### Project-Specific Operations

```powershell
# View project structure
Get-ChildItem -Recurse -Directory | Select-Object Name, FullName

# Find specific file types
Get-ChildItem -Recurse -Filter "*.ts" | Select-Object Name, Directory

# Search for text in files
Select-String -Pattern "search-term" -Path "src\**\*.ts"
```

## 🛠️ Development Workflow

### 1. Daily Development

```powershell
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Start development server
npm run dev

# Open in browser: http://localhost:3000
```

### 2. Making Changes

```powershell
# Create feature branch
git checkout -b feature/your-feature-name

# Check modified files
git status

# Add changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push branch
git push -u origin feature/your-feature-name
```

### 3. Quality Checks (Before Commit)

```powershell
# Run all quality checks
npm run quality:pwsh

# Fix any issues
npm run fix:pwsh

# Run tests
npm run test

# Type checking
npm run typecheck
```

## 🔍 Troubleshooting PowerShell Issues

### Common PowerShell Fixes

```powershell
# Enable script execution (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Clear npm cache
npm cache clean --force

# Delete and reinstall node_modules
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install

# Reset Git line endings (if needed)
git config core.autocrlf true
git add --renormalize .
```

### Environment Variable Issues

```powershell
# Set temporary environment variables
$env:NODE_ENV = "development"
$env:FORCE_COLOR = "1"

# Set permanent user environment variable
[Environment]::SetEnvironmentVariable("NODE_ENV", "development", "User")

# View all environment variables
Get-ChildItem Env:
```

### Port and Process Issues

```powershell
# Find process using port 3000
netstat -aon | Select-String ":3000"

# Kill process by PID (replace XXXX with actual PID)
Stop-Process -Id XXXX -Force

# Alternative: Kill all Node processes
Get-Process node | Stop-Process -Force
```

## 🧪 Testing Commands

### Test Execution

```powershell
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Database connection test
npm run test:db
```

### Database Testing

```powershell
# Test PostgreSQL connection
npm run db:verify

# Validate Supabase connection
node scripts/validate-supabase-connection.js

# Test authentication system
node scripts/verify-auth-system.js
```

## 📚 Task Management

### Task CLI (PowerShell)

```powershell
# Initialize task system
npm run task:init

# Add new task
npm run task:add

# List tasks
npm run task:list

# Update task status
npm run task:update

# Complete task
npm run task:complete
```

## 🚀 Deployment Preparation

### Production Build

```powershell
# Clean build
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm run build

# Test production build
npm run start
```

### Migration Management

```powershell
# Check migration status
npm run migration:status

# Run migrations
npm run migration:start

# Complete migration
npm run migration:complete
```

## 🔗 Useful PowerShell Aliases

Add these to your PowerShell profile for convenience:

```powershell
# Edit PowerShell profile
notepad $PROFILE

# Add these aliases:
Set-Alias -Name ll -Value Get-ChildItem
Set-Alias -Name cat -Value Get-Content
Set-Alias -Name grep -Value Select-String

# Custom functions
function dev { npm run dev }
function build { npm run build }
function test { npm run test }
function lint { npm run lint:pwsh }
function fix { npm run fix:pwsh }
```

## 📖 Additional Resources

### Documentation References

- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tanium Documentation](https://docs.tanium.com/)

### Project-Specific Guides

- `docs/QUICK_START_GUIDE.md` - General quick start
- `docs/SUPABASE_PERMISSIONS_GUIDE.md` - Database setup
- `docs/SCHEMA_SETUP.md` - Database schema
- `docs/POSTGRESQL_SCHEMA_SETUP.md` - PostgreSQL specifics

## 🆘 Getting Help

### Common Issues and Solutions

1. **PowerShell Execution Policy**: Run `Set-ExecutionPolicy RemoteSigned`
2. **Node Modules Issues**: Delete `node_modules` and run `npm install`
3. **Port Already in Use**: Use `netstat` to find and kill conflicting processes
4. **Environment Variables**: Use `[Environment]::SetEnvironmentVariable()` for persistence
5. **Line Ending Issues**: Configure Git with `git config core.autocrlf true`

### Support Channels

- Project documentation in `docs/` directory
- Git issues for bug reports
- Development team for architecture questions

---

## Quick Reference Card

| Task | PowerShell Command |
|------|-------------------|
| Start Dev Server | `npm run dev` |
| Build Project | `npm run build` |
| Run Tests | `npm run test` |
| Lint (PowerShell) | `npm run lint:pwsh` |
| Format (PowerShell) | `npm run format:pwsh` |
| Quality Check | `npm run quality:pwsh` |
| Fix Issues | `npm run fix:pwsh` |
| Type Check | `npm run typecheck` |
| Database Verify | `npm run db:verify` |
| Supabase Setup | `.\scripts\supabase-automation\supabase-global-setup.ps1` |

**Happy coding in PowerShell! 🎉**
