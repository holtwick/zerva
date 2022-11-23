// @ts-ignore
import BetterSqlite3 from 'better-sqlite3'
import { arrayMinus, arraySorted, Logger, useDispose } from 'zeed'
import './better-sqlite3'

const log = Logger('sqlite')

export type SqliteDatabase = BetterSqlite3.Database
export type SqliteStatement = BetterSqlite3.Statement
export type SqliteOptions = BetterSqlite3.Options

// https://www.sqlite.org/datatype3.html
const affinity = {
  'integer': 'integer',
  'int': 'integer',

  'text': 'text',
  'varchar': 'text',
  'string': 'text',

  'blob': 'blob',

  'real': 'real',
  'float': 'real',
  'double': 'real',
  'number': 'real',

  'numeric': 'numeric',
  'decimal': 'numeric',
  'boolean': 'numeric',
  'date': 'numeric',
  'datetime': 'numeric',
}

type ColumnTypes = keyof typeof affinity

// interface ComplexType {
//   type: ColumnTypes
//   primaryKey?: boolean
//   length?: number
// }

interface TableFieldsDefinition {
  [key: string]: ColumnTypes // | ComplexType
}

function useSqliteTable<T>(db: SqliteDatabase, tableName: string, fields: TableFieldsDefinition) {
  const statementsCache: Record<string, SqliteStatement> = {}

  // Check current state
  const _tableInfoStatement = db.prepare(`PRAGMA table_info(${tableName})`)
  const info = () => _tableInfoStatement.all()
  const state = info()

  if (state == null || state.length <= 0) {

    // Create table https://www.sqlite.org/lang_createtable.html
    const fieldsList = ['id INTEGER PRIMARY KEY AUTOINCREMENT']
    for (const [field, colType] of Object.entries(fields))
      fieldsList.push(`${field} ${affinity[colType] ?? 'text'}`)
    db.exec(`CREATE TABLE IF NOT EXISTS ${tableName} (${fieldsList.join(', ')})`)
  } else {

    // Update table https://www.sqlite.org/lang_altertable.html
    let missingFields = arrayMinus(Object.keys(fields), state.map((col: any) => col.name))
    if (missingFields.length > 0) {
      const fieldsList = []
      for (const field of missingFields)
        fieldsList.push(`ALTER TABLE ${tableName} ADD COLUMN ${field} ${affinity[fields[field]] ?? 'text'}`)
      db.exec(fieldsList.join('; '))
    }
  }

  const sortedFields = arraySorted(['id', ...Object.keys(fields)])

  //

  /** Prepare statement and cache it. */
  function prepare(value: string): SqliteStatement {
    let stmt = statementsCache[value]
    if (stmt == null) {
      stmt = db.prepare(value)
      statementsCache[value] = stmt
    }
    return stmt
  }

  /** Query `value` of a certain `field` */
  function getByField(name: string, value: any): T {
    const sql = `SELECT * FROM ${tableName} WHERE ${name}=?`
    // log(`EXPLAIN QUERY PLAN: "${prepare(`EXPLAIN QUERY PLAN ${sql}`).get(value).detail}"`)
    return prepare(sql).get(value)
  }

  const _getStatement = db.prepare(`SELECT * FROM ${tableName} WHERE id=?`)

  /** Query row with `id`  */
  function get(id: number | string): T {
    return _getStatement.get(id)
  }


  const _insertStatement = db.prepare(`INSERT INTO ${tableName} (${sortedFields.join(', ')}) VALUES(${sortedFields.map(_ => '?').join(', ')})`)

  /** Insert `obj` */
  function insert(obj: T) {
    return _insertStatement.run(sortedFields.map(field => (obj as any)[field]))
  }

  /** Update content `obj` of row with `id`  */
  function update(id: number | string, obj: Partial<T>) {
    const fields = []
    const values = []
    for (const field of sortedFields) {
      if (field in obj) {
        fields.push(`${field}=?`)
        values.push((obj as any)[field])
      }
    }
    return prepare(`UPDATE ${tableName} SET ${fields.join(', ')} WHERE id=? LIMIT 1`).run([...values, id])
  }

  /** Update multiple fields `where` condition */
  function updateWhere(where: string, obj: Partial<T>) {
    const fields = []
    const values = []
    for (const field of sortedFields) {
      if (field in obj) {
        fields.push(`${field}=?`)
        values.push((obj as any)[field])
      }
    }
    return prepare(`UPDATE ${tableName} SET ${fields.join(', ')} WHERE ${where}`).run(values)
  }

  const _deleteStatement = db.prepare(`DELETE FROM ${tableName} WHERE id=?`)

  /** Delete row with `id` */
  function deleteRow(id: number | string) {
    _deleteStatement.run([id])
  }

  /** Create index `idx_field` of column `field` if not exists. */
  function index(field: string, indexName?: string) {
    return prepare(`CREATE INDEX IF NOT EXISTS ${indexName ?? 'idx_' + field} ON ${tableName}(${field})`).run()
  }

  return {
    getByField,
    get,
    insert,
    update,
    updateWhere,
    delete: deleteRow,
    prepare,
    info,
    index
  }
}

export function useSqliteDatabase(name: string, opt: SqliteOptions = {}) {
  const dispose = useDispose()

  if (!name.includes('.') && name !== ':memory:')
    name += '.sqlite'

  // https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
  const db: SqliteDatabase = new BetterSqlite3(name, opt)
  dispose.add(() => db.close())

  function transaction(fn: (...args: any[]) => any) {
    return db.transaction(fn) as any
  }

  function table<T>(tableName: string, fields: TableFieldsDefinition) {
    return useSqliteTable<T>(db, tableName, fields)
  }

  return {
    db,
    table,
    transaction,
    dispose,
  }
}
