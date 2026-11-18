// Service Worker: macht die App offline nutzbar.
// - Seiten: zuerst Netz, bei fehlender Verbindung aus dem Speicher
// - Programmdateien, Tondateien, Daten, Symbole: aus dem Speicher (einmal geladen = offline verfügbar)
const VERSION = "v2";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((c) => c.addAll(["/", "/icon-192.png", "/icon-512.png"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![PAGES, ASSETS].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/audio/") ||
    url.pathname.startsWith("/data/") ||
    /\.(png|ico|woff2?|ttf)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGES).then((c) => c.put("/", copy));
          return res;
        })
        .catch(() => caches.match("/")),
    );
    return;
  }

  if (isAsset(url)) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(req, { ignoreSearch: url.pathname.startsWith("/audio/") });
        if (hit) return hit;
        const res = await fetch(req);
        // Teilantworten (Range-Requests bei Audio) nicht speichern
        if (res.ok && res.status === 200) cache.put(req, res.clone());
        return res;
      }),
    );
  }
});
