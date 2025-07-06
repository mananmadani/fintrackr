const CACHE_NAME = 'fintrackr-cache-v1';
const urlsToCache = [
  '/fintrackr/',
  '/fintrackr/index.html',
  '/fintrackr/style.css',
  '/fintrackr/app.js',
  '/fintrackr/manifest.json',
  '/fintrackr/fintrackr.png'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
