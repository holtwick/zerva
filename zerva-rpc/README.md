# 🌱 Zerva useWebSocketRpcHub

**This is a side project of [Zerva](https://github.com/holtwick/zerva)**

A reliable way to realize function calls between client and server via web sockets. It is taken care of the infrastucture so you can focus on the functionality.

First step should be to create a shared definition of functions on the server side and the client side. Example:

```ts
// functions.ts
export interface RpcClientFunctions {
  updateCounter: (count: number) => void
}

export interface RpcServerFunctions {
  helloIAmNew: (id: string) => number
}
```

On the server side initialize the zerva module and then listen for `rpcConnect` like this:

```ts
// server.ts

useWebsocketRpcHub()

let clientCounter = 1
on('rpcConnect', async ({ rpcHub, dispose }) => {
  const rpc = rpcHub<RpcServerFunctions, RpcClientFunctions>({
    helloIAmNew(id) {
      log.info('New client with user agent:', id)
      return clientCounter++
    },
  })

  let counter = 0

  dispose.interval(() => {
    rpc.updateCounter(counter++)
  }, 1000)
})
```

On the client side almost the same but vice-versa:

```ts
// client.ts

import { useWebsocketRpcHubClient } from '@zerva/rpc'
import { ref } from 'vue'
import type { RpcClientFunctions, RpcServerFunctions } from './_types'

const { rpcHub } = useWebsocketRpcHubClient()

export const counter = ref(-1)

export const rpc = rpcHub<RpcClientFunctions, RpcServerFunctions>({
  updateCounter(count: number) {
    counter.value = count
  },
})
```

On both ends use your custom `rpc` to call functions as defined, await results if desired.

This RPC implementation is designed as a "hub" i.e. you can use the same connection to create multiple `rpc` definitions and implementations. That becomes handy if you are doing plugin like development.
