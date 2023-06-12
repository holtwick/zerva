import { createApp } from 'vue'
import type { LoggerInterface } from 'zeed'
import { Logger } from 'zeed'
import App from './App.vue'
import { setupPWA } from './pwa'

const log: LoggerInterface = Logger('main')

log('register')

void setupPWA()

log('app')

createApp(App).mount('#app')
