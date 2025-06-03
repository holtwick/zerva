import type { Infer, SchemaEnvOptions, Type } from 'zeed'
import { assert, isSchemaObjectFlat, parseSchemaEnv, stringFromSchemaEnv } from 'zeed'

export interface ZervaConfigOptions extends SchemaEnvOptions {
  module?: string
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
  const { env = process.env, module } = options || {}
  const config = parseSchemaEnv(schema, { env })
  schemaList.push({ module, schema, options })
  return config
}

/**
 *
 * @returns A string representation suitable as template for an .env file.
 */
export function dumpConfig(): string {
  const dump: string[] = []
  for (const info of schemaList) {
    const name = info.module
    if (name) {
      dump.push(`#\n# Module: ${name}\n#\n`)
    }
    dump.push(stringFromSchemaEnv(info.schema, info.options?.prefix))
  }
  return dump.join('\n')
}
