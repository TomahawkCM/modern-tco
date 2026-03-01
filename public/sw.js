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

const CACHE_NAME = "budget-app-v6-prod";
const RUNTIME_CACHE = "budget-app-runtime-v6-prod";

// App shell files to cache on install
const APP_SHELL = [
  "/budget-app",
  "/budget-app/transactions",
  "/budget-app/budgets",
  "/budget-app/categories",
  "/budget-app/investments",
  "/budget-app/reports",
  "/budget-app/import",
  "/budget-app/offline", // Offline fallback page
];

// Static assets to cache
const STATIC_ASSETS = ["/manifest.json", "/icons/budget-app-192.png", "/icons/budget-app-512.png"];

// Install event - cache app shell and static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching app shell and static assets");
        return cache.addAll([...APP_SHELL, ...STATIC_ASSETS]);
      })
      .then(() => {
        console.log("[Service Worker] Installed successfully");
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error("[Service Worker] Install failed:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log("[Service Worker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[Service Worker] Activated successfully");
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome extensions and non-http(s) requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // 🔥 DEVELOPMENT MODE: Completely bypass SW for localhost
  // This prevents FetchEvent errors with Next.js hot reload
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    // Don't call event.respondWith() - let browser handle it natively
    return;
  }

  // 🔥 Skip Vercel Live completely - these are dev tools that shouldn't be cached
  // Let the browser handle these natively to avoid CSP issues
  if (url.hostname.includes("vercel.live") || url.hostname.includes("pusher.com")) {
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
 * Determine if a request should use cache-first strategy.
 *
 * IMPORTANT: Next.js build chunks (/_next/static/) and page routes MUST use
 * network-first. Chunks are content-hashed per deployment — when a new deploy
 * ships, old hashes no longer exist on the server and cache-first would either
 * serve stale code or pass through a 404. Only truly immutable static assets
 * (icons, images, manifest) should be cache-first.
 *
 * @param {URL} url - The request URL
 * @returns {boolean}
 */
function shouldCacheFirst(url) {
  // 🔥 DEVELOPMENT MODE: Skip caching for localhost to allow hot reload
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    console.log("[Service Worker] DEV MODE: Bypassing cache for:", url.pathname);
    return false;
  }

  // External CDNs - use network-first (don't intercept with SW)
  // This avoids CSP issues where the browser's CSP is applied before SW fetch
  const trustedCDNs = [
    "cdnjs.cloudflare.com",
    "cdn.jsdelivr.net",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
  ];
  if (trustedCDNs.some((cdn) => url.hostname.includes(cdn))) {
    console.log("[Service Worker] CDN request, using network-first:", url.hostname);
    return false;
  }

  // Cache-first ONLY for truly immutable static assets
  // Everything else (pages, JS chunks, CSS) uses network-first
  return (
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json" ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff")
  );
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
    const isStaticAsset = url.pathname.endsWith(".js") || url.pathname.endsWith(".css");

    // Try cache first
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // For JS/CSS, use stale-while-revalidate: return cache but update in background
      if (isStaticAsset) {
        // Clone request for background fetch
        const fetchPromise = fetch(request)
          .then(async (networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const cache = await caches.open(RUNTIME_CACHE);
              await cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((err) => {
            console.log("[Service Worker] Background revalidation failed:", err);
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
    console.error("[Service Worker] Fetch failed:", error);

    // Return offline fallback for navigation requests
    if (request.mode === "navigate") {
      const offlinePage = await caches.match("/budget-app/offline");
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
  const url = new URL(request.url);

  try {
    // Try network first
    const networkResponse = await fetch(request);

    // If a Next.js chunk returns 404, it means the deployment changed
    // and the client is requesting stale hashes. Notify client to reload.
    if (networkResponse.status === 404 && url.pathname.startsWith("/_next/static/")) {
      console.warn("[Service Worker] Chunk 404 — deployment changed, notifying clients to reload");
      self.clients.matchAll({ type: "window" }).then((windowClients) => {
        windowClients.forEach((client) => {
          client.postMessage({ type: "DEPLOYMENT_CHANGED" });
        });
      });
      return networkResponse;
    }

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[Service Worker] Network failed, trying cache:", error);

    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("[Service Worker] Serving from cache:", request.url);
      return cachedResponse;
    }

    // Return offline fallback for navigation requests
    if (request.mode === "navigate") {
      const offlinePage = await caches.match("/budget-app/offline");
      if (offlinePage) {
        return offlinePage;
      }
    }

    throw error;
  }
}

// Background sync for queued transactions (future enhancement)
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag);

  if (event.tag === "sync-transactions") {
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
  console.log("[Service Worker] Syncing transactions...");
}

// ==========================================
// PUSH NOTIFICATIONS
// ==========================================

/**
 * IndexedDB helper for storing notifications received in SW
 */
const NOTIFICATION_DB_NAME = "BudgetAppNotifications";
const NOTIFICATION_STORE = "pushNotifications";
const NOTIFICATION_DB_VERSION = 1;

/**
 * Open the notification IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
function openNotificationDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NOTIFICATION_DB_NAME, NOTIFICATION_DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(NOTIFICATION_STORE)) {
        const store = db.createObjectStore(NOTIFICATION_STORE, { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

/**
 * Store a notification in IndexedDB for in-app notification center
 * @param {Object} notification - The notification data
 */
async function storeNotificationInDB(notification) {
  try {
    const db = await openNotificationDB();
    const tx = db.transaction(NOTIFICATION_STORE, "readwrite");
    const store = tx.objectStore(NOTIFICATION_STORE);

    const record = {
      id: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: notification.type || "bill_reminder",
      title: notification.title,
      body: notification.body,
      status: "unread",
      priority: notification.priority || "medium",
      sourceType: notification.sourceType,
      sourceId: notification.sourceId,
      actionUrl: notification.actionUrl || "/budget-app/subscriptions",
      createdAt: new Date(),
      receivedVia: "push",
    };

    store.add(record);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        db.close();
        resolve(record.id);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (error) {
    console.error("[Service Worker] Failed to store notification:", error);
  }
}

/**
 * Notify active clients to refresh notifications
 */
async function notifyClientsToRefresh() {
  const allClients = await clients.matchAll({ includeUncontrolled: true });
  allClients.forEach((client) => {
    client.postMessage({
      type: "NOTIFICATION_RECEIVED",
      timestamp: Date.now(),
    });
  });
}

// Push notification handler
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received:", event);

  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    // If not JSON, try as text
    data = {
      title: "Budget App",
      body: event.data ? event.data.text() : "You have a new notification",
    };
  }

  const title = data.title || "Budget App";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icons/budget-app-192.png",
    badge: "/icons/budget-app-192.png",
    vibrate: [200, 100, 200],
    tag: data.tag || `budget-notification-${Date.now()}`,
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.actionUrl || "/budget-app/subscriptions",
      type: data.type || "bill_reminder",
      sourceType: data.sourceType,
      sourceId: data.sourceId,
      notificationId: data.notificationId,
    },
    actions: [
      {
        action: "view",
        title: "View",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  // Add amount if present (for bill reminders)
  if (data.amount) {
    options.body = `${options.body}\nAmount: ${data.currency || "$"}${data.amount}`;
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      storeNotificationInDB(data),
      notifyClientsToRefresh(),
    ])
  );
});

// Notification click handler with action support
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked:", event.action);

  const notification = event.notification;
  const data = notification.data || {};

  notification.close();

  // Handle different actions
  if (event.action === "dismiss") {
    // Just close the notification, mark as dismissed in DB if we have an ID
    if (data.notificationId) {
      event.waitUntil(markNotificationAsDismissed(data.notificationId));
    }
    return;
  }

  // Default action or 'view' action - open the app
  const urlToOpen = data.url || "/budget-app";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window/tab open
      for (const client of windowClients) {
        if (client.url.includes("/budget-app") && "focus" in client) {
          // Navigate existing window to the target URL
          client.postMessage({
            type: "NAVIGATE_TO",
            url: urlToOpen,
          });
          return client.focus();
        }
      }

      // No existing window, open a new one
      return clients.openWindow(urlToOpen);
    })
  );
});

