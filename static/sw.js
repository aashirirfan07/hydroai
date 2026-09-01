
/* ==========================================================================
   📶 HYDROSENTINEL AI - SERVICE WORKER (OFFLINE DISASTER PWA)
   - Cache-First for Static Assets & WebGL Libraries
   - Offline Incident Queueing & IndexedDB Sync
   ========================================================================== */

const CACHE_NAME = 'hydrosentinel-pwa-v4';
const STATIC_ASSETS = [
    '/',
    '/dashboard',
    '/report-incident',
    '/damage-assessment',
    '/analytics',
    '/satellites',
    '/static/css/style.css',
    '/static/img/hydrosentinel_logo.svg',
    '/static/js/three_terrain.js',
    '/static/js/tactile_knobs.js',
    '/static/js/spatial_sonic_engine.js',
    '/static/js/command_palette.js',
    '/static/js/weather_atmosphere_engine.js',
    '/static/js/i18n_localization.js',
    '/static/js/offline_disaster_storage.js',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// 1. Install & Precache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Precaching Disaster Assets...');
            return cache.addAll(STATIC_ASSETS).catch(err => console.warn('PWA Precache warning:', err));
        }).then(() => self.skipWaiting())
    );
});

// 2. Activate & Clean Old Caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing Old Cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Fetch with Stale-While-Revalidate & Offline Fallback
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return; // Pass POST through directly
    
    // Ignore chrome-extension requests
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // If offline and not in cache, fallback to root or cached page
                return cachedResponse;
            });

            return cachedResponse || fetchPromise;
        })
    );
});
