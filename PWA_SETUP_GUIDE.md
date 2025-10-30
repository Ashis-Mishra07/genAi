# 📱 PWA Setup Guide - Artisan Marketplace

## ✅ What's Been Configured

Your app is now a **Progressive Web App (PWA)** with full mobile support!

### Features Implemented:

1. ✅ **Service Worker** - Offline support and caching
2. ✅ **Web App Manifest** - Install to home screen
3. ✅ **Responsive Design** - Mobile-first CSS utilities
4. ✅ **Touch-Friendly UI** - 44px minimum tap targets
5. ✅ **Safe Area Support** - Notch and bottom bar handling
6. ✅ **Install Prompt** - Smart install banner
7. ✅ **Offline Page** - Graceful offline experience
8. ✅ **Mobile Navigation** - Bottom tab bar for mobile
9. ✅ **Push Notifications** - Ready for notifications
10. ✅ **Background Sync** - Sync data when back online

---

## 🚀 Quick Start

### 1. Generate PWA Icons

```bash
npm run pwa:icons
```

This creates placeholder icons. For production, replace with actual designs.

### 2. Test PWA Locally

```bash
npm run build
npm start
```

Then open: `http://localhost:3000`

### 3. Test on Mobile Device

1. Find your local IP:
   ```bash
   ipconfig  # Windows
   ```

2. Access from mobile: `http://YOUR_IP:3000`

3. Look for "Add to Home Screen" prompt

---

## 📱 PWA Features

### Service Worker (`public/sw.js`)

Handles:
- **Offline caching** - Pages work without internet
- **Runtime caching** - Smart caching strategies
- **Background sync** - Sync when connection restored
- **Push notifications** - Receive updates

### Web Manifest (`public/manifest.json`)

Defines:
- App name and description
- Icons for all sizes
- Theme colors
- Display mode (standalone)
- Shortcuts for quick actions

### Responsive CSS (`app/globals.css`)

Includes:
- Mobile-first utilities
- Touch-friendly spacing
- Safe area support (notches)
- Responsive text sizes
- Glass morphism effects
- Loading skeletons

---

## 🎨 Customization

### Update App Colors

Edit `public/manifest.json`:

```json
{
  "theme_color": "#f97316",
  "background_color": "#0f172a"
}
```

### Update App Name

Edit `public/manifest.json`:

```json
{
  "name": "Your App Name",
  "short_name": "Short Name"
}
```

### Create Custom Icons

1. Design a 512x512px icon
2. Use a tool to generate all sizes:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/
3. Replace files in `public/icons/`

### Add Shortcuts

Edit `public/manifest.json`:

```json
{
  "shortcuts": [
    {
      "name": "New Order",
      "url": "/customer/orders/new",
      "icons": [{ "src": "/icons/icon-96x96.png", "sizes": "96x96" }]
    }
  ]
}
```

---

## 📲 Mobile Components

### Mobile Navigation

Already integrated in customer and artisan layouts:

```tsx
import MobileNav from '@/components/MobileNav';

<MobileNav role="customer" />
```

### PWA Install Prompt

Automatically shows after 30 seconds:

```tsx
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

<PWAInstallPrompt />
```

### PWA Registration

Auto-registers service worker:

```tsx
import PWARegister from '@/components/PWARegister';

<PWARegister />
```

---

## 🧪 Testing PWA

### Chrome DevTools

1. Open DevTools (F12)
2. Go to **Application** tab
3. Check:
   - Manifest
   - Service Workers
   - Cache Storage
   - Offline mode

### Lighthouse Audit

1. Open DevTools
2. Go to **Lighthouse** tab
3. Select **Progressive Web App**
4. Click **Generate report**

Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
- PWA: 100

### Mobile Testing

**Android:**
1. Open Chrome on Android
2. Visit your site
3. Tap menu → "Add to Home Screen"
4. Test offline mode

**iOS:**
1. Open Safari on iOS
2. Visit your site
3. Tap Share → "Add to Home Screen"
4. Test offline mode

---

## 🔧 Advanced Configuration

### Enable Push Notifications

1. Get VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```

2. Add to `.env`:
   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   ```

3. Implement in `app/api/notifications/subscribe/route.ts`

### Background Sync

Already configured in service worker. To use:

```typescript
// Register sync
if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-orders');
}
```

### Offline Data Storage

Use IndexedDB for offline data:

```typescript
// Install Dexie.js
npm install dexie

// Create database
import Dexie from 'dexie';

const db = new Dexie('ArtisanMarketplace');
db.version(1).stores({
  products: 'id, name, price',
  orders: 'id, status, date'
});
```

---

## 📊 Performance Optimization

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/product.jpg"
  alt="Product"
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

### Code Splitting

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});
```

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./Component'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

PWA features work automatically on Vercel.

### Netlify

Add `netlify.toml`:

```toml
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"
```

### Custom Server

Ensure these headers:

```javascript
// Service Worker
res.setHeader('Service-Worker-Allowed', '/');
res.setHeader('Cache-Control', 'no-cache');

// Manifest
res.setHeader('Content-Type', 'application/manifest+json');
```

---

## ✅ PWA Checklist

Before going live:

- [ ] Replace placeholder icons with real designs
- [ ] Test on multiple devices (Android, iOS)
- [ ] Run Lighthouse audit (score 90+)
- [ ] Test offline functionality
- [ ] Configure push notifications
- [ ] Add app screenshots to manifest
- [ ] Test install prompt
- [ ] Verify safe area handling
- [ ] Test on slow 3G network
- [ ] Check accessibility (screen readers)
- [ ] Test landscape orientation
- [ ] Verify touch targets (44px minimum)
- [ ] Test with VoiceOver/TalkBack
- [ ] Check color contrast ratios
- [ ] Test keyboard navigation

---

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox (Advanced SW)](https://developers.google.com/web/tools/workbox)
- [PWA Builder](https://www.pwabuilder.com/)

---

## 🆘 Troubleshooting

### Service Worker Not Registering

- Check browser console for errors
- Ensure HTTPS (or localhost)
- Clear browser cache
- Check `sw.js` is accessible

### Install Prompt Not Showing

- Must be HTTPS
- Must have valid manifest
- Must have service worker
- User must visit site twice
- 5-minute gap between visits

### Icons Not Displaying

- Check icon paths in manifest
- Ensure icons exist in `public/icons/`
- Use PNG format (not SVG)
- Check icon sizes match manifest

### Offline Mode Not Working

- Check service worker is active
- Verify cache strategy
- Check network tab in DevTools
- Test with "Offline" mode enabled

---

**Your app is now a fully-featured PWA!** 🎉

Test it on mobile devices and enjoy the native app experience.
