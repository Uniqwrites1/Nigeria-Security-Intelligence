'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isPromptActive: boolean;
  promptEvent: BeforeInstallPromptEvent | null;
  dismissPrompt: () => void;
  triggerInstall: () => Promise<boolean>;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isPromptActive, setIsPromptActive] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isStandalone2 = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isStandalone2);
    };

    checkInstalled();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Store the event for manual triggering, but don't prevent default
      // This allows the browser's automatic prompt to show

      // Check if user has already dismissed or installed
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed) {
        const dismissedDate = new Date(dismissed);
        const now = new Date();
        const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

        // Only show again after 7 days
        if (daysSinceDismissed < 7) {
          return;
        }
      }

      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setIsPromptActive(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setIsPromptActive(false);
      setDeferredPrompt(null);
      
      // Clean up storage
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', checkInstalled);
    };
  }, []);

  const dismissPrompt = useCallback(() => {
    setIsPromptActive(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    
    // Keep the deferred prompt for potential later use
    // but don't show the UI
  }, []);

  const triggerInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setIsPromptActive(false);
        setDeferredPrompt(null);
        localStorage.removeItem('pwa-install-dismissed');
        return true;
      } else {
        // User dismissed the prompt
        dismissPrompt();
        return false;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }, [deferredPrompt, dismissPrompt]);

  return {
    isInstallable,
    isInstalled,
    isPromptActive,
    promptEvent: deferredPrompt,
    dismissPrompt,
    triggerInstall,
    deferredPrompt,
  };
}

// Custom hook for PWA update available
export function usePWAUpdate() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setNeedsUpdate(true);
              }
            });
          }
        });
      });

      // Check for updates periodically
      const interval = setInterval(() => {
        navigator.serviceWorker.ready.then((reg) => {
          reg.update();
        });
      }, 60 * 60 * 1000); // Every hour

      return () => clearInterval(interval);
    }
  }, []);

  const update = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  return { needsUpdate, update };
}

export default usePWAInstall;

