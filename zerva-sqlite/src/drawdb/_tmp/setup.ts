import type { UseSqliteDatabase, UseSqliteTable } from '@zerva/sqlite'
import type { TableEvents, TablePersons, TablePoints } from './types'

// Generated at 2024-05-24T14:44:57.613Z

export function createTables(db: UseSqliteDatabase): {
  persons: UseSqliteTable<TablePersons>
  points: UseSqliteTable<TablePoints>
  events: UseSqliteTable<TableEvents>
} {
  const persons = db.table<TablePersons>('persons', {
    title: 'text',
    service: 'text',
    monitor: 'integer',
    uid: 'text',
    username: 'text',
    password: 'text',
    location: 'text',
    limitVeryHigh: 'real',
    limitHigh: 'real',
    limitLow: 'real',
    limitVeryLow: 'real',
  })

  const points = db.table<TablePoints>('points', {
    ts: 'integer',
    value: 'integer',
    trend: 'integer',
    personId: 'integer',
  })

  points.indexUnique(['ts', 'personId'])

  const events = db.table<TableEvents>('events', {
    ts: 'integer',
    text: 'text',
    personId: 'integer',
  })

  events.indexUnique(['ts', 'personId'])

  return {
    persons,
    points,
    events,
  }
}
