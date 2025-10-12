# 🗑️ Cache Clearing Guide - Bharat AI

## Current Situation

Your service worker has been updated with a new version: **1760293289800**

This new version will automatically clear old caches when deployed. However, if you're experiencing caching issues locally or on deployment, follow these steps:

---

## 🚀 For Deployment (Vercel)

### Option 1: Automatic (Recommended)
Just push your code and Vercel will handle everything:

```bash
git add .
git commit -m "Update: Centered toasts, removed italic, new cache version"
git push origin main
```

**What happens automatically:**
1. ✅ Vercel runs `prebuild` script
2. ✅ New version timestamp injected
3. ✅ App builds with new cache names
4. ✅ Old caches deleted automatically
5. ✅ Users get fresh content

### Option 2: Force New Deployment
If automatic push doesn't trigger:

```bash
# Trigger empty commit to force rebuild
git commit --allow-empty -m "Force rebuild - clear cache"
git push origin main
```

---

## 💻 For Local Development

### Method 1: Clear Browser Cache (Quick)

#### Chrome/Edge:
1. Open DevTools (F12)
2. Right-click on reload button
3. Select **"Empty Cache and Hard Reload"**
4. Or use: `Ctrl + Shift + Delete` → Clear browsing data

#### Firefox:
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable Cache"
4. Reload page
5. Or use: `Ctrl + Shift + Delete`

### Method 2: Unregister Service Worker (Recommended)

#### In Chrome/Edge/Firefox:
1. Open DevTools (F12)
2. Go to **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. Click **Service Workers** in left sidebar
4. Find your service worker
5. Click **"Unregister"**
6. Go to **Cache Storage**
7. Right-click each cache → **Delete**
8. Close and reopen browser
9. Visit `http://localhost:3000`

### Method 3: Use Incognito/Private Mode
```bash
# Start dev server
npm run dev

# Open in incognito mode
# Chrome: Ctrl + Shift + N
# Firefox: Ctrl + Shift + P
# Visit: http://localhost:3000
```

### Method 4: Clear All Site Data
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **"Clear site data"** button
4. Confirm and reload

---

## 🌐 For Users (After Deployment)

### Automatic Cache Clear (Built-in)
Users will see a toast notification:
```
🔔 "New version available! Click to update."
```

When they click:
1. ✅ Page reloads
2. ✅ Old cache deleted
3. ✅ New content loaded
4. ✅ Success message shown

### Manual Clear (If Needed)
Tell users to:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh page (`Ctrl + F5`)

---

## 🛠️ Advanced: Force Cache Reset

### Create a Cache Buster Script

Create `scripts/clear-cache.js`:
```javascript
const fs = require('fs');
const path = require('path');

// Force new version
const VERSION = Date.now().toString();
const SW_PATH = path.join(__dirname, '..', 'public', 'sw.js');

console.log('🗑️ Clearing cache with new version:', VERSION);

let swContent = fs.readFileSync(SW_PATH, 'utf8');
swContent = swContent.replace(/const VERSION = '.*';/, `const VERSION = '${VERSION}';`);
fs.writeFileSync(SW_PATH, swContent, 'utf8');

console.log('✅ New version injected!');
```

Run it:
```bash
node scripts/clear-cache.js
npm run build
```

### Add to package.json:
```json
{
  "scripts": {
    "clear-cache": "node scripts/clear-cache.js && npm run build",
    "force-deploy": "node scripts/inject-version.js && git add . && git commit -m 'Force cache clear' && git push"
  }
}
```

---

## 🔍 Verify Cache is Cleared

### Check in Browser Console:
After deployment, open DevTools console and look for:

```javascript
// Should see new version
[Service Worker] Installing version: 1760293289800
[Service Worker] Deleting old cache: bharat-ai-cache-1760292654228
[Service Worker] Activating version: 1760293289800
```

### Check Cache Storage:
1. DevTools → Application → Cache Storage
2. Should only see caches with new version:
   - `bharat-ai-cache-1760293289800`
   - `bharat-ai-static-1760293289800`
   - `bharat-ai-runtime-1760293289800`

### Check Service Worker:
1. DevTools → Application → Service Workers
2. Should show: "Status: activated"
3. Version should be latest timestamp

---

## 🚨 Troubleshooting

### Problem: Old Cache Still Present

**Solution 1: Hard Reload**
```
Chrome/Edge: Ctrl + Shift + R
Firefox: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Solution 2: Clear All**
```bash
# DevTools → Application → Clear site data
# Then close browser completely
# Reopen and visit site
```

**Solution 3: Different Browser**
Test in a fresh browser or incognito mode to confirm it works.

### Problem: Service Worker Not Updating

**Check 1: HTTP vs HTTPS**
Service workers require HTTPS (or localhost)

**Check 2: Scope**
Ensure service worker scope is `/`:
```javascript
navigator.serviceWorker.register('/sw.js', { scope: '/' })
```

**Check 3: Cache Headers**
In `next.config.mjs`:
```javascript
{
  source: '/sw.js',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }
  ]
}
```

### Problem: Changes Not Appearing

**Solution:**
1. Run version injection:
   ```bash
   node scripts/inject-version.js
   ```

2. Build fresh:
   ```bash
   npm run build
   ```

3. Clear browser data completely

4. Visit site in incognito

5. If still not working, check Network tab for 304 responses

---

## 📋 Quick Reference

### Local Development:
```bash
# Clear and rebuild
node scripts/inject-version.js
npm run dev

# In browser: Ctrl + Shift + R (hard reload)
```

### For Deployment:
```bash
# Auto-clear on Vercel
git add .
git commit -m "Clear cache - new version"
git push origin main

# Vercel handles the rest automatically
```

### Emergency Cache Clear:
```bash
# Nuclear option
1. Unregister service worker in DevTools
2. Delete all caches in DevTools
3. Clear browsing data (Ctrl + Shift + Delete)
4. Close browser completely
5. Reopen and visit site
```

---

## ✅ Best Practices

1. **Always run prebuild before deployment:**
   ```bash
   npm run build  # prebuild runs automatically
   ```

2. **Test in incognito first:**
   - Ensures no cached data interferes
   - Confirms changes work for new users

3. **Check console logs:**
   - Look for version numbers in logs
   - Verify old caches are deleted

4. **Use versioned deployments:**
   - Each deploy gets unique timestamp
   - Old caches auto-deleted

5. **Don't edit VERSION manually:**
   - Let the build script handle it
   - Always starts with `BUILD_TIMESTAMP`

---

## 📊 Current Version Status

**Version:** 1760293289800
**Generated:** 2025-01-12 (Just now)
**Status:** ✅ Ready for deployment

**Cache Names:**
- `bharat-ai-cache-1760293289800`
- `bharat-ai-static-1760293289800`
- `bharat-ai-runtime-1760293289800`

**Previous Versions:** Will be auto-deleted on activation

---

## 🎯 Summary

To clear cache and deploy new version:

```bash
# 1. Version already injected (done)
# 2. Commit and push
git add .
git commit -m "Update: New version with centered toasts"
git push origin main

# 3. Vercel deploys automatically
# 4. Users get update notification
# 5. Old caches cleared automatically
```

**That's it!** The system handles cache clearing automatically. 🎉

---

Made with ❤️ for Bharat AI
Version: 1760293289800
