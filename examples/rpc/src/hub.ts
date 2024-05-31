import { useWebsocketRpcHubClient } from '@zerva/rpc'
import { ref } from 'vue'
import type { RpcClientFunctions, RpcServerFunctions } from './_types'

export function useAppRpc() {
  const { rpcHub } = useWebsocketRpcHubClient(undefined, { log: 0 })

  const counter = ref(-1)

  const rpc = rpcHub<RpcClientFunctions, RpcServerFunctions>({
    updateCounter(count: number) {
      counter.value = count
    },
  })

  return { counter, rpc }
}
