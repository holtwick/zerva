import { createEntry, getSalt, useHtpasswd } from './htpasswd-md5'

describe('htpasswd-md5.spec', () => {
  it('should md5', async () => {
    const line = createEntry('test', '$apr1$VOKVO5UU$')
    expect(line).toEqual('$apr1$VOKVO5UU$/S8G0W5sk5YfBicxqfyqt1')
    // test:$apr1$VOKVO5UU$/S8G0W5sk5YfBicxqfyqt1

    expect(getSalt('$apr1$VOKVO5UU$/S8G0W5sk5YfBicxqfyqt1')).toMatchInlineSnapshot('"VOKVO5UU"')

    const { validate, entries } = useHtpasswd('test:$apr1$VOKVO5UU$/S8G0W5sk5YfBicxqfyqt1\n')
    expect(entries).toMatchInlineSnapshot(`
      {
        "test": "$apr1$VOKVO5UU$/S8G0W5sk5YfBicxqfyqt1",
      }
    `)

    expect(validate('test', 'test')).toBe(true)
    expect(validate('testx', 'test')).toBe(false)
    expect(validate('test', 'testx')).toBe(false)
  })
})
