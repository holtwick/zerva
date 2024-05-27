import type { SqliteTableDefault } from '@zerva/sqlite'

/** Person details and sensor provider login */
export interface HealthPerson extends SqliteTableDefault {
  title: string
  service: string
  monitor: boolean
  uid: string
  username: string
  password: string
  location: string
  limitVeryHigh: number
  limitHigh: number
  limitLow: number
  limitVeryLow: number
}

/** The CGM values over time */
export interface HealthPoint extends SqliteTableDefault {
  ts: number
  value: number
  trend: number
  personId: number
}

/** Events like meals over time */
export interface HealthEvent extends SqliteTableDefault {
  ts: number
  text: string
  personId: number
}
