import { resolve } from 'node:path'
import { ensureFolder, toCapitalize, writeText } from 'zeed'
import type { DrawDatabase } from './_types'
import { createSetupTS, createTypesTS } from './drawdb'

export async function createFilesFromDrawDb(info: DrawDatabase, prefix = 'Table') {
  const base = resolve(__dirname, '_tmp')
  await ensureFolder(base)
  await writeText(resolve(base, 'setup.ts'), createSetupTS(info, toCapitalize(prefix)))
  await writeText(resolve(base, 'types.ts'), createTypesTS(info, toCapitalize(prefix)))
}
