import type { Infer, SchemaEnvOptions, Type } from 'zeed'
import { assert, isSchemaObjectFlat, parseSchemaEnv, stringFromSchemaEnv } from 'zeed'

export interface ZervaConfigOptions extends SchemaEnvOptions {
  env?: Record<string, any>
}

const schemaList: {
  module?: string
  schema: Type<any>
  options?: ZervaConfigOptions
  config?: any
  dump?: string
}[] = []

/**
 * Get the configuration object based on the provided schema and environment variables.
 *
 * @param schema Description of the configuration as schema.
 * @param options ZervaConfigOptions
 * @returns The configuration object inferred from the schema and the environment variables.
 */
export function getConfig<T extends Type<any>>(schema: T, options?: ZervaConfigOptions): Infer<T> {
  assert(isSchemaObjectFlat(schema), 'getConfig schema must be a flat object schema')
  // eslint-disable-next-line node/prefer-global/process
  const { env = process.env } = options || {}
  const config = parseSchemaEnv(schema, { env })
  schemaList.push({ schema, options })
  return config
}

/**
 *
 * @returns A string representation suitable as template for an .env file.
 */
export function dumpConfig(): string {
  const dump: string[] = []
  for (const info of schemaList) {
    dump.push(stringFromSchemaEnv(info.schema))
  }
  return dump.join('\n')
}
