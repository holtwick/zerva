import { unlinkSync } from 'fs'
import { Logger } from 'zeed'
import { useSqliteDatabase } from './database'

const log = Logger('test')

describe("database.spec", () => {
  it("should do common stuff", async () => {
    try { unlinkSync('test.sqlite') } catch (err) { }

    const db = useSqliteDatabase('test.sqlite')

    const table = db.table<{
      name:string,
      age: Number
    }>('test', {
      name: 'text',
      age: 'integer',
    })

    table.insert({
      name: 'Dirk',
      age: 49,
    })

    expect(table.get(1)).toMatchInlineSnapshot(`
      {
        "age": 49,
        "id": 1,
        "name": "Dirk",
      }
    `)

    table.update(1, {
      name: "Diego",
    })

    expect(table.get(1)).toMatchInlineSnapshot(`
      {
        "age": 49,
        "id": 1,
        "name": "Diego",
      }
    `)

    table.delete(1)

    expect(table.get(1)).toMatchInlineSnapshot('undefined')

    db.dispose()
    unlinkSync('test.sqlite')
  })
})