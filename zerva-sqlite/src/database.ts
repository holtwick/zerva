// @ts-ignore
import BetterSqlite3 from 'better-sqlite3'
import { arrayMinus, arraySorted, isArray, isBoolean, isPrimitive, Logger, useDispose } from 'zeed'
import './better-sqlite3'

const log = Logger('sqlite')

export type SqliteDatabase = BetterSqlite3.Database
export type SqliteStatement = BetterSqlite3.Statement
export type SqliteOptions = BetterSqlite3.Options
export type SqliteRunResult = BetterSqlite3.RunResult

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

interface TableFieldsDefinition {
  [key: string]: ColumnTypes // | ComplexType
}

function useSqliteTable<
  RowType,
  FullRowType = RowType & { id: number },
  RowKey = keyof FullRowType
>(
  db: SqliteDatabase,
  tableName: string,
  fields: TableFieldsDefinition
) {
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
    value = value.trim()
    let stmt = statementsCache[value]
    if (stmt == null) {
      try {
        stmt = db.prepare(value)
        statementsCache[value] = stmt
      } catch (err) {
        log.warn(`Error while preparing "${value}":`, err)
        throw err
      }
    }
    return stmt
  }

  /** Query `value` of a certain `field` */
  function getByField(name: RowKey, value: any): FullRowType {
    const sql = `SELECT * FROM ${tableName} WHERE ${String(name)}=?`
    // log(`EXPLAIN QUERY PLAN: "${prepare(`EXPLAIN QUERY PLAN ${sql}`).get(value).detail}"`)
    return prepare(sql).get(value)
  }

  const _getStatement = db.prepare(`SELECT * FROM ${tableName} WHERE id=?`)

  /** Query row with `id`  */
  function get(id: number | string): FullRowType {
    return _getStatement.get(id)
  }

  function normalizeValue(value: any) {
    if (isBoolean(value)) return value ? 1 : 0
    if (!isPrimitive(value)) return String(value)
    return value
  }

  const _insertStatement = db.prepare(`INSERT INTO ${tableName} (${sortedFields.join(', ')}) VALUES(${sortedFields.map(_ => '?').join(', ')})`)

  /** Insert `obj` */
  function insert(obj: RowType): number | undefined {
    try {
      return _insertStatement.run(sortedFields.map(field => normalizeValue((obj as any)[field]))).lastInsertRowid
    } catch (err) {
      log('insert err', err)
    }
  }

  /** Update content `obj` of row with `id`  */
  function update(id: number | string, obj: Partial<FullRowType>): SqliteRunResult {
    const fields = []
    const values = []
    for (const field of sortedFields) {
      if (field in obj) {
        fields.push(`${field}=?`)
        values.push(normalizeValue((obj as any)[field]))
      }
    }
    return prepare(
      `UPDATE ${tableName} SET ${fields.join(', ')} WHERE id=? LIMIT 1`
    ).run([...values, id])
  }

  /** On UNIQUE or PRIMARY indexes we can update values or insert a new row, if index values were not yet set. */
  function upsert(conflictRow: RowKey | RowKey[], obj: Partial<FullRowType>) {
    const conflictRows = isArray(conflictRow) ? conflictRow : [conflictRow]

    for (let row of conflictRows) {
      if ((obj as any)[String(row)] == null)
        throw new Error(`Field ${row} has to be part of object ${obj}`)
    }

    const fields = []
    const values = []
    for (const field of sortedFields) {
      if (field in obj) {
        fields.push(field)
        values.push(normalizeValue((obj as any)[field]))
      }
    }

    let fieldNames = fields.join(', ')
    let placeholders = fields.map(_ => '?').join(', ')
    let fieldsUpdate = fields.map(field => `${field}=?`).join(', ')

    return prepare(
      `INSERT INTO ${tableName} (${fieldNames}) VALUES(${placeholders}) ON CONFLICT(${conflictRows.map(r => String(r)).join(', ')}) DO UPDATE SET ${fieldsUpdate}`
    ).run([...values, ...values])
  }

  /** Update multiple fields `where` condition */
  function updateWhere(where: string, obj: Partial<RowType>): SqliteRunResult {
    const fields = []
    const values = []
    for (const field of sortedFields) {
      if (field in obj) {
        fields.push(`${field}=?`)
        values.push((obj as any)[field])
      }
    }
    return prepare(`UPDATE ${tableName} SET ${fields.join(', ')} WHERE ${where} `).run(values)
  }

  const _deleteStatement = db.prepare(`DELETE FROM ${tableName} WHERE id =? `)

  /** Delete row with `id` */
  function deleteRow(id: number | string): SqliteRunResult {
    _deleteStatement.run([id])
  }

  /** Get all rows and `orderBy` */
  function all(orderBy: string = 'id'): RowType[] {
    return prepare(`SELECT * FROM ${tableName} ORDER BY ${orderBy} `).all()
  }

  /** Get number of rows  */
  function count(): number {
    return prepare(`SELECT count(id) AS count FROM ${tableName} `).get().count
  }

  /** Create index `idx_field` of column `field` if not exists. */
  function index(field: RowKey | RowKey[], indexName?: string, unique?: boolean): SqliteRunResult {
    const fields = isArray(field) ? field : [field]
    return prepare(`CREATE ${unique === true ? 'UNIQUE ' : ''}INDEX IF NOT EXISTS ${indexName ?? 'idx_' + fields.map(r => String(r)).join('_')} ON ${tableName} (${fields.map(r => String(r)).join(', ')})`).run()
  }

  /** Create index `idx_field` of column `field` if not exists. */
  function indexUnique(field: RowKey | RowKey[], indexName?: string): SqliteRunResult {
    return index(field, indexName, true)
  }

  return {
    getByField,
    get,
    insert,
    update,
    updateWhere,
    upsert,
    delete: deleteRow,
    prepare,
    info,
    index,
    indexUnique,
    count,
    all
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
