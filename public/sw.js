// Service Worker for handling push notifications and PWA functionality
// VERSION will be automatically updated during build - DO NOT EDIT MANUALLY
const VERSION = '1760293289800';
const CACHE_NAME = `bharat-ai-cache-${VERSION}`;
const STATIC_CACHE = `bharat-ai-static-${VERSION}`;
const RUNTIME_CACHE = `bharat-ai-runtime-${VERSION}`;

// Cache configuration
const CACHE_STRATEGY = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxEntries: 50,
};

// Resources to cache for offline functionality
const CACHE_URLS = [
  '/',
  '/chat',
  '/setting',
  '/profile',
  '/login',
  '/logo.png',
  '/manifest.json',
  '/offline.html',
  // Add critical CSS and JS files here when needed
];

// Listen for messages from clients
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skipping waiting phase');
    self.skipWaiting();
  }
});

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version:', VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching essential resources');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('[Service Worker] Install complete, skipping waiting');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Error caching resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version:', VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Delete all old caches that don't match current VERSION
        const cacheWhitelist = [CACHE_NAME, STATIC_CACHE, RUNTIME_CACHE];
        
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete if it's a bharat-ai cache but not in whitelist
              const isBharatAiCache = cacheName.startsWith('bharat-ai-');
              const isNotInWhitelist = !cacheWhitelist.includes(cacheName);
              return isBharatAiCache && isNotInWhitelist;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Taking control of all clients');
        // Take control of all clients immediately
        return self.clients.claim();
      })
      .then(() => {
        // Notify all clients that a new version is active
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SW_ACTIVATED',
              version: VERSION,
              message: 'New version activated - please refresh'
            });
          });
        });
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Handle API requests with network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // Return a custom offline response for API calls
          return new Response(
            JSON.stringify({ error: 'You are offline. Please check your internet connection.' }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'application/json',
              }),
            }
          );
        })
    );
    return;
  }

  // Handle page requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();
            
            // Cache the response in runtime cache
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.error('[Service Worker] Runtime caching error:', error);
              });

            return response;
          })
          .catch(() => {
            // Return offline page if available in cache
            if (event.request.destination === 'document') {
              return caches.match('/') || new Response('You are offline', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain',
                }),
              });
            }
            
            throw error;
          });
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (!event.data) {
    console.log('No data in push event');
    return;
  }
  
  try {
    const data = event.data.json();
    console.log('Push data:', data);
    
    const options = {
      body: data.body || data.message,
      icon: data.icon || '/logo.png',
      badge: data.badge || '/logo.png',
      tag: 'bharat-ai-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ],
      data: {
        url: data.url || '/',
        timestamp: data.timestamp || Date.now()
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Bharat AI', options)
    );
  } catch (error) {
    console.error('Error parsing push data:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Bharat AI', {
        body: 'You have a new notification',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'bharat-ai-notification'
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data || {};
  
  if (action === 'close') {
    return;
  }
  
  // Default action or 'open' action
  const urlToOpen = data.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clients) {
          if (client.url === new URL(urlToOpen, self.location.origin).href && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no existing window found, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('Error handling notification click:', error);
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  // You can track notification close events here if needed
});