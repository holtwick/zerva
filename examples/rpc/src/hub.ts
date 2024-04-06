import { useWebsocketRpcHubClient } from '@zerva/rpc'
import { ref } from 'vue'
import type { RpcClientFunctions, RpcServerFunctions } from './_types'

const { rpcHub } = useWebsocketRpcHubClient(undefined, { log: 0 })

export const counter = ref(-1)

export const rpc = rpcHub<RpcClientFunctions, RpcServerFunctions>({
  updateCounter(count: number) {
    counter.value = count
  },
})
