import { Emitter, uname } from 'zeed'

declare global {
  interface ZContextEvents {
    close: () => void
  }

  interface ZeedGlobalContext {
    zerva?: ZContext
  }

  const ZERVA_DEVELOPMENT: boolean
  const ZERVA_PRODUCTION: boolean
  const ZERVA_VERSION: string
}

export class ZContext extends Emitter<ZContextEvents> {
  name: string = uname('context')
  modules: string[] = []
  // config: any
}
