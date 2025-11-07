# Budget App - Installation Notes

**Issue:** Windows filesystem lock preventing npm install  
**Solution:** Manual installation required

---

## 🔧 Required Dependencies

The accessibility tests require this package:

```json
"@axe-core/playwright": "^4.8.0"
```

---

## 📝 Installation Instructions

### Option 1: Add to package.json manually

1. Open `package.json`
2. Add to `devDependencies`:
   ```json
   "@axe-core/playwright": "^4.8.0",
   "@lhci/cli": "^0.12.0",
   "pa11y-ci": "^3.0.1"
   ```
3. Run: `npm install` (when filesystem lock is resolved)

### Option 2: Install when lock clears

```bash
# When able to install:
npm install -D @axe-core/playwright @lhci/cli pa11y-ci
```

### Option 3: Use the setup script

```bash
bash scripts/setup-accessibility-tests.sh
```

---

## ⚠️ Current Status

**Tests will skip axe-core checks** until the package is installed.

The following tests will still run without @axe-core/playwright:
- ✅ Keyboard navigation tests
- ✅ Screen reader support tests  
- ✅ Semantic HTML tests
- ✅ Mobile accessibility tests
- ✅ Form label tests
- ✅ Touch target size tests

The following tests require @axe-core/playwright:
- ⏸️ WCAG 2.2 AA automated scans (skipped)
- ⏸️ Color contrast automated checks (skipped)

---

## 🎯 Running Tests

### Without axe-core (basic tests only)

```bash
npx playwright test tests/accessibility.spec.ts
# Will run ~15 tests, skip ~8 axe tests
```

### With axe-core (full suite)

```bash
# First install the dependency
npm install -D @axe-core/playwright

# Then run all tests
npx playwright test tests/accessibility.spec.ts
# Will run all ~23 tests
```

---

## 🐛 Troubleshooting Windows Filesystem Lock

**Error:** `ENOTEMPTY: directory not empty, rename 'node_modules\msw'`

**Causes:**
- VSCode or another process has file handle open
- Windows Defender scanning files
- npm cache issue

**Solutions:**

1. **Close all editors and terminals:**
   ```bash
   # Close VSCode
   # Close all terminals
   # Wait 10 seconds
   # Try npm install again
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npm install -D @axe-core/playwright
   ```

3. **Delete node_modules and reinstall:**
   ```bash
   # WARNING: This will take 5-10 minutes
   rm -rf node_modules
   npm install
   ```

4. **Use Linux terminal (WSL):**
   ```bash
   # If you're in WSL, the lock might be from Windows
   # Try running from pure Linux path
   cd ~/projects/active/tanium-tco/modern-tco
   npm install -D @axe-core/playwright
   ```

---

## ✅ Workaround

**The tests are designed to work without @axe-core/playwright.**

They will:
- ✅ Skip axe-specific tests
- ✅ Run all other accessibility tests
- ✅ Provide useful coverage
- ⚠️ Print warning about missing dependency

**You can install the package later** when the filesystem lock clears, and rerun for full coverage.

---

## 📊 Test Coverage

### Without @axe-core/playwright
- ~15 tests run
- ~8 tests skipped
- Coverage: ~65%

### With @axe-core/playwright  
- ~23 tests run
- 0 tests skipped
- Coverage: 100%

---

**Recommendation:** Install the package when convenient. Tests work without it for now.

**Last Updated:** November 6, 2025

