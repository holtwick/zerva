/* eslint-disable node/prefer-global/process */
import type { LoggerInterface } from 'zeed'
import { serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { Logger } from 'zeed'
import { useHttpLog } from '../src'

const log: LoggerInterface = Logger('demo')

log('demo')

process.env.HTTP_LOG = 'demo.log' // fail
process.env.HTTP_LOG_PATH = 'demo.log'

useHttp()
useHttpLog({
  rotate: 'daily',
})

void serve()
