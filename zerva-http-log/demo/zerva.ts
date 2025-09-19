import type { LoggerInterface } from 'zeed'
import { serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { Logger } from 'zeed'
import { useHttpLog } from '../src'

const log: LoggerInterface = Logger('demo')

log('demo')

// eslint-disable-next-line node/prefer-global/process
process.env.HTTP_LOG_PATH = 'demo.log'

useHttp()
useHttpLog({
  rotate: 'daily',
})

void serve()
