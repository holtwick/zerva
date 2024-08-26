import type { Primitive } from 'zeed'
import { Logger, arrayMinus, arraySorted, getTimestamp, isArray, isBoolean, isNumber, isPrimitive, isString } from 'zeed'
import type { SqliteDatabase, SqliteRunResult, SqliteStatement } from './sqlite'

const log = Logger('sqlite:table')

/* export interface TableEvents {
  willChange: (id: number) => any
  didChange: (id: number) => any
  willDelete: (id: number) => any
  didDelete: (id: number) => any
} */

export type SqliteColType = 'real' | 'blob' | 'integer' | 'text'

/** Redefine accoring to interface to create correct field types */
export type SqliteTableColsDefinition<T, TT = Omit<T, 'id' | 'updated' | 'created'>, K extends keyof TT = keyof TT> = {
  [key in K]: SqliteColType
}

/** Escape for .dump() */
export function escapeSQLValueSingleQuotes(value: any) {
  if (value == null)
    return 'NULL'
  if (isNumber(value))
    return String(value)
  if (!isString(value))
    value = JSON.stringify(value)
  return `'${String(value).replace(/'/g, '\'\'')}'`
}

/**
 * Basic fields of every table with
 *
 * - `id` as incrementing primary key
 * - `created` in miliseconds
 * - `updated` in miliseconds
 */
export interface SqliteTableDefault {
  id: number
  created: number
  updated: number
}

/** Only use via `useSqliteDatabase`! */
export function useSqliteTable2<
  ColType,
  ColFullType = ColType & SqliteTableDefault,
  ColTypeInsert = Omit<ColType, 'id' | 'updated' | 'created'> & Partial<SqliteTableDefault>,
  ColName = keyof ColFullType,
