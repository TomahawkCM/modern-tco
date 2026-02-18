/* eslint-disable @typescript-eslint/no-explicit-any */

// Basic service worker scaffold — integrate with your build (Workbox recommended)
// Service workers run in ServiceWorkerGlobalScope, not Window.
// Cast to any to avoid DOM vs SW type conflicts.
const sw = self as any;

sw.addEventListener("install", (event: any) => {
  // Add precache logic here if using Workbox
  console.log("Service worker install");
  event.waitUntil(sw.skipWaiting());
});
sw.addEventListener("activate", (event: any) => {
  console.log("Service worker activate");
  event.waitUntil(sw.clients.claim());
});
sw.addEventListener("fetch", (_event: any) => {
  // Simple network first strategy for API calls could go here
});
