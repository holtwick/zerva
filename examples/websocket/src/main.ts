import { Logger } from 'zeed'

import { createApp } from 'vue'
import App from './App.vue'

const log = Logger('main')

log('app starts')

createApp(App).mount('#app')
