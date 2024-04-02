// @ts-expect-error we know better :)
import BetterSqlite3 from 'better-sqlite3'

export type SqliteDatabase = BetterSqlite3.Database
export type SqliteStatement = BetterSqlite3.Statement
export type SqliteOptions = BetterSqlite3.Options
export type SqliteRunResult = BetterSqlite3.RunResult

export { BetterSqlite3 }
