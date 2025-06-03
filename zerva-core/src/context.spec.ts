import { z } from 'zeed'
import { dumpConfig } from './config'
import { createContext, emit, on, setContext } from './context'
import { hasModule, register, registerModule, requireModules } from './register'

declare global {
  interface ZContextEvents {
    test: (x: number) => void
  }
}

describe('context', () => {
  it('should emit', () =>
    new Promise((resolve) => {
      expect.assertions(1)
      setContext()
      on('test', (x) => {
        expect(x).toBe(123)
        resolve(undefined)
      })
      void emit('test', 123)
    }))

  it('should register', () => {
    setContext()
    register('a')
    register('b', 'a')
    expect(hasModule('c')).toBe(false)
    expect(hasModule('a')).toBe(true)
    requireModules('a')
    // requireModules(["x"])
  })

  it('should register - modern', () => {
    const schema = z.object({
      host: z.string().default('localhost'),
      port: z.number().default(3000),
    })

    setContext()
    const { config: configA } = registerModule('a')
    expect(configA).toBeUndefined()
    const { config } = registerModule('b', { requires: 'a', configSchema: schema })
    expect(config.host).toBe('localhost')
    expect(hasModule('c')).toBe(false)
    expect(hasModule('a')).toBe(true)
    requireModules('a')
    // requireModules(["x"])

    expect(dumpConfig()).toMatchInlineSnapshot(`
      "#
      # Module: b
      #

      B_HOST=localhost

      B_PORT=3000
      "
    `)
  })

  it('should allow sub-context', async () => {
    setContext()
    register('a')
    expect(hasModule('a')).toBe(true)
    createContext(() => {
      expect(hasModule('a')).toBe(false)
      register('b')
      expect(hasModule('b')).toBe(true)
    })
    expect(hasModule('a')).toBe(true)
    expect(hasModule('b')).toBe(false)
  })

  it('should emit fn', () =>
    new Promise((resolve) => {
      expect.assertions(1)
      setContext()
      on({
        test(x) {
          expect(x).toBe(123)
          resolve(undefined)
        },
      })
      void emit('test', 123)
    }))
})
