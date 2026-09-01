// رقيم — Service Worker
// Purpose: (1) satisfy the browser's installability requirement so
// "Add to Home Screen" / "Install app" shows up with the platform icon,
// and (2) keep the app shell (this HTML file + fonts) available briefly
// offline. Firestore/Firebase requests are always network-only — we never
// want to serve stale student data, payments, or quiz results from cache.

const CACHE_NAME = 'raqeem-shell-v1';
const APP_SHELL = ['./', './index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Never cache Firebase/Firestore/Auth or any API traffic — always live.
  const url = new URL(req.url);
  const isLiveData =
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebaseapp.com') ||
    url.hostname.includes('imgbb.com') ||
    url.hostname.includes('paypal.com');
  if (isLiveData) return;

  // Network-first for everything else, falling back to the cached app
  // shell only when the network is unavailable (offline resilience).
  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
