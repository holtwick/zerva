import { parseCredentials } from './auth'

describe('auth.spec', () => {
  it('should auth', async () => {
    expect(parseCredentials('Basic YTpi')).toMatchInlineSnapshot(`
      {
        "password": "b",
        "user": "a",
      }
    `)
  })
})
