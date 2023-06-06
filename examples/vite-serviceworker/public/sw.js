// This code executes in its own worker or thread

console.log("Service worker init")

self.addEventListener("install", event => {
  console.log("Service worker installed")
})

self.addEventListener("activate", event => {
  console.log("Service worker activated!")
})

self.addEventListener('fetch', event => {
  try {
    console.log('fetch', event.request.url)
  } catch (err) {
    console.error('fetch error', error)
  }
})