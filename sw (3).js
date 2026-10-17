// Lume service worker: caches the app shell and fonts only. It never touches the Worker, search, or any other API.
const V = 'lume-v1', SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url), font = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (u.origin !== location.origin && !font) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(x => { const c = x.clone(); caches.open(V).then(k => k.put('index.html', c)); return x; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(h => {
    const n = fetch(r).then(x => { if (x.ok) { const c = x.clone(); caches.open(V).then(k => k.put(r, c)); } return x; }).catch(() => h);
    return h || n;
  }));
});
