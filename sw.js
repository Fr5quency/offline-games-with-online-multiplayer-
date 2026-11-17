// Outpost Games offline cache. Bump CACHE on every release.
// Outpost and Outpost Games live on the same website (fr5quency.github.io), so they share one cache store:
// each app deletes only its own old caches. The chess engine cache is shared and kept by both.
const CACHE = "outpost-games-v11";
const ENGINE = "outpost-engine-sf18";
const ENGINE_FILES = ["./stockfish/stockfish-18-lite-single.js", "./stockfish/stockfish-18-lite-single.wasm"];
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-180.png", "./icon-512.png", "./games-more.js", "./puzzles.json", "./firebase/firebase-app-compat.js", "./firebase/firebase-auth-compat.js", "./pieces/wK.svg", "./pieces/wQ.svg", "./pieces/wR.svg", "./pieces/wB.svg", "./pieces/wN.svg", "./pieces/wP.svg", "./pieces/bK.svg", "./pieces/bQ.svg", "./pieces/bR.svg", "./pieces/bB.svg", "./pieces/bN.svg", "./pieces/bP.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: "reload" }))))
    .then(() => caches.open(ENGINE)).then(c => Promise.all(ENGINE_FILES.map(u => c.match(u).then(hit => hit || c.add(u).catch(() => {})))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => /^outpost-games-v\d+$/.test(k) && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== self.location.origin) return;   // sign-in, database and online play go straight to the network
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit =>
      hit || fetch(e.request).then(res => {
        const copy = res.clone();
        if (res.ok) caches.open(e.request.url.includes("/stockfish/") ? ENGINE : CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
