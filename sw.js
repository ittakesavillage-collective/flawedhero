// Network-first: always fetch the latest when online (updates are automatic); fall back to cache offline.
const CACHE = 'flawedhero-v0.1.9';
const SHELL = ['./', 'index.html', 'login.html', 'soon.html', 'profile.html', 'queue.html', 'settings.html', 'about.html', 'install.html', 'admin.html', 'contacts.html', 'cabinet.html', 'js/medals.js',
  'css/app.css', 'js/data.js', 'js/db.js', 'icons/icon-192.png', 'assets/splash.jpg', 'assets/collective-logo.webp'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-store' })
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
