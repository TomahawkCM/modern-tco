# Contributing to Modern Tanium TCO

Thank you for contributing to the Modern Tanium TCO Learning Management System! This guide will help you understand our development workflow and quality standards.

## 🚀 Quick Start for Contributors

### Prerequisites

- **Node.js** 18+ and npm
- **Git** 2.43+
- **Husky** v9.1.7 (installed automatically with `npm install`)
- Access to Supabase project (for database features)

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd modern-tco

# Install dependencies (automatically configures git hooks)
npm install

# Verify git hooks are configured
git config core.hooksPath  # Should output: .husky

# Start development server
npm run dev
```

## 📋 Development Workflow

### 1. Code Quality Standards

Our project enforces strict quality standards through automated git hooks:

#### Pre-commit Hook (Fast - ~2-3 seconds)

Automatically runs when you commit:
- **Lints staged files** - ESLint with auto-fix
- **Formats staged files** - Prettier with project config
- **TypeScript validation** - On staged `.ts` and `.tsx` files only

```bash
# This runs automatically on: git commit
# Manual test:
.husky/pre-commit
```

#### Pre-push Hook (Comprehensive - ~6 seconds)

Automatically runs when you push:
- **TypeScript type checking** - Full project validation (parallel)
- **ESLint validation** - Complete codebase check (parallel)
- **Note**: Prettier format check excluded for performance (already enforced by pre-commit)

```bash
# This runs automatically on: git push
# Manual test:
.husky/pre-push
```

### 2. Making Changes

#### Step-by-Step Contribution Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes:**
   ```bash
   npm run typecheck
   npm run lint
   npm run format:check
   npm run test
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"

   # Pre-commit hook will automatically:
   # - Lint and format staged files
   # - Fix common issues automatically
   # - Complete in ~2-3 seconds
   ```

5. **Push to remote:**
   ```bash
   git push origin feature/your-feature-name

   # Pre-push hook will automatically:
   # - Run TypeScript type checking
   # - Validate ESLint rules
   # - Check Prettier formatting
   # - Run in parallel (~10-20 seconds)
   ```

### 3. Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation only
style:    # Code style (formatting, semicolons, etc.)
refactor: # Code refactoring
perf:     # Performance improvements
test:     # Adding or updating tests
chore:    # Maintenance tasks

# Examples:
git commit -m "feat(assessment): add weighted scoring algorithm"
git commit -m "fix(auth): resolve session timeout issue"
git commit -m "docs(readme): update git hooks documentation"
```

## 🧪 Quality Assurance

### Automated Quality Checks

All quality checks are enforced through git hooks, but you can run them manually:

#### TypeScript Validation

```bash
# Type checking (required before push)
npm run typecheck

# Expected output: "Found 0 errors"
```

#### Code Linting

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

#### Code Formatting

```bash
# Check formatting
npm run format:check

# Auto-format all files
npm run format
```

#### Complete Quality Pipeline

```bash
# Run all quality checks (manual verification)
npm run check-all

# Parallel quality checks (same as pre-push hook)
npm run check:all-parallel
```

### Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:coverage

# Database connectivity
npm run test:db
```

## 🏗️ Architecture & Best Practices

### Project Structure

```
modern-tco/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── contexts/         # React Context providers (11+)
│   ├── content/          # MDX modules and questions
│   └── lib/              # Utility functions
├── docs/                 # Comprehensive documentation
├── .husky/               # Git hooks configuration
│   ├── pre-commit        # Fast staged-file validation
│   └── pre-push          # Comprehensive checks
└── tests/                # Test suites
```

### Coding Standards

#### TypeScript

- **Strict mode enabled** - All files must pass `tsc --noEmit`
- **No `any` types** - Use proper type definitions
- **Optional chaining** - Use `?.` for nullable properties
- **Type guards** - Implement null-safety checks

#### React

- **Hooks at top level** - Never call hooks conditionally
- **'use client' directive** - Required for client components
- **Context usage** - Follow patterns in existing providers
- **Performance** - Use `React.memo`, `useMemo`, `useCallback` appropriately

#### Styling

- **Tailwind CSS** - Use utility classes
- **shadcn/ui** - Extend existing components
- **Responsive design** - Mobile-first approach
- **Accessibility** - WCAG 2.1 AA compliance

## 🔧 Troubleshooting

### Git Hooks Issues

#### Bypassing Hooks (When Necessary)

If you absolutely need to bypass hooks (not recommended):

```bash
# Skip pre-commit hook
git commit --no-verify -m "your message"

