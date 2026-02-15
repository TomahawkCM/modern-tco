# Budget App Offline Version — Claude Code Upgrade Plan

**Stack**: Next.js 16 + React 19 + TypeScript 5.9 + shadcn/ui + Tailwind CSS
**Storage**: IndexedDB (Dexie.js) + localStorage — all data stays on device
**Target**: iOS Safari PWA, Android Chrome PWA, iPad/Android tablets, desktop browsers
**Scope**: UI/UX overhaul for cross-platform polish + competitive feature gaps (no cloud features)

---

## How to Use This File

This is a single-file execution plan for Claude Code CLI. It covers TWO objectives:

1. **UI/UX Cross-Platform Overhaul** — Make every screen feel native-quality on phones, tablets, and desktops
2. **Competitive Feature Upgrades** — Add the 25 features identified in competitive gap analysis that work in offline/local mode

Run with: `claude --file OFFLINE_VERSION_UPGRADE_PLAN.md`

**⚠️ GLOBAL SUPPORT REQUIREMENT — APPLIES TO EVERY FEATURE IN THIS DOCUMENT**

This app supports **114 locales** and **160+ currencies**. Every feature, every component, every label, every calculation must work globally. This is not a Canadian app or a North American app — it is a global product.

**Non-negotiable rules for every feature**:

| Rule | Detail |
|------|--------|
| **All user-facing strings** | Must go through i18n translation system. Zero hardcoded English. |
| **All currency values** | Must use `Intl.NumberFormat` with user's locale and selected currency. Never hardcode `$` or assume USD/CAD. |
| **All date formatting** | Must use `Intl.DateTimeFormat` with user's locale. Never hardcode MM/DD/YYYY. |
| **Number formatting** | Respect locale decimal separators (`,` vs `.`) and thousands separators. |
| **Currency inputs** | Accept user's locale format. `1.234,56` (German) and `1,234.56` (US) must both work. |
| **Multi-currency accounts** | Users may have accounts in different currencies. Aggregations (net worth, safe-to-spend) must convert to base currency using exchange rates. |
| **RTL layout** | CSS logical properties only (`margin-inline-start` not `margin-left`). All layouts must mirror correctly for Arabic, Hebrew, etc. |
| **Category defaults** | Pre-populated categories must be localized per locale, not English-only. |
| **Mortgage/loan terms** | Payment frequencies vary by country (monthly, biweekly, fortnightly, weekly). Rate types vary (fixed, variable, tracker). Don't assume North American norms. |
| **Real estate** | Properties can be in any country, any currency. Property tax schedules vary globally. |
| **Expense splitting** | Settlement methods vary by country (Interac in Canada, Venmo in US, PayPal globally, bank transfer in EU). |
| **Budget periods** | Some cultures budget weekly, not monthly. Support configurable budget periods. |
| **Seniors mode** | Must work across all locales — larger text in any script (Latin, CJK, Arabic, Devanagari, etc.) |

**Currency conversion architecture**:
```typescript
// Every aggregation that combines multiple currencies must use this pattern:
function toBaseCurrency(amount: number, fromCurrency: string, baseCurrency: string, rates: ExchangeRates): number {
  if (fromCurrency === baseCurrency) return amount;
  const rate = rates[`${fromCurrency}_${baseCurrency}`];
  return amount * rate;
}

// Display: always show in user's chosen display currency with locale formatting
function formatCurrency(amount: number, locale: string, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
```

**Build rule**: Every component is designed for 375px phone screen FIRST, then expanded to tablet and desktop. Not the reverse. Test on iPhone SE viewport before anything else.

---

## Current App Inventory (What Already Exists)

| Module | Status | Notes |
|--------|--------|-------|
| Transaction entry (manual) | ✅ Built | Needs mobile touch optimization |
| CSV import (71+ Canadian banks) | ✅ Built | 3,462 LOC parsers |
| OCR receipt scanning (Tesseract.js) | ✅ Built | Camera UI needs mobile polish |
| AI categorization (TF.js local) | ✅ Built | 902 LOC categorizer |
| Reports & Analytics | ✅ Built | 2,445 LOC analytics engine |
| Loans / Investments / Retirement | ✅ Built | Needs responsive layouts |
| Financial calculators | ✅ Built | Needs touch-friendly inputs |
| Subscription tracking | ✅ Built | 209 LOC recurring-detector |
| Budget methodology (4 types) | ✅ Built | Missing rollover, needs UX polish |
| Multi-currency (160+) | ✅ Built | Needs travel mode UX |
| i18n (114 locales) | ✅ Built | RTL support needs CSS audit |
| Seniors mode | ✅ Built | 8KB SeniorsModeContext, needs expansion |
| Dark mode | ✅ Built | Needs systematic color token audit |
| Sankey diagrams | ✅ Built | Spending flow visualization |
| Health score | ✅ Built | 666 LOC, needs dashboard integration |
| AI chatbot context | ✅ Built | ~13KB ChatbotContext |
| Weekly insights | ✅ Built | 706 LOC, not surfaced in UI |
| Overspending detector | ✅ Built | 159 LOC, not surfaced in UI |
| LSTM predictive spending | ✅ Built | 478 LOC, needs UI layer |
| Trend forecasting | ✅ Built | 227 LOC, needs chart UI |

**Key insight**: Many powerful features already exist in `src/lib/` but aren't properly surfaced in the UI. The upgrade is 60% UI/UX work, 40% new feature logic.

---

# PART 1: UI/UX CROSS-PLATFORM OVERHAUL

## 1.1 Design System Audit & Token System

**Goal**: Establish consistent design tokens that work across all breakpoints and both color schemes.

**Create/Update**: `src/styles/design-tokens.css` (or integrate into Tailwind config)

### Spacing System (8px Grid)

All spacing must use multiples of 8. Audit entire codebase and replace arbitrary values.

```css
:root {
  --space-1: 4px;    /* Half-unit (icon gaps only) */
  --space-2: 8px;    /* Tight (within buttons, small gaps) */
  --space-3: 12px;   /* Compact (badge padding) */
  --space-4: 16px;   /* Standard (between elements) */
  --space-6: 24px;   /* Comfortable (card padding) */
  --space-8: 32px;   /* Section spacing */
  --space-12: 48px;  /* Large section breaks */
  --space-16: 64px;  /* Major layout divisions */
}
```

### Touch Target Minimums

```css
:root {
  --touch-min: 44px;           /* Minimum tappable area */
  --touch-comfortable: 48px;   /* Recommended */
  --touch-seniors: 56px;       /* Seniors mode */
  --touch-fab: 56px;           /* Floating action button */
}

/* Apply to all interactive elements */
button, a, [role="button"], input[type="checkbox"], input[type="radio"],
.clickable, [data-clickable] {
  min-height: var(--touch-min);
  min-width: var(--touch-min);
}

/* Seniors mode override */
[data-seniors-mode="true"] button,
[data-seniors-mode="true"] a,
[data-seniors-mode="true"] [role="button"] {
  min-height: var(--touch-seniors);
  min-width: var(--touch-seniors);
}
```

### Color Tokens (Semantic)

Audit current colors and replace with semantic tokens. Financial values MUST use consistent semantic colors.

