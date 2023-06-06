import { createApp } from 'vue'
import type { LoggerInterface } from 'zeed'
import { Logger } from 'zeed'
import App from './App.vue'

const log: LoggerInterface = Logger('main')

log('register')

// Register Service Worker file if functionality is available
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((reg) => {
      log('serviceWorker registered')

      // Force to look for updates
      reg.update()
        .then(r => log('serviceWorker updated'))
        .catch(err => log.error('serviceWorker update failed', err))
    })
    .catch(err => log.error('serviceWorker registration failed', err))
}
else {
  log.info('serviceWorker not supported')
}

log('app')

createApp(App).mount('#app')