>(
  db: SqliteDatabase,
  tableName: string,
  fields: SqliteTableColsDefinition<ColType>,
  // schema?: Type,
) {
  const primaryKeyName = 'id'
  const statementsCache: Record<string, SqliteStatement> = {}

  // Check current state
  const _tableInfoStatement = db.prepare(`PRAGMA table_info(${tableName})`)
  const info = () => _tableInfoStatement.all()
  const state = info()

  const creationFields = {
    ...fields,
    updated: 'integer',
    created: 'integer',
  }

  if (state == null || state.length <= 0) {
    // Create table https://www.sqlite.org/lang_createtable.html
    const fieldsList = [
      `${primaryKeyName} INTEGER PRIMARY KEY AUTOINCREMENT`,
    ]
    for (const [field, colType] of Object.entries(creationFields))
      fieldsList.push(`${field} ${colType}`)
    db.exec(`CREATE TABLE IF NOT EXISTS ${tableName} (${fieldsList.join(', ')})`)
  }
  else {
    // Update table https://www.sqlite.org/lang_altertable.html
    const missingFields = arrayMinus(Object.keys(creationFields), state.map((col: any) => col.name))
    if (missingFields.length > 0) {
      const fieldsList: string[] = []
      for (const field of missingFields)
        fieldsList.push(`ALTER TABLE ${tableName} ADD COLUMN ${field} ${(creationFields as any)[field]}`)
      db.exec(fieldsList.join('; '))
    }
  }

  const sortedFields = arraySorted([primaryKeyName, ...Object.keys(fields)])

  //

  /** Prepare statement and cache it. */
  function prepare(value: string): never | SqliteStatement {
    value = value.trim()
    let stmt = statementsCache[value]
    if (stmt == null) {
      try {
        stmt = db.prepare(value)
        statementsCache[value] = stmt
      }
      catch (err) {
        log.warn(`Error while preparing "${value}":`, err)
        throw err
      }
    }
    return stmt
  }

  /** Query `value` of a certain `field` */
  function getByField(name: ColName, value: any): ColFullType | undefined {
    if (value != null) {
      const sql = `SELECT * FROM ${tableName} WHERE ${String(name)}=? LIMIT 1`
      // log(`EXPLAIN QUERY PLAN: "${prepare(`EXPLAIN QUERY PLAN ${sql}`).get(value).detail}"`)
      return prepare(sql).get(value) as any
    }
  }

  interface SelectDescription {
    conditions?: Partial<ColFullType>
    limit?: number
    offset?: number
    orderBy?: OrderByMany<string>
  }

  function findPrepare(opt?: SelectDescription) {
    const { conditions, orderBy, limit, offset } = opt ?? {}
    const fields: string[] = []
    const values: Primitive[] = []
    if (conditions) {
      for (const field of sortedFields) {
        if (field in conditions) {
          fields.push(`${field}=?`)
          values.push(normalizeValue((conditions as any)[field]))
        }
      }
    }
    let sql = `SELECT * FROM ${tableName}`
    if (fields.length > 0)
      sql += ` WHERE ${fields.join(' AND ')}`
    if (orderBy != null) {
      if (isArray(orderBy))
        sql += ` ORDER BY ${orderBy.join(', ')}`
      else sql += ` ORDER BY ${orderBy}`
    }
    if (limit != null)
      sql += ` LIMIT ${limit}`
    if (offset != null)
      sql += ` OFFSET ${offset}`

    // log(`EXPLAIN QUERY PLAN: "${prepare(`EXPLAIN QUERY PLAN ${sql}`).get(value).detail}"`)
    return {
      statement: prepare(sql),
      values,
    }
  }

  function findOne(conditions: Partial<ColFullType>): ColFullType | undefined {
    const { statement, values } = findPrepare({ conditions, limit: 1 })
    return statement.get(values)
  }

  type OrderBy<T extends string> = T | `${T} asc` | `${T} desc` | `${T} ASC` | `${T} DESC`
  type OrderByMany<T extends string> = OrderBy<T> | OrderBy<T>[]

  function findAll(opt?: SelectDescription): ColFullType[] {
    const { statement, values } = findPrepare(opt)
    return statement.all(values) ?? []
  }

  const _getStatement = db.prepare(`SELECT * FROM ${tableName} WHERE ${primaryKeyName}=? LIMIT 1`)

  /** Query row with `id`  */
  function get(id: number | string): ColFullType | undefined {
    if (id != null)
      return _getStatement.get(id)
  }

  function normalizeValue(value: any): Primitive {
    if (isBoolean(value))
      return value ? 1 : 0
    if (!isPrimitive(value))
      return String(value)
    return value
  }

  const getNow = (globalThis as any).TEST ? () => 0 : getTimestamp

  const _insertStatement = db.prepare(`INSERT INTO ${tableName} (created, updated, ${sortedFields.join(', ')}) VALUES(?, ?, ${sortedFields.map(_ => '?').join(', ')})`)

  /** Insert `obj` */
  function insert(obj: ColTypeInsert): number | undefined {
    try {
      const now = getNow()
      return _insertStatement.run([now, now, ...sortedFields.map(field => normalizeValue((obj as any)[field]))]).lastInsertRowid
    }
    catch (err) {
      log('insert err', err)
    }
  }

  /** Update content `obj` of row with `id`  */
  function update(id: number | string, obj: Partial<ColFullType>): SqliteRunResult {
    // if(schema?.parse(obj))
    const fields: string[] = []
    const values: Primitive[] = []
    for (const field of sortedFields) {
      if (field in obj) {
        fields.push(`${field}=?`)
        values.push(normalizeValue((obj as any)[field]))
      }
    }
    const now = getNow()
    return prepare(
      `UPDATE ${tableName} SET updated=?, ${fields.join(', ')} WHERE id=? LIMIT 1`,
    ).run([now, ...values, id])
  }

  /** On UNIQUE or PRIMARY indexes we can update values or insert a new row, if index values were not yet set. */
  function upsert(colName: ColName | ColName[], obj: Partial<ColFullType>): never | SqliteRunResult {
    const colNames = isArray(colName) ? colName : [colName]

    for (const row of colNames) {
      if ((obj as any)[String(row)] == null)
        throw new Error(`Field ${row} has to be part of object ${obj}`)
    }

    const fields: string[] = []
    const values: Primitive[] = []
    for (const field of sortedFields) {
      if (field in obj) {
        fields.push(field)
        values.push(normalizeValue((obj as any)[field]))
      }
    }

    const fieldNames = fields.join(', ')
    const placeholders = fields.map(_ => '?').join(', ')
    const fieldsUpdate = fields.map(field => `${field}=?`).join(', ')

    const now = getNow()
    return prepare(
      `INSERT INTO ${tableName} (created, updated, ${fieldNames}) VALUES(?, ?, ${placeholders}) ON CONFLICT(${colNames.map(r => String(r)).join(', ')}) DO UPDATE SET updated=?, ${fieldsUpdate}`,
    ).run([now, now, ...values, now, ...values])
  }

  /** Update multiple fields `where` condition */
  function updateWhere(where: string, obj: Partial<ColType>): SqliteRunResult {
    const fields: string[] = []
    const values: Primitive[] = []
    for (const field of sortedFields) {
      if (field in obj) {
        fields.push(`${field}=?`)
        values.push((obj as any)[field])
      }
    }
    const now = getNow()
    return prepare(`UPDATE ${tableName} SET updated=?, ${fields.join(', ')} WHERE ${where}`).run([now, ...values])
  }

  const _deleteStatement = db.prepare(`DELETE FROM ${tableName} WHERE id=?`)

  /** Delete row with `id` */
  function deleteRow(id: number | string): SqliteRunResult {
    return _deleteStatement.run([id])
  }

  /** Your SELECT query, your args, all optimized and cached */
  function query(sql: string, ...args: any): ColFullType[] {
    return prepare(sql).all(args)
  }

  /** Get number of rows  */
  function count(): number {
    return prepare(`SELECT count(id) AS count FROM ${tableName}`).get().count
  }

  /** Create index `idx_table_field` of column `field` if not exists. */
  function index(col: ColName | ColName[], indexName?: string, unique?: boolean): SqliteRunResult {
    const fields = isArray(col) ? col : [col]
    return prepare(`CREATE ${unique === true ? 'UNIQUE ' : ''}INDEX IF NOT EXISTS ${indexName ?? `idx_${tableName}_${fields.map(r => String(r)).join('_')}`} ON ${tableName} (${fields.map(r => String(r)).join(', ')})`).run()
  }

  /** Create unique index `idx_table_field` of column `field` if not exists. */
  function indexUnique(col: ColName | ColName[], indexName?: string): SqliteRunResult {
    return index(col, indexName, true)
  }

  return {
    name: tableName,
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
    query,
    count,
    findOne,
    findAll,
  }
}

export type UseSqliteTable2<T = SqliteTableDefault> = ReturnType<typeof useSqliteTable2<T>>
