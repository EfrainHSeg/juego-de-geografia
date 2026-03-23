const CACHE = 'explora-v1';
const STATIC = [
    '/',
    '/index.html',
    '/paises.html',
    '/juegos.html',
    '/comparar.html',
    '/mapa.html',
    '/css/style.css',
    '/js/language.js',
    '/js/theme-toggle.js',
    '/js/ui/navbar.js',
    '/js/api/countries.js',
    '/js/pages/index.js',
    '/js/pages/paises.js',
    '/js/pages/juegos.js',
    '/js/pages/comparar.js',
    '/js/pages/mapa.js'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ));
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    // Cache-first para flags SVG de flagcdn.com
    if (url.hostname === 'flagcdn.com') {
        e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
            return res;
        })));
        return;
    }
    // Network-first para API de países (con fallback a caché)
    if (url.hostname === 'restcountries.com') {
        e.respondWith(fetch(e.request).then(res => {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
            return res;
        }).catch(() => caches.match(e.request)));
        return;
    }
    // Cache-first para archivos estáticos del propio sitio
    if (url.origin === location.origin) {
        e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
        return;
    }
});
