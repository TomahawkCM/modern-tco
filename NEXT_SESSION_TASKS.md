# Next Session - Priority Tasks

**Last Updated**: 2025-09-30
**Previous Session**: Hydration Error #418 - RESOLVED ✅

---

## Current Lighthouse Scores

```
Performance:     74/100  (Target: 90+)  → Need +16 points
Accessibility:   89/100  (Target: 95+)  → Need +6 points
Best Practices:  96/100  ✅
SEO:             63/100
```

**Production URL**: https://modern-6k09rbx6r-robert-neveus-projects.vercel.app/

---

## Priority 1: Accessibility Violations (Quick Wins)

### Issue: Missing aria-labels (6 points to target)

**8 Progress Bars** without `aria-label`:
```bash
# Find affected components
grep -r "<Progress" src/ --include="*.tsx" | grep -v "aria-label"
```

**Likely Files**:
- `src/components/ui/progress.tsx` - Base Progress component
- `src/components/SideNav.tsx` - Domain progress bars (5 visible)
- `src/components/modules/ModuleProgress.tsx` - Module progress tracking
- `src/components/dashboard/DashboardContent.tsx` - Overall progress display

**Fix Template**:
```tsx
// ❌ BEFORE
<Progress value={62} className="h-2" />

// ✅ AFTER
<Progress
  value={62}
  className="h-2"
  aria-label="Overall study progress: 62% complete"
/>
```

**2 Buttons** without `aria-label`:
```bash
# Find affected components
grep -r "<Button" src/ --include="*.tsx" | grep -v "aria-label" | head -20
```

**Common Culprits**:
- Icon-only buttons (no visible text)
- Mobile menu toggles
- Action buttons with only SVG icons

**Fix Template**:
```tsx
// ❌ BEFORE
<Button variant="ghost" size="icon">
  <Menu className="h-5 w-5" />
</Button>

// ✅ AFTER
<Button
  variant="ghost"
  size="icon"
  aria-label="Open navigation menu"
>
  <Menu className="h-5 w-5" />
</Button>
```

---

## Priority 2: Performance Optimization (16 points to target)

### Common Performance Wins

**1. Image Optimization** (Potential: +3-5 points)
```bash
# Find unoptimized images
find src/ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg"
```
- Convert to Next.js `<Image>` component
- Add `loading="lazy"` for below-the-fold images
- Use WebP format where possible

**2. Code Splitting** (Potential: +2-4 points)
```tsx
// Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSkeleton />,
});
```

**Candidates for lazy loading**:
- `ExamSimulator.tsx`
- `LabExercisePlayer.tsx`
- `InteractiveGlossary.tsx`
- Video players

**3. Bundle Analysis** (Potential: +4-6 points)
```bash
# Analyze bundle size
npm run build -- --analyze
```
- Remove unused dependencies
- Tree-shake large libraries
- Use dynamic imports for route-specific code

**4. Font Optimization** (Potential: +1-2 points)
Already preloading Inter font, but verify:
- Font is actually being used (check CSS)
- No FOUT (Flash of Unstyled Text)
- Consider `font-display: swap` in CSS

---

## Quick Commands for Next Session

### Development
```bash
# Start dev server
npm run dev

# Run type check
npm run typecheck

# Run linter
npm run lint

# Build for production
npm run build
```

### Testing
```bash
# Run Lighthouse locally
npx lighthouse http://localhost:3000 --view

# Check specific accessibility issues
npx lighthouse http://localhost:3000 \
  --only-categories=accessibility \
  --view

# Check performance only
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --view
```

### Debugging
```bash
# Find Progress components without aria-label
grep -rn "Progress" src/ --include="*.tsx" | \
  grep -v "aria-label" | \
  grep -v "ProgressContext" | \
  grep -v "// Progress"

# Find Button components without aria-label (icon buttons)
grep -rn "size=\"icon\"" src/ --include="*.tsx" | \
  grep -v "aria-label"

# List all component files with Progress
find src/ -name "*.tsx" -exec grep -l "Progress" {} \;
```

---

## Files to Review

### Accessibility Fixes
1. `src/components/ui/progress.tsx` - Base component
2. `src/components/SideNav.tsx` - Main navigation with progress bars
3. `src/components/dashboard/DashboardContent.tsx` - Dashboard progress
4. `src/components/modules/ModuleProgress.tsx` - Module tracking
5. `src/components/CyberpunkNavigation.tsx` - Mobile menu button

### Performance Analysis
1. `package.json` - Check for heavy/unused dependencies
2. `next.config.js` - Verify optimization settings
3. `src/app/layout.tsx` - Check for unnecessary imports
4. `.next/build-manifest.json` - After build, check bundle sizes

---

## Expected Results After Fixes

### Accessibility (Add aria-labels to 10 elements)
- **Current**: 89/100
- **Expected**: 95-97/100 ✅
- **Effort**: 30-60 minutes

### Performance (Optimize images + code splitting)
- **Current**: 74/100
- **Expected**: 85-92/100
- **Effort**: 2-4 hours

---

## Resources

### Documentation
- [ARIA Labels Best Practices](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Lighthouse Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)

### Internal Docs
- `HYDRATION_FIX_SUMMARY.md` - Context on recent fixes
- `.claude/CLAUDE.md` - Project architecture and agent system
- `README.md` - Project overview

---

## Notes for AI Assistant

**Context Loading Commands**:
```bash
# Read the hydration fix summary
cat HYDRATION_FIX_SUMMARY.md

# Check current Lighthouse scores
npx lighthouse https://modern-6k09rbx6r-robert-neveus-projects.vercel.app/ \
  --output=json --quiet | \
  jq '.categories | {performance: .performance.score, accessibility: .accessibility.score}'

# Find all Progress components
find src/ -name "*.tsx" -exec grep -l "Progress" {} \;
```

**Quick Start for Next Session**:
1. Read this file (`NEXT_SESSION_TASKS.md`)
2. Read `HYDRATION_FIX_SUMMARY.md` for context
3. Run Lighthouse audit to verify current state
4. Start with accessibility fixes (quick wins)
5. Move to performance optimization (more complex)

**Remember**:
- Hydration error is FIXED ✅ - Don't revert changes
- All remaining issues are legitimate (not cascading from hydration)
- Use TodoWrite tool to track progress on multiple fixes
