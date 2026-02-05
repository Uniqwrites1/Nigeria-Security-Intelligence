# React Error #300 and Service Worker Fix Plan

## Summary of Issues

### Issue 1: Service Worker 206 Error
**Problem**: `Failed to execute 'put' on 'Cache': Partial response (status code 206) is unsupported`

**Root Cause**: The service worker is attempting to cache responses with status code 206 (Partial Content), but the Cache API only supports full responses (typically 200).

**Fix Location**: `public/sw.js` - Add status code check before caching

### Issue 2: React Error #300 (Hydration Mismatch)
**Problem**: Hydration mismatch between server and client rendering

**Root Cause**: lucide-react icons render differently on server vs client due to:
1. SVG attribute ordering differences
2. Missing hydration-safe rendering patterns

**Affected Files**:
1. `app/page.tsx` - Header icons (Shield, Sun, Moon, RefreshCw, Check, Download, ChevronDown, ChevronUp)
2. `components/incident-filters.tsx` - X icon
3. `components/stats-dashboard.tsx` - AlertTriangle, Users, MapPin, TrendingUp icons
4. `components/NotificationBell.tsx` - Bell icon
5. `components/NotificationSettings.tsx` - Settings icon (if exists)
6. `components/NotificationToast.tsx` - Icons
7. `components/PWAInstallPrompt.tsx` - Icons
8. `components/incident-feed.tsx` - Icons

---

## Fix Plan

### Phase 1: Fix Service Worker (public/sw.js)
- [ ] Add status code 200 check before `cache.put()` in all caching functions
- [ ] Modify `networkFirst`, `cacheFirst`, and `staleWhileRevalidate` functions

### Phase 2: Fix Hydration Issues
- [ ] Fix app/page.tsx - Add mounted state check for lucide-react icons
- [ ] Fix components/incident-filters.tsx - Add mounted check for X icon
- [ ] Fix components/stats-dashboard.tsx - Add mounted check for icons
- [ ] Fix components/NotificationBell.tsx - Add mounted check for Bell icon
- [ ] Fix components/NotificationSettings.tsx - Add mounted check for icons
- [ ] Fix components/NotificationToast.tsx - Add mounted check for icons
- [ ] Fix components/PWAInstallPrompt.tsx - Add mounted check for icons
- [ ] Fix components/incident-feed.tsx - Add mounted check for icons

### Phase 3: Testing
- [ ] Build the project: `npm run build`
- [ ] Start local server: `npm run start`
- [ ] Verify no 206 errors in console
- [ ] Verify no React 300 errors

---

## Implementation Details

### Service Worker Fix
```javascript
// Before
cache.put(request, response.clone());

// After
if (response.ok) {  // response.ok is true for status 200-299
  cache.put(request, response.clone());
}
```

### Hydration Fix Pattern
```javascript
// Before (causes hydration mismatch)
import { Bell } from 'lucide-react';
<Bell className="w-5 h-5" />

// After (hydration-safe)
import { Bell } from 'lucide-react';
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

{mounted && <Bell className="w-5 h-5" />}
```

