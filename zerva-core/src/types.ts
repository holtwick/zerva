import { Emitter, uname } from "zeed"

declare global {
  interface ZContextEvents {
    close(): void
  }

  interface ZeedGlobalContext {
    zerva?: ZContext
  }
}

export class ZContext extends Emitter<ZContextEvents> {
  name: string = uname("context")
  modules: string[] = []
  // config: any
}
