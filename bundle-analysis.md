# Bundle Analysis - Performance Optimization Targets

**Date**: October 5, 2025
**Build Output Analysis**: From `npm run build`

---

## 📊 Bundle Sizes After Optimization

### Shared Chunks (103 KB) ✅ Maintained
- `chunks/1255-18d7473ac3413ee6.js`: **45.5 kB**
- `chunks/4bd1b696-100b9d70ed4e49c1.js`: **54.2 kB**
- Other shared chunks: 3.54 kB

### ✅ OPTIMIZATION RESULTS

| Route | Size Before | Size After | First Load Before | First Load After | Savings | Status |
|-------|-------------|------------|-------------------|------------------|---------|--------|
| **/learn/query-builder** | 157 kB | **4.46 kB** | 315 kB | **116 kB** | **-199 kB** | ✅ **63% reduction** |
| **/analytics** | 111 kB | **20.7 kB** | 319 kB | **230 kB** | **-89 kB** | ✅ **28% reduction** |
| **Homepage** | 799 B | **3.26 kB** | 159 kB | **159 kB** | **0 kB** | ✅ **No regression** |

### Remaining Large Pages (Future Optimization)

| Route | Size | First Load JS | Priority | Next Step |
|-------|------|---------------|----------|-----------|
| **/study/[domain]** | 60.6 kB | **311 kB** | 🟡 MEDIUM | Split study content |
| **/beginner** | 40 kB | **272 kB** | 🟡 MEDIUM | Component optimization |
| **/modules** | 11.1 kB | **231 kB** | 🟡 MEDIUM | Context optimization |

### Medium Pages (10-20 kB)
- /practice: 14.8 kB (217 kB total)
- /daily-review: 14.3 kB (173 kB total)
- /dashboard: 15.1 kB (212 kB total)
- /search: 14.9 kB (204 kB total)
- /settings: 13.9 kB (212 kB total)

### Homepage
- Size: 799 B
- First Load JS: **159 kB**
- Priority: 🔴 CRITICAL (LCP 5.0s issue)

---

## 🎯 Optimization Strategy

### Phase 3.1: Lazy Load Heavy Components (Highest Impact)

#### 1. Monaco Editor (157 KB → Save ~150 KB)
**Route**: `/learn/query-builder`
**Current**: Loads on every page visit
**Fix**: Dynamic import with loading state
```tsx
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
});
```
**Impact**: -150 KB on all non-query-builder pages

#### 2. Analytics Charts (111 KB → Save ~100 KB)
**Route**: `/analytics`
**Current**: Chart libraries loaded immediately
**Fix**: Dynamic import chart components
```tsx
const AnalyticsCharts = dynamic(() => import('@/components/analytics'), {
  loading: () => <Skeleton />
});
```
**Impact**: -100 KB on all non-analytics pages

#### 3. Video System (Conditional Load)
**Routes**: `/videos/*`, `/study/[domain]`
**Current**: YouTube API loaded globally
**Fix**: Load only when VideoEmbed renders
```tsx
const VideoEmbed = dynamic(() => import('@/components/videos/VideoEmbed'), {
  loading: () => <VideoPlaceholder />
});
```
**Impact**: -20-30 KB on non-video pages

### Phase 3.2: Optimize Context Providers

**Issue**: 11+ React contexts loaded on every page

**Strategy**: Route-level context wrapping
- Move heavy contexts (Analytics, Practice, Exam) to route-specific layouts
- Keep only essential contexts (Auth, Database, Settings) in root layout
- Use client-side context initialization where possible

**Impact**: -30-40 KB on initial load

### Phase 3.3: Homepage LCP Optimization

**Current LCP**: 5.0s
**Target**: <2.5s

**Optimizations**:
1. **Preload critical resources**:
   ```tsx
   <link rel="preload" as="script" href="/_next/static/chunks/main.js" />
   <link rel="preload" as="image" href="/tco-logo.png" />
   ```

2. **Optimize hero image**:
   ```tsx
   <Image
     src="/hero.png"
     priority
     placeholder="blur"
     sizes="100vw"
   />
   ```

3. **Defer non-critical scripts**:
   - PostHog analytics
   - Third-party integrations

**Impact**: LCP 5.0s → 2.0-2.5s

### Phase 3.4: Reduce TBT (Total Blocking Time)

**Current TBT**: 860ms
**Target**: <200ms

**Optimizations**:
1. **Code splitting**: Break large chunks
2. **Memoization**: Expensive calculations in contexts
3. **Virtual scrolling**: Long lists in study content
4. **Web Workers**: Heavy computations off main thread

**Impact**: TBT 860ms → 150-180ms

---

## 📈 Expected Results

### Before Optimization (October 4, 2025)
```
Performance:      56/100 (homepage)
LCP:              5.0s (Poor)
TBT:              860ms (Poor)
TTI:              5.1s (Poor)
Bundle Size:      315 kB (largest pages)
```

### After Lazy Loading (October 5, 2025)
```
Performance:      TBD (testing in progress)
Bundle Size:      116 kB (query-builder) ✅ -63%
                  230 kB (analytics) ✅ -28%
                  159 kB (homepage) ✅ maintained
Total Savings:    ~288 KB across optimized pages
```

### Target After All Optimizations
```
Performance:      90/100 (homepage) 🎯
LCP:              2.2s (Good) 🎯
TBT:              170ms (Good) 🎯
TTI:              3.0s (Good) 🎯
```

### Improvement Targets
- Performance: +34 points (56 → 90)
- LCP: -2.8s (5.0s → 2.2s)
- TBT: -690ms (860ms → 170ms)
- Bundle Size: -135 KB (315 KB → 180 KB)

---

## 🛠️ Implementation Order

1. **Lazy load Monaco Editor** (30 min) - Biggest impact
2. **Lazy load Analytics charts** (30 min) - Second biggest impact
3. **Optimize homepage LCP** (1 hour) - Critical for first impression
4. **Route-level context optimization** (2 hours) - Reduce initial load
5. **Code splitting** (2 hours) - Break large chunks
6. **TBT optimization** (2 hours) - Memoization + virtual scrolling
7. **Final validation** (1 hour) - Lighthouse testing

**Total Estimated Time**: 9 hours
**Expected Production Readiness**: 88/100 → 95/100

---

## 🎯 Success Criteria

- [ ] Performance ≥ 90/100 on homepage
- [ ] LCP < 2.5s on all pages
- [ ] TBT < 200ms on all pages
- [ ] TTI < 3.8s on all pages
- [ ] Largest bundle < 200 KB
- [ ] Zero TypeScript errors
- [ ] Zero regressions on accessibility/CLS
