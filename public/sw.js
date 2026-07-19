self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('vintera-v1').then((cache) => {
      return cache.addAll(['/', '/login', '/manifest.json']);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});