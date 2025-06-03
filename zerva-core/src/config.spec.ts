import { z } from 'zeed'
import { getConfig } from './config'

const schema = z.object({
  host: z.string().default('localhost'),
  port: z.number().default(3000),
})

describe('config', () => {
  it('should get config', async () => {
    const config = getConfig(schema)
    expect(config).toMatchInlineSnapshot(`
      {
        "host": "localhost",
        "port": 3000,
      }
    `)
  })
})
