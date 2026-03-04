const CACHE_NAME = 'freshcart-pwa-v1';

const PRECACHE_URLS = [
    '/',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('freshcart-pwa-') && name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then((fetchRes) => {
                // Cache successful GET requests for HTML/JS/CSS/images
                if (
                    fetchRes.status === 200 &&
                    (event.request.url.includes('/_next/') ||
                        event.request.url.match(/\.(png|jpg|jpeg|svg|css|js)$/))
                ) {
                    const responseClone = fetchRes.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return fetchRes;
            });
        })
    );
});
