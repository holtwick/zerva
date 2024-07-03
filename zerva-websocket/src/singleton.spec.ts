import { useSingletonFlag } from './singleton'

describe('singleton.spec', () => {
  it('should only once', async () => {
    const dispose = useSingletonFlag('test')
    dispose()
  })
})
