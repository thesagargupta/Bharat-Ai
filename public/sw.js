// Service Worker for handling push notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
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