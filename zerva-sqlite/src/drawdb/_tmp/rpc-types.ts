import type { HealthEvent, HealthPerson, HealthPoint } from './types'

/** Person details and sensor provider login */
export interface RpcHealthPerson {
  getPerson: (id: number) => HealthPerson | undefined
  getPersonList: () => HealthPerson[]
  addPerson: (item: Omit<HealthPerson, 'id' | 'created' | 'updated'>) => Promise<void>
  updatePerson: (item: Partial<HealthPerson> & {id: number}) => Promise<void>
  removePerson: (id: number) => Promise<undefined>
}

/** The CGM values over time */
export interface RpcHealthPoint {
  getPoint: (id: number) => HealthPoint | undefined
  getPointList: () => HealthPoint[]
  addPoint: (item: Omit<HealthPoint, 'id' | 'created' | 'updated'>) => Promise<void>
  updatePoint: (item: Partial<HealthPoint> & {id: number}) => Promise<void>
  removePoint: (id: number) => Promise<undefined>
}

/** Events like meals over time */
export interface RpcHealthEvent {
  getEvent: (id: number) => HealthEvent | undefined
  getEventList: () => HealthEvent[]
  addEvent: (item: Omit<HealthEvent, 'id' | 'created' | 'updated'>) => Promise<void>
  updateEvent: (item: Partial<HealthEvent> & {id: number}) => Promise<void>
  removeEvent: (id: number) => Promise<undefined>
}

export type RpcHealth = RpcHealthEvent | RpcHealthPerson | RpcHealthPoint
