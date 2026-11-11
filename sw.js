/* The Aligned service worker: caches the whole app so it runs offline. */
const CACHE = "aligned-6d54cc8b32";
const ASSETS = [
  "./",
  "./app.js",
  "./data.js",
  "./fonts/instrument-sans-latin-400-normal.woff2",
  "./fonts/instrument-sans-latin-500-normal.woff2",
  "./fonts/instrument-sans-latin-600-normal.woff2",
  "./fonts/instrument-sans-latin-700-normal.woff2",
  "./fonts/playfair-display-latin-500-italic.woff2",
  "./fonts/playfair-display-latin-500-normal.woff2",
  "./fonts/playfair-display-latin-700-normal.woff2",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-64.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/logo-lockup.jpg",
  "./icons/mark.png",
  "./icons/maskable-512.png",
  "./index.html",
  "./manifest.webmanifest",
  "./styles.css",
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("aligned-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(caches.match("./index.html").then(hit => hit || fetch(req)).catch(() => caches.match("./")));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
