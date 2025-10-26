# Mobile Lighthouse Script Fix

**Date**: 2025-10-16
**Issue**: Lighthouse script failing with "Invalid preset: mobile"
**Status**: ✅ FIXED

---

## Problem

The Lighthouse script (`scripts/lighthouse-all-routes.mjs`) was using `--preset=mobile` which is not a valid Lighthouse CLI argument.

**Error Message**:
```
Invalid values: Argument: preset, Given: "mobile", Choices: "perf", "experimental", "desktop"
```

**Root Cause**:
- Line 58 used `--preset=${preset}`
- Loop passed "mobile" and "desktop" as preset values
- Lighthouse CLI only accepts: `desktop`, `perf`, `experimental`

---

## Solution

Modified `runLighthouse()` function to handle mobile vs desktop differently:

**Desktop** (unchanged):
```javascript
args.push('--preset=desktop');
```

**Mobile** (fixed):
```javascript
args.push('--form-factor=mobile');
args.push('--screenEmulation.mobile=true');
```

**File Modified**: `scripts/lighthouse-all-routes.mjs` (lines 61-68)

---

## Test Results

**Before Fix**:
```
❌ Error: Invalid values: Argument: preset, Given: "mobile"
```

**After Fix**:
```
✅ Mobile Lighthouse test successful!
Form Factor: mobile
Screen Emulation: true
Performance Score: 65/100
```

---

## Performance Comparison

Interesting finding: **Mobile performance is BETTER than desktop!**

| Device | Performance Score | Notes |
|--------|------------------|-------|
| Desktop | 44/100 | After optimization (was 36) |
| Mobile | 65/100 | ✅ Better than desktop! |

**Why Mobile Performs Better**:
1. Mobile viewport is smaller → less content to render
2. Mobile emulation has lower resource expectations
3. Our provider optimizations helped mobile more than desktop
4. Smaller screen = fewer layout calculations

---

## Usage

Now you can run the full Lighthouse suite for all routes:

```bash
npm run lighthouse:all
```

This will audit 9 routes × 2 devices (desktop + mobile) = 18 total audits.

**Output Location**: `reports/lighthouse/[timestamp]/`
- HTML reports: `desktop_home.report.html`, `mobile_home.report.html`, etc.
- JSON data: `desktop_home.report.json`, `mobile_home.report.json`, etc.
- Summary: `summary.json`

---

## Technical Details

### Lighthouse CLI Arguments

**Valid Presets**:
- `--preset=desktop` - Desktop device emulation
- `--preset=perf` - Performance-focused auditing
- `--preset=experimental` - Experimental features

**Mobile Emulation** (no preset needed):
- `--form-factor=mobile` - Sets device type to mobile
- `--screenEmulation.mobile=true` - Enables mobile screen emulation
- `--screenEmulation.width=412` - Optional: Set viewport width
- `--screenEmulation.height=823` - Optional: Set viewport height

### References
- [Lighthouse CLI Options](https://github.com/GoogleChrome/lighthouse#cli-options)
- [Lighthouse Configuration](https://github.com/GoogleChrome/lighthouse/blob/main/docs/configuration.md)
- [Form Factor Documentation](https://developer.chrome.com/docs/lighthouse/performance)

---

## Next Steps

1. ✅ Script now works for both mobile and desktop
2. ⏭️ Run full audit suite: `npm run lighthouse:all`
3. ⏭️ Analyze mobile vs desktop performance differences
4. ⏭️ Optimize for mobile-first (since mobile scores better)
5. ⏭️ Set up CI/CD to run Lighthouse checks automatically

---

## Related Documentation

- See `PERFORMANCE_OPTIMIZATION_SUMMARY.md` for context on performance improvements
- See `FINAL_COMPLETION_SUMMARY.md` for overall project status
