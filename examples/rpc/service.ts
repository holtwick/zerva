import { on, serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { useWebsocketRpcHub } from '@zerva/rpc'
import { useVite } from '@zerva/vite'
import { Logger } from 'zeed'
import type { RpcClientFunctions, RpcServerFunctions } from './src/_types'

const log = Logger('service')

useHttp({ port: 8080 })

useVite({ root: '.' })

useWebsocketRpcHub({ log: 0 })

let clientCounter = 1
on('rpcConnect', async ({ rpcHub, dispose }) => {
  const rpc = rpcHub<RpcServerFunctions, RpcClientFunctions>({
    helloIAmNew(id) {
      log.info('New client with user agent:', id)
      // await sleep(10000)
      return clientCounter++
    },
  })

  let counter = 0

  dispose.interval(() => {
    rpc.updateCounter(counter++)
  }, 2500)
})

void serve()
