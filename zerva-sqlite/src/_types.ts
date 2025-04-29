import { isNumber, isString } from 'zeed'

declare module 'zeed' {
  export interface TypeProps {
    /** Type to be used as SQLite field. See https://www.sqlite.org/datatype3.html#affinity_name_examples */
    fieldType?: 'integer' | 'real' | 'text' | 'numeric' | 'blob'

    /** Index column */
    // fieldIndex?: boolean

    fieldTransformSet?: (value: any) => any

    fieldTransformGet?: (value: any) => any
  }
}

export type SqliteBasicColType = 'real' | 'blob' | 'integer' | 'text'

export const mapSchemaTypeToField: Record<string, SqliteBasicColType> = {
  string: 'text',
  boolean: 'integer',
  number: 'real',
  int: 'integer',
}

export type OrderBy<T extends string> = T | `${T} asc` | `${T} desc` | `${T} ASC` | `${T} DESC`

export type OrderByMany<T extends string> = OrderBy<T> | OrderBy<T>[]

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
