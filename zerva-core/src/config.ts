import type { Infer, SchemaEnvOptions, Type } from 'zeed'
import { assert, isSchemaObjectFlat, parseSchemaEnv, stringFromSchemaEnv } from 'zeed'
import { getContext } from './context'

export interface ZervaConfigOptions<T> extends SchemaEnvOptions<T> {
  moduleName?: string
}

/**
 * Get the configuration object based on the provided schema and environment variables.
 *
 * @param schema Description of the configuration as schema.
 * @param options ZervaConfigOptions
 * @returns The configuration object inferred from the schema and the environment variables.
 */
export function getConfig<T extends Type<any>>(schema: T, options?: ZervaConfigOptions<T>): Infer<T> {
  assert(isSchemaObjectFlat(schema), 'getConfig schema must be a flat object schema')
  // const { env = process.env, existing, moduleName } = options || {}
  const config = parseSchemaEnv(schema, options)
  // schemaList.push({ module: moduleName, schema, options })
  return config
}

/**
 *
 * @returns A string representation suitable as template for an .env file.
 */
export function dumpConfig(): string {
  const dump: string[] = []
  for (const info of Object.values(getContext().uses)) {
    const name = info.name
    if (name) {
      dump.push(`#\n# Module: ${name}\n#\n`)
    }
    const schema = info.moduleOptions?.configSchema
    if (schema) {
      const prefix = info.moduleOptions?.configOptions?.prefix ?? `${name.toUpperCase()}_`
      dump.push(stringFromSchemaEnv(schema, prefix))
    }
  }
  return dump.join('\n')
}
