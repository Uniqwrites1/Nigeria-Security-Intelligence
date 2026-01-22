# PWA and Notification System Implementation

## Task List

### PWA Implementation
- [x] Create public/manifest.json - PWA configuration
- [x] Create public/sw.js - Service Worker for offline support
- [x] Create hooks/usePWAInstall.ts - Install prompt management
- [x] Create components/PWAInstallPrompt.tsx - Install prompt UI component
- [x] Create components/ServiceWorkerRegistration.tsx - Service worker registration
- [x] Update app/layout.tsx - Add PWA meta and scripts

### Notification System
- [x] Create hooks/usePushNotifications.ts - Push notification management
- [x] Create hooks/useNotificationAlerts.ts - Alert system for incidents
- [x] Create components/NotificationSettings.tsx - User notification preferences
- [x] Create components/NotificationToast.tsx - In-app notification display
- [x] Create app/api/push/subscribe/route.ts - Push subscription endpoint
- [x] Create app/api/push/unsubscribe/route.ts - Push unsubscribe endpoint
- [x] Create hooks/useMediaQuery.ts - Helper hook for responsive design

### Integration
- [x] Update app/page.tsx - Integrate notifications with live feed

## Required Setup Steps

### 1. Add VAPID Keys for Push Notifications
Generate VAPID keys for server-side push notifications:

```bash
npx web-push generate-vapid-keys
```

Add the keys to your `.env.local`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### 2. Add PWA Icons
For a fully installable PWA, add icon files to `/public/icons/`:
- icon-72x72.png through icon-512x512.png
- badge-72x72.png for notification badge

See `/public/icons/README.md` for details.

### 3. Add Notification Sound (Optional)
Add an MP3 sound file to `/public/sounds/notification.mp3` for audio alerts.

### 4. Configure for Deployment
If deploying to Vercel, add the following to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    }
  ]
}
```

## Testing the PWA
1. Run `npm run dev`
2. Open http://localhost:3000
3. After 15 seconds, you should see the install prompt
4. Check DevTools > Application > Service Workers for registration
5. Test in Chrome's Lighthouse for PWA score

## Usage
- Click "Install App" button to install PWA
- Click "Notification Settings" to configure alert preferences
- Notifications appear automatically for new high-severity incidents


