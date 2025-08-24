/* eslint-disable vars-on-top */
import type { ZervaModuleContext } from './register'
import { Emitter, uname } from 'zeed'

declare global {
  var ZERVA_DEVELOPMENT: boolean
  var ZERVA_PRODUCTION: boolean
  var ZERVA_VERSION: string
}

declare global {
  interface ZContextEvents {
    close: () => void
  }

  interface ZeedGlobalContext {
    zerva?: ZContext
  }
}

export class ZContext extends Emitter<ZContextEvents> {
  name: string = uname('context')
  modules: string[] = []
  eventNamesEmitted: Record<string, boolean> = {}
  uses: Record<string, ZervaModuleContext<any>> = {}
  // config: any
}
