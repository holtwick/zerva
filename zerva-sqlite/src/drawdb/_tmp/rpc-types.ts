import type { HealthEvent, HealthPerson, HealthPoint, HealthPointHour } from './types'

/** Person details and sensor provider login */
export interface RpcHealthPerson {
  getPerson: (id: number) => HealthPerson | undefined
  getPersonList: () => HealthPerson[]
  addPerson: (item: Partial<Omit<HealthPerson, 'id' | 'created' | 'updated'>>) => void
  updatePerson: (item: Partial<HealthPerson> & { id: number }) => void
  removePerson: (id: number) => void
}

/** The CGM values over time */
export interface RpcHealthPoint {
  getPoint: (id: number) => HealthPoint | undefined
  getPointList: () => HealthPoint[]
  addPoint: (item: Partial<Omit<HealthPoint, 'id' | 'created' | 'updated'>>) => void
  updatePoint: (item: Partial<HealthPoint> & { id: number }) => void
  removePoint: (id: number) => void
}

/** Events like meals over time */
export interface RpcHealthEvent {
  getEvent: (id: number) => HealthEvent | undefined
  getEventList: () => HealthEvent[]
  addEvent: (item: Partial<Omit<HealthEvent, 'id' | 'created' | 'updated'>>) => void
  updateEvent: (item: Partial<HealthEvent> & { id: number }) => void
  removeEvent: (id: number) => void
}

export interface RpcHealthPointHour {
  getPointHour: (id: number) => HealthPointHour | undefined
  getPointHourList: () => HealthPointHour[]
  addPointHour: (item: Partial<Omit<HealthPointHour, 'id' | 'created' | 'updated'>>) => void
  updatePointHour: (item: Partial<HealthPointHour> & { id: number }) => void
  removePointHour: (id: number) => void
}

export type RpcHealth = RpcHealthEvent | RpcHealthPerson | RpcHealthPoint | RpcHealthPointHour
