# Module 00 Lighthouse Runs

- **URL**: http://127.0.0.1:3001/modules/00-tanium-platform-foundation-v2
- **Preset**: Desktop (Lighthouse 12)

| Run | Performance | Accessibility | Best Practices | SEO | LCP (s) | TBT (ms) |
| --- | --- | --- | --- | --- | --- | --- |
| Baseline (`baseline.desktop.json`) | 93 | 92 | 96 | 66 | 1.69 | 0 |
| After adding `meta` export (`post-meta.desktop.json`) | 92 | 92 | 96 | 66 | 1.79 | 0 |
| Lite renderer (`lite.desktop.json`) | 95 | 92 | 96 | 66 | 1.53 | 0 |
| Lite renderer + robots meta (`lite-after-robots.desktop.json`) | 95 | 92 | 96 | 66 | 1.50 | 0 |

Notes:
- The Module 00 v2 page now uses `ModuleRendererLite`, which removes heavy analytics/session providers and dynamically loads practice/quiz components. This dropped LCP from 1.79s to ~1.5s and keeps TBT at 0ms.
- SEO remains 66 because draft routes are intentionally served with `&lt;meta name="robots" content="noindex" /&gt;`.
- Re-run `npx lighthouse ... --output-path=reports/lighthouse/module-00-v2/<label>.json` after significant changes and update this table.
