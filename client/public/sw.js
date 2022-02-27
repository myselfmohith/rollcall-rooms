// Service Worker Version 0.1
const CACHE_NAME = "ROLLCALL V2";

const assets = []

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                cache.addAll(assets);
            })
    )
})

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            );
        })
    )
})

self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            try {
                return await fetch(event.request);
            } catch (err) {
                try {
                    return await caches.match(event.request);
                } catch {
                    return err;
                }
            }
        })()
    )
})