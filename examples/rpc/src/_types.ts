export interface RpcClientFunctions {
  updateCounter: (count: number) => void
}

export interface RpcServerFunctions {
  helloIAmNew: (id: string) => number
}
