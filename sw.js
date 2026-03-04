// Mera Adhikar Service Worker v2 - Full PWABuilder Compatible
const CACHE_NAME = 'mera-adhikar-v2';
const ASSETS = [
  '/mera-adhikar/',
  '/mera-adhikar/index.html',
  '/mera-adhikar/manifest.json',
  '/mera-adhikar/icon-48.png',
  '/mera-adhikar/icon-72.png',
  '/mera-adhikar/icon-96.png',
  '/mera-adhikar/icon-128.png',
  '/mera-adhikar/icon-144.png',
  '/mera-adhikar/icon-152.png',
  '/mera-adhikar/icon-192.png',
  '/mera-adhikar/icon-256.png',
  '/mera-adhikar/icon-512.png'
];

// Install
self.addEventListener('install', e => {
  console.log('[SW] Installing Mera Adhikar v2...');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(ASSETS.map(url => cache.add(url)));
    }).then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', e => {
  console.log('[SW] Activating...');
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== CACHE_NAME)
        .map(k => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch - Cache First, Network Fallback
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => {
        return caches.match('/mera-adhikar/index.html');
      });
    })
  );
});

// Background Sync
self.addEventListener('sync', e => {
  console.log('[SW] Background sync:', e.tag);
});

// Push Notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Mera Adhikar', {
      body: data.body || 'Know your rights!',
      icon: '/mera-adhikar/icon-192.png',
      badge: '/mera-adhikar/icon-96.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/mera-adhikar/' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url));
});
