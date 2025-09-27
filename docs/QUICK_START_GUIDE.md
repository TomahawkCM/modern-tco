# 🚀 Quick Start Guide - TCO Study Platform

## 📚 NEW Developer? Start Here

Welcome to the Tanium Certified Operator (TCO) Study Platform! This guide will get you productive immediately using our comprehensive knowledge base.

## 🎯 5-Minute Quick Start

### Step 1: Essential Reading (2 minutes)

1. **Project Overview**: Read `README.md` for project context and goals
2. **Documentation Hub**: Browse `docs/README.md` for complete knowledge base navigation

### Step 2: Database Setup (2 minutes)

1. **Database Guide**: Start with `docs/supabase/supabase-database-guide.md`
   - Client setup and environment configuration
   - Basic CRUD operations and error handling
2. **Quick Reference**: Bookmark `docs/quick-reference/database-cheat-sheet.md`
   - Common operations and TypeScript examples
   - Performance tips and optimization shortcuts

### Step 3: Development Environment (1 minute)

**PowerShell (Windows):**

```powershell
# Navigate to project directory
Set-Location "modern-tco"

# Install dependencies
npm install

# Start development server (default port 3000)
npm run dev

# Alternative: Start with custom port
$env:PORT = "3002"; npm run dev

# Enable colored output
$env:FORCE_COLOR = "1"
```

**Unix/Linux:**

```bash
# Navigate to project directory
cd modern-tco

# Install dependencies
npm install

# Start development server (default port 3000)
npm run dev

# Alternative: Start with custom port
PORT=3002 npm run dev
```

## 🎯 Role-Based Quick Paths

### 👩‍💻 **Frontend Developer**

**Your First 15 Minutes:**

1. **UI Components**: Review `src/components/` structure
2. **Context Integration**: Read `docs/supabase/tco-context-integration.md`
3. **Real-time Features**: Study `docs/supabase/supabase-realtime-features.md`
4. **Performance**: Check `docs/supabase/supabase-performance-optimization.md`

**Key Files for Frontend Work:**

- `docs/supabase/tco-context-integration.md` - 9 React contexts explained
- `docs/quick-reference/database-cheat-sheet.md` - TypeScript examples
- `docs/supabase/supabase-javascript-sdk.md` - SDK integration patterns

### 🔧 **Backend Developer**

**Your First 15 Minutes:**

1. **Database Schema**: Study `docs/supabase/tco-database-schema.md`
2. **PostgreSQL Features**: Read `docs/postgresql/postgresql-fundamentals.md`
3. **Authentication**: Review `docs/supabase/supabase-auth-patterns.md`
4. **Performance Tuning**: Check `docs/postgresql/postgresql-performance-optimization.md`

**Key Files for Backend Work:**

- `docs/supabase/tco-database-schema.md` - 8 tables, RLS policies, triggers
- `docs/postgresql/postgresql-advanced-features.md` - Extensions, full-text search
- `docs/integration/supabase-postgresql-integration.md` - Complete integration guide

### 🧪 **QA/Testing**

**Your First 15 Minutes:**

1. **Testing Strategy**: Review existing test patterns in `tests/`
2. **Database Testing**: Check `docs/quick-reference/database-cheat-sheet.md`
3. **Troubleshooting**: Study `docs/quick-reference/troubleshooting-guide.md`
4. **Performance**: Review optimization guides for test scenarios

**Key Files for QA Work:**

- `docs/quick-reference/troubleshooting-guide.md` - Common issues and solutions
- `docs/supabase/supabase-performance-optimization.md` - Performance testing
- `docs/supabase/supabase-realtime-features.md` - Real-time feature testing

### 🏗️ **DevOps/Infrastructure**

**Your First 15 Minutes:**

1. **Integration Architecture**: Read `docs/integration/supabase-postgresql-integration.md`
2. **Performance Monitoring**: Study monitoring patterns in performance guides
3. **Database Administration**: Review PostgreSQL optimization guides
4. **Security**: Check RLS policies and authentication patterns

**Key Files for DevOps Work:**

- `docs/integration/supabase-postgresql-integration.md` - Complete architecture
- `docs/postgresql/postgresql-performance-optimization.md` - Database tuning
- `docs/supabase/supabase-auth-patterns.md` - Security patterns

## 🛠️ Common Development Tasks

### Adding a New Feature

1. **Database Changes**: Check `docs/supabase/tco-database-schema.md` for schema patterns
2. **Context Integration**: Follow patterns in `docs/supabase/tco-context-integration.md`
3. **Real-time Updates**: Implement using `docs/supabase/supabase-realtime-features.md`
4. **Performance**: Apply tips from `docs/supabase/supabase-performance-optimization.md`

### Debugging Issues

