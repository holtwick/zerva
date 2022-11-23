import { unlinkSync } from 'fs'
import { Logger } from 'zeed'
import { useSqliteDatabase } from './database'

const log = Logger('test')

describe("database.spec", () => {
  it("should do common stuff", async () => {
    try { unlinkSync('test.sqlite') } catch (err) { }

    let sql: string[] = []

    const db = useSqliteDatabase('test.sqlite', {
      verbose: (s: any) => sql.push(s)
    })

    const table = db.table<{
      name: string,
      age: number
    }>('test', {
      name: 'text',
      age: 'integer',
    })

    table.index('name')

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

    expect(table.getByField('name', 'Diego')).toMatchInlineSnapshot(`
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

    expect(table.info()).toMatchInlineSnapshot(`
      [
        {
          "cid": 0,
          "dflt_value": null,
          "name": "id",
          "notnull": 0,
          "pk": 1,
          "type": "INTEGER",
        },
        {
          "cid": 1,
          "dflt_value": null,
          "name": "name",
          "notnull": 0,
          "pk": 0,
          "type": "TEXT",
        },
        {
          "cid": 2,
          "dflt_value": null,
          "name": "age",
          "notnull": 0,
          "pk": 0,
          "type": "INTEGER",
        },
        {
          "cid": 3,
          "dflt_value": null,
          "name": "amount",
          "notnull": 0,
          "pk": 0,
          "type": "REAL",
        },
        {
          "cid": 4,
          "dflt_value": null,
          "name": "note",
          "notnull": 0,
          "pk": 0,
          "type": "TEXT",
        },
      ]
    `)

    db.dispose()

    expect(sql).toMatchInlineSnapshot(`
      [
        "PRAGMA table_info(test)",
        "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, age integer)",
        "CREATE INDEX IF NOT EXISTS idx_name ON test(name)",
        "INSERT INTO test (age, id, name) VALUES(49.0, NULL, 'Dirk')",
        "SELECT * FROM test WHERE id=1.0",
        "UPDATE test SET name='Diego' WHERE id=1.0 LIMIT 1",
        "SELECT * FROM test WHERE id=1.0",
        "SELECT * FROM test WHERE name='Diego'",
        "PRAGMA table_info(test)",
        "ALTER TABLE test ADD COLUMN amount real;",
        "ALTER TABLE test ADD COLUMN note text",
        "SELECT * FROM test WHERE id=1.0",
        "UPDATE test SET amount=1.23, note='it is working!' WHERE id=1.0 LIMIT 1",
        "SELECT * FROM test WHERE id=1.0",
        "SELECT * FROM test WHERE id=1.0",
        "DELETE FROM test WHERE id=1.0",
        "SELECT * FROM test WHERE id=1.0",
        "PRAGMA table_info(test)",
      ]
    `)

    unlinkSync('test.sqlite')
  })
})