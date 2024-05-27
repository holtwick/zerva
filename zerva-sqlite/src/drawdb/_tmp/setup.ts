import type { UseSqliteDatabase, UseSqliteTable } from '@zerva/sqlite'
import type { HealthEvent, HealthPerson, HealthPoint } from './types'

export function createTables(db: UseSqliteDatabase): {
  person: UseSqliteTable<HealthPerson>
  point: UseSqliteTable<HealthPoint>
  event: UseSqliteTable<HealthEvent>
} {
  /** Person details and sensor provider login */
  const person = db.table<HealthPerson>('person', {
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

  /** The CGM values over time */
  const point = db.table<HealthPoint>('point', {
    ts: 'integer',
    value: 'integer',
    trend: 'integer',
    personId: 'integer',
  })

  point.indexUnique(['ts', 'personId'])

  /** Events like meals over time */
  const event = db.table<HealthEvent>('event', {
    ts: 'integer',
    text: 'text',
    personId: 'integer',
  })

  event.indexUnique(['ts', 'personId'])

  return {
    person,
    point,
    event,
  }
}