```css
:root {
  /* Financial semantic colors */
  --color-income: #0099E6;
  --color-expense: #E6005E;
  --color-savings: #00CC62;
  --color-warning: #D97706;
  --color-danger: #DC2626;
  --color-accent: #0D9488;      /* Teal — primary action color */

  /* Surface colors — light mode */
  --color-bg: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-surface-hover: #F8F9FA;
  --color-border: #DEE2E6;
  --color-text-primary: #212529;
  --color-text-secondary: #868E96;
  --color-text-disabled: #ADB5BD;
}

.dark {
  --color-income: #1AB5FF;
  --color-expense: #FF1A7A;
  --color-savings: #1AFF88;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-accent: #14B8A6;

  --color-bg: #1A1B1E;
  --color-surface: #25262B;
  --color-surface-hover: #2C2E33;
  --color-border: #373A40;
  --color-text-primary: #C1C2C5;
  --color-text-secondary: #909296;
  --color-text-disabled: #5C5F66;
}
```

### Typography Scale

```css
:root {
  --font-body: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', monospace;

  --text-xs: 0.75rem;    /* 12px — use sparingly */
  --text-sm: 0.875rem;   /* 14px — secondary info */
  --text-base: 1rem;     /* 16px — body text minimum */
  --text-lg: 1.125rem;   /* 18px — emphasized body */
  --text-xl: 1.25rem;    /* 20px — card titles */
  --text-2xl: 1.5rem;    /* 24px — section headers */
  --text-3xl: 2rem;      /* 32px — page titles */
  --text-4xl: 2.5rem;    /* 40px — hero numbers (safe-to-spend) */
}

/* Financial values ALWAYS use monospace font */
.financial-value, [data-financial] {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
```

### Animation Tokens

```css
:root {
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-emphasized: 300ms;
  --duration-dramatic: 500ms;

  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1.0);
  --ease-in: cubic-bezier(0.4, 0.0, 1.0, 1.0);
  --ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1.0);
}

/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Tailwind Config Additions

```typescript
// tailwind.config.ts — extend theme
export default {
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '576px',
        'md': '768px',
        'lg': '992px',
        'xl': '1200px',
        '2xl': '1440px',
      },
      spacing: {
        // Add any missing 8px-grid values
        '18': '4.5rem',  // 72px (icon sidebar width)
      },
      minHeight: {
        'touch': '44px',
        'touch-comfortable': '48px',
        'touch-seniors': '56px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
}
```

---

## 1.2 Responsive Layout System

### Breakpoint Behavior

| Breakpoint | Layout | Navigation | Content |
|------------|--------|-----------|---------|
| xs–sm (320–575px) | Single column | Bottom tab bar (5 tabs) | Full-width stacked cards |
| md (768px+) | Two column | Collapsible icon sidebar | 2-column widget grid |
| lg (992px+) | Two column | Full sidebar (icons + labels) | 2-column with wider content |
| xl (1200px+) | Three column | Full sidebar + optional detail panel | 3-column widget grid |

### Mobile Layout (xs–sm): Phone

```
┌──────────────────────────┐
│ ← Back    Page Title   ⋮ │  ← 44px compact header
│──────────────────────────│
│                          │
│  ┌────────────────────┐  │
│  │  Safe-to-Spend     │  │  ← Hero card (full width)
│  │  $1,247.00         │  │     Tap to expand details
│  │  ████████░░░ 62%   │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │  ← Scrollable content area
│  │ 🛒 Groceries       │  │
│  │ $180/$400     45%  │  │
│  ├────────────────────┤  │
│  │ 🍽️ Dining          │  │
│  │ $95/$200      48%  │  │
│  └────────────────────┘  │
│                          │
│            (+)           │  ← FAB: 56px, bottom-right
│──────────────────────────│
│ 🏠  📊  💰  📋  ⋯     │  ← Bottom tabs (fixed)
└──────────────────────────┘
```

**Bottom Tab Bar** (5 visible, overflow in "More"):
1. 🏠 Dashboard
2. 📊 Budget
3. 💰 Accounts
4. 📋 Transactions
5. ⋯ More (Reports, Goals, Calculators, Import, AI, Settings)

**Implementation** (shadcn/ui + Tailwind):

```tsx
// components/layout/BottomTabBar.tsx
'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, PieChart, Wallet, List, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/budget-app', icon: Home, label: 'Home' },
  { href: '/budget-app/budget', icon: PieChart, label: 'Budget' },
  { href: '/budget-app/accounts', icon: Wallet, label: 'Accounts' },
  { href: '/budget-app/transactions', icon: List, label: 'Activity' },
  { href: '/budget-app/more', icon: MoreHorizontal, label: 'More' },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5',
                'text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Rules**:
