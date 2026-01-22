'use client';

import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  isPermissionGranted: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<void>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
}

export function usePushNotifications(): PushNotificationState {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check support
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);

      // Get current permission status
      const checkPermission = () => {
        setPermission(Notification.permission);
      };
      checkPermission();

      // Register service worker and get subscription
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          setRegistration(reg);
          reg.pushManager.getSubscription().then((sub) => {
            setSubscription(sub);
          });
        });
      }
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported || !registration) {
      return null;
    }

    try {
      // Request permission first
      const perm = await requestPermission();
      if (perm !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }

      // VAPID public key - in production, this should come from your server
      // Generate your own key pair using web-push generate-vapid-keys
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

      // Check if already subscribed
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        setSubscription(existingSub);
        return existingSub;
      }

      // Subscribe to push
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(newSubscription);

      // Send subscription to server
      await saveSubscriptionToServer(newSubscription);

      return newSubscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }, [isSupported, registration, requestPermission]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!subscription) {
      return;
    }

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Notify server
      await removeSubscriptionFromServer(subscription);
    } catch (error) {
      console.error('Failed to unsubscribe from push:', error);
    }
  }, [subscription]);

  const showNotification = useCallback(async (
    title: string, 
    options?: NotificationOptions
  ): Promise<void> => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    try {
      const defaultOptions: NotificationOptions = {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: false,
        ...options,
      };

      if (registration) {
        await registration.showNotification(title, defaultOptions);
      } else if ('Notification' in window) {
        new Notification(title, defaultOptions);
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }, [isSupported, permission, registration]);

  return {
    isSupported,
    isPermissionGranted: permission === 'granted',
    isSubscribed: !!subscription,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// API functions - replace with your actual backend endpoints
async function saveSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON()),
    });
  } catch (error) {
    console.error('Failed to save subscription:', error);
  }
}

async function removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
  try {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON()),
    });
  } catch (error) {
    console.error('Failed to remove subscription:', error);
  }
}

export default usePushNotifications;

