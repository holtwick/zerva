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

useVite()

onStop(() => {
  log('stop done')
})

void serve()
