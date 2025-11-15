/**
 * Budget App Service Worker
 * Enables offline functionality and PWA capabilities
 * 
 * Features:
 * - Cache-first strategy for app shell
 * - Network-first for dynamic data
 * - Offline fallback page
 * - Background sync for transactions (future)
 */

const CACHE_NAME = 'budget-app-v2-dev';
const RUNTIME_CACHE = 'budget-app-runtime-v2-dev';

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

  // Cache-first for:
  // - App pages (routes)
  // - Static assets (icons, images)
  // - Scripts and styles
  return url.pathname.startsWith('/budget-app') ||
         url.pathname.startsWith('/icons/') ||
         url.pathname.startsWith('/_next/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.svg');
}

/**
 * Cache-first strategy
 * Try cache first, fall back to network
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirstStrategy(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[Service Worker] Cache hit:', request.url);
      return cachedResponse;
    }

    // Fall back to network
    console.log('[Service Worker] Cache miss, fetching:', request.url);
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

console.log('[Service Worker] Loaded successfully');

