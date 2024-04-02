import { serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { useWebsocketRpcHub } from '@zerva/rpc'
import { useVite } from '@zerva/vite'
import { Logger } from 'zeed'

const log = Logger('service')

useHttp({ port: 8080 })

useWebsocketRpcHub()

useVite({ root: '.' })

void serve()
