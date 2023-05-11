// <reference path="node_modules/zerva-module-template/dist/esm/index.d.ts" />

// Simple demo for node and CommonJS loading

import { on, serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { useSocketIO } from '@zerva/socketio'
import { Logger, valueToInteger } from 'zeed'

const log = Logger('app')

useHttp({
  port: valueToInteger(process.env.PORT, 8080),
})

on('socketIOConnect', (conn) => {
  log.info('connection opened', conn)
})

on('socketIODisconnect', (conn) => {
  log.info('connection closed', conn)
})

useSocketIO({})

serve()
