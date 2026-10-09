// Network-first: always fetch the latest when online (updates are automatic); fall back to cache offline.
const CACHE = 'flawedhero-v0.3.3';
const SHELL = ['./', 'index.html', 'login.html', 'soon.html', 'profile.html', 'queue.html', 'settings.html', 'about.html', 'install.html', 'admin.html', 'contacts.html', 'cabinet.html', 'js/medals.js', 'js/charities.js', 'mycharities.html', 'network.html', 'diary.html', 'board.html', 'movement.html', 'shop.html', 'sponsors.html', 'notifications.html', 'js/push.js',
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

// Push: payload is JSON {title, body, url, badge}
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.title || 'Flawed Hero', { body: d.body || '', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: d.url || './' } }),
    (async () => { try { if (self.navigator && self.navigator.setAppBadge && d.badge) await self.navigator.setAppBadge(d.badge); } catch (err) {} })()
  ]));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    const w = ws.find(c => c.url.startsWith(self.registration.scope));
    return w ? w.navigate(url).then(c => (c || w).focus()) : clients.openWindow(url);
  }));
});
