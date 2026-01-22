'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[SW] Service Worker registered successfully:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  console.log('[SW] New content available, refresh needed');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[SW] Service Worker registration failed:', error);
        });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[SW] Message received:', event.data);
        
        if (event.data.type === 'SKIP_WAITING') {
          // Force refresh to get new service worker
          window.location.reload();
        }
      });

      // Check for updates periodically
      const checkForUpdates = () => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      };

      // Check for updates every hour
      const updateInterval = setInterval(checkForUpdates, 60 * 60 * 1000);

      // Clean up on unmount
      return () => {
        clearInterval(updateInterval);
      };
    }
  }, []);

  return null;
}

export default ServiceWorkerRegistration;

