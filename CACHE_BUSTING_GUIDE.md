# PWA Cache Busting System

## Overview
This system automatically clears old caches when you deploy a new version of the app, ensuring users always get the latest updates.

## How It Works

### 1. **Build-Time Version Injection**
- During `npm run build`, a script (`scripts/inject-version.js`) runs automatically
- It generates a unique version number based on the current timestamp
- The version is injected into `public/sw.js`, replacing `BUILD_TIMESTAMP`

### 2. **Service Worker Cache Management**
- Each deployment creates new cache names with the version number:
  - `bharat-ai-cache-{VERSION}`
  - `bharat-ai-static-{VERSION}`
  - `bharat-ai-runtime-{VERSION}`
- When the service worker activates, it automatically deletes all old caches

### 3. **Client-Side Update Detection**
- `ServiceWorkerManager` component runs on every page
- It checks for service worker updates every 60 seconds
- When a new version is detected:
  - Shows a toast notification to the user
  - Optionally auto-reloads the page
  - Clears old caches automatically

### 4. **Immediate Activation**
- New service workers use `skipWaiting()` to activate immediately
- Old service workers are replaced without requiring manual refresh
- Users get the latest version as soon as they visit the site

## Deployment Instructions

### For Vercel (Automatic)
1. Push your code to GitHub
2. Vercel will automatically:
   - Run `npm run prebuild` (injects version)
   - Run `npm run build` (builds the app)
   - Deploy with proper cache headers

### For Manual Deployment
1. Run `npm run build` (version is automatically injected)
2. Deploy the `.next` folder and `public` folder
3. Ensure your hosting sets these headers:
   ```
   /sw.js: Cache-Control: public, max-age=0, must-revalidate
   /manifest.json: Cache-Control: public, max-age=0, must-revalidate
   ```

## Configuration Files

### `package.json`
```json
{
  "scripts": {
    "prebuild": "node scripts/inject-version.js",
    "build": "next build --turbopack",
    "postbuild": "echo 'Build complete with cache-busting enabled!'"
  }
}
```

### `vercel.json`
Sets proper cache headers for service worker and manifest files.

### `next.config.mjs`
Configures Next.js to serve service worker with correct headers.

## User Experience

### When New Version is Deployed:
1. User visits the site
2. ServiceWorkerManager detects the new version
3. User sees: "New version available! Click to update."
4. User clicks the toast (or it auto-reloads after 10 seconds)
5. Old caches are cleared automatically
6. Page reloads with fresh content
7. User sees: "App updated to latest version!"

### What Gets Cached:
- **Static Cache**: Essential pages and assets for offline use
  - Home page, chat page, profile, settings, login
  - Logo, manifest, offline page
  
- **Runtime Cache**: Dynamically loaded content
  - API responses (network-first strategy)
  - Images and media (cache-first strategy)

## Testing

### Test Cache Busting Locally:
1. Run `npm run dev`
2. Open DevTools → Application → Service Workers
3. Make a change to any file
4. Run `npm run build`
5. Check the service worker version in console logs

### Test in Production:
1. Deploy to Vercel
2. Visit https://thebharatai.vercel.app
3. Open DevTools → Console
4. Look for logs: `[Service Worker] Installing version: {timestamp}`
5. Deploy a new version
6. Refresh the page
7. You should see: `[Service Worker] Deleting old cache: bharat-ai-cache-{old-version}`

## Troubleshooting

### Users Not Getting Updates?
1. Check if `prebuild` script ran during deployment
2. Verify `sw.js` has actual timestamp instead of `BUILD_TIMESTAMP`
3. Check browser DevTools → Application → Service Workers
4. Look for "Update on reload" checkbox (should be unchecked)

### Caches Not Being Cleared?
1. Check console logs for cache deletion messages
2. Verify cache names include version number
3. Check if `self.skipWaiting()` is being called
4. Verify `self.clients.claim()` is working

### Service Worker Not Updating?
1. Check cache headers in Network tab (should be `max-age=0`)
2. Try unregistering old service worker manually
3. Clear all site data and reload
4. Check if registration scope is correct (`/`)

## Benefits

✅ **No Manual Cache Clearing**: Users never need to manually clear cache
✅ **Instant Updates**: New versions activate immediately
✅ **Automatic Cleanup**: Old caches are deleted automatically
✅ **User Notifications**: Users are informed about updates
✅ **Zero Configuration**: Works automatically on every deployment
✅ **Version Tracking**: Each deployment has unique version number
✅ **Offline Support**: Still works offline with cached content

## Files Modified

- `public/sw.js` - Service worker with version-based caching
- `components/ServiceWorkerManager.js` - Client-side update manager
- `src/app/layout.js` - Added ServiceWorkerManager component
- `scripts/inject-version.js` - Build-time version injection
- `package.json` - Added prebuild script
- `vercel.json` - Cache headers configuration
- `next.config.mjs` - Service worker headers

## Monitoring

Check these logs in production:
```
[Service Worker] Installing version: {timestamp}
[Service Worker] Activating version: {timestamp}
[Service Worker] Deleting old cache: bharat-ai-cache-{old-version}
[SW Manager] New version available, waiting to activate
[SW Manager] Waiting worker activated, reloading...
```

---

Made with ❤️ for Bharat AI
Last Updated: 2025-01-12
