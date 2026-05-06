# Progressive Web App (PWA) Support

KinTree now supports Progressive Web App functionality, allowing users to install the app on their devices and use it offline.

## What's Been Added

### 1. **Service Worker** (`client/public/service-worker.js`)
   - Handles offline functionality with cache-first strategy for static assets
   - Network-first strategy for API calls
   - Automatic cache management and cleanup

### 2. **Manifest File** (`client/public/manifest.json`)
   - Updated with app metadata, colors, and display modes
   - Includes app icons and screenshots configuration
   - Configured for standalone display mode

### 3. **Service Worker Registration** (`client/src/serviceWorkerRegistration.js`)
   - Manages service worker lifecycle
   - Handles updates and offline scenarios
   - Environment-aware registration (production only)

### 4. **PWA Install Hook** (`client/src/hooks/usePWAInstall.js`)
   - Custom React hook to handle install prompts
   - Allows showing/dismissing install dialog

### 5. **HTML Meta Tags** (`client/public/index.html`)
   - Added iOS PWA support meta tags
   - Added theme color and viewport configuration
   - Improved mobile web app experience

## Features

### Offline Support
- Static assets (HTML, CSS, JS) are cached on first visit
- API calls remain network-first but fallback to cache if offline
- Users can view cached content when offline

### Install Prompt
- Automatic install prompt on compatible browsers
- Optional custom install button in your app

### Caching Strategy
- **Cache-First**: Static assets (JS, CSS, images)
- **Network-First**: API calls (with cache fallback)
- **Stale-While-Revalidate**: Background updates

## How to Use

### Basic Usage (Already Configured)
The service worker is automatically registered in `client/src/index.js`. No additional setup is needed.

### Custom Install Prompt (Optional)
To add a custom install button in your component:

```javascript
import { usePWAInstall } from '../hooks/usePWAInstall';

function YourComponent() {
  const { isPromptVisible, showInstallPrompt, dismissPrompt } = usePWAInstall();

  return (
    isPromptVisible && (
      <div className="install-prompt">
        <p>Install KinTree to get quick access to your family tree!</p>
        <button onClick={showInstallPrompt}>Install App</button>
        <button onClick={dismissPrompt}>Not Now</button>
      </div>
    )
  );
}
```

## Building for Production

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Serve over HTTPS:**
   Service workers require HTTPS in production (localhost works for development)

3. **Test PWA Features:**
   - Use Chrome DevTools → Application → Service Workers
   - Use Chrome DevTools → Application → Manifest
   - Use Chrome DevTools → Network → check "Offline"

## Browser Support

- **Chrome/Edge**: Full support including install prompt
- **Firefox**: Full support excluding install prompt
- **Safari**: Limited support (iOS 13.4+)
- **Mobile browsers**: Varies by vendor

## Cache Versioning

When deploying updates:
1. Update `CACHE_NAME` in `client/public/service-worker.js` (e.g., 'kintree-v2')
2. Service workers will detect the update and notify users
3. Users will see "New content available; please refresh" message

## Configuration

### Changing Cache Name
Edit `client/public/service-worker.js`:
```javascript
const CACHE_NAME = 'kintree-v1'; // Increment for new version
```

### Modifying Cache Strategy
Adjust URLs in `client/public/service-worker.js`:
```javascript
if (event.request.url.includes('/api/') || 
    event.request.url.includes('your-api-host')) {
  // Network-first strategy
}
```

### Updating Manifest
Edit `client/public/manifest.json` to change:
- App name and short name
- Theme colors
- Display mode
- App icons and screenshots

## Troubleshooting

### Service Worker Not Registering
- Ensure you're on HTTPS (or localhost)
- Check browser console for errors
- Verify `service-worker.js` is accessible at `<domain>/service-worker.js`

### Cache Issues
- Open DevTools → Application → Clear all data
- Increment `CACHE_NAME` version in service worker
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Install Prompt Not Showing
- Must be on HTTPS (except localhost)
- App must be installable (manifest.json requirements met)
- Chrome requires at least 30 seconds of user engagement
- Try in Chrome DevTools → Application → Add to home screen

## Next Steps

### Recommended Enhancements
1. **Generate App Icons**: Create 192x192 and 512x512 pixel icons
   - Update paths in `manifest.json`

2. **Add Offline Page**: Create an offline fallback page
   - Modify service worker fetch handler

3. **Update Check**: Show update notifications when new version available
   - Use `usePWAInstall` hook patterns

4. **Background Sync**: Sync user changes when back online
   - Implement Background Sync API in service worker

5. **Web App Shortcuts**: Add shortcuts for common tasks
   - Configure in `manifest.json` shortcuts field

## Resources

- [MDN Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Google PWA Checklist](https://developers.google.com/web/progressive-web-apps/checklist)
- [WebDevDocs: PWA](https://web.dev/progressive-web-apps/)
