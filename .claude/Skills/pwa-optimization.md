---
name: pwa-optimization
description: Use when improving PWA experience — service worker caching, install prompts, push notifications, background sync, or offline capabilities.
---

# PWA Optimization

## Overview

Optimizes the budget app's Progressive Web App experience — service worker caching strategies, install prompt timing, push notifications, background sync, and offline capabilities. The budget app's offline-first architecture makes PWA features particularly important.

## When to Use

- Configuring service worker caching strategies
- Implementing install prompt timing
- Adding push notifications
- Setting up background sync
- Optimizing offline experience
- Handling app update notifications
- Fixing iOS-specific PWA issues

## Core Principles

- **Offline by default** — App must work fully without network
- **Cache-first for static assets** — JS, CSS, images served from cache
- **Network-first for API** — API calls try network, fall back to cache
- **Prompt at the right time** — Don't show install prompt on first visit
- **Silent updates** — Update service worker in background, notify user

## Workflow

### Step 1: Service Worker Caching Strategies

```ts
// next.config.js — using next-pwa or workbox
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Cache-first for static assets (fonts, images, JS, CSS)
    {
      urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|svg|gif|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Network-first for API routes
    {
      urlPattern: /\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    // Stale-while-revalidate for pages
    {
      urlPattern: /\/budget-app\/.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'page-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
  ],
});
```

### Step 2: Install Prompt Timing

```tsx
function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Show install prompt after user has:
  // 1. Used app for at least 3 sessions
  // 2. Completed at least one meaningful action
  // 3. Not dismissed the prompt in the last 30 days
  useEffect(() => {
    const sessions = parseInt(localStorage.getItem('session-count') || '0');
    const hasAction = localStorage.getItem('has-meaningful-action') === 'true';
    const lastDismissed = localStorage.getItem('install-dismissed');
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    if (
      deferredPrompt &&
      sessions >= 3 &&
      hasAction &&
      (!lastDismissed || parseInt(lastDismissed) < thirtyDaysAgo)
    ) {
      setShowPrompt(true);
    }
  }, [deferredPrompt]);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const dismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('install-dismissed', Date.now().toString());
  };

  return { showPrompt, install, dismiss };
}
```

### Step 3: App Update Notification

```tsx
function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }
  }, []);

  const applyUpdate = () => {
    window.location.reload();
  };

  return { updateAvailable, applyUpdate };
}

// Toast notification for updates
function UpdateBanner() {
  const { updateAvailable, applyUpdate } = useAppUpdate();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-blue-600 p-4 text-white shadow-lg sm:left-auto sm:right-4 sm:w-80">
      <p className="text-sm font-medium">Update available</p>
      <p className="mt-1 text-xs opacity-80">A new version is ready to install.</p>
      <Button variant="secondary" size="sm" className="mt-2" onClick={applyUpdate}>
        Update Now
      </Button>
    </div>
  );
}
```

### Step 4: Background Sync

```ts
// Register background sync for offline operations
async function registerBackgroundSync(tag: string) {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
  }
}

// In service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncPendingTransactions());
  }
  if (event.tag === 'sync-budgets') {
    event.waitUntil(syncPendingBudgets());
  }
});
```

### Step 5: App Manifest

```json
{
  "name": "Budget App",
  "short_name": "Budget",
  "description": "Privacy-first personal finance management",
  "start_url": "/budget-app",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["finance", "productivity"],
  "screenshots": [
    { "src": "/screenshots/dashboard.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow" },
    { "src": "/screenshots/desktop.png", "sizes": "1920x1080", "type": "image/png", "form_factor": "wide" }
  ]
}
```

### Step 6: iOS-Specific Quirks

```tsx
// iOS doesn't support beforeinstallprompt
// Show manual install instructions
function iOSInstallInstructions() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  if (!isIOS || isStandalone) return null;

  return (
    <Card>
      <CardContent className="text-center p-6">
        <p className="text-sm">
          To install: tap <ShareIcon className="inline h-4 w-4" /> then "Add to Home Screen"
        </p>
      </CardContent>
    </Card>
  );
}

// iOS quirks to handle:
// - No push notifications (iOS 16.4+ supports, but limited)
// - No background sync
// - Service worker evicted after ~7 days of inactivity
// - 50MB storage limit in standalone mode
// - No beforeinstallprompt event
```

## Key Files

| File | Role |
|------|------|
| `next.config.js` | PWA configuration |
| `public/manifest.json` | Web app manifest |
| `public/sw.js` | Service worker (generated) |
| `src/app/layout.tsx` | Manifest link, theme-color meta |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Showing install prompt on first visit | Wait for 3+ sessions and meaningful action |
| No offline fallback for uncached pages | Cache app shell + show offline indicator |
| Service worker caches stale API data forever | Use `NetworkFirst` with expiration for API |
| Ignoring iOS limitations | Detect iOS and show manual install instructions |
| No update notification | Detect new service worker and notify user |
| Maskable icon not provided | Include 512x512 maskable icon in manifest |

## Validation Checklist

- [ ] App works fully offline (core features)
- [ ] Service worker caches static assets (cache-first)
- [ ] API calls use network-first with cache fallback
- [ ] Install prompt appears at appropriate time (not first visit)
- [ ] App update notification works
- [ ] Manifest complete with all required fields
- [ ] Both regular and maskable icons provided
- [ ] iOS-specific limitations handled
- [ ] Lighthouse PWA audit passes

## Related Skills

- `performance-budget` — caching improves performance
- `mobile-first-ux` — PWA is primarily mobile
- `real-time-sync` — background sync integration
