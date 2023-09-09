// Simple demo for node and CommonJS loading

import process from 'node:process'
import { Logger, valueToInteger } from 'zeed'
import { on, serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { useCounter } from './module'

const log = Logger('app')

// console.log(process.env, ZERVA_VERSION)
// log.info(loggerStackTraceDebug)
log.info('Start...')

// useQrCode()

useHttp({
  port: valueToInteger(process.env.PORT, 8080),
})

on('counterIncrement', (counter) => {
  log.info('counter inc', counter)
})

useCounter()

on('httpInit', ({ addStatic }) => {
  addStatic('/public', 'public')
})

void serve()
