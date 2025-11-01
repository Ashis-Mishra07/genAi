// Empty service worker - prevents 404 errors
// This project doesn't use PWA features currently
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
