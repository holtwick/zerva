import { getInterfaceName } from './_types'
import type { DrawDatabase } from './_types'

export function createRpcSetupTS(info: DrawDatabase, prefix?: string) {
  const lines: string[] = []

  const interfaces = info.tables.map(table => getInterfaceName(table.name, prefix))
  interfaces.sort()

  lines.push(`import type { UseSqliteTable } from '@zerva/sqlite'`)
  lines.push(`import type { ${interfaces.join(', ')} } from './types'`)
  lines.push(`import type { ${interfaces.map(n => `Rpc${n}`).join(', ')} } from './rpc-types'`)
  lines.push(``)
  // lines.push(`// Generated at ${new Date().toISOString()}`)
  // lines.push(``)

  for (const table of info.tables) {
    if (table.comment)
      lines.push(`/** ${table.comment} */`)
    const inter = getInterfaceName(table.name, prefix)
    const name = getInterfaceName(table.name, '')

    lines.push(`\
export function setupRpc${inter}(table: UseSqliteTable<${inter}>, handleChange?: (id:number) => void):Rpc${inter} {
  return {
    get${name}(id) {
      return table.get(id)
    },
    get${name}List() {
      return table.all() 
    },
    add${name}(item) {
      const id = table.insert(item as any)
      if (id && handleChange)
        handleChange(id)
    },
    update${name}(item) {
      const id = item.id
      table.update(id, item)
      if (handleChange)
        handleChange(id)
    },
    remove${name}(id) {
      table.delete(id)
      if (handleChange)
        handleChange(id)
    }
  }
}
`)
    lines.push(``)
  }

  return lines.join('\n')
}
