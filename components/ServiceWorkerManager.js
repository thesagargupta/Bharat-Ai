"use client";
import { useEffect, useState } from 'react';
import { successToast, warningToast } from '../lib/toast';

export default function ServiceWorkerManager() {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    // Only run in browser and if service workers are supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Function to handle service worker updates
    const handleServiceWorkerUpdate = (registration) => {
      if (registration.waiting) {
        console.log('[SW Manager] New version available, waiting to activate');
        setWaitingWorker(registration.waiting);
        setShowReload(true);
        
        // Show notification to user
        warningToast('New version available! Click to update.', {
          duration: 10000,
          onClick: () => reloadPage(),
        });
      }
    };

    // Function to register service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none', // Don't use HTTP cache for SW updates
        });

        console.log('[SW Manager] Service Worker registered:', registration);

        // Check for updates immediately
        registration.update();

        // Check for updates when page regains focus
        const checkForUpdates = () => {
          console.log('[SW Manager] Checking for updates...');
          registration.update();
        };

        window.addEventListener('focus', checkForUpdates);

        // Check for updates every 60 seconds
        const updateInterval = setInterval(() => {
          registration.update();
        }, 60000);

        // Listen for waiting service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[SW Manager] Update found, new worker installing');

          newWorker.addEventListener('statechange', () => {
            console.log('[SW Manager] Worker state changed to:', newWorker.state);
            
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker installed and waiting
              handleServiceWorkerUpdate(registration);
            }
          });
        });

        // Check if there's already a waiting worker
        if (registration.waiting) {
          handleServiceWorkerUpdate(registration);
        }

        // Cleanup
        return () => {
          window.removeEventListener('focus', checkForUpdates);
          clearInterval(updateInterval);
        };
      } catch (error) {
        console.error('[SW Manager] Service Worker registration failed:', error);
      }
    };

    // Listen for messages from service worker
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'SW_ACTIVATED') {
        console.log('[SW Manager] New service worker activated:', event.data.version);
        
        // Show success message
        successToast('App updated to latest version!');
        
        // Auto-reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Handle controller change (when new SW takes over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW Manager] Controller changed, reloading page...');
      window.location.reload();
    });

    // Register the service worker
    registerServiceWorker();

    // Cleanup
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // Function to reload page with new service worker
  const reloadPage = () => {
    if (waitingWorker) {
      console.log('[SW Manager] Activating waiting worker and reloading');
      
      // Tell the waiting worker to skip waiting and take control
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      setShowReload(false);
    } else {
      // If no waiting worker, just reload
      window.location.reload();
    }
  };

  // Listen for skip waiting message
  useEffect(() => {
    if (!waitingWorker) return;

    const handleStateChange = () => {
      if (waitingWorker.state === 'activated') {
        console.log('[SW Manager] Waiting worker activated, reloading...');
        window.location.reload();
      }
    };

    waitingWorker.addEventListener('statechange', handleStateChange);

    return () => {
      waitingWorker.removeEventListener('statechange', handleStateChange);
    };
  }, [waitingWorker]);

  // This component doesn't render anything visible
  return null;
}
