export interface ZervaBuildInfo {
  version: number
  development: boolean
  production: boolean
  mode: string
  buildZervaVersion: string
  date: string
  timestamp: number
  build: boolean
  buildEsbuildVersion: string
  buildNodeVersion: string
  buildESM: boolean
}

export function getZervaBuildInfo(): ZervaBuildInfo | undefined {
  return (globalThis as any).ZERVA
}
