# Performance Benchmarks Reference

## Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | 2.5s – 4.0s | > 4.0s |
| FID (First Input Delay) | ≤ 100ms | 100ms – 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |
| INP (Interaction to Next Paint) | ≤ 200ms | 200ms – 500ms | > 500ms |
| TTFB (Time to First Byte) | ≤ 800ms | 800ms – 1800ms | > 1800ms |

## Bundle Size Budgets

| Category | Budget (gzipped) | Measurement |
|----------|-----------------|-------------|
| Initial JS | ≤ 250KB | First load, all routes |
| Per-route chunk | ≤ 100KB | Each route's specific JS |
| CSS (total) | ≤ 50KB | All stylesheets |
| Fonts | ≤ 100KB | All font files |
| Total page weight | ≤ 1MB | All resources |

## Dependency Size Limits

| Threshold | Policy |
|-----------|--------|
| < 10KB gzipped | Auto-approved |
| 10–50KB gzipped | Needs justification |
| > 50KB gzipped | Must be lazy-loaded; strong justification required |
| > 100KB gzipped | Requires alternatives analysis |

## Common Library Sizes (reference)

| Library | Size (gzipped) | Notes |
|---------|----------------|-------|
| React + ReactDOM | ~42KB | Already included |
| next (framework) | ~85KB | Already included |
| decimal.js | ~12KB | Required for financial math |
| date-fns | ~7KB (tree-shaken) | Only imported functions |
| chart.js | ~65KB | Must lazy-load |
| @tanstack/react-virtual | ~3KB | Lightweight |
| tesseract.js | ~170KB | Must lazy-load (OCR only) |
| lucide-react | ~2KB per icon | Tree-shaken |

## Lighthouse Score Targets

| Category | Target | Minimum |
|----------|--------|---------|
| Performance | ≥ 95 | ≥ 90 |
| Accessibility | ≥ 95 | ≥ 90 |
| Best Practices | ≥ 95 | ≥ 90 |
| SEO | ≥ 90 | ≥ 80 |
| PWA | ✓ | All checks pass |

## Device Test Matrix

| Device Class | Example | CPU Throttle | Network |
|-------------|---------|-------------|---------|
| Low-end mobile | Moto G Power | 4× slowdown | Slow 3G |
| Mid-range mobile | Pixel 5 | 2× slowdown | Fast 3G |
| High-end mobile | iPhone 14 Pro | None | 4G |
| Tablet | iPad Air | None | WiFi |
| Desktop | MacBook Pro | None | Cable |

## Measurement Commands

```bash
# Lighthouse CLI
npx lighthouse http://localhost:3000/budget-app \
  --throttling.cpuSlowdownMultiplier=4 \
  --output=json \
  --output-path=./lighthouse-budget.json

# Bundle analysis
ANALYZE=true npm run build

# Check specific package size
npx bundlephobia decimal.js
npx bundlephobia chart.js

# Web Vitals in code
import { onLCP, onFID, onCLS, onINP } from 'web-vitals';
onLCP(console.log);
onFID(console.log);
onCLS(console.log);
onINP(console.log);
```

## Virtual Scrolling Thresholds

| List Size | Strategy |
|-----------|----------|
| ≤ 20 items | Render all |
| 21–50 items | Render all (monitor performance) |
| 51–200 items | Virtual scroll recommended |
| 201–1000 items | Virtual scroll required |
| > 1000 items | Virtual scroll + pagination/infinite scroll |

## Image Optimization

| Format | Use Case | Quality |
|--------|----------|---------|
| WebP | Photos, complex images | 80% |
| AVIF | Photos (modern browsers) | 70% |
| SVG | Icons, illustrations | — |
| PNG | Screenshots, transparency needed | Lossless |

Responsive sizes:
```html
<Image
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```
