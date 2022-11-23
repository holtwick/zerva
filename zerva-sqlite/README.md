# 🌱 Zerva useSqliteDatabase

**This is a side project of [Zerva](https://github.com/holtwick/zerva)**

> SQLite abstraction

### Installation

```
npm install @zerva/sqlite
```

### Help

Use [better-sqlite3](https://www.npmjs.com/package/better-sqlite3) through a simplified abstraction layer.

A principle followed here to keep life easy with databases is: **Never delete something, in particular no columns!**

```ts
import { useSqliteDatabase } from '@zerva/sqlite'

// Open / create the database
const db = useSqliteDatabase('test.sqlite')

// Get typed results
interface Person {
  id: number
  name: string
  age: number
}

// Create table only if not exists
// Colums that did not exist before are added
// Colums that are not defined but did exist remain untouched
const table = db.table<Person>('person', {
  name: 'text',
  age: 'integer',
})

// Create index, if not existed before
table.index('name') 

// Insert 
table.insert({
  name: 'Doe',
  age: 49,
})

// Get all rows
let allRows = table.all() 

// Get one row
let doe = table.get(1)

// Directly do all you like do with BetterSQLite3
const betterSQLiteDatabase = db.db
```
