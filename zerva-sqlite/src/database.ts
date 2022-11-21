import type { Database, Statement, Options } from 'better-sqlite3'
import BetterSqlite3 from 'better-sqlite3'
import { Logger, arraySorted, useDispose, arrayMinus } from 'zeed'

const log = Logger('sqlite')

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

function useSqliteTable<T>(db: Database, tableName: string, fields: TableFieldsDefinition) {
  const statementsCache: Record<string, Statement> = {}

  // Check current state
  const state = prepare(`PRAGMA table_info(${tableName})`).all()
  // const state = db.pragma(`table_info(${tableName})`)
  // log('state', state)

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

  //

  function prepare(value: string): any /* Statement */ {
    let stmt = statementsCache[value]
    if (stmt == null) {
      stmt = db.prepare(value)
      statementsCache[value] = stmt
    }
    return stmt
  }

  function getByField(name: string, value: any): T {
    return prepare(`SELECT * FROM ${tableName} WHERE ${name}=?`).get(value)
  }

  const sortedFields = arraySorted(['id', ...Object.keys(fields)])

  const _insertStatement = prepare(`INSERT INTO ${tableName} (${sortedFields.join(', ')}) VALUES(${sortedFields.map(_ => '?').join(', ')})`)

  function insert(obj: T) {
    _insertStatement.run(sortedFields.map(field => (obj as any)[field]))
  }

  function update(id: number | string, obj: Partial<T>) {
    const fields = []
    const values = []
    for (const field of sortedFields) {
      if (field in obj) {
        fields.push(`${field}=?`)
        values.push((obj as any)[field])
      }
    }
    prepare(`UPDATE ${tableName} SET ${fields.join(', ')} WHERE id=? LIMIT 1`).run([...values, id])
  }

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

  const _deleteStatement = prepare(`DELETE FROM ${tableName} WHERE id=?`)

  function deleteRow(id: number | string) {
    _deleteStatement.run([id])
  }

  return {
    getByField,
    get: getByField.bind(undefined, 'id'),
    insert,
    update,
    updateWhere,
    delete: deleteRow,
    prepare,
  }
}

export function useSqliteDatabase(name: string, opt: Options = {}) {
  const dispose = useDispose()

  if (!name.includes('.') && name !== ':memory:')
    name += '.sqlite'

  // https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
  const db = new BetterSqlite3(name, opt)
  dispose.add(() => db.close())

  function transaction(fn: (...args: any[]) => any) {
    return db.transaction(fn) as any
  }

  function table<T>(tableName: string, fields: TableFieldsDefinition) {
    return useSqliteTable<T>(db, tableName, fields)
  }

  return {
    db: db as any,
    table,
    transaction,
    dispose,
  }
}
