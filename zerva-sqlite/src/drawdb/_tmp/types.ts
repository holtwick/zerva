import type { SqliteTableDefault } from '@zerva/sqlite'

export interface TablePersons extends SqliteTableDefault {
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

export interface TablePoints extends SqliteTableDefault {
  ts: number
  value: number
  trend: number
  personId: number
}

export interface TableEvents extends SqliteTableDefault {
  ts: number
  text: string
  personId: number
}
