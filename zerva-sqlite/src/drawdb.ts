import { toCamelCase } from 'zeed'

export function getInterfaceName(name: string) {
  let s = toCamelCase(name)
  s = s.charAt(0).toUpperCase() + s.slice(1)
  return `Table${s}`
}

export function getVariableName(name: string) {
  let s = toCamelCase(name)
  s = s.charAt(0).toUpperCase() + s.slice(1)
  return `table${s}`
}

export function getFieldName(name: string) {
  return toCamelCase(name)
}

const setupMap: any = {
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

const typeMap: any = {
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

export function createTypesTS(info: any) {
  const lines: string[] = []

  lines.push(`import type { SqliteTableDefault } from '@zerva/sqlite'`)
  lines.push(``)
  // lines.push(`// Generated at ${new Date().toISOString()}`)
  // lines.push(``)

  for (const table of info.tables) {
    if (table.comment)
      lines.push(`/** ${table.comment} */`)
    lines.push(`export interface ${getInterfaceName(table.name)} extends SqliteTableDefault {`)
    for (const field of table.fields)
      lines.push(`  ${getFieldName(field.name)}: ${typeMap[field.type] ?? field.type}`)
    lines.push(`}`)
    lines.push(``)
  }

  return lines.join('\n')
}

export function createSetupTS(info: any) {
  const lines: string[] = []

  // lines.push(`import type { SqliteTableDefault } from '@zerva/sqlite'`)
  // lines.push(``)
  // lines.push(`// Generated at ${new Date().toISOString()}`)
  // lines.push(``)

  for (const table of info.tables) {
    if (table.comment)
      lines.push(`/** ${table.comment} */`)
    lines.push(`export const ${getVariableName(table.name)} = db.table<${getInterfaceName(table.name)}>('${table.name}', {`)
    for (const field of table.fields)
      lines.push(`  ${getFieldName(field.name)}: '${setupMap[field.type] ?? field.type}',`)
    lines.push(`}`)
    lines.push(``)
  }

  return lines.join('\n')
}