# Skip pre-push hook
git push --no-verify
```

**⚠️ Warning**: Only bypass hooks when absolutely necessary. Code quality checks exist to prevent issues.

#### Hooks Not Running

```bash
# Verify git hooks configuration
git config core.hooksPath  # Should output: .husky

# Reconfigure if needed
git config core.hooksPath .husky

# Verify hook files are executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

#### Pre-push Hook Timing Out

The pre-push hook has been optimized to run in ~6 seconds. If it times out:

```bash
# Check what's taking long
npm run typecheck  # Should be ~4 seconds
npm run lint:check # Should be ~2 seconds

# If still slow, you can temporarily bypass
git push --no-verify

# Then fix the underlying issue before next push
```

#### Pre-commit Hook Failing

```bash
# Check what files are staged
git diff --cached --name-only

# Run lint-staged manually to see errors
npx lint-staged

# Fix issues and retry
npm run lint:fix
npm run format
git add .
git commit -m "fix: resolve linting issues"
```

#### Pre-push Hook Failing

```bash
# Run checks individually to identify issue
npm run typecheck  # TypeScript errors
npm run lint       # ESLint errors
npm run format:check  # Formatting errors

# Fix and retry
npm run typecheck && npm run lint && npm run format
git push
```

### Common Issues

#### TypeScript Errors

```bash
# Clear build cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run type checking
npm run typecheck
```

#### ESLint Errors

```bash
# Auto-fix most issues
npm run lint:fix

# Check remaining issues
npm run lint
```

#### Prettier Formatting

```bash
# Format all files
npm run format

# Verify formatting
npm run format:check
```

## 📚 Resources

### Documentation

- **Main README**: [README.md](README.md)
- **Quick Start**: [docs/QUICK_START_GUIDE.md](docs/QUICK_START_GUIDE.md)
- **Development Roadmap**: [docs/DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md)
- **Architecture**: [docs/ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🎯 Pull Request Checklist

Before submitting a pull request, ensure:

- [ ] **Code passes all automated checks** (pre-commit and pre-push hooks)
- [ ] **TypeScript compilation successful** (`npm run typecheck`)
- [ ] **No ESLint errors** (`npm run lint`)
- [ ] **Code properly formatted** (`npm run format`)
- [ ] **Tests pass** (`npm run test`)
- [ ] **Commit messages follow convention** (feat/fix/docs/etc.)
- [ ] **Documentation updated** (if applicable)
- [ ] **No console.log statements** (use proper logging)
- [ ] **Responsive design verified** (test on multiple screen sizes)
- [ ] **Accessibility tested** (keyboard navigation, screen readers)

## 🤝 Getting Help

### Communication Channels

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for questions and ideas
- **Documentation**: Check `docs/` directory for comprehensive guides

### Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear description of the issue
2. **Steps to reproduce**: Detailed steps to reproduce the bug
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: OS, Node.js version, browser (if applicable)
6. **Screenshots**: If relevant
7. **Console errors**: Any error messages from console

### Suggesting Features

When suggesting features, include:

1. **Use case**: Why this feature is needed
2. **Proposed solution**: How you envision it working
3. **Alternatives considered**: Other approaches you've thought about
4. **Additional context**: Mockups, examples, or references

## 📝 License

By contributing to Modern Tanium TCO, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing! Your efforts help make this project better for everyone.** 🚀

_For questions about the contribution process, please open an issue or discussion on GitHub._
