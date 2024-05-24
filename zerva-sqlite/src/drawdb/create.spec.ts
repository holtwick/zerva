import { createFilesFromDrawDb } from './create'
import demo from './demo.json'

describe('create.spec', () => {
  it('should create', async () => {
    await createFilesFromDrawDb(demo as any)
  })
})
