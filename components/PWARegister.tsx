'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration);

            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute
          })
          .catch((error) => {
            console.log('SW registration failed:', error);
          });
      });

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated');
        // Optionally show a notification to the user
        if (confirm('New version available! Reload to update?')) {
          window.location.reload();
        }
      });
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      // Don't request immediately, wait for user interaction
      setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          console.log('Notification permission:', permission);
        });
      }, 10000);
    }

    // Handle online/offline status
    const handleOnline = () => {
      console.log('App is online');
      // Optionally show a notification
    };

    const handleOffline = () => {
      console.log('App is offline');
      // Optionally show a notification
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
}
