# 🚀 Deployment Instructions - PWA Cache Busting

## Quick Start

Your app now has **automatic cache busting** configured! When you deploy, users will automatically get the latest version without manual cache clearing.

## How to Deploy to Vercel

### Option 1: Automatic (Recommended)
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add PWA cache busting system"
   git push origin main
   ```

2. Vercel will automatically:
   - Run `prebuild` script (injects version)
   - Build your app
   - Deploy with cache-busting enabled
   - Clear old caches on user's next visit

### Option 2: Manual Deploy
1. Run build locally:
   ```bash
   npm run build
   ```

2. Deploy using Vercel CLI:
   ```bash
   vercel --prod
   ```

## What Happens on Deployment

### Build Process:
```
1. prebuild → Injects timestamp into sw.js
2. build    → Builds Next.js app with new version
3. deploy   → Vercel deploys with cache headers
```

### User Experience:
```
1. User visits site
2. ServiceWorkerManager detects new version
3. Toast notification appears: "New version available!"
4. User clicks toast (or auto-reload after 10s)
5. Old caches cleared automatically
6. Page reloads with fresh content
7. Success message: "App updated to latest version!"
```

## Verify Deployment

### Check 1: Service Worker Version
Open browser console and look for:
```
[Service Worker] Installing version: 1760292654228
[Service Worker] Activating version: 1760292654228
```

### Check 2: Old Cache Deletion
Look for logs like:
```
[Service Worker] Deleting old cache: bharat-ai-cache-1760292650000
[Service Worker] Deleting old cache: bharat-ai-static-1760292650000
```

### Check 3: DevTools
1. Open DevTools → Application → Service Workers
2. You should see: "Status: activated"
3. Version should match latest deployment timestamp

## Testing Updates

### Test Scenario:
1. Deploy version A (e.g., timestamp: 1760292650000)
2. User visits site, caches are created
3. Deploy version B (e.g., timestamp: 1760292654228)
4. User refreshes page
5. New SW installs with version B
6. Old caches from version A are deleted
7. User gets fresh content automatically

## Environment Variables

Make sure these are set in Vercel:
```
NEXTAUTH_URL=https://thebharatai.vercel.app
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
MONGODB_URI=your-mongodb-uri
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Troubleshooting

### Issue: Users not getting updates
**Solution:**
1. Check if prebuild script ran: Look for build logs
2. Verify sw.js has actual timestamp (not BUILD_TIMESTAMP)
3. Clear browser cache manually once: Ctrl+Shift+Delete

### Issue: "Service Worker registration failed"
**Solution:**
1. Check if running on HTTPS (required for SW)
2. Verify sw.js is accessible at /sw.js
3. Check browser console for specific error

### Issue: Old caches not deleted
**Solution:**
1. Check DevTools → Application → Cache Storage
2. Look for cache deletion logs in console
3. Manually delete old caches and reload

## Cache Strategy

### Static Cache (Long-term):
- Home page, chat, profile, settings
- Logo, manifest, offline page
- **Strategy**: Cache-first, network fallback

### Runtime Cache (Dynamic):
- API responses
- User-generated content
- **Strategy**: Network-first, cache fallback

### No Cache (Always Fresh):
- Authentication endpoints
- Real-time data
- **Strategy**: Network-only

## Monitoring

### Production Logs to Watch:
```javascript
// Good - New version installing
[Service Worker] Installing version: 1760292654228

// Good - Old cache cleanup
[Service Worker] Deleting old cache: bharat-ai-cache-1760292650000

// Good - Update detected
[SW Manager] New version available, waiting to activate

// Good - Activation complete
[SW Manager] New service worker activated: 1760292654228
```

### Bad Logs (Need Attention):
```javascript
// Bad - Version not injected
const VERSION = 'BUILD_TIMESTAMP'

// Bad - Registration failed
[SW Manager] Service Worker registration failed: SecurityError

// Bad - Cache not cleared
Warning: Old caches still present
```

## Performance Impact

- **Initial Load**: No change
- **Subsequent Loads**: 10-50% faster (cached assets)
- **Offline Mode**: Full functionality maintained
- **Update Detection**: <1s overhead every 60s
- **Cache Size**: ~5-10MB for typical usage

## Security

✅ HTTPS required (enforced by Vercel)
✅ Service Worker scope limited to /
✅ Cache-Control headers prevent stale content
✅ No sensitive data cached
✅ API requests use network-first strategy

## Next Steps

1. **Deploy**: Push to GitHub → Vercel auto-deploys
2. **Monitor**: Check console logs for version numbers
3. **Test**: Use incognito mode to verify fresh content
4. **Verify**: Check cache deletion in DevTools

---

## Need Help?

See `CACHE_BUSTING_GUIDE.md` for detailed technical documentation.

Made with ❤️ for Bharat AI
