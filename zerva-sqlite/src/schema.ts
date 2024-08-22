declare module 'zeed' {
  interface TypeProps {
    /** Type to be used as SQLite field. See https://www.sqlite.org/datatype3.html#affinity_name_examples */
    fieldType: 'integer' | 'real' | 'text' | 'numeric' | 'blob'

    /** Index column */
    fieldIndex?: boolean
  }
}
