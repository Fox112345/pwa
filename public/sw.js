importScripts('src/js/idb.js', 'src/js/utils.js');

const STATIC_V = 'static-v3';
const DYNAMIC_V = 'dynamic-v3';
const STATIC_FILES = [
  '/',
  '/offline.html',
  'src/js/app.js',
  'src/js/feed.js',
  'src/js/idb.js',
  'src/js/material.min.js',
  'src/css/app.css',
  'src/css/feed.css',
  'src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
];

self.addEventListener('install', (e) => {
  console.log('install');
  e.waitUntil(
    caches.open(STATIC_V).then((cache) => {
      console.log('statiic caching');
      cache.addAll(STATIC_FILES);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keylist) => {
      return Promise.all(
        keylist.map((key) => {
          if (key !== STATIC_V && key !== DYNAMIC_V) {
            console.log('SW removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

const FALLBACK =
  '<div>\n' +
  '    <div>App Title</div>\n' +
  '    <div>you are offline</div>\n' +
  '    <img src="/svg/or/base64/of/your/dinosaur" alt="dinosaur"/>\n' +
  '</div>';

// Он никогда не упадет, т.к мы всегда отдаем заранее подготовленные данные.
function useFallback() {
  return Promise.resolve(
    new Response(FALLBACK, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  );
}

// self.addEventListener('fetch', (e) => {
//   e.respondWith(
//     caches.match(e.request).then((res) => {
//       if (res) return res;
//       return fetch(e.request)
//         .then((res) =>
//           caches.open(DYNAMIC_V).then((cache) => {
//             cache.put(e.request.url, res.clone());
//             return res;
//           })
//         )
//         .catch((e) =>
//           caches.open(STATIC_V).then((cache) => {
//             return cache.match('/offline.html');
//           })
//         );
//     })
//   );
// });

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener('fetch', (event) => {
  const url = 'https://pwagram-bc9da-default-rtdb.firebaseio.com/posts';
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request).then(function (res) {
        // trimCache(DYNAMIC_V, 3);
        // cache.put(event.request, res.clone());
        let resClone = res.clone();
        clearStorage('posts')
          .then(() => resClone.json())
          .then((data) => {
            for (let key in data) {
              writeData('posts', data[key]);
            }
          });

        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open(DYNAMIC_V).then(function (cache) {
                // trimCache(DYNAMIC_V, 3);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(function (err) {
              return caches.open(CACHE_STATIC_NAME).then(function (cache) {
                if (event.request.headers.get('accept').includes('text/html')) {
                  return cache.match('/offline.html');
                }
              });
            });
        }
      })
    );
  }
});

self.addEventListener('sync', (e) => {
  console.log('BG Sync', e);
  if (e.tag === 'sync-new-posts') {
    console.log('Synking new post');
    e.waitUntil(
      readAllData('sync-posts').then((data) => {
        for (let dt of data) {
          fetch(
            'https://pwagram-bc9da-default-rtdb.firebaseio.com/posts.json',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                id: dt.id,
                title: dt.title,
                location: dt.location,
                image: dt.image,
              }),
            }
          )
            .then((res) => {
              console.log('Sent data', res);
              if (res.ok) {
                deleteItemFromData('sync-posts', dt.id);
              }
            })
            .catch((e) => {
              console.log('Error while sending data', e);
            });
        }
      })
    );
  }
});
