import type { Infer, LoggerInterface, Type } from 'zeed'
import { Logger, boolean, float, int, number, object, string } from 'zeed'
import { useSqliteDatabase } from './index'

const log: LoggerInterface = Logger('schema.spec')

globalThis.TEST = true

describe('database schema', () => {
  it('use schema', async () => {
    const sql: string[] = []

    const db = useSqliteDatabase(undefined, {
      verbose: (s: any) => {
        log(s)
        sql.push(s)
      },
    })

    const schema = object({
      name: string(),
      age: int(),
      active: boolean(),
    })

    const table = db.tableWithSchema('test', schema)

    table.indexUnique('name')

    const newId = table.insert({
      name: 'Dirk',
      age: 49,
      active: true,
    })

    expect(newId).toBe(1)

    const error = table.insert({
      name: 'Dirk',
      age: 50,
      active: false,
    })

    expect(error).toBe(undefined)

    const count = table.count()

    expect(count).toBe(1)

    const row1 = table.get(1)
    const id1: number = row1!.id
    expect(id1).toBe(1)
    expect(row1).toMatchInlineSnapshot(`
      {
        "active": 1,
        "age": 49,
        "created": 0,
        "id": 1,
        "name": "Dirk",
        "updated": 0,
      }
    `)

    table.upsert('name', {
      name: 'Dirk',
      age: 50,
      active: false,
    })

    expect(table.get(1)).toMatchInlineSnapshot(`
      {
        "active": 0,
        "age": 50,
        "created": 0,
        "id": 1,
        "name": "Dirk",
        "updated": 0,
      }
    `)

    table.indexUnique(['name', 'age'])

    table.upsert(['name', 'age'], {
      id: 1,
      name: 'Dirk',
      age: 50,
      active: true,
    })

    expect(table.get(1)).toMatchInlineSnapshot(`
      {
        "active": 1,
        "age": 50,
        "created": 0,
        "id": 1,
        "name": "Dirk",
        "updated": 0,
      }
    `)

    table.upsert('name', {
      name: 'An\'na',
      age: 20,
      active: true,
    })

    expect(table.count()).toBe(2)

    table.update(1, {
      name: 'Diego',
    })

    expect(table.get(1)).toMatchInlineSnapshot(`
      {
        "active": 1,
        "age": 50,
        "created": 0,
        "id": 1,
        "name": "Diego",
        "updated": 0,
      }
    `)

    expect(table.getByField('name', 'Diego')).toMatchInlineSnapshot(`
      {
        "active": 1,
        "age": 50,
        "created": 0,
        "id": 1,
        "name": "Diego",
        "updated": 0,
      }
    `)

    //

    const table2 = db.tableWithSchema('test', object({
      name: string(),
      amount: float(),
      note: string(),
    }))

    expect(table2.get(1)).toMatchInlineSnapshot(`
      {
        "active": 1,
        "age": 50,
        "amount": null,
        "created": 0,
        "id": 1,
        "name": "Diego",
        "note": null,
        "updated": 0,
      }
    `)

    table2.update(1, {
      amount: 1.23,
      note: 'it is working!',
    })

    expect(table2.get(1)).toMatchInlineSnapshot(`
      {
        "active": 1,
        "age": 50,
        "amount": 1.23,
        "created": 0,
        "id": 1,
        "name": "Diego",
        "note": "it is working!",
        "updated": 0,
      }
    `)
    expect(table.get(1)).toMatchInlineSnapshot(`
      {
        "active": 1,
        "age": 50,
        "amount": 1.23,
        "created": 0,
        "id": 1,
        "name": "Diego",
        "note": "it is working!",
        "updated": 0,
      }
    `)

    //

    expect(table.query(`select max(age) as oldest from ${table.name} where id > ?`, 0)).toMatchInlineSnapshot(`
      [
        {
          "oldest": 50,
        },
      ]
    `)

    expect(table.findAll()).toMatchInlineSnapshot(`
      [
        {
          "active": 1,
          "age": 50,
          "amount": 1.23,
          "created": 0,
          "id": 1,
          "name": "Diego",
          "note": "it is working!",
          "updated": 0,
        },
        {
          "active": 1,
          "age": 20,
          "amount": null,
          "created": 0,
          "id": 3,
          "name": "An'na",
          "note": null,
          "updated": 0,
        },
      ]
    `)

    expect(table.findAll({
      conditions: {
        age: 20,
        active: true,
      },
      orderBy: ['id desc', 'created'],
    })).toMatchInlineSnapshot(`
      [
        {
          "active": 1,
          "age": 20,
          "amount": null,
          "created": 0,
          "id": 3,
          "name": "An'na",
          "note": null,
          "updated": 0,
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
        "created": 0,
        "id": 1,
        "name": "Diego",
        "note": "it is working!",
        "updated": 0,
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
          "type": "INTEGER",
        },
        {
          "cid": 4,
          "dflt_value": null,
          "name": "updated",
          "notnull": 0,
          "pk": 0,
          "type": "INTEGER",
        },
        {
          "cid": 5,
          "dflt_value": null,
          "name": "created",
          "notnull": 0,
          "pk": 0,
          "type": "INTEGER",
        },
        {
          "cid": 6,
          "dflt_value": null,
          "name": "amount",
          "notnull": 0,
          "pk": 0,
          "type": "REAL",
        },
        {
          "cid": 7,
          "dflt_value": null,
          "name": "note",
          "notnull": 0,
          "pk": 0,
          "type": "TEXT",
        },
      ]
    `)

    const sqlDump = db.dump()

    expect(sqlDump).toMatchInlineSnapshot(`
      "CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, age integer, active integer, updated integer, created integer, amount real, note text);
      INSERT INTO test (id, name, age, active, updated, created, amount, note) VALUES(3, 'An''na', 20, 1, 0, 0, NULL, NULL);
      CREATE UNIQUE INDEX idx_test_name ON test (name);
      CREATE UNIQUE INDEX idx_test_name_age ON test (name, age)"
    `)

    // let x = `
    // PRAGMA foreign_keys=OFF;
    // BEGIN TRANSACTION;
    // CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, age integer, active numeric, amount real, note text);
    // INSERT INTO test VALUES(3,'An''na',20,1,NULL,NULL);
    // DELETE FROM sqlite_sequence;
    // INSERT INTO sqlite_sequence VALUES('test',3);
    // CREATE UNIQUE INDEX idx_name ON test (name);
    // CREATE UNIQUE INDEX idx_name_age ON test (name, age);
    // COMMIT;`

    db.dispose.sync()

    expect(sql).toMatchInlineSnapshot(`
      [
        "PRAGMA table_info(test)",
        "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, age integer, active integer, updated integer, created integer)",
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_test_name ON test (name)",
        "INSERT INTO test (created, updated, active, age, id, name) VALUES(0.0, 0.0, 1.0, 49.0, NULL, 'Dirk')",
        "INSERT INTO test (created, updated, active, age, id, name) VALUES(0.0, 0.0, 0.0, 50.0, NULL, 'Dirk')",
        "SELECT count(id) AS count FROM test",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "INSERT INTO test (created, updated, active, age, name) VALUES(0.0, 0.0, 0.0, 50.0, 'Dirk') ON CONFLICT(name) DO UPDATE SET updated=0.0, active=0.0, age=50.0, name='Dirk'",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_test_name_age ON test (name, age)",
        "INSERT INTO test (created, updated, active, age, id, name) VALUES(0.0, 0.0, 1.0, 50.0, 1.0, 'Dirk') ON CONFLICT(name, age) DO UPDATE SET updated=0.0, active=1.0, age=50.0, id=1.0, name='Dirk'",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "INSERT INTO test (created, updated, active, age, name) VALUES(0.0, 0.0, 1.0, 20.0, 'An''na') ON CONFLICT(name) DO UPDATE SET updated=0.0, active=1.0, age=20.0, name='An''na'",
        "SELECT count(id) AS count FROM test",
        "UPDATE test SET updated=0.0, name='Diego' WHERE id=1.0 LIMIT 1",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "SELECT * FROM test WHERE name='Diego' LIMIT 1",
        "PRAGMA table_info(test)",
        "ALTER TABLE test ADD COLUMN amount real;",
        "ALTER TABLE test ADD COLUMN note text",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "UPDATE test SET updated=0.0, amount=1.23, note='it is working!' WHERE id=1.0 LIMIT 1",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "select max(age) as oldest from test where id > 0.0",
        "SELECT * FROM test",
        "SELECT * FROM test WHERE active=1.0 AND age=20.0 ORDER BY id desc, created",
        "SELECT * FROM test WHERE active=1.0 AND age=50.0 LIMIT 1",
        "DELETE FROM test WHERE id=1.0",
        "SELECT * FROM test WHERE id=1.0 LIMIT 1",
        "PRAGMA table_info(test)",
        "SELECT name, type, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%'",
        "SELECT * FROM test LIMIT 100",
      ]
    `)
  })

  it('table example', async () => {
    function tableWithSchema<O extends Type<any>, T = Infer<O>>(tableName: string, schema: O) {
      const obj = schema._object
      if (!obj)
        throw new Error('object schema required')

      const fields = {}
      for (const [key, type] of Object.entries(obj)) {
        fields[key] = /* mapTypeToField[type.type] ?? */ type._props?.fieldType ?? 'text'
      }

      return fields
    }

    const r = tableWithSchema('hello', object({ name: string() }))
    expect(r).toMatchInlineSnapshot(`
      {
        "name": "text",
      }
    `)
  })
})
