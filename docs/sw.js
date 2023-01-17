self.addEventListener('install', (e) => {
  console.log('Installing...', e);
});

self.addEventListener('activate', (e) => {
  console.log('Activating...', e);
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  console.log('fetch...', e);
  e.respondWith(fetch(e.request));
});
