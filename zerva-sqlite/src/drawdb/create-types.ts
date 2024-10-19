import { getFieldName, getInterfaceName, typeMap } from './_types'
import type { DrawDatabase } from './_types'

export function createTypesTS(info: DrawDatabase, prefix?: string) {
  const lines: string[] = []

  lines.push(`import type { SqliteTableDefault } from '@zerva/sqlite'`)
  lines.push(``)
  // lines.push(`// Generated at ${new Date().toISOString()}`)
  // lines.push(``)

  for (const table of info.tables) {
    if (table.comment)
      lines.push(`/** ${table.comment} */`)
    lines.push(`export interface ${getInterfaceName(table.name, prefix)} extends SqliteTableDefault {`)
    for (const field of table.fields) {
      if (field.name !== 'id')
        lines.push(`  ${getFieldName(field.name)}: ${typeMap[field.type] ?? field.type}`)
    }
    lines.push(`}`)
    lines.push(``)
  }

  return lines.join('\n')
}
