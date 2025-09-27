# PowerShell Command Reference for Tanium TCO Development

## 🚀 Complete PowerShell Command Reference

Comprehensive PowerShell command reference for Windows developers working on the Modern Tanium TCO Study Platform.

## 📁 File Operations

### Directory Operations

```powershell
# Create directories
New-Item -ItemType Directory -Path "src\components"
mkdir src\components  # Alias

# List directory contents
Get-ChildItem
ls  # Alias
dir  # Alias

# Change directory
Set-Location "src\components"
cd src\components  # Alias

# Remove directories
Remove-Item "old-folder" -Recurse -Force
rm -rf old-folder  # Unix-style alias

# Copy directories
Copy-Item -Recurse "source" "destination"
cp -r source destination  # Unix-style alias
```

### File Operations

```powershell
# Create files
New-Item -ItemType File -Path "README.md"
ni README.md  # Alias

# Copy files
Copy-Item "source.txt" "destination.txt"
cp source.txt destination.txt  # Unix-style alias

# Move/rename files
Move-Item "old-name.txt" "new-name.txt"
mv old-name.txt new-name.txt  # Unix-style alias

# Delete files
Remove-Item "file.txt"
rm file.txt  # Unix-style alias

# View file contents
Get-Content "file.txt"
cat file.txt  # Unix-style alias

# Find files
Get-ChildItem -Recurse -Filter "*.ts"
Get-ChildItem -Recurse -Include "*.ts", "*.tsx"
```

## 🔧 Development Operations

### Node.js & npm

```powershell
# Check versions
node --version
npm --version

# Install dependencies
npm install
npm ci  # Clean install

# Run scripts
npm run dev
npm run build
npm run test
npm run typecheck
npm run lint

# With specific port
$env:PORT = "3002"; npm run dev

# Package management
npm install package-name
npm install -D package-name  # Dev dependency
npm uninstall package-name
npm update
```

### Environment Variables

```powershell
# Set temporary environment variables
$env:NODE_ENV = "development"
$env:SUPABASE_URL = "your-url-here"
$env:PORT = "3000"

# Set permanent user environment variables
[Environment]::SetEnvironmentVariable("NODE_ENV", "development", "User")

# View environment variables
Get-ChildItem Env:
$env:NODE_ENV  # View specific variable
```

### Git Operations

```powershell
# Basic git commands (work the same)
git status
git add .
git commit -m "commit message"
git push
git pull

# Git configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Branch operations
git checkout -b feature/new-feature
git checkout main
git merge feature/new-feature
git branch -d feature/new-feature
```

## 🗃️ Database Operations

### Supabase Operations

```powershell
# Supabase CLI
supabase --version
supabase login
supabase init
supabase start
supabase status
supabase stop

# Database migrations
supabase db reset
supabase db push
supabase db pull
supabase gen types typescript --project-id your-project-id

# Edge functions
supabase functions new function-name
supabase functions deploy function-name
```

### PostgreSQL Operations

```powershell
# Connection testing
npm run db:test
npm run db:verify

# Schema operations
npm run db:migrate
npm run db:seed
npm run db:reset
```

## 🧪 Testing Operations

### Test Execution

```powershell
# Unit tests
npm run test
npm run test:watch
npm run test:coverage

# E2E tests
npm run test:e2e
npx playwright test
npx playwright test --ui  # Interactive mode

# Specific test files
npm test -- ComponentName.test.ts
npx jest ComponentName.test.ts
```

### Playwright Specific

```powershell
# Install browsers
npx playwright install

# Run tests with options
npx playwright test --headed
npx playwright test --debug
npx playwright test --project=chromium

# Generate test code
npx playwright codegen localhost:3000
```

## 🔍 Search & Text Operations

### Find and Search

```powershell
# Search for text in files (PowerShell native)
Select-String -Pattern "search-term" -Path "src\**\*.ts"
Select-String -Pattern "TODO" -Recurse -Include "*.ts", "*.tsx"

# Find files by name
Get-ChildItem -Recurse -Filter "*.test.ts"
Get-ChildItem -Recurse -Name "*component*"

# Search and replace in files
(Get-Content "file.txt") -replace "old-text", "new-text" | Set-Content "file.txt"
```

### Text Processing

```powershell
# Count lines in file
(Get-Content "file.txt").Count

# Get first/last lines
Get-Content "file.txt" -First 10
Get-Content "file.txt" -Last 10

# Sort and unique
Get-Content "file.txt" | Sort-Object | Get-Unique
```

## 🚦 Process & Performance

### Process Management

```powershell
# Find processes by name
Get-Process node
Get-Process npm

# Kill processes
Stop-Process -Name node -Force
Get-Process node | Stop-Process -Force

# Find process using port
netstat -aon | Select-String ":3000"
netstat -ano | findstr :3000  # Windows style

# Kill process by PID
Stop-Process -Id 1234 -Force
taskkill /PID 1234 /F  # Windows style
```

### Performance Monitoring

```powershell
# System information
Get-ComputerInfo
Get-WmiObject -Class Win32_ComputerSystem

# Memory usage
Get-WmiObject -Class Win32_PhysicalMemory
Get-Counter "\Memory\Available MBytes"

# CPU usage
Get-Counter "\Processor(_Total)\% Processor Time"
```

