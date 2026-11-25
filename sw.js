const CACHE_NAME = 'piraku-pwa-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Skip heavy 3D models & audio/video media so quota isn't exhausted
  if (/\.(glb|gltf|mp3|mp4|wav|ogg)$/i.test(url.pathname)) return;

  const isNavigation = req.mode === 'navigate';
  const isShellAsset =
    isNavigation ||
    url.pathname === '/' ||
    /\/(index\.html|manifest\.json)$/i.test(url.pathname) ||
    /\/assets\/(icon-192|icon-512|icon-512-maskable|apple-touch-icon)\.png$/i.test(url.pathname);

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok && isShellAsset) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => {
          if (cached) return cached;
          if (isNavigation) return caches.match('./index.html') || caches.match('./');
          return Response.error();
        })
      )
  );
});
