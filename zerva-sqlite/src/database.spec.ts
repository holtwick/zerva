import { unlinkSync } from 'fs'
import { Logger } from 'zeed'
import { useSqliteDatabase } from './database'

const log = Logger('test')

describe("database.spec", () => {
  it("should do common stuff", async () => {
    try { unlinkSync('test.sqlite') } catch (err) { }

    let sql: string[] = []

    const db = useSqliteDatabase('test.sqlite', {
      verbose: s => sql.push(s)
    })

    const table = db.table<{
      name: string,
      age: number
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

    // 

    const table2 = db.table<{
      name: string,
      amount: number
      note: string
    }>('test', {
      name: 'text',
      amount: 'real',
      note: 'string'
    })

    expect(table2.get(1)).toMatchInlineSnapshot(`
      {
        "age": 49,
        "amount": null,
        "id": 1,
        "name": "Diego",
        "note": null,
      }
    `)

    table2.update(1, {
      amount: 1.23,
      note: 'it is working!'
    })

    expect(table2.get(1)).toMatchInlineSnapshot(`
      {
        "age": 49,
        "amount": 1.23,
        "id": 1,
        "name": "Diego",
        "note": "it is working!",
      }
    `)
    expect(table.get(1)).toMatchInlineSnapshot(`
      {
        "age": 49,
        "amount": 1.23,
        "id": 1,
        "name": "Diego",
        "note": "it is working!",
      }
    `)

    //

    table.delete(1)

    expect(table.get(1)).toMatchInlineSnapshot('undefined')

    db.dispose()

    expect(sql).toMatchInlineSnapshot(`
      [
        "PRAGMA table_info(test)",
        "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, age integer)",
        "INSERT INTO test (age, id, name) VALUES(49.0, NULL, 'Dirk')",
        "SELECT * FROM test WHERE id=1.0",
        "UPDATE test SET name='Diego' WHERE id=1.0 LIMIT 1",
        "SELECT * FROM test WHERE id=1.0",
        "PRAGMA table_info(test)",
        "ALTER TABLE test ADD COLUMN amount real;",
        "ALTER TABLE test ADD COLUMN note text",
        "SELECT * FROM test WHERE id=1.0",
        "UPDATE test SET amount=1.23, note='it is working!' WHERE id=1.0 LIMIT 1",
        "SELECT * FROM test WHERE id=1.0",
        "SELECT * FROM test WHERE id=1.0",
        "DELETE FROM test WHERE id=1.0",
        "SELECT * FROM test WHERE id=1.0",
      ]
    `)

    unlinkSync('test.sqlite')
  })
})