1. **First Stop**: `docs/quick-reference/troubleshooting-guide.md`
2. **Database Issues**: Check database cheat sheet for diagnostic queries
3. **Performance Problems**: Use monitoring patterns from optimization guides
4. **Real-time Issues**: Review subscription patterns and error handling

### Optimizing Performance

1. **Database**: Follow `docs/postgresql/postgresql-performance-optimization.md`
2. **Client-side**: Apply patterns from `docs/supabase/supabase-performance-optimization.md`
3. **Integration**: Use advanced patterns from integration guide
4. **Monitoring**: Implement health checks from troubleshooting guide

## 📋 Essential Commands

### Development Workflow

**PowerShell (Windows):**

```powershell
# Start development server
npm run dev

# Type checking
npm run typecheck

# Database schema verification
node scripts/verify-postgresql-schema.js

# Content migration
node scripts/run-native-postgresql.js

# PowerShell-optimized commands
npm run lint:pwsh     # Linting for PowerShell
npm run format:pwsh   # Format with Windows line endings
npm run quality:pwsh  # Complete quality check

# Environment setup
$env:NODE_ENV = "development"
$env:FORCE_COLOR = "1"

# Development with custom port
$env:PORT = "3002"; npm run dev
```

**Unix/Linux:**

```bash
# Start development
npm run dev

# Type checking
npm run typecheck

# Database schema verification
node scripts/verify-postgresql-schema.js

# Content migration
node scripts/run-native-postgresql.js
```

### Database Operations

**PowerShell (Windows):**

```powershell
# Connect to Supabase
# See docs/supabase/supabase-database-guide.md for setup

# Verify schema
npm run test:db

# Run migrations (if needed)
# See docs/supabase/tco-database-schema.md

# Environment setup for Supabase
$env:SUPABASE_URL = "your-project-url"
$env:SUPABASE_ANON_KEY = "your-anon-key"

# Supabase setup (PowerShell scripts)
if (Test-Path "scripts/supabase-automation") {
    Set-Location "scripts/supabase-automation"
    .\supabase-global-setup.ps1 -AccessToken "your_token"
    .\supabase-project-setup.ps1
    Set-Location "..\.."
}

# Verify connection
Write-Host "Testing Supabase connection..." -ForegroundColor Green
npm run db:verify
```

**Unix/Linux:**

```bash
# Connect to Supabase
# See docs/supabase/supabase-database-guide.md for setup

# Verify schema
npm run test:db

# Run migrations (if needed)
# See docs/supabase/tco-database-schema.md
```

## 🎯 Success Checklist

### First Day Success

- [ ] Project running locally (`npm run dev`)
- [ ] Database connection working
- [ ] Key documentation bookmarked
- [ ] Understanding of 9 React contexts
- [ ] Basic CRUD operations tested

### First Week Success

- [ ] Can add new questions to database
- [ ] Understanding of real-time features
- [ ] Performance optimization applied
- [ ] Troubleshooting skills developed
- [ ] Feature development workflow mastered

## 🔗 Key Links

### Documentation Hub

- **Central Index**: `docs/README.md`
- **PowerShell Guide**: `docs/POWERSHELL_QUICKSTART.md` (Windows users start here!)
- **Database Guide**: `docs/supabase/supabase-database-guide.md`
- **Quick Reference**: `docs/quick-reference/database-cheat-sheet.md`
- **Troubleshooting**: `docs/quick-reference/troubleshooting-guide.md`

### Live Resources

- **Development Server**: <http://localhost:3000>
- **Supabase Dashboard**: <https://supabase.com/dashboard/project/qnwcwoutgarhqxlgsjzs>
- **Project Repository**: Current directory structure

### Development Resources

- **PostgreSQL Schema**: `docs/POSTGRESQL_SCHEMA_SETUP.md`
- **Development Roadmap**: `docs/DEVELOPMENT_ROADMAP.md`
- **Architecture Decisions**: `docs/ARCHITECTURE_DECISIONS.md`

## 💡 Pro Tips

### Efficiency Tips

1. **Bookmark** the documentation index (`docs/README.md`)
2. **Keep open** the database cheat sheet while coding
3. **Use** TypeScript examples from documentation
4. **Reference** real-time patterns for all interactive features

### Learning Path

1. **Start** with database guide and cheat sheet
2. **Master** the 9 React contexts integration
3. **Understand** real-time subscription patterns
4. **Apply** performance optimization techniques
5. **Develop** troubleshooting expertise

### Best Practices

1. **Always** check documentation before implementing
2. **Follow** existing patterns in the codebase
3. **Test** database operations thoroughly
4. **Monitor** performance with provided tools
5. **Document** new patterns you discover

---

**Welcome to the team! You have access to a world-class knowledge base - use it well! 🚀**

_This guide references the comprehensive 13-file documentation system created for the TCO platform. Every pattern and solution you need is documented and ready to use._
