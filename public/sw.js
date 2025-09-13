// Service Worker for Luli Beads PWA
const CACHE_NAME = 'luli-beads-v1';
const RUNTIME_CACHE = 'luli-beads-runtime-v1';

// Resources to cache on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // Add other critical resources
];

// API endpoints to cache with network-first strategy
const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/cart/,
  /\/api\/orders/,
];

// Static assets to cache with cache-first strategy
const STATIC_CACHE_PATTERNS = [
  /\.(?:js|css|html|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/,
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => 
            cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
          )
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // API requests - Network first, cache fallback
        if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
          return await networkFirst(request);
        }

        // App shell - Cache first
        if (url.pathname === '/' || url.pathname.startsWith('/app')) {
          return await cacheFirst(request);
        }

        // Static assets - Cache first
        if (STATIC_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
          return await cacheFirst(request);
        }

        // Everything else - Network first
        return await networkFirst(request);
      } catch (error) {
        console.error('Fetch error:', error);
        return new Response('Network error', { status: 503 });
      }
    })()
  );
});

// Network first strategy
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return await caches.match('/') || new Response('App offline', { status: 503 });
    }
    
    throw error;
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {
      // Ignore network errors for background updates
    });
    
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Process offline queue
      processOfflineQueue()
    );
  }
});

async function processOfflineQueue() {
  // Get queued actions from IndexedDB or localStorage
  // Process them when online
  console.log('Processing offline queue...');
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const options = {
    body: event.data.text(),
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Products',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Luli Beads', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});