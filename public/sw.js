// Chrome only offers an install prompt to pages controlled by a service worker
// that handles fetch, so this exists to make the app installable.
//
// ponytail: no caching — the app is useless without the API behind mTLS
// anyway. Add a cache here if offline use of the shell is ever wanted.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);
self.addEventListener("fetch", () => {});
