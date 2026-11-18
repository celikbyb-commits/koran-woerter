// Service Worker: macht die App offline nutzbar.
// - Seiten: zuerst Netz, bei fehlender Verbindung aus dem Speicher
// - Programmdateien, Tondateien, Daten, Symbole: aus dem Speicher (einmal geladen = offline verfügbar)
const VERSION = "v3";
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
    // Programmdateien haben eindeutige Namen -> einfach aus dem Speicher.
    // Tondateien und Daten können korrigiert werden -> aus dem Speicher liefern,
    // aber im Hintergrund aktualisieren (beim nächsten Mal ist die neue Fassung da).
    const refresh = url.pathname.startsWith("/audio/") || url.pathname.startsWith("/data/");
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const key = url.origin + url.pathname;
        const hit = await cache.match(key);
        const update = fetch(url.pathname)
          .then((res) => {
            // Teilantworten (Range-Requests bei Audio) nicht speichern
            if (res.ok && res.status === 200) cache.put(key, res.clone());
            return res;
          })
          .catch(() => hit);
        if (hit) {
          if (refresh) event.waitUntil(update);
          return hit;
        }
        return update;
      }),
    );
  }
});
