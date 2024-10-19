import { resolve } from 'node:path'
import { ensureFolder, toCapitalize, writeText } from 'zeed'
import { createRpcSetupTS } from './create-rpc-setup'
import { createRpcTypesTS } from './create-rpc-types'
import { createSetupTS } from './create-setup'
import { createTypesTS } from './create-types'
import type { DrawDatabase } from './_types'

export async function createFilesFromDrawDb(info: DrawDatabase, prefix = 'Table') {
  const base = resolve(__dirname, '_tmp')
  await ensureFolder(base)
  await writeText(resolve(base, 'setup.ts'), createSetupTS(info, toCapitalize(prefix)))
  await writeText(resolve(base, 'types.ts'), createTypesTS(info, toCapitalize(prefix)))
  await writeText(resolve(base, 'rpc-types.ts'), createRpcTypesTS(info, toCapitalize(prefix)))
  await writeText(resolve(base, 'rpc-setup.ts'), createRpcSetupTS(info, toCapitalize(prefix)))
}
