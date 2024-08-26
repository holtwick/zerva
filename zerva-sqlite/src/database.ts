import type { Infer, Type } from 'zeed'
import { useDispose } from 'zeed'
import type { SqliteDatabase, SqliteOptions } from './sqlite'
import { BetterSqlite3 } from './sqlite'
import type { SqliteTableColsDefinition } from './table'
import { escapeSQLValueSingleQuotes, useSqliteTable } from './table'
import { useSqliteTable2 } from './table2'

export function useSqliteDatabase(name?: string, opt: SqliteOptions = {}) {
  const dispose: any = useDispose()

  if (name == null)
    name = ':memory:'

  else if (!name.includes('.') && name !== ':memory:')
    name += '.sqlite'

  // https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
  const db: SqliteDatabase = new BetterSqlite3(name, opt)
  dispose.add(() => db.close())

  function transaction(fn: (...args: any[]) => any) {
    return db.transaction(fn) as any
  }

  function table<T>(tableName: string, fields: SqliteTableColsDefinition<T>) {
    return useSqliteTable<T>(db, tableName, fields)
  }

  // function tableFromSchema<T>(schema: Type<T>): SqliteTableColsDefinition<T> {
  //   const info = {}
  //   log.assert(schema._object, 'object required')
  //   for (const [key, type] of Object.entries(schema._object)) {
  //     info[key] = mapTypeToField[type.type] ?? type._props?.fieldType ?? 'text'
  //   }
  //   return info as any
  // }

  function tableWithSchema<O extends Type<any>, T = Infer<O>>(tableName: string, schema: O) {
    return useSqliteTable2(db, tableName, schema)
  }

  // todo: implement with yield and stream
  /** Similar to `.dump` in SQLite CLI */
  function dump() {
    const statements: string[] = []

    function add(statement: string) {
      statements.push(String(statement))
    }

    const tables = db.prepare('SELECT name, type, sql FROM sqlite_master WHERE name NOT LIKE \'sqlite_%\'').all()
    for (const tableDefinition of tables) {
      add(tableDefinition.sql)

      if (tableDefinition.type === 'table') {
        const values = db.prepare(`SELECT * FROM ${tableDefinition.name} LIMIT 100`).all()
        const sortedFields = Object.keys(values[0] ?? {})
        for (const row of values)
          add(`INSERT INTO ${tableDefinition.name} (${sortedFields.join(', ')}) VALUES(${sortedFields.map(name => escapeSQLValueSingleQuotes(row[name])).join(', ')})`)
      }
    }

    return statements.join(';\n')
  }

  return {
    db: db as SqliteDatabase,
    table,
    tableWithSchema,
    transaction,
    dump,
    dispose,
  }
}

export type UseSqliteDatabase = ReturnType<typeof useSqliteDatabase>
