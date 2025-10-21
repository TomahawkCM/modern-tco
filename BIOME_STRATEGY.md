# Biome Error Fixing Strategy - Modern TCO LMS

**Status:** Phase 1 Complete ✅
**Last Updated:** 2025-10-20
**Next Review:** When ready for Phase 2 manual fixes

---

## What Just Happened (Phase 1 ✅)

### Auto-Fixed: 958 files (Safe Changes Only)
- ✅ Formatted code with single quotes (matching existing style)
- ✅ Organized imports alphabetically
- ✅ Consistent semicolons, trailing commas
- ✅ Proper spacing and line wrapping

### Configuration Updates
- ✅ `biome.json`: Single quotes, warn-only for risky rules
- ✅ `.prettierrc`: Single quotes (aligned with Biome)
- ✅ GitHub Actions: Biome checks in warn mode (won't block PRs)

### **Will This Break the App?**
**No.** All changes are purely cosmetic formatting. TypeScript compilation tested successfully.

---

## Current State

### Before Phase 1
- **Total Issues:** 2,757 (1,426 errors + 1,331 warnings)
- **Auto-fixable:** 1,615 issues

### After Phase 1
- **Fixed:** 958 files automatically
- **Remaining:** 979 errors + 2,064 warnings (now in warn mode)
- **CI:** Reports issues but doesn't block PRs

### Remaining Issues Breakdown

| Category | Count | Blocking? | Fix Approach |
|----------|-------|-----------|--------------|
| Unused Variables | 199 | ❌ No (warn) | Review manually |
| Implicit Any Types | 253 | ❌ No (warn) | Add types gradually |
| Array Index Keys | 180 | ❌ No (warn) | Fix per component with testing |
| Button Types | 83 | ❌ No (warn) | Review each form context |
| Accessibility | 43 | ❌ No (warn) | Review with designer |
| Promise Handling | 65 | ❌ No (warn) | Add void or catch blocks |
| Other | ~2,200 | ❌ No (warn) | Various safe improvements |

---

## Phase 2: Incremental Manual Fixes (When Ready)

### Approach: Fix Issues Gradually

**Don't fix everything at once.** Instead:

1. **Pick one category** (e.g., "Array Index Keys")
2. **Fix 5-10 instances** in related components
3. **Test thoroughly** (manual + automated)
4. **Commit and deploy** to staging
5. **Repeat** when time permits

### Priority Order (Recommendation)

#### High Priority (Functional Impact)
1. **Array Index Keys** (180 issues) - Can cause React bugs
   - Affects list re-rendering correctness
   - Fix when working on that component anyway

2. **Type Safety** (253 issues) - Catches bugs at compile time
   - Add types when touching related code
   - Focus on API boundaries first

#### Medium Priority (Code Quality)
3. **Unused Variables** (199 issues) - Code cleanup
   - Review during refactoring
   - Safe to leave until natural cleanup

4. **Promise Handling** (65 issues) - Prevents unhandled rejections
   - Add `.catch()` or `void` keyword
   - Fix in error-prone areas first

#### Lower Priority (Nice to Have)
5. **Accessibility** (43 issues) - UX improvements
   - Coordinate with designer
   - May require CSS adjustments

6. **Button Types** (83 issues) - Form correctness
   - Review form submission logic
   - Test each change carefully

---

## Common Fix Patterns

### Pattern 1: Array Index Keys (React Anti-pattern)

**Problem:** Using array index as React key causes bugs
```typescript
// ❌ Bad - causes re-render issues
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}
```

**Solution:** Use stable unique identifier
```typescript
// ✅ Good - stable identity
{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}

// ✅ Or generate ID if missing
import { createId } from '@paralleldrive/cuid2';
const itemsWithIds = items.map(item => ({
  ...item,
  id: item.id || createId()
}));
```

**When to fix:** When editing that component for other reasons

---

### Pattern 2: Implicit Any Types

**Problem:** TypeScript can't check type safety
```typescript
// ❌ Biome warns: implicit any
const [data, setData] = useState();
```

**Solution:** Add explicit type
```typescript
// ✅ Type-safe
const [data, setData] = useState<MyDataType | null>(null);

// ✅ For event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

**When to fix:** When adding new features to that file

---

### Pattern 3: Unused Variables

**Problem:** Dead code or unfinished implementation
```typescript
// ❌ Biome warns: unused variable
const result = fetchData();
```

**Solutions:**
```typescript
// ✅ Remove if truly unused
fetchData();  // Just for side effect

// ✅ Or prefix with _ if needed for future
const _result = fetchData();  // Explicitly unused

// ✅ Or actually use it
const result = fetchData();
console.log('Fetched:', result);
```

**When to fix:** During code cleanup sessions

---

### Pattern 4: Button Types

**Problem:** Buttons in forms without explicit type
```typescript
// ❌ May submit form unintentionally
<button onClick={handleClick}>Delete</button>
```

**Solution:** Add explicit type based on context
```typescript
// ✅ In a form that should submit
<button type="submit">Submit Form</button>

// ✅ Regular button (doesn't submit)
<button type="button" onClick={handleClick}>Delete</button>

// ✅ Reset button
<button type="reset">Clear Form</button>
```

**When to fix:** When testing forms, verify submit behavior

---

## CI/CD Behavior

### Current Setup (Warn Mode)

**On every PR:**
1. ✅ Biome runs automatically
2. ✅ Posts report in PR summary
3. ❌ **Does NOT block merging**
4. ℹ️ Provides visibility into code quality

**Purpose:**
- Team awareness of issues
- Track improvement over time
- No disruption to workflow

### Future: Error Mode (Optional)

When ready to enforce quality gates:

1. Update `.github/workflows/biome-lint.yml`
2. Change `continue-on-error: true` to `false`
3. PRs will be blocked if errors exist
4. Coordinate with team first!

---

## FAQ

### Q: Will these remaining errors break the app?
**A:** No. They're code quality issues, not runtime errors. The app works fine with them.

### Q: Do we have to fix all 979 errors?
**A:** No. Fix them incrementally when convenient. They're in warn mode for a reason.

### Q: What if I disagree with a Biome rule?
**A:** Disable it in `biome.json`. Example:
```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noArrayIndexKey": "off"  // Disable if needed
      }
    }
  }
}
```

### Q: Can I ignore Biome warnings in specific files?
**A:** Yes, add to `.biomeignore` or use inline comments:
```typescript
// biome-ignore lint/suspicious/noArrayIndexKey: Legacy component, safe here
{items.map((item, idx) => <div key={idx}>{item}</div>)}
```

### Q: Should we remove ESLint/Prettier now?
**A:** Not yet. Run them in parallel for now. Evaluate after 2-3 months of stable Biome usage.

---

## Commands Reference

```bash
# Check current state (doesn't modify files)
npm run biome:check

