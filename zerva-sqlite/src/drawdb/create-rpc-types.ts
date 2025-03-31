import type { DrawDatabase } from './_types'
import { getInterfaceName } from './_types'

export function createRpcTypesTS(info: DrawDatabase, prefix?: string) {
  const lines: string[] = []

  const interfaces = info.tables.map(table => getInterfaceName(table.name, prefix))
  interfaces.sort()

  lines.push(`import type { ${interfaces.join(', ')} } from './types'`)
  lines.push(``)
  // lines.push(`// Generated at ${new Date().toISOString()}`)
  // lines.push(``)

  for (const table of info.tables) {
    if (table.comment)
      lines.push(`/** ${table.comment} */`)
    const inter = getInterfaceName(table.name, prefix)
    const name = getInterfaceName(table.name, '')
    lines.push(`export interface Rpc${inter} {`)
    lines.push(`  get${name}: (id: number) => ${inter} | undefined`)
    lines.push(`  get${name}List: () => ${inter}[]`)
    lines.push(`  add${name}: (item: Partial<Omit<${inter}, 'id' | 'created' | 'updated'>>) => void`)
    lines.push(`  update${name}: (item: Partial<${inter}> & {id: number}) => void`)
    lines.push(`  remove${name}: (id: number) => void`)
    lines.push(`}`)
    lines.push(``)
  }

  lines.push(`export type Rpc${prefix} = ${interfaces.map(n => `Rpc${n}`).join(' | ')}`)
  lines.push(``)

  return lines.join('\n')
}
