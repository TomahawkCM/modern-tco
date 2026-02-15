// Basic service worker scaffold — integrate with your build (Workbox recommended)
self.addEventListener("install", (event: any) => {
  // Add precache logic here if using Workbox
  console.log("Service worker install");
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", (event: any) => {
  console.log("Service worker activate");
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (event: any) => {
  // Simple network first strategy for API calls could go here
});
