// Service worker for PWA offline functionality
// This is a basic service worker that caches the app shell

const CACHE_NAME = 'purseful-v1';
const urlsToCache = [
  '/',
  '/accounts',
  '/transactions',
  '/planned',
  '/categories',
  '/settings',
];

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

