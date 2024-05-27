import { toCamelCase } from 'zeed'

export function getInterfaceName(name: string, prefix = 'Table') {
  let s = toCamelCase(name)
  s = s.charAt(0).toUpperCase() + s.slice(1)    
  return `${prefix}${s}`
}

/** @deprecated */
export function getVariableName(name: string) {
  let s = toCamelCase(name)
  s = s.charAt(0).toUpperCase() + s.slice(1)
  return `table${s}`
}

export function getFieldName(name: string) {
  return toCamelCase(name)
}

export const setupMap: any = {
  INT: 'integer',
  SMALLINT: 'integer',
  BIGINT: 'integer',
  BOOLEAN: 'integer',
  TIME: 'integer',
  TIMESTAMP: 'integer',
  DATE: 'integer',
  DATETIME: 'integer',

  NUMERIC: 'numeric',
  DECIMAL: 'numeric',

  REAL: 'real',
  FLOAT: 'real',
  DOUBLE: 'real',

  CHAR: 'text',
  VARCHAR: 'text',
  TEXT: 'text',
  UUID: 'text',
  JSON: 'text',

  BLOB: 'blob',
}

export const typeMap: any = {
  BOOLEAN: 'boolean',

  INT: 'number',
  SMALLINT: 'number',
  BIGINT: 'number',
  TIME: 'number',
  TIMESTAMP: 'number',
  DATE: 'number',
  DATETIME: 'number',

  NUMERIC: 'number',
  DECIMAL: 'number',

  REAL: 'number',
  FLOAT: 'number',
  DOUBLE: 'number',

  CHAR: 'string',
  VARCHAR: 'string',
  TEXT: 'string',
  UUID: 'string',
  JSON: 'string',

  // BLOB: 'blob',
}

//

export interface DrawDatabase {
  author: string
  title: string
  date: Date
  tables: DrawTable[]
  relationships: DrawRelationship[]
  notes: any[]
  subjectAreas: any[]
  types: any[]
}

interface DrawRelationship {
  startTableId: number
  startFieldId: number
  endTableId: number
  endFieldId: number
  cardinality: string
  updateConstraint: string
  deleteConstraint: string
  name: string
  id: number
}

interface DrawTable {
  id: number
  name: string
  x: number
  y: number
  fields: DrawField[]
  comment: string
  indices: DrawIndex[]
  color: string
  key: number
}

interface DrawField {
  name: string
  type: string
  default: string
  check: string
  primary: boolean
  unique: boolean
  notNull: boolean
  increment: boolean
  comment: string
  id: number
  size?: number | string
  values?: any[]
}

interface DrawIndex {
  id: number
  name: string
  unique: boolean
  fields: string[]
}
