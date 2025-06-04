import { z } from 'zeed'
import { dumpConfig } from './config'
import { setContext } from './context'
import { hasModule, registerModule, requireModules, use } from './register'

const schema = z.object({
  host: z.string().default('localhost'),
  port: z.number().default(3000),
})

describe('register', () => {
  it('should register - modern', () => {
    setContext()

    const { config: configA } = registerModule('a')
    expect(configA).toEqual({})

    const { config } = registerModule('b', {
      requires: 'a',
      configSchema: schema,
      options: { host: 'holtwick.de', port: 8080 },
    })
    expect(config.host).toBe('localhost')
    expect(config.port).toBe(3000)
    expect(hasModule('c')).toBe(false)
    expect(hasModule('a')).toBe(true)

    requireModules('a')
    // requireModules(["x"])

    expect(dumpConfig()).toMatchInlineSnapshot(`
      "#
      # Module: a
      #

      #
      # Module: b
      #

      B_HOST=localhost

      B_PORT=3000
      "
    `)
  })

  it('should register - use', async () => {
    setContext()

    const useA = use({
      name: 'a',
      setup: () => {
        return {}
      }
    })

    const useB = use({
      name: 'b',
      requires: 'a',
      configSchema: schema,
      setup: async ({ config }) => {
        return { config }
      }
    })


    useA()

    const { config } = await useB({
      host: 'holtwick.de',
      port: 8080
    })

    expect(config.host).toBe('localhost')
    expect(config.port).toBe(3000)
    expect(hasModule('c')).toBe(false)
    expect(hasModule('a')).toBe(true)

    requireModules('a')
    // requireModules(["x"])

    expect(dumpConfig()).toMatchInlineSnapshot(`
      "#
      # Module: a
      #

      #
      # Module: b
      #

      B_HOST=localhost

      B_PORT=3000
      "
    `)
  })
})
