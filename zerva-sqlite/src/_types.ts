import type { Infer, Type } from 'zeed'
import { useDispose } from 'zeed'
import type { SqliteColType } from './table2'

declare module 'zeed' {
  export interface TypeProps {
    /** Type to be used as SQLite field. See https://www.sqlite.org/datatype3.html#affinity_name_examples */
    fieldType: 'integer' | 'real' | 'text' | 'numeric' | 'blob'

    /** Index column */
    // fieldIndex?: boolean

    fieldTransformSet?: (value: any) => any

    fieldTransformGet?: (value: any) => any
  }
}

export const mapSchemaTypeToField: Record<string, SqliteColType> = {
  string: 'text',
  boolean: 'integer',
  number: 'integer',
}
