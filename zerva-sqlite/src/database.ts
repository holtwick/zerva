import BetterSqlite3 from 'better-sqlite3'
import type { Infer, Type } from 'zeed'
import { useDispose } from 'zeed'
import { escapeSQLValueSingleQuotes } from './_types'
import type { SqliteDatabase, SqliteOptions, SqliteTransaction } from './sqlite'
import type { SqliteTableColsDefinition } from './table'
import { useSqliteTable } from './table'
import { useSqliteTableWithSchema } from './table-schema'

export function useSqliteDatabase(name?: string, opt: SqliteOptions = {}) {
  const dispose = useDispose()

  if (name == null)
    name = ':memory:'

  else if (!name.includes('.') && name !== ':memory:')
    name += '.sqlite'

  // https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
  const db = new BetterSqlite3(name, opt)
  dispose.add(() => db.close())

  function transaction(fn: (...args: any[]) => any): SqliteTransaction {
    return db.transaction(fn)
  }

  function table<T>(tableName: string, fields: SqliteTableColsDefinition<T>) {
    return useSqliteTable<T>(db, tableName, fields)
  }

  function tableWithSchema<O extends Type<any>, T = Infer<O>>(tableName: string, schema: O) {
    return useSqliteTableWithSchema(db, tableName, schema)
  }

  // todo: implement with yield and stream
  /** Similar to `.dump` in SQLite CLI */
  function dump() {
    const statements: string[] = []

    function add(statement: string) {
      statements.push(String(statement))
    }

    interface SqliteMasterRow {
      name: string
      type: 'table' | 'index' | 'view' | 'trigger'
      sql: string
    }

    const tables = db.prepare('SELECT name, type, sql FROM sqlite_master WHERE name NOT LIKE \'sqlite_%\'').all() as SqliteMasterRow[]
    for (const tableDefinition of tables) {
      add(tableDefinition.sql)

      if (tableDefinition.type === 'table') {
        const values = db.prepare(`SELECT * FROM ${tableDefinition.name} LIMIT 100`).all() as any[]
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
