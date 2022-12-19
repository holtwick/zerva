import { unlinkSync } from 'fs'
import { Logger } from 'zeed'
import { useSqliteDatabase } from './database'

const log = Logger('test')

describe("database.spec", () => {
  it("should do common stuff", async () => {
    try { unlinkSync('test.sqlite') } catch (err) { }

    let sql: string[] = []

    const db = useSqliteDatabase('test.sqlite', {
      verbose: (s: any) => {
        log(s)
        sql.push(s)
      }
    })

    const table = db.table<{
      name: string,
      age: number
      active: boolean
    }>('test', {
      name: 'text',
      age: 'integer',
      active: 'boolean'
    })

    table.indexUnique('name')

    let newId = table.insert({
      name: 'Dirk',
      age: 49,
      active: true
    })

    expect(newId).toBe(1)

    let error = table.insert({
      name: 'Dirk',
      age: 50,
      active: false
    })

    expect(error).toBe(undefined)

    let count = table.count()

    expect(count).toBe(1)

    expect(table.get(1)).toMatchInlineSnapshot(`
      {
        "active": 1,
        "age": 49,
        "id": 1,
        "name": "Dirk",
      }
    `)

    table.upsert('name', {
      name: 'Dirk',
      age: 50,
      active: false
    })

    expect(table.get(1)).toMatchInlineSnapshot(`
      {
        "active": 0,
        "age": 50,
        "id": 1,
        "name": "Dirk",
      }
    `)

    table.indexUnique(['name', 'age'])

    table.upsert(['name', 'age'], {
      id: 1,
      name: 'Dirk',
      age: 50,
      active: true
    })

    expect(table.get(1)).toMatchInlineSnapshot(`
      {
        "active": 1,
        "age": 50,
        "id": 1,
        "name": "Dirk",
      }
    `)

    table.upsert('name', {
      name: 'Anna',
      age: 20,
      active: true
    })

    expect(table.count()).toBe(2)

    table.update(1, {
      name: "Diego",
    })

    expect(table.get(1)).toMatchInlineSnapshot(`
      {
        "active": 1,
        "age": 50,
        "id": 1,
        "name": "Diego",
      }
    `)

    expect(table.getByField('name', 'Diego')).toMatchInlineSnapshot(`
      {
        "active": 1,
        "age": 50,
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
        "active": 1,
        "age": 50,
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
        "active": 1,
        "age": 50,
        "amount": 1.23,
        "id": 1,
        "name": "Diego",
        "note": "it is working!",
      }
    `)
    expect(table.get(1)).toMatchInlineSnapshot(`
      {
        "active": 1,
        "age": 50,
        "amount": 1.23,
        "id": 1,
        "name": "Diego",
        "note": "it is working!",
      }
    `)

    //

    expect(table.all()).toMatchInlineSnapshot(`
      [
        {
          "active": 1,
          "age": 50,
          "amount": 1.23,
          "id": 1,
          "name": "Diego",
          "note": "it is working!",
        },
        {
          "active": 1,
          "age": 20,
          "amount": null,
          "id": 3,
          "name": "Anna",
          "note": null,
        },
      ]
    `)

    expect(table.findAll({
      age: 20,
      active: true,
    })).toMatchInlineSnapshot(`
      [
        {
          "active": 1,
          "age": 20,
          "amount": null,
          "id": 3,
          "name": "Anna",
          "note": null,
        },
      ]
    `)

    expect(table.findOne({
      age: 50,
      active: true,
    })).toMatchInlineSnapshot(`
      {
        "active": 1,
        "age": 50,
        "amount": 1.23,
        "id": 1,
        "name": "Diego",
        "note": "it is working!",
      }
    `)

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
          "name": "active",
          "notnull": 0,
          "pk": 0,
          "type": "numeric",
        },
        {
          "cid": 4,
          "dflt_value": null,
          "name": "amount",
          "notnull": 0,
          "pk": 0,
          "type": "REAL",
        },
        {
          "cid": 5,
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
        "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, age integer, active numeric)",
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_name ON test (name)",
        "INSERT INTO test (active, age, id, name) VALUES(1.0, 49.0, NULL, 'Dirk')",
        "INSERT INTO test (active, age, id, name) VALUES(0.0, 50.0, NULL, 'Dirk')",
        "SELECT count(id) AS count FROM test",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "INSERT INTO test (active, age, name) VALUES(0.0, 50.0, 'Dirk') ON CONFLICT(name) DO UPDATE SET active=0.0, age=50.0, name='Dirk'",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_name_age ON test (name, age)",
        "INSERT INTO test (active, age, id, name) VALUES(1.0, 50.0, 1.0, 'Dirk') ON CONFLICT(name, age) DO UPDATE SET active=1.0, age=50.0, id=1.0, name='Dirk'",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "INSERT INTO test (active, age, name) VALUES(1.0, 20.0, 'Anna') ON CONFLICT(name) DO UPDATE SET active=1.0, age=20.0, name='Anna'",
        "SELECT count(id) AS count FROM test",
        "UPDATE test SET name='Diego' WHERE id=1.0 LIMIT 1",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "SELECT * FROM test WHERE name='Diego' LIMIT 1",
        "PRAGMA table_info(test)",
        "ALTER TABLE test ADD COLUMN amount real;",
        "ALTER TABLE test ADD COLUMN note text",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "UPDATE test SET amount=1.23, note='it is working!' WHERE id=1.0 LIMIT 1",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "SELECT * FROM test ORDER BY id",
        "SELECT * FROM test WHERE active=1.0 AND age=20.0",
        "SELECT * FROM test WHERE active=1.0 AND age=50.0 LIMIT 1",
        "DELETE FROM test WHERE id =1.0 ",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "PRAGMA table_info(test)",
      ]
    `)

    unlinkSync('test.sqlite')
  })
})