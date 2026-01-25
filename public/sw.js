/**
 * Budget App Service Worker
 * Enables offline functionality and PWA capabilities
 *
 * Features:
 * - Cache-first strategy for app shell
 * - Network-first for dynamic data
 * - Locale file caching (114 locales for offline i18n)
 * - Offline fallback page
 * - Background sync for transactions (future)
 */

const CACHE_NAME = 'budget-app-v4-prod';
const RUNTIME_CACHE = 'budget-app-runtime-v4-prod';

// App shell files to cache on install
const APP_SHELL = [
  '/budget-app',
  '/budget-app/transactions',
  '/budget-app/budgets',
  '/budget-app/categories',
  '/budget-app/investments',
  '/budget-app/reports',
  '/budget-app/import',
  '/budget-app/offline',  // Offline fallback page
];

// Static assets to cache
const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/budget-app-192.png',
  '/icons/budget-app-512.png',
];

// Install event - cache app shell and static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell and static assets');
        return cache.addAll([...APP_SHELL, ...STATIC_ASSETS]);
      })
      .then(() => {
        console.log('[Service Worker] Installed successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activated successfully');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 🔥 DEVELOPMENT MODE: Completely bypass SW for localhost
  // This prevents FetchEvent errors with Next.js hot reload
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    // Don't call event.respondWith() - let browser handle it natively
    return;
  }

  // Strategy: Cache-first for app shell, Network-first for API/data
  if (shouldCacheFirst(url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(networkFirstStrategy(request));
  }
});

/**
 * Determine if a request should use cache-first strategy
 * @param {URL} url - The request URL
 * @returns {boolean}
 */
function shouldCacheFirst(url) {
  // 🔥 DEVELOPMENT MODE: Skip caching for localhost to allow hot reload
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    console.log('[Service Worker] DEV MODE: Bypassing cache for:', url.pathname);
    return false;
  }

  // External CDNs - use network-first (don't intercept with SW)
  // This avoids CSP issues where the browser's CSP is applied before SW fetch
  const trustedCDNs = [
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
  ];
  if (trustedCDNs.some(cdn => url.hostname.includes(cdn))) {
    console.log('[Service Worker] CDN request, using network-first:', url.hostname);
    return false;
  }

  // Cache-first for same-origin requests:
  // - App pages (routes)
  // - Static assets (icons, images)
  // - Scripts and styles
  // - Locale files (i18n JSON)
  return url.pathname.startsWith('/budget-app') ||
         url.pathname.startsWith('/icons/') ||
         url.pathname.startsWith('/_next/static/') ||
         url.pathname.includes('/chunks/src_i18n_messages_') || // Locale chunks
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.json') || // Include all JSON files
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.svg');
}

/**
 * Cache-first strategy with stale-while-revalidate for CSS/JS
 * Returns cached response immediately, fetches fresh version in background
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirstStrategy(request) {
  try {
    const url = new URL(request.url);
    const isStaticAsset = url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

    // Try cache first
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // For JS/CSS, use stale-while-revalidate: return cache but update in background
      if (isStaticAsset) {
        // Clone request for background fetch
        const fetchPromise = fetch(request).then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            await cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          console.log('[Service Worker] Background revalidation failed:', err);
        });

        // Don't await - let it update in background
        // This ensures next page load gets fresh assets
      }

      return cachedResponse;
    }

    // Fall back to network
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);

    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/budget-app/offline');
      if (offlinePage) {
        return offlinePage;
      }
    }

    throw error;
  }
}

/**
 * Network-first strategy
 * Try network first, fall back to cache
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Network failed, trying cache:', error);
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/budget-app/offline');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

// Background sync for queued transactions (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

/**
 * Sync queued transactions when back online
 * @returns {Promise<void>}
 */
async function syncTransactions() {
  // TODO: Implement background sync for transactions
  // This would sync any transactions created while offline
  console.log('[Service Worker] Syncing transactions...');
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Budget App';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/budget-app-192.png',
    badge: '/icons/budget-app-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'budget-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/budget-app')
  );
});

// Message handler for manual cache control
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skip waiting requested');
    self.skipWaiting();
  }

  if (event.data?.type === 'CLEAR_CACHES') {
    console.log('[Service Worker] Clear caches requested');
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => {
        console.log('[Service Worker] Deleting cache:', name);
        return caches.delete(name);
      }));
    }).then(() => {
      console.log('[Service Worker] All caches cleared');
      // Notify the client that caches are cleared
      if (event.source) {
        event.source.postMessage({ type: 'CACHES_CLEARED' });
      }
    });
  }
});

console.log('[Service Worker] Loaded successfully');