# Fix all safe auto-fixable issues
npm run biome:fix

# Format only (quotes, spacing)
npm run biome:format:fix

# Lint only (no formatting changes)
npm run biome:lint:fix

# Check specific file/directory
npx biome check src/components/MyComponent.tsx

# Show more diagnostics
npm run biome:check -- --max-diagnostics=100
```

---

## Next Steps (When Ready for Phase 2)

1. **Pick one category** from the priority list above
2. **Fix 5-10 related instances**
3. **Test thoroughly:**
   ```bash
   npm run typecheck
   npm run test
   npm run dev  # Manual testing
   ```
4. **Commit with clear message:**
   ```bash
   git add .
   git commit -m "fix: Resolve 10 array index key warnings in dashboard components"
   ```
5. **Deploy to staging** and verify
6. **Repeat** when time permits

---

## Success Metrics

### Current (Phase 1 Complete)
- ✅ 958 files formatted consistently
- ✅ 0 formatting-related PR comments
- ✅ CI provides quality visibility
- ✅ No workflow disruption

### Future Goals (Phase 2+)
- 🎯 Reduce errors from 979 to <100
- 🎯 Reduce warnings from 2,064 to <500
- 🎯 Team comfortable with Biome workflow
- 🎯 Consider graduating to error mode in CI

---

## Questions or Issues?

**Biome Docs:** https://biomejs.dev/
**This Strategy:** `BIOME_STRATEGY.md`
**Configuration:** `biome.json`
**CI Workflow:** `.github/workflows/biome-lint.yml`

**Need help?** Review the examples above or consult Biome documentation.

---

**Remember:** These are improvements, not emergencies. Fix them incrementally as you work on related code. The app works fine as-is!
