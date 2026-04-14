// Rezeptretter Service Worker v1
// Caching strategy: Cache-First for static, Network-First for pages/API

const CACHE_NAME = "rezeptretter-v1";
const STATIC_CACHE = "rezeptretter-static-v1";

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install: pre-cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Claim all clients immediately
  self.clients.claim();
});

// Fetch: routing strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith("http")) return;

  // API requests & Supabase: Network-only (don't cache auth/data)
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase")
  ) {
    return;
  }

  // Next.js static assets (_next/static): Cache-First
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Icons, images, fonts: Cache-First
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages: Network-First with offline fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Everything else: Network-First
  event.respondWith(networkFirst(request));
});

// Cache-First strategy
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

// Network-First strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Offline fallback for HTML requests
    if (request.headers.get("accept")?.includes("text/html")) {
      return new Response(
        `<!DOCTYPE html>
        <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Offline – Rezeptretter</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex; align-items: center; justify-content: center;
              min-height: 100vh; margin: 0;
              background: #fdf9f3; color: #974400;
              text-align: center; padding: 2rem;
            }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
            p { color: #666; max-width: 300px; }
            .icon { font-size: 3rem; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div>
            <div class="icon">📡</div>
            <h1>Du bist offline</h1>
            <p>Rezeptretter benötigt eine Internetverbindung. Bereits besuchte Rezepte sind eventuell im Cache verfügbar.</p>
          </div>
        </body>
        </html>`,
        {
          status: 503,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    return new Response("Offline", { status: 503 });
  }
}

// Push notification handler (future use)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/favicon-32.png",
      vibrate: [100, 50, 100],
      data: {
        url: data.url || "/rezepte",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/rezepte";
  event.waitUntil(clients.openWindow(url));
});
