// Service worker for Scanner Agent PWA
// Minimal implementation — required for "Install app" eligibility on Android Chrome.
// Caches the app shell so the UI loads even with a flaky connection.
// API calls (to your Cloudflare Worker) always go to the network.

const CACHE_VERSION = 'scanner-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // Pre-cache best-effort — don't fail install if some files aren't reachable yet
      return Promise.all(
        APP_SHELL.map((url) =>
          cache.add(url).catch(() => {
            console.warn('[sw] failed to cache', url);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept API calls — always go to network
  if (
    url.hostname.endsWith('workers.dev') ||
    url.hostname.includes('api.') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('groq.com') ||
    url.hostname.includes('anthropic.com')
  ) {
    return; // browser handles normally
  }

  // Network-first for HTML so updates apply quickly
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first for static assets (icons, css, scripts)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((res) => {
          if (res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(event.request, copy));
          }
          return res;
        })
      );
    })
  );
});
