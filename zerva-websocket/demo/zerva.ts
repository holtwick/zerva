import { onStop, serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { Logger } from 'zeed'
import type { LoggerInterface } from 'zeed'
import { useWebSocket } from '../src'

const log: LoggerInterface = Logger('demo')

log('demo')

useHttp()
useWebSocket()

onStop(() => {
  log('stop done')
})

void serve()
