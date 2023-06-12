import type { LoggerInterface } from 'zeed'
import { Logger } from 'zeed'

const log: LoggerInterface = Logger('pwa')

export async function setupPWA() {
  try {
    if ('serviceWorker' in navigator) {
      // Register Service Worker file if functionality is available
      const reg = await navigator.serviceWorker.register('/sw.js')
      log('serviceWorker registered')

      // Force to look for updates
      await reg.update()
      log('serviceWorker updated')
    }
    else {
      log.info('serviceWorker not supported')
    }
  }
  catch (err) {
    log.warn('PWA setup error:', err)
  }
}
