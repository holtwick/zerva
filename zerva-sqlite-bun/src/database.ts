import { Database as SqliteDatabase } from 'bun:sqlite'
import { useDispose } from 'zeed'
import { escapeSQLValueSingleQuotes, useSqliteTable } from './table'
import type { SqliteTableColsDefinition } from './table'

interface SqliteOptions {
  /**
   * Open the database as read-only (no write operations, no create).
   *
   * Equivalent to {@link constants.SQLITE_OPEN_READONLY}
   */
  readonly?: boolean
  /**
   * Allow creating a new database
   *
   * Equivalent to {@link constants.SQLITE_OPEN_CREATE}
   */
  create?: boolean
  /**
   * Open the database as read-write
   *
   * Equivalent to {@link constants.SQLITE_OPEN_READWRITE}
   */
  readwrite?: boolean

  /**
   * When set to `true`, integers are returned as `bigint` types.
   *
   * When set to `false`, integers are returned as `number` types and truncated to 52 bits.
   *
   * @default false
   * @since v1.1.14
   */
  safeInteger?: boolean

  /**
   * When set to `false` or `undefined`:
   * - Queries missing bound parameters will NOT throw an error
   * - Bound named parameters in JavaScript need to exactly match the SQL query.
   *
   * @example
   * ```ts
   * const db = new Database(":memory:", { strict: false });
   * db.run("INSERT INTO foo (name) VALUES ($name)", { $name: "foo" });
   * ```
   *
   * When set to `true`:
   * - Queries missing bound parameters will throw an error
   * - Bound named parameters in JavaScript no longer need to be `$`, `:`, or `@`. The SQL query will remain prefixed.
   *
   * @example
   * ```ts
   * const db = new Database(":memory:", { strict: true });
   * db.run("INSERT INTO foo (name) VALUES ($name)", { name: "foo" });
   * ```
   * @since v1.1.14
   */
  strict?: boolean

  /** https://bun.sh/docs/api/sqlite#wal-mode */
  walMode?: boolean

  verbose?: (sql: string) => void
}

export function useSqliteDatabase(name: string, opt: SqliteOptions = {

}) {
  const dispose: any = useDispose()

  if (!name.includes('.') && name !== ':memory:')
    name += '.sqlite'

  const { walMode = true, verbose, ...options } = opt

  // https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
  const db: SqliteDatabase = new SqliteDatabase(name, {
    strict: true,
    safeInteger: false,
    ...options,
  })
  dispose.add(() => db.close())

  if (walMode)
    db.exec('PRAGMA journal_mode = WAL')

  function transaction(fn: (...args: any[]) => any) {
    return db.transaction(fn) as any
  }

  function table<T>(tableName: string, fields: SqliteTableColsDefinition<T>) {
    return useSqliteTable<T>(db, tableName, fields, verbose)
  }

  // todo: implement with yield and stream
  /** Similar to `.dump` in SQLite CLI */
  function dump() {
    const statements: string[] = []

    function add(statement: string) {
      statements.push(String(statement))
    }

    const tables = db.prepare<{
      name: string
      type: string
      sql: string
    }, any>('SELECT name, type, sql FROM sqlite_master WHERE name NOT LIKE \'sqlite_%\'').all()
    for (const tableDefinition of tables) {
      add(tableDefinition.sql)

      if (tableDefinition.type === 'table') {
        const values = db.prepare(`SELECT * FROM ${tableDefinition.name} LIMIT 100`).all()
        const sortedFields = Object.keys(values[0] ?? {})
        for (const row of values as any)
          add(`INSERT INTO ${tableDefinition.name} (${sortedFields.join(', ')}) VALUES(${sortedFields.map(name => escapeSQLValueSingleQuotes(row[name])).join(', ')})`)
      }
    }

    return statements.join(';\n')
  }

  return {
    db,
    table,
    transaction,
    dump,
    dispose,
  }
}

export type UseSqliteDatabase = ReturnType<typeof useSqliteDatabase>
