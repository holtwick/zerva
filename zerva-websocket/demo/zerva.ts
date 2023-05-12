import type { LoggerInterface } from 'zeed'
import { Logger } from 'zeed'
import { onStop, serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { useWebSocket } from '../src'

const log: LoggerInterface = Logger('demo')

log('demo')

useHttp()
useWebSocket()

onStop(() => {
  log('stop done')
})

void serve()
