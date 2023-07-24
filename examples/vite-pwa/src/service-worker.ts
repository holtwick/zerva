/// <reference lib="webworker" />

/* eslint-disable no-restricted-globals */
/* eslint-disable no-console */

// // Give TypeScript the correct global.
// declare const self: ServiceWorkerGlobalScope
// declare type ExtendableEvent = any

// This code executes in its own worker or thread

console.log('Service worker init 5')

const files = self.__WB_MANIFEST
console.log(files)

self.addEventListener('install', (event) => {
  console.log('Service worker installed')

  event.waitUntil((async () => {
    // const cache = await caches.open(CACHE_NAME)
    // // Setting {cache: 'reload'} in the new request ensures that the
    // // response isn't fulfilled from the HTTP cache; i.e., it will be
    // // from the network.
    // await cache.add(new Request(OFFLINE_URL, { cache: "reload" }))
  })(),
  )

  // Force the waiting service worker to become the active service worker.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service worker activated!')

  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported.
      // See https://developers.google.com/web/updates/2017/02/navigation-preload
      // if ("navigationPreload" in self.registration) {
      //   await self.registration.navigationPreload.enable()
      // }
    })(),
  )

  // Tell the active service worker to take control of the page immediately.
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  try {
    console.log('fetch', event.request.url)
  }
  catch (err) {
    console.error('fetch error', error)
  }
})