/**
 * Mark a notification as dismissed in IndexedDB
 * @param {string} notificationId
 */
async function markNotificationAsDismissed(notificationId) {
  try {
    const db = await openNotificationDB();
    const tx = db.transaction(NOTIFICATION_STORE, "readwrite");
    const store = tx.objectStore(NOTIFICATION_STORE);

    const record = await new Promise((resolve, reject) => {
      const request = store.get(notificationId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (record) {
      record.status = "dismissed";
      store.put(record);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (error) {
    console.error("[Service Worker] Failed to mark notification as dismissed:", error);
  }
}

// Notification close handler (when user dismisses without clicking)
self.addEventListener("notificationclose", (event) => {
  console.log("[Service Worker] Notification closed:", event);

  const data = event.notification.data || {};

  // Mark as read (seen but not clicked)
  if (data.notificationId) {
    event.waitUntil(markNotificationAsRead(data.notificationId));
  }
});

/**
 * Mark a notification as read in IndexedDB
 * @param {string} notificationId
 */
async function markNotificationAsRead(notificationId) {
  try {
    const db = await openNotificationDB();
    const tx = db.transaction(NOTIFICATION_STORE, "readwrite");
    const store = tx.objectStore(NOTIFICATION_STORE);

    const record = await new Promise((resolve, reject) => {
      const request = store.get(notificationId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (record && record.status === "unread") {
      record.status = "read";
      record.readAt = new Date();
      store.put(record);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (error) {
    console.error("[Service Worker] Failed to mark notification as read:", error);
  }
}

// Message handler for manual cache control
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    console.log("[Service Worker] Skip waiting requested");
    self.skipWaiting();
  }

  if (event.data?.type === "CLEAR_CACHES") {
    console.log("[Service Worker] Clear caches requested");
    caches
      .keys()
      .then((names) => {
        return Promise.all(
          names.map((name) => {
            console.log("[Service Worker] Deleting cache:", name);
            return caches.delete(name);
          })
        );
      })
      .then(() => {
        console.log("[Service Worker] All caches cleared");
        // Notify the client that caches are cleared
        if (event.source) {
          event.source.postMessage({ type: "CACHES_CLEARED" });
        }
      });
  }
});

console.log("[Service Worker] Loaded successfully");