- Bottom tabs ONLY visible below `md` breakpoint (768px)
- Main content area needs `pb-16` on mobile to clear the tab bar
- Active tab: bold icon + accent color text
- Maintain scroll position when switching tabs (don't remount pages)

### Tablet Layout (md–lg): iPad & Android Tablets

```
┌───────────────────────────────────────────────────┐
│  Logo    🔒 Privacy    🔍 Search         👤       │
│───────────────────────────────────────────────────│
│         │                                         │
│ 🏠      │  ┌──────────┐  ┌──────────┐           │
│ 📊      │  │Safe-to-  │  │Bills Due │           │
│ 💰      │  │Spend     │  │This Week │           │
│ 📋      │  │$1,247    │  │$430      │           │
│ 📈      │  └──────────┘  └──────────┘           │
│ 🎯      │                                        │
│ 🔄      │  ┌──────────────────────────┐         │
│ 📥      │  │ Recent Transactions      │         │
│         │  │ Starbucks     -$5.40     │         │
│ ──────  │  │ Metro         -$87.32    │         │
│ 🤖      │  │ Payroll     +$2,450.00  │         │
│ ⚙️      │  └──────────────────────────┘         │
│         │                                        │
└─────────┴────────────────────────────────────────┘
```

- Sidebar: 72px wide, icons only, expandable on hover/tap
- Content: 2-column widget grid
- No bottom tab bar
- Bottom sheets → slide-in side panels for transaction details

### Desktop Layout (lg+)

```
┌──────────────────────────────────────────────────────────────────┐
│  Logo        🔒 Privacy    🔍 Search (Cmd+K)          👤 User   │
│──────────┬───────────────────────────────────────────────────────│
│          │                                                       │
│ Sidebar  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ (240px)  │  │Safe-to-  │ │Bills Due │ │Health    │             │
│          │  │Spend     │ │This Week │ │Score     │             │
│ Dashboard│  └──────────┘ └──────────┘ └──────────┘             │
│ Accounts │                                                       │
│ Transact │  ┌────────────────────────────────────────────┐      │
│ Budget   │  │ Recent Transactions (sortable table)        │      │
│ Reports  │  │ Inline edit, batch select, context menu     │      │
│ Goals    │  └────────────────────────────────────────────┘      │
│ Subscript│                                                       │
│ Calculat │  ┌──────────────┐ ┌─────────────────────┐           │
│ Import   │  │Spending by   │ │Monthly Trend        │           │
│          │  │Category      │ │(Area chart)         │           │
│ ──────── │  └──────────────┘ └─────────────────────┘           │
│ AI Coach │                                                       │
│ Settings │                                                       │
└──────────┴───────────────────────────────────────────────────────┘
```

- Sidebar: 240px, full icons + labels, collapsible to 72px with `[` key
- Content: 2–3 column widget grid (3 at xl/1200px+)
- Transaction table: sortable columns, inline edit, right-click context menu
- Max content width: 1440px, centered on ultra-wide screens

### AppShell Layout Component

```tsx
// app/budget-app/layout.tsx
export default function BudgetAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — hidden on mobile, icon-only on md, full on lg */}
      <aside className="hidden md:flex md:w-[72px] lg:w-60 flex-col border-r bg-background transition-all duration-200">
        <SidebarNav />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <TopBar />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Bottom tabs — mobile only */}
      <BottomTabBar />

      {/* FAB — mobile only */}
      <FloatingActionButton />
    </div>
  );
}
```

---

## 1.3 Safe Area & PWA Handling

### Viewport Meta Tag

```html
<!-- app/layout.tsx or head -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Budget">
<meta name="theme-color" content="#14B8A6" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#0D9488" media="(prefers-color-scheme: light)">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png">
```

### Safe Area CSS

```css
/* Global safe area handling */
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
}

/* Top bar clears notch/Dynamic Island */
.app-header {
  padding-top: calc(var(--safe-top) + 8px);
}

/* Bottom tab bar clears home indicator */
.bottom-tab-bar {
  padding-bottom: calc(var(--safe-bottom) + 4px);
}

/* FAB stays above bottom tab bar */
.fab-button {
  bottom: calc(var(--safe-bottom) + 72px); /* tab bar height + safe area */
  right: 16px;
}

/* Content area clears both */
.main-content {
  padding-left: var(--safe-left);
  padding-right: var(--safe-right);
}
```

### PWA Manifest

**Create/Update**: `public/manifest.json`

```json
{
  "name": "Budget App — Privacy-First Finance",
  "short_name": "Budget",
  "description": "Track spending, scan receipts, and manage budgets — all data stays on your device.",
  "start_url": "/budget-app",
  "scope": "/budget-app",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#1A1B1E",
  "theme_color": "#14B8A6",
  "categories": ["finance", "productivity"],
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/dashboard-mobile.png", "sizes": "375x812", "type": "image/png", "form_factor": "narrow" },
    { "src": "/screenshots/dashboard-desktop.png", "sizes": "1280x800", "type": "image/png", "form_factor": "wide" }
  ]
}
```

### iOS Install Banner

Since iOS has NO automatic install prompt, create a custom educational banner:

```tsx
// components/shared/IOSInstallBanner.tsx
'use client';
import { useState, useEffect } from 'react';
import { Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function IOSInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = localStorage.getItem('ios-install-dismissed');
    const sessions = parseInt(localStorage.getItem('session-count') || '0', 10);

    // Show after 2+ sessions, not already installed, not dismissed recently
    if (isIOS && !isStandalone && sessions >= 2 && !dismissed) {
      setShow(true);
    }

    // Increment session count
    localStorage.setItem('session-count', String(sessions + 1));
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 z-40 bg-card border rounded-xl p-4 shadow-lg animate-in slide-in-from-bottom-4">
      <button onClick={() => { setShow(false); localStorage.setItem('ios-install-dismissed', Date.now().toString()); }}
        className="absolute top-2 right-2 p-1">
        <X size={16} />
      </button>
      <p className="text-sm font-medium mb-1">Install Budget App</p>
      <p className="text-xs text-muted-foreground">
        Tap <Share size={14} className="inline mx-0.5" /> then <strong>"Add to Home Screen"</strong> for
        the full app experience with faster loading.
      </p>
    </div>
  );
}
```

### Android Install Prompt

```tsx
// components/shared/AndroidInstallPrompt.tsx
'use client';
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

let deferredPrompt: any = null;

export function AndroidInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      // Show AFTER user has created their first budget, not on first visit
      const hasData = localStorage.getItem('budget-has-data');
      if (hasData) setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    deferredPrompt = null;
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 z-40 bg-card border rounded-xl p-4 shadow-lg md:hidden animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3">
        <Download size={20} className="text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Add Budget App to home screen</p>
          <p className="text-xs text-muted-foreground">Quick access, works offline</p>
        </div>
        <Button size="sm" onClick={install}>Install</Button>
      </div>
    </div>
  );
}
```

### Service Worker (Cache App Shell)

```typescript
// public/sw.js
const CACHE_NAME = 'budget-app-v1';
const SHELL_ASSETS = [
  '/budget-app',
  '/budget-app/budget',
  '/budget-app/transactions',
  '/budget-app/accounts',
  // Add critical CSS, JS, font files
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Cache-first for app shell, network-first for API/data
  if (SHELL_ASSETS.some(url => event.request.url.includes(url))) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
});
```

### iOS State Preservation

```tsx
// hooks/useIOSStatePreservation.ts
'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useIOSStatePreservation() {
  const pathname = usePathname();

  useEffect(() => {
    // Save state when app goes to background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sessionStorage.setItem('app-state', JSON.stringify({
          route: pathname,
          scrollY: window.scrollY,
          timestamp: Date.now(),
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pathname]);

  // On mount, restore state if recent (within 1 hour)
  useEffect(() => {
    const saved = sessionStorage.getItem('app-state');
    if (saved) {
      const state = JSON.parse(saved);
      if (Date.now() - state.timestamp < 3600000) {
        window.scrollTo(0, state.scrollY);
      }
      sessionStorage.removeItem('app-state');
    }
  }, []);
}
```

---

## 1.4 Component Patterns (shadcn/ui + Tailwind)

### Transaction Row — Responsive

```tsx
// components/transactions/TransactionRow.tsx
interface TransactionRowProps {
  txn: Transaction;
  onSwipeRight?: () => void;  // Approve
  onSwipeLeft?: () => void;   // Flag
  onLongPress?: () => void;   // Context menu
}

export function TransactionRow({ txn, ...handlers }: TransactionRowProps) {
  return (
    <>
      {/* Mobile: Compact two-line row */}
      <div className="flex items-center gap-3 px-4 py-3 min-h-[48px] md:hidden
                      hover:bg-muted/50 active:bg-muted transition-colors">
        <span className="text-xl">{txn.category?.emoji || '💳'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{txn.payee}</p>
          <p className="text-xs text-muted-foreground">
            {txn.category?.name} · {formatRelativeDate(txn.date)}
          </p>
        </div>
        <span className={cn(
          'text-sm font-mono font-medium tabular-nums',
          txn.amount >= 0 ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'
        )}>
          {formatCurrency(txn.amount)}
        </span>
      </div>

      {/* Desktop: Full table row — rendered by parent table */}
      {/* See TransactionTable component */}
    </>
  );
}
```

### Bottom Sheet (Mobile Detail Views)

Replace full-page modals with bottom sheets on mobile:

```tsx
// components/shared/BottomSheet.tsx
'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={cn(
          isMobile && 'rounded-t-2xl max-h-[85vh]',
          !isMobile && 'w-[400px]'
        )}
      >
        {/* Drag handle for mobile */}
        {isMobile && (
          <div className="flex justify-center pt-2 pb-4">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        )}
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
```

### Floating Action Button

```tsx
// components/shared/FloatingActionButton.tsx
'use client';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingActionButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        'fixed z-40 rounded-full shadow-lg',
        'w-14 h-14',                          // 56px
        'md:hidden',                           // Mobile only
        'bg-primary hover:bg-primary/90',
        'active:scale-95 transition-transform',
      )}
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
        right: '16px',
      }}
      aria-label="Add transaction"
    >
      <Plus size={24} />
    </Button>
  );
}
```

### Empty States

Every screen needs a designed empty state:

```tsx
// components/shared/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-8 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[320px]">{description}</p>
      <div className="flex gap-3 mt-2">
        {action && <Button onClick={action.onClick}>{action.label}</Button>}
        {secondaryAction && <Button variant="outline" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>}
      </div>
    </div>
  );
}
```

**Required empty states** — create one for each:
- Dashboard (no data) → "Set up your first budget to start tracking"
- Transactions (none) → "Add your first transaction or import from CSV"
- Budget (none set) → "Choose a budgeting method to get started"
- Reports (< 7 days data) → "Keep tracking for a week to unlock reports"
- Goals (none) → "What are you saving for?"
- Subscriptions (none) → "Import transactions to auto-detect subscriptions"
- Search (no results) → "No matches. Try different keywords."

### Loading Skeletons (Not Spinners)

```tsx
// components/shared/Skeleton.tsx — extend shadcn skeleton
export function TransactionListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-3 w-[30%]" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Safe-to-spend card skeleton */}
      <Skeleton className="h-40 w-full rounded-xl" />
      {/* Widget grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      {/* Transaction list skeleton */}
      <TransactionListSkeleton />
    </div>
  );
}
```

**Rule**: NEVER use a spinner. Every data-loading view gets a skeleton that matches the final layout shape.

### Privacy Blur

```tsx
// components/shared/PrivacyBlur.tsx
'use client';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { cn } from '@/lib/utils';

export function FinancialValue({ amount, className, ...props }: {
  amount: number;
  className?: string;
}) {
  const { privacyMode } = usePrivacy();

  return (
    <span
      className={cn(
        'font-mono tabular-nums',
        amount >= 0 ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]',
        privacyMode && 'blur-md hover:blur-none active:blur-none select-none transition-[filter] duration-200',
        className,
      )}
      {...props}
    >
      {formatCurrency(amount)}
    </span>
  );
}
```

---

## 1.5 Keyboard Shortcuts (Desktop)

```typescript
// hooks/useKeyboardShortcuts.ts
const SHORTCUTS: Record<string, { keys: string; description: string; action: () => void }> = {
  'search':     { keys: 'mod+k', description: 'Open search', action: openSpotlight },
  'privacy':    { keys: 'mod+shift+p', description: 'Toggle privacy mode', action: togglePrivacy },
  'newTxn':     { keys: 'mod+n', description: 'New transaction', action: openNewTxn },
  'sidebar':    { keys: '[', description: 'Toggle sidebar', action: toggleSidebar },
  'dashboard':  { keys: 'g d', description: 'Go to Dashboard', action: () => navigate('/budget-app') },
  'budget':     { keys: 'g b', description: 'Go to Budget', action: () => navigate('/budget-app/budget') },
  'txns':       { keys: 'g t', description: 'Go to Transactions', action: () => navigate('/budget-app/transactions') },
  'settings':   { keys: 'g s', description: 'Go to Settings', action: () => navigate('/budget-app/settings') },
  'help':       { keys: '?', description: 'Show shortcuts', action: showShortcutModal },
};
```

---

## 1.6 Micro-Interactions

| Interaction | CSS/JS | Duration | Notes |
|-------------|--------|----------|-------|
| Page enter | `animate-in fade-in slide-in-from-bottom-4` | 200ms | Tailwind animate plugin |
| Button press | `active:scale-[0.97]` | 100ms | CSS transition |
| Card hover | `hover:shadow-md hover:border-primary/20` | 200ms | Desktop only |
| Toggle switch | Radix Switch + `transition-transform` | 200ms | Built into shadcn |
| Number change | `tabular-nums` + `transition-all` | 300ms | For safe-to-spend counter |
| Delete action | `animate-out slide-out-to-left` + height collapse | 200ms | With 5s undo toast |
| Milestone | canvas-confetti burst | 2000ms | Goal reached, debt paid |
| Skeleton pulse | `animate-pulse` | 1500ms loop | Built into shadcn Skeleton |
| Error shake | `animate-shake` (custom) | 300ms | Form validation |
| Privacy blur on/off | `blur-md` transition | 200ms | `transition-[filter]` |

Add custom Tailwind animation for shake:

```typescript
// tailwind.config.ts
keyframes: {
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(-4px)' },
    '75%': { transform: 'translateX(4px)' },
  },
},
animation: {
  shake: 'shake 0.3s ease-in-out',
},
```

**Rule**: All animations respect `prefers-reduced-motion: reduce`. Use Tailwind's `motion-reduce:` prefix or the `@media` query from Section 1.1.

---

## 1.7 Dark Mode Refinement

Dark mode is the PRIMARY theme. Audit all components for:

1. **Card depth**: In dark mode, use subtle border + slight glow on hover instead of shadow
2. **Income/Expense colors**: Must pass WCAG AA contrast on dark background (see color tokens above)
3. **Charts**: All chart colors must be legible in both modes. Use opacity variants, not entirely different palettes.
4. **Images/Icons**: Ensure SVG icons use `currentColor`. No hardcoded colors.
5. **Form inputs**: Dark input backgrounds should be slightly lighter than card backgrounds (subtle depth)

```css
/* Dark mode card glow effect */
.dark .card-interactive:hover {
  box-shadow: 0 0 20px rgba(20, 184, 166, 0.08);
  border-color: rgba(20, 184, 166, 0.2);
}

/* Dark mode elevated surface (glassmorphism) */
.dark .glass-surface {
  background: rgba(37, 38, 43, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
```

---

## 1.8 Accessibility Checklist (Every Component)

| Requirement | Implementation |
|-------------|---------------|
| Touch targets | 44px minimum all interactive elements |
| Focus ring | `ring-2 ring-primary ring-offset-2` on focus-visible |
| Skip to content | Hidden link at top of page, visible on focus |
| Screen reader | `aria-label` on all icon-only buttons |
| Live regions | `aria-live="polite"` on safe-to-spend value, budget remaining |
| Color blind | Never use color alone — always pair with icon/label/pattern |
| Form labels | Every input has visible `<label>` — no placeholder-only inputs |
| Error messages | `aria-describedby` linking input to error text |
| Chart alternatives | Every chart has a `<table>` fallback with `sr-only` class |
| Currency values | `aria-label` with spoken amount ("negative 87 dollars 32 cents") |
| Keyboard nav | All interactive elements reachable via Tab, Escape closes modals |
| Reduced motion | `motion-reduce:` prefix on all animations |
| RTL support | Use `start`/`end` instead of `left`/`right` in Tailwind (`ms-4` not `ml-4`) |
| Zoom reflow | Layouts reflow at 200% zoom without horizontal scroll |
| Font scaling | Respect browser font size settings — use `rem` not `px` for text |

---

## 1.9 Performance Targets

| Metric | Target | How to Measure |
|--------|--------|---------------|
| First Contentful Paint | < 1.5s on 4G mobile | Lighthouse |
| Largest Contentful Paint | < 2.5s on 4G mobile | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Time to Interactive | < 3.0s on 4G mobile | Lighthouse |
| Lighthouse Performance | ≥ 90 (mobile) | Lighthouse mobile preset |
| Lighthouse Accessibility | ≥ 95 | Lighthouse |
| Lighthouse PWA | 100 | Lighthouse |
| JS bundle (initial) | < 200KB gzipped | Next.js build output |
| 100K transactions | Smooth 60fps scroll | Virtual scroll test |
| Route transitions | < 100ms perceived | Chrome Performance panel |

**Code splitting**:
- Dynamic import all heavy modules: `const ReceiptScanner = dynamic(() => import(...), { ssr: false })`
- Tesseract.js, TF.js, chart libraries: load on demand only
- Fonts: `font-display: swap` to prevent FOIT

---

## 1.10 Cross-Platform Testing Matrix

| Device | Priority | Notes |
|--------|----------|-------|
| iPhone 15/16 (Safari PWA) | 🔴 Critical | Primary mobile target |
| iPhone SE 3 (Safari PWA) | 🔴 Critical | Minimum 375px viewport |
| iPad Air (Safari) | 🟡 High | Tablet layout + Split View |
| Samsung Galaxy S24 (Chrome PWA) | 🔴 Critical | Primary Android |
| Galaxy Tab S9 (Chrome) | 🟡 High | Android tablet |
| Chrome (macOS) | 🔴 Critical | Primary desktop |
| Safari (macOS) | 🟡 High | WebKit differences |
| Chrome (Windows) | 🔴 Critical | Most common desktop |
| Edge (Windows) | 🟡 High | Corporate users |
| Firefox (any) | 🟢 Medium | Gecko rendering |

---

# PART 2: COMPETITIVE FEATURE UPGRADES

These are the 25 features from competitive gap analysis that work in offline/local mode (no cloud required).

---

## 2.1 Budget Rollover

**Gap**: YNAB's most-loved feature. Zero-based and envelope methods feel incomplete without it.

**Implementation**:
- Per-category toggle: rollover ON/OFF
- Rollover modes: `same_category` | `savings_pool` | `expire`
- Sinking fund mode: accumulate across months toward a target
- Month-end processing: auto-calculate rollovers when new month begins
- UI: Show "includes $X rollover" on category budget bars

```typescript
interface BudgetCategory {
  id: string;
  name: string;
  emoji: string;
  budgeted: number;
  rollover: {
    enabled: boolean;
    mode: 'same_category' | 'savings_pool' | 'expire';
    accumulated: number;  // Running rollover balance
  };
  sinkingFund?: {
    targetAmount: number;
    targetDate: string;  // ISO date
  };
}
```

**UI**: Budget page category row shows `$400 budget + $35 rollover = $435 available` with a subtle secondary text indicator.

---

## 2.2 Event / Project Budgets

**Gap**: No competitor handles "I'm planning a wedding / vacation / renovation" as a budgeted project.

**Implementation**:
- Separate from monthly budget — has its own start/end dates and total budget
- Categories within the event (venue, food, travel, decorations)
- Transactions can be tagged to an event
- Progress tracking: spent vs. budget with timeline

```typescript
interface EventBudget {
  id: string;
  name: string;
  emoji: string;
  totalBudget: number;
  startDate: string;
  endDate: string;
  categories: { name: string; emoji: string; budgeted: number; spent: number }[];
  transactionIds: string[];
}
```

**UI**: Card on dashboard showing event name, progress ring, days remaining, top spending categories.

---

## 2.3 Paycheck Planning

**Gap**: EveryDollar's January 2026 relaunch feature. Essential for paycheck-to-paycheck households and irregular income.

**Implementation**:
- Define pay schedule: weekly, bi-weekly, semi-monthly, monthly, irregular
- Allocate budget categories to specific pay periods
- Safe-to-spend adjusts based on which paycheck is "active"
- Visual timeline: "Paycheck 1 (Feb 1): rent + groceries | Paycheck 2 (Feb 15): utilities + car"

```typescript
interface PaycheckPlan {
  schedule: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'irregular';
  paychecks: {
    id: string;
    label: string;           // "Paycheck 1", "Freelance invoice"
    expectedDate: string;
    expectedAmount: number;
    allocations: { categoryId: string; amount: number }[];
  }[];
}
```

---

## 2.4 Custom Categories with Emoji

**Gap**: Copilot Money's standout UX. Makes the app feel personal and improves scanning speed.

**Implementation**:
- Users can rename, recolor, and add emoji to any category
- Pre-populated defaults but fully customizable
- Emoji picker (lightweight, keyboard-accessible)
- Category management as a first-class settings screen
- Subcategories: "Food" → "🛒 Groceries", "🍽️ Dining Out", "☕ Coffee"

**UI**: Settings → Categories → Grid of category cards with emoji, name, color dot. Tap to edit. Drag to reorder.

---

## 2.5 Recurring Transaction Templates

**Gap**: Auto-generate pending transactions for known recurring bills/income.

**Implementation**:
- User defines: payee, amount, category, frequency (weekly/biweekly/monthly/quarterly/annual), next date
- System auto-generates "pending" transactions when due date approaches (3 days ahead)
- User confirms or adjusts actual amount when transaction occurs
- Feeds directly into safe-to-spend calculation ("$430 in upcoming bills this week")

```typescript
interface RecurringTemplate {
  id: string;
  payee: string;
  amount: number;
  category: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
  nextDate: string;
  autoConfirmIfWithin?: number;  // Auto-confirm if actual amount within X% of expected
  enabled: boolean;
}
```

**UI**: Settings → Recurring → List of templates with next due date. Toggle on/off. Pending transactions appear in transaction list with dashed border styling.

---

## 2.6 Safe-to-Spend Per-Category View ("Partials")

**Gap**: PocketGuard's "In My Pocket" + Fudget's "Partials". Global safe-to-spend exists but per-category visibility is missing.

**Enhancement to existing safe-to-spend**:
- Tap the safe-to-spend card → expands to show per-category remaining
- Each variable category: spent / budgeted / remaining with progress bar
- Color coding: green (< 50% spent), yellow (50–80%), red (> 80%)
- Fixed expenses (rent, utilities) shown as "committed" and excluded from safe-to-spend

```
┌─────────────────────────────┐
│  Safe to Spend              │
│  $1,247.00                  │
│  ████████████░░░░ 62%       │
│                             │
│  ▼ Category breakdown       │
│  🛒 Groceries    $220 left  │
│  ████████░░░░░░░░    55%    │
│  🍽️ Dining       $105 left  │
│  █████░░░░░░░░░░░    48%    │
│  🎭 Entertainment $80 left  │
│  ██░░░░░░░░░░░░░░    20%    │
│  ☕ Coffee        $12 left   │
│  ████████████████    88% ⚠️ │
└─────────────────────────────┘
```

---

## 2.7 Onboarding Flow

**Gap**: Currently no guided setup. Users land on the app and have to figure things out. Research shows users abandon within 2 weeks if setup is confusing.

**Implementation** — 4-step wizard, target < 2 minutes:

1. **Welcome + Method Quiz** (30s): "How do you prefer to budget?" → 3 questions → recommends zero-based, envelope, 50/30/20, or pay-yourself-first
2. **Income Setup** (30s): "What's your monthly take-home?" → single input + pay frequency selector
3. **Category Picker** (45s): Pre-populated categories with emoji based on chosen method. User can add/remove/customize. Show recommended amounts.
4. **First Budget Created** (15s): Auto-generates first month's budget → lands on dashboard with safe-to-spend populated. Celebration confetti.

**UI**: Full-screen stepper with progress indicator. Skip button on each step. Can revisit from Settings.

```
Step 1/4                    Step 2/4
┌─────────────┐            ┌─────────────┐
│ How do you  │            │ What's your │
│ budget?     │            │ monthly     │
│             │            │ income?     │
│ ○ Give      │            │             │
│   every $   │            │ [$________] │
│   a job     │            │             │
│ ○ Spend     │            │ Paid:       │
│   in        │            │ ○ Weekly    │
│   envelopes │            │ ● Bi-weekly │
│ ○ 50/30/20  │            │ ○ Monthly   │
│ ○ Pay       │            │             │
│   yourself  │            │ [Next →]    │
│   first     │            │             │
│ [Next →]    │            └─────────────┘
└─────────────┘
```

---

## 2.8 Swipe-to-Review (Mobile)

**Gap**: Monarch's monthly review swipe-through. Makes transaction review feel like a game, not a chore.

**Implementation**:
- Tinder-style card stack for uncategorized or flagged transactions
- Swipe right = Approve (category correct)
- Swipe left = Flag for review
- Swipe up = Split transaction
- Tap = Open detail to edit
- Progress bar: "23 of 47 reviewed"
- Desktop: keyboard shortcuts (→ approve, ← flag, ↑ split, Enter open)

```
┌──────────────────────────┐
│     Review Transactions  │
│     ████████░░░ 23/47    │
│                          │
│  ┌────────────────────┐  │
│  │                    │  │
│  │  Metro Grocery     │  │
│  │  $87.32            │  │
│  │  Feb 8, 2026       │  │
│  │                    │  │
│  │  🛒 Groceries      │  │
│  │                    │  │
│  │  ← Flag    Approve →│ │
│  └────────────────────┘  │
│                          │
│  [Skip All] [Done]       │
└──────────────────────────┘
```

---

## 2.9 Bulk Re-Categorization

**Gap**: PocketGuard limits this to premium. Users importing 200 transactions need to fix miscategorized items in 2 minutes, not 30.

**Implementation**:
- Multi-select mode on transaction list (checkbox column)
- Bulk actions: Change category, Add tag, Delete, Flag
- "Select all matching [merchant]" shortcut
- Leads into merchant quick-rules (see 2.10)

**UI**: Tap-and-hold or checkbox to enter multi-select. Action bar appears at bottom: "12 selected → [Categorize] [Tag] [Delete]"

---

## 2.10 Merchant Quick-Rules

**Gap**: "Always categorize Starbucks as Coffee" — needed from the moment transactions exist. Full rules engine can wait, but merchant→category mapping is essential now.

**Implementation**:
- When user re-categorizes a transaction, offer: "Always categorize [merchant] as [category]?"
- Store merchant→category mapping in IndexedDB
- Apply automatically to new transactions from same merchant
- Manage in Settings → Rules → list of merchant→category pairs
- Override per-transaction still possible

```typescript
interface MerchantRule {
  id: string;
  merchantPattern: string;    // Normalized merchant name or partial match
  categoryId: string;
  autoApply: boolean;
  createdAt: string;
}
```

---

## 2.11 Refund Tracking

**Gap**: Only Simplifi offers this. Without it, returns distort spending reports.

**Implementation**:
- "Mark as expecting refund" on any transaction
- When a matching credit appears, link them
- Spending reports show both gross and net views
- Dashboard shows pending refunds count with expected total

```typescript
interface Transaction {
  // ... existing fields
  refund?: {
    status: 'expecting' | 'received' | 'partial';
    linkedTransactionId?: string;
    expectedAmount?: number;
  };
}
```

---

## 2.12 Weekly Spending Recap (In-App)

**Gap**: Highest-engagement touchpoint in budget apps. The code exists (weekly-insights.ts, 706 LOC) but isn't surfaced.

**Implementation**:
- In-app summary card on dashboard (appears every Monday or configurable day)
- Content: total spending vs. last week, top 3 categories, notable transactions (largest, unusual), safe-to-spend update, one actionable insight
- Dismissible but reappears next week
- Optional: schedule as browser notification (if notification permission granted)

```
┌─────────────────────────────┐
│ 📊 Weekly Recap · Feb 3–9   │
│                             │
│ Total spent: $847 (+12%)    │
│                             │
│ Top categories:             │
│ 🛒 Groceries    $245  29%  │
│ 🍽️ Dining       $180  21%  │
│ 🚗 Transport    $120  14%  │
│                             │
│ 💡 You spent 40% of your   │
│    dining budget in 7 days. │
│    Consider cooking at home │
│    this week.               │
│                             │
│ [View Full Report] [Dismiss]│
└─────────────────────────────┘
```

---

## 2.13 Spending Velocity Alerts

**Gap**: Alert when pace exceeds 1.5x trailing average. Prevents "where did the money go?" moments.

**Implementation** (extend existing overspending-detector.ts):
- Calculate daily run-rate per category: spending this month ÷ days elapsed
- Compare to monthly budget: if projected exceeds 100%, alert
- Compare to trailing 3-month average: if pace > 1.5x, alert
- Surface as: in-app banner on category page + optional notification

```
⚠️ Dining pace alert
You're spending $28/day on dining — at this rate you'll exceed
your $200 budget by Feb 18. Last 3 months averaged $18/day.
```

---

## 2.14 Seasonal Budget Templates

**Gap**: No competitor offers proactive seasonal templates.

**Implementation**:
- 6 templates: Holiday (Nov), Tax Season (Mar), Summer Travel (Jun), Back-to-School (Aug), Spring Home (Apr), Halloween (Oct)
- Each template: pre-built categories with emoji, suggested amounts based on last year's spending (if available) or national averages
- Offered contextually as Event Budgets (reuse 2.2 infrastructure)
- Prompt appears on dashboard in the relevant month

---

## 2.15 Dashboard Customization

**Gap**: Monarch Money's #1 UX praise point. Different users care about different widgets.

**Implementation**:
- Widget-based dashboard: user chooses 4–8 widgets from a catalog
- Available widgets: Safe-to-Spend (ring), Budget Progress (bars), Recent Transactions, Spending by Category (pie/donut), Monthly Trend (line), Bills Due, Net Worth, Health Score, Savings Goals, Subscription Summary, Weekly Recap, Cash Flow Forecast
- Drag-and-drop reorder on desktop, long-press reorder on mobile
- Widget size: full-width or half-width
- Persist layout in IndexedDB per user

```
┌────────────────────────────────┐
│ Customize Dashboard        [✓] │
│                                │
│ ☑ Safe-to-Spend      [Full]   │
│ ☑ Budget Progress    [Half]   │
│ ☑ Recent Transactions [Full]  │
│ ☐ Net Worth          [Half]   │
│ ☑ Monthly Trend      [Half]   │
│ ☐ Health Score       [Half]   │
│ ☐ Savings Goals      [Half]   │
│ ☑ Bills Due          [Half]   │
│                                │
│ Drag to reorder ≡              │
└────────────────────────────────┘
```

---

## 2.16 Transaction Notes

**Gap**: Even without couples features, users need a way to annotate transactions ("birthday dinner for Mom", "split with Dave").

**Implementation**:
- Optional text note on any transaction (max 500 chars)
- Visible in transaction detail view
- Searchable in transaction search
- Shown as subtle secondary text in transaction list on desktop

---

## 2.17 Natural Language Queries (AI Coach Enhancement)

**Gap**: Copilot's top differentiator. The AI chatbot context exists (~13KB) but doesn't support querying your own data in plain English.

**Enhancement to existing AI Coach**:
- Input: "How much did I spend on dining this quarter?"
- Processing: Parse → map to IndexedDB query → execute locally → format response
- Pre-built query templates: spending by category/time, budget vs actual, year-over-year, "what if" scenarios
- ALL processing local — query runs against IndexedDB data, only anonymized summaries sent to Claude API for natural language response generation

---

## 2.18 Cost-Per-Use for Subscriptions

**Gap**: "Netflix costs me $4.50 per show watched" — reframes subscriptions as cost-per-use.

**Enhancement to existing subscription detector**:
- User logs usage (manual counter or frequency estimate)
- Calculate: monthly cost ÷ estimated uses = cost per use
- Highlight subscriptions with high cost-per-use as cancellation candidates
- Dashboard widget: "Your most expensive subscription per-use: [Gym $28/visit]"

---

## 2.19 Near-Budget Limit Alerts

**Gap**: PocketGuard and Honeydue both have this. Users cite it as a top reason they stick with an app.

**Implementation**:
- Configurable threshold per category (default 80%, adjustable 50%–95%)
- Visual indicator on budget page: amber badge at threshold, red badge at 100%+
- Dashboard alert banner: "⚠️ Dining is at 85% ($170 of $200)"
- Optional browser/PWA notification if permission granted
- "Snooze" option to dismiss for 24 hours

```typescript
interface BudgetAlert {
  categoryId: string;
  threshold: number;        // 0.8 default
  currentPercent: number;
  triggered: boolean;
  snoozedUntil?: string;    // ISO date
}
```

**UI**: Subtle amber/red pill badge on category rows in budget view. Dashboard shows count of categories approaching limit.

---

## 2.20 Gamification & Streaks

**Gap**: No major budget app does this well. Duolingo-style streaks are the #1 proven retention mechanic. Budget apps have ~40% 90-day retention — this directly attacks that.

### Daily Streaks
- Track consecutive days of financial engagement (log transaction, review pending, check safe-to-spend, categorize)
- Visual streak counter on dashboard: "🔥 14 day streak"
- Streak freeze: 2 per month — prevents frustration from one missed day
- Milestone celebrations: 7, 14, 30, 60, 90, 180, 365 days with confetti
- Stored in IndexedDB

### Badges
- **Budget Keeper**: Under budget for 1/3/6/12 consecutive months
- **Saver**: Hit savings goal, emergency fund milestone
- **Debt Crusher**: Paid off a loan, reduced debt by 10%/25%/50%
- **Streak Master**: 30/90/365 day streaks
- **Receipt Pro**: Scanned 10/50/100 receipts
- **Category King**: All transactions categorized for a full month
- **No-Spend Hero**: Completed a no-spend day/weekend/week challenge

### Monthly Challenges
- "No-Spend Weekend" — log zero discretionary spending Sat-Sun
- "Pack Lunch Week" — reduce dining category by 50%
- "Subscription Audit" — review and cancel at least one subscription
- Challenges rotate monthly, contextual to season

```typescript
interface UserGamification {
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string;
    freezesRemaining: number;
    freezesUsedThisMonth: number;
  };
  badges: {
    id: string;
    name: string;
    emoji: string;
    earnedDate: string;
    tier: 'bronze' | 'silver' | 'gold';
  }[];
  challenges: {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    progress: number;
    completed: boolean;
  }[];
  totalXP: number;
}
```

**UI**:
- Dashboard: streak counter with flame emoji, tap to see history
- Profile/Settings: badge grid (earned = color, locked = gray with unlock criteria)
- Challenges: card on dashboard with progress bar during active challenge
- Celebrations: `canvas-confetti` burst on milestone/badge/challenge completion

---

## 2.21 Expense Splitting

**Gap**: Splitwise has 30M+ users for this one feature. If the budget app handles splitting natively, users don't need a separate app.

**Implementation** (works locally — tracks splits against named people):
- On any transaction: "Split this expense" option
- Split with: named person (partner, roommate, friend — stored locally)
- Split modes: 50/50, custom ratio (70/30), by amount, by item
- Running balance per person: "Dave owes you $47.50"
- Settlement: mark as settled (cash, e-Transfer, etc.)
- Reports: show gross spending vs. your share

```typescript
interface ExpenseSplit {
  transactionId: string;
  splits: {
    personName: string;
    amount: number;
    settled: boolean;
    settledDate?: string;
    settledMethod?: string;
  }[];
}

interface SplitPerson {
  id: string;
  name: string;
  emoji?: string;
  runningBalance: number;    // Positive = they owe you
}
```

**UI**: Transaction detail → "Split" button → select person → choose mode → confirm. Dashboard widget: "Balances" showing who owes whom.

---

## 2.22 Push / Browser Notifications

**Gap**: Essential for bill reminders, budget alerts, and weekly recap. PWA push works on iOS 16.4+ (home screen required) and all Android/desktop browsers.

**Implementation**:
- VAPID-based web push registration (or local Notification API for offline-only)
- Permission request: triggered after user creates first recurring bill (NOT on first visit)
- Notification types:
  - **Bill reminders**: "Electricity ($120) due in 3 days" (from recurring templates 2.5)
  - **Budget alerts**: "Dining is at 85% of budget" (from 2.19)
  - **Weekly recap**: "Your weekly summary is ready" (from 2.12)
  - **Streak reminder**: "Don't break your 14-day streak!" (from 2.20)
  - **Goal milestone**: "You're 75% to your emergency fund goal!"
- Per-type toggle in Settings
- Quiet hours: configurable do-not-disturb window
- iOS: educational prompt explaining home screen install required

```typescript
interface NotificationPreferences {
  billReminders: boolean;
  budgetAlerts: boolean;
  weeklyRecap: boolean;
  streakReminders: boolean;
  goalMilestones: boolean;
  quietHoursStart?: string;  // "22:00"
  quietHoursEnd?: string;    // "08:00"
}
```

**Service worker**:
```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url: data.url },
      tag: data.tag,
    })
  );
});
```

**Note**: For fully offline mode, use Notification API + scheduled checks on app-open or service worker periodic sync. True server-push requires a backend, but local scheduled notifications cover 90% of use cases.

---

## 2.23 Conversational What-If Scenarios

**Gap**: Monte Carlo code exists (trend-forecasting.ts, 227 LOC) but isn't combined with conversational AI.

**Enhancement** (combines with 2.17 Natural Language Queries):
- "What if I cancel Netflix and Spotify and put that toward my student loan?"
  → Calculate savings → adjust Monte Carlo → show new payoff date
- "What if I get a $5K raise?"
  → Adjust income → recalculate safe-to-spend, savings rate, goal timelines
- "Can I afford a $300/month car payment?"
  → Subtract from budget → show impact on savings, emergency fund, safe-to-spend

**Implementation**:
- Pre-built scenario types: cancel subscriptions, change income, add expense, adjust savings rate, pay off debt early
- Visual: before/after comparison cards showing key metric changes
- Local processing: all calculation against IndexedDB data

```
┌─────────────────────────────┐
│ 🤖 What-If: Cancel Streaming│
│                             │
│ Monthly savings: +$28.98    │
│ Student loan payoff:        │
│   Before: Mar 2029          │
│   After:  Nov 2028 (4mo ⬆) │
│ Safe-to-spend:              │
│   Before: $1,247            │
│   After:  $1,276            │
│                             │
│ [Apply This] [Try Another]  │
└─────────────────────────────┘
```

---

## 2.24 Net Worth Dashboard

**Gap**: Monarch, Empower, Copilot, PocketGuard all have this. The "big picture" view that keeps users opening the app even when not actively budgeting.

**Implementation**:
- Aggregated: all assets − all liabilities = net worth
- Asset categories: bank accounts, investments, real estate, vehicles, other
- Liability categories: mortgage, student loans, auto loans, credit cards, BNPL, other
- Monthly trend chart: line graph over time
- Milestone markers: "$50K", "$100K" etc. with celebration on crossing
- YoY comparison: "Net worth up $12,400 (+8.3%) from last year"
- Breakdown donut chart: assets by type, liabilities by type

```typescript
interface NetWorthSnapshot {
  date: string;
  assets: { bankAccounts: number; investments: number; realEstate: number; vehicles: number; other: number };
  liabilities: { mortgage: number; studentLoans: number; autoLoans: number; creditCards: number; bnpl: number; other: number };
  total: number;
}
```

**UI**: Full page from sidebar/more. Hero number with trend arrow. Monthly chart. Asset/liability breakdown cards. Feeds into financial health score.

---

## 2.25 Global Real Estate Tracking

**Gap**: Monarch integrates Zillow (US only). No budget app supports property tracking globally. With 114 locales and 160+ currencies, this app should handle properties in any country.

**Implementation**:
- Manual property value entry in any supported currency (update quarterly or on market shifts)
- Mortgage details: balance, rate, amortization, payment frequency — localized to country norms
  - Canada/UK/Australia: variable rate common, payment frequency options (monthly, biweekly, accelerated biweekly)
  - US: 15/30yr fixed common
  - Europe: varies by country
- Amortization chart: principal vs interest over time
- Equity calculation: property value − mortgage balance (auto-converted to base currency if different)
- Property tax tracking with payment reminders (annual, semi-annual, quarterly — varies by country)
- Rental property mode: income, expenses, ROI, cash flow — all in property's local currency
- Multi-property support: primary residence + investment properties in different countries
- Currency handling: property stored in its local currency, net worth rolls up in user's base currency using live exchange rates
- Feeds into net worth dashboard (2.24) as real estate assets

```typescript
interface Property {
  id: string;
  name: string;                    // "123 Main St, Toronto" or "Flat 4, London"
  type: 'primary' | 'rental' | 'vacation' | 'investment';
  country: string;                 // ISO 3166-1 alpha-2
  currency: string;                // ISO 4217 — property's local currency
  estimatedValue: number;          // In property's currency
  lastValuedDate: string;
  purchasePrice?: number;
  purchaseDate?: string;
  mortgage?: {
    balance: number;
    rate: number;
    rateType: 'fixed' | 'variable' | 'tracker';
    amortizationYears: number;
    paymentFrequency: 'monthly' | 'biweekly' | 'accelerated_biweekly' | 'weekly' | 'fortnightly';
    paymentAmount: number;
    maturityDate?: string;
    currency: string;              // Mortgage may be in different currency than property (expat scenario)
  };
  propertyTax?: {
    annualAmount: number;
    frequency: 'annual' | 'semi_annual' | 'quarterly' | 'monthly';
    nextDueDate: string;
  };
  rentalIncome?: {
    monthlyAmount: number;
    currency: string;
  };
  expenses?: {                     // Strata/HOA, insurance, maintenance
    monthlyAmount: number;
    currency: string;
  };
}
```

**UI**: Settings → Properties → list of property cards with flag emoji for country, value in local currency, equity calculation. Dashboard widget (optional): total real estate equity in base currency. Tap property for amortization chart and cash flow breakdown.
```

---

# PART 3: EXECUTION ORDER

## Priority Sequence

Build in this order — each layer builds on the previous:

### Sprint 1: Foundation (UI System)
1. Design token system (1.1) — spacing, colors, typography, animations
2. Tailwind config updates (breakpoints, touch targets, custom animations)
3. AppShell layout with responsive sidebar + bottom tabs (1.2)
4. Safe area handling (1.3)
5. PWA manifest + service worker + iOS/Android install prompts (1.3)

### Sprint 2: Core Components
6. Bottom sheet component (1.4)
7. FAB component (1.4)
8. Empty states for all existing screens (1.4)
9. Loading skeletons for all existing screens (1.4)
10. Privacy blur on financial values (1.4)
11. Transaction row responsive design (1.4)
12. Dark mode audit + glassmorphism effects (1.7)

### Sprint 3: High-Impact Features (Retention Critical)
13. Onboarding flow — 4-step wizard (2.7) — **highest retention impact**
14. Custom categories with emoji (2.4) — **most visible personalization**
15. Safe-to-spend per-category "Partials" view (2.6) — **daily engagement driver**
16. Budget rollover (2.1) — **YNAB switcher essential**
17. Recurring transaction templates (2.5) — **feeds safe-to-spend accuracy**
18. Near-budget limit alerts (2.19) — **behavioral nudge, keeps users under budget**
19. Gamification & streaks (2.20) — **#1 proven retention mechanic**

### Sprint 4: Transaction UX
20. Swipe-to-review (2.8) — **gamifies the most tedious task**
21. Bulk re-categorization (2.9) — **critical for CSV import users**
22. Merchant quick-rules (2.10) — **learn-once automation**
23. Transaction notes (2.16)
24. Refund tracking (2.11)
25. Expense splitting (2.21) — **replaces Splitwise for couples/roommates**

### Sprint 5: Intelligence Layer
26. Weekly spending recap card (2.12) — **surface existing code**
27. Spending velocity alerts (2.13) — **extend existing detector**
28. Push/browser notifications (2.22) — **delivers alerts and recaps**
29. Natural language queries (2.17) — **AI coach upgrade**
30. Conversational what-if scenarios (2.23) — **Monte Carlo + AI**
31. Cost-per-use for subscriptions (2.18)

### Sprint 6: Dashboard & Wealth
32. Dashboard customization (2.15) — **personalization**
33. Net worth dashboard (2.24) — **big picture view**
34. Global real estate tracking (2.25) — **feeds net worth, supports all countries**

### Sprint 7: Advanced & Polish
35. Paycheck planning (2.3)
36. Event/project budgets (2.2)
37. Seasonal budget templates (2.14)
38. Keyboard shortcuts (1.5)
39. Accessibility audit + fixes (1.8)
40. Performance optimization to hit targets (1.9)

---

## Build Rules for Claude Code

### Every Component Must:
1. **Work at 375px first** — test on iPhone SE viewport before expanding
2. **Have all states**: default, hover, active, disabled, loading (skeleton), empty, error
3. **Use design tokens** — never hardcode colors, spacing, or animation values
4. **Touch targets ≥ 44px** on all interactive elements
5. **Use `aria-label`** on every icon-only button
6. **Wrap animations** in `prefers-reduced-motion` guard
7. **Financial values** use monospace font + semantic color + privacy blur support
8. **Bottom sheets** on mobile for detail views — NOT full-page modals
9. **Skeleton screens** for loading — NEVER spinners
10. **Designed empty states** — NEVER blank screens

### Architecture Rules:
1. All data stays in IndexedDB — no network calls for core features
2. `rem` for all font sizes — respect browser font scaling
3. CSS logical properties for RTL: `ms-4` not `ml-4`, `ps-4` not `pl-4`
4. Dynamic imports for heavy libraries (Tesseract.js, TF.js, chart libs)
5. `font-display: swap` on all font declarations
6. Max content width 1440px on ultra-wide screens
7. Test dark mode AND light mode for every component
8. Seniors mode must scale touch targets and font sizes per existing SeniorsModeContext
9. i18n: No hardcoded English strings — all user-facing text through translation system
10. Feature flags on all new features — progressive rollout capability