## 📦 Build & Deployment

### Build Operations

```powershell
# Clean builds
if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }
npm run build

# Production testing
npm run start  # After build

# Analyze bundle
npm run analyze  # If configured
```

### Deployment Preparation

```powershell
# Environment setup for deployment
Copy-Item ".env.example" ".env.production"
$env:NODE_ENV = "production"

# Verify deployment readiness
npm run typecheck
npm run lint
npm run test
npm run build
```

## 🔧 System Configuration

### PowerShell Configuration

```powershell
# Check PowerShell version
$PSVersionTable

# Execution policy
Get-ExecutionPolicy
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Profile location
$PROFILE
Test-Path $PROFILE

# Create profile if it doesn't exist
if (!(Test-Path $PROFILE)) { New-Item -Type File -Path $PROFILE -Force }
```

### Windows Development Setup

```powershell
# Install Chocolatey (package manager)
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install development tools via Chocolatey
choco install nodejs git vscode

# Windows Subsystem for Linux (if needed)
wsl --install
wsl --list --verbose
```

## 🎯 TCO-Specific Operations

### Content Operations

```powershell
# Study content validation
npm run content:validate
npm run content:build

# Quiz system testing
npm run quiz:test
npm run quiz:build

# Lab exercise verification
npm run labs:verify
npm run labs:test
```

### Database Seeding

```powershell
# Seed study content
npm run db:seed:domains
npm run db:seed:questions  
npm run db:seed:labs

# Content migration
npm run migrate:content
npm run migrate:questions
```

## ⚡ Performance Optimization

### Bundle Analysis

```powershell
# Analyze bundle size
npm run build
npm run analyze  # If webpack-bundle-analyzer configured

# Performance testing
npm run perf:test
npm run lighthouse  # If configured
```

### Caching Operations

```powershell
# Clear caches
npm cache clean --force
Remove-Item "node_modules" -Recurse -Force
Remove-Item "package-lock.json" -Force
npm install

# Clear Next.js cache
Remove-Item ".next\cache" -Recurse -Force -ErrorAction SilentlyContinue
```

## 🛠️ Troubleshooting

### Common Issues

```powershell
# Node modules issues
Remove-Item "node_modules" -Recurse -Force
Remove-Item "package-lock.json" -Force
npm cache clean --force
npm install

# Port conflicts
netstat -aon | Select-String ":3000"
# Kill the process using the port

# Permission issues
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Line ending issues (for git)
git config core.autocrlf true
git add --renormalize .
```

### Debugging

```powershell
# Node.js debugging
node --inspect-brk src/index.js
npm run dev:debug  # If configured

# Environment debugging
Write-Host "Node version: $(node --version)"
Write-Host "npm version: $(npm --version)"
Write-Host "Working directory: $(Get-Location)"
Get-ChildItem Env: | Where-Object Name -like "*NODE*"
```

## 📚 Useful PowerShell Functions

### Custom Functions for Development

```powershell
# Add to your PowerShell profile
function dev { npm run dev }
function build { npm run build }
function test { npm run test }
function start { npm run start }

function kill-node {
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
}

function clean-project {
    Remove-Item "node_modules", ".next", "dist" -Recurse -Force -ErrorAction SilentlyContinue
    npm cache clean --force
    npm install
}

function git-fresh {
    git fetch --all
    git reset --hard origin/main
    git clean -fdx
}
```

## 🔗 Integration with VSCode

### VSCode PowerShell Integration

```json
// settings.json
{
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.profiles.windows": {
    "PowerShell": {
      "source": "PowerShell",
      "icon": "terminal-powershell"
    }
  }
}
```

### Recommended Extensions

- PowerShell (Microsoft)
- Auto Rename Tag
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

## 🚀 Quick Reference Card

| Task | PowerShell Command |
|------|-------------------|
| Start Dev Server | `npm run dev` |
| Install Dependencies | `npm install` |
| Run Tests | `npm run test` |
| Build Project | `npm run build` |
| Type Check | `npm run typecheck` |
| Lint Code | `npm run lint` |
| Clean Install | `npm ci` |
| View File | `Get-Content file.txt` |
| Copy File | `Copy-Item src dest` |
| Find Files | `Get-ChildItem -Recurse -Filter "*.ts"` |
| Search Text | `Select-String -Pattern "text" -Recurse` |
| Kill Process | `Stop-Process -Name node -Force` |
| Set Env Var | `$env:NODE_ENV = "development"` |

---

**💡 Pro Tips:**

1. **Use Tab Completion**: PowerShell has excellent tab completion for commands, paths, and parameters
2. **Aliases**: Many Unix commands work as aliases in PowerShell (ls, cat, rm, etc.)
3. **Pipeline Power**: Use PowerShell's object pipeline for complex operations
4. **Error Handling**: Add `-ErrorAction SilentlyContinue` to commands that might fail
5. **Help System**: Use `Get-Help command-name` for detailed help on any command

**🎯 TCO Development Focus**: This reference prioritizes commands and workflows specific to developing the Modern Tanium TCO Study Platform while maintaining cross-platform compatibility.
