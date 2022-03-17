console.log('running sw')
const assets = [
    '/',
    '/index.html',
    '/src/sw-register.js',
    '/src/main.js',
    '/icon512x512.png',
    '/favicon.ico',
    '/apple-touch-icon.png',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/safari-pinned-tab.svg',
    '/manifest.json',
    '/sw.js'
]
const staticCache = 'assets'
const dynamicAsset = 'dynamicAssets'

const onInstall = (event) => {
    console.log('service worker installed', event)
    event.waitUntil(
        caches.open(staticCache).then(function(cache) {
            console.log('cache shell assets', event, assets)
            return cache.addAll(assets);
        })
    );
};
const onActivate = (event) => {
    console.log('service worker activated', event)
}
const onFetch = (event) => {

    console.log('service worker fetch', event)
    event.respondWith(
        caches.match(event.request).then(cacheRes => {
            return cacheRes || fetch(event.request).then(fetchRes => {
                return caches.open(dynamicAsset).then(cache => {
                    cache.put(evt.request.url, fetchRes.clone())
                    return fetchRes
                })
            })
        })
    )
}
self.addEventListener('install', onInstall)
self.addEventListener('activate', onActivate)
self.addEventListener('fetch', onFetch)