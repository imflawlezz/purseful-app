const STATIC_CACHE = 'purseful-static-v2';
const RUNTIME_CACHE = 'purseful-runtime-v2';
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-192-maskable.png',
  '/icon-512.png',
  '/icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cache) => ![STATIC_CACHE, RUNTIME_CACHE].includes(cache))
          .map((cache) => caches.delete(cache))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          return cachedResponse || caches.match('/');
        })
    );
    return;
  }

  if (request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            caches
              .open(RUNTIME_CACHE)
              .then((cache) => cache.put(request, networkResponse.clone()));
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});

