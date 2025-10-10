import type { LoggerInterface } from 'zeed'
import { onStop, serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { Logger } from 'zeed'
import { useVite } from '../src'

const log: LoggerInterface = Logger('demo')

log('demo')

useHttp({
  port: 3000,
  openBrowser: true,
})

useVite({
  root: './demo/www',
  www: './demo/www',
  // hmr: true,
  injectHead: `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 20px; }
      h1 { color: #42b983; }
    </style>
  `,
})

onStop(() => {
  log('stop done')
})

void serve()
