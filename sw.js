// KishansKraft Service Worker
// Provides offline functionality and caching for PWA

const CACHE_NAME = 'kishans-kraft-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/products.html',
  '/product.html',
  '/about.html',
  '/contact.html',
  '/assets/css/style.css',
  '/assets/js/site.js',
  '/assets/js/header.js',
  '/assets/js/footer.js',
  '/partials/header.html',
  '/partials/footer.html',
  '/data/products.json',
  '/manifest.json',
  // Add Google Fonts
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response before caching
            const responseToCache = response.clone();
            
            // Cache successful responses
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
            
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // For other requests, you could return a generic offline asset
            throw error;
          });
      })
  );
});

// Background sync for form submissions when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    console.log('Service Worker: Background sync for contact form');
    // Handle background sync for contact forms
    event.waitUntil(syncContactForms());
  }
});

// Push notification support
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }
  
  const options = {
    body: event.data.text(),
    icon: '/images/icon-192.png',
    badge: '/images/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('KishansKraft', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Helper function for syncing contact forms
async function syncContactForms() {
  try {
    // This would sync any pending contact form submissions
    // Implementation depends on your backend API
    console.log('Service Worker: Syncing contact forms...');
    
    // Get pending forms from IndexedDB or localStorage
    // Send to server when back online
    // Clear pending forms after successful sync
    
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Contact form sync failed', error);
    throw error;
  }
}

// Update available notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});