import type { DrawDatabase } from './_types'
import { getFieldName, getInterfaceName, setupMap, typeMap } from './_types'

export function createTypesTS(info: DrawDatabase) {
  const lines: string[] = []

  lines.push(`import type { SqliteTableDefault } from '@zerva/sqlite'`)
  lines.push(``)
  // lines.push(`// Generated at ${new Date().toISOString()}`)
  // lines.push(``)

  for (const table of info.tables) {
    if (table.comment)
      lines.push(`/** ${table.comment} */`)
    lines.push(`export interface ${getInterfaceName(table.name)} extends SqliteTableDefault {`)
    for (const field of table.fields) {
      if (field.name !== 'id')
        lines.push(`  ${getFieldName(field.name)}: ${typeMap[field.type] ?? field.type}`)
    }
    lines.push(`}`)
    lines.push(``)
  }

  return lines.join('\n')
}

export function createSetupTS(info: DrawDatabase) {
  const lines: string[] = []

  const interfaces = info.tables.map(table => getInterfaceName(table.name))
  interfaces.sort()

  lines.push(`import type { UseSqliteDatabase, UseSqliteTable } from '@zerva/sqlite'`)
  lines.push(`import type { ${interfaces.join(', ')} } from './types'`)
  lines.push(``)
  // lines.push(`// Generated at ${new Date().toISOString()}`)
  // lines.push(``)

  lines.push(`export function createTables(db: UseSqliteDatabase): {`)
  for (const table of info.tables)
    lines.push(`  ${getFieldName(table.name)}: UseSqliteTable<${getInterfaceName(table.name)}>`)
  lines.push(`} {`)

  for (const table of info.tables) {
    if (table.comment)
      lines.push(`/** ${table.comment} */`)
    lines.push(`  const ${getFieldName(table.name)} = db.table<${getInterfaceName(table.name)}>('${table.name}', {`)
    for (const field of table.fields) {
      if (field.name !== 'id')
        lines.push(`    ${getFieldName(field.name)}: '${setupMap[field.type] ?? field.type}',`)
    }
    lines.push(`  })`)
    lines.push(``)

    if (table.indices.length > 0) {
      for (const index of table.indices) {
        if (index.unique)
          lines.push(`  ${getFieldName(table.name)}.indexUnique([${index.fields.map(f => `'${getFieldName(f)}'`).join(', ')}])`)
        else
          lines.push(`  ${getFieldName(table.name)}.index([${index.fields.map(f => `'${getFieldName(f)}'`).join(', ')}])`)
      }
      lines.push(``)
    }
  }

  lines.push(`  return {`)
  for (const table of info.tables)
    lines.push(`    ${getFieldName(table.name)},`)
  lines.push(`  }`)
  lines.push(`}`)

  lines.push(``)
  return lines.join('\n')
}
