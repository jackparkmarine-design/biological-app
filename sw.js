// Lab Logger offline worker. Each release changes VERSION, so iPads download the new copy
// the next time the app is opened with internet. Files are always fetched fresh from the
// website (cache: 'reload'), never from the iPad's web cache. Cache names are unique to this app
// so it can share a github.io address with Catch Logger without touching its files.
const VERSION = 'lab-logger-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('activate', e => {
  // only remove this app's old caches, never another app's
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('lab-logger-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => hit ||
      fetch(e.request).catch(() => e.request.mode === 'navigate' ? caches.match('./index.html') : undefined))
  );
});
