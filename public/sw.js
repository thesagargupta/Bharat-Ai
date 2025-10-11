// Service Worker for handling push notifications and PWA functionality
const CACHE_NAME = 'bharat-ai-v1';
const STATIC_CACHE = 'bharat-ai-static-v1';

// Resources to cache for offline functionality
const CACHE_URLS = [
  '/',
  '/chat',
  '/setting',
  '/profile',
  '/login',
  '/logo.png',
  '/manifest.json',
  // Add critical CSS and JS files here when needed
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching essential resources');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        self.skipWaiting();
      })
      .catch((error) => {
        console.error('Error caching resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE;
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        return self.clients.claim();
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
            
            // Cache the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
